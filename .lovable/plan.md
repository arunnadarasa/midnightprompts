Ship two things that lower the setup bar for the Undeployed (local Midnight standalone stack) variant, while keeping the actual node/indexer/proof-server running on the user's own machine (Cloudflare Workers can't host them).

## 1. One-command stack wrapper — `scripts/midnight-standalone.mjs`

A Node/Bun script that wraps the official standalone `docker compose` file so users run **one** command instead of five.

Commands:
- `bun scripts/midnight-standalone.mjs up` — pulls images, writes `.midnight/standalone.docker-compose.yml` (bundled inline in the script), runs `docker compose … up -d`, polls readiness on `ws://localhost:9944` and `http://localhost:8088`, prints a green "ready" banner with the three endpoint URLs + a link to `/undeployed-preflight`.
- `bun scripts/midnight-standalone.mjs down` — `docker compose … down` and reports.
- `bun scripts/midnight-standalone.mjs logs [service]` — tails logs.
- `bun scripts/midnight-standalone.mjs status` — prints health of each container + `curl` results.

Pre-flight checks the script performs before `up`:
- `docker info` reachable (else print the "start Docker Desktop" hint from the existing skill).
- Ports 9944, 8088, 6300 free (else print which process holds them).
- Prints platform-specific WSL2 note on Windows.

Files:
- `scripts/midnight-standalone.mjs` — new.
- `.gitignore` — add `.midnight/`.
- `src/routes/showcase.choreo-ledger-local.tsx` — replace the multi-step Docker walkthrough with a short "run `bun scripts/midnight-standalone.mjs up`" block, keep the OS notes as a collapsible fallback.
- Mega-prompt generator `scripts/rewrite_mega_prompts.py` — swap the current `local_stack_setup()` body for the one-command version, keep OS notes as an appendix. Regenerate the 996 undeployed prompts + re-run `append_wallet_boilerplate.py`.

## 2. `/undeployed-preflight` health-check page

A client-only diagnostic page that talks to the user's local stack from their browser and confirms each piece works before they attempt a deploy.

Route: `src/routes/undeployed-preflight.tsx` (wrapped in `<SiteShell>`).

Four checks, each with a status pill (checking / ok / fail) and the raw response/error shown on click:

1. **Proof server** — `GET http://localhost:6300/health` → expect `{ status: "ok" }`.
2. **Indexer HTTP** — `POST http://localhost:8088/api/v4/graphql` with a trivial introspection query → expect 200 + `data`.
3. **Indexer WS** — open `ws://localhost:8088/api/v4/graphql/ws`, send connection_init, wait for `connection_ack`, close.
4. **Node RPC** — open `ws://localhost:9944`, send a `system_chain` JSON-RPC call, expect a response.

Extras:
- "Re-run all" button.
- Lace network hint — reads `window.midnight` (via existing `useMidnightWallet` hook) and warns if Lace isn't on `Undeployed`.
- "All green → open Choreo Ledger demo" CTA linking to `/showcase/choreo-ledger-local`.
- Copy-to-clipboard block of the exact env vars (`VITE_NETWORK_ID=undeployed`, indexer URL, proof server URL) for a fresh Lovable project.

Because Cloudflare Workers can't reach the user's `localhost`, every fetch runs in the browser inside `useEffect` — no SSR, no server function.

Wire-ups:
- Add "Preflight" link to `src/components/site-shell.tsx` desktop + mobile nav under a small "Undeployed" group, or inline next to Known Issues.
- Add a callout on `/showcase/choreo-ledger-local` linking to `/undeployed-preflight` as step 2 after `up`.
- Add a link from `/known-issues` DUST-sync workaround section.

## Non-goals (explicit)

- No hosted node in Lovable's sandbox — infeasible for reasons discussed.
- No changes to Preview or Preprod variants.
- No Docker-in-Docker in the Lovable build sandbox.

## Verification

- Run `bun scripts/midnight-standalone.mjs up` in a local terminal; confirm the readiness banner appears within ~60s and `/undeployed-preflight` shows four greens.
- Playwright screenshot the preflight page in the empty-state (no stack) — should show four reds with actionable messages.
- Typecheck + build.