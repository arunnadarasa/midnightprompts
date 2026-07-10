import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — verifiable ZK demos in one Lovable build" },
      { name: "description", content: "How to ship a Midnight ZK demo in a single Lovable build: five secrets, one paste, a Compact contract live on the preview testnet, Lace wallet, private witnesses, IPFS content." },
      { property: "og:title", content: "Real ZK privacy in one Lovable build" },
      { property: "og:description", content: "Build-time pattern for Lovable + Midnight Network hackathon entries." },
    ],
  }),
  component: StrategyPage,
});

const CONTRACT_SNIPPET = `// contracts/TimestampLog.compact — every contract carries the hackathon credit as a header comment
// Built during the Creative AI & Quantum Hackathon
// organised by StreetKode Fam during Indian Krump Festival 14
pragma language_version 0.23;

import CompactStandardLibrary;

export ledger entry_count: Counter;
export ledger last_message: Opaque<"string">;
export ledger last_author_commitment: Bytes<32>;

witness localSecretKey(): Bytes<32>;

constructor() {
  entry_count.increment(1);
  last_message = disclose("(empty)");
}

export circuit appendEntry(newMessage: Opaque<"string">): [] {
  const sk = localSecretKey();
  const seq = entry_count as Field as Bytes<32>;
  last_author_commitment = disclose(
    persistentHash<Vector<3, Bytes<32>>>([pad(32, "log:author:"), seq, sk])
  );
  last_message = disclose(newMessage);
  entry_count.increment(1);
}
`;

const COMPILE_SNIPPET = `# One-time toolchain install
curl --proto '=https' --tlsv1.2 -LsSf \\
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc
compact update

# Compile — produces ZK proving keys + TypeScript bindings
compact compile contracts/TimestampLog.compact contracts/managed/timestamp-log

# Serve the ZK keys to the browser (FetchZkConfigProvider reads them from /keys and /zkir)
cp -r contracts/managed/timestamp-log/keys ./public/keys
cp -r contracts/managed/timestamp-log/zkir ./public/zkir

# Start the local proof server (all tx submits go through this)
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
`;

const PINATA_SNIPPET = `// src/lib/pinata.ts — pin a Blob to IPFS, then commit the CID via Compact
export async function pinToIPFS(file: Blob, name = "artifact") {
  const fd = new FormData(); fd.append("file", file, name);
  const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: \`Bearer \${import.meta.env.VITE_PINATA_JWT}\` },
    body: fd,
  });
  return (await r.json()).IpfsHash as string; // the CID — commit this to the ledger
}
`;

const LACE_SNIPPET = `// src/lib/lace.ts — Lace wallet detection + provider bootstrap (client-only)
import { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import semver from 'semver';

export async function initProviders() {
  const net = import.meta.env.VITE_NETWORK_ID ?? 'preview';
  setNetworkId(net);
  const lace = await new Promise<any>((res, rej) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      const w = Object.values((window as any).midnight ?? {}).find((x: any) =>
        x && 'apiVersion' in x && semver.satisfies(x.apiVersion, '4.x'));
      if (w) { clearInterval(iv); res(w); }
      else if (Date.now() - t0 > 5000) { clearInterval(iv); rej(new Error('Install Lace: https://www.lace.io/')); }
    }, 100);
  });
  const api = await lace.connect(net);
  const cfg = await api.getConfiguration();
  const zk = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  return {
    connectedAPI: api,
    proofProvider: httpClientProofProvider(cfg.proverServerUri ?? import.meta.env.VITE_PROOF_SERVER_URL, zk),
    publicDataProvider: indexerPublicDataProvider(cfg.indexerUri, cfg.indexerWsUri),
    zkConfigProvider: zk,
  };
}
`;

const RECIPE = `# 1. In your Lovable project, add five secrets (Settings -> Secrets):
VITE_NETWORK_ID=preview
VITE_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=http://localhost:6300
VITE_DEFAULT_CONTRACT=<paste the address printed by your first deploy>

# Optional (only for ideas that pin artefacts to IPFS):
VITE_PINATA_JWT=eyJhbGciOi...

# 2. Install the Lace wallet extension:
open https://www.lace.io/

# 3. Get testnet DUST from the faucet:
open https://cloud.google.com/application/web3/faucet/midnight/testnet

# 4. Start the local proof server (one terminal tab, leave running):
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v

# 5. Copy a mega-prompt from this repo into Lovable. One paste:
#    - scaffolds the React + Vite app with WASM + top-level-await plugins
#    - writes the Compact contract (with hackathon credit in the header)
#    - wires Lace detection, provider bootstrap, and the witness callback
#    - shows Proving -> Balancing -> Submitting -> Confirmed transaction states
#    - reads public ledger state from the Midnight Indexer
#    - exposes the contract address + explorer link in the UI

# 6. Open the Midnight explorer link. Your demo is provably private, provably on chain.
`;

