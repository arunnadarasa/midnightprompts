import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { DockerSetupGuide } from "@/components/DockerSetupGuide";
import { MIDNIGHT_MATRIX, SUPPORT_MATRIX_URL } from "@/lib/midnight-matrix";

export const Route = createFileRoute("/undeployed")({
  head: () => ({
    meta: [
      { title: "Undeployed Quick Start — Local Midnight Stack for Lovable" },
      {
        name: "description",
        content:
          "Connect a Lovable app to a local Midnight Undeployed stack: one command starts the node, indexer, and proof server. Optional Fly.io recipe for hosting the same stack as a public demo.",
      },
      { property: "og:title", content: "Undeployed Quick Start — Local Midnight Stack" },
      {
        property: "og:description",
        content:
          "Run Midnight locally with Docker or host the same stack on Fly.io as a public demo — recipe, gotchas, and current open blockers.",
      },

    ],
  }),
  component: UndeployedPage,
});

const STACK_CMD = "bun scripts/midnight-standalone.mjs up";
const DEPLOY_CMD = "VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs";
const ENV_SNIPPET = `VITE_NETWORK_ID=undeployed
VITE_INDEXER_URL=http://localhost:8088/api/v4/graphql
VITE_INDEXER_WS_URL=ws://localhost:8088/api/v4/graphql/ws
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
            proof-server:{MIDNIGHT_MATRIX.localStack.proofServer} · midnight-node:{MIDNIGHT_MATRIX.localStack.node} · indexer-standalone:{MIDNIGHT_MATRIX.localStack.indexer}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Do not use <code>:latest</code> — the <code>midnight-node</code> latest tag frequently 404s, and
            mismatched versions cause ZKIR <code>/check 400</code> errors. This triple is the current
            local-dev combination from the{" "}
            <a href={SUPPORT_MATRIX_URL} className="text-primary hover:underline" target="_blank" rel="noreferrer">Midnight Support Matrix</a>.
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

        <section id="effectstream" className="mt-20 pt-10 border-t border-border scroll-mt-24">
          <span className="eyebrow text-primary">alternative · no docker · community</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 leading-[1.1]">
            Skip Docker with <span className="italic text-primary">Effectstream</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
            <a
              href="https://github.com/effectstream/effectstream"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline break-words"
            >
              effectstream/effectstream
            </a>{" "}
            is a community chain-abstraction orchestrator that wraps the Midnight node, indexer, and
            proof server as plain npm binaries — no Docker Desktop, no WSL, no BIOS virtualization.
            One <code>bunx</code> command supervises the whole dev stack (node + indexer + proof
            server + your deploy step + frontend) with <code>status</code> and <code>logs</code>
            subcommands. If Docker is fighting you on Windows, this is the fastest path back to
            building.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="p-5 border border-border bg-card">
              <h3 className="font-display text-lg mb-3">1 · Install the binaries</h3>
              <pre className="text-[11px] sm:text-xs bg-background border border-border p-3 overflow-x-auto leading-relaxed">
{`bun add -d @effectstream/midnight-node \\
  @effectstream/midnight-indexer \\
  @effectstream/midnight-proof-server \\
  @effectstream/orchestrator`}
              </pre>
              <p className="mt-3 text-xs text-muted-foreground">
                Same binaries the Midnight team ships — just resolved through npm instead of Docker
                Hub.
              </p>
            </div>
            <div className="p-5 border border-border bg-card">
              <h3 className="font-display text-lg mb-3">2 · Run the dev loop</h3>
              <pre className="text-[11px] sm:text-xs bg-background border border-border p-3 overflow-x-auto leading-relaxed">
{`bunx orchestrator start --background
bunx orchestrator status
bunx orchestrator logs
bunx orchestrator stop`}
              </pre>
              <p className="mt-3 text-xs text-muted-foreground">
                Once running, point <code>VITE_INDEXER_URL</code>,{" "}
                <code>VITE_PROOF_SERVER_URL</code>, and node RPC at the local ports the orchestrator
                prints on start.
              </p>
            </div>
          </div>

          <div className="mt-6 p-5 border border-border bg-card">
            <h3 className="font-display text-lg mb-2">Reference templates worth reading</h3>
            <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
              <li>
                <a
                  href="https://github.com/effectstream/effectstream/tree/v-next/templates/evm-midnight-v2"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  templates/evm-midnight-v2
                </a>{" "}
                — EVM + Midnight, ERC-721 sync, ZK contracts, full React frontend. Closest match to
                a hackathon dApp that spans two chains.
              </li>
              <li>
                <a
                  href="https://github.com/effectstream/effectstream/tree/v-next/templates/zswap-da"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  templates/zswap-da
                </a>{" "}
                — Midnight Zswap for decentralized liquidity. Good reference for anyone building
                token-flow demos on Undeployed.
              </li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-muted-foreground max-w-2xl">
            Community project — not an official Midnight release. If a binary version drifts from
            the{" "}
            <a
              href="https://docs.midnight.network/relnotes/support-matrix"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              support matrix
            </a>
            , fall back to the Docker Compose recipe above.
          </p>
        </section>

        <section id="fly" className="mt-20 pt-10 border-t border-border scroll-mt-24">

          <span className="eyebrow text-primary">optional · public demo · fly.io</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 leading-[1.1]">
            Host the same stack <span className="italic text-primary">on Fly.io</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
            Local Docker is perfect for solo dev. But when a judge or teammate needs to hit your dApp
            with Lace from their own laptop, you need the Undeployed stack on public infra. Here's the
            recipe distilled from the{" "}
            <a
              href="https://choreokits.lovable.app/"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline break-words"
            >
              Tokenized Choreo Kits
            </a>{" "}
            build — including the blocker that's still open.
          </p>

          {/* 1. Topology */}
          <div className="mt-8 p-5 border border-border bg-card">
            <div className="eyebrow text-primary">1 · four-app topology</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                <code className="text-foreground">choreo-node</code> — Midnight standalone node,{" "}
                <strong>6PN-internal only</strong>, reached as{" "}
                <code className="text-foreground break-all">ws://choreo-node.internal:9944</code>. No
                public HTTP.
              </li>
              <li>
                <code className="text-foreground">choreo-indexer</code> — public HTTPS + WSS on{" "}
                <code className="text-foreground break-all">/api/v4/graphql</code>.
              </li>
              <li>
                <code className="text-foreground">choreo-proof</code> — public HTTPS proof server.
              </li>
              <li>
                <code className="text-foreground">choreo-faucet</code> — public HTTPS{" "}
                <code className="text-foreground">/grant</code> endpoint, in-memory rate limit,
                pre-funded once from the genesis seed.
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Bootstrap shape:{" "}
              <code className="text-foreground break-all">scripts/fly-bootstrap.sh</code> creates all
              four apps + a 1&nbsp;GB volume for the node, sets{" "}
              <code className="text-foreground">FAUCET_SEED</code>, and deploys.
            </p>
          </div>

          {/* 2. Gotchas */}
          <div className="mt-4 p-5 border border-border bg-card">
            <div className="eyebrow text-primary">2 · non-obvious gotchas</div>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground leading-relaxed">
              <li>
                Proof server needs <code className="text-foreground">memory = "2gb"</code> — the k=13
                proving key OOMs on 1&nbsp;GB mid-mint.
              </li>
              <li>
                <code className="text-foreground">auto_stop_machines = false</code> on proof + node.
                Cold start is ~4 min of user-visible "Proving…".
              </li>
              <li>
                Proof-server binary is IPv4-only. Fine as-is via the public{" "}
                <code className="text-foreground break-all">https://…fly.dev</code> URL (fly-proxy
                enters over IPv4). If you ever need 6PN access, add a{" "}
                <code className="text-foreground">socat</code> sidecar binding{" "}
                <code className="text-foreground">[::]</code> → <code className="text-foreground">127.0.0.1</code>.
              </li>
              <li>
                Node RPC must bind IPv6 or the indexer/faucet can't reach it via{" "}
                <code className="text-foreground">.internal</code>:
                <pre className={PRE_CLASS}>{`[processes]
