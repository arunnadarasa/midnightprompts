## Mobile UX fix — Homepage bento grid overflow

**Problem:** In the homepage bento (`src/routes/index.tsx`), `auto-rows-[260px]` is applied at all breakpoints. On mobile the Status card and Support card contents are taller than 260px, so they overflow their row and visually collide (the "Support · Midnight team" eyebrow bleeds up against the Status card border, as shown in the screenshot). The featured card's inner portrait aspect-[3/4] block is also oversized on narrow screens.

### Changes (scoped to `src/routes/index.tsx`)

1. Restrict the fixed row height to `md:` and up: `auto-rows-[260px]` → `md:auto-rows-[260px]` so mobile rows size to content.
2. Add `min-h` fallbacks where a card looks empty without the fixed height (the "1k ZK Entries" tile and the "02" portrait tile), so they still feel like feature blocks on mobile.
3. Constrain the portrait card's inner `aspect-[3/4]` to `max-h-[280px]` on mobile so it doesn't dominate the viewport.
4. Tighten the Support card action row: switch `flex flex-wrap gap-5` → `grid grid-cols-2 gap-x-4 gap-y-3` on mobile so the four links stack cleanly instead of wrapping unevenly.
5. Hero CTA row: allow the three faucet/index buttons to be full-width friendly on mobile (`flex-wrap` is fine; ensure no forced min-width causes crowding — verify padding).

No content or business-logic changes. Only presentation utilities on the homepage.

### Verification

- Reload `/` at 384px viewport and confirm Status and Support cards no longer overlap, all four Support links are readable, and the featured/portrait tiles retain their editorial feel.
- Spot-check at `md` and `lg` to confirm desktop bento is unchanged.