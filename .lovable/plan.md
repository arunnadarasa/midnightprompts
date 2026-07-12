## Goal

Capture the Midnight-team Discord Q&A screenshots as an in-app "Known issues" reference so future users hitting the same failure modes (Preprod DUST sync, DustSpendProcessed decode errors, 0.31 ZKIR /check rejection, `1010 InvalidDustSpendProof`, tDUST-vs-tNIGHT gotcha, currentBlockTime roadmap) land on a page with the workaround instead of trial-and-error.

## New route: `src/routes/known-issues.tsx`

One dedicated page, linked from the showcase index and both showcase demos. Content pulled verbatim (paraphrased short-form) from the screenshots, attributed to "Midnight team via Discord, July 2026".

Sections (each = a short card: title · symptom · cause · workaround · source):

1. **Preprod fresh-wallet sync never completes** — 7.5h without finishing + OOM = struggling, not just slow. Workarounds: use Preview for benchmarking; pin to Preprod row on the support matrix; ensure indexer at chain tip; `NODE_OPTIONS=--max-old-space-size=8192`.
2. **`DustSpendProcessed` ledger event decode failures** — wallet-sdk ↔ ledger/indexer event-format mismatch on Preprod. Re-pin `wallet + ledger + midnight-js + proof-server` from the Preprod support-matrix row in one pass; resync fresh wallet dir.
3. **DUST regeneration caps concurrent settlement** — `InsufficientFunds: could not balance dust` after ~3 concurrent txs. Workarounds: serialize submits per wallet (or 1–2 in flight); pre-warm DUST; use multiple wallets for parallel lanes.
4. **Prove + submit coupled, submit hangs without timeout** — decouple: `createUnprovenCallTx → proofProvider.proveTx → walletProvider.balanceTx → midnightProvider.submitTx`. Add app-level timeouts around submit.
5. **`1010 Custom error: 170 = InvalidDustSpendProof`** — stale DUST proof. Common causes: pruned Merkle roots, indexer lag, version mismatch. Try: fresh resync before submit, compare indexer height vs RPC tip, pin full stack to Preprod matrix, retry only after sync completes.
6. **`/check 400 bad input` on callTx (deploy works, callTx fails)** — proof-server `/check` deserializer rejecting the ZKIR/wrapped-ir wire format on Compact 0.31.0. Workaround: temporarily point `httpClientProofProvider` at the public prover `https://lace-proof-pub.preprod.midnight.network` to isolate client vs server; bisect the reworked op (`decimals Uint<8>`, secret-key → owner-id conversion); note upstream fix "coming in a later release" per 0.31.0 toolchain notes.
7. **Preprod matrix (current docs, July 2026)** — bulleted list: `ledger-v8: 8.0.3`, `proof-server: 8.0.3` (must match ledger tag), `compact: 0.5.1 / toolchain 0.31.1`, `compact-runtime: 0.16.0`, `compact-js: 2.5.1`, `midnight-js-*: 4.1.1`, `onchain-runtime-v3: 3.0.0`. Wallet SDK: align to matrix row (don't mix facade 4.x + dust 4.x + shielded 3.x). Link to `https://docs.midnight.network/relnotes/support-matrix`.
8. **Preprod public RPC** — `https://rpc.preprod.midnight.network` (HTTP) + `wss://rpc.preprod.midnight.network` (WS). Alternatives: Blockfrost (API key), self-hosted `midnight-node`, or Preview WS `wss://rpc.preview.midnight.network` if you can switch networks. Includes the `chain_getHeader` curl smoke-check.
9. **currentBlockTime() roadmap** — no public in-circuit readable block time/height today (only `blockTime*` comparators). Feedback via Midnight Service Desk if settlement flows need it.

Each card ends with a `[Service Desk ↗]` link to `https://midnightntwrk.github.io/servicedesk/` for the ones the team routed to a ticket. Page head: title/description reflecting "Known issues on Midnight Preprod — July 2026 snapshot" so it stays date-scoped.

## Wire-up

- `src/routes/showcase.index.tsx`: add a small linked card at the bottom pointing to `/known-issues`.
- `src/routes/showcase.midnight-ledger.tsx` and `src/routes/showcase.programmatic-dust.tsx`: one-line inline callout ("Hit a `1010` error or `DustSpendProcessed` decode? → Known issues") linking to `/known-issues`.
- `src/routes/__root.tsx` nav / footer: no change (keep the page discoverable via showcase, not top-nav clutter).

## Not in scope

- No changes to `scripts/dust-demo-preprod.mjs` (the underlying SDK bugs are on Midnight's side; documenting is the fix we can ship).
- Not appending this to the mega-prompts (they're per-idea implementation prompts, not a Midnight status page).
- No route/component refactor.

## Verification

- Visit `/known-issues` → all 9 sections render, links to Service Desk and support-matrix open in new tab.
- `/showcase`, `/showcase/midnight-ledger`, `/showcase/programmatic-dust` each surface a link into `/known-issues`.
- SEO head: unique title/description; single H1; no og:image (leave to platform default).
