# Privy sponsored transactions on Sepolia

## Dashboard walkthrough (one-time, user)

Privy dashboard → **Gas sponsorship**:

1. Select **App pays**.
2. Under **Configure chains** → add **Ethereum Sepolia** (chain id 11155111).
3. Scroll to **Allow transactions from the client** → toggle **ON**.
4. (No paymaster URL, no bundler URL. Native sponsorship uses Privy's TEE
   execution, which is the current default — if your app was created before
   TEE was default, migrate first per Privy docs.)

Set daily / per-user caps in the same dashboard tab before going public.

## Canonical `src/components/privy-client-entry.tsx`

```tsx
import { PrivyProvider, usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { type ReactNode, createContext, useContext, useMemo } from "react";
import privyCfg from "@/data/privy.json";
import contractCfg from "@/data/contract.json";
import { encodeFunctionData, type Hex } from "viem";

const ABI = [
  {
    type: "function",
    name: "log",
    stateMutability: "nonpayable",
    inputs: [{ name: "cid", type: "string" }],
    outputs: [],
  },
] as const;

type Ctx = {
  ready: boolean;
  authenticated: boolean;
  address: string | null;
  login: () => void;
  logout: () => void;
  logCid: (cid: string) => Promise<Hex>;
};

const PrivyCtx = createContext<Ctx | null>(null);
export function usePrivyChoreo() {
  const v = useContext(PrivyCtx);
  if (!v) throw new Error("PrivyCtx missing");
  return v;
}

function Bridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  // ALWAYS prefer the embedded wallet from useWallets, not user.wallet
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address ?? user?.wallet?.address ?? null;

  const ctx = useMemo<Ctx>(
    () => ({
      ready,
      authenticated,
      address,
      login,
      logout,
      logCid: async (cid) => {
        if (!embedded) throw new Error("Embedded wallet not ready");
        const data = encodeFunctionData({ abi: ABI, functionName: "log", args: [cid] });

        // 45s timeout guards against silent hangs when the dashboard is
        // misconfigured. Its reject message MUST name the exact toggles.
        const receipt = await Promise.race([
          sendTransaction(
            {
              to: contractCfg.address as Hex,
              data,
              chainId: contractCfg.chainId, // 11155111
            },
            { address: embedded.address, sponsor: true } as never
          ),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Privy sendTransaction timed out after 45s. In the Privy dashboard, enable Gas sponsorship → App pays → Ethereum Sepolia and turn on 'Allow transactions from the client'."
                  )
                ),
              45_000
            )
          ),
        ]);
        return receipt.hash as Hex;
      },
    }),
    [ready, authenticated, address, login, logout, embedded, sendTransaction]
  );

  return <PrivyCtx.Provider value={ctx}>{children}</PrivyCtx.Provider>;
}

export default function PrivyClientEntry({ children }: { children: ReactNode }) {
  if (!privyCfg.appId) {
    return (
      <div className="p-6 border border-destructive/40 text-sm text-destructive">
        PRIVY_APP_ID missing. Set it in project secrets.
      </div>
    );
  }
  return (
    <PrivyProvider
      appId={privyCfg.appId}
      config={{
        loginMethods: ["google", "email"],
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        appearance: { theme: "dark" },
      }}
    >
      <Bridge>{children}</Bridge>
    </PrivyProvider>
  );
}
```

Key rules embedded above:

- `sendTransaction(tx, { address: embedded.address, sponsor: true })` — both
  fields required. The `as never` cast is only there because
  `@privy-io/react-auth`'s public types sometimes lag the `sponsor` flag.
- Never add `uiOptions: { showWalletUIs: false }` — it aborts with
  `signal is aborted without reason`.
- Prefer `wallets.find(w => w.walletClientType === "privy")` — using
  `user.wallet.address` can point at an external wallet the user linked
  and desync the ledger.
- `chainId: 11155111` is non-optional. Omitting it lets the wallet default
  to mainnet and the sponsor rule silently no-ops.

## Canonical `src/components/privy-root.tsx` (SSR-safe mount)

```tsx
import { lazy, Suspense, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";

const PrivyClientEntry = lazy(() => import("./privy-client-entry"));

export function PrivyRoot({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<div className="p-6 text-sm text-muted-foreground">Loading wallet…</div>}>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading wallet…</div>}>
        <PrivyClientEntry>{children}</PrivyClientEntry>
      </Suspense>
    </ClientOnly>
  );
}
```

Then wrap only the routes that need the wallet:

```tsx
component: () => (
  <PrivyRoot>
    <YourDemoComponent />
  </PrivyRoot>
),
```

## Error → cause table

| UI error message | Cause | Fix |
| --- | --- | --- |
| `signal is aborted without reason` | `uiOptions.showWalletUIs: false` passed | Remove it |
| "Privy sendTransaction timed out after 45s" | Dashboard misconfigured (chain not added OR client txs disabled) | Fix dashboard toggles |
| Approval sheet shows non-zero fee (e.g. "US$17.34") | `sponsor: true` missing from options | Add it |
| `insufficient funds for gas` in the wallet UI | Same as above — Privy fell back to user-paid | Add `sponsor: true` + confirm sponsorship enabled |
| `Embedded wallet not ready` (our own throw) | Fired before `useWallets` populated | Gate the button on `authenticated && !!embedded` |

## Why the approval sheet stays

Privy's embedded-EOA path always shows the confirmation sheet for a
signed transaction — that's the security guarantee behind the "user
approved this action" claim. Native sponsorship changes the fee to $0
but not the sheet. If a truly silent UX is required, switch to the
smart-wallet + paymaster path (ZeroDev via `SmartWalletsProvider`), which
is documented in `robinhood-lovable`. That's a bigger stack change and
NOT needed for a normal Sepolia demo.
