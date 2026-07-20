Fix the mobile burger menu so the full list of links is reachable on small screens.

## Current state

- The mobile menu is rendered in a shadcn `Sheet` that slides in from the right and fills the full viewport height.
- Inside the sheet there is a header ("Creative Midnight") and a single `<nav>` column containing 10 internal links + 4 external CTA buttons (14 items total).
- The `<nav>` has no `overflow-y-auto` or constrained height, so on short viewports the bottom items (Explorer, Hackathon) are pushed off-screen and cannot be reached.

## Plan

1. Make the mobile menu scrollable
   - Wrap the `<nav>` in a flex column with `flex-1` and `overflow-y-auto` so the link list scrolls independently while the header stays fixed.
   - Add bottom padding (`pb-6` plus `pb-safe` if the project uses a Tailwind safe-area plugin) so the last item is not hidden behind the device home bar or Lovable preview chrome.

2. Reduce visual weight of the CTA buttons so they fit better
   - Keep the 4 external buttons (Midnight Docs, Midskills, Explorer, Hackathon) but change their vertical spacing from `mt-3` / `mt-2` to a consistent `mt-1` or use a single `gap-1` on the nav.
   - Slightly reduce the external CTA button padding on very small screens (`py-2.5` instead of `py-3`) so the menu does not require excessive scrolling.

3. Verify on the actual preview
   - Open the preview at a mobile viewport (e.g., 384x681 CSS px matching the user's screenshot).
   - Open the burger menu and scroll to confirm the bottom "Hackathon ↗" button is fully visible and tappable.
   - Check that no horizontal overflow or clipping occurs on the link text.

## Files to change

- `src/components/site-shell.tsx` — update the mobile `<SheetContent>` nav layout and styling.
- No new dependencies or routes required.

## Out of scope

- Reordering or removing menu items; the last change already moved Hackathon to the bottom, and we will keep that order.
- Desktop nav changes; this only affects the `lg:hidden` mobile sheet.
- Adding collapsible sections unless the simple scroll fix proves insufficient during verification.