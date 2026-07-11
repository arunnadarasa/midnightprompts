## What we know from the last run

- DUST public key on the wallet **matches** the seed-derived key. ✓
- 1 NIGHT UTXO is visible and `registeredForDustGeneration=true`. ✓
- `shielded` and `unshielded` sync went strictly complete. ✓
- `dust.isStrictlyComplete` **never flipped true** in 10 min, and balance stays `0`.
- Meanwhile Lace (same seed) shows ~471 tDUST.

That combination means the wiring is correct; the SDK's DUST indexer stream on Preview is just not converging for our wallet instance. Gating on `isStrictlyComplete` was the wrong stop condition — Lace clearly doesn't wait for it either.

## Answer to the question

**No, don't add programmatic DUST generation.** The docs page "generating DUST programmatically" is about registering NIGHT for DUST generation — we already did that (`registeredForDustGeneration=true`). It won't produce more DUST or make the SDK see the existing DUST any faster. The problem is DUST *sync visibility*, not DUST *supply*.

## Plan

Two small, low-risk changes to `scripts/deploy-midnight.mjs`, then re-run.

### 1. Stop gating on `dust.isStrictlyComplete`

Preview's DUST stream doesn't reliably converge, but the balance is queryable well before that. Change the wait loop to finish as soon as **either**:

- `state.dust.balance(new Date()) > 0`, **or**
- `shielded.isStrictlyComplete && unshielded.isStrictlyComplete` and we've polled for ≥ 3 min (give DUST a chance, then move on).

Keep the 10-min hard cap and the per-10s log.

### 2. If balance is still 0 after the loop, try to proceed anyway

Right now we hard-fail with "balance 0". Since NIGHT is registered and the key matches, add an env override:

```
MIDNIGHT_ALLOW_ZERO_DUST=1 VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

When set, log a loud warning and continue into `deployContract`. One of two things happens:

- **Deploy succeeds** → the SDK's cached balance was stale; we're done and we know for future runs to skip the gate.
- **Deploy fails with "insufficient DUST"** → confirms Lace's tDUST really is under a different DUST key than the SDK derives (despite the pubkey printout matching), and the fix is to send tNIGHT from Lace → our unshielded address so this wallet generates its own DUST from scratch. We'll handle that in a follow-up only if it happens.

### Not doing

- No programmatic DUST generation call (already registered).
- No seed changes, no Lace changes, no Docker changes.
- No re-derivation — key match is confirmed.

### Files touched

- `scripts/deploy-midnight.mjs` — relax the sync gate; add `MIDNIGHT_ALLOW_ZERO_DUST` bypass.
- `.lovable/plan.md` — replace with this plan.

### Next command for you

After I apply the change:

```
VITE_NETWORK_ID=preview MIDNIGHT_ALLOW_ZERO_DUST=1 bun scripts/deploy-midnight.mjs
```
