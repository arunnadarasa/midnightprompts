# Local deploy — TimestampLog.compact → Midnight Preview or Preprod

The Lovable sandbox **cannot** run the deploy: Midnight's proof server is only
distributed as a Docker image (`midnightntwrk/proof-server`), and the sandbox
has no Docker daemon. This is a hard constraint of the current Midnight release
train — the docs list only network endpoints (RPC, Indexer, faucet, explorer)
and no hosted proving service. See <https://docs.midnight.network/relnotes/network>.

Run this deploy from your own machine. The script is two-phase; you'll run it
twice with a faucet visit in between.

The same script targets **either testnet** — pick with `VITE_NETWORK_ID`:

```bash
# preview (default) — writes src/data/midnight-contract.preview.json
bun scripts/deploy-midnight.mjs

# preprod (stable, closer to mainnet) — writes src/data/midnight-contract.preprod.json
VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs
```

Faucet, explorer, and indexer URLs are chosen automatically from the network
id. Deploy on both to light up both status panels on the site.


## One-time setup

```bash
# 1. Install bun (if you don't already have it)
curl -fsSL https://bun.sh/install | bash

# 2. Install the Midnight SDK deps into this project
bun add \
  @midnight-ntwrk/testkit-js@4.1.1 \
  @midnight-ntwrk/wallet-sdk@1.1.0 \
  @midnight-ntwrk/wallet-sdk-address-format@1.0.0 \
  @midnight-ntwrk/ledger-v8@8.1.0 \
  @midnight-ntwrk/wallet-sdk-hd@3.1.0-beta.1 \
  @midnight-ntwrk/midnight-js-contracts@4.1.1 \
  @midnight-ntwrk/midnight-js-network-id@4.1.1 \
  @midnight-ntwrk/midnight-js-node-zk-config-provider@4.1.1 \
  @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1 \
  @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1 \
  bip39

# 3. (Optional) Recompile the contract if you edited TimestampLog.compact.
#    Otherwise the pre-compiled artifacts in contracts/managed/timestamp-log/ are used.
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc && compact update
compact compile contracts/TimestampLog.compact contracts/managed/timestamp-log
```

## Seed derivation matches Lace

The script derives keys via `WalletSeeds.fromMnemonic` (from
`@midnight-ntwrk/testkit-js` + `wallet-sdk-hd`) — the same HD path Lace uses.
The same 12/24 words in `.midnight-wallet.local` and in Lace produce the same
shielded + unshielded addresses.

Never paste your recovery words into chat, screenshots, browser forms, or issue
trackers. Keep them on your machine only.

> **Upgrading from an older script?** Earlier versions fed the raw BIP-39 seed
> straight into `WalletBuilder`, which produced a *different* private key from
> the same mnemonic. If you ran the old script, your Lace-funded tDUST was
> invisible to it. Just re-run — the new script derives the Lace-matching
> address automatically and will see the balance.

Verify safely on your own machine before funding or deploying:

```bash
MIDNIGHT_WALLET_SEED="your words stay local" \
  bun scripts/check-midnight-wallet.mjs --network=preview

# or, if .midnight-wallet.local already contains the phrase:
bun scripts/check-midnight-wallet.mjs --network=preview
```

The printed shielded + unshielded addresses must match Lace exactly. For Preview,
both addresses should start with `mn_addr_preview1…` and
`mn_shield-addr_preview1…`. If you see `mn_addr_test1…` or
`mn_shield-addr_test1…`, do not fund or deploy yet.

You can also run the deploy script with the phrase held only in your current
terminal session:

```bash
MIDNIGHT_WALLET_SEED="your words stay local" VITE_NETWORK_ID=preview \
  bun scripts/deploy-midnight.mjs
```

That mode does not write the phrase to `.midnight-wallet.local`.

## Phase 1 — fund the wallet with tNIGHT, then delegate to tDUST

The deploy spends **tDUST**. The preview/preprod faucets only dispense **tNIGHT**, and
per <https://docs.midnight.network/guides/acquire-tokens> it only accepts the
**unshielded** address (`mn_addr_preview1…` / `mn_addr_preprod1…`). Two important quirks:

1. The wallet exposes both shielded and unshielded addresses. Pasting the
   shielded address (`mn_shield-addr_preview1…` / `mn_shield-addr_preprod1…`) into the faucet produces
   "Provided address is invalid".
