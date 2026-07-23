import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMidnightWallet } from "@/lib/use-midnight-wallet";

function truncate(addr: string, head = 12, tail = 8) {
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function WalletConnectPanel({
  expectedNetwork = "preprod",
}: {
  expectedNetwork?: string;
}) {
  // Gate render until after hydration to keep SSR output stable.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const w = useMidnightWallet();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const skeleton = (
    <div className="p-5 border border-primary/30 bg-card">
      <div className="eyebrow text-primary">try it · connect lace</div>
      <div className="mt-3 h-10 bg-muted/30 animate-pulse" />
    </div>
  );

  if (!hydrated) return skeleton;

  const isUndeployed = expectedNetwork === "undeployed";
  const publicNetwork = w.network === "preview" || w.network === "preprod" || w.network === "mainnet";
  const wrongNetwork =
    w.status === "connected" &&
    w.network &&
    w.network !== "unknown" &&
    w.network !== expectedNetwork;

  return (
    <div className="p-5 border border-primary/30 bg-card">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="eyebrow text-primary">try it · connect lace</span>
        {w.apiVersion && (
          <span className="text-[10px] font-mono text-muted-foreground">
            connector v{w.apiVersion}
          </span>
        )}
      </div>

      {w.status === "detecting" && (
        <p className="mt-3 text-sm text-muted-foreground">
          Detecting Midnight wallet…
        </p>
      )}

      {w.status === "ready" && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => void w.connect(expectedNetwork)}
            className="px-4 py-2 bg-primary text-primary-foreground text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-foreground transition"
          >
            Connect wallet {isUndeployed && <span className="opacity-70">· undeployed</span>}
          </button>
          <span className="text-xs text-muted-foreground">
            {isUndeployed
              ? "Point Lace at your local Undeployed network first (RPC ws://localhost:9944)."
              : "Reads your shielded address — no signing, no funds moved."}
          </span>
        </div>
      )}


      {w.status === "connecting" && (
        <p className="mt-3 text-sm text-muted-foreground">
          Approve the connection in Lace…
        </p>
      )}

      {w.status === "connected" && w.address && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="eyebrow text-muted-foreground text-[9px]">
              shielded address
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <code className="font-mono text-xs text-foreground break-all">
                {truncate(w.address, 16, 12)}
              </code>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(w.address ?? "");
                  setCopied(true);
                }}
                className="text-[10px] uppercase tracking-[0.2em] text-primary hover:text-foreground transition"
              >
                {copied ? "copied" : "copy"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <span>
              <span className="text-muted-foreground">network · </span>
              <span className="font-mono text-foreground">{w.network}</span>
            </span>
            <button
              onClick={w.disconnect}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition"
            >
              disconnect
            </button>
          </div>

          {wrongNetwork && !isUndeployed && (
            <div className="border-l-2 border-yellow-500/70 pl-3 py-2 text-[12px] text-muted-foreground">
              <span className="text-yellow-500 uppercase tracking-[0.24em] text-[10px] font-semibold">
                switch network
              </span>
              <p className="mt-1">
                Lace is connected to{" "}
                <span className="text-foreground font-mono">{w.network}</span>{" "}
                but this demo reads from{" "}
                <span className="text-foreground font-mono">
                  {expectedNetwork}
                </span>
                . Switch networks inside Lace to see matching state.
              </p>
            </div>
          )}

          {isUndeployed && publicNetwork && (
            <div className="border-l-2 border-yellow-500/70 pl-3 py-2 text-[12px] text-muted-foreground">
              <span className="text-yellow-500 uppercase tracking-[0.24em] text-[10px] font-semibold">
                point lace at localhost
              </span>
              <p className="mt-1">
                Lace is connected to the public{" "}
                <span className="text-foreground font-mono">{w.network}</span>{" "}
                network, but this demo needs the local Undeployed stack. In Lace,
                add a custom network with RPC{" "}
                <span className="text-foreground font-mono">ws://localhost:9944</span>{" "}
                and switch to it. Then run the{" "}
                <Link to="/undeployed-preflight" className="text-primary underline">
                  preflight checks
                </Link>{" "}
                if you haven't already.
              </p>
            </div>
          )}

          {isUndeployed && w.network === "undeployed" && (
            <div className="border-l-2 border-green-500/70 pl-3 py-2 text-[12px] text-muted-foreground">
              <span className="text-green-500 uppercase tracking-[0.24em] text-[10px] font-semibold">
                on local network
              </span>
              <p className="mt-1">
                Lace is connected to the local Undeployed stack. Make sure the{" "}
                <Link to="/undeployed-preflight" className="text-primary underline">
                  preflight checks
                </Link>{" "}
                are all green before deploying or submitting transactions.
              </p>
            </div>
          )}
        </div>
      )}

      {w.status === "error" && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-muted-foreground">
            {w.error ?? "Something went wrong."}
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={w.redetect}
              className="px-3 py-2 border border-primary/40 text-primary text-[10px] font-semibold tracking-[0.24em] uppercase hover:bg-primary hover:text-primary-foreground transition"
            >
              Retry
            </button>
            <a
              href="https://www.lace.io/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-border text-foreground text-[10px] font-semibold tracking-[0.24em] uppercase hover:border-primary/60 hover:text-primary transition"
            >
              Install Lace ↗
            </a>
            {isUndeployed && (
              <Link
                to="/undeployed-preflight"
                className="px-3 py-2 border border-border text-foreground text-[10px] font-semibold tracking-[0.24em] uppercase hover:border-primary/60 hover:text-primary transition"
              >
                Preflight →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
