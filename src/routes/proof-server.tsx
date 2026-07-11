import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import {
  CONTRACTS,
  NETWORK_IDS,
  type NetworkId,
} from "@/data/midnight-contract";
import { NetworkToggle } from "@/components/NetworkToggle";
import { DualDeployStatus } from "@/components/DeployStatusPanel";
import tdust01 from "@/assets/lace-tdust-01-empty.png.asset.json";
import tdust02 from "@/assets/lace-tdust-02-generate.png.asset.json";
import tdust03 from "@/assets/lace-tdust-03-review.png.asset.json";
import tdust04 from "@/assets/lace-tdust-04-password.png.asset.json";
import tdust05 from "@/assets/lace-tdust-05-processing.png.asset.json";
import tdust06 from "@/assets/lace-tdust-06-refilling.png.asset.json";

const TDUST_WALKTHROUGH = [
  { img: tdust01, tag: "01 · empty tank", caption: "0 / 0 tDUST after the faucet drops tNIGHT — tap the D icon next to Receive." },
  { img: tdust02, tag: "02 · generate tdust", caption: "Send #1 — designate your full tNIGHT balance to your own Dust address." },
  { img: tdust03, tag: "03 · review", caption: "Send #2 — Review Transaction confirms the 1,000 tNIGHT designation." },
  { img: tdust04, tag: "04 · password", caption: "Confirm with your Lace admin password." },
  { img: tdust05, tag: "05 · processing", caption: "Generating the zero-knowledge proof — ~30–120s on first run." },
  { img: tdust06, tag: "06 · refilling", caption: "Tank flips to Refilling and tDUST balance climbs — ready to deploy." },
];

