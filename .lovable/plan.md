## Goal

Add a **preprod-only** DUST generation + deploy demo alongside the existing preview flow, based on the official Midnight docs (`generating-dust-programmatically`, `configure-providers`, `deploy-mn-app`) and the reference script provided.

This is additive — the current `scripts/deploy-midnight.mjs` (preview) stays untouched.

## What we'll build

### 1. New script: `scripts/dust-demo-preprod.mjs`

An interactive DUST tutorial hardcoded to **preprod**:
- Create new wallet OR restore from seed (prompt-driven, like the reference).
- Print shielded / unshielded / dust addresses with `mn_shield-addr_test1…` / `mn_addr_test1…` / `mn_dust_test…` prefixes.
- Print the preprod faucet URL: `https://midnight-tmnight-preprod.nethermind.dev/`.
- Sync wallet, wait for incoming tNIGHT on the unshielded address.
- Prompt for a Dust address to designate (default = own dust address).
- Call `wallet.registerNightUtxosForDustGeneration(...)` — this is the piece the current preview script is missing and is exactly what the docs teach.
- Poll `state.dust.availableCoins.length >= 1` (the correct readiness signal) and print DUST balance until user quits.
- Persist seed to `.midnight-wallet-preprod.local` (0600, gitignored) so re-runs restore automatically.

Uses `@midnightntwrk/wallet-sdk` `WalletFacade` / `HDWallet` / `Roles` — same API surface as the docs snippet, not the older `WalletBuilder`.

### 2. New script: `scripts/deploy-midnight-preprod.mjs`

Preprod deploy, run **after** the dust demo has minted a spendable DUST coin:
- Reuses `.midnight-wallet-preprod.local` seed.
- Builds providers per `configure-providers` docs (preprod indexer + node URLs, local proof server).
- Deploys the compiled `PromptLog` contract per `deploy-mn-app` docs.
- Writes result to `src/data/midnight-contract-preprod.json` (separate from the existing preview JSON so both can coexist).
- Validates bech32 prefix is `mn_shield-addr_test1…` before writing (guards against network mismatch).

### 3. New data file: `src/data/midnight-contract-preprod.json`

Placeholder with zero-address, mirroring the preview one. Explorer base = `https://preprod.midnightexplorer.com`.

### 4. UI: extend `/proof-server` page

Add a **"Preprod demo (recommended for real users)"** section under the existing preview steps:
- Explains preprod is the stable network and needs the two-step flow (dust-demo → deploy) because tNIGHT must be explicitly registered for DUST generation.
- Command boxes for `bun scripts/dust-demo-preprod.mjs` and `bun scripts/deploy-midnight-preprod.mjs`.
- Link to preprod faucet + preprod explorer.
- Note that the existing preview flow (single `deploy-midnight.mjs`) remains for quick throwaway testing.

### 5. Wallet page: dual-network display

Update the wallet page to show both preview and preprod contract state side-by-side when both JSON files exist. Keep single-column when only one is deployed.

### 6. Dependencies

Add to `package.json` (via `bun add`):
- `@midnightntwrk/wallet-sdk` — new SDK the docs use (different from existing `@midnight-ntwrk/wallet`).
- `@midnight-ntwrk/midnight-js-utils`
- `@midnight-ntwrk/midnight-js-protocol`
- `ws`, `rxjs`, `readline` (readline is Node built-in but rxjs + ws are new).

### 7. `.gitignore`

Add `.midnight-wallet-preprod.local` and `.midnight-witness-preprod.local`.

## Technical notes

- **Two SDK namespaces coexist**: the reference script uses `@midnightntwrk/wallet-sdk` (no hyphen in `ntwrk`) — this is the newer SDK. The existing preview script uses `@midnight-ntwrk/wallet` (hyphenated). We keep both — the preview script keeps working, the preprod scripts use the newer one. Confirm the package name against npm before installing; if the un-hyphenated name isn't published, fall back to the hyphenated equivalents (`@midnight-ntwrk/wallet-sdk-*`).
- **DUST readiness**: poll `availableCoins.length >= 1`, not balance. Same lesson as the earlier preview debug.
- **Proof server**: same local Docker container on `:6300` serves both networks — no separate infrastructure.
- **No SSR impact**: all new code is Node scripts + static JSON + read-only UI reads. Nothing touches server functions or the router loader chain.

## Out of scope

- Fixing the preview `deploy-midnight.mjs` (already patched last turn).
- Automating the faucet request (still manual — user pastes address into the faucet page).
- Deploying from the browser (still a local `bun` script, per skill rules).

## Immediate next step after approval

Install deps → write both scripts + JSON placeholder → extend `/proof-server` page → update `.gitignore`.
