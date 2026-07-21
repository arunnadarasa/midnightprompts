## Goal

Every mega-prompt (~10k variants) already covers Midnight/Compact/Docker/Lace deeply, but the **frontend + Lovable-agent** side is thin. Fold the latest Lovable skill learnings into `src/lib/mega-prompt-variants.ts` so every generated brief tells Lovable how to build the UI to current standards, then regenerate `public/llms-*.txt`.

Scope is prompt content only. No route or UI changes.

## What to add to every variant

New constant block `FRONTEND_STANDARDS` injected between `MIDNIGHTJS_BOOT` and the per-hook body:

1. **Design system (hard rule)**
   - Semantic tokens only. All colors/gradients/shadows in `src/index.css` under `:root` / `.dark` + `@layer base`. Extend via `tailwind.config.ts` `theme.extend.colors`.
   - Ban hardcoded utilities in components: `text-white`, `bg-black`, `bg-[#...]`, inline hex. Use `text-foreground`, `bg-background`, `bg-primary`, etc.
   - Reject generic AI aesthetics: no default Inter/Poppins body + purple/indigo gradient on white unless the idea explicitly calls for it. Commit to one distinctive direction per idea (typography pair + accent) that matches the theme (Music / Dance / Film / etc.).
   - Dark-mode-first (Midnight brand). Provide a light-mode token set anyway so `next-themes` works.

2. **shadcn/ui usage**
   - Use `@/components/ui/*` primitives (Button, Card, Dialog, Tabs, Toast). Customize via variants, never by overriding with hardcoded classes.
   - New reusable pieces live in `src/components/`; hooks in `src/hooks/`. Files stay small and focused.

3. **State + async UX**
   - Proving state (30–120s) must show a determinate label, keep the page interactive, and stream status: `Proving → Balancing → Submitting → Confirmed` with a Midnight explorer link on success and a copy-able error on failure.
   - Empty, loading, and error states are required for every async view — no bare spinners, no unhandled rejections.
   - Toasts via `useToast` for wallet/deploy/tx events; never `alert()`.

4. **SEO + head metadata**
   - `<title>` <60 chars with the idea keyword, `<meta name="description">` <160 chars, single `<h1>`, semantic HTML (`<main>`, `<section>`, `<article>`, `<nav>`), `alt` on every image, JSON-LD `WebApplication` block, canonical tag, responsive viewport.
   - `og:title`, `og:description`, `og:type=website`, `twitter:card=summary_large_image`. Skip `og:image` unless the idea produces a real cover image.

5. **Accessibility + responsive**
   - Keyboard-reachable controls, visible focus rings (via token), `aria-live` on the proving/status region.
   - Mobile-first Tailwind: test at 375px. Wrap long addresses/CIDs with `break-all` inside `min-w-0` flex children.

6. **Lovable-agent workflow hints** (short block Lovable will read)
   - Prefer search-replace edits over rewrites. Keep components small. Only change what the user asked for. Verify with build output before claiming done.
   - Storage: default to `localStorage` for the 32-byte witness secret; never send it to any server. No Lovable Cloud in the 5-credit budget.

## Files touched

- `src/lib/mega-prompt-variants.ts` — add `FRONTEND_STANDARDS` const and reference it from `buildVariant`. One-line insert in the returned template.

## Regenerate bundles

Run `bun scripts/build-llms-full.mjs` to rewrite:
- `public/llms-core.txt`
- `public/llms-prompts-{preview|preprod|undeployed}-{macos|windows|linux}.txt` (9 files, externalized via `lovable-assets`)
- `public/llms-full.txt` (externalized)
- `public/llms-full.meta.json`

## Out of scope

- No changes to `/ideas/$id` UI (it already reads `buildVariant` at render time, so new content flows through automatically).
- No changes to routes, wallet code, or Compact contracts.
- No new pages.

## Verification

- Typecheck passes.
- Spot-check one rendered prompt on `/ideas/<any>` — confirm the new `FRONTEND STANDARDS` block appears once, above the per-hook body, in each of the 9 tabs.
- Confirm `llms-full.meta.json` sizes update.