export const Route = createFileRoute("/proof-server")({
  head: () => ({
    meta: [
      { title: "Proof Server · Creative Midnight" },
      { name: "description", content: "Run the Midnight proof server locally with Docker to generate zero-knowledge proofs and deploy Compact contracts to preview or preprod." },
      { property: "og:title", content: "Proof Server · Creative Midnight" },
      { property: "og:description", content: "Run the Midnight proof server locally with Docker to generate zero-knowledge proofs and deploy Compact contracts to preview or preprod." },
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
  const [platform, setPlatform] = useState<"unix" | "windows">("unix");
  const [network, setNetwork] = useState<NetworkId>("preprod");
  const cfg = CONTRACTS[network];
  const deployCmd =
    network === "preview"
      ? "bun scripts/deploy-midnight.mjs"
      : "VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs";

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
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <span className="eyebrow">deploy status · both networks</span>
        </div>
        <DualDeployStatus cfgs={NETWORK_IDS.map((n) => CONTRACTS[n])} />
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-14 space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
          <div>
            <span className="eyebrow block mb-2">platform</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPlatform("unix")}
                className={`px-3 py-2 text-[10px] tracking-[0.28em] uppercase font-semibold border transition ${platform === "unix" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/60 hover:text-primary"}`}
              >
                macOS / Linux
              </button>
              <button
                onClick={() => setPlatform("windows")}
                className={`px-3 py-2 text-[10px] tracking-[0.28em] uppercase font-semibold border transition ${platform === "windows" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/60 hover:text-primary"}`}
              >
                Windows
              </button>
            </div>
          </div>
          <div>
            <span className="eyebrow block mb-2">network</span>
            <NetworkToggle value={network} onChange={setNetwork} />
          </div>
        </div>

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
            — the default the Midnight SDK expects. The same container handles both preview and
            preprod proofs; only your <span className="font-mono">VITE_NETWORK_ID</span> changes.
          </p>
          <div className="mt-3">
            <Code>{`docker run -d --name midnight-proof-server \\
  -p 6300:6300 \\
  midnightntwrk/proof-server:latest \\
  midnight-proof-server -v`}</Code>
          </div>
          {platform === "windows" && (
            <p className="mt-3 text-xs text-muted-foreground font-light">
              On Windows, Docker Desktop must be running with the <span className="text-foreground">WSL 2 backend</span> enabled.
              Launch it from the Start menu and wait for the whale icon in the system tray before continuing.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground font-light">
            Check it's up:{" "}
            <span className="text-foreground font-mono">
              {platform === "windows" ? "curl.exe http://localhost:6300/health" : "curl http://localhost:6300/health"}
            </span>{" "}
            → should return <span className="font-mono text-foreground">{`{"status":"ok","timestamp":"..."}`}</span>.
            First proof after boot is slow (~30–120s) while the container warms; subsequent proofs
            are fast.
          </p>
          {platform === "windows" && (
            <p className="mt-3 text-xs text-muted-foreground font-light">
              <span className="text-foreground font-semibold">Troubleshooting:</span> if you see{" "}
              <span className="font-mono text-foreground">"The system cannot find the file specified"</span>,
              Docker Desktop isn't running or WSL 2 isn't installed. Re-open Docker Desktop and wait for
              the engine to start, then retry.
            </p>
          )}

          <div className="mt-4 border border-primary/30 bg-primary/5 p-4">
            <span className="eyebrow text-primary">verified · openclaw</span>
            <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">
              Confirmed running Fri Jul 10 07:22 — container{" "}
              <span className="font-mono text-foreground">midnight-proof-server</span> (id{" "}
              <span className="font-mono text-foreground">265c73234164</span>) live on port{" "}
              <span className="font-mono text-foreground">6300:6300</span>, image{" "}
              <span className="font-mono text-foreground">midnightntwrk/proof-server:latest</span>{" "}
              (sha256 <span className="font-mono text-foreground">801bbc0340…4d531</span>). Health
              endpoint returned <span className="font-mono text-foreground">status: ok</span>.
            </p>
            <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">
              You can inspect / stop / restart from{" "}
              <span className="text-foreground">Docker Desktop → Containers</span>, or from the CLI:{" "}
              <span className="font-mono text-foreground">docker ps</span>,{" "}
              <span className="font-mono text-foreground">docker logs -f midnight-proof-server</span>,{" "}
              <span className="font-mono text-foreground">docker stop midnight-proof-server</span>.
            </p>
          </div>
        </div>

        <div>
          <span className="eyebrow text-primary">step 03</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Fund your wallet with tDUST</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            The faucet dispenses <span className="text-foreground">tNIGHT</span>, not tDUST. Paste your{" "}
            <span className="text-foreground">unshielded</span> Lace address (starts with{" "}
            <span className="font-mono">{cfg.unshieldedPrefix ?? "mn_addr_…"}</span>) into the{" "}
            {network} faucet, then in Lace click{" "}
            <span className="text-foreground">Generate tDUST</span> to delegate. Deploy spends tDUST.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={cfg.faucet}
              target="_blank"
              rel="noreferrer"
              className="border border-border hover:border-primary/50 p-4 flex flex-col gap-1 transition"
            >
              <span className="eyebrow text-primary">{network}</span>
              <span className="text-foreground text-sm">Faucet ↗</span>
              <span className="text-[10px] text-muted-foreground font-mono break-all">
                {cfg.faucet.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </span>
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

          <div className="mt-6">
            <span className="eyebrow text-primary">visual walkthrough · lace</span>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { src: laceEmpty.url, tag: "01 · empty tank", caption: "0/0 tDUST after the faucet drops tNIGHT." },
                { src: laceGenerate.url, tag: "02 · generate tDUST", caption: "Delegate tNIGHT to your own Dust address." },
                { src: laceRefilling.url, tag: "03 · refilling", caption: "1,000 tNIGHT designated — tDUST tank fills." },
              ].map((f) => (
                <figure key={f.tag} className="border border-border bg-card flex flex-col">
                  <img src={f.src} alt={f.caption} loading="lazy" className="w-full h-auto block border-b border-border" />
                  <figcaption className="p-3">
                    <span className="eyebrow text-primary block">{f.tag}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground font-light leading-relaxed">
                      {f.caption}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground font-light">
              Screenshots:{" "}
              <a
                href="https://docs.midnight.network/guides/acquire-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Midnight Docs — Acquire tokens ↗
              </a>
            </p>
          </div>
        </div>


        <div>
          <span className="eyebrow text-primary">step 04</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Deploy TimestampLog.compact</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            Clone this repo, paste your funded 24-word mnemonic into{" "}
            <span className="font-mono text-foreground">.midnight-wallet.local</span>{" "}
            ({platform === "windows" ? "restricted permissions via icacls, gitignored" : "mode 0600, gitignored"}),
            then run the deploy script with the {network} network selected. It syncs the wallet,
            loads compiled ZK keys from{" "}
            <span className="font-mono text-foreground">contracts/managed/timestamp-log/</span>, and
            calls <span className="font-mono text-foreground">deployContract</span> — proving happens
            against your local proof server.
          </p>
          <div className="mt-3">
            {platform === "windows" ? (
              <Code>{`# in PowerShell (repo root)
bun install
"your twenty four word mnemonic here" | Out-File -Encoding UTF8 .midnight-wallet.local -NoNewline
icacls .midnight-wallet.local /inheritance:r /grant:r "$env:USERNAME:(R,W)"

${network === "preview" ? "" : "$env:VITE_NETWORK_ID = \"preprod\"\n"}${deployCmd.replace(/^VITE_NETWORK_ID=preprod /, "")}`}</Code>
            ) : (
              <Code>{`# in the repo root
bun install
echo "your twenty four word mnemonic here" > .midnight-wallet.local
chmod 600 .midnight-wallet.local

${deployCmd}`}</Code>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground font-light">
            On success the script writes{" "}
            <span className="font-mono text-foreground">
              src/data/midnight-contract.{network}.json
            </span>{" "}
            with <span className="font-mono">address</span>,{" "}
            <span className="font-mono">deployTx</span>, and{" "}
            <span className="font-mono">verified: true</span>, then prints the MidnightScan{" "}
            {network} URL.
          </p>
        </div>

        <div>
          <span className="eyebrow text-primary">step 05</span>
          <h2 className="font-display text-2xl mt-2 text-foreground">Wire it back into the site</h2>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
            The deploy status panels above hydrate from the per-network JSON on next refresh — no
            code changes needed. If you deployed via a different path, paste{" "}
            <span className="font-mono text-foreground">address</span> and{" "}
            <span className="font-mono text-foreground">deployTx</span> straight into{" "}
            <span className="font-mono text-foreground">
              src/data/midnight-contract.{network}.json
            </span>
            .
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
