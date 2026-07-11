## Diagnosis

Your screenshots confirm the script and Lace are using the **same wallet**:

- Script unshielded: `mn_addr_preview15sz5j...wql85qg8`
- Lace unshielded: `mn_addr_preview15sz5j...wql85qg8`
- Script shielded: `mn_shield-addr_preview1m6wf...dyqy03tws`
- Lace shielded: `mn_shield-addr_preview1m6wf...dyqy03tws`

So the confusing part is not address mismatch anymore. The issue is likely that the deploy script is reading the wallet state too early and getting a stale/initial Dust state of `0`, even though Lace shows `471 / 5,000 tDUST`.

## Plan

1. Update `scripts/deploy-midnight.mjs` so it waits specifically for the Dust wallet balance to sync before deciding balance is zero.
2. Add a short polling window after wallet startup, for example 60–90 seconds, that logs progress like:
   - syncing wallet balance...
   - current tDUST balance: ...
3. Only stop with “Not enough tDUST” after the Dust wallet has had time to report a real balance.
4. Keep the address checks exactly as-is, since they are now proven correct.
5. Improve the “0 tDUST” message so if it still happens after sync, it points to an indexer/sync issue rather than telling you the wallet seed is wrong.

## Expected result

After the patch, running:

```bash
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

should wait for the wallet to sync, see the existing `471 tDUST`, and continue into Phase 2 deploy without asking you to fund the wallet again.

## What you do not need to do

- Do not run Docker again; it is already running.
- Do not change wallet seed.
- Do not move funds.
- Do not paste recovery words anywhere.
