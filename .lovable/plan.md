## Goal

Add a top-nav "Known Issues" link so builders can jump straight to `/known-issues` from anywhere.

## Change: `src/components/site-shell.tsx`

- Desktop nav (~line 35, after `<NavLink to="/about">About</NavLink>`): add `<NavLink to="/known-issues">Known Issues</NavLink>`.
- Mobile menu (~line 81, after the About `<MobileLink>`): add `<MobileLink to="/known-issues" onClick={close}>Known Issues</MobileLink>`.

Placement is deliberate: keeps the primary content links (Themes → About) together, and puts Known Issues immediately before the external Hackathon/Docs/Explorer buttons — matching how it reads as a reference/utility link, not a content section.

## Out of scope

- No visual/style changes to the nav itself.
- No new page — `/known-issues` already exists.
- No changes to the existing homepage / showcase Known Issues callouts.
