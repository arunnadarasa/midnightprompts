## Goal

Make the site showcase **both Midnight Preview and Preprod** side-by-side: dual deploy status panels + a network toggle that swaps faucet / explorer / indexer / address-prefix everywhere it's shown.

## Data model

Split the single `src/data/midnight-contract.json` into a per-network pair and add a shared shape:

```
src/data/
  midnight-contract.preview.json   ← current file, renamed
  midnight-contract.preprod.json   ← new, same shape, preprod URLs + prefix
  midnight-contract.ts             ← exports { preview, preprod } + NetworkId type
```

`preprod` seed values:
- `network`: "Midnight Preprod Testnet"
- `networkId`: "preprod"
- `explorer`: `https://preprod.midnightexplorer.com`
- `indexerHttp`: `https://indexer.preprod.midnight.network/api/v4/graphql`
- `indexerWs`: `wss://indexer.preprod.midnight.network/api/v4/graphql/ws`
- `faucet`: `https://midnight-tmnight-preprod.nethermind.dev/`
- `address`: all-zero placeholder, `deployTx`: null (hydrates once deployed)

Every consumer imports from `midnight-contract.ts` instead of the JSON file, so a rename can't break routes.

## Deploy script

`scripts/deploy-midnight.mjs` already reads `VITE_NETWORK_ID`. Two changes:
1. Write output to `midnight-contract.<networkId>.json` (chosen by env var) instead of the single file.
2. README + script header: document `VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs` alongside the preview command.

## UI: shared NetworkToggle

New `src/components/NetworkToggle.tsx` — a tiny two-button pill (`preview` / `preprod`) matching the existing `text-[10px] tracking-[0.28em]` style used on `/proof-server`. State is lifted per-page via a `useNetwork()` hook backed by `useState` (default `preprod`, matching the skill's "closer to mainnet" guidance). No global store; each page owns its own toggle instance.

## /proof-server page

- Add `<NetworkToggle>` at the top of the setup section.
- Values that already vary by network become derived from the active `cfg`:
  - Faucet URL + label in Step 03
  - Explorer link references in Step 05
  - Address prefix example (`mn_shield-addr_test1…` vs `mn_shield-addr_preprod1…`) in the deploy walkthrough
  - `VITE_NETWORK_ID` in the env-var block (also shows the matching indexer URLs)
- Docker / macOS-Windows toggle stays untouched.
- Status panel at the bottom becomes **two side-by-side panels** (see next section).

## Dual deploy panels (shared component)

New `src/components/DeployStatusPanel.tsx` renders one card: network label, address (or "Not yet deployed"), deploy tx, explorer links, faucet link. Handles the all-zero placeholder case with the skill's "run `bun scripts/deploy-midnight.mjs`" hint including the `VITE_NETWORK_ID` variant.

Used on:
- **Home (`/`)**: new compact "Live on Midnight" row rendering both panels stacked on mobile / side-by-side on md+. Replaces the current single-line "Live on Midnight preview" copy near the hero — same visual weight, now two badges.
- **`/proof-server`**: the two panels replace the current status/CTA block.
- **`/showcase` and `/showcase/midnight-ledger`**: existing single-network status is replaced with the same dual panel + a `<NetworkToggle>` that also switches the Indexer read (each page currently reads state via the indexer URL from cfg — we just point at the active network's cfg).

## Copy adjustments

The strings currently hardcoding "preview" get generalized ("Live on Midnight preview." → "Live on Midnight preview + preprod.") in:
- `src/routes/index.tsx` hero + step 3 microcopy
- `showcase.index.tsx` intro
- `showcase.midnight-ledger.tsx` eyebrow, og:title, and the "Awaiting first deploy" hint (parameterized by active cfg)

Nothing else changes — no route additions, no new dependencies.

## Files touched

- add: `src/data/midnight-contract.preprod.json`, `src/data/midnight-contract.ts`, `src/components/NetworkToggle.tsx`, `src/components/DeployStatusPanel.tsx`
- rename: `src/data/midnight-contract.json` → `src/data/midnight-contract.preview.json`
- edit: `src/routes/index.tsx`, `src/routes/proof-server.tsx`, `src/routes/showcase.index.tsx`, `src/routes/showcase.midnight-ledger.tsx`, `scripts/deploy-midnight.mjs`, `scripts/deploy-midnight.README.md`, `README.md` (mention dual-network deploy)

## Out of scope

- Actually running a preprod deploy (user does that locally with `VITE_NETWORK_ID=preprod`); until then the preprod panel shows the "Not yet deployed" state, exactly like the preview panel does today.
- Persisting the toggle across pages / URL param — kept intentionally simple, can be added later if requested.
