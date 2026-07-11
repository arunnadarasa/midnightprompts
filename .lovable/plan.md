## Goal
1. Swap the old faucet URL (`cloud.google.com/application/web3/faucet/midnight/testnet`) for both Nethermind faucets in the 1,000 mega-prompts.
2. Fix the homepage bug where the **Preprod Faucet** button links to the Preview faucet.

## Faucet URLs
- Preview: `https://midnight-tmnight-preview.nethermind.dev/`
- Preprod: `https://midnight-tmnight-preprod.nethermind.dev/`

## Changes

### 1. Homepage bug — `src/routes/index.tsx` (line 48)
The Preprod Faucet button's `href` is `…-preview.nethermind.dev`. Change it to `…-preprod.nethermind.dev`. Preview button (line 56) already correct.

### 2. Mega-prompt footer — all 10 idea JSONs
Files: `src/data/ideas/{dance,fashion,film-animation,games,music,photography,theater,video,visual-art,writing}.json`

Replace the current single line:
```
Faucet:  https://cloud.google.com/application/web3/faucet/midnight/testnet  (tDUST — pays proof / balance fees)
```
with:
```
Faucets: Preview  https://midnight-tmnight-preview.nethermind.dev/  ·  Preprod  https://midnight-tmnight-preprod.nethermind.dev/  (dispense tNIGHT — generate tDUST in Lace)
```
(The old "tDUST — pays proof / balance fees" note was inaccurate; faucets dispense tNIGHT, Lace delegates it to tDUST.)

### 3. Prompt generator — `scripts/rewrite_mega_prompts.py` (line 46)
Apply the same replacement so future regenerations stay consistent.

### 4. About page — `src/routes/about.tsx` (line 40)
Change the "Get tDUST from the Midnight preview faucet" list item to link both faucets:
```
Request tNIGHT from the Midnight faucet — Preview or Preprod — then click Generate tDUST in Lace.
```
with two anchor tags.

### 5. Strategy page — `src/routes/strategy.tsx` (line 121)
Replace the `open https://cloud.google.com/…` shell line with:
```
# 3. Get tNIGHT from the Midnight faucet (pick the network you're building on):
open https://midnight-tmnight-preview.nethermind.dev/   # Preview
open https://midnight-tmnight-preprod.nethermind.dev/   # Preprod
#    Then in Lace click "Generate tDUST" to delegate tNIGHT → tDUST.
```

## Verification
- `rg -n "cloud.google.com/application/web3/faucet"` → no matches.
- `rg -n "midnight-tmnight-preview.nethermind.dev"` and `rg -n "midnight-tmnight-preprod.nethermind.dev"` both hit `src/routes/index.tsx`, `src/routes/about.tsx`, `src/routes/strategy.tsx`, `scripts/rewrite_mega_prompts.py`, and each of the 10 idea JSONs.
- Homepage renders "Preprod Faucet" pointing to the `-preprod` URL.
- Build passes.