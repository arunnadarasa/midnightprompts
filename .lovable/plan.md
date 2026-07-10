## Goal

Add the three uploaded Lace-wallet screenshots (empty tDUST tank → Generate tDUST modal → refilling tank with 1,000 tNIGHT designated) to the site so users can visually follow the tNIGHT → tDUST conversion step. Credit Midnight Docs (https://docs.midnight.network/guides/acquire-tokens) as the source.

## Where they go

Inside **`src/routes/proof-server.tsx`**, at the end of **Step 03 — "Fund your wallet with tDUST"**. That step already explains the tNIGHT-vs-tDUST gotcha, so the visuals belong right there.

Not adding them to `/wallet` or the home page — the funding walkthrough is the single canonical place.

## Implementation

1. **Register the three uploads as Lovable assets** (kept out of the repo binary tree):
   - `src/assets/lace-tdust-empty.png.asset.json` ← `user-uploads://delegate-dust-*.png`
   - `src/assets/lace-tdust-generate.png.asset.json` ← `user-uploads://review-transaction-*.png`
   - `src/assets/lace-tdust-refilling.png.asset.json` ← `user-uploads://dust-tank-generation-*.png`

2. **New sub-block inside Step 03** (after the existing faucet + wallet grid): a 3-up responsive figure grid on desktop / stacked on mobile. Each figure:
   - Bordered card matching existing `border border-border` aesthetic
   - `<img>` with descriptive alt text
   - Small caption below in the existing `text-[10px] tracking-[0.28em] uppercase eyebrow` + muted body-text style:
     - **01 · Empty tank** — "0/0 tDUST after the faucet drops tNIGHT."
     - **02 · Generate tDUST** — "Delegate tNIGHT to your own Dust address."
     - **03 · Refilling** — "1,000 tNIGHT designated, tDUST tank starts filling."

3. **Attribution line** below the grid, small muted text:
   > Screenshots: [Midnight Docs — Acquire tokens ↗](https://docs.midnight.network/guides/acquire-tokens)

## Out of scope

- No changes to `/wallet`, home, showcase, or the deploy script.
- No new components — inline JSX inside the existing Step 03 block.
- No changes to copy of the surrounding steps.

## Technical notes

- Import pattern: `import emptyImg from "@/assets/lace-tdust-empty.png.asset.json"` then `<img src={emptyImg.url} alt="…" />` — matches the asset-pointer guideline; no binaries added to the repo.
- Images are Lace-wallet UI screenshots, safe to embed (they're already in the Midnight public docs).
