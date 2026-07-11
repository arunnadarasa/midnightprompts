import { useCallback, useEffect, useState } from "react";

// Live Lace / Midnight DApp Connector integration.
// Follows https://docs.midnight.network/guides/react-wallet-connect and the
// `lovable-midnight` skill: no top-level browser access, no module-scope
// @midnight-ntwrk imports, connector picked by apiVersion satisfying 4.x.

export type WalletStatus =
  | "idle"
  | "detecting"
  | "ready"
  | "connecting"
  | "connected"
  | "error";

export type MidnightWalletState = {
  status: WalletStatus;
  address: string | null;
  coinPublicKey: string | null;
  apiVersion: string | null;
  network: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  redetect: () => void;
};

type Connector = {
  apiVersion: string;
  name?: string;
  connect: (networkId: string) => Promise<ConnectedApi>;
  isEnabled?: () => Promise<boolean>;
};

type ConnectedApi = {
  state: () => Promise<{
    address: string;
    coinPublicKey?: string;
    encryptionPublicKey?: string;
  }>;
  serviceUriConfig?: () => Promise<{
    indexerUri?: string;
    proverServerUri?: string;
    substrateNodeUri?: string;
  }>;
  getConfiguration?: () => Promise<{
    indexerUri?: string;
    indexerWsUri?: string;
    proverServerUri?: string;
  }>;
};

function pickConnector(): Connector | null {
  if (typeof window === "undefined") return null;
  const midnight = (window as unknown as { midnight?: Record<string, Connector> })
    .midnight;
  if (!midnight) return null;
  for (const value of Object.values(midnight)) {
    if (value && typeof value === "object" && "apiVersion" in value) {
      const v = String(value.apiVersion ?? "");
      // Match 4.x — the family the SDK on this project targets.
      if (/^4\./.test(v)) return value as Connector;
    }
  }
  // Fall back to any connector so we can surface a version-mismatch error.
  const first = Object.values(midnight)[0];
  return first && "apiVersion" in first ? (first as Connector) : null;
}

function inferNetworkFromAddress(address: string): string {
  // shielded bech32: mn_shield-addr_<network>1…
  const m = address.match(/^mn_shield-addr_([a-z0-9]+?)1/i);
  if (!m) return "unknown";
  const suffix = m[1].toLowerCase();
  if (suffix === "test") return "preprod";
  if (suffix === "undeployed") return "preview";
  return suffix; // e.g. "mainnet"
}

export function useMidnightWallet(): MidnightWalletState {
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [coinPublicKey, setCoinPublicKey] = useState<string | null>(null);
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectTick, setDetectTick] = useState(0);

  // Poll for window.midnight for up to 5s after mount / redetect.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setStatus((prev) => (prev === "connected" ? prev : "detecting"));
    setError(null);
    const started = Date.now();
    let cancelled = false;
    const iv = window.setInterval(() => {
      if (cancelled) return;
      const c = pickConnector();
      if (c) {
        window.clearInterval(iv);
        setApiVersion(c.apiVersion);
        setStatus((prev) => (prev === "connected" ? prev : "ready"));
        if (!/^4\./.test(c.apiVersion)) {
          setStatus("error");
          setError(
            `Lace connector ${c.apiVersion} is not compatible. Update Lace to a 4.x Midnight build.`,
          );
        }
      } else if (Date.now() - started > 5000) {
        window.clearInterval(iv);
        setStatus("error");
        setError(
          "No Midnight wallet detected. Install Lace from lace.io and refresh this page.",
        );
      }
    }, 100);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [detectTick]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      setStatus("connecting");
      const c = pickConnector();
      if (!c) throw new Error("No Midnight wallet detected.");
      if (typeof c.connect !== "function") {
        throw new Error(
          "This Lace build doesn't expose the 4.x DApp Connector API (missing connect()). Update Lace to the latest Midnight build.",
        );
      }
      const envNet = (import.meta.env.VITE_NETWORK_ID as string | undefined) ?? "preprod";
      const preferred = envNet === "preview" || envNet === "preprod" || envNet === "mainnet" ? envNet : "preprod";
      const candidates = Array.from(new Set([preferred, "preview", "preprod", "mainnet"]));
      let api: ConnectedApi | null = null;
      let usedNetwork: string | null = null;
      let lastMismatch: unknown = null;
      for (const cand of candidates) {
        try {
          api = await c.connect(cand);
          usedNetwork = cand;
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (/network|mismatch/i.test(msg)) {
            lastMismatch = err;
            continue;
          }
          throw err;
        }
      }
      if (!api || !usedNetwork) {
        throw new Error(
          lastMismatch
            ? "Lace is on a different network than this app supports. Switch Lace to Preview or Preprod and retry."
            : "Failed to connect to Lace.",
        );
      }
      const state = await api.state();
      setAddress(state.address);
      setCoinPublicKey(state.coinPublicKey ?? null);
      setNetwork(usedNetwork ?? inferNetworkFromAddress(state.address));
      setApiVersion(c.apiVersion);
      setStatus("connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setCoinPublicKey(null);
    setNetwork(null);
    setStatus("ready");
    setError(null);
  }, []);

  const redetect = useCallback(() => setDetectTick((n) => n + 1), []);

  return {
    status,
    address,
    coinPublicKey,
    apiVersion,
    network,
    error,
    connect,
    disconnect,
    redetect,
  };
}
