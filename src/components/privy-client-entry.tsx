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

  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const address = embedded?.address ?? user?.wallet?.address ?? null;

  const ctx = useMemo<Ctx>(
    () => ({
      ready,
      authenticated,
      address,
      login,
      logout,
      logCid: async (cid: string) => {
        if (!embedded) throw new Error("Embedded wallet not ready");
        const data = encodeFunctionData({ abi: ABI, functionName: "log", args: [cid] });
        const receipt = await Promise.race([
          sendTransaction(
            {
              to: contractCfg.address as Hex,
              data,
              chainId: contractCfg.chainId,
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
        appearance: { theme: "dark", accentColor: "#d4a574" },
      }}
    >
      <Bridge>{children}</Bridge>
    </PrivyProvider>
  );
}
