import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/undeployed")({
  head: () => ({
    meta: [
      { title: "Undeployed Quick Start — Local Midnight Stack for Lovable" },
      {
        name: "description",
        content:
          "Connect a Lovable app to a local Midnight Undeployed stack: one command starts the node, indexer, and proof server on your machine. No faucet, no Preprod DUST sync bugs.",
      },
      { property: "og:title", content: "Undeployed Quick Start — Local Midnight Stack" },
      {
        property: "og:description",
        content:
          "Run Midnight locally with Docker, then connect your Lovable app and Lace wallet on localhost.",
      },
    ],
  }),
  component: UndeployedPage,
});

const STACK_CMD = "bun scripts/midnight-standalone.mjs up";
const ENV_SNIPPET = `VITE_NETWORK_ID=undeployed
VITE_INDEXER_URL=http://localhost:8088/api/v4/graphql
VITE_INDEXER_WS_URL=ws://localhost:8088/api/v4/graphql/ws
VITE_NODE_RPC=ws://localhost:9944
VITE_PROOF_SERVER_URL=http://localhost:6300`;

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="shrink-0 w-8 h-8 border border-primary flex items-center justify-center text-primary font-display text-lg">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="font-display text-xl text-foreground">{title}</h3>
        <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</div>
      </div>
    </li>
  );
}

function UndeployedPage() {
  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-20 animate-fade-in">
        <span className="eyebrow">Local stack · Undeployed · Lovable bridge</span>
        <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
          Run Midnight <span className="italic text-primary">on your machine</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
          The fastest way to connect a Lovable app to Midnight is to run a local standalone stack:
          node + indexer + proof-server in Docker on <code>localhost</code>. Your app runs in the browser,
          Lace points at <code>ws://localhost:9944</code>, and every SDK version is guaranteed to match the
          chain. No faucet, no DUST sync stalls, no Preprod quirks.
        </p>

        <div className="mt-8 p-4 border border-primary/30 bg-card">
          <span className="eyebrow text-primary">one command</span>
          <pre className="mt-3 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
            {STACK_CMD}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Requires Docker Desktop (macOS/Windows) or Docker Engine (Linux). First run pulls ~1&nbsp;GB
            and takes 2–5 minutes; later boots are seconds.
          </p>
        </div>

        <ol className="mt-10 space-y-8">
          <Step
            n={1}
            title="Docker running"
            body={
              <>
                Open Docker Desktop and wait for the whale icon, or on Linux run{" "}
                <code className="text-foreground">sudo systemctl start docker</code>. Then confirm{" "}
                <code className="text-foreground">docker info</code> works.
              </>
            }
          />
          <Step
            n={2}
            title="Start the local stack"
            body={
              <>
                In your project root run:
                <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
                  {STACK_CMD}
                </pre>
                The script writes <code>.midnight/standalone.docker-compose.yml</code>, pulls the pinned
                images, boots the three containers, and polls until the endpoints are ready.
              </>
            }
          />
          <Step
            n={3}
            title="Verify in the browser"
            body={
              <>
                Open{" "}
                <Link to="/undeployed-preflight" className="text-primary underline">
                  /undeployed-preflight
                </Link>{" "}
                in your Lovable app. Four green pills means the app can reach the local stack. If any
                pill is red, the exact endpoint and error are shown.
              </>
            }
          />
          <Step
            n={4}
            title="Point Lace at localhost"
            body={
              <>
                In Lace: Settings → Network → Custom → RPC = <code className="text-foreground">ws://localhost:9944</code>.
                The genesis wallet is pre-funded with unlimited tDUST, so there is no faucet step.
              </>
            }
          />
          <Step
            n={5}
            title="Deploy the contract"
            body={
              <>
                <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
                  VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
                </pre>
                Paste the printed hex address into <code className="text-foreground">VITE_DEFAULT_CONTRACT</code> in your Lovable secrets.
              </>
            }
          />
        </ol>

        <div className="mt-10 grid sm:grid-cols-2 gap-3 text-[11px]">
          <div className="p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="eyebrow text-primary">Lovable secrets</div>
              <CopyButton text={ENV_SNIPPET} />
            </div>
            <pre className="mt-2 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
              {ENV_SNIPPET}
            </pre>
          </div>
          <div className="p-4 border border-border bg-card">
            <div className="eyebrow text-primary">local endpoints</div>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground break-all">
              node · ws://localhost:9944
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground break-all">
              indexer · http://localhost:8088/api/v4/graphql
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground break-all">
              proof · http://localhost:6300
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em]">
          <Link
            to="/undeployed-preflight"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition-colors duration-500"
          >
            Open preflight →
          </Link>
          <Link
            to="/showcase/choreo-ledger-local"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Choreo Ledger (Local) →
          </Link>
          <Link
            to="/known-issues"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Known issues →
          </Link>
          <a
            href="https://midnightntwrk.github.io/servicedesk/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Service Desk ↗
          </a>
        </div>
      </article>
    </SiteShell>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="text-[10px] uppercase tracking-[0.24em] text-primary hover:text-foreground transition-colors"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
