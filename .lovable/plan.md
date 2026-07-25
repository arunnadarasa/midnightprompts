
## Goal

Update the Lovable Midnight skill (both copies: `public/skills/lovable-midnight/SKILL.md` and `.agents/skills/lovable-midnight/SKILL.md`) with hard-won lessons from three working agentic-commerce repos:

- `arunnadarasa/agenticmidnight` (A2A/AP2)
- `arunnadarasa/ucpmidnight` (UCP)
- `arunnadarasa/x402midnight` (x402 + Sepolia + EffectStream overlay)

These sessions repeatedly contradicted or extended the current skill. The goal is to fold their fixes in so a future agent doesn't re-burn the same hours.

## New / updated content

### 1. Rewrite the deploy-script canonical shape (biggest correction)

Current skill still shows `WalletBuilder.buildFromSeed` + `NetworkId.Undeployed` enum imported from `midnight-js-network-id`. All three repos found that broken against indexer 4.0.2. Replace with:

- `MidnightWalletProvider` + `@midnight-ntwrk/wallet-sdk@1.2.0` + `@midnight-ntwrk/testkit-js@4.1.1` (NOT `@midnight-ntwrk/wallet@5` — its GraphQL subscriptions like `wallet` / `ProgressUpdate` don't exist on indexer 4.0.2 and every deploy dies with `Unknown field "wallet" on type "Subscription"`).
- `setNetworkId("undeployed")` as a string — `NetworkId` from `midnight-js-network-id` is TYPE-only at 4.1.1, not a runtime enum. The wallet enum lives at `NetworkId.NetworkId.Undeployed` (namespace nesting) inside `wallet-sdk`.
- `CompiledContract.make` + `withWitnesses` + `withCompiledFileAssets`, not `new Contract({...})`.
- Node-side WebSocket polyfill: `import WebSocket from 'ws'; globalThis.WebSocket = WebSocket;`.
- Resolve compiled artefact as `contract/index.js` (Compact 0.31 emits ESM) with `.cjs` only as fallback.
- Required deploy deps to `bun add`: `midnight-js-node-zk-config-provider@4.1.1`, `midnight-js-level-private-state-provider@4.1.1`, `wallet-sdk@1.2.0`, `testkit-js@4.1.1`, `zswap@4.0.0`, `ws`.

### 2. Design deploy for server-append from day one

New non-negotiable subsection: Undeployed writes go through a server route using the genesis wallet, never through Lace in the browser.

- Persist `{ contractAddress, deployTxId, privateStateId, buyerPk }` to `src/data/midnight-contract.undeployed.json`.
- Use **deterministic** `DEPLOYER_SECRET_HEX` (from a shared `src/lib/midnight-shared.ts`), stable `PRIVATE_STATE_ID`, shared `PRIVATE_STATE_STORE` name and `PRIVATE_STORAGE_PASSWORD`. Random values at deploy → server-append can't reconstruct the witness → RpcError 117.
- Deterministic buyer PK: `persistentHash([pad(32,"<domain>:v1"), sk])`.
- Architecture ASCII: `Undeployed: UI → POST /api/public/<verb> → genesis wallet (server) → chain` vs `Other nets: Lace in browser`.
- `privateStateProvider.setContractAddress(contractAddress)` before any get/set.

### 3. Indexer compose config (blocking bug in current skill)

Current `docker-compose.yml` snippet only sets `APP__INFRA__NODE__URL` — indexer 4.0.2 crashes at boot with `missing field secret for key "INFRA"`. Replace snippet with the full `midnight-local-dev/standalone.yml` env: `APP__INFRA__SECRET` (32-byte hex), `APP__APPLICATION__NETWORK_ID=undeployed`, and matching `STORAGE/PUB_SUB/LEDGER_STATE_STORAGE` passwords. GraphQL readiness must use **POST** (`GET` → 405).

### 4. SSR stub gating fix

Current skill mentions `apply: "build"` in one place but shows it without in another. Escalate to a top-level rule: `midnightSsrStub()` and every Midnight-adjacent SSR stub MUST be gated with `apply: "build"`. In `vite dev`, local API handlers otherwise hit the stub and always return `simulated: true`.

### 5. Vite `optimizeDeps.exclude` additions

Add to the mandatory exclude list: `@midnight-ntwrk/testkit-js`, `@midnight-ntwrk/wallet-sdk`, `pino`, `ws`, `ssh2`, `cpu-features` — pulled transitively; dev server hangs on "Loading…" otherwise.

### 6. New failure-mode rows (append to the ranked table)

- `Unknown field "wallet" on type "Subscription"` → wallet@5 vs indexer 4.0.2 mismatch → downgrade to testkit + wallet-sdk 1.2.0.
- `missing field 'secret' for key "INFRA"` → indexer env incomplete → adopt `midnight-local-dev/standalone.yml`.
- `cannot pad "<long>:author:" to length 32` → Compact `pad(32, ...)` domain-separator string must be ≤ 32 UTF-8 bytes → use short forms like `abodc:author:v1`, `ap2:buyer:v1`.
- `disclose("(empty)")` compile error → `Opaque<"string">` cannot be initialised with a `Bytes<N>` literal → drop constructor init.
- `MODULE_NOT_FOUND` on `contract/index.cjs` → Compact 0.31 emits ESM `index.js` → resolve `.js` first.
- API always returns `simulated: true` in dev → `midnightSsrStub()` running on all SSR → gate with `apply: "build"`.
- React "Page Unresponsive" on wallet-connect panels → parent `setState` during render in wallet-bubble components → bubble state via `useEffect` only, never during render.
- RpcError 117 on server-append → random `deployerSecret` at deploy → deterministic secret + shared LevelDB store name/password.
- `NetworkId is not defined` at runtime after import → `NetworkId` from `midnight-js-network-id` is type-only in 4.1.1 → `setNetworkId("undeployed")`.

### 7. Session verdict / "prove writes before polishing UI"

New "Definition of done for Undeployed" callout: before polishing the UI, query the indexer with a POST for `contractAction { entryPoint, transaction { hash, block { height } } }` and confirm your entry point (e.g. `anchorMandate`, `appendEntry`, `anchorChunk`) appears with a real hash. midnight-js `txId` and indexer ledger `hash` are NOT the same string — verify by entry-point + block height, not by SDK-id string match. After `midnight:down/up`: always redeploy and restart Vite (stale address, cached `ctxPromise`, wiped LevelDB).

### 8. New section: EffectStream overlay (from x402midnight)

Short subsection under agentic-commerce:

- EffectStream is an **overlay/sync**, NOT a bridge. Sepolia Circle assets (USDC/EURC/cirBTC) stay on Sepolia; Midnight only stores a chunk anchor via `anchorChunk` on a `StreamingChoreographyIP` contract. Never describe as bridging.
- x402 multi-accept: challenge advertises `midnight-mUSDC` + Sepolia `exact` options simultaneously on `eip155:11155111`. Decimals differ (USDC/EURC=6, cirBTC=8) — convert per asset (`priceMicroUsdToTokenAtomic`).
- Sepolia rail traps: Foundry needs `--broadcast` in correct position (dry-runs silently otherwise); Etherscan V1 endpoints deprecated — use V2 `api.etherscan.io/v2/api?chainid=<id>` + `--skip-is-verified-check`; Infura rejects gas > 2^24 (16,777,216), and MetaMask falls back to 21M when `eth_estimateGas` fails (usually 0 token balance / missing allowance — surface balance BEFORE `writeContract`).
- `/api/public/sepolia-fulfill` must fail loudly if SCIP address missing or `VITE_NETWORK_ID !== "undeployed"`; do not silently return `midnightTxHash: "0xSIMULATED"` as "ANCHORED".

### 9. Update "current working commands" and "key files" cheat sheets

Add the concrete file layout the three repos converged on: `src/lib/midnight-shared.ts` (seed/store/password/deployer secret), `src/lib/midnight-providers.server.ts`, `src/lib/<verb>.server.ts` + `<verb>.ssr-stub.ts`, `src/routes/api/public/<verb>.ts`.

### 10. Cross-references

Because both skill copies must stay in lockstep (they're already almost identical), apply the same edits to `.agents/skills/lovable-midnight/SKILL.md`. Then run `skills--apply_draft .agents/skills/lovable-midnight` so the updated skill is activated in the workspace.

## Files to change

- `public/skills/lovable-midnight/SKILL.md` (user-downloadable copy, referenced from `/llms`)
- `.agents/skills/lovable-midnight/SKILL.md` (draft the agent uses in-editor)

No code, contracts, or UI changes.

## Verification

After edits: `grep -n` the new anchor phrases (`APP__INFRA__SECRET`, `MidnightWalletProvider`, `wallet@5`, `apply: "build"`, `EffectStream`, `Etherscan V2`) in both files to confirm parity; typecheck is unaffected (Markdown only). Ship.
