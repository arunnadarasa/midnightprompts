# Technical article: "We generated ~32,000 Midnight build prompts"

A ~2,300-word technical article covering all three angles you picked, written as one markdown file that is both (a) ready to paste into dev.to and (b) rendered as a real page on the site at `/blog/midnight-mega-prompts`.

## What the article covers

1. **The problem** — Midnight (ZK L1, Compact contracts, Lace wallet, local proof server) has a brutal first-hour experience for hackathon devs: version drift, Docker/WSL blockers, SSR/WASM breakage. Most lost time is environment, not ideas.
2. **Full tour of the app** — what midnightprompts.lovable.app is: 1,996 hackathon ideas across creative themes, each with a self-contained build prompt, plus showcase demos, wallet/proof-server/Undeployed guides, Known Issues, and downloadable LLM bundles.
3. **The mega-prompt system (the technical core)** — how one idea becomes many prompts:
   - Idea JSON per theme in `src/data/ideas/`, protocol tags (base, A2A/AP2, UCP, x402).
   - `buildVariant(idea, network, os)` composing shared blocks (packages, toolchain, Vite config, MidnightJS boot, signing strategy, red flags) into a single self-contained prompt.
   - Network variants as the real multiplier: Preview, Preprod, Undeployed (Local), Undeployed (Fly.io), Undeployed (Mobile/Android), plus a hidden Mainnet variant; OS is an in-prompt swap, not a multiplier.
   - Actual numbers from `public/llms-full.meta.json`: 1,996 ideas, 9,980 visible prompts, 31,936 variants when OS-expanded for offline bundles.
   - Version pinning centralised in `src/lib/midnight-matrix.ts` against the official Midnight support matrix — one edit updates every prompt.
   - Why the bundles are externalised as CDN asset pointers instead of shipped in the Worker (the Cloudflare 1102 memory limit lesson).
4. **Hard-won Midnight lessons** — a failure-mode table with the fix for each, drawn from the reference builds (choreokits, choreocrowd, flymidnight, mobilemidnight):
   - Never `nitro: false` to escape SSR; stub `@midnight-ntwrk/*` in the SSR pass and load behind `ClientOnly`.
   - `Buffer` polyfill ordering / async client entry.
   - Undeployed writes go server-side (`POST /api/append-entry` with the genesis seed); public nets go through the wallet.
   - Fly.io: proof server must be reached over the public HTTPS URL (binary is IPv4-only, 6PN is IPv6-only); `VITE_DEFAULT_CONTRACT` must override stale `localStorage`.
   - Wallet readiness shape in WalletFacade 4.1.1; sync stalls and `NoOpTransactionHistoryStorage`.
   - Compact constraints: 32-byte UTF-8 field limits, no recursion, no I/O in circuits.
   - Funding: `midnight-wallet-cli` (`mn address`, `mn balance`) as the fast seed → bech32 path.
   - Android/Kuira: real `rpId` + live `assetlinks.json`, reinstall after `rpId` change.
5. **How to use it** — pick an idea, pick a network tab, pick OS, copy the prompt into Lovable, run the toolchain commands, deploy. Plus the downloadable skill/LLM bundles.
6. **Close** — links to the site, showcase repos, and the Midnight support matrix. Credits the hackathon.

Tone: first-person engineering write-up with real code snippets and tables, no marketing filler. Only verifiable claims (versions, counts, repo links) — no invented metrics.

## Technical implementation

- `src/content/blog/midnight-mega-prompts.md` — the article body with dev.to front matter (`title`, `published: false`, `tags`, `cover_image` omitted) at the top so the file can be pasted straight into the dev.to editor.
- Add `react-markdown` + `remark-gfm` (needed for the failure-mode tables) and import the markdown with Vite's `?raw` suffix; front matter is stripped at render time so the site page shows only the body.
- `src/routes/blog.index.tsx` — simple index listing the article (built to hold future posts).
- `src/routes/blog.$slug.tsx` — renders the markdown inside the existing `site-shell` layout, with prose styling matching the current dark theme, `break-words` on code so mobile does not overflow, and a "Read on dev.to" placeholder link left blank until you publish.
- `head()` on both routes with unique title/description/og tags, single H1, canonical-friendly copy.
- Add "Blog" to the `Learn ▾` desktop dropdown and the mobile burger list in `src/components/site-shell.tsx`, plus a bento card link on the homepage.
- Verify by loading `/blog/midnight-mega-prompts` in the preview and confirming tables, code blocks, and mobile wrapping render correctly.
