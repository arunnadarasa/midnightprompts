import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTRACTS, isDeployed } from "@/data/midnight-contract";
import { WalletConnectPanel } from "@/components/WalletConnectPanel";

export const Route = createFileRoute("/showcase/choreo-ledger-local")({
  head: () => ({
    meta: [
      { title: "Choreo Ledger (Local Undeployed) — Showcase" },
      {
        name: "description",
        content:
          "Run the Compact choreography ledger against a local Midnight standalone stack (NetworkId.Undeployed). Zero-DUST loop, no faucet, no Preprod sync bugs — Midnight DevRel's advised local dev path.",
      },
      { property: "og:title", content: "Choreo Ledger — Local Undeployed Network" },
      {
        property: "og:description",
        content:
          "The same Compact contract, run against a local node + indexer + proof-server. Bypasses Preprod DUST sync issues entirely.",
      },
    ],
  }),
  component: ChoreoLedgerLocalDemo,
});

function ChoreoLedgerLocalDemo() {
  const cfg = CONTRACTS.undeployed;
  const deployed = isDeployed(cfg);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Demo 04 · Local · Undeployed · Zero-DUST</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Choreo Ledger <span className="italic text-primary">(Local)</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        The same <code>TimestampLog.compact</code> contract from Demo 01, run against a{" "}
        <strong className="text-foreground">local Midnight standalone stack</strong> instead of
        Preprod. This is the path Midnight DevRel currently recommends for reviewers: no faucet,
        no tDUST scarcity, no <code>1010 InvalidDustSpendProof</code>, no{" "}
        <code>/check 400</code> — the local node mints tokens to the genesis wallet and every
        version is guaranteed to match.
      </p>

      <div className="mt-4 p-4 border border-primary/30 bg-card text-[12px] leading-relaxed">
        <span className="eyebrow text-primary">why undeployed?</span>
        <p className="mt-2 text-muted-foreground">
          <code>NetworkId.Undeployed</code> is a fully local devnet: node + indexer +
          proof-server all on <code>localhost</code>. The bech32 suffix on every address is{" "}
          <code>undeployed</code> (Lace labels this network as "Preview" in its UI, but the
          addresses are prefixed <code>mn_shield-addr_undeployed1…</code>). See the{" "}
          <Link to="/known-issues" className="text-primary underline">
            known issues page
          </Link>{" "}
          for why this bypasses the current Preprod DUST bugs.
        </p>
      </div>

      <div className="mt-8">
        <WalletConnectPanel expectedNetwork="undeployed" />
      </div>

      <div className="mt-10 p-6 sm:p-8 border border-primary/30 bg-card">
        <h2 className="font-display text-2xl">Run it locally</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Requires Docker Desktop running. Everything else — node, indexer, proof-server — is a
          single compose file.
        </p>

        <ol className="mt-5 space-y-4 text-sm text-foreground/90 list-decimal pl-5">
          <li>
            <strong>Start the standalone stack.</strong> Grab the canonical{" "}
            <code>standalone.yml</code> from{" "}
            <a
              href="https://github.com/midnightntwrk/example-hello-world"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              midnightntwrk/example-hello-world
            </a>{" "}
            and boot it:
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
              {`docker compose -f standalone.yml up -d --wait`}
            </pre>
          </li>
          <li>
            <strong>Sanity-check the proof server:</strong>
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
              {`curl http://localhost:6300/health
# → {"status":"ok","timestamp":"..."}`}
            </pre>
          </li>
          <li>
            <strong>Point Lace at the local node.</strong> Add a custom network in Lace →
            Midnight settings with node <code>ws://localhost:9944</code> and indexer{" "}
            <code>{cfg.indexerHttp}</code>. Switch Lace to that network. (Lace displays it as
            "Preview" — that's expected; the address prefix confirms it's Undeployed.)
          </li>
          <li>
            <strong>Deploy the contract locally:</strong>
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
              {`VITE_NETWORK_ID=undeployed \\
VITE_INDEXER_URL=${cfg.indexerHttp} \\
VITE_INDEXER_WS_URL=${cfg.indexerWs} \\
VITE_NODE_RPC=${cfg.rpc} \\
bun scripts/deploy-midnight.mjs`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Writes <code>src/data/midnight-contract.undeployed.json</code>; this page hydrates
              on the next reload.
            </p>
          </li>
          <li>
            <strong>Reload the page.</strong> Wallet panel above should show{" "}
            <code>network · undeployed</code>; the address block below should switch from
            placeholder to a real hex contract ID.
          </li>
        </ol>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3 text-[11px]">
        <div className="p-4 border border-border bg-card">
          <div className="eyebrow text-primary">contract address · undeployed</div>
          <div className="font-mono mt-2 break-all">
            {deployed
              ? cfg.address
              : "0x00… (awaiting local deploy — see steps above)"}
          </div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="eyebrow text-primary">local endpoints</div>
          <div className="font-mono mt-2 break-all text-muted-foreground">
            node · {cfg.rpc}
          </div>
          <div className="font-mono mt-1 break-all text-muted-foreground">
            indexer · {cfg.indexerHttp}
          </div>
          <div className="font-mono mt-1 break-all text-muted-foreground">
            proof · http://localhost:6300
          </div>
        </div>
      </div>

      <div className="mt-8 p-5 border border-border bg-card text-[12px] leading-relaxed">
        <span className="eyebrow text-primary">expected address prefixes</span>
        <div className="mt-2 font-mono text-muted-foreground break-all">
          {cfg.unshieldedPrefix}… · {cfg.addressPrefix}…
        </div>
        <p className="mt-3 text-muted-foreground">
          Both the deploy script and <code>WalletConnectPanel</code> hard-fail on prefix
          mismatch, so a stray <code>preview</code> / <code>test</code> suffix would abort
          before any funds move.
        </p>
      </div>

      <div className="mt-8">
        <Link to="/known-issues" className="text-primary underline text-sm">
          ← Back to known issues (why local devnet is the current recommendation)
        </Link>
      </div>
    </div>
  );
}
