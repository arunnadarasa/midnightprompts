
Update `src/lib/mega-prompt-variants.ts` so the three agentic overlay blocks (A2A_AP2_BLOCK, UCP_BLOCK, X402_BLOCK) inline every rule from the freshly-updated Lovable Midnight skill. Each block stays self-contained — a hackathon participant pasting a single prompt should never have to open the skill file.

## Scope (only these three blocks + one shared appendix)

No other blocks change. `FRONTEND_STANDARDS`, `MAINNET_ACQUIRE`, deploy scripts, and Docker/undeployed sections are already current.

## New shared appendix (define once, append to all three overlay blocks)

`AGENTIC_INFRA_LESSONS` — pinned truths from agenticmidnight / ucpmidnight / x402midnight sessions:

1. **SDK ↔ indexer alignment**: local `indexer-standalone:4.0.2` requires `MidnightWalletProvider` + `wallet-sdk@1.2.0` + `testkit-js@4.1.1` + `midnight-js-*@4.1.1`. Never `@midnight-ntwrk/wallet@5` — its GraphQL subscriptions (`wallet`, `ProgressUpdate`, `ViewingUpdate`) don't exist on 4.0.2 and every deploy dies with `Unknown field "wallet" on type "Subscription"`. Polyfill `globalThis.WebSocket = ws` in every Node deploy script.
2. **`NetworkId` is type-only at 4.1.1** — call `setNetworkId("undeployed")`. Runtime enum lives on wallet-sdk as `NetworkId.NetworkId.Undeployed` (namespace nesting).
3. **Compiled artefact resolution**: Compact 0.31 emits ESM `contract/index.js`; resolve `.js` first, `.cjs` only as fallback.
4. **Full `midnight-local-dev/standalone.yml` compose env** (not just `APP__INFRA__NODE__URL`): include `APP__INFRA__SECRET` (32-byte hex), `APP__APPLICATION__NETWORK_ID`, matching `STORAGE`/`PUB_SUB`/`LEDGER_STATE_STORAGE` passwords, and `APP__INFRA__SPO_NODE__BLOCKFROST_ID` placeholder. Indexer 4.0.2 crashes at boot without them. GraphQL readiness = POST (GET → 405).
5. **Server-append architecture is mandatory on Undeployed**: UI → POST `/api/public/<verb>` → genesis wallet (seed `…0002`, NOT `…0001`) → chain. Other networks defer to Lace `publishKit`. Put shared constants in `src/lib/midnight-shared.ts`: `GENESIS_SEED`, deterministic `DEPLOYER_SECRET_HEX` (never random), stable `PRIVATE_STATE_ID`, shared LevelDB store name + password ≥ 3 char classes, deterministic buyer/merchant PK derivation. Both `scripts/deploy-midnight.mjs` and every `*.server.ts` handler import from the same file.
6. **`providers.privateStateProvider.setContractAddress(contractAddress)` before every get/set** — skipping this causes `RpcError 117` at append time.
7. **Persist deploy metadata** to `src/data/midnight-contract.undeployed.json`: `{ contractAddress, deployTxId, privateStateId, buyerPk, network }`.
8. **`levelPrivateStateProvider` at 4.1.1** requires a **function** password provider and an `accountId`. The old `{ get: async () => … }` on the outer providers bag is outdated and fails silently.
9. **Vite config**:
   - SSR stubs (`midnightSsrStub()`) MUST be gated with `apply: "build"`. Without the gate, `vite dev` local API handlers hit the stub and `/api/public/<verb>` silently returns `{ simulated: true, midnightTxHash: "0xSIMULATED" }` — a bug, not a demo mode.
   - `optimizeDeps.exclude`: `testkit-js`, `wallet-sdk`, `midnight-js-*` (contracts, http-client-proof-provider, indexer-public-data-provider, node-zk-config-provider, level-private-state-provider, network-id, utils), `wallet`, `compact-runtime`, `onchain-runtime-v3`, plus transitives `pino`, `ws`, `ssh2`, `cpu-features`. Missing entries hang `vite dev` on "Loading…".
10. **Compact gotchas**: `pad(32, "<domain>:v1")` — the string must be ≤ 32 UTF-8 bytes (`ap2:buyer:v1`, `ucp:merchant:v1`, `musdc:signer:v1`, `abodc:author:v1`). Never initialise an `Opaque<"string">` ledger field with a string literal in `constructor()` — literals are `Bytes<N>` and the compiler rejects it. Drop the init.
11. **UI stability**: never call parent `setState` during render in wallet-bubble panels. Chrome "Page Unresponsive" is the tell. Bubble via `useEffect` only.
12. **Acceptance rule**: verify Undeployed writes via indexer GraphQL `contractAction { entryPoint transaction { hash block { height } } }`, not by string-matching the midnight-js `txId` (they are different strings — both real). Never accept `0xSIMULATED` as success. After every `midnight:down`/`up` cycle: redeploy AND restart Vite (LevelDB wiped, `ctxPromise` cached).
13. **Required Node deps for the deploy script** (each must be `bun add`-ed — Vite dep resolution does NOT apply to Node scripts): `@midnight-ntwrk/midnight-js-contracts@4.1.1`, `midnight-js-node-zk-config-provider@4.1.1`, `midnight-js-level-private-state-provider@4.1.1`, `midnight-js-http-client-proof-provider@4.1.1`, `midnight-js-indexer-public-data-provider@4.1.1`, `midnight-js-utils@4.1.1`, `wallet-sdk@1.2.0`, `testkit-js@4.1.1`, `zswap@4.0.0`, `ws`.

