## Goal

Add a visible "Midnight Service Desk" call-out on the homepage so builders hitting the known Preprod issues can escalate directly.

## Change: `src/routes/index.tsx`

Extend the existing Status card block (the two-column grid holding the Strategy card + Status card, around lines 152–175) into a three-item stack, OR add a new sibling card next to Status. Given the current 2-col grid, the cleanest fit is to add a compact card **directly below the Status card** inside the same column:

- Eyebrow: "Support · Midnight team"
- Title (display italic): "Hit a Preprod wall? Open a Service Desk ticket."
- One-liner: "Bug reports, 1010 rejections, /check 400, DUST sync stalls — routed to the engineering team."
- Two links (uppercase eyebrow style, matching the rest of the page):
  - `Service Desk ↗` → `https://midnightntwrk.github.io/servicedesk/` (external, `target="_blank"`, `rel="noreferrer"`)
  - `Known issues →` → internal `<Link to="/known-issues">`
- Styling: reuse `bg-card border border-border p-7` + `border-l border-primary/30 pl-5` inner treatment so it matches the Status card.

## Out of scope

- No new route, no nav-bar entry, no footer changes.
- No copy changes to the Status card or Strategy card.
- Service Desk README URL is not linked separately — the servicedesk landing page covers it.
