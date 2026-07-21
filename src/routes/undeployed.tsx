import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { DockerSetupGuide } from "@/components/DockerSetupGuide";

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
const DEPLOY_CMD = "VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs";
const ENV_SNIPPET = `VITE_NETWORK_ID=undeployed
VITE_INDEXER_URL=http://localhost:8088/api/v1/graphql
VITE_INDEXER_WS_URL=ws://localhost:8088/api/v1/graphql/ws
VITE_NODE_RPC=ws://localhost:9944
VITE_PROOF_SERVER_URL=http://localhost:6300`;

const PRE_CLASS =
  "mt-2 p-2 sm:p-3 bg-background border border-border font-mono text-[10px] sm:text-[11px] leading-relaxed whitespace-pre-wrap break-all";

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="flex gap-3 sm:gap-4">
      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 border border-primary flex items-center justify-center text-primary font-display text-base sm:text-lg">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg sm:text-xl text-foreground">{title}</h3>
        <div className="mt-2 text-sm text-muted-foreground leading-relaxed break-words">{body}</div>
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

        <div className="mt-8 p-4 border border-primary/30 bg-card overflow-hidden">
          <span className="eyebrow text-primary">one command</span>
          <pre className={PRE_CLASS}>{STACK_CMD}</pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Requires Docker Desktop (macOS/Windows) or Docker Engine (Linux). First run pulls ~1&nbsp;GB
            and takes 2–5 minutes; later boots are seconds.
          </p>
        </div>

        <div className="mt-4 p-4 border border-border bg-card overflow-hidden">
          <span className="eyebrow text-primary">pinned versions</span>
          <div className="mt-2 font-mono text-[10px] sm:text-[11px] text-muted-foreground break-all leading-relaxed">
            proof-server:8.0.3 · midnight-node:0.22.5 · indexer-standalone:4.0.2
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Do not use <code>:latest</code> — the <code>midnight-node</code> latest tag frequently 404s, and
            mismatched versions cause ZKIR <code>/check 400</code> errors. This triple is the current
            known-good combination.
          </p>
        </div>

        <div className="mt-6">
          <DockerSetupGuide />
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
                <pre className={PRE_CLASS}>{STACK_CMD}</pre>
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
                In Lace: Settings → Network → Custom → RPC ={" "}
                <code className="text-foreground break-all">ws://localhost:9944</code>. Lace will label the
                network "Preview" — that's cosmetic; the address prefix{" "}
                <code className="text-foreground break-all">mn_addr_undeployed1…</code> is the truth.
                No tNIGHT → tDUST dance here — that trap is Preview / Preprod only. The genesis wallet is
                pre-funded with unlimited tDUST.
              </>
            }
          />
          <Step
            n={5}
            title="Deploy the contract"
            body={
              <>
                <pre className={PRE_CLASS}>{DEPLOY_CMD}</pre>
                The deploy script builds a headless wallet from the genesis seed{" "}
                <code className="text-foreground break-all">0x000…0002</code> directly — Lace isn't
                required for the deploy itself. Paste the printed hex address into{" "}
                <code className="text-foreground break-all">VITE_DEFAULT_CONTRACT</code> in your Lovable
                secrets.{" "}
                <Link to="/llms" hash="skills" className="text-primary underline">
                  Grab the lovable-midnight skill →
                </Link>{" "}
                to bake all nine deploy-script rules into your own Lovable account.
              </>
            }
          />
          <Step
            n={6}
            title="Wire the wallet UI (optional)"
            body={
              <>
                For the Connect-Lace button, RPC-mode toggle, and shielded/unshielded address readout, copy
                the boilerplate from{" "}
                <Link to="/wallet" className="text-primary underline">
                  /wallet
                </Link>
                . It handles the DApp Connector v4 handshake and enumerates wallets by <code>apiVersion</code>.
              </>
            }
          />
        </ol>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 text-[11px]">
          <div className="p-4 border border-border bg-card min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="eyebrow text-primary">Lovable secrets</div>
              <CopyButton text={ENV_SNIPPET} />
            </div>
            <pre className="mt-2 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all leading-relaxed">
              {ENV_SNIPPET}
            </pre>
          </div>
          <div className="p-4 border border-border bg-card min-w-0 overflow-hidden">
            <div className="eyebrow text-primary">local endpoints</div>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground break-all leading-relaxed">
              node · ws://localhost:9944
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground break-all leading-relaxed">
              indexer · http://localhost:8088/api/v1/graphql
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground break-all leading-relaxed">
              proof · http://localhost:6300
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:flex sm:flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em]">
          <Link
            to="/undeployed-preflight"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition-colors duration-500"
          >
            Open preflight →
          </Link>
          <Link
            to="/showcase/choreo-ledger-local"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Choreo Ledger (Local) →
          </Link>
          <Link
            to="/known-issues"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Known issues →
          </Link>
          <a
            href="https://midnightntwrk.github.io/servicedesk/"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
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
      className="text-[10px] uppercase tracking-[0.24em] text-primary hover:text-foreground transition-colors shrink-0"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
