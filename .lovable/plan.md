## Issue

At tablet (≥ md, < lg — e.g. 768–1023px) the full desktop nav (Themes → Known Issues + Docs/Explorer) is shown, which overflows and clips off-screen. The burger menu currently only shows below `md`.

## Fix — bump the desktop-nav breakpoint from `md` to `lg`

In `src/components/site-shell.tsx`:

- Line 28 (`<nav>`): `hidden md:flex` → `hidden lg:flex` so the horizontal nav only shows from 1024px up.
- Line 66 (`<SheetTrigger>`): `md:hidden` → `lg:hidden` so the burger stays visible on tablet.
- Line 42 (Hackathon link): keep `hidden xl:inline-block` (already fine).

The mobile sheet already contains every nav item + Hackathon/Docs/Explorer, so tablet users get the full menu via the burger — no content lost.

## Out of scope

- No visual/type/spacing redesign, no new components.
- No change to the mobile sheet's contents or the desktop nav's contents.
- No changes to page content, only the header breakpoint.