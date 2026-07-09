# Local deploy — TimestampLog.compact → Midnight Preprod

The Lovable sandbox **cannot** run the deploy: Midnight's proof server is only
distributed as a Docker image (`midnightntwrk/proof-server`), and the sandbox
has no Docker daemon. This is a hard constraint of the current Midnight release
train — the docs list only network endpoints (RPC, Indexer, faucet, explorer)
and no hosted proving service. See <https://docs.midnight.network/relnotes/network>.

Run this deploy from your own machine. The script is two-phase; you'll run it
twice with a faucet visit in between.

## One-time setup

```bash
# 1. Install bun (if you don't already have it)
curl -fsSL https://bun.sh/install | bash

# 2. Install the Midnight SDK deps into this project
bun add \
  @midnight-ntwrk/wallet@4.0.0 \
  @midnight-ntwrk/wallet-sdk-hd@3.1.0-beta.1 \
  @midnight-ntwrk/midnight-js-contracts@4.1.1 \
  @midnight-ntwrk/midnight-js-network-id@4.1.1 \
  @midnight-ntwrk/midnight-js-fetch-zk-config-provider@4.1.1 \
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

## Phase 1 — get your funding address

```bash
bun scripts/deploy-midnight.mjs
```

Output looks like:

```
[midnight-deploy] generated new 24-word mnemonic → .midnight-wallet.local
  Shielded address (fund this one):
  mn_shield-…preprod1…
  Faucet: https://cloud.google.com/application/web3/faucet/midnight/testnet
```

- Copy the shielded address.
- Paste it into <https://cloud.google.com/application/web3/faucet/midnight/testnet> and request a drip
  (arrives in ~30s).
- The mnemonic is saved to `.midnight-wallet.local` (mode 0600, gitignored) so
  re-runs reuse the same address. Back it up if you want to fund the same
  wallet from another machine.

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
4. Call `deployContract(TimestampLog, { witnesses: { localSecretKey } })`. This
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
| `Cannot find module @midnight-ntwrk/wallet` | Run `bun add` step from "One-time setup". |

## Files created

| File | Purpose | Committed? |
| --- | --- | --- |
| `.midnight-wallet.local` | 24-word mnemonic (0600) | **No** — gitignored |
| `.midnight-witness.local` | 32-byte private witness key (0600) | **No** — gitignored |
| `src/data/midnight-contract.json` | Deployed address + tx | **Yes** — this is what the showcase reads |
