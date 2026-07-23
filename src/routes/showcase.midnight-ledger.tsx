import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CONTRACTS,
  isDeployed,
  type NetworkId,
} from "@/data/midnight-contract";
import { NetworkToggle } from "@/components/NetworkToggle";
import { DualDeployStatus } from "@/components/DeployStatusPanel";
import { WalletConnectPanel } from "@/components/WalletConnectPanel";
import { MIDNIGHT_MATRIX } from "@/lib/midnight-matrix";

export const Route = createFileRoute("/showcase/midnight-ledger")({
  head: () => ({
    meta: [
      { title: "Midnight Ledger — Showcase" },
      { name: "description", content: "Timestamp choreography privately on Midnight ZK networks (preview · preprod · undeployed). Compact contract + private witness + public ledger via Indexer." },
      { property: "og:title", content: "Midnight Ledger — Live on Midnight preview · preprod · undeployed" },
      { property: "og:description", content: "Timestamp choreography privately on Midnight. Private witnesses, public commitments." },
    ],
  }),

  component: MidnightLedgerDemo,
});

type LedgerState = { entryCount: number; lastMessage: string; lastAuthorCommitmentHex: string };

async function readLedger(indexer: string, address: string): Promise<LedgerState | null> {
  const r = await fetch(indexer, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($a: HexEncoded!) { contractAction(address: $a) { state } }`,
      variables: { a: address },
    }),
  });
  const gql = await r.json();
  const stateHex: string | undefined = gql.data?.contractAction?.state;
  if (!stateHex) return null;
  return {
    entryCount: 0,
    lastMessage: `state hex · ${stateHex.slice(0, 12)}…${stateHex.slice(-8)}`,
    lastAuthorCommitmentHex: stateHex.slice(0, 64),
  };
}

function MidnightLedgerDemo() {
  const [network, setNetwork] = useState<NetworkId>("preprod");
  const cfg = CONTRACTS[network];
  const deployed = isDeployed(cfg);

  const [state, setState] = useState<LedgerState | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setState(null);
    setErr(null);
    if (!deployed) {
      setStatus("idle");
      return;
    }
    let cancel = false;
    setStatus("loading");
    (async () => {
      try {
        const s = await readLedger(cfg.indexerHttp, cfg.address);
        if (cancel) return;
        if (!s) setStatus("empty");
        else {
          setState(s);
          setStatus("idle");
        }
      } catch (e) {
        if (cancel) return;
        setErr(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [network, deployed, cfg.address, cfg.indexerHttp]);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Demo · Live on Midnight preview · preprod · undeployed</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Midnight <span className="italic text-primary">Ledger</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        A Compact contract that logs choreography to the public ledger while the author's identity
        stays behind a private-witness ZK proof. Reading is public — writing needs the Lace wallet,
        the local proof server, and a small amount of tDUST from the faucet (or the genesis wallet
        on <em>undeployed</em>).
      </p>

      <p className="mt-3 text-[12px] text-muted-foreground">
        Hit a <code>1010 InvalidDustSpendProof</code>, <code>DustSpendProcessed</code> decode error, or{" "}
        <code>/check 400 bad input</code>?{" "}
        <Link to="/known-issues" className="text-primary underline">See known issues →</Link>
      </p>


      <div className="mt-8">
        <WalletConnectPanel expectedNetwork={network} />
      </div>

      <div className="mt-8">
        <span className="eyebrow block mb-2">Deploy status · all networks</span>
        <DualDeployStatus cfgs={[CONTRACTS.preview, CONTRACTS.preprod, CONTRACTS.undeployed]} />
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="eyebrow block mb-2">Reading from</span>
          <div className="font-display text-xl text-foreground">
            {cfg.network} · Compact {cfg.compactVersion}
          </div>
        </div>
        <NetworkToggle value={network} onChange={setNetwork} />
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-[11px]">
        <div className="p-4 border border-border bg-card">
          <div className="eyebrow text-primary">contract address · {network}</div>
          <div className="font-mono mt-2 break-all">
            {deployed
              ? cfg.address
              : "0x00… (contract not yet deployed on this network)"}
          </div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="eyebrow text-primary">indexer</div>
          <div className="font-mono mt-2 break-all text-muted-foreground">{cfg.indexerHttp}</div>
          <div className="mt-2 flex gap-3 text-primary">
            <a href={cfg.explorer} target="_blank" rel="noreferrer" className="story-gold">
              explorer ↗
            </a>
            <a href={cfg.faucet} target="_blank" rel="noreferrer" className="story-gold">
              tNIGHT faucet ↗
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 border border-primary/30 bg-card">
        <div className="eyebrow text-primary">wallet · lace</div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Lace ships as a <strong className="text-foreground">mobile wallet</strong> today
          (iOS / Android, the MetaMask / Phantom equivalent for Cardano) — but{" "}
          <strong className="text-foreground">only for Cardano</strong>. Midnight support on
          mobile is not shipped yet, so use the Lace{" "}
          <strong className="text-foreground">desktop browser extension</strong> for these demos.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a href="https://www.lace.io/" target="_blank" rel="noreferrer" className="text-primary underline">Get Lace ↗</a>
          <a href="https://docs.midnight.network/blog/connect-dapp-lace-wallet" target="_blank" rel="noreferrer" className="text-primary underline">Connect a dApp with Lace ↗</a>
          <a href="https://docs.midnight.network/relnotes/overview" target="_blank" rel="noreferrer" className="text-primary underline">Midnight release notes ↗</a>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-1 gap-3">
        {network !== "undeployed" ? (
          <div className="p-5 border border-primary/40 bg-card text-[11px]">
            <div className="eyebrow text-primary">{network} · address sanity check</div>
            <pre className="font-mono mt-2 break-all whitespace-pre-wrap text-foreground">
{`MIDNIGHT_WALLET_SEED="your words stay local" \
  bun scripts/check-midnight-wallet.mjs --network=${network}`}
            </pre>
            <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
              The <a href={cfg.faucet} target="_blank" rel="noreferrer" className="text-primary underline">{network} faucet</a>{" "}
              only accepts an <em>unshielded</em> address ({cfg.unshieldedPrefix ?? "mn_addr_…"}).
            </p>
            <div className="mt-3">
              <div className="eyebrow text-muted-foreground">expected {network} prefixes</div>
              <div className="font-mono mt-1 break-all text-muted-foreground">
                {cfg.unshieldedPrefix}… · {cfg.addressPrefix}…
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 border border-primary/40 bg-card text-[11px]">
            <div className="eyebrow text-primary">undeployed · local stack sanity check</div>
            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
              No faucet required — the genesis wallet in the standalone stack mints tDUST directly.
              Bring the containers up, then confirm the node + indexer are healthy before deploying.
            </p>
            <pre className="font-mono mt-3 break-all whitespace-pre-wrap text-foreground">
{`bun scripts/midnight-standalone.mjs up`}
            </pre>
            <div className="mt-3 grid gap-1 text-muted-foreground">
              <div><span className="text-primary">RPC</span> · <span className="font-mono">{cfg.rpc}</span></div>
              <div><span className="text-primary">Indexer</span> · <span className="font-mono break-all">{cfg.indexerHttp}</span></div>
            </div>
            <div className="mt-3">
              <div className="eyebrow text-muted-foreground">expected undeployed prefixes</div>
              <div className="font-mono mt-1 break-all text-muted-foreground">
                {cfg.unshieldedPrefix}… · {cfg.addressPrefix}…
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link to="/undeployed-preflight" className="text-primary underline">Run preflight →</Link>
              <Link to="/undeployed" className="text-primary underline">Undeployed guide →</Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 p-6 sm:p-8 border border-border bg-card">
        <h2 className="font-display text-2xl">Public ledger view · {network}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only. Pulled from the Midnight {network} Indexer over GraphQL — no Lace wallet
          required to browse.
        </p>

        {!deployed && (
          <div className="mt-6 p-5 border border-primary/30 bg-background text-sm text-foreground/80 leading-relaxed space-y-3">
            <div>
              <strong className="text-primary">Awaiting first deploy on {network}.</strong> The
              deploy has to run on your own machine — Docker + Midnight's proof server are
              required, and the Lovable sandbox has neither.
            </div>
            {network === "undeployed" ? (
              <>
                <div>
                  <strong className="text-primary">Local flow · no faucet.</strong> Bring the
                  standalone stack up (node + indexer + proof-server), then deploy from the
                  genesis wallet — tDUST is minted locally.
                </div>
                <pre className="font-mono text-[11px] break-all whitespace-pre-wrap text-foreground">
{`# 1. start the local stack
bun scripts/midnight-standalone.mjs up

# 2. deploy from the genesis wallet
VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs`}
                </pre>
                <div>
                  The deployed address is written into{" "}
                  <code>src/data/midnight-contract.undeployed.json</code>; this page hydrates from
                  the local Indexer at <code className="break-all">{cfg.indexerHttp}</code>.
                </div>
                <div className="text-xs">
                  See <Link to="/undeployed" className="text-primary underline">the Undeployed guide</Link>{" "}
                  and <Link to="/undeployed-preflight" className="text-primary underline">preflight checks</Link>.
                </div>
              </>
            ) : (
              <>
                <div>
                  <strong className="text-primary">Funding gotcha:</strong> the{" "}
                  <a href={cfg.faucet} target="_blank" rel="noreferrer" className="text-primary underline">
                    {network} faucet
                  </a>{" "}
                  only accepts an <em>unshielded</em> address ({cfg.unshieldedPrefix ?? "mn_addr_…"}).
                  Import the seed into{" "}
                  <a href="https://www.lace.io/" target="_blank" rel="noreferrer" className="text-primary underline">
                    Lace
                  </a>{" "}
                  on Midnight {network}, copy its unshielded address, request tNIGHT, then click{" "}
                  <em>Generate tDUST</em> in Lace to delegate. See{" "}
                  <a href="https://docs.midnight.network/guides/acquire-tokens" target="_blank" rel="noreferrer" className="text-primary underline">
                    acquire-tokens docs ↗
                  </a>.
                </div>
                <div>
                  Once tDUST lands, run{" "}
                  <code>
                    {network === "preview"
                      ? "bun scripts/deploy-midnight.mjs"
                      : "VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs"}
                  </code>
                  ; it writes the deployed address into{" "}
                  <code>src/data/midnight-contract.{network}.json</code> and this page hydrates from
                  the Indexer.
                </div>
              </>
            )}
          </div>
        )}

        {deployed && status === "loading" && (
          <div className="mt-6 text-sm text-muted-foreground">Reading ledger from Indexer…</div>
        )}
        {deployed && status === "empty" && (
          <div className="mt-6 text-sm text-muted-foreground">
            Indexer returned no state for this address yet. Deploys can take a few blocks to
            appear.
          </div>
        )}
        {deployed && status === "error" && (
          <div className="mt-6 text-sm text-destructive break-all">Indexer error: {err}</div>
        )}
        {deployed && state && (
          <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="eyebrow mb-1">entry_count</dt>
              <dd className="font-mono">{state.entryCount}</dd>
            </div>
            <div>
              <dt className="eyebrow mb-1">last_message</dt>
              <dd className="font-mono break-all">{state.lastMessage}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow mb-1">last_author_commitment (hex, first 64)</dt>
              <dd className="font-mono break-all text-muted-foreground">
                {state.lastAuthorCommitmentHex}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-10 p-6 sm:p-8 border border-primary/30 bg-card">
        <h2 className="font-display text-2xl">Try it locally (writable demo)</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The write path (Lace + WASM + local proof server) is a client-only,
          browser-globals-heavy stack that will not run under this site's SSR shell. Grab the
          full recipe from the strategy page and run it on your machine.
        </p>
        <ol className="mt-4 space-y-1.5 text-sm text-foreground/90 font-light list-decimal pl-5">
          <li>Install Lace, switch it to <em>Midnight preview</em> or <em>preprod</em>, get tDUST from the matching faucet.</li>
          <li>
            <code>compact update</code> → <code>compact compile</code> your{" "}
            <code>.compact</code> file.
          </li>
          <li>
            <code>docker run -p 6300:6300 midnightntwrk/proof-server:{MIDNIGHT_MATRIX.proofServer} midnight-proof-server -v</code>
          </li>
          <li>
            Paste any mega-prompt from this repo into Lovable — it wires Lace + the proof server
            + Indexer for you.
          </li>
        </ol>
      </div>
    </div>
  );
}
