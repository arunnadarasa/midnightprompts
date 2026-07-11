## What the diagnostic tells us

Good news — everything is wired correctly:

- **DUST key matches** the seed-derived key (no HD path bug).
- **NIGHT UTXO is registered** for DUST generation (`registeredForDustGeneration=true`).
- **Unshielded sync is complete**, so the script *can* see your funded NIGHT.

The only red flag:

```
dust sync isStrictlyComplete: false
shielded sync isStrictlyComplete: false
```

The wallet hasn't finished replaying the Preview ledger's DUST stream yet. The script currently gives up after ~80s, but on Preview the initial DUST sync from a fresh wallet instance regularly takes **several minutes** — the DUST balance is computed from a time-series of generation events, not a single UTXO lookup. Until `dust.isStrictlyComplete` flips to `true`, `state.dust.balance(new Date())` is expected to read `0`.

## What to do next

### Step 1 — Extend the sync window and gate on `isStrictlyComplete`

Patch `scripts/deploy-midnight.mjs` so the wallet-sync loop:

1. Waits until `state.dust.state.progress.isStrictlyComplete()` **and** `state.shielded.progress.isStrictlyComplete()` are both true (or a 10-minute hard cap), instead of just polling the balance for 80s.
2. Logs `dust isStrictlyComplete` / `shielded isStrictlyComplete` every 10s so progress is visible.
3. Only after strict-complete, reads `state.dust.balance(new Date())` and decides pass/fail.

No changes to Docker, Lace, seed, or DUST registration — this is purely a "wait long enough" fix.

### Step 2 — Re-run

```
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

Expected: within 2–5 minutes both `isStrictlyComplete` flags flip to `true`, tDUST balance becomes non-zero, and the deploy proceeds to proving.

### Step 3 — If DUST balance is still 0 after strict-complete

Then (and only then) the 471 tDUST Lace shows really is under a different DUST public key than ours, even though the seeds match — likely because Lace's "Generate tDUST" registered a *different* NIGHT UTXO. In that case the fix is to send tNIGHT from Lace to the script's unshielded address (`mn_addr_preview15sz5jgljxtnh5cfxxe3ekf8egx6rh2lk28zswtdxprsj2hv4yrwql85qg8`) and let this wallet register + generate its own tDUST. We'll only go down that path if Step 2 confirms it's needed.

### Files touched

- `scripts/deploy-midnight.mjs` — replace the balance-only wait loop with a strict-complete wait loop; keep the diagnostic block as-is.

### Not doing

- No changes to seed, Lace, faucet, Docker, proof server, or DUST derivation.
- No `--register-dust` call — the UTXO is already registered.