## Additions specific to each block

**A2A_AP2_BLOCK** (buyer↔seller negotiation → AP2 anchor):
- Add explicit A2A 0.3 JSON-RPC envelope shape and status machine (`submitted → working → input-required → completed|rejected|failed`).
- Domain separator hard-fixed to `ap2:buyer:v1` (≤ 32 bytes). Buyer PK derivation exactly `persistentHash<Vector<2, Bytes<32>>>([pad(32, "ap2:buyer:v1"), sk])`.
- Never reuse `ucp:merchant:v1` for AP2 signing (cross-verifier failures).
- Explicit warning: cross-verifying AP2 mandates against EVM EIP-712 verifiers won't work — buyer keys are Compact-witness derived.

**UCP_BLOCK** (RFC 9421 signed checkout → OrderLedger anchor):
- Emphasise `recordSigningKey` MUST be called once on first boot from a bootstrap route or the deploy script; a receipt whose signature verifies but whose on-chain fingerprint is empty = the app skipped bootstrap.
- Add `ucp-self-test.ts` conformance route spec.
- Domain separator `ucp:merchant:v1`.

**X402_BLOCK** (mUSDC pay-per-call + EffectStream overlay):
- Keep existing scheme/network CAIP rules.
- Add **EffectStream as sync overlay, not bridge**: Sepolia Circle assets (USDC/EURC/cirBTC) stay on Sepolia; Midnight only stores the chunk anchor via `anchorChunk` on `StreamingChoreographyIP`. UI copy MUST NOT describe this as bridging USDC onto Midnight.
- x402 v2 envelope stays `{ x402Version: 2, accepted, payload: { signature, authorization } }`, wrapped under `accepted` — never v1 top-level `{scheme, network, payload}` (PayAI rejects as `invalid_payload`).
- **Multi-accept**: challenge advertises `midnight-mUSDC` on `midnight:undeployed` AND Sepolia `exact` on `eip155:11155111` simultaneously so the client picks a rail.
- Per-asset decimals: USDC/EURC = 6, cirBTC = 8. Use `priceMicroUsdToTokenAtomic(asset, priceMicroUsd)`.
- Sepolia deploy/verify rules: Foundry `forge create` silently dry-runs without `--broadcast`; always confirm on the explorer. Etherscan V1 hosts are deprecated — verify with V2 (`--verifier-url https://api.etherscan.io/v2/api?chainid=11155111 --skip-is-verified-check`).
- Infura rejects `gas > 2²⁴` (16 777 216). MetaMask falls back to 21M when `eth_estimateGas` fails (usually 0 balance / no allowance). Surface `balance ≥ required` AND allowance before `writeContract`; map RPC gas-cap errors to "estimation failed; check balance".
- `/api/public/sepolia-fulfill` MUST return HTTP error when SCIP JSON is missing or `VITE_NETWORK_ID !== "undeployed"` — never `midnightTxHash: "0xSIMULATED"` with `success: true`.
- Two wallets, two networks: Sepolia → MetaMask + Circle faucet. Undeployed writes → server genesis wallet. Never conflate.
- Anti-replay: `spent_nonces: Set<Bytes<32>>` on-chain PLUS fresh client-side `crypto.getRandomValues(new Uint8Array(32))` per attempt.
- Facilitator MUST be idempotent per nonce; concurrent retries against the same nonce return the first result.

## Common failure-mode table appended to each block

Roll the relevant subset of the skill's failure-mode table into each block so a lone prompt is self-diagnostic: `Unknown field "wallet"` / `missing field 'secret'` / `cannot pad "…"` / `disclose("(empty)")` / `MODULE_NOT_FOUND index.cjs` / `NetworkId is not defined` / `simulated: true` in dev / RpcError 117 / indexer POST 405 / Page Unresponsive / `0xSIMULATED` UI success / Etherscan `Invalid API Key` V1 / `gas limit too high (cap: 16777216, tx: 21000000)` / `forge create` succeeded but nothing on-chain.

## Implementation

Single edit: rewrite the three block string literals + insert `AGENTIC_INFRA_LESSONS` above them and append it to each. Prompts will grow substantially (est. +8–12 KB total) — the user has explicitly authorised long prompts. Bundle output files (`public/mega-prompt-*.txt`) regenerate automatically on next build; no source data or route changes.

## Verification

After the edit: `grep -n "AGENTIC_INFRA_LESSONS\|apply: \"build\"\|MidnightWalletProvider\|GENESIS_SEED\|EffectStream\|indexer POST\|0xSIMULATED" src/lib/mega-prompt-variants.ts` should show the new phrases inside all three blocks. Build passes automatically.

Nothing else in the app changes.
