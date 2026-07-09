import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import midnightCfg from "@/data/midnight-contract.json";

export const Route = createFileRoute("/showcase/midnight-ledger")({
  head: () => ({
    meta: [
      { title: "Midnight Ledger — Showcase" },
      { name: "description", content: "Timestamp choreography privately on the Midnight ZK testnet. Compact contract + private witness + public ledger via Indexer." },
      { property: "og:title", content: "Midnight Ledger — Live on Midnight preview" },
      { property: "og:description", content: "Timestamp choreography privately on Midnight. Private witnesses, public commitments." },
    ],
  }),
  component: MidnightLedgerDemo,
});

const DEPLOYED =
  midnightCfg.address !== "0000000000000000000000000000000000000000000000000000000000000000";

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
  // Best-effort visual preview — we render the raw hex head/tail without a full deserializer,
  // because the Compact runtime is browser-only and the site is SSR-safe.
  return {
    entryCount: 0,
    lastMessage: `state hex · ${stateHex.slice(0, 12)}…${stateHex.slice(-8)}`,
    lastAuthorCommitmentHex: stateHex.slice(0, 64),
  };
}

function MidnightLedgerDemo() {
  const [state, setState] = useState<LedgerState | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!DEPLOYED) return;
    let cancel = false;
    setStatus("loading");
    (async () => {
      try {
        const s = await readLedger(midnightCfg.indexerHttp, midnightCfg.address);
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
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Demo · Live on Midnight preview</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Midnight <span className="italic text-primary">Ledger</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        A Compact contract that logs choreography to the public ledger while the author's identity
        stays behind a private-witness ZK proof. Reading is public — writing needs the Lace wallet,
        the local proof server, and a small amount of tDUST from the faucet.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-3 text-[11px]">
        <div className="p-4 border border-border bg-card">
          <div className="eyebrow text-primary">contract address</div>
          <div className="font-mono mt-2 break-all">
            {DEPLOYED
              ? midnightCfg.address
              : "0x00… (contract not yet deployed on this network)"}
          </div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="eyebrow text-primary">network</div>
          <div className="font-mono mt-2 break-all">
            {midnightCfg.network} · Compact {midnightCfg.compactVersion}
          </div>
          <div className="mt-2 flex gap-3 text-primary">
            <a href={midnightCfg.explorer} target="_blank" rel="noreferrer" className="story-gold">
              explorer ↗
            </a>
            <a href={midnightCfg.faucet} target="_blank" rel="noreferrer" className="story-gold">
              tDUST faucet ↗
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 p-6 sm:p-8 border border-border bg-card">
        <h2 className="font-display text-2xl">Public ledger view</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only. Pulled from the Midnight Indexer over GraphQL — no Lace wallet required to
          browse.
        </p>

        {!DEPLOYED && (
          <div className="mt-6 p-5 border border-primary/30 bg-background text-sm text-foreground/80 leading-relaxed">
            <strong className="text-primary">Awaiting first deploy.</strong> Compile{" "}
            <code>contracts/TimestampLog.compact</code> in the Lovable sandbox, deploy it to
            Midnight preview, then paste the printed hex address into{" "}
            <code>src/data/midnight-contract.json</code>. The page will hydrate from the Indexer
            on the next refresh.
          </div>
        )}

        {DEPLOYED && status === "loading" && (
          <div className="mt-6 text-sm text-muted-foreground">Reading ledger from Indexer…</div>
        )}
        {DEPLOYED && status === "empty" && (
          <div className="mt-6 text-sm text-muted-foreground">
            Indexer returned no state for this address yet. Deploys can take a few blocks to
            appear.
          </div>
        )}
        {DEPLOYED && status === "error" && (
          <div className="mt-6 text-sm text-destructive break-all">Indexer error: {err}</div>
        )}
        {DEPLOYED && state && (
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
          <li>Install Lace, switch it to <em>Midnight preview</em>, get tDUST from the faucet.</li>
          <li>
            <code>compact update</code> → <code>compact compile</code> your{" "}
            <code>.compact</code> file.
          </li>
          <li>
            <code>docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v</code>
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
