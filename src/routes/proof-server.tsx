import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import contractInfo from "@/data/midnight-contract.json";

const PLACEHOLDER_ADDRESS = "0000000000000000000000000000000000000000000000000000000000000000";

function DeployStatus() {
  const isDeployed = contractInfo.address && contractInfo.address !== PLACEHOLDER_ADDRESS;
  const explorerBase = contractInfo.explorer?.replace(/\/$/, "") ?? "https://preprod.midnightexplorer.com";
  const addressUrl = isDeployed ? `${explorerBase}/contract/${contractInfo.address}` : null;
  const txUrl = contractInfo.deployTx ? `${explorerBase}/tx/${contractInfo.deployTx}` : null;

  return (
    <div className={`border p-5 ${isDeployed ? "border-primary/60 bg-primary/5" : "border-dashed border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow text-primary">deploy status</span>
        <span className={`text-[10px] tracking-[0.28em] uppercase font-semibold ${isDeployed ? "text-primary" : "text-muted-foreground"}`}>
          {isDeployed ? "● live on preprod" : "○ awaiting deploy"}
        </span>
      </div>
      {isDeployed ? (
        <div className="mt-3 space-y-2 text-xs font-light text-muted-foreground leading-relaxed">
          <div>
            <span className="text-foreground uppercase tracking-[0.2em] text-[10px]">Address</span>
            <div className="font-mono text-foreground text-[11px] break-all mt-1">{contractInfo.address}</div>
          </div>
          {contractInfo.deployTx && (
            <div>
              <span className="text-foreground uppercase tracking-[0.2em] text-[10px]">Deploy tx</span>
              <div className="font-mono text-foreground text-[11px] break-all mt-1">{contractInfo.deployTx}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {addressUrl && (
              <a href={addressUrl} target="_blank" rel="noreferrer" className="px-3 py-2 border border-primary/40 text-primary text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition">
                View contract ↗
              </a>
            )}
            {txUrl && (
              <a href={txUrl} target="_blank" rel="noreferrer" className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition">
                View tx ↗
              </a>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground font-light leading-relaxed">
          Run the deploy script below. On success it writes the address + tx hash into{" "}
          <span className="font-mono text-foreground">src/data/midnight-contract.json</span> and this panel
          hydrates with an explorer link on next refresh.
        </p>
      )}
    </div>
  );
}

export const Route = createFileRoute("/proof-server")({
  head: () => ({
    meta: [
      { title: "Proof Server · Creative Midnight" },
      { name: "description", content: "Run the Midnight proof server locally with Docker to generate zero-knowledge proofs and deploy Compact contracts to preprod." },
      { property: "og:title", content: "Proof Server · Creative Midnight" },
      { property: "og:description", content: "Run the Midnight proof server locally with Docker to generate zero-knowledge proofs and deploy Compact contracts to preprod." },
    ],
  }),
  component: ProofServer,
});

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-card border border-border p-4 overflow-x-auto text-[12px] leading-relaxed text-foreground font-mono whitespace-pre-wrap break-all">
      {children}
    </pre>
  );
}

function ProofServer() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="eyebrow">infrastructure · midnight</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">
          Proof Server — <span className="italic text-primary">local ZK proving.</span>
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed font-light max-w-2xl">
          Every contract deploy and shielded transaction on Midnight generates a zero-knowledge
          proof against your private witness data. That proof is minted by the{" "}
          <span className="text-foreground">proof server</span> — a service you run on your own
          machine so the witness never leaves it. There is no hosted equivalent, by design.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <div className="border-l-2 border-primary/50 pl-4 py-2 text-[13px] text-muted-foreground font-light leading-relaxed">
          <span className="text-primary uppercase tracking-[0.24em] text-[10px] font-semibold">Why local?</span>
          <p className="mt-2">
            The proof server needs your <span className="text-foreground">local secret key</span> to
            build the proof. Exposing that endpoint publicly would defeat Midnight's privacy model.
            Run it on <span className="text-foreground">your laptop</span>, your Codespace, or a
            trusted VM — never on shared infrastructure.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <DeployStatus />
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-14 space-y-8">
        <div>
          <span className="eyebrow text-primary">step 01</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Install Docker Desktop</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            The proof server ships only as a Docker image (<span className="text-foreground">midnightntwrk/proof-server</span>).
            No native binary, npm package, or WASM build exists as of Ledger v8. Install Docker
            Desktop on macOS / Windows, or the Docker Engine on Linux.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://www.docker.com/products/docker-desktop/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition"
            >
              Docker Desktop ↗
            </a>
            <a
              href="https://hub.docker.com/r/midnightntwrk/proof-server"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition"
            >
              Docker Hub image ↗
            </a>
          </div>
        </div>

        <div>
          <span className="eyebrow text-primary">step 02</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Boot the proof server</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            One command. It listens on <span className="text-foreground">http://localhost:6300</span>{" "}
            — the default the Midnight SDK expects. Keep it running while you deploy.
          </p>
          <div className="mt-3">
            <Code>{`docker run -d --name midnight-proof-server \\
  -p 6300:6300 \\
  midnightntwrk/proof-server:latest \\
  midnight-proof-server -v`}</Code>
          </div>
          <p className="mt-3 text-xs text-muted-foreground font-light">
            Check it's up: <span className="text-foreground font-mono">curl http://localhost:6300/health</span>.
            First proof after boot is slow (~30–120s) while the container warms; subsequent proofs
            are fast.
          </p>
        </div>

        <div>
          <span className="eyebrow text-primary">step 03</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Fund your wallet with tDUST</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            The faucet dispenses <span className="text-foreground">tNIGHT</span>, not tDUST. Paste your{" "}
            <span className="text-foreground">unshielded</span> Lace address (starts with{" "}
            <span className="font-mono">mn_addr_preprod1…</span>) into the preprod faucet, then in Lace
            click <span className="text-foreground">Generate tDUST</span> to delegate. Deploy spends tDUST.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://midnight-tmnight-preprod.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="border border-border hover:border-primary/50 p-4 flex flex-col gap-1 transition"
            >
              <span className="eyebrow text-primary">preprod</span>
              <span className="text-foreground text-sm">Faucet ↗</span>
              <span className="text-[10px] text-muted-foreground font-mono break-all">midnight-tmnight-preprod.nethermind.dev</span>
            </a>
            <Link
              to="/wallet"
              className="border border-border hover:border-primary/50 p-4 flex flex-col gap-1 transition"
            >
              <span className="eyebrow text-primary">wallet</span>
              <span className="text-foreground text-sm">Install Lace →</span>
              <span className="text-[10px] text-muted-foreground">Browser extension + tDUST guide</span>
            </Link>
          </div>
        </div>

        <div>
          <span className="eyebrow text-primary">step 04</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Deploy TimestampLog.compact</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            Clone this repo, paste your funded 24-word mnemonic into{" "}
            <span className="font-mono text-foreground">.midnight-wallet.local</span> (mode 0600, gitignored),
            then run the deploy script. It syncs the wallet, loads the compiled ZK keys from{" "}
            <span className="font-mono text-foreground">contracts/managed/timestamp-log/</span>, and
            calls <span className="font-mono text-foreground">deployContract</span> — proving happens
            against your local proof server.
          </p>
          <div className="mt-3">
            <Code>{`# in the repo root
bun install
echo "your twenty four word mnemonic here" > .midnight-wallet.local
chmod 600 .midnight-wallet.local

bun scripts/deploy-midnight.mjs`}</Code>
          </div>
          <p className="mt-3 text-xs text-muted-foreground font-light">
            On success the script writes <span className="font-mono text-foreground">src/data/midnight-contract.json</span>{" "}
            with <span className="font-mono">address</span>, <span className="font-mono">deployTx</span>, and{" "}
            <span className="font-mono">verified: true</span>, then prints the MidnightScan preprod URL.
          </p>
        </div>

        <div>
          <span className="eyebrow text-primary">step 05</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Wire it back into the site</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            Paste the resulting address + tx hash back into this project and the showcase page
            hydrates from the live contract on next refresh. Or, if you deployed via a different
            path, just paste the two values — no script rerun needed.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <h2 className="font-display text-2xl text-foreground">
          Why <span className="italic text-primary">not</span> in the browser?
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
          <div className="p-5 bg-card">
            <span className="eyebrow text-primary">Privacy</span>
            <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">
              Proving needs your local secret key. A hosted proof server would see it.
            </p>
          </div>
          <div className="p-5 bg-card">
            <span className="eyebrow text-primary">Weight</span>
            <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">
              ZK circuits are heavy. Multi-hundred-MB proving keys aren't a browser payload.
            </p>
          </div>
          <div className="p-5 bg-card">
            <span className="eyebrow text-primary">Trust</span>
            <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">
              Local proving means the network verifies math, not a signed claim from a third party.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20">
        <div className="flex flex-wrap gap-3">
          <a
            href="https://docs.midnight.network/guides/run-proof-server"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 bg-primary text-primary-foreground text-[10px] font-semibold tracking-[0.28em] uppercase hover:bg-foreground transition"
          >
            Official proof-server guide ↗
          </a>
          <a
            href="https://hub.docker.com/r/midnightntwrk/proof-server"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 border border-border text-foreground text-[10px] font-semibold tracking-[0.28em] uppercase hover:border-primary/60 hover:text-primary transition"
          >
            Docker Hub ↗
          </a>
          <Link
            to="/wallet"
            className="px-4 py-3 border border-primary/40 text-primary text-[10px] font-semibold tracking-[0.28em] uppercase hover:bg-primary hover:text-primary-foreground transition"
          >
            Wallet & tDUST →
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
