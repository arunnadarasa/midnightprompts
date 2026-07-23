## Refresh mega-prompts with updated Lovable Midnight skill

Fold the Tokenized Choreo Kits hard-won lessons — already present in the injected `lovable-midnight` skill body — into `src/lib/mega-prompt-variants.ts` so every generated prompt carries them. All edits are additive; nothing removed.

### 1. Expand `HOSTING_FLYIO` (src/lib/mega-prompt-variants.ts ~696–722)

Replace the condensed 8-bullet block with the full skill guidance, still Undeployed-only. Add:

- **Node #0 blocker as the #1 gotcha** — must verify block imports past #0 before wasting time on indexer/faucet debugging (`flyctl logs -a choreo-node | grep "Imported #[1-9]"`).
- **Never overwrite the image entrypoint with `[processes] app = "…"`** — Fly appends it as extra args to ENTRYPOINT; keep it short or omit; prefer env vars the entrypoint script reads.
- **Proof-server: stock image only, no custom Dockerfile** — distroless base has no shell; `exec: 127` if wrapped. Use `[build] image = "midnightntwrk/proof-server:8.0.3"` + `[processes] app = "midnight-proof-server -v"`, memory ≥ 2 GB.
- **Faucet binds `0.0.0.0`, NOT `::`** — Fly-proxy forwards over IPv4 loopback; IPv6-only listener never receives requests. Outbound to `.internal` still goes over IPv6.
- **`FAUCET_SEED` must be exactly 64 hex chars** — `openssl rand -hex 32`, not base64.
- **Faucet cannot import `NetworkId` from `@midnight-ntwrk/midnight-js-network-id` under Bun** — pass the numeric enum (`0` for Undeployed) directly.
- **Faucet cold-boot 10–90s** — `/grant` returns `503 warming up`; UI retry loop required; never `min_machines_running=0` unless 90s first-request delay is acceptable.
- **Faucet must be funded once** from genesis seed `…0002`; no auto-refill.
- **CORS** header + OPTIONS handler on the faucet.
- **Bootstrap order (do NOT skip step 1)**: prove node authors blocks → indexer → proof-server → faucet → fund faucet → run deploy from a 6PN Fly Machine (`scripts/fly-deploy-contract.sh`).
- Idempotent one-shot recipe: `FAUCET_SEED=$(openssl rand -hex 32) ./scripts/fly-bootstrap.sh` + `./scripts/fly-deploy-contract.sh`.
- Compact **failure-mode table** with the new rows (node stuck at `#0`, indexer TOML `"[::]"` parse crash, distroless `exec: 127`, `[processes]` misuse, macaroon 401, `InvalidSeed`, `NetworkId` ESM crash, faucet hang from `::` bind, mixed-content HTTPS).
- Cost note (~$15–25/mo) so users know before promoting.

### 2. Add three new self-contained blocks (module-scope constants)

Interpolate them into the prompt body just after `MIDNIGHTJS_BOOT`, unconditional (all networks benefit):

- **`SIGNING_STRATEGY`** — mini-table:
  - Undeployed → **Lace cannot sign**. Route every write through a TanStack server route `/api/mint` that reuses the same `WalletBuilder` + genesis seed `…0002` as the deploy script; cache the wallet in a module-scope promise; skip Lace-connect and tDUST-balance guards on Undeployed. Add the Cloudflare SSR stub swap for `src/lib/mint.server.ts` → `src/lib/mint.ssr-stub.ts`.
  - Preview / Preprod → Lace `publishKit`.
  - Symptom on Undeployed if you use Lace: proof completes but Lace's "Prove transaction" spins forever or returns "Unexpected error submitting scoped transaction".

- **`ASYNC_BUFFER_CLIENT_ENTRY`** — replace the module-scope `Buffer` polyfill with a custom `src/client.tsx`:
  ```ts
  import { hydrateRoot } from 'react-dom/client';
  import { Buffer } from 'buffer';
  async function start() {
    (globalThis as any).Buffer = Buffer;
    const { StartClient } = await import('@tanstack/react-start/client');
    hydrateRoot(document, <StartClient />);
  }
  start();
  ```
  Wire via `vite.config.ts` → `tanstackStart: { client: { entry: 'client' } }`. Why: Vite dep pre-bundling crawls the Midnight WASM graph and hangs the client entry for minutes on `/.vite/deps/react.js` unless Buffer is polyfilled AFTER hydration path resolves.

- **`OPTIMIZE_DEPS_NO_DISCOVERY`** — the working `optimizeDeps` shape:
  ```ts
  optimizeDeps: {
    noDiscovery: true,
    include: ['react','react-dom','react-dom/client','react/jsx-runtime','react/jsx-dev-runtime','buffer','object-inspect','cross-fetch','@subsquid/scale-codec'],
    exclude: [/* every @midnight-ntwrk/* package */],
  }
  ```
  Do NOT include `@midnight-ntwrk/compact-runtime` in the include list — it re-triggers the WASM crawl. Update the existing `VITE_CONFIG` block accordingly, replacing the current `include` line.

### 3. Add `KIT_FEED_PERSISTENCE` block (indexer exposes state, not tx IDs)

Short paragraph + code sample: persist `txId` locally after `/api/mint` (Undeployed) or `publishKit` (Preview/Preprod) response, render `tx: {hash}` in feed with source labels (`chain` vs `local`), dedupe by `publishedAt` when the indexer catches up.

### 4. Extend `REDFLAGS`

Two extra bullets:
- "Do NOT sign Undeployed writes with Lace — route them through a server `/api/mint`."
- "Do NOT set `nitro: false` on TanStack Start to 'escape SSR' — Worker can't resolve split `assets/react-*.js` chunks. Keep nitro enabled and use the `midnightSsrStub()` swap."

### 5. Wire references

Add the "Fly.io hosting" and "Signing strategy" reference bullets to the "FURTHER REFERENCE" list at the end of `buildVariant`.

### Not in scope
- No changes to route pages, LLM bundle regeneration, or matrix versions — this is a mega-prompt content refresh only. The published `llms-full.txt` regenerates from the same variants at next build.
- No changes to Preview/Preprod-only prompts beyond the shared signing-strategy note.
