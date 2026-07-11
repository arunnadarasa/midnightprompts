## Confirms the diagnosis

Your snippet reinforces the research finding: **DUST is not automatic** — even on the same network with the same seed, DUST generation is per‑wallet‑instance and requires an on‑chain registration/delegation of your NIGHT to a specific DUST public key. Lace ran that registration against **Lace's** DUST key when you clicked "Generate tDUST", so those 471 tDUST are only spendable by Lace. Our script derives its own DUST key from the same seed, and either (a) the derivation path differs from Lace's, or (b) even if it matches, our script's key was never registered on‑chain.

Waiting longer will not fix this — sync is not the problem.

## Plan

Turn one deploy run into a targeted diagnostic that answers "wrong DUST key" vs "unregistered NIGHT" in one shot, then apply the matching fix. No wallet reset, no new seed, no faucet, no Docker changes.

### Step 1 — Add a diagnostic block to `scripts/deploy-midnight.mjs`

Right after the wallet snapshot, print:

- `state.dust.publicKey` (hex) + encoded DUST address (via `DustAddress.encodePublicKey` from ledger‑v8)
- `state.dust.availableCoins.length`
- `state.dust.state.progress` (sync status — proves we're not just early)
- For each NIGHT UTXO in `state.unshielded.availableCoins`: `value` and `meta?.registeredForDustGeneration`
- Sanity check: `DustSecretKey.fromSeed(seeds.dust).publicKey` equals `state.dust.publicKey`

The user then compares the printed DUST public key/address to what Lace shows for the same seed (Lace exposes a DUST address in Receive).

### Step 2 — Rewrite the failure message to state the conclusion

Instead of the current wall of "seed wrong / re‑fund" text, print exactly one of:

- **DUST key mismatch** — "script DUST key `…` ≠ Lace DUST key `…`. HD derivation for `Roles.Dust` is off; fix derivation."
- **Key matches, NIGHT not registered** — "DUST key matches Lace but no NIGHT UTXOs are registered against it. Run `bun scripts/deploy-midnight.mjs --register-dust` to submit the one‑time registration and wait ~1–5 min for tDUST to accrue."
- **Both look right, still syncing** — show progress numbers so we know it's genuinely mid‑sync.

### Step 3 — Add `--register-dust` action

New branch in the script: if `--register-dust` is passed and DUST key matches but registration is missing, call `wallet.registerNightUtxosForDustGeneration(...)` (per Midnight docs `guides/generating-dust-programmatically`), await the tx, then poll `state.dust.balance(new Date())` until it goes positive.

### Step 4 — Fix DUST key derivation (only if Step 2 says "mismatch")

Same approach we used for the shielded address: derive the dust seed via the correct `wallet-sdk-hd` `Roles.Dust` path and pass it into `MidnightWalletProvider.withWallet(..., DustSecretKey.fromSeed(<correct dust seed>), ...)`.

### Files touched

- `scripts/deploy-midnight.mjs` — diagnostics, new failure message, `--register-dust` handler, possibly dust‑seed derivation fix.

### Not doing

- No new mnemonic, no re‑faucet, no changes to Docker/proof server.
- No change to the shielded address derivation (already correct).
- No change to `state.dust.balance(...)` or `start(false)` — both are correct per docs.

### What you'll run after the patch

```
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

Then, based on what the diagnostic prints, either:

```
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs --register-dust
```

(followed by a normal re‑run to deploy), or a small dust‑seed derivation fix that I'll apply directly.
