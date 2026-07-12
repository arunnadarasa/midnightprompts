## Goal

Add two more first-hand references to `/known-issues` sourced from the July 2026 Midnight team Discord replies in the uploaded screenshots. Keep the existing 9 sections; append/enrich rather than restructure.

## Changes to `src/routes/known-issues.tsx`

### 1. New section: "Lace shows DUST but SDK reports 0 / unshielded never syncs" (Nasihudeen Jimoh, 30/06/2026)

Confirmed **known Preprod pattern**: Lace can display DUST while `DustWallet.balance() = 0` and/or the unshielded leg never finishes syncing. If the SDK dust leg doesn't reach tip, deploys fail with "no fee DUST" even though Lace looks funded. Tracked by the team; wallet-SDK fixes in progress.

Things to try (verbatim from the reply):
1. Pin packages to the support matrix
2. Preprod indexer v4: `https://indexer.preprod.midnight.network/api/v4/graphql` + `wss://indexer.preprod.midnight.network/api/v4/graphql/ws`
3. Wallet config workaround: `batchUpdates: { size: 5000, timeout: 1, spacing: 4 }`
4. `NODE_OPTIONS="--max-old-space-size=8192"`
5. Confirm SDK uses the **same seed** as Lace (different seed = different wallet)
6. Only read DUST **after full sync on all legs**

Fallback: local undeployed (`create-mn-app` / local docker network) while Preprod sync is rough. Link to Service Desk.

### 2. New section: "/check 400 — 0.31 ZKIR serialization gap (engineering-team issue)" (Nasihudeen Jimoh, 03/07/2026)

Engineering-confirmed: it's a **client/server `/check` serialization gap for 0.31 ZKIR**, not user error or version drift. Ruled out by Lace-vs-httpClientProofProvider comparison against the same 8.0.3 public prover — Lace's wallet-delegated proving of the exact same callTx succeeds, while `httpClientProofProvider`'s `createCheckPayload(preimage, keyMaterial.ir)` is rejected.

Action: open Service Desk ticket with two linked issues:
- **/check bad input**: include that deploy/create_market work, register_asset fails, `Uint<64>` widen didn't fix (→ second reworked op), `check()` isn't skippable (stub → WASM unreachable), latest stable provider is 4.1.1. Ask which prover parses 0.31 ZKIR on `/check`, ETA for the ZKIR-format fix from 0.31.0 notes, and the precise list of reworked ops to avoid on 8.0.3.
- **Matrix conflict**: ledger-v8 8.0.3 (matrix) vs wallet-sdk-dust-wallet 4.1.0 needing 8.1.0's `Transaction.addIntent`. Ask for the coherent wallet-sdk set for the 8.0.3 row.

Also note `lace-proof-pub.preprod.midnight.network` from COMPATIBILITY.md doesn't resolve publicly.

### 3. Cross-link both new sections

- Reference the existing sections they overlap with (Section 1 links to the OOM/support-matrix section; Section 2 links to the existing `/check 400` section and to the support-matrix section).
- Add a top-of-page callout: "Sourced from Midnight team replies in Discord (June–July 2026) and the public support matrix."
- Link the Service Desk (`https://midnightntwrk.github.io/servicedesk/`) inline in both new sections.

## Out of scope

- No SDK changes, no mega-prompt changes, no route/component refactor.
- No screenshots embedded — text-only references with attribution ("Midnight team, Discord, DD/MM/2026").
