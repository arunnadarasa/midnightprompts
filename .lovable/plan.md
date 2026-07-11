## Goal

Get a working local deploy on **Preview** first (before touching Preprod), using the Lace Mac Local seed that already holds tDUST on preview.

## Why preview first

- Your Lace Mac Local wallet has tDUST on **both** networks (you pasted both `mn_shield-addr_preview1m6wf…` and `mn_shield-addr_preprod1cah9s…`).
- Preview is the faster iteration loop and matches what the current `.midnight-wallet.local` / script defaults already target (`VITE_NETWORK_ID=preview`).
- Once preview deploy succeeds end-to-end, repeating for preprod is just `VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs` with no code changes.

## Fix that unblocks preview

The last edit changed the seed derivation to match Lace, but the **network enum mapping is still wrong for preview**:

```js
case "preprod":
case "preview":
case "testnet":
  networkEnum = NetworkId.TestNet;   // ← wrong for preview
```

Preview addresses use the `…preview1…` bech32 suffix, which corresponds to `NetworkId.Undeployed` in `@midnight-ntwrk/zswap` (that's why `derive-unshielded-address.mjs` prints the right preview address today — it maps the suffix, not `TestNet`). Using `TestNet` for preview is why the script previously printed `mn_shield-addr_test1vzn…` instead of `mn_shield-addr_preview1m6wf…`.

### Change in `scripts/deploy-midnight.mjs`

Split the switch so each network maps to its actual enum:

```js
switch (NETWORK_ID) {
  case "preview":  networkEnum = NetworkId.Undeployed; break;
  case "preprod":  networkEnum = NetworkId.TestNet;    break;
  case "mainnet":  networkEnum = NetworkId.MainNet;    break;
  default: die(`Unknown VITE_NETWORK_ID="${NETWORK_ID}"`);
}
```

Also update the pre-derive sanity log to map `preview → "preview"` (not `"test"`) as the bech32 suffix passed to `createKeystore`, so the printed address matches what Lace shows.

### Verification (no code, just runtime)

Before deploying, the script should print:

```
[deploy] network=preview
[deploy] shielded:   mn_shield-addr_preview1m6wf639g7tswe9xryuu2…   ← matches Lace
[deploy] unshielded: mn_addr_preview15sz5jgljxtnh5cfxxe3ekf8egx6…   ← matches Lace
```

If either address doesn't match the Lace values you pasted, abort before phase 2.

## Runbook for you (after the fix lands)

1. Confirm `.midnight-wallet.local` holds your Lace Mac Local 24 words.
2. Start Docker Desktop, then:
   ```bash
   docker run -d --name midnight-proof-server -p 6300:6300 \
     midnightntwrk/proof-server:latest midnight-proof-server -v
   curl http://localhost:6300/health
   ```
3. Run:
   ```bash
   VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
   ```
4. Expect: matching preview addresses → tDUST balance detected → `deployContract` → hex address written to `src/data/midnight-contract.preview.json` → MidnightScan link.

## Out of scope for this plan

- Preprod deploy (same script, run after preview works).
- Any UI, contract, or provider changes.
- Wallet page copy — the Option B callout already reflects the HD-derivation fix.
