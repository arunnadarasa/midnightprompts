# Plan — Agentic Commerce on Midnight (v4, no toggle)

Got it — "Base" was ambiguous, sorry. No toggle. The new protocol prompts sit alongside the existing base prompts and are reachable via a **protocol filter** on the ideas list.

## Prompt math (unchanged from v3)

| Bundle | Ideas | × networks | × OS | New prompts |
| --- | --- | --- | --- | --- |
| A2A + AP2 (combined) | 500 | 3 | 3 | 4,500 |
| UCP | 250 | 3 | 3 | 2,250 |
| x402 / mUSDC mimic / facilitator | 250 | 3 | 3 | 2,250 |
| **Agentic subtotal** | **1,000** | — | — | **9,000** |
| Existing base prompts | 1,000 | 3 | 3 | 9,000 |
| **Grand total visible** | — | — | — | **18,000** |

Mainnet stays hidden per DevRel.

## How each protocol writes to Midnight

Every new prompt mandates at least one Compact-contract call on the selected network.

| Bundle | On-chain action | Compact contract |
| --- | --- | --- |
| **A2A + AP2** | `anchorMandate(cartHash, buyer, seller, amount)` on `MandateVault.compact`; optional mUSDC transfer for settlement demos | `contracts/MandateVault.compact` |
| **UCP** | `recordOrder(orderId, itemHash, buyer, amount)` on `OrderLedger.compact`; discovery + self-test stay off-chain | `contracts/OrderLedger.compact` |
| **x402** | `transfer(from, to, amount)` on `MidnightUSDC.compact` (mimic token); facilitator returns Midnight tx hash in `PAYMENT-RESPONSE` | `contracts/MidnightUSDC.compact` |

All three contracts are new, Undeployed-first, deployed via new scripts modeled on `scripts/deploy-midnight.mjs`. Every agentic prompt includes an `ExperimentalAgenticBanner` + README disclaimer: "mUSDC is a mimic token — no peg, no value. Contracts are unaudited. Hackathon use only."

## x402 facilitator — Optimism Catalyst baseline

Ported from `@project:d20ab1d5` ("Optimism Blockchain Catalyst"). Reused shape: v2 envelope (`{ x402Version:2, accepted, payload:{ signature, authorization } }`), literal-cased `PAYMENT-SIGNATURE`/`PAYMENT-RESPONSE` headers, same-origin proxy route, on-chain-read domain fields, per-request nonce.

Midnight-specific adaptations:
- **Scheme** = `midnight-mUSDC`, network id = `midnight:preview|preprod|undeployed`.
- **Signature** = Compact-witness authorization (address + amount + nonce + expiry) returning `{ proof, publicInputs }` for the `MidnightUSDC.transfer` circuit — replaces EIP-712.
- **Settlement** = server wallet submits the transfer (Preview/Preprod) or the local genesis wallet via `/api/append-entry` (Undeployed).
- **`PAYMENT-RESPONSE`** = `{ success, midnightTxHash, network, payer, indexerUrl }`.

## Ideas + filter (no toggle)

- `src/data/ideas.ts` gains three arrays: `a2aAp2Ideas` (500), `ucpIdeas` (250), `x402Ideas` (250). Each entry: `slug`, `title`, `oneLiner`, `protocol`, `expectedMidnightTx`, `personaHint`.
- Existing `ideas` array untouched; the four are concatenated for the master list.
- Add `ProtocolFilter = "all" | "a2a-ap2" | "ucp" | "x402"` and a filter chip row on `/ideas`:

```
Show:  [ All ]  [ A2A + AP2 ]  [ UCP ]  [ x402 ]      Experimental (agentic)
```

Selecting a chip narrows the list; "All" (default) shows base + agentic together. The idea detail page renders the correct prompt based on the idea's own `protocol` field — nothing to toggle.

## LLM bundle build

