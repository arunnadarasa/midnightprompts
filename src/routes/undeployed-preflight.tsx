import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/undeployed-preflight")({
  head: () => ({
    meta: [
      { title: "Undeployed Preflight — Local Midnight Stack Health" },
      {
        name: "description",
        content:
          "Browser-side health check for the local Midnight standalone stack: proof server, indexer HTTP, indexer WS, node RPC. Confirms all four endpoints are reachable before you deploy.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Undeployed Preflight" },
      {
        property: "og:description",
        content: "Confirms the local Midnight node, indexer, and proof server are up before a deploy.",
      },
    ],
  }),
  component: PreflightPage,
});

type Status = "idle" | "checking" | "ok" | "fail";
type Result = { status: Status; detail?: string };

const NODE_WS = "ws://localhost:9944";
const INDEXER_HTTP = "http://localhost:8088/api/v4/graphql";
const INDEXER_WS = "ws://localhost:8088/api/v4/graphql/ws";
const PROOF_HTTP = "http://localhost:6300/health";

const ENV_SNIPPET = `VITE_NETWORK_ID=undeployed
VITE_INDEXER_URL=http://localhost:8088/api/v4/graphql
VITE_INDEXER_WS_URL=ws://localhost:8088/api/v4/graphql/ws
VITE_NODE_RPC=ws://localhost:9944
VITE_PROOF_SERVER_URL=http://localhost:6300`;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

async function checkProof(): Promise<Result> {
  try {
    const r = await withTimeout(fetch(PROOF_HTTP), 4000, "proof server");
    if (!r.ok) return { status: "fail", detail: `HTTP ${r.status}` };
    const body = await r.text();
    return { status: "ok", detail: body.slice(0, 200) };
  } catch (e) {
    return { status: "fail", detail: (e as Error).message };
  }
}

async function checkIndexerHttp(): Promise<Result> {
  try {
    const r = await withTimeout(
      fetch(INDEXER_HTTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ __typename }" }),
      }),
      4000,
      "indexer HTTP",
    );
    if (!r.ok) return { status: "fail", detail: `HTTP ${r.status}` };
    const j = (await r.json()) as { data?: unknown };
    if (!j.data) return { status: "fail", detail: `Missing data field: ${JSON.stringify(j)}` };
    return { status: "ok", detail: JSON.stringify(j) };
  } catch (e) {
    return { status: "fail", detail: (e as Error).message };
  }
}

function checkWs(url: string, label: string, initMessage?: Record<string, unknown>): Promise<Result> {
  return new Promise((resolve) => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(url, initMessage ? ["graphql-transport-ws"] : undefined);
    } catch (e) {
      resolve({ status: "fail", detail: `${label}: ${(e as Error).message}` });
      return;
    }
    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      resolve({ status: "fail", detail: `${label} did not respond within 4s` });
    }, 4000);
    ws.addEventListener("open", () => {
      if (initMessage) ws.send(JSON.stringify(initMessage));
      else {
        clearTimeout(timer);
        try { ws.close(); } catch {}
        resolve({ status: "ok", detail: "socket opened" });
      }
    });
    ws.addEventListener("message", (ev) => {
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve({ status: "ok", detail: String(ev.data).slice(0, 200) });
    });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      resolve({ status: "fail", detail: `${label} socket error (is the service up on ${url}?)` });
    });
  });
}

async function checkIndexerWs(): Promise<Result> {
  return checkWs(INDEXER_WS, "indexer WS", { type: "connection_init", payload: {} });
}
async function checkNodeWs(): Promise<Result> {
  return checkWs(NODE_WS, "node WS");
}

type CheckKey = "proof" | "indexerHttp" | "indexerWs" | "node";
const CHECKS: { key: CheckKey; label: string; hint: string; run: () => Promise<Result> }[] = [
  { key: "proof",       label: "Proof server",    hint: "GET http://localhost:6300/health",                       run: checkProof },
  { key: "indexerHttp", label: "Indexer HTTP",    hint: "POST http://localhost:8088/api/v4/graphql",              run: checkIndexerHttp },
  { key: "indexerWs",   label: "Indexer WS",      hint: "ws://localhost:8088/api/v4/graphql/ws · connection_init", run: checkIndexerWs },
  { key: "node",        label: "Node RPC",        hint: "ws://localhost:9944 · socket open",                       run: checkNodeWs },
];

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    idle:     { label: "idle",     cls: "border-border text-muted-foreground" },
    checking: { label: "checking…", cls: "border-primary/60 text-primary animate-pulse" },
    ok:       { label: "ok",       cls: "border-green-500/60 text-green-400" },
    fail:     { label: "fail",     cls: "border-red-500/60 text-red-400" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] uppercase tracking-[0.24em] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function PreflightPage() {
  const [results, setResults] = useState<Record<CheckKey, Result>>({
    proof: { status: "idle" }, indexerHttp: { status: "idle" }, indexerWs: { status: "idle" }, node: { status: "idle" },
  });
  const [expanded, setExpanded] = useState<Record<CheckKey, boolean>>({
    proof: false, indexerHttp: false, indexerWs: false, node: false,
  });
  const [running, setRunning] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedDeploy, setCopiedDeploy] = useState(false);
  const [copiedStack, setCopiedStack] = useState(false);
  const [laceNetwork, setLaceNetwork] = useState<string | null>(null);

  const runAll = useCallback(async () => {
    setRunning(true);
    setResults((r) => Object.fromEntries(Object.keys(r).map((k) => [k, { status: "checking" }])) as Record<CheckKey, Result>);
    await Promise.all(
      CHECKS.map(async (c) => {
        const res = await c.run();
        setResults((prev) => ({ ...prev, [c.key]: res }));
      }),
    );
    setRunning(false);
  }, []);

  useEffect(() => {
    void runAll();
    // Sniff Lace injected api-version to warn if not on undeployed.
    try {
      const injected = (window as unknown as { midnight?: Record<string, { apiVersion?: string; name?: string }> }).midnight;
      if (injected) {
        const first = Object.values(injected)[0];
        if (first?.name) setLaceNetwork(first.name);
      }
    } catch {}
  }, [runAll]);

  const allOk = CHECKS.every((c) => results[c.key].status === "ok");

  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-20 animate-fade-in">
        <span className="eyebrow">Utility · Undeployed · Local stack</span>
        <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
          Preflight <span className="italic text-primary">— local Midnight stack</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
          Runs four browser-side probes against your machine's Midnight standalone stack. All four
          must be green before <code>VITE_NETWORK_ID=undeployed</code> deploys or the Choreo Ledger
          demo will work.
        </p>

        <div className="mt-6 p-4 border border-primary/30 bg-card text-[12px] leading-relaxed">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-primary">start / restart stack</span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText("bun scripts/midnight-standalone.mjs up").then(() => {
                  setCopiedStack(true);
                  setTimeout(() => setCopiedStack(false), 1500);
                });
              }}
              className="text-[10px] uppercase tracking-[0.24em] text-primary hover:text-foreground transition-colors"
            >
              {copiedStack ? "copied" : "copy"}
            </button>
          </div>
          <p className="mt-2 text-muted-foreground">
            Requires Docker Desktop (macOS/Windows) or Docker Engine (Linux) running.
          </p>
          <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
{`bun scripts/midnight-standalone.mjs up`}
          </pre>
          <p className="mt-2 text-muted-foreground">
            Then click <em>Re-run all</em> below. First run pulls ~1&nbsp;GB of images and takes 2–5 minutes.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={runAll}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.24em] font-semibold disabled:opacity-50 hover:bg-foreground transition-colors"
          >
            {running ? "Checking…" : "Re-run all"}
          </button>
          {allOk && (
            <span className="text-green-400 text-[11px] uppercase tracking-[0.24em] font-semibold">
              ✓ all green — ready to deploy
            </span>
          )}
        </div>

        <ul className="mt-6 divide-y divide-border border border-border">
          {CHECKS.map((c) => {
            const r = results[c.key];
            const isOpen = expanded[c.key];
            return (
              <li key={c.key} className="bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded((e) => ({ ...e, [c.key]: !e[c.key] }))}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-background/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-foreground">{c.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono break-all">{c.hint}</div>
                  </div>
                  <StatusPill status={r.status} />
                </button>
                {isOpen && r.detail && (
                  <pre className="px-4 pb-4 -mt-1 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap break-all">
                    {r.detail}
                  </pre>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 text-[11px]">
          <div className="p-4 border border-border bg-card">
            <div className="eyebrow text-primary">Lace</div>
            <div className="mt-2 text-muted-foreground leading-relaxed">
              {laceNetwork
                ? <>Detected connector: <code className="text-foreground">{laceNetwork}</code>. Set Lace network to a custom RPC pointing at <code className="text-foreground">ws://localhost:9944</code>.</>
                : "Lace connector not detected in this browser. Install/enable the Midnight-enabled Lace extension, then point it at ws://localhost:9944."}
            </div>
          </div>
          <div className="p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="eyebrow text-primary">env for a fresh Lovable project</div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(ENV_SNIPPET).then(() => {
                      setCopiedEnv(true);
                      setTimeout(() => setCopiedEnv(false), 1500);
                    });
                  }}
                  className="text-[10px] uppercase tracking-[0.24em] text-primary hover:text-foreground transition-colors"
                >
                  {copiedEnv ? "copied" : "copy"}
                </button>
            </div>
            <pre className="mt-2 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
{ENV_SNIPPET}
            </pre>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em]">
          <a
            href="/showcase/choreo-ledger-local"
            className={`inline-flex items-center gap-2 px-6 py-3 font-semibold transition-colors duration-500 ${
              allOk
                ? "bg-primary text-primary-foreground hover:bg-foreground"
                : "border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            Choreo Ledger (Local) →
          </a>
          <a
            href="/known-issues"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Known issues
          </a>
        </div>
      </article>
    </SiteShell>
  );
}
