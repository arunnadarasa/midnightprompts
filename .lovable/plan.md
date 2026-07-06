
## Goal

Make "Log on Sepolia" a truly gas-sponsored transaction — no fee shown, and (optionally) no Privy approval sheet.

## Root cause

`src/components/privy-client-entry.tsx` calls `sendTransaction(tx, { address })` without `sponsor: true`. Privy's native gas sponsorship (App pays) is a per-call opt-in — the flag is missing, so Privy treats it as a user-paid tx and shows the approval sheet with a fee.

Sepolia is fully supported by Privy's native sponsorship — no ZeroDev / smart wallets required.

## Steps

1. **Dashboard (user, one-time)** — I'll spell this out in the reply:
   - Privy Dashboard → Gas sponsorship → **App pays** → add **Ethereum Sepolia** to the sponsored chains → toggle **Allow transactions from the client** ON. (Requires the app to be on TEE execution, which is the current Privy default.)

2. **`src/components/privy-client-entry.tsx`** — one-line change: pass `sponsor: true` in the `sendTransaction` options:
   ```ts
   sendTransaction(
     { to: contractCfg.address, data, chainId: contractCfg.chainId },
     { address: embedded.address, uiOptions: { showWalletUIs: false } }
   )
   ```
   Add `sponsor: true` alongside `address`. Also set `uiOptions.showWalletUIs: false` so the approval sheet is skipped entirely — with sponsorship on and no value transfer this is safe for the demo. If Privy rejects the flag on this SDK version we keep the sheet but the fee will read $0.

3. No changes anywhere else — contract, route, ledger feed, UI copy stay as-is.

## Out of scope

- No ZeroDev / smart wallets.
- No new npm packages, no new secrets.
- No changes to other routes.

## Verification

- Sign in → tap "Log on Sepolia" → tx is submitted with no fee dialog (or a $0 fee dialog if `showWalletUIs` is unsupported), returns a hash, and appears in the ledger feed.
- Etherscan shows `From = embedded wallet`, gas paid by Privy's sponsor account.
