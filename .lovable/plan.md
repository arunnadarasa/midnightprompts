## Goal

Remove the tDUST screenshot walkthrough from `/proof-server` step 03 entirely and instead direct users to `/wallet`, which already has the full 6-step Lace walkthrough.

## Changes

**`src/routes/proof-server.tsx`**

1. Remove all six `tdust01`–`tdust06` imports (currently unused after step 03 is trimmed).
2. Remove the `TDUST_WALKTHROUGH` array.
3. In step 03, delete the "visual walkthrough · lace" block (the 3-image grid and its "Screenshots: Midnight Docs" footnote).
4. Keep the existing side-by-side link cards (Faucet ↗ / Install Lace →) and tighten the "Install Lace" card copy to make it clear the full Lace + tDUST walkthrough lives there — e.g. change the sub-label from "Browser extension + tDUST guide" to "Full setup + tDUST walkthrough →".
5. Add a short inline note under those cards: "Step-by-step Lace screenshots for funding tDUST live on the Wallet page." with a `<Link to="/wallet">` to it.

## Cleanup

- The old `lace-tdust-empty` / `lace-tdust-generate` / `lace-tdust-refilling` asset pointers are no longer referenced anywhere in the project after this change. Leave the `.asset.json` pointer files in place (they're safe unused pointers); do not run `lovable-assets delete` unless the user asks — deletion is irreversible and would also break any previous deployments referencing those URLs.

## Non-goals

- No changes to the wallet page.
- No changes to other proof-server steps.
