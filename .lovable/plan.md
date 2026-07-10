## Problem

`WalletBuilder.buildFromSeed` crashed with `MatchError: preprod (of class java.lang.String)`. The Scala.js-compiled wallet SDK doesn't accept the string `"preprod"` for its network parameter — it expects a `NetworkId` enum value from `@midnight-ntwrk/zswap`. Preprod and Preview both map to the enum member `TestNet` (only MainNet is distinct).

`setNetworkId("preprod")` from `midnight-js-network-id` is fine (that helper accepts the string), but the raw wallet builder needs the enum.

## Fix

Edit `scripts/deploy-midnight.mjs` `buildWallet(...)`:

1. Also import `NetworkId` from `@midnight-ntwrk/zswap`.
2. Map the env string to the enum:
   - `preprod` → `NetworkId.TestNet`
   - `preview` → `NetworkId.TestNet`
   - `mainnet` → `NetworkId.MainNet`
   - anything else → fatal error with a clear message.
3. Pass that enum as the 6th argument to `WalletBuilder.buildFromSeed(...)` instead of the raw `NETWORK_ID` string. Leave `setNetworkId(NETWORK_ID)` unchanged.

No other files change. After the edit the user re-runs:

```bash
bun scripts/deploy-midnight.mjs
```

Expected next output: wallet builds, prints the shielded address, prints `current tDUST balance: 0`, and instructs to fund via Lace + faucet + Generate tDUST, then re-run.

## Then

Once funded and re-run succeeds, paste the printed `contract address` and `deploy tx` (or the updated `src/data/midnight-contract.json`) into chat so I can verify the Deploy Status panel on `/proof-server` picks it up.