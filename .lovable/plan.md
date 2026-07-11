Add a second showcase item that surfaces the existing `scripts/dust-demo-preprod.mjs` local demo.

## What to build

1. **New card on `/showcase`** alongside the existing Midnight Ledger card.
   - Tag row: `PREPROD ONLY · WALLET SDK`
   - Title: `Programmatic DUST`
   - Description: explains the script is the docs' end-to-end flow — create a wallet, print all three addresses, wait for tNIGHT, then explicitly register NIGHT UTXOs for DUST generation.
   - No "LIVE ↗" link (it's a local script, not a browser demo). Use a right-hand label like `DOCS ↗` that links to the new detail page.

2. **New route `/showcase/programmatic-dust`** (file: `src/routes/showcase.programmatic-dust.tsx`).
   - Follow the same shell layout as `/showcase/midnight-ledger`: eyebrow, large title, explanatory paragraph, and content blocks.
   - Head metadata: unique title/description for the page.
   - Content blocks:
     - One-liner command box: `bun scripts/dust-demo-preprod.mjs`
     - What the script does (numbered list matching the script's comments)
     - Gotchas / prerequisites (preprod faucet, local proof server on port 6300, Bun runtime)
     - External links: Midnight docs guide, preprod faucet, `/proof-server` for full context
   - Keep it read-only; no wallet connection needed.

3. **No new dependencies** — reuse existing components and styling tokens.

## Implementation notes

- Use the same `Link`/`createFileRoute` imports and card styling already in `src/routes/showcase.index.tsx`.
- Make sure the new route file exists before the `<Link to="/showcase/programmatic-dust">` is added to avoid TanStack Router type errors.
- Add a `head()` block to the new route with unique title/description.

## Files touched

- `src/routes/showcase.index.tsx` — add the new card.
- `src/routes/showcase.programmatic-dust.tsx` — create the detail page.