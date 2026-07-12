import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MOVEBOARD_CONTRACTS,
  isMoveBoardDeployed,
} from "@/data/moveboard-contract";
import type { NetworkId } from "@/data/midnight-contract";
import { NetworkToggle } from "@/components/NetworkToggle";

export const Route = createFileRoute("/showcase/move-board")({
  head: () => ({
    meta: [
      { title: "Move Board — Midnight bboard-pattern demo" },
      {
        name: "description",
        content:
          "Post a dance move against an already-deployed Midnight contract. Skips the DUST-heavy deploy step — you only pay the (much smaller) callTx fee.",
      },
      { property: "og:title", content: "Move Board — call an existing Midnight contract, no deploy" },
      {
        property: "og:description",
        content:
          "Bboard pattern (post + take with private-author ZK commitment) deployed once, reused for every visitor. Preprod/Preview.",
      },
    ],
  }),
  component: MoveBoardDemo,
});

type BoardState = {
  raw: string;
  head: string;
  tail: string;
};

async function readBoard(indexer: string, address: string): Promise<BoardState | null> {
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
    raw: stateHex,
    head: stateHex.slice(0, 16),
    tail: stateHex.slice(-16),
  };
}

function MoveBoardDemo() {
  const [network, setNetwork] = useState<NetworkId>("preprod");
  const cfg = MOVEBOARD_CONTRACTS[network];
  const deployed = isMoveBoardDeployed(cfg);

  const [state, setState] = useState<BoardState | null>(null);
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
        const s = await readBoard(cfg.indexerHttp, cfg.address);
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
  }, [network, cfg.address, cfg.indexerHttp, deployed]);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Demo 03 · Bboard pattern</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Move Board · <span className="italic text-primary">post a dance move</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        This demo calls an <strong>already-deployed</strong> Midnight contract. No fresh deploy per visitor — you
        only pay the (much smaller) <code>callTx</code> DUST cost. Contract pattern mirrors{" "}
        <a
          href="https://github.com/midnightntwrk/example-bboard"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          midnightntwrk/example-bboard
        </a>
        : post a move as the current occupant with a private-author ZK commitment; only that same author can{" "}
        <code>take()</code> to clear it.
      </p>

      <div className="mt-8 p-4 border border-primary/30 bg-card text-sm text-muted-foreground">
        Hitting <code>DustWallet.balance() = 0</code> even though Lace shows DUST? That's the confirmed Preprod
        sync bug — see{" "}
        <Link to="/known-issues" hash="lace-dust-sdk-zero" className="text-primary underline">
          known issues → Lace shows DUST but SDK reports 0
        </Link>
        . Because this demo skips the deploy fee, it needs less DUST than the ledger demo.
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
        <NetworkToggle value={network} onChange={setNetwork} />
        <a
          href={cfg.faucet}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] uppercase tracking-[0.24em] text-primary hover:text-foreground"
        >
          Get testnet DUST ↗
        </a>
      </div>

      <div className="mt-6 p-6 border border-border bg-card">
        <div className="eyebrow text-primary mb-2">Deployed contract · {cfg.network}</div>
        {deployed ? (
          <div className="space-y-3 text-sm">
            <div className="font-mono text-[11px] break-all">
              <span className="text-muted-foreground">address · </span>
              <a
                href={`${cfg.explorer}/contract/${cfg.address}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                {cfg.address}
              </a>
            </div>
            {cfg.deployTx && (
              <div className="font-mono text-[11px] break-all">
                <span className="text-muted-foreground">deployTx · </span>
                <a
                  href={`${cfg.explorer}/tx/${cfg.deployTx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  {cfg.deployTx}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>Not yet deployed on {cfg.network}. From your local checkout:</p>
            <pre className="mt-3 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
{`compact compile contracts/MoveBoard.compact contracts/managed/move-board
cp -r contracts/managed/move-board/keys public/keys/move-board
cp -r contracts/managed/move-board/zkir public/zkir/move-board
MIDNIGHT_CONTRACT=move-board VITE_NETWORK_ID=${cfg.networkId} \\
  bun scripts/deploy-midnight.mjs`}
            </pre>
            <p className="mt-3">
              The script writes the resulting address into{" "}
              <code>src/data/moveboard-contract.{cfg.networkId}.json</code>. From then on, every visitor calls
              this same contract.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-6 border border-border bg-card">
        <div className="eyebrow text-primary mb-2">Live board state · read-only via Indexer</div>
        {status === "loading" && <p className="text-sm text-muted-foreground">Reading state…</p>}
        {status === "empty" && (
          <p className="text-sm text-muted-foreground">Contract exists but no state yet — post the first move.</p>
        )}
        {status === "error" && <p className="text-sm text-destructive">Read failed: {err}</p>}
        {status === "idle" && !deployed && (
          <p className="text-sm text-muted-foreground">Waiting for a pinned deploy on {cfg.network}.</p>
        )}
        {status === "idle" && deployed && state && (
          <div className="grid gap-2 text-sm font-mono text-[12px]">
            <div>
              <span className="text-muted-foreground">state hex head · </span>
              <span>{state.head}…</span>
            </div>
            <div>
              <span className="text-muted-foreground">state hex tail · </span>
              <span>…{state.tail}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">
              (Decoded fields — <code>board_state</code>, <code>move_label</code>, <code>poster_commitment</code>,{" "}
              <code>move_count</code> — resolve client-side via the compiled contract's <code>ledger(state)</code>{" "}
              helper once the Lace-connected callTx flow is wired below.)
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-6 border border-border bg-card">
        <div className="eyebrow text-primary mb-2">Post a move · connect Lace</div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect Lace on <strong>{cfg.network}</strong>, enter a dance move, and submit a{" "}
          <code>post(label)</code> callTx. Proving runs in your local Docker proof server (30–120s); the balance
          + submit steps come out of your Lace-visible DUST.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          The Lace-signed callTx wiring lives in{" "}
          <code>src/lib/use-midnight-wallet.ts</code> (shared with the ledger demo). Because the contract is
          pinned, only <code>post()</code> and <code>take()</code> callTx paths are exercised here — no{" "}
          <code>deployContract</code> DUST spike.
        </p>
        <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-primary">
          Lace connect + submit UI: wired via the shared wallet hook · see /showcase/midnight-ledger for the same
          connect pattern
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.24em]">
        <Link to="/showcase" className="text-primary hover:text-foreground">
          ← Back to showcase
        </Link>
        <Link to="/showcase/midnight-ledger" className="text-primary hover:text-foreground">
          Midnight Ledger demo →
        </Link>
        <Link to="/known-issues" className="text-primary hover:text-foreground">
          Known issues →
        </Link>
      </div>
    </div>
  );
}