app = "--experimental-rpc-endpoint \\"listen-addr=[::]:9944,methods=unsafe\\""`}</pre>
              </li>
              <li>
                Never scale <code className="text-foreground">choreo-node</code> above 1 machine —
                two machines = two participants = forked chain. Run{" "}
                <code className="text-foreground">flyctl scale count 1</code> after every deploy.
              </li>
              <li>
                No <code className="text-foreground">[http_service]</code> on the node — expose port
                9944 via <code className="text-foreground">[[services]]</code> only, so it stays
                6PN-internal.
              </li>
              <li>
                Pin <code className="text-foreground">midnight-node:{MIDNIGHT_MATRIX.localStack.node}</code>. Do{" "}
                <strong>not</strong> bump to 2.x — those are Partner Chain builds that need Cardano{" "}
                <code className="text-foreground">db-sync</code> and crash-loop on standalone.
              </li>
              <li>
                Persistent <code className="text-foreground">chain_data</code> volume (1&nbsp;GB) on the
                node — wipe it and every previously-deployed contract address becomes invalid.
              </li>
              <li>
                Faucet wallet has to be pre-funded once from the genesis seed{" "}
                <code className="text-foreground">…0002</code> before <code className="text-foreground">/grant</code>{" "}
                works. Hit <code className="text-foreground">/health</code> to see the balance while it
                syncs.
              </li>
            </ul>
          </div>

          {/* 3. Open blocker */}
          <div className="mt-4 p-5 border border-amber-500/40 bg-amber-500/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-amber-500 font-semibold">
                ⚠ open blocker
              </span>
              <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                standalone node stuck at block #0
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              On Fly, <code className="text-foreground">midnight-node:{MIDNIGHT_MATRIX.localStack.node}</code> with{" "}
              <code className="text-foreground">CFG_PRESET=dev</code> +{" "}
              <code className="text-foreground break-all">SIDECHAIN_BLOCK_BENEFICIARY=&lt;hex&gt;</code>{" "}
              boots in <strong>partner-chain mode</strong>, not standalone sealer mode. Logs show{" "}
              <code className="text-foreground">Idle (0 peers)</code> forever and one line:{" "}
              <code className="text-foreground break-all">Failed to trigger bootstrap: No known peers</code>.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Downstream effect: the faucet wallet (<code className="text-foreground">buildFromSeed</code>)
              never finishes sync, <code className="text-foreground">getUnshieldedAddress()</code>{" "}
              returns <code className="text-foreground">null</code>, and{" "}
              <code className="text-foreground">/grant</code> returns 503{" "}
              <code className="text-foreground">faucet warming up</code>. Proof and indexer are
              healthy in this state (<code className="text-foreground">/version</code> →{" "}
              <code className="text-foreground">8.0.3</code>; GraphQL{" "}
              <code className="text-foreground">{"{ __typename }"}</code> responds on{" "}
              <code className="text-foreground break-all">/api/v4/graphql</code>) — the blocker is
              block <em>authoring</em>, not plumbing.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Working theory: <code className="text-foreground">SIDECHAIN_BLOCK_BENEFICIARY</code> alone
              flips the image into partner-chain expectations. A standalone <code className="text-foreground">--dev</code>{" "}
              sealer needs a different env combination, or the entrypoint expects a flag that{" "}
              <code className="text-foreground">[processes]</code> in{" "}
              <code className="text-foreground break-all">fly/node/fly.toml</code> is currently
              overriding.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Next probe: <code className="text-foreground break-all">flyctl ssh console -a choreo-node</code>,
              dump <code className="text-foreground">/entrypoint.sh</code> and the image's supported env
              vars, then diff against{" "}
              <a
                href="https://github.com/midnightntwrk/midnight-local-dev/blob/main/standalone.yml"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline break-all"
              >
                midnight-local-dev/standalone.yml
              </a>
              , which authors blocks fine locally with the same tag.
            </p>
            <p className="mt-3 text-sm text-foreground leading-relaxed">
              <strong>Workaround while unresolved:</strong> use the local Docker stack above for
              Undeployed. Fly hosting only unlocks once the standalone sealer boots.
            </p>
          </div>

          {/* 4. Deploy flow */}
          <div className="mt-4 p-5 border border-border bg-card">
            <div className="eyebrow text-primary">3 · deploy flow (once the blocker clears)</div>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed list-decimal pl-5">
              <li>
                <code className="text-foreground break-all">scripts/fly-bootstrap.sh</code> — creates
                the 4 apps + volume + secrets, deploys all four.
              </li>
              <li>
                Fund the faucet once by sending tDUST from the genesis deployer wallet (seed{" "}
                <code className="text-foreground">…0002</code>) to the address shown by{" "}
                <code className="text-foreground">/health</code>.
              </li>
              <li>
                <code className="text-foreground break-all">scripts/fly-deploy-contract.sh</code> runs
                on a Fly Machine (so it reaches{" "}
                <code className="text-foreground break-all">choreo-node.internal</code> over 6PN) and
                prints the contract address.
              </li>
              <li>
                Paste that hex into your app's{" "}
                <code className="text-foreground">VITE_DEFAULT_CONTRACT</code> env var and republish.
              </li>
            </ol>
          </div>

          {/* 5. When to reach for it */}
          <div className="mt-4 p-5 border border-border bg-card">
            <div className="eyebrow text-primary">4 · when to reach for fly vs local docker</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong>Local Docker</strong> for offline dev, preflight, and iteration. <strong>Fly</strong>{" "}
              when you need a publicly demoable dApp that any judge with Lace can hit from their own
              laptop.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-amber-500">⚠ Fly is public infra.</strong> Treat{" "}
              <code className="text-foreground">FAUCET_SEED</code> like a real key, keep the{" "}
              <code className="text-foreground">/grant</code> rate limit on, and never point Lace at
              the hosted node from a Mainnet account.
            </p>
          </div>
        </section>
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
