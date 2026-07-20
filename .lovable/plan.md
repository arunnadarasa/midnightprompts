## Goal
Generate a downloadable `llms-full.txt` containing **our site's** knowledge — reference guides plus every mega-prompt in every network × OS combination — so hackathon participants can feed it to their LLM.

## Approach

### 1. Build script: `scripts/build-llms-full.mjs`
Node ESM script that assembles a single plain-text file at `public/llms-full.txt` (served as `/llms-full.txt`).

Structure, with `# H1` / `## H2` markers and a top-of-file table of contents:

1. **Header** — site name, purpose, generation timestamp, upstream Midnight docs link.
2. **Reference guides** (plain markdown, extracted into a new `src/data/llms-content.ts` so the script and site share one source):
   - Wallet setup (`/wallet`, all networks + faucet notes)
   - Proof Server (`/proof-server`)
   - Undeployed quick-start (`/undeployed`) + preflight (`/undeployed-preflight`)
   - Docker setup — macOS, Windows, Linux panels + cheat-sheet + common errors (from `DockerSetupGuide.tsx`)
   - Known Issues (`/known-issues`)
   - Showcase demos: proof-server demo, programmatic DUST, move-board, choreo-ledger-local
   - Strategy, Primer, About
3. **Mega-prompts** — for each of the 1,000 ideas in `src/data/ideas.ts`, emit all **9 variants**: 3 networks (Preview, Preproduction, Undeployed) × 3 OSes (macOS, Windows, Linux), built via `buildMegaPrompt({ network, os })` from `src/lib/mega-prompt-variants.ts`. Each idea gets a `## <id> — <title>` section with 9 clearly-labelled fenced blocks (`### Preview · macOS`, `### Preview · Windows`, …).
4. **Meta footer** — generated-at timestamp + byte size.

Also write `public/llms-full.meta.json` = `{ generatedAt, byteSize, ideaCount, variantCount }`.

Size estimate: 1,000 × 9 × ~4 KB ≈ 36 MB. Big but fine as a static download. To keep the tool useful for smaller context windows, the script also emits:
- `public/llms-core.txt` — guides only, no prompts (~200 KB).
- `public/llms-prompts-<network>-<os>.txt` — 9 slimmer per-combo files (~4 MB each).

### 2. Route: `/llms`
`src/routes/llms.tsx`:
- Head metadata (title/description/og).
- Explainer of what's inside and how big each file is.
- Primary **Download full** button → `/llms-full.txt` + secondary **Download core (guides only)** → `/llms-core.txt`.
- OS + network selector that reveals the matching per-combo download link.
- "Copy raw URL" for each file.
- "Last generated" timestamp + sizes from `llms-full.meta.json`.
- Usage snippets for Cursor ("Add doc"), Claude Projects, ChatGPT custom GPTs, and Lovable ("paste as context").
- Link to upstream `https://docs.midnight.network/llms-full.txt` for Midnight's own docs.
- Wrapped in `<SiteShell>`.

### 3. Navigation
Add **LLM Docs** to desktop nav and to the mobile burger menu inside the "Deep Dives" cluster (after Primer, before Known Issues), preserving user-journey ordering.

### 4. Mega-prompt hint
In `src/lib/mega-prompt-variants.ts`, add one line to the "Reference material" block pointing Lovable/the model at `https://midnightprompts.lovable.app/llms-full.txt`. No stored-data change (prompts render dynamically).

### 5. Regeneration workflow
- Add npm script: `"llms": "node scripts/build-llms-full.mjs"`.
- Commit generated files under `public/` so the Cloudflare build ships them without running Node at build time (the Worker can't handle a 36 MB build step anyway).
- Document the one-liner in README.

## Technical notes
- Script runs in Node — no Worker limits.
- `buildMegaPrompt` is already a pure function importable from the script.
- Static text/plain files are served directly by TanStack Start's static asset pipeline.
- Route/component files stay JSX; only extracted narrative text moves to `llms-content.ts` (no UI regression).

## Out of scope
- Auto-regeneration on a schedule.
- Per-idea individual downloads.
- Translations.
