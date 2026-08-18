# Add ambassador program and Academy links

Surface three official Midnight community links across the site: the ALIIT ambassador programme, NIGHTFORCE, and Midnight Academy.

## Where they appear

1. **Homepage community card** — add a new card in the bento grid (next to the Service Desk card) titled "Community · Grow with Midnight" with three outbound links:
   - ALIIT ambassadors — https://midnight.network/aliit
   - NIGHTFORCE — https://midnight.network/nightforce
   - Academy — https://academy.midnight.network/
   Each with a one-line description of what it is (ambassador track, builder/advocate force, structured learning path).

2. **Header nav (`src/components/site-shell.tsx`)** — add "Academy ↗" to the desktop external-link row (alongside Docs / Midskills) and to the mobile burger menu's external block. Add ALIIT and NIGHTFORCE as items inside the existing "Learn ▾" dropdown (rendered as external links) and matching entries in the burger menu, placed after "About".

3. **About page (`src/routes/about.tsx`)** — short "Keep going after the hackathon" paragraph in the Credits area linking all three, so participants have a next step.

## Technical notes

- All three are plain `<a target="_blank" rel="noreferrer">` links using existing nav/card class patterns — no new components, no route files, no data changes.
- `NavGroup` currently only renders internal `<Link>`s; it gains support for items with an optional `href` so external entries render as anchors inside the same dropdown.
- Mobile burger keeps its current scroll behaviour and ordering convention (internal routes first, external buttons last).
