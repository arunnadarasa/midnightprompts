# Learnings from julianariel/m402 (Hack Buenos Aires winner) and how to fold them in

m402 is "x402 on Midnight": an HTTP-402 gateway where the payment carries **no payer**. Its
`docs/constraints.md` is the most rigorously measured set of Midnight platform limits I have seen
publicly, and several items directly contradict or extend what our prompts and skill currently say.

## The learnings worth keeping

**Architecture**
- NIGHT is unshielded, DUST is non-transferable fee gas — neither can be the private payment asset.
  A vault pools NIGHT and mints a **shielded credit 1:1**; deposits/redemptions are public, payments
  between them unlinkable. This is a cleaner justification for our mUSDC "mimic token" rail.
- `pay` takes **no payer argument and reads no caller identity**; it asserts
  `coin.color == tokenType(creditDomain(), kernel.self())` and `coin.value == price`. Privacy is
  "who paid", not "how much" — prices stay public because a marketplace needs a price list.
- Gateway is a **pure reader**: the agent submits its own tx, the gateway watches the indexer for the
  receipt and then dispatches. It never signs, never holds funds, cannot fake a payment.
- `sendShielded` can only pay the caller, so merchants are paid **unshielded via `sendUnshielded`**
  to the address recorded at registration — anyone may call `withdraw`.
- A contract cannot hold a coin in ledger state (its `value` is public and consecutive totals leak
  each payment). Keep only `merchantBalance` public; the pot arrives as a **witness**, and the change
  coin must be persisted off-chain by the caller.
- `pay` cannot mint its own change (compiler rejects the undisclosed mint). Change comes from the
  **wallet balancer** one layer down, so payability is `creditTotal >= price`, not denomination match.
- `disclose()` is only a visibility annotation — selective disclosure needs a commitment on-chain plus
  an off-chain opening encrypted to the auditor.

**Measured numbers (Preview, Aug 2026) that change how we quote cost**
- prove/submit/confirm: `pay` ~23–25s total, split **proof 1.4s / submit 22.5s / chain 1.5s**; proof
  verification ~3.4ms; trivial-contract floor ~19s. Attributing 25s to "ZK proving" is wrong by an
  order of magnitude.
- **Wallet sync dominates**: cold from-seed deposit 687s (644s CPU) vs warm restored **53.8s** (12.4s
  CPU) — 12.8x. Cause: `FluentWalletBuilder` only builds from seed, `appliedIndex === 0` opens the
  subscription with no cursor, so it replays from genesis every invocation. Fix: `serializeState()` /
  `restore()` on all three sub-wallets, **one shared `txHistoryStorage`**, never cache mid-sync.
- `@midnight-ntwrk/testkit-js` costs **~5.2s just to import** — lazy-load it so `--help` and
  `--dry-run` stay fast, and assert a startup budget in tests.

**Failure modes to add to Known Issues / prompts**
- `1010 ... Custom error: 192` (`InputsSignaturesLengthMismatch`) — any circuit touching unshielded
  value needs `signRecipe` after `balanceUnboundTransaction`; shielded-only calls pass without it.
- `1010 ... Custom error: 170` (`InvalidDustSpendProof`) — one wallet cannot submit two txs at once;
  agents must serialize calls, and a rejected submit never settles its promise (wrap in a timeout).
- LevelDB: `midnightDbName` is the **directory**, `privateStateStoreName` is a store inside it.
  Concurrency needs different `midnightDbName`; `LEVEL_LOCKED` otherwise. Seed a fresh store
  (`setContractAddress` then `set(id, emptyPrivateState())`) or you get "No private state found" /
  "Contract address not set". Passing `midnightDbName: undefined` overwrites the default and throws
  on an empty location — spread the key in only when set.
- A sub-wallet's sync fibre can die on a transient indexer WS error while the command waits forever;
  use a **10-minute deadline** (`MIDNIGHT_SYNC_TIMEOUT_MS`) via an explicit race, not 60 minutes.
- Env-file paths resolve against CWD, not the env file — resolve against `dirname(envFile)`.
- **Node 22 or 24 only**; 23/26 fail as `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- Indexer subscriptions replay from genesis, so short listen windows give false negatives.
- No Midnight↔EVM bridge: an EVM relayer is a **trusted operator fronting USDC**, reimbursed from the
  vault — never call it a bridge.

## Proposed changes

1. **Skill** (`.agents/skills/lovable-midnight/SKILL.md` + `public/skills/lovable-midnight/SKILL.md`):
   new section "2026-08 — m402 / private agentic payments (Hack Buenos Aires winner)" carrying the
   vault-credit pattern, gateway-as-reader rule, the four contract-level constraints, the
   cost/sync numbers, and the error-code table (192, 170, LEVEL_LOCKED, ERR_PACKAGE_PATH_NOT_EXPORTED).
2. **Mega-prompts** (`src/lib/mega-prompt-variants.ts`): add an `M402_PAYMENT_RAIL` block and append
   it to `X402_BLOCK`, `UCP_BLOCK` and `A2A_AP2_BLOCK`; extend `AGENTIC_INFRA_LESSONS` with the sync
   cache, lazy testkit import, `signRecipe`, serialize-calls and LevelDB rules; add the new red flags.
3. **Known Issues** (`src/routes/known-issues.tsx`): add entries for error 192, error 170,
   `LEVEL_LOCKED`/private-state seeding, dead sync fibre + deadline, and Node 23/26.
4. **Showcase** (`src/routes/showcase.index.tsx`): add an m402 card linking the repo, the live
   marketplace and the pitch, described as the reference private-payments rail.
5. **x402 demo page** (`src/routes/showcase.x402-midnight-paywall.tsx`): cross-link m402 and correct
   the cost framing to the proof/submit/chain split.
6. Regenerate the per-variant prompt bundles and, on confirmation, the streaming `llms-full.txt`
   (~2.4 GB, externalised via `lovable-assets`) so the downloads match the prompts.

## Technical notes
- No schema or backend changes; text/content plus one showcase card and one nav-free route edit.
- Bundle regeneration uses the existing streaming writer in `scripts/build-llms-full.mjs` to avoid OOM;
  `public/llms-full.meta.json` gets refreshed sizes and timestamps.
