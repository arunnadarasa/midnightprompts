## Goal

Refresh the ~9,000 mega-prompt variants with the latest `lovable-midnight` skill learnings and — most importantly — bake the **Undeployed Lace funding** flow (proven in the "Tokenized Choreo Kits" project) directly into every prompt as a real shippable script, so hackathon participants don't lose hours re-discovering it.

## What changes

Single file: `src/lib/mega-prompt-variants.ts`. Then regenerate the 10 bundle files under `public/` via `bun scripts/build-llms-full.mjs` and re-upload the large ones as `lovable-assets`.

### 1. Rewrite the `UNDEPLOYED_FUND_LACE` block

Replace the current abstract three-option text with a concrete, working recipe pulled from the live-learning project. Every prompt gets:

- **Script to create — `scripts/fund-lace.sh`** (verbatim from the Tokenized Choreo Kits project): clones `midnightntwrk/midnight-local-dev` into `/tmp`, installs deps, launches its interactive CLI so the user picks menu option **2 → "Fund accounts by public key"**, pastes their Lace unshielded address (`mn_addr_undeployed1…`), and receives 50,000 tNIGHT. Then in Lace they tap **Generate tDUST** and wait one block.
- **Exact ordering rule**: if the standalone stack is already up on the same ports, run `docker compose down` in this project first (or reuse `midnight-local-dev`'s bring-up entirely) — that collision is the #1 silent failure.
- **Package.json wiring**: `"midnight:fund": "bash scripts/fund-lace.sh"` and mention it in `scripts/README.md`.
- **Verification loop**: `/undeployed-preflight` four green pills + Lace tDUST chip flips from "empty" to a live number.
- Keep Option A (headless deploy from genesis seed `…0002`) as the "no-Lace-needed" fast path, but make the fund-lace.sh flow the recommended path when the demo actually needs a user wallet.

### 2. Extend `SCRIPTS_FOLDER` for Undeployed

Add `scripts/fund-lace.sh` to the mandatory scripts list alongside `deploy-midnight.mjs`, `check-midnight-wallet.mjs`, `midnight-standalone.mjs`, and `scripts/README.md`. State that README.md MUST document `bun run midnight:fund` with the CLI-menu-option-2 walkthrough.

### 3. Update `inAppSetupPanel` Undeployed steps

Reorder so the funding step is unambiguous:

```
1. Install Docker (OS-specific line)
2. bun scripts/midnight-standalone.mjs up
3. Point Lace at ws://localhost:9944
4. bash scripts/fund-lace.sh   → menu option 2 → paste unshielded address
   → 50,000 tNIGHT arrives → tap "Generate tDUST" in Lace → wait one block
5. VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
6. Reload; verify at /undeployed-preflight
```

Persist dismissed state under `setup-dismissed-undeployed`. Copy is prescriptive, no TODO stubs.

### 4. Refresh remaining blocks against the current `lovable-midnight` SKILL.md

Small, surgical edits — do NOT churn everything:

- **`REDFLAGS`**: add "Do NOT accept the user's recovery phrase in chat — ship `scripts/check-midnight-wallet.mjs` reading `MIDNIGHT_WALLET_SEED` from shell env" (already partly there — tighten wording to match SKILL.md).
- **`MIDNIGHTJS_BOOT`**: keep the v4 `connect(networkId)` pattern; ensure the `NetworkId` mapping table (Preview→Undeployed, Preprod→TestNet, Mainnet→MainNet) is inline so the prompt stays self-contained without linking out.
- **`FRONTEND_STANDARDS`**: no structural change; verify §1 (semantic tokens) and §3 (async status pill) still match SKILL.md anti-patterns.
- **`WALLET_BOILERPLATE`**: no logic change; already uses `getShieldedAddresses` + `getUnshieldedAddress` fallback and network fallback loop.

### 5. Regenerate bundles

Run `bun scripts/build-llms-full.mjs` to rewrite:
- `public/llms-core.txt`
- `public/llms-full.txt` (mega bundle → externalize via lovable-assets)
- 9 × `public/llms-prompts-{preview|preprod|undeployed}-{macos|windows|linux}.txt` (undeployed variants get externalized)
- `public/llms-full.meta.json`

## Technical details

- Only `src/lib/mega-prompt-variants.ts` is edited by hand; the build script picks up changes automatically.
- The `fund-lace.sh` script is delivered as a **CREATE FILE** instruction inside the prompt text — the hackathon participant's Lovable session writes it to disk. We don't add it to this repo.
- Bundle sizes stay well within the 819 KB per-file Cloudflare Worker memory ceiling (dynamic render already used, no full-fat build in memory).
- No route, no UI, no schema changes.

## Non-goals

- No changes to `/undeployed`, `/wallet`, `/proof-server`, or `/llms` pages — they already reference these flows correctly.
- Not adding a bundled `fund-lace.sh` in this repo's `scripts/` folder (this project deploys to preview/preprod; the local-dev funder belongs in generated apps, not on the marketing site).