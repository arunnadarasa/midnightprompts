Plan — Showcase agentic demos now link to deployed external apps

Scope
- Update the three agentic demo cards on `/showcase` to point to the deployed external Lovable apps and include their GitHub repos.

Changes
1. `src/routes/showcase.index.tsx`
   - Change `a2a-ap2` card from internal `to: "/showcase/a2a-ap2-negotiation"` to external `href: "https://agenticmidnight.lovable.app/"`.
   - Add GitHub repo link: `https://github.com/arunnadarasa/agenticmidnight` in the card body.
   - Change `ucp-checkout` card from internal `to: "/showcase/ucp-zk-checkout"` to external `href: "https://ucpmidnight.lovable.app/"`.
   - Add GitHub repo link: `https://github.com/arunnadarasa/ucpmidnight` in the card body.
   - Change `x402-paywall` card from internal `to: "/showcase/x402-midnight-paywall"` to external `href: "https://x402midnight.lovable.app/"`.
   - Add GitHub repo link: `https://github.com/arunnadarasa/x402midnight` in the card body.

2. Preserve existing internal routes
   - Keep `src/routes/showcase.a2a-ap2-negotiation.tsx`, `showcase.ucp-zk-checkout.tsx`, and `showcase.x402-midnight-paywall.tsx` so any direct bookmarks do not break.
   - Optionally add a small "This demo has moved to …" link at the top of each internal page to route visitors to the live external app. Leave in unless requested to remove.

Verification
- Confirm `/showcase` renders the three agentic cards as external links with the correct `href` and GitHub links.
- Confirm existing internal routes still build and render.
- Run a quick build/typecheck to catch broken imports.

Out of scope
- No backend or contract changes.
- No LLM bundle or prompt regeneration.
- No removal of the old route files unless explicitly requested.