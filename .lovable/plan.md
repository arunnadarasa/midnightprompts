## Goal
Make the local Preview deploy script derive and use the same Preview wallet addresses that Lace shows for the same 24-word recovery phrase.

## What I found
- The script is currently mixing two concepts:
  - Lace/SDK address suffix for Preview: `preview`
  - Zswap `NetworkId` enum: only has `Undeployed`, `DevNet`, `TestNet`, `MainNet`
- The current script maps `preview` to `NetworkId.Undeployed`, which is for local undeployed networks, not hosted Preview.
- That can produce a different SDK-side shielded wallet address even when the unshielded Lace address looks correct.
- The helper script still has older docs/comments that say Preview uses `test`, which conflicts with the newer Lace `mn_addr_preview...` / `mn_shield-addr_preview...` format.

## Plan
1. Update `scripts/deploy-midnight.mjs` so hosted `preview` uses:
   - `setNetworkId("preview")`
   - bech32 suffix `preview`
   - Zswap enum `NetworkId.TestNet`
2. Keep `preprod` on:
   - `setNetworkId("preprod")`
   - bech32 suffix `preprod`
   - Zswap enum `NetworkId.TestNet`
3. Reserve `NetworkId.Undeployed` only for an explicit `undeployed`/local network, not hosted Preview.
4. Update the printed guidance so Preview examples show `mn_addr_preview...`, not `mn_addr_test1...`.
5. Update `scripts/derive-unshielded-address.mjs` so `--network=preview` is the correct Preview path and old `--network=test` is treated as legacy/alias only if needed.
6. Update `scripts/deploy-midnight.README.md` to remove contradictory Preview=`test` instructions.

## After implementation, you will run locally
```bash
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

Expected result: the printed `derived (HD, matches Lace) unshielded` should match your Lace Preview unshielded address, and the printed `Shielded address` should match your Lace Preview shielded address.