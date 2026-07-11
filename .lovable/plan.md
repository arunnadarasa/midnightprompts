## Bug
The Midnight Ledger "Connect Lace" panel shows `e.enable is not a function`.

`src/lib/use-midnight-wallet.ts` calls `connector.enable()`, but the Midnight DApp Connector 4.x API (which is what Lace's Midnight build exposes on `window.midnight[*]`) uses `connector.connect(networkId)`, not `.enable()`. The `lovable-midnight` skill's canonical bootstrap uses `await lace.connect(net)` for exactly this reason.

## Fix

Edit only `src/lib/use-midnight-wallet.ts`:

1. Update the `Connector` type: replace `enable: () => Promise<ConnectedApi>` with `connect: (networkId: string) => Promise<ConnectedApi>`. Keep the optional `isEnabled`.
2. In `connect()`, replace `await c.enable()` with `await c.connect(networkId)`, where `networkId` is derived from `import.meta.env.VITE_NETWORK_ID` and falls back to `"preprod"` (matching the rest of the project). Guard for unknown values.
3. Extend `ConnectedApi` with an optional `getConfiguration?: () => Promise<{ indexerUri?: string; proverServerUri?: string; indexerWsUri?: string }>` so we don't break future callers — no behavior change now.
4. Improve the error surface: if `.connect` is missing, throw a clear `"This Lace build doesn't expose the 4.x DApp Connector API (missing connect()). Update Lace to the latest Midnight build."` instead of the raw TypeError.
5. After a successful connect, keep the existing `api.state()` → address/coinPublicKey path unchanged.

No other files, dependencies, or UI changes. The connect panel will then either succeed (address + network chip appear) or surface a precise error.

## Verification
- Reload `/showcase/midnight-ledger`, click **Connect Lace** with Lace installed on Preview or Preprod → panel transitions to `connected` and shows the shielded address + inferred network.
- Without Lace installed → same "Install Lace" message as before (detection path unchanged).
