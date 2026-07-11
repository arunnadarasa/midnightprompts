## Goal

Update `/proof-server` step 03 to use the newer, higher-quality Lace tDUST screenshots that already power `/wallet`, replacing the older 3-image set.

## Changes

**`src/routes/proof-server.tsx`**

1. Replace the three old imports:
   - `lace-tdust-empty.png.asset.json`
   - `lace-tdust-generate.png.asset.json`
   - `lace-tdust-refilling.png.asset.json`

   with the six-step series used on the wallet page:
   - `lace-tdust-01-empty` — 01 · tank empty
   - `lace-tdust-02-generate` — 02 · generate tDUST
   - `lace-tdust-03-review` — 03 · review & confirm
   - `lace-tdust-04-password` — 04 · password
   - `lace-tdust-05-processing` — 05 · processing (ZK proof)
   - `lace-tdust-06-refilling` — 06 · tank refilling

2. Rework the "visual walkthrough · lace" grid inside step 03 from a fixed 3-column layout to a responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` grid so six frames flow cleanly, with short captions consistent in tone with the existing page (mirroring the wallet page's language but tightened for this context).

3. Keep the existing "Screenshots: Midnight Docs — Acquire tokens ↗" footnote and the surrounding faucet / wallet link cards untouched.

## Non-goals

- No changes to the deploy status panels, other steps, or the wallet page.
- No new assets — reusing the already-committed `lace-tdust-0{1..6}-*.png.asset.json` files.
- No copy changes outside step 03's walkthrough captions.
