# Update all ~10,000 mega-prompts with fresh skill learnings

All prompts are generated at render time from a single builder in `src/lib/mega-prompt-variants.ts` (and the same builder is used by `scripts/build-llms-full.mjs` to emit the 9 `.txt` bundles). Editing the shared blocks there updates every idea × network × OS combination — the `/ideas/:id` page, the "Open in Lovable" link, and the downloadable `llms-full.txt` bundles all pick it up automatically. No JSON re-generation needed.

## What gets added / rewritten

Targeted edits inside `src/lib/mega-prompt-variants.ts` — each existing block stays in place; content is upgraded, not restructured.

1. **Docker block (`TOOLCHAIN_BY_OS` + `LOCAL_STACK_DOCKER_BY_OS`)**
   - Fold in the Docker LLM-doc cheatsheet already used on `/proof-server` (image lifecycle, `docker system prune`, port 6300 conflict fix, WSL clock drift, Apple Silicon multi-arch note).
   - Explicit "Docker Desktop must be RUNNING first" gate + the exact `unix:///var/run/docker.sock` error signature from the `lovable-midnight` skill.
   - `docker ps` / `docker logs -f midnight-proof-server` / `docker stop|start` lifecycle commands.

2. **Undeployed block (`LOCAL_STACK_INTRO`, `LOCAL_STACK_OUTRO`, `UNDEPLOYED_FUND_LACE`)**
   - Anchor everything to `bun scripts/midnight-standalone.mjs up|status|down` (the wrapper already shipping on `/undeployed`).
   - Ports table: node `ws://localhost:9944`, indexer `http://localhost:8088/api/v4/graphql`, proof `http://localhost:6300/health`.
   - Genesis-mnemonic option A / transfer option B (already there) — tightened, plus the "address prefix `undeployed` confirms the network" tell.
   - Link out to `/undeployed-preflight` for four-green-pill verification.

3. **Frontend block (`VITE_CONFIG` + `MIDNIGHTJS_BOOT`)**
   - Reinforce "no SSR, no module-scope `@midnight-ntwrk/*` imports" — call out TanStack Start's `<ClientOnly>` boundary explicitly (not just Vite SPA).
   - Buffer polyfill must be the very first line of `src/main.tsx` **or** a client-only entry.
   - `optimizeDeps.exclude` for `onchain-runtime-v3` WASM stays (fixes the top-level-await crash).
   - Add the "circuits are bounded — no recursion, no dynamic loops, no I/O, no oracles" line from `lovable-midnight` into `REDFLAGS`.

4. **Wallet block (`WALLET_BOILERPLATE`)**
   - Keep the v4 connector logic (no `.enable()` / no `.state()`).
   - Enumerate `window.midnight` by UUID (per `react-wallet-connector` skill) instead of relying on the first entry.
   - Add the `'undeployed'` network id to the candidate list explicitly.
   - Show tDUST balance strip snippet (`balanceAndProofOfBalance()`).

5. **Deploy script (`SCRIPTS_FOLDER`)**
   - Flesh out `scripts/deploy-midnight.mjs` with a real body (load compiled artefacts, wire providers, call `deployContract`, persist `src/data/midnight-contract.<network>.json`) rather than the current `<hex printed by deployContract>` placeholder.
   - Add `scripts/check-midnight-wallet.mjs` reference (already in the repo) so generated apps get a wallet doctor out of the box.
   - Pin `@midnight-ntwrk/*@4.1.1` versions consistently.

6. **Funding block (Preview / Preprod)**
   - Explicit "tNIGHT ≠ tDUST" callout from `lovable-midnight` — the #1 support question — with the 4-step delegate flow.

7. **Housekeeping**
   - Bump the `SITE_HEADER` / references list in `src/data/llms-content.ts` if any URL / version drifted.
   - Re-run `bun run scripts/build-llms-full.mjs` at the end so the 9 downloadable `.txt` bundles are regenerated; the `.asset.json` pointers pick up the new blobs automatically.

## Not changing

- No changes to idea JSONs, themes, hooks, or per-idea copy — those are already correct.
- No route / component / navigation changes.
- No new dependencies.

## Verification

- Typecheck (`tsgo`) — the build touches only string constants.
- Open `/ideas/dance-001` (or any idea), flip Preview / Preprod / Undeployed × macOS / Windows / Linux, spot-check the six variants.
- Run the LLM bundle script and confirm `public/llms-full.meta.json` sizes update.
