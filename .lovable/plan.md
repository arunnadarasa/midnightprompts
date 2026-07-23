# Add Mainnet variant + experimental-dapp safety banner

Extend the mega-prompt matrix from 3 networks × 3 OS = 9 variants to **4 × 3 = 12 variants** per idea (~1,000 ideas → ~12,000 total; ~3,000 new Mainnet prompts). Add a mandatory in-dapp safety banner across all networks.

## 1. `src/lib/mega-prompt-variants.ts`

- Add `"mainnet"` to the `Network` union and to network branching (`NETWORK_BLOCK`, `SIGNING_STRATEGY`, endpoints, `NetworkId`).
- New `MAINNET_BLOCK`:
  - `VITE_NETWORK_ID=mainnet`, mainnet indexer/proof-server/node RPC (from `midnight-matrix.ts`).
  - Address prefixes `mn_addr1…` / `mn_shield-addr1…` (no suffix).
  - Signing: Lace on Mainnet only — no server-side genesis wallet exists.
  - **Acquiring NIGHT**: NIGHT is a real asset. Direct users to the official exchange partners page: https://midnight.network/night?tag=exchange. Never ask the user to paste a seed. Fund the Lace unshielded address from an exchange withdrawal, then delegate NIGHT → DUST inside Lace to pay fees.
  - Pin mainnet node/proof-server/indexer tags from `MIDNIGHT_MATRIX.node.mainnet` etc.
- New `EXPERIMENTAL_DAPP_DISCLAIMER` block (injected on ALL 4 networks, prominent on Mainnet):
  - README section: "⚠️ Experimental / vibe-coded — not audited. Hackathon artefact. Do not deposit funds you cannot afford to lose. Contract logic, key handling, and UI have not been reviewed. Use only as a bragging-right proof-of-deploy."
  - Mandatory persistent in-app **top banner component** (`src/components/ExperimentalBanner.tsx`) mounted in `__root.tsx`, text varies by `VITE_NETWORK_ID`:
    - Mainnet: red "MAINNET · vibe-coded experiment — funds at risk, no audit".
    - Preview/Preprod: amber "Testnet · experimental hackathon build".
    - Undeployed: neutral "Local dev chain · not real value".
  - Non-dismissible on Mainnet; dismissible-per-session on others.
- Extend `REDFLAGS`:
  - Do NOT ship Mainnet without the red banner and README disclaimer.
  - Do NOT prompt users for NIGHT recovery phrases; only send from an exchange to the Lace unshielded address.
  - No server-side signing on Mainnet (no genesis seed exists).

## 2. `src/routes/ideas.$id.tsx`

- Add a 4th tab **"Mainnet"** to the network selector next to Preview / Preprod / Undeployed (2-column grid on mobile, 4-across on desktop).
- Copy label: "Mainnet · real NIGHT · experimental".
- Show a small inline warning under the tab row when Mainnet is selected, linking to https://midnight.network/night?tag=exchange.

## 3. `scripts/build-llms-full.mjs`

- Add `"mainnet"` to the `NETWORKS` array and `NET_LABEL`.
- Emits 3 new bundles: `llms-prompts-mainnet-{macos,windows,linux}.txt`.
- `fullDoc()` now iterates 4 networks → total variants = ideas × 12.
- Update meta JSON `variantCount`.

## 4. `src/routes/llms.tsx`

- Add the three new Mainnet download cards alongside existing per-combo downloads.
- Add a short "Mainnet variants — read this first" note pointing to the disclaimer + exchange link.

## 5. Reference pages (light touch, keep UI edits minimal)

- `src/routes/quantum-primer.tsx`: Mainnet column already exists in the comparison table; add one line "Acquire NIGHT via an official exchange partner → midnight.network/night?tag=exchange" and note the hackathon guidance ("only after Undeployed → Preprod dry runs").
- `src/routes/llms.tsx` skill card: bump variant count copy from 9 to 12.

## Not in scope

- No new showcase demo on Mainnet — too risky for a hackathon site.
- No changes to deploy scripts targeting Mainnet (still local `bun` script; users configure `VITE_NETWORK_ID=mainnet` themselves).
- No changes to Preview/Preprod/Undeployed prompt content beyond the shared disclaimer/banner block.

## Technical notes

- Total generated files after this change: `llms-core.txt` + 12 per-combo bundles + `llms-full.txt` + meta = 15 assets. All externalized via `lovable-assets` as today.
- Banner mounts in `__root.tsx` above `<Outlet />`; reads `import.meta.env.VITE_NETWORK_ID` client-side to pick variant — no SSR concerns.
