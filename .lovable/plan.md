## Goal

Add a 4th showcase demo — **Choreo Ledger (Local Undeployed)** — following Midnight DevRel's advice: run the existing Compact ledger contract against a **local undeployed network** (`NetworkId.Undeployed`, standalone proof + indexer + node) instead of Preprod. This sidesteps the current Preprod DUST sync / `1010 InvalidDustSpendProof` / `/check 400` bugs entirely — local network mints unlimited tDUST and uses matching ZKIR versions.

## What "undeployed / local" means here

Per the Midnight docs (llms-full.txt) and the `lovable-midnight` skill:
- `VITE_NETWORK_ID=undeployed` → `NetworkId.Undeployed` in `@midnight-ntwrk/zswap`
- Shielded addresses: `mn_shield-addr_undeployed1…`, unshielded: `mn_addr_undeployed1…`
- Lace labels this network **"Preview"** in its UI, but the bech32 suffix is `undeployed` — the Preview-vs-Preprod mismatch bug the skill warns about
- Node + indexer + proof-server run locally via Docker Compose (the `standalone.yml` from the Midnight examples repo)
- No faucet needed: local node mints tNIGHT/tDUST to genesis addresses on boot

## Deliverables

### 1. Local-network deploy script — `scripts/deploy-midnight-local.mjs`
A copy of `deploy-midnight.mjs` parametrized for `NetworkId.Undeployed`:
- Reads `VITE_INDEXER_URL`, `VITE_INDEXER_WS_URL`, `VITE_PROOF_SERVER_URL`, `VITE_NODE_URL` from a new `.env.local.example` (defaults: `http://localhost:8088/api/v1/graphql`, `ws://localhost:8088/api/v1/graphql/ws`, `http://localhost:6300`, `ws://localhost:9944`)
- Reuses the existing `contracts/managed/timestamp-log` artifacts (same Compact source, no recompile needed)
- Writes result to `src/data/midnight-contract.undeployed.json` following the existing pinning pattern
- Prefix-validates emitted addresses against `mn_addr_undeployed1…` / `mn_shield-addr_undeployed1…` and hard-fails on mismatch (skill's Preview/Undeployed gotcha)

### 2. Docker Compose file — `docker/midnight-standalone.yml`
Copy of the canonical Midnight `standalone.yml` (node + indexer + proof-server on one network), pinned to the same image tags our `midnight-js-*@4.1.1` matrix expects. Includes a healthcheck and the three exposed ports (9944 node, 8088 indexer, 6300 proof-server).

### 3. Deploy CLI wiring — update `scripts/deploy-midnight.mjs`
Add `MIDNIGHT_NETWORK=undeployed` branch that shells into the new local script, so users have one entry point (`bun scripts/deploy-midnight.mjs`) with `MIDNIGHT_NETWORK` selecting `preview | preprod | undeployed`.

### 4. Data pinning — `src/data/midnight-contract.ts`
Extend `NETWORK_IDS` to include `"undeployed"` and add the `undeployed` entry to `CONTRACTS` (matching the shape of `preview`/`preprod`). Explorer URL for local = null (no public explorer) — the UI renders the address as plain code text when explorer is absent.

### 5. New showcase route — `src/routes/showcase.choreo-ledger-local.tsx`
Mirrors `showcase.midnight-ledger.tsx` but:
- Header eyebrow: "Local · Undeployed · Zero-DUST"
- A step-by-step "Run it locally" panel covering:
  1. `docker compose -f docker/midnight-standalone.yml up -d`
  2. `curl http://localhost:6300/health` (sanity)
  3. Add Lace custom network pointing at `ws://localhost:9944` + indexer, switch Lace to it
  4. `MIDNIGHT_NETWORK=undeployed bun scripts/deploy-midnight.mjs`
  5. Reload the page; the deploy status panel and public-ledger reader hydrate from `midnight-contract.undeployed.json`
- Includes the existing `<WalletConnectPanel expectedNetwork="undeployed" />` (already handles any network via its candidate loop)
- Live-reads ledger state from the local indexer URL via the same GraphQL query used on the Preprod demo
- Links to `/known-issues` and calls out that this path bypasses the Preprod DUST bugs

### 6. Showcase index — `src/routes/showcase.index.tsx`
Insert a new card between Midnight Ledger and Move Board:
- Eyebrow: "Local dev · advised by Midnight DevRel"
- Title: "Choreo Ledger (Local)"
- Blurb explains: same Compact contract, `NetworkId.Undeployed`, no Preprod DUST needed, best path for reviewers running the stack today.

### 7. Homepage status — `src/routes/index.tsx`
Add a fourth status row for the local demo (deploy state auto-shows "Awaiting local deploy" until the JSON is populated).

### 8. Known Issues cross-link — `src/routes/known-issues.tsx`
Add a short "Recommended workaround: run local undeployed" callout at the top of the DUST/sync sections, linking to the new showcase route.

## Not in scope

- Not modifying the existing `showcase.midnight-ledger.tsx` (Preprod demo) — it stays as-is for parity comparison.
- Not writing a new Compact contract — reuses `TimestampLog.compact` and its compiled artifacts.
- Not shipping compose logs / node bootstrap docs beyond what fits on the demo page; deep-dive stays in the official Midnight docs, linked out.
- Not attempting to run the local stack from a server function — deploy remains a `bun` script per the `lovable-midnight` skill.
- No changes to the wallet hook — it already iterates candidate networks and will pick up `undeployed` when Lace is on the custom local net.

## Risk

Low-medium. Main risk is version drift between our pinned `midnight-js-*@4.1.1` matrix and whatever image tags the current Midnight standalone compose expects. Mitigation: pin the compose image tags explicitly to the versions that match 4.1.1 (documented on the demo page), and hard-fail the local deploy script if the connected node reports a mismatching runtime version.
