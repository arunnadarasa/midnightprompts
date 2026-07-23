## Add Mobile SDK link to desktop nav

**File:** `src/components/site-shell.tsx`

Insert a "Mobile SDK ↗" external link in the desktop nav bar between the Midskills and Hackathon anchors (matching the mobile menu order: Docs → Midskills → Mobile SDK → Hackathon → Explorer).

- URL: `https://kuiralabs.github.io/kuira-sdk-android/`
- Styling: same muted `text-[10px] tracking-[0.24em] uppercase` treatment as the Midskills link.
- Since horizontal space is already tight, hide it below `xl` (like Hackathon) so it appears at wider desktop widths and stays in the burger menu on medium/large screens where it would otherwise crowd out the group dropdowns.

No other changes.