#!/usr/bin/env python3
"""Append a self-contained "Connect Lace" boilerplate to every idea's megaPrompt.

Idempotent: reruns are no-ops thanks to the BEGIN/END sentinel.

Why: users pasting a mega-prompt into a fresh Lovable project don't have the
private lovable-midnight skill. The prompt itself must instruct their target AI
to build a working Connect-Lace button using DApp Connector API v4 (which
removed enable()/state() in favor of connect(networkId) + getShieldedAddresses
/ getUnshieldedAddress).
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"

SENTINEL_BEGIN = "--- BEGIN: Connect-Lace boilerplate (self-contained, DApp Connector v4) ---"
SENTINEL_END = "--- END: Connect-Lace boilerplate ---"

BOILERPLATE = f"""

{SENTINEL_BEGIN}

Add a working "Connect Lace" button to the primary page of the app. This
section is self-contained — do NOT install any @midnight-ntwrk/* package for
the connect step; the Lace browser extension injects everything you need at
`window.midnight`. Follow the DApp Connector API v4 exactly as written below.

HARD RULES
- Do NOT call `enable()` or `state()` — DApp Connector v4.0 removed them.
- Do NOT read `window.midnight` at module scope or during SSR — only inside
  `useEffect`. Gate the panel render until after hydration.
- Do NOT hardcode the network — try Preview, Preprod, and Mainnet in order
  and use whichever `connect(networkId)` accepts.
- Reading a shielded address is a permission-only handshake — no signing,
  no funds moved.

CREATE FILE: src/lib/use-midnight-wallet.ts
```ts
import {{ useCallback, useEffect, useState }} from "react";

export type WalletStatus =
  | "idle" | "detecting" | "ready" | "connecting" | "connected" | "error";

type Connector = {{
  apiVersion: string;
  name?: string;
  connect: (networkId: string) => Promise<ConnectedApi>;
  isEnabled?: () => Promise<boolean>;
}};

type ConnectedApi = {{
  getShieldedAddresses?: () => Promise<string[] | Record<string, string>>;
  getUnshieldedAddress?: () => Promise<string>;
  getDustAddress?: () => Promise<string>;
  getConfiguration?: () => Promise<{{
    indexerUri?: string; indexerWsUri?: string; proverServerUri?: string;
  }}>;
}};

function pickConnector(): Connector | null {{
  if (typeof window === "undefined") return null;
  const m = (window as unknown as {{ midnight?: Record<string, Connector> }}).midnight;
  if (!m) return null;
  for (const v of Object.values(m)) {{
    if (v && typeof v === "object" && "apiVersion" in v && /^4\\./.test(String(v.apiVersion))) {{
      return v as Connector;
    }}
  }}
  const first = Object.values(m)[0];
  return first && "apiVersion" in first ? (first as Connector) : null;
}}

function inferNetwork(addr: string): string {{
  const m = addr.match(/^mn_(?:shield-)?addr_([a-z0-9]+?)1/i);
  if (!m) return "unknown";
  const s = m[1].toLowerCase();
  if (s === "test") return "preprod";
  if (s === "undeployed") return "preview";
  return s;
}}

export function useMidnightWallet() {{
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {{
    if (typeof window === "undefined") return;
    setStatus((p) => (p === "connected" ? p : "detecting"));
    setError(null);
    const t0 = Date.now();
    const iv = window.setInterval(() => {{
      const c = pickConnector();
      if (c) {{
        window.clearInterval(iv);
        setApiVersion(c.apiVersion);
        setStatus((p) => (p === "connected" ? p : "ready"));
        if (!/^4\\./.test(c.apiVersion)) {{
          setStatus("error");
          setError(`Lace connector ${{c.apiVersion}} is not compatible. Update Lace.`);
        }}
      }} else if (Date.now() - t0 > 5000) {{
        window.clearInterval(iv);
        setStatus("error");
        setError("No Midnight wallet detected. Install Lace from lace.io.");
      }}
    }}, 100);
    return () => window.clearInterval(iv);
  }}, [tick]);

  const connect = useCallback(async () => {{
    try {{
      setError(null);
      setStatus("connecting");
      const c = pickConnector();
      if (!c) throw new Error("No Midnight wallet detected.");
      const preferred = (import.meta.env.VITE_NETWORK_ID as string) || "preprod";
      const candidates = Array.from(new Set([preferred, "preview", "preprod", "mainnet"]));
      let api: ConnectedApi | null = null;
      let used: string | null = null;
      let mismatch: unknown = null;
      for (const n of candidates) {{
        try {{ api = await c.connect(n); used = n; break; }}
        catch (e) {{
          const msg = e instanceof Error ? e.message : String(e);
          if (/network|mismatch/i.test(msg)) {{ mismatch = e; continue; }}
          throw e;
        }}
      }}
      if (!api || !used) {{
        throw new Error(
          mismatch
            ? "Lace is on a different network than this app supports. Switch Lace to Preview or Preprod and retry."
            : "Failed to connect to Lace.",
        );
      }}
      let addr: string | null = null;
      if (typeof api.getShieldedAddresses === "function") {{
        try {{
          const s = await api.getShieldedAddresses();
          if (Array.isArray(s)) addr = s[0] ?? null;
          else if (s && typeof s === "object") addr = Object.values(s)[0] ?? null;
        }} catch {{}}
      }}
      if (!addr && typeof api.getUnshieldedAddress === "function") {{
        try {{ addr = await api.getUnshieldedAddress(); }} catch {{}}
      }}
      if (!addr) throw new Error("Connected but couldn't read an address. Update Lace.");
      setAddress(addr);
      setNetwork(used ?? inferNetwork(addr));
      setApiVersion(c.apiVersion);
      setStatus("connected");
    }} catch (e) {{
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }}
  }}, []);

  return {{
    status, address, apiVersion, network, error,
    connect,
    disconnect: () => {{ setAddress(null); setNetwork(null); setStatus("ready"); setError(null); }},
    redetect: () => setTick((n) => n + 1),
  }};
}}
```

CREATE FILE: src/components/WalletConnectPanel.tsx
```tsx
import {{ useEffect, useState }} from "react";
import {{ useMidnightWallet }} from "@/lib/use-midnight-wallet";

function truncate(a: string, h = 12, t = 8) {{
  return a.length <= h + t + 1 ? a : `${{a.slice(0, h)}}…${{a.slice(-t)}}`;
}}

export function WalletConnectPanel({{ expectedNetwork = "preprod" }}: {{ expectedNetwork?: string }}) {{
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const w = useMidnightWallet();
  const [copied, setCopied] = useState(false);
  useEffect(() => {{
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }}, [copied]);

  if (!hydrated) {{
    return (
      <div className="p-5 border rounded-md">
        <div className="text-xs uppercase tracking-widest">connect lace</div>
        <div className="mt-3 h-10 bg-muted animate-pulse rounded" />
      </div>
    );
  }}

  const wrong = w.status === "connected" && w.network && w.network !== "unknown" && w.network !== expectedNetwork;

  return (
    <div className="p-5 border rounded-md space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-widest">connect lace</span>
        {{w.apiVersion && <span className="text-[10px] font-mono opacity-60">connector v{{w.apiVersion}}</span>}}
      </div>

      {{w.status === "detecting" && <p className="text-sm opacity-70">Detecting Midnight wallet…</p>}}

      {{w.status === "ready" && (
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={{() => void w.connect()}}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded">
            Connect wallet
          </button>
          <span className="text-xs opacity-70">Reads your shielded address — no signing, no funds moved.</span>
        </div>
      )}}

      {{w.status === "connecting" && <p className="text-sm opacity-70">Approve the connection in Lace…</p>}}

      {{w.status === "connected" && w.address && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest opacity-60">shielded address</div>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-xs break-all">{{truncate(w.address, 16, 12)}}</code>
            <button onClick={{() => {{ void navigator.clipboard.writeText(w.address ?? ""); setCopied(true); }}}}
              className="text-[10px] uppercase tracking-widest text-primary">
              {{copied ? "copied" : "copy"}}
            </button>
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <span>network · <span className="font-mono">{{w.network}}</span></span>
            <button onClick={{w.disconnect}} className="text-[10px] uppercase tracking-widest opacity-60">disconnect</button>
          </div>
          {{wrong && (
            <p className="text-[12px] opacity-80">
              Lace is on <span className="font-mono">{{w.network}}</span> but this app expects{{" "}}
              <span className="font-mono">{{expectedNetwork}}</span>. Switch networks inside Lace.
            </p>
          )}}
        </div>
      )}}

      {{w.status === "error" && (
        <div className="space-y-2">
          <p className="text-sm opacity-80">{{w.error ?? "Something went wrong."}}</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={{w.redetect}} className="px-3 py-2 border text-[10px] uppercase tracking-widest rounded">Retry</button>
            <a href="https://www.lace.io/" target="_blank" rel="noreferrer"
              className="px-3 py-2 border text-[10px] uppercase tracking-widest rounded">Install Lace ↗</a>
          </div>
        </div>
      )}}
    </div>
  );
}}
```

MOUNT on the primary page (e.g. src/routes/index.tsx or wherever the main
demo lives):
```tsx
import {{ WalletConnectPanel }} from "@/components/WalletConnectPanel";

// Inside your JSX:
<WalletConnectPanel expectedNetwork={{import.meta.env.VITE_NETWORK_ID || "preprod"}} />
```

PREREQUISITES to tell the end user in your UI copy:
1. Install Lace from https://www.lace.io/ (desktop browser extension).
2. Switch Lace to Midnight Preview or Preprod.
3. Get tNIGHT from the matching faucet, then click "Generate tDUST" in Lace
   to delegate — deploys and shielded writes spend tDUST, not tNIGHT.

{SENTINEL_END}
"""


def main() -> int:
    changed = 0
    for path in sorted(DATA.glob("*.json")):
        if path.name in {"themes.json", "hooks.json"}:
            continue
        data = json.loads(path.read_text())
        ideas = data.get("ideas") or []
        if not isinstance(ideas, list):
            continue
        dirty = False
        for idea in ideas:
            mp = idea.get("megaPrompt")
            if not isinstance(mp, str):
                continue
            if SENTINEL_BEGIN in mp:
                continue
            idea["megaPrompt"] = mp.rstrip() + BOILERPLATE
            dirty = True
            changed += 1
        if dirty:
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
            print(f"updated {path.relative_to(ROOT)}")
    print(f"done: {changed} idea(s) updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