- `scripts/build-llms-full.mjs` adds an inner loop over the three protocol arrays.
- **27 new bundles**: `llms-prompts-<net>-<os>-<protocol>.txt` (3 × 3 × 3), externalized via `lovable-assets`.
- `llms-full.txt` regenerated with protocol variants appended per idea.
- `llms-full.meta.json` gains `protocols` and `ideasByProtocol`.
- `/llms` page gets an "Agentic layers" section with the 27 files + a short "which one do I want?" explainer.

## Three new showcase demos

- **`/showcase/a2a-ap2-negotiation`** — buyer↔seller A2A `message/send` loop; final CartMandate anchored via `MandateVault.anchorMandate`; panel shows transcript + Midnight tx hash.
- **`/showcase/ucp-zk-checkout`** — UCP discovery + RFC 9421 signed request + `OrderLedger.recordOrder`; side-by-side signed-headers view and Midnight tx hash.
- **`/showcase/x402-midnight-paywall`** — "Pay 1 mUSDC to unlock." 402 → sign → retry → settle, Midnight tx hash in `PAYMENT-RESPONSE`.

All three share `ExperimentalAgenticBanner` and fall back to `simulated: true` when contracts aren't deployed / no proof server is running.

## Files touched

- `src/data/ideas.ts` — three protocol arrays (500 / 250 / 250) + `Protocol` field on each entry.
- `src/lib/mega-prompt-variants.ts` — three protocol blocks (contract source pointer, deploy script pointer, Undeployed funding recipe, banner + README disclaimer). `buildVariant` reads `idea.protocol` and picks the block automatically.
- `src/routes/ideas.index.tsx` — protocol filter chip row.
- `src/routes/ideas.$id.tsx` — render protocol-specific prompt; no toggle.
- `src/routes/llms.tsx` — agentic bundle links + explainer.
- `scripts/build-llms-full.mjs` — protocol inner loop.
- New: `src/components/ExperimentalAgenticBanner.tsx`, `src/routes/agentic-experimental.tsx`.
- New contracts: `contracts/MidnightUSDC.compact`, `contracts/MandateVault.compact`, `contracts/OrderLedger.compact`.
- New deploy scripts: `scripts/deploy-musdc.mjs`, `scripts/deploy-mandate-vault.mjs`, `scripts/deploy-order-ledger.mjs`; each writes per-network JSON to `src/data/`.
- New TSS routes under `src/routes/api/public/`: `x402-challenge.ts`, `x402-verify.ts`, `x402-settle.ts`, `x402-proxy.ts`, `ap2-anchor.ts`, `ucp-order.ts`.
- New showcase routes (three) + `src/routes/showcase.index.tsx` cards.
- New helpers: `src/lib/x402-midnight.ts`, `src/lib/ap2-mandate.ts`, `src/lib/ucp-client.ts`.
- `src/components/site-shell.tsx` — nav entry under "Learn ▾".
- `public/skills/lovable-midnight/SKILL.md` — append "Agentic layers on Midnight" section, including the Optimism Catalyst → Midnight facilitator port notes.

## Rollout order

1. Three Compact contracts + deploy scripts + per-network JSON.
2. Facilitator + anchor server routes with `simulated: true` fallback.
3. Client helpers and `ExperimentalAgenticBanner` + `/agentic-experimental`.
4. Idea arrays (500 / 250 / 250) + protocol filter chip on `/ideas`.
5. Prompt-block generator wired to `idea.protocol`.
6. Three showcase demos: x402 → A2A+AP2 → UCP.
7. LLM bundle build loop + `/llms` links.
8. `SKILL.md` append, showcase index cards, nav entry.
9. Regenerate bundles, verify counts (18,000 visible).

## Out of scope

- Real USDC, bridges, fiat on-ramps.
- Mainnet UI variants.
- Formal AP2 / x402 conformance certification.
- An agentic on/off toggle (protocol is a property of the idea itself; filter is enough).