## Goal
Fix mobile readability on `/known-issues`. Screenshot shows long code/URL strings (indexer URLs, `NODE_OPTIONS=...`, `batchUpdates: {...}`) breaking out of the viewport and forcing horizontal scroll, plus dense list items that feel cramped on a 384px screen.

## Changes (single file: `src/routes/known-issues.tsx`)

1. **Wrap long inline code**
   - Add a shared class for all inline `<code>` usages: `break-all whitespace-normal text-[11px] sm:text-[12px]` so URLs and env-var strings wrap instead of overflowing.
   - Apply to every `<code>` in the ISSUES array (indexer URLs, `NODE_OPTIONS`, `batchUpdates`, RPC URLs, `contract-info.json` path, etc.).

2. **Constrain article cards**
   - Add `overflow-hidden` to each `<article>` and `min-w-0` on inner content wrappers so nothing forces the card wider than the viewport.
   - Reduce card padding on mobile: `p-4 sm:p-6 md:p-7`.

3. **Tighten typography on mobile**
   - H1: `text-3xl sm:text-4xl md:text-5xl` (currently jumps straight to 4xl).
   - H2 (issue titles): `text-xl sm:text-2xl`.
   - Body copy: keep `text-sm` but add `leading-relaxed` consistently.
   - Outer container padding: `px-4 sm:px-8`, `py-10 sm:py-20`.

4. **Pre blocks (code samples)**
   - Already have `overflow-x-auto`; add `text-[10px] sm:text-[11px]` and `-mx-1 sm:mx-0` so the pipeline diagram and curl snippet fit without pushing the card.

5. **On-this-page nav**
   - Single column on mobile: keep `grid sm:grid-cols-2`, add `gap-y-2` for tap targets, `py-1` on each link so they're easier to hit.

6. **Bottom link row**
   - Change `flex flex-wrap gap-4` to `flex flex-col sm:flex-row gap-3 sm:gap-4` so the four nav links stack cleanly on mobile.

7. **Recommended-workaround callout**
   - Reduce `p-5` → `p-4 sm:p-5`, ensure the inline `<Link>` wraps.

## Out of scope
- No content changes (symptoms/causes/fixes stay identical).
- No changes to other routes or `SiteShell`.
- No new components.

## Verification
- Playwright at 384×800 viewport, screenshot the top of the page and the "Lace shows DUST but SDK reports 0" card (the one in the user's screenshot) to confirm no horizontal scroll and code strings wrap.
