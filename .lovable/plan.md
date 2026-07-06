
## Root cause

The `signal is aborted without reason` error came from adding `uiOptions: { showWalletUIs: false }` to the Privy `sendTransaction` call. That option is not supported alongside `sponsor: true` — Privy aborts the request internally. The reference Tempo project uses **only** `{ address, sponsor: true }` (no `uiOptions`) and the sponsored tx succeeds; the approval sheet still appears but shows a $0 fee.

## Fix

**`src/components/privy-client-entry.tsx`** — remove the `uiOptions` field and the `as never` cast. Wrap the send in a 45s `Promise.race` timeout so a hung Privy call fails with a diagnosable message instead of an abort.

```ts
const receipt = await Promise.race([
  sendTransaction(
    { to: contractCfg.address as Hex, data, chainId: contractCfg.chainId },
    { address: embedded.address, sponsor: true }
  ),
  new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(
        "Privy sendTransaction timed out after 45s. Enable Gas sponsorship → App pays → Ethereum Sepolia + 'Allow transactions from the client' in the Privy dashboard."
      )),
      45_000
    )
  ),
]);
return receipt.hash as Hex;
```

No other files change.

## Verification

- Tap "Log on Sepolia" → approval sheet appears with fee US$0.00 → Approve → tx hash returned, appears in the ledger.
- If Privy still aborts, it means "Allow transactions from the client" is off or Sepolia isn't in the sponsored chain list — user fixes it in the dashboard.
