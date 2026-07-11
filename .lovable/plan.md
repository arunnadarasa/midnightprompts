## Bug
Lace is on **Preview**, but the app forces `connect("preprod")` (from `VITE_NETWORK_ID`), so the connector throws `Network ID mismatch`.

## Fix
Make the connect flow network-agnostic in `src/lib/use-midnight-wallet.ts`:

1. Build an ordered list of candidate networks: the env-preferred one first (`VITE_NETWORK_ID`, default `preprod`), then the others (`preview`, `preprod`, `mainnet`), deduped.
2. Loop over candidates: `await c.connect(candidate)`. On success, break and use that candidate as the `network` label. On thrown error whose message matches `/network|mismatch/i`, continue to the next candidate. Any other error rethrows immediately.
3. If every candidate errors with a network mismatch, surface: `"Lace is on a different network than this app supports. Switch Lace to Preview or Preprod and retry."`.
4. Keep the existing `api.state()` + `inferNetworkFromAddress` path, but prefer the candidate that actually succeeded for the `network` state (falls back to bech32 inference if unclear).
5. No other files touched. No dependency changes.

## Verification
- With Lace on Preview → panel connects, shows shielded address + `preview` chip.
- With Lace on Preprod → panel connects, shows `preprod` chip.
- With Lace on an unsupported network → clear "switch Lace" error, retry button still works.
