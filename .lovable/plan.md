# Add "Download Lovable Midnight skill" button

Ship the `lovable-midnight` SKILL.md as a downloadable file so hackathon users can drop it into their own Lovable account (Settings → Skills → Import).

## What to add

1. **Bundle the skill file** — copy `.agents/skills/lovable-midnight/SKILL.md` (~17 KB) to `public/skills/lovable-midnight/SKILL.md` via a small entry in `scripts/build-llms-full.mjs` (or a dedicated `scripts/bundle-skills.mjs`) so it stays in sync when the skill is edited. Small enough (<10 MB) that it can live in the repo directly — no lovable-assets needed.

2. **Surface a download button on `/llms`** — add a new "Lovable skills" section above the LLM bundles list on `src/routes/llms.tsx` with:
   - A single card for `lovable-midnight` showing filename, size, and a one-line description ("Rules, pinned Docker tags, deploy-script gotchas — drop into Settings → Skills in your own Lovable project").
   - Primary button: `<a href="/skills/lovable-midnight/SKILL.md" download>Download SKILL.md</a>`.
   - Secondary link: brief inline steps ("In your Lovable project → Settings → Skills → New skill → paste contents") plus a link to the Midskills gallery.

3. **Homepage hint** (optional, small): a one-line link in the existing support / service-desk block on `src/routes/index.tsx` pointing to the new `/llms#skills` anchor so hackathon users find it without hunting.

## Out of scope

- Bundling every skill under `.workspace/skills/` — only `lovable-midnight` is on-brand for this site. If the user later wants `midnight-environment-setup` and `react-wallet-connector` too, we add them to the same section.
- Zipping multiple files — the skill is a single SKILL.md, so a plain download is simpler than a zip.
