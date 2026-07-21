## Problem

The desktop header (screenshot at 990px CSS width, and still tight up to ~1400px) tries to fit 11 nav links + 4 external buttons in a single row. Result: "Hackathon ↗" clips to "HAC…" and the row feels cramped even on wide screens. Mobile burger (< lg) is unaffected.

## Fix

Collapse the flat nav into 3 primary links + 2 grouped dropdowns + a tight external cluster. Keep every destination reachable; only the visual grouping changes.

### New desktop layout (left → right)

```text
[Logo]   Themes  Showcase  Wallet   Build ▾   Learn ▾   |   Docs↗  Midskills↗  Explorer↗
```

- **Build ▾** (dropdown): Proof Server, Undeployed, Preflight, Known Issues
- **Learn ▾** (dropdown): Strategy, Primer, LLM Docs, About
- **External cluster** (right of divider): Docs ↗, Midskills ↗, Explorer ↗ (primary button). Hackathon ↗ moves into the Build/Learn header area of each dropdown as a highlighted footer link, and stays in the mobile sheet as today.

### Technical notes

- Use existing `@/components/ui/dropdown-menu` (shadcn, already in project) for the two menus. Trigger styled to match `NavLink` (same uppercase 11px tracking); add a small chevron.
- Keep the `lg:` breakpoint for burger swap — no changes to mobile sheet.
- `NavLink` component stays; add a `NavMenu` trigger variant in the same file.
- Active-state: dropdown trigger gets `text-primary` when any child route matches (check `useRouterState().location.pathname` against the group's paths).
- No route, data, or copy changes outside `src/components/site-shell.tsx`.

### Out of scope

Mobile menu, footer, and route content stay as-is.