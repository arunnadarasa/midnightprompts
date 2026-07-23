## Add Undeployed network to the Midnight Ledger demo

**File:** `src/routes/showcase.midnight-ledger.tsx`

Bring the Midnight Ledger page in line with the rest of the site (WalletConnectPanel, NetworkToggle, and preflight page already support `undeployed`).

1. **Eyebrow + meta**: change "Live on Midnight preview + preprod" → "Live on Midnight preview · preprod · undeployed" (also in `head()` title/og description).
2. **Deploy status**: extend `DualDeployStatus` array to include `CONTRACTS.undeployed` so all three networks show; update the "both networks" eyebrow label to "all networks".
3. **Sanity-check card**: the current card is preview-only. Keep it, but make its copy conditional on the selected `network` so:
   - `preview` / `preprod`: existing faucet + `check-midnight-wallet.mjs --network=<n>` copy.
   - `undeployed`: replace with local-stack guidance — no faucet, genesis wallet mints tDUST; link to `/undeployed-preflight` and `/undeployed`; show expected prefixes `mn_addr_undeployed1… · mn_shield-addr_undeployed1…`; show local RPC / indexer URLs from `CONTRACTS.undeployed`.
4. **"Awaiting deploy" block**: when `network === "undeployed"`, swap the faucet/tNIGHT paragraph for the local flow:
   - Bring up the standalone stack: `bun scripts/midnight-standalone.mjs up`
   - Deploy: `VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs`
   - Note the deployed address writes to `src/data/midnight-contract.undeployed.json`.
   - Hide the tNIGHT/tDUST faucet link (undeployed has no faucet URL).
5. **"Try it locally" ordered list**: add a fifth bullet (or a small note) mentioning the `undeployed` variant as the fastest path — no faucet, Docker-only.
6. Do NOT change the default selected network (keeps `preprod` as the default, matching the rest of the site).

No other files change — `NetworkToggle`, `WalletConnectPanel`, and `CONTRACTS.undeployed` already support this.