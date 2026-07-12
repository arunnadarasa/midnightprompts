## Why the header is missing

Every other page (`index.tsx`, `about.tsx`, etc.) wraps its content in `<SiteShell>`, which renders the top nav. `src/routes/known-issues.tsx` skips that wrapper, so the page renders bare — no nav, no footer.

## Fix

Edit `src/routes/known-issues.tsx`:
1. Add `import { SiteShell } from "@/components/site-shell";`.
2. Wrap the component's returned JSX in `<SiteShell>…</SiteShell>`, matching the pattern used by `about.tsx`.

No other changes — content, styles, and route config stay as-is.