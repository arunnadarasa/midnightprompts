import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";


export const Route = createFileRoute("/known-issues")({
  head: () => ({
    meta: [
      { title: "Known issues — Midnight Preprod snapshot · July 2026" },
      {
        name: "description",
        content:
          "Field notes from the Midnight team on Preprod DUST sync, DustSpendProcessed decode failures, 0.31 ZKIR /check rejection, 1010 InvalidDustSpendProof, and the current support matrix.",
      },
      { property: "og:title", content: "Midnight Preprod — Known Issues (July 2026)" },
      {
        property: "og:description",
        content:
          "DUST sync stalls, ZKIR /check rejection, 1010 InvalidDustSpendProof, support-matrix pins — with the current workaround for each.",
      },
    ],
  }),
  component: KnownIssuesPage,
});

const SERVICE_DESK = "https://midnightntwrk.github.io/servicedesk/";
const SUPPORT_MATRIX = "https://docs.midnight.network/relnotes/support-matrix";

type Issue = {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  fix: ReactNode;
  links?: { label: string; href: string }[];
};

const ISSUES: Issue[] = [
  {
    id: "preprod-fresh-sync",
    title: "Preprod fresh-wallet sync never completes",
    symptom:
      "7.5h+ without finishing, sometimes OOM on smaller machines. Preview first sync in ~44 min is normal; Preprod is heavier, but hours-without-progress + OOM = struggling, not just slow.",
    cause:
      "No documented snapshot / fast-sync path for headless WalletFacade today. Memory scales with chain history during initial sync.",
    fix: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Use Preview for throughput / latency benchmarking.</li>
        <li>
          Align every dep to the Preprod row on the{" "}
          <a href={SUPPORT_MATRIX} target="_blank" rel="noreferrer" className="text-primary underline">
            support matrix
          </a>{" "}
          — version skew often surfaces as sync decode failures.
        </li>
        <li>Confirm indexer + node are healthy and at chain tip before sync.</li>
        <li>
          <code>NODE_OPTIONS="--max-old-space-size=8192"</code> helps OOM but won't fix decode loops.
        </li>
      </ul>
    ),
  },
  {
    id: "dust-spend-processed-decode",
    title: "DustSpendProcessed ledger event decode failures",
    symptom:
      "Repeated `Could not deserialize Ledger Event` during shielded / DUST sync. Wallet SDK ↔ ledger/indexer event-format mismatch on Preprod.",
    cause:
      "Pinned ledger-v8 / wallet-sdk-dust-wallet combo can't decode current Preprod events (e.g. midnight-js 4.0.4 vs matrix 4.1.1, proof-server 8.0.3 vs newer rows).",
    fix: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Re-pin wallet + ledger + midnight-js + proof-server from the Preprod matrix in one pass.</li>
        <li>Resync a fresh wallet dir.</li>
        <li>
          Wallet config workaround that helps some setups:{" "}
          <code>batchUpdates: {"{ size: 5000, timeout: 1, spacing: 4 }"}</code>
        </li>
        <li>
          Preprod indexer v4:{" "}
          <code>https://indexer.preprod.midnight.network/api/v4/graphql</code> ·{" "}
          <code>wss://indexer.preprod.midnight.network/api/v4/graphql/ws</code>
        </li>
      </ul>
    ),
    links: [{ label: "Service Desk ↗", href: SERVICE_DESK }],
  },
  {
    id: "dust-regeneration-caps-concurrency",
    title: "DUST regeneration caps concurrent settlement",
    symptom:
      "`InsufficientFunds: could not balance dust` around round 3 of parallel `balanceTx` / `submitCallTx` from one wallet.",
    cause:
      "Expected: DUST is rate-limited from registered NIGHT; concurrent calls compete for the same DUST UTXO pool.",
    fix: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Serialize submits per wallet (or keep 1–2 in flight).</li>
        <li>Pre-warm DUST: fund NIGHT, wait for cap fill, run a few serial txs before load-testing.</li>
        <li>Use multiple wallets for parallel lanes — each has its own DUST generation.</li>
      </ul>
    ),
  },
  {
    id: "prove-submit-hang",
    title: "Prove + submit coupled; submit hangs without timeout",
    symptom:
      "`submitCallTx` / `callTx` fuse the pipeline. Same-wallet parallel submit is still risky (DUST + wallet lock); SDK doesn't always surface a timeout.",
    cause: "High-level helpers fuse prove and submit into one long call with no client-side deadline.",
    fix: (
      <>
        <p>Decouple with the lower-level pipeline:</p>
        <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
{`createUnprovenCallTx
  → proofProvider.proveTx
  → walletProvider.balanceTx
  → midnightProvider.submitTx`}
        </pre>
        <p className="mt-2">
          Parallelize proving, serialize balance+submit per wallet. Add app-level timeouts around submit.
        </p>
      </>
    ),
  },
  {
    id: "invalid-dust-spend-proof-1010",
    title: "1010 Custom error: 170 = InvalidDustSpendProof",
    symptom: "Node rejects submit with `1010 Custom error: 170` — DUST fee proof invalid or stale.",
    cause:
      "Common Preprod causes: wallet/indexer stale (DUST Merkle roots pruned while balance still looks fine), indexer lag behind node tip, or version skew between ledger / proof-server / wallet-sdk.",
    fix: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Confirm WS vs HTTP: if you get `1010 Custom error: N`, WS is fine.</li>
        <li>Fresh wallet resync (or resync right before submit).</li>
        <li>Compare indexer block height vs RPC tip.</li>
        <li>Pin the full stack to the current Preprod matrix.</li>
        <li>Retry after sync completes — don't submit from a long-idle wallet.</li>
      </ol>
    ),
    links: [
      {
        label: "Decode 1010 guide ↗",
        href: "https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors",
      },
      { label: "Error codes ↗", href: "https://docs.midnight.network/nodes/error-codes" },
    ],
  },
  {
    id: "check-400-zkir-031",
    title: "/check 400 bad input on callTx (deploy works, callTx fails)",
    symptom:
      "Proof-server `/check` returns `400 bad input` in ~3ms with a ~461-byte body on a complete preimage. Deploy `/prove` works; callTx hits `/check` first and fails.",
    cause:
      "Compact 0.31.0 changed the ZKIR representation for Uint downcasts, byte-vector ↔ Field/Uint conversions, and relational comparisons. Local proof-server 8.0.3 / 8.1.0 `/check` parser doesn't accept the reworked ZKIR on the wrapped-ir path — client/server serialization gap, per-circuit.",
    fix: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          <code>cat managed/&lt;circuit&gt;/compiler/contract-info.json</code> — if it's 0.30.x / 0.22.0,
          confirms the 0.31 ZKIR rework is the trigger.
        </li>
        <li>
          Point <code>httpClientProofProvider</code> at the public prover{" "}
          <code>https://lace-proof-pub.preprod.midnight.network</code>. If <code>register_asset</code> /check passes
          there, your local image is just behind the deployed prover. (Lace's wallet-delegated proving uses this same
          public backend, which is why Lace succeeds where local Docker rejects.)
        </li>
        <li>
          Bisect the reworked op: drop <code>decimals Uint&lt;8&gt;</code>, drop the secret-key → owner-id conversion,
          recompile, retry /check to pin the exact op.
        </li>
        <li>Fix is upstream in a later Compact release — see the toolchain 0.31.0 release notes.</li>
      </ol>
    ),
    links: [
      { label: "Toolchain 0.31.0 notes ↗", href: "https://docs.midnight.network/relnotes/compact/toolchain-0.31.0" },
      { label: "Troubleshoot ↗", href: "https://docs.midnight.network/sdks/troubleshoot" },
      { label: "Service Desk ↗", href: SERVICE_DESK },
    ],
  },
  {
    id: "preprod-matrix",
    title: "Preprod support matrix (current docs)",
    symptom: "Mixing SDK rows silently produces the failures above. Align every dep to the SAME row.",
    cause: "Wallet SDK ships as three packages (facade, dust, shielded) — do NOT mix 4.x + 4.x + 3.x ad-hoc.",
    fix: (
      <ul className="list-disc pl-5 space-y-1 font-mono text-[12px]">
        <li>ledger-v8: <span className="text-primary">8.0.3</span></li>
        <li>proof-server: <span className="text-primary">8.0.3</span> (must match ledger tag exactly)</li>
        <li>compact: 0.5.1 · toolchain 0.31.1</li>
        <li>compact-runtime: 0.16.0 · compact-js: 2.5.1</li>
        <li>midnight-js-*: 4.1.1</li>
        <li>onchain-runtime-v3: 3.0.0</li>
        <li>Wallet SDK: align facade / dust / shielded to the same matrix row.</li>
      </ul>
    ),
    links: [{ label: "Support matrix ↗", href: SUPPORT_MATRIX }],
  },
  {
    id: "preprod-rpc",
    title: "Preprod public RPC — one official endpoint",
    symptom: "No second official backup URL. `lace-proof-pub.preprod.midnight.network` (from COMPATIBILITY.md) does not resolve publicly.",
    cause: "One official Midnight-hosted Preprod RPC exists today.",
    fix: (
      <>
        <ul className="list-disc pl-5 space-y-1 font-mono text-[12px]">
          <li>HTTP: <code>https://rpc.preprod.midnight.network</code></li>
          <li>WS:   <code>wss://rpc.preprod.midnight.network</code></li>
        </ul>
        <p className="mt-3">Alternatives:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Blockfrost (needs API key):{" "}
            <code>https://rpc.midnight-preprod.blockfrost.io?project_id=YOUR_KEY</code>
          </li>
          <li>
            Self-host <code>midnight-node</code> via Docker (
            <a
              href="https://github.com/midnightntwrk/midnight-node"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              github.com/midnightntwrk/midnight-node
            </a>
            ).
          </li>
          <li>
            Preview WS <code>wss://rpc.preview.midnight.network</code> — only if you can switch networks
            (not Preprod-compatible).
          </li>
        </ul>
        <p className="mt-3">Smoke check:</p>
        <pre className="mt-1 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
{`curl -X POST https://rpc.preprod.midnight.network \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"chain_getHeader","params":[],"id":1}'`}
        </pre>
      </>
    ),
  },
  {
    id: "currentblocktime-roadmap",
    title: "currentBlockTime() / in-circuit block metadata",
    symptom: "No public in-circuit readable block time or height API today — only `blockTime*` comparators.",
    cause: "Not yet exposed by Compact.",
    fix: <p>File product feedback via the Midnight Service Desk if settlement flows need it.</p>,
    links: [{ label: "Service Desk ↗", href: SERVICE_DESK }],
  },
];

function KnownIssuesPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Reference · July 2026 snapshot</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Midnight Preprod · <span className="italic text-primary">Known issues</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        Paraphrased notes from the Midnight team on Discord (July 2026). These are moving targets — always
        cross-check the{" "}
        <a href={SUPPORT_MATRIX} target="_blank" rel="noreferrer" className="text-primary underline">
          official support matrix
        </a>{" "}
        and open a{" "}
        <a href={SERVICE_DESK} target="_blank" rel="noreferrer" className="text-primary underline">
          Service Desk ticket
        </a>{" "}
        with your pinned versions before assuming a workaround still applies.
      </p>

      <nav className="mt-8 p-4 border border-border bg-card text-[12px]">
        <div className="eyebrow text-primary mb-2">On this page</div>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
          {ISSUES.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} className="text-foreground/80 hover:text-primary transition-colors">
                → {i.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-6">
        {ISSUES.map((issue) => (
          <article
            key={issue.id}
            id={issue.id}
            className="scroll-mt-20 p-6 sm:p-7 border border-border bg-card"
          >
            <h2 className="font-display text-2xl text-foreground">{issue.title}</h2>
            <div className="mt-4 grid gap-3 text-sm text-foreground/85 leading-relaxed">
              <div>
                <div className="eyebrow text-primary mb-1">Symptom</div>
                <p>{issue.symptom}</p>
              </div>
              <div>
                <div className="eyebrow text-primary mb-1">Cause</div>
                <p>{issue.cause}</p>
              </div>
              <div>
                <div className="eyebrow text-primary mb-1">Workaround</div>
                <div>{issue.fix}</div>
              </div>
            </div>
            {issue.links && issue.links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.24em]">
                {issue.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-12 p-6 border border-primary/30 bg-card text-sm text-muted-foreground">
        Source: Midnight team (Nasihudeen Jimoh) responses on the Midnight Discord, June–July 2026, paraphrased
        for reference. When escalating, open a{" "}
        <a href={SERVICE_DESK} target="_blank" rel="noreferrer" className="text-primary underline">
          Service Desk ticket
        </a>{" "}
        with pinned versions, indexer URLs, and whether you're seeing unshielded/DUST sync errors or hangs.
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.24em]">
        <Link to="/showcase" className="text-primary hover:text-foreground">← Back to showcase</Link>
        <Link to="/showcase/midnight-ledger" className="text-primary hover:text-foreground">Midnight Ledger demo →</Link>
        <Link to="/showcase/programmatic-dust" className="text-primary hover:text-foreground">Programmatic DUST →</Link>
      </div>
    </div>
  );
}
