## Task 1: Hide Mainnet prompt variants (revert to 9,000)

Per Midnight Dev Rel: mainnet publishing is blacklisted for independent devs right now, so remove the mainnet option from the UI to avoid misleading hackathon participants. Keep the code paths so we can re-enable in ~2 months.

- `src/routes/llms.tsx`: remove the Mainnet tab from the network `TabsList`, drop the `mainnet` entry from the `PROMPTS` map and its 3 asset imports, remove the red mainnet risk banner paragraph. Update the intro copy: "4 networks × 3 host OSes, including an experimental Mainnet variant" → "3 networks × 3 host OSes"; adjust the ideaCount/variantCount sentence to say 9 variants per idea. Leave the mainnet `.asset.json` files and generator code on disk.
- `src/routes/ideas.$id.tsx`: remove Mainnet from the network selector tabs so per-idea prompt pages only show Preview / Preproduction / Undeployed.
- `src/lib/mega-prompt-variants.ts`: no functional change needed — `buildVariant` still supports mainnet for when we re-enable. (If there's a hardcoded network list feeding the UI, prune mainnet there too.)
- Do NOT regenerate bundles or delete `llms-prompts-mainnet-*` assets; hiding at the UI layer is enough and preserves easy re-enable.

## Task 2: Add sync-issue solutions to relevant pages

Dev Rel's two approaches from the Discord screenshot:

1. **Serialize wallet state after first sync** and restore on next run so only the delta syncs.
2. **Pass `NoOpTransactionHistoryStorage`** in wallet config to cut memory during sync — only if the script never queries history.

Add a new "Wallet sync stalls / memory blowups" section to:

- `src/routes/known-issues.tsx` — a new card with both remedies, a short code sketch for `NoOpTransactionHistoryStorage` in `WalletBuilder` config, and the "serialize → restore" pattern. Credit "Midnight Dev Rel (Jay Albert)".
- `src/routes/wallet.tsx` — a short callout at the bottom of the wallet setup content pointing to the same two techniques, with a link to the Known Issues entry.

No changes to mega-prompts for this task (would trigger a bundle rebuild); can be added in a follow-up if desired.

## Files touched

- `src/routes/llms.tsx` (mainnet UI hide)
- `src/routes/ideas.$id.tsx` (mainnet tab hide)
- `src/routes/known-issues.tsx` (new sync-issues card)
- `src/routes/wallet.tsx` (sync callout + link)
