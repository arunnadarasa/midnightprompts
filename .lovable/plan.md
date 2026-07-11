## Diagnosis (confirmed)

- Lace shows **530 / 5,000 tDUST · Refilling** — funded, ready to spend.
- Script SDK reports `tDUST=0`, `dust.availableCoins: 0`, `dust.complete=false` after 10 min.
- DUST public key matches seed-derived key → same wallet, same chain view. It's a **sync stall**, not a funding gap.
- The correct readiness signal is `state.dust.availableCoins.length >= 1` — balance alone is not spendable until an on-chain coin has minted.
- Preview's fresh-wallet Dust sync commonly takes >10 min; our current 10-min ceiling is too aggressive.
- `MIDNIGHT_ALLOW_ZERO_DUST=1` bypassed our own gate but the SDK's transaction balancer still saw 0 coins and threw `Wallet.InsufficientFunds`.

**5,000 is a tank cap, not a required threshold** — the deploy costs a fraction of one tDUST.

## Fix: harden `scripts/deploy-midnight.mjs`

1. **Change the readiness signal from `balance > 0` to `state.dust.availableCoins.length >= 1`.** Balance can be non-zero while no spendable coin exists yet; that's the trap.

2. **Raise the sync timeout to 20 min** (from 10) and log the exact reason for each poll: `coins=N · balance=… · dust.complete=… · shielded.complete=… · unshielded.complete=…`.

3. **Auto-rebuild the wallet once when the WS relay drops.** The log shows `disconnected from wss://rpc.preview.midnight.network/` right after boot. If after ~3 min we still have 0 dust coins AND `dust.complete=false`, dispose the current wallet builder and reconstruct it — one retry, then continue polling.

4. **Neuter `MIDNIGHT_ALLOW_ZERO_DUST` on the happy path.** It's a foot-gun — it lets the SDK enter `deployContract` with a genuinely empty balance. Keep the env var but require an additional `MIDNIGHT_FORCE_DEPLOY=1` to actually skip. Otherwise print a clear "SDK didn't see any spendable tDUST coins — re-run; Preview sync often needs 10–20 min" and exit non-zero.

5. **Print a Lace-vs-SDK reconciliation line** at the end of the sync loop so the mismatch is obvious:
   `Lace shows: <check the extension>  ·  SDK sees: coins=0 balance=0 complete=false`.

## UX follow-up on `/proof-server`

- Add a "tank cap ≠ required balance" note under step 04: **"You can deploy as soon as Lace shows any tDUST balance. 5,000 is the tank ceiling, not a threshold — a deploy costs a fraction of one tDUST."**
- Add a troubleshooting line: **"If the deploy script prints `tDUST=0` while Lace shows a real balance, just re-run. The Preview relay sometimes drops the initial WS sync; the script rebuilds the wallet once and typically catches it on the second attempt."**

## Immediate action (before code changes)

Try this first — cheapest possible test:

```bash
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

No `MIDNIGHT_ALLOW_ZERO_DUST`. A fresh run often catches the sync the first attempt missed. If it still logs `coins=0` after 10 min, we ship the script changes above and try again.

## Non-goals

- No changes to `TimestampLog.compact` or compiled artefacts.
- No changes to wallet generation / storage.
- No changes to preprod flow.