function StrategyPage() {
  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <div className="eyebrow text-primary mb-4">build strategy · midnight</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95] tracking-tight text-foreground">
          Real ZK privacy, <span className="text-primary italic">five secrets</span>, one build.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-light">
          Every mega-prompt in this repo uses the same pattern, because it's the
          only pattern that lets a Lovable account ship a verifiable Midnight demo in one shot.
        </p>

        <section className="mt-10 p-6 border border-primary/30 bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why Midnight and not Ethereum?</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-light">
            Midnight is a privacy-first Layer 1 where every smart contract is a triple: a
            public ledger, a ZK circuit, and a local off-chain component. Circuit parameters
            are private by default — moving anything to public state requires an explicit
            <code className="mx-1 text-foreground">disclose()</code> call, so leaks become
            compile errors instead of runtime bugs. The preview testnet is funded by a free
            tDUST faucet; the block explorer, indexer, and Lace wallet are the same tooling
            you'd use on mainnet. Move to mainnet after the hackathon by flipping <code className="text-foreground">VITE_NETWORK_ID</code>.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">The recipe</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">recipe</span>
            <CopyButton text={RECIPE} label="Copy recipe" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[12px] sm:text-[13px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{RECIPE}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">1. The Compact contract — credit baked in</h2>
          <p className="text-sm text-muted-foreground mb-3 font-light">
            Every <code className="text-foreground">.compact</code> file deployed from a Creative Midnight prompt MUST carry the hackathon credit as a header comment,
            so provenance lives alongside the ZK verifying key.
          </p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">contracts/TimestampLog.compact</span>
            <CopyButton text={CONTRACT_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{CONTRACT_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">2. Compile & run the proof server</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">terminal</span>
            <CopyButton text={COMPILE_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{COMPILE_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">3. Lace wallet + provider bootstrap</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/lib/lace.ts</span>
            <CopyButton text={LACE_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{LACE_SNIPPET}</pre>
        </section>

        <section className="mt-6 p-5 border border-primary/30 bg-card">
          <div className="eyebrow text-primary">wallet · lace</div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-light">
            Lace ships as a <strong className="text-foreground">mobile wallet</strong> today
            (iOS / Android, the MetaMask / Phantom equivalent for the Cardano ecosystem) — but
            <strong className="text-foreground"> only for Cardano</strong>. Midnight support
            on mobile is not shipped yet, so for these demos install the Lace
            <strong className="text-foreground"> desktop browser extension</strong> and switch
            it to Midnight preview / preprod.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a href="https://www.lace.io/" target="_blank" rel="noreferrer" className="text-primary underline">Get Lace ↗</a>
            <a href="https://docs.midnight.network/blog/connect-dapp-lace-wallet" target="_blank" rel="noreferrer" className="text-primary underline">Connect a dApp with Lace ↗</a>
            <a href="https://docs.midnight.network/relnotes/overview" target="_blank" rel="noreferrer" className="text-primary underline">Midnight release notes ↗</a>
          </div>
        </section>


        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">4. Pin artefacts to IPFS (optional)</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/lib/pinata.ts</span>
            <CopyButton text={PINATA_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{PINATA_SNIPPET}</pre>
        </section>

        <section className="mt-10 p-6 border border-border bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Hackathon rules of thumb</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground font-light">
            <li>· One mega-prompt = one build message. Don't iterate the architecture, iterate the UI.</li>
            <li>· Always show the live Midnight explorer link in the UI — that's your proof.</li>
            <li>· Design for 30–120s proof latency. Show a Proving state; keep the rest of the UI usable.</li>
            <li>· Private-witness ideas: never send the 32-byte secret over the network. localStorage only.</li>
            <li>· Add a "Built during the Creative AI &amp; Quantum Hackathon — StreetKode Fam · Indian Krump Festival 14" line to your footer.</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/themes" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition">
            Pick an idea →
          </Link>
          <Link to="/quantum-primer" className="px-5 py-2.5 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition">
            Midnight primer
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