2. Turning tNIGHT into tDUST (delegation) is a Lace-only UI action — there
   is no public SDK method for it in the current release train.

So Phase 1 is done in **Lace**, not this script:

1. Install the Lace browser extension and switch it to **Midnight Preview** or **Midnight Preprod**.
2. Either create a fresh wallet in Lace, or import the 12/24-word mnemonic
   from `.midnight-wallet.local` (or the `MIDNIGHT_WALLET_SEED` secret)
   so it shares the same seed as this script.
3. Copy Lace's **Unshielded** address (starts with `mn_addr_preview1…` or `mn_addr_preprod1…`).
4. Paste it into the matching faucet and
   click **Request tokens** — 1000 tNIGHT arrives in ~2 minutes.
5. In Lace, click **Generate tDUST** to delegate tNIGHT → tDUST. Wait
   until the tDUST tank shows a non-zero balance.

Or derive both addresses offline from `MIDNIGHT_WALLET_SEED` without
touching Lace:

```bash
# preprod (default)
bun scripts/derive-unshielded-address.mjs
# preview testnet
bun scripts/derive-unshielded-address.mjs --network=preview --out=src/data/midnight-wallet-preview.json
```

Then run the script to sanity-check that the same seed sees the tDUST
balance from the SDK side:

```bash
bun scripts/deploy-midnight.mjs
```

If it prints `current tDUST balance: 0`, wait another minute for the
delegation to settle and re-run. The mnemonic is stored in
`.midnight-wallet.local` (mode 0600, gitignored) so re-runs reuse the same
wallet.


## Phase 2 — start the proof server and deploy

```bash
# 1. Boot the proof server (in a separate terminal or as a daemon)
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest \
  midnight-proof-server -v

# 2. Re-run the deploy script
bun scripts/deploy-midnight.mjs
```

The script will:

1. Reload the mnemonic from `.midnight-wallet.local`.
2. Sync your wallet against the Preprod Indexer and confirm tDUST balance ≥ 1.
3. Load the compiled ZK keys + zkir from `contracts/managed/timestamp-log/`.
4. Call `deployContract(providers, { compiledContract: TimestampLog })`. This
   step generates the ZK proof against your local proof server — expect
   **30–120 seconds** for a `k=14` circuit.
5. On success, write `address`, `deployTx`, `deployedAt`, and `verified` into
   `src/data/midnight-contract.json`.
6. Poll the Indexer for up to 90s and confirm `contractAction(address).state`
   is non-null before setting `verified: true`.
7. Print the MidnightScan preprod explorer URL.

Push the updated `src/data/midnight-contract.json` — the showcase page at
`/showcase/midnight-ledger` will now hydrate from the deployed contract on
every refresh.

## Verification on Midnight

Midnight has **no Etherscan-style source verifier**. The two things that
constitute "verification" here:

- The ZK verifier keys (`contracts/managed/timestamp-log/keys/*.verifier`)
  are baked into the on-chain contract state at deploy time. The network
  refuses to accept any tx that doesn't produce a proof under those exact
  keys — i.e. verification is enforced by the network itself, not a separate
  step.
- Off-chain, the script confirms `contractAction(address).state` decodes
  under the compiled ledger schema. That's the closest equivalent to a
  block-explorer "verified source" badge.

## Failure modes

| Symptom | Fix |
| --- | --- |
| `Proof server not reachable at http://localhost:6300` | Start the Docker container (see Phase 2). |
| Balance stays at 0 after faucet | Wait 60s and re-run. Some drips take a bit; check the faucet page for a hash. |
| `deployContract` throws with "no zk keys for circuit …" | `compact compile` did not run, or `contracts/managed/timestamp-log/` is missing. Re-run compile. |
| Proving hangs past 3 minutes | Kill the script; check `docker logs <proof-server>`. First-time proofs can be slow while the container warms; retry once. |
| `Cannot find module @midnight-ntwrk/...` | Run the `bun add` step from "One-time setup". |

## Files created

| File | Purpose | Committed? |
| --- | --- | --- |
| `.midnight-wallet.local` | 12/24-word mnemonic (0600) | **No** — gitignored |
| `.midnight-witness.local` | 32-byte private witness key (0600) | **No** — gitignored |
| `src/data/midnight-contract.json` | Deployed address + tx | **Yes** — this is what the showcase reads |
