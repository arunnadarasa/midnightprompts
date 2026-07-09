# Deploy TimestampLog to Midnight Preview from the Lovable sandbox

Goal: sign the deploy with a fresh Midnight wallet generated inside the Lovable sandbox, print its shielded address so you can fund it once at the preprod faucet, then run a headless deploy, write the printed hex address into `src/data/midnight-contract.json`, and verify by round-tripping the ledger state through the Indexer.

## The address you'll fund

A brand-new 24-word mnemonic is generated on first run of the deploy script. From it the script derives the **Midnight shielded address** (`mn_shield-…preview1…`). That address is the only thing that needs tDUST — paste it into https://cloud.google.com/application/web3/faucet/midnight/testnet (drips ~1000 tDUST in ~30s). Deploy needs roughly 1 tDUST.

There is no separate Ethereum-style "deployer EOA" — the same shielded address is both the funder and the contract's initial owner witness.

## Two-phase run

Phase 1 (no tDUST yet):
```
bun scripts/deploy-midnight.mjs
→ prints mnemonic (once) + shielded address
→ stores mnemonic as MIDNIGHT_WALLET_SEED
→ exits with "Fund this address, then re-run"
```

Phase 2 (after faucet drip lands, ~30s later):
```
bun scripts/deploy-midnight.mjs
→ reads MIDNIGHT_WALLET_SEED, syncs wallet against Indexer, checks balance
→ boots midnight-proof-server binary on :6300 in the sandbox
→ deployContract(TimestampLog, { witnesses: { localSecretKey } })
→ writes hex address + deploy tx to src/data/midnight-contract.json
→ verifies by GraphQL: contractAction(address){state} decodes with ledger()
```

## Files I'll add / edit

1. `scripts/deploy-midnight.mjs` — the two-phase script above. Uses:
   - `@midnight-ntwrk/wallet` + `@midnight-ntwrk/wallet-sdk-hd@4.1.1` for seed → shielded address
   - `@midnight-ntwrk/midnight-js-contracts@4.1.1` for `deployContract`
   - `@midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1` pointing at `http://localhost:6300`
   - `@midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1` for Indexer read/subscribe
   - Loads compiled artifacts from `contracts/managed/timestamp-log/` (already committed)
2. `scripts/install-midnight-toolchain.sh` — one-time setup that (a) `curl`s the Rust `midnight-proof-server` binary release (no Docker required), (b) `bun add`s the SDK packages above. Idempotent; safe to re-run.
3. `contracts/managed/timestamp-log/contract/index.cjs` — required for `deployContract` to load the runtime witness table. Emit alongside the existing `index.js` via `compact compile` if missing.
4. `.gitignore` — add `.midnight-wallet-state/` (local wallet sync cache) so it doesn't get committed.
5. `src/data/midnight-contract.json` — the script overwrites `address`, `deployTx`, `deployedAt`, `network: "preview"` on success. Showcase page already hydrates from this file.
6. `src/routes/showcase.midnight-ledger.tsx` — replace the "Awaiting first deploy" copy with a "Deployed at {timestamp} · {txLink}" panel once the JSON is populated (branch on `address !== 0x00…`).
7. `.agents/skills/lovable-midnight/SKILL.md` — append a "Sandbox headless deploy" section documenting the two-phase flow, the proof-server binary path, and the `MIDNIGHT_WALLET_SEED` secret. Apply the draft after.

## Secrets

- `MIDNIGHT_WALLET_SEED` — set by phase-1 of the script via `set_secret` (24-word mnemonic, generated inside the sandbox). You never paste it.
- Existing `VITE_NETWORK_ID`, `VITE_INDEXER_URL`, `VITE_INDEXER_WS_URL`, `VITE_PROOF_SERVER_URL`, `VITE_DEFAULT_CONTRACT` stay unchanged.

## Verification step (what "verify" means on Midnight)

Midnight has no Etherscan-style source-code verifier. The two checks the script runs after deploy:

1. `POST` to `VITE_INDEXER_URL` with `query{ contractAction(address:$a){ state } }` and confirm `state` is non-null.
2. Decode `state` with `contracts/managed/timestamp-log/contract/index.cjs`'s `ledger()` helper and assert `entry_count === 1n` (the constructor increment).

If both pass, the script writes `verified: true` to `midnight-contract.json` and prints the MidnightScan URL for a manual sanity check.

## Failure modes I'll pre-empt in the script

- Proof-server binary missing on PATH → `install-midnight-toolchain.sh` downloads it; retry with clear error.
- Wallet balance < 1 tDUST → hard-exit with "Fund {address} at the preprod faucet, then re-run" (no partial state written).
- Indexer sync lag → poll `contractAction` up to 90s before declaring verification failure.
- Proof generation timeout (>180s) → surface the raw error; do not silently retry (proofs are non-deterministic in timing, not correctness).

## What I will NOT do

- No Docker (unavailable in sandbox).
- No Lace / browser interaction.
- No re-compile of Compact this turn (existing keys/zkir match `TimestampLog.compact`).
- No writes to Ethereum/Monad plumbing — this is Midnight-only.

## After you approve

Order of operations once we switch to build mode:

1. Write files 1–4 and toolchain script.
2. Run `scripts/install-midnight-toolchain.sh` (installs SDK + proof-server binary).
3. Run phase 1: prints the address to fund. I'll paste it back to you in chat with the faucet link.
4. **You** hit the faucet with that address, wait ~30s.
5. Tell me "funded" — I run phase 2, capture the printed hex address, and update the showcase page + JSON.
6. Apply the updated `lovable-midnight` skill draft.
