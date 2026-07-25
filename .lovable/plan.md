## Goal

Fold the agentic-commerce ideas into the 10 existing creative themes so each theme becomes 200 entries (100 base + 50 A2A/AP2 + 25 UCP + 25 x402), and expose protocol filter chips on each theme page.

## Data restructuring

1. Rewrite `scripts/generate-agentic-ideas.py` to output **per-theme** ideas instead of three standalone theme files:
   - For each of the 10 themes in `themes.json`, generate 50 A2A/AP2 + 25 UCP + 25 x402 = 100 agentic ideas keyed to that theme's slug and audience.
   - Titles/pitches use the theme's vertical (dance, music, theater, fashion, …) instead of the generic vertical list, so ideas feel native to their house.
   - Each idea keeps `protocol: "a2a-ap2" | "ucp" | "x402"` and gets `quantumHookId` from the existing hook palette so current chips still work.
   - IDs are deterministic and unique across all themes.

2. Merge output straight into the existing per-theme JSON files (`dance.json`, `music.json`, … `fashion.json`), appending after the 100 base ideas so each file becomes ~200 ideas.

3. Delete the three standalone theme files: `agentic-a2a-ap2.json`, `agentic-ucp.json`, `agentic-x402.json`.

4. Update `src/data/ideas.ts`:
   - Drop the three `agenticA2A*Data` imports and their entries in `files`.
   - Drop `AGENTIC_THEME_SLUGS`.
   - Keep `IDEAS_BY_PROTOCOL` — it still works because ideas retain `protocol`.
   - `THEMES` shrinks back to the 10 creative houses.

## Theme page — protocol filter

In `src/routes/themes.$theme.tsx`:

- Add a second row of filter chips (or extend the existing row) with: **All protocols · A2A + AP2 · UCP · x402 · Base only**.
- State: `protocolFilter: Protocol | "base" | null`.
- Filter logic combines hook chip + protocol chip + search.
- Update the "Primitives" stat to count hooks across the currently-visible set.
- Ensure mobile: chips stay in the existing horizontally-scrolling row with mask fade.

## Showcase / routes cleanup

- `showcase.index.tsx`, `showcase.a2a-ap2-negotiation.tsx`, `showcase.ucp-zk-checkout.tsx`, `showcase.x402-midnight-paywall.tsx` don't reference the deleted theme slugs, but grep once to confirm no `/themes/agentic-*` links remain. Fix any that do.
- `themes.index.tsx` will automatically drop the three agentic houses when `THEMES` shrinks — verify no hard-coded card list.

## Idea detail page (`ideas.$id.tsx`)

Already reads `idea.protocol` to inject the right on-chain block into the mega-prompt — no change needed. The prompt count stays at ~12,000 (10 themes × 200 ideas × 6 net variants, still gated by the Mainnet-hidden flag).

## Verification

1. `python3 scripts/generate-agentic-ideas.py` regenerates the theme files.
2. `bun run build` succeeds; typecheck passes.
3. Visit `/themes/theater` → shows 200 entries, protocol chips filter correctly, hook chips still work, search still works.
4. `/themes` no longer lists the three agentic houses.
5. Mega-prompt for an A2A idea inside `theater` still emits the A2A block.
