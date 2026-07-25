# Plan: flymidnight learnings + Undeployed (Fly.io) mega-prompt variant

## Scope

Two independent workstreams driven by the flymidnight repo + Cursor session notes:

1. **Update the Lovable Midnight skill** with new hard-won lessons from `arunnadarasa/flymidnight`.
2. **Add a 5th network variant** — `undeployed-fly` — to the mega-prompt matrix. With ~1,996 ideas × 3 OS = **~5,988 new prompts** (your 6,000 estimate is right).

Nothing else changes: existing Preview / Preprod / Undeployed (local) / Mainnet variants stay as-is.

---

## Workstream 1 — Skill update (`public/skills/lovable-midnight/SKILL.md` + `.agents/skills/lovable-midnight/SKILL.md`)

Add a new subsection under the existing "Fly.io hosted stack" area capturing the flymidnight learnings. Key rules to encode:

- **Wallet readiness must use the Facade shape (testkit-js 4.1.1)** — legacy `state.syncProgress.synced` / `state.balances` / `state.address` never resolve. Use `state.dust.state.progress.isStrictlyComplete()`, `state.dust.balance(new Date())`, `keystore.getBech32Address().asString()`. Fix required in BOTH `fly/mint/server.mjs` and `scripts/deploy-midnight.mjs` `waitForWalletReady`.
- **`subscribeRuntimeVersion 1000 Normal Closure` on Fly 6PN is non-fatal** — do not chase it; `wallet.start()` still returns and dust syncs.
- **Stale contract address trap** — UI must prefer `VITE_DEFAULT_CONTRACT` over `localStorage`; overwrite stale localStorage on env change; wrap `findDeployedContract` in a 60s timeout so bad addresses fail loudly instead of hanging "looking up contract…" for minutes.
- **`choreo-mint` app pattern** — the 4th Fly app that holds the genesis seed and exposes `/mint` for mobile-friendly minting without Lace/tDUST. Add it alongside the existing `choreo-node` / `choreo-indexer` / `choreo-proof` trio in the "Fly.io hosted stack" table.
- **Retrospective one-liner** (verbatim from Cursor notes): "Undeployed works when indexer env matches `midnight-local-dev`, the wallet stack matches the indexer GraphQL schema, and append reuses the same private-state store as deploy — everything else is noise."
- Any other rows the uploaded `Cursor_Input_4.md` names once I read it in full during build mode.

Then run `skills--apply_draft` to activate the updated `.agents/skills/lovable-midnight/`.

---

## Workstream 2 — `undeployed-fly` mega-prompt variant (~6,000 new prompts)

### Wiring

- Add `"undeployed-fly"` to the `Network` union in `src/lib/mega-prompt-variants.ts` (currently `preview | preprod | undeployed | mainnet`).
- Add matching entries in every per-network map: `SECRETS`, banner config, signing-strategy row, disclaimer inclusion (none — Fly hosted is not "mainnet-risky"), etc.
- Update `buildMegaPrompt` to branch: Fly variant uses the **hosted** Fly stack URLs instead of `localhost` and instructs the user to deploy via `flyctl` rather than local Docker.

### `SECRETS.undeployed-fly` template

```
VITE_NETWORK_ID           undeployed
VITE_INDEXER_URL          https://choreo-indexer.fly.dev/api/v4/graphql
VITE_INDEXER_WS_URL       wss://choreo-indexer.fly.dev/api/v4/graphql/ws
VITE_PROOF_SERVER_URL     https://choreo-proof.fly.dev
VITE_NODE_WS              (internal only — never exposed; deploy runs from a 6PN Fly Machine)
VITE_MINT_URL             https://choreo-mint.fly.dev   (server-append endpoint, holds genesis seed)
VITE_DEFAULT_CONTRACT     hex printed by the Fly deploy machine
```

### New per-network blocks appended to the prompt

- **`FLY_BOOTSTRAP`** — condensed bring-up order from the existing skill (node prove-blocks-first, indexer IPv6 bind `"::"`, proof-server 2GB, faucet/mint on 0.0.0.0, cost note).
- **`FLY_DEPLOY_FROM_6PN`** — `scripts/fly-deploy-contract.sh` recipe; explains the deploy script CANNOT run from the Lovable sandbox.
- **`CHOREO_MINT_SERVER`** — server-append pattern for mobile users without Lace: Fastify/http server on Fly reading `MINT_SEED`, `/health` returning the Facade-shape readiness, `/mint` POST that reuses the same `PRIVATE_STATE_STORE` constant as deploy.
- **`FLYMIDNIGHT_LESSONS`** — the 4 flymidnight-specific traps (Facade readiness shape, `1000 Normal Closure` red herring, stale-contract-address, `findDeployedContract` 60s timeout).

### OS-block reuse

`macos` / `windows` / `linux` blocks stay the same — Fly variants swap "install Docker" for "install `flyctl`" via a small OS-scoped override.

### Math check

- 1,996 ideas × 3 OS = **5,988 prompts** for the new variant.
- Total after this change: (Preview 5,988) + (Preprod 5,988) + (Undeployed-local 5,988) + (Mainnet hidden 5,988) + (Undeployed-Fly 5,988) ≈ **29,940 prompts**.

### UI

- Add a 5th tab **"Undeployed (Fly.io)"** to the network toggle in `src/routes/ideas.$id.tsx`. Same tab styling as the existing four; slot it right after Undeployed (Local) so the flow reads *Preview → Preprod → Undeployed (Local) → Undeployed (Fly.io) → Mainnet (hidden)*.
- Copy label in the tab description: **"Hosted standalone stack on Fly.io. No Docker on your laptop, real Midnight tx, sharable public demo."**
- Bump `.lovable/plan.md` and the LLM bundle rebuild step (`scripts/build-llms-full.mjs`) if it counts variants.

---

## Technical notes

- `mega-prompt-variants.ts` already externalizes large text via `lovable-assets`; the new variant multiplies bundle size ~25% and needs the same externalization treatment to avoid Cloudflare Worker 1102 memory limit.
- Nothing here touches business logic in shipped demos (`showcase.*`) — the flymidnight showcase card already exists at `https://flymidnight.lovable.app/` if you later want to add it to `showcase.index.tsx` (out of scope for this plan; ask if desired).
- I'll read `user-uploads://Cursor_Input_4.md` (188 lines) in full before implementing, so every documented trap lands in the skill and the `FLYMIDNIGHT_LESSONS` block.
