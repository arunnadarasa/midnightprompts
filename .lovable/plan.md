## Diagnosis

Cloudflare **Error 1102 "Worker exceeded resource limits"** on `midnightprompts.lovable.app` = the SSR Worker ran out of CPU/memory while rendering.

Root cause is the ideas dataset:

- `src/data/ideas/` = **48 MB of JSON** across 10 theme files (~4.8 MB each).
- Every file is **statically imported at module scope** by `src/data/ideas.ts`, which is imported by `src/routes/index.tsx`, the themes routes, `ideas.$id`, etc.
- So every route the Worker renders — including the homepage — has to load and parse all 48 MB into memory. On Cloudflare Workers that blows the CPU/startup budget → 1102.
- Each idea now stores **4 near-duplicate copies** of the same ~11 KB prompt: `megaPrompt` + `megaPromptVariants.{preview,preprod,undeployed}`. That's what tripled the bundle when we added the 3-variant selector.

## Fix (two layers)

### 1. Stop shipping 3× duplicated prompt bodies

Store only the **base megaPrompt** in JSON. Compute the Preview / Preprod / Undeployed variants at render time in TypeScript by wrapping the base with the same header/secrets/local-stack block that `scripts/rewrite_mega_prompts.py` already generates.

- Add `src/lib/mega-prompt-variants.ts` — pure function `buildVariant(idea, network) → string` that returns the same text the Python script produces today.
- Update `scripts/rewrite_mega_prompts.py` to write only `megaPrompt` (the base) and drop `megaPromptVariants` from JSON. Regenerate all 12 files.
- Update `src/routes/ideas.$id.tsx` to call `buildVariant` when a tab is selected instead of reading `idea.megaPromptVariants[network]`.

Expected size drop: **~48 MB → ~16 MB** (one prompt body per idea instead of four).

### 2. Only load full prompt bodies on the detail route

16 MB is still too much to eager-import into every route. Split the data:

- Generate a **slim index** `src/data/ideas-index.json` containing only listing fields (`id`, `theme`, `title`, `pitch`, `subDiscipline`, `quantumHook*`, `quantumTag`, `tam`, `sam`, `som`) — the fields used by `idea-card.tsx`, `themes.*`, `quantum-primer.tsx`, and `index.tsx`. Estimated ~2–3 MB total.
- Keep the per-theme files but move them to a **dynamic-import map** used only by `/ideas/$id`:

  ```ts
  const themeLoaders = {
    dance: () => import("./ideas/dance.json"),
    music: () => import("./ideas/music.json"),
    // …
  };
  ```

  `ideas.$id.tsx`'s loader does `await themeLoaders[idea.theme]()` and returns only that theme's ideas (or just the one matching idea). Cloudflare's bundler splits each `import()` into its own chunk, so listing routes never touch the 4.8 MB body files.
- Rewrite `src/data/ideas.ts`:
  - `ALL_IDEAS`, `IDEAS_BY_THEME`, `THEMES`, `HOOKS`, `getIdea`, `getTheme`, `getHook` all backed by the slim index (no `megaPrompt` field on the slim type).
  - Add `loadFullIdea(id): Promise<Idea>` for the detail route.

### 3. Verify

- `bun run build` succeeds, then `du -sh dist` or inspect chunk sizes to confirm the homepage chunk no longer contains theme JSON.
- Reload the published site — homepage, `/themes`, `/ideas/<id>` all render, and the 1102 goes away.
- Spot-check that the Preview/Preprod/Undeployed tabs still produce the exact same prompt text they do today (diff one idea before/after).

## Files touched

- `src/data/ideas.ts` — rewrite for slim index + dynamic per-theme loader.
- `src/data/ideas-index.json` — new (generated).
- `src/data/ideas/*.json` — regenerated without `megaPromptVariants`.
- `src/lib/mega-prompt-variants.ts` — new; TS port of the Python variant wrapper.
- `scripts/rewrite_mega_prompts.py` — emit base-only + build slim index.
- `src/routes/ideas.$id.tsx` — async loader + call `buildVariant` in the tab.
- No UI/design changes.

## Not doing

- Not changing routes, navigation, styling, or the wallet-connect boilerplate.
- Not touching any showcase demo pages.

## Note

I cannot verify by re-reading the Python script or running the build in plan mode, so the "same text as today" guarantee in step 1 will be confirmed by a byte-diff of one idea's variants once we're in build mode.
