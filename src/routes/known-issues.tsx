import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import { DockerSetupGuide } from "@/components/DockerSetupGuide";
import { MIDNIGHT_MATRIX } from "@/lib/midnight-matrix";


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
    id: "indexer-silent-empty-chain",
    title: "Indexer stuck at block 0 with no error (hosted stack)",
    symptom:
      "Every read returns nothing and the UI reports block 0 forever, so it looks like your anchor never landed — but no request errors and no log line complains.",
    cause:
      "The indexer does not fail loudly when it cannot reach the node RPC: it serves an EMPTY chain. On Fly this normally means the indexer is pointed at `<app>.internal:9944` (IPv6-only 6PN) or `<app>.flycast:9944` (no private IP allocated) while the node binds IPv4.",
    fix: (
      <>
        <p>
          Publish the node's 9944 as a <strong>pure <code>tls</code></strong> service on the host
          edge and point every consumer at <code>wss://&lt;app&gt;.fly.dev:9944</code>. Then make
          node-reachable-from-indexer its own explicit preflight step — never trust an indexer
          answer before that check passes.
        </p>
        <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre">
{`# measured facts, not assumptions
# on the node machine
curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:9944/health
# on the indexer machine
curl -s -o /dev/null -w '%{http_code}\\n' https://<app>.fly.dev:9944`}
        </pre>
      </>
    ),
    links: [{ label: "Identus / Fly invariants", href: "/identus" }],
  },
  {
    id: "fly-http-handler-kills-ws",
    title: "Submit dies after minutes of proving on a hosted node",
    symptom:
      "Proving completes locally, then the submit fails or hangs — always after several minutes, never immediately. Looks like a Midnight node bug.",
    cause:
      "The host's `http` handler terminates a long-lived WebSocket mid-request. A proof submission holds that socket open for minutes, so it is the first thing to get cut.",
    fix: (
      <>
        <p>
          Serve 9944 with a <code>tls</code> handler only — no <code>http</code> handler and no{" "}
          <code>http_options</code> on that service. Keep <code>.internal</code> / private-network
          names for server-to-server calls that stay inside the stack, and probe reachability from
          the consuming machine instead of assuming it.
        </p>
      </>
    ),
    links: [{ label: "Fly-hosted Undeployed", href: "/undeployed" }],
  },
  {

    id: "seed-to-bech32",
    title: "How do I turn my seed into a bech32 preprod/preview address?",
    symptom:
      "You've generated a master seed via wallet-sdk (e.g. `7aaa436f…`) but the preprod/preview faucet wants a bech32 unshielded address (`mn_addr_preprod1…`). Wiring up `WalletSeeds` + `createKeystore` + the address encoders yourself is a full afternoon.",
    cause:
      "There's no need to derive it by hand. The community `midnight-wallet-cli` (npm) wraps the same derivation Lace uses and prints the bech32 address directly. Recommended by Midnight dev-rel (norm) in #dev-chat, 27 July 2026.",
    fix: (
      <>
        <p>Two commands — same seed as Lace produces, same address the faucet accepts:</p>
        <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre">
{`npm i -g midnight-wallet-cli

# --seed is the 64-char hex master seed (32 bytes), NOT the mnemonic
mn address --seed <64-hex-master-seed> --network preprod
# → prints your unshielded mn_addr_preprod1… (paste into the faucet)

# Verify funds landed
mn balance <mn_addr_preprod1…> --network preprod`}
        </pre>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>
            <code>--network</code> accepts <code>preprod</code>, <code>preview</code>, <code>undeployed</code>,{" "}
            <code>mainnet</code>.
          </li>
          <li>
            The seed MUST be the 64-hex master seed. If you have a BIP-39 mnemonic, derive the master seed first
            (or use our <code>scripts/derive-unshielded-address.mjs</code> as an offline fallback).
          </li>
          <li>
            The shielded address (<code>mn_shield-addr_…</code>) is a different identity — the faucet only accepts the
            unshielded one.
          </li>
          <li>Never paste your seed into chat, screenshots, or issue trackers.</li>
        </ul>
      </>
    ),
    links: [
      { label: "npm ↗", href: "https://www.npmjs.com/package/midnight-wallet-cli" },
      { label: "GitHub ↗", href: "https://github.com/nel349/midnight-wallet-cli" },
    ],
  },
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
    id: "wallet-sync-memory",
    title: "Wallet sync stalls or blows up memory during initial sync",
    symptom:
      "Headless WalletFacade / SDK script hangs for hours on a fresh wallet, or the Node process OOMs while walking chain history. Every run starts from scratch and re-scans everything.",
    cause:
      "Midnight DevRel guidance (Jay Albert, Midnight Network — Dev Hangout Prep, July 2026): there is no snapshot / fast-sync path yet, and the default transaction-history storage keeps every event in memory even when your script never reads it.",
    fix: (
      <>
        <p>Two complementary techniques Midnight recommends today:</p>
        <ol className="list-decimal pl-5 space-y-3 mt-2">
          <li>
            <strong>Sync from where you last left off.</strong> Serialize the wallet state to disk
            after the first successful sync, then restore it on the next run so only the delta syncs.
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre">
{`// After first sync
const serialized = await wallet.serializeState();
await fs.writeFile("wallet-state.bin", serialized);

// Next run — restore before wallet.start()
const restored = await fs.readFile("wallet-state.bin");
const wallet = await WalletBuilder.restore(
  indexerUrl, indexerWsUrl, proofServerUrl, nodeUrl,
  restored, networkId,
);
wallet.start(); // only the delta re-syncs`}
            </pre>
          </li>
          <li>
            <strong>Don't store history you won't read.</strong> Pass{" "}
            <code>NoOpTransactionHistoryStorage</code> in your wallet config to cut memory during
            sync. <em>Only</em> safe if your script never queries transaction history.
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre">
{`import { NoOpTransactionHistoryStorage } from "@midnight-ntwrk/wallet";

const wallet = await WalletBuilder.buildFromSeed(
  indexerUrl, indexerWsUrl, proofServerUrl, nodeUrl,
  seed, networkId,
  { transactionHistoryStorage: new NoOpTransactionHistoryStorage() },
);`}
            </pre>
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Combine both for headless deploy / server-append scripts: they never need history, and a
          serialized wallet-state file keeps CI / Fly.io restarts fast.
        </p>
      </>
    ),
    links: [
      { label: "Service Desk ↗", href: SERVICE_DESK },
      { label: "Support matrix ↗", href: SUPPORT_MATRIX },
    ],
  },
  {
    id: "lace-dust-sdk-zero",
    title: "Lace shows DUST but SDK reports 0 / unshielded never syncs",
    symptom:
      "Lace displays a healthy DUST balance while `DustWallet.balance() = 0` and/or the unshielded leg never finishes syncing from the SDK. If the SDK dust leg doesn't reach tip, deploys fail with \"no fee DUST\" even though Lace looks funded.",
    cause:
      "Confirmed known Preprod pattern (Midnight team, Discord, 30/06/2026). Tracked on their side; wallet-SDK fixes in progress.",
    fix: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Pin every package to the current Preprod row on the{" "}
          <a href={SUPPORT_MATRIX} target="_blank" rel="noreferrer" className="text-primary underline">
            support matrix
          </a>.
        </li>
        <li>
          Preprod indexer v4:{" "}
          <code>https://indexer.preprod.midnight.network/api/v4/graphql</code> ·{" "}
          <code>wss://indexer.preprod.midnight.network/api/v4/graphql/ws</code>
        </li>
        <li>
          Wallet config workaround that helps some setups:{" "}
          <code>batchUpdates: {"{ size: 5000, timeout: 1, spacing: 4 }"}</code>
        </li>
        <li><code>NODE_OPTIONS="--max-old-space-size=8192"</code> for OOM during first sync.</li>
        <li>Confirm the SDK uses the <strong>same seed</strong> as Lace — different seed = different wallet.</li>
        <li>Only read DUST <strong>after full sync on all legs</strong>.</li>
        <li>
          Unblock local dev with <code>create-mn-app</code> / local docker network (undeployed) while
          Preprod sync is rough.
        </li>
      </ol>
    ),
    links: [
      { label: "Service Desk ↗", href: SERVICE_DESK },
      { label: "Support matrix ↗", href: SUPPORT_MATRIX },
    ],
  },
  {
    id: "dust-spend-processed-decode",
    title: "DustSpendProcessed ledger event decode failures",
    symptom:
      "Repeated `Could not deserialize Ledger Event` during shielded / DUST sync. Wallet SDK ↔ ledger/indexer event-format mismatch on Preprod.",
    cause:
      "Pinned ledger-v8 / wallet-sdk-dust-wallet combo can't decode current Preprod events (e.g. midnight-js 4.0.4 vs matrix 4.1.1, proof-server 8.0.3 vs matrix 8.1.0). If the matrix now shows a newer proof-server / ledger-v8 row, re-pin everything to that single row.",
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
    id: "check-400-engineering-confirmed",
    title: "/check 400 — engineering-confirmed 0.31 ZKIR serialization gap",
    symptom:
      "`httpClientProofProvider`'s `createCheckPayload(preimage, keyMaterial.ir)` is rejected by `/check` on the 8.0.3 public prover, while Lace's wallet-delegated proving of the exact same callTx succeeds against that same prover.",
    cause:
      "Midnight team confirmed (Discord, 03/07/2026): this is a client/server `/check` serialization gap for 0.31 ZKIR, not user error or version drift. Needs the engineering team.",
    fix: (
      <>
        <p>
          Open a{" "}
          <a href={SERVICE_DESK} target="_blank" rel="noreferrer" className="text-primary underline">
            Service Desk ticket
          </a>{" "}
          with two linked issues:
        </p>
        <ol className="list-decimal pl-5 space-y-2 mt-2">
          <li>
            <strong>/check bad input.</strong> Include: deploy / create_market work, register_asset fails,{" "}
            <code>Uint&lt;64&gt;</code> widen didn't fix (→ second reworked op), <code>check()</code> isn't
            skippable (stub → WASM unreachable), latest stable provider is 4.1.1. Ask which prover parses
            0.31 ZKIR on <code>/check</code>, ETA for the ZKIR-format fix from the 0.31.0 notes, and the
            precise list of reworked ops to avoid on 8.0.3.
          </li>
          <li>
            <strong>Matrix conflict.</strong> Align ledger-v8, wallet-sdk-dust-wallet, and proof-server to
            the same support-matrix row. As of the current matrix, that means ledger-v8 {MIDNIGHT_MATRIX.ledgerV8},
            proof-server {MIDNIGHT_MATRIX.proofServer}, and Wallet SDK {MIDNIGHT_MATRIX.walletSdk}. Ask for the
            coherent wallet-sdk set if you see <code>Transaction.addIntent</code> mismatches.
          </li>
        </ol>
        <p className="mt-3">
          Also note in the ticket that <code>lace-proof-pub.preprod.midnight.network</code> from
          COMPATIBILITY.md doesn't resolve publicly. See the{" "}
          <a href="#check-400-zkir-031" className="text-primary underline">
            local-repro workaround section
          </a>{" "}
          for the Lace-vs-httpClientProofProvider bisect that produced this evidence.
        </p>
      </>
    ),
    links: [
      { label: "Service Desk ↗", href: SERVICE_DESK },
      { label: "Support matrix ↗", href: SUPPORT_MATRIX },
    ],
  },
  {
    id: "preprod-matrix",
    title: "Preprod support matrix (current docs)",
    symptom: "Mixing SDK rows silently produces the failures above. Align every dep to the SAME row.",
    cause: "Wallet SDK ships as three packages (facade, dust, shielded) — do NOT mix 4.x + 4.x + 3.x ad-hoc.",
    fix: (
      <ul className="list-disc pl-5 space-y-1 font-mono text-[12px]">
        <li>Midnight Node: {MIDNIGHT_MATRIX.node.preview} (Preview) / {MIDNIGHT_MATRIX.node.preprod} (Preprod) / {MIDNIGHT_MATRIX.node.mainnet} (Mainnet)</li>
        <li>Midnight Indexer: {MIDNIGHT_MATRIX.indexer}</li>
        <li>proof-server: <span className="text-primary">{MIDNIGHT_MATRIX.proofServer}</span> (public networks; use {MIDNIGHT_MATRIX.localStack.proofServer} for local Undeployed)</li>
        <li>ledger-v8: <span className="text-primary">{MIDNIGHT_MATRIX.ledgerV8}</span></li>
        <li>compact: {MIDNIGHT_MATRIX.compact.devtools} · toolchain {MIDNIGHT_MATRIX.compact.toolchain}</li>
        <li>compact-runtime: {MIDNIGHT_MATRIX.compact.runtime} · compact-js: {MIDNIGHT_MATRIX.compact.compactJs}</li>
        <li>midnight-js-*: {MIDNIGHT_MATRIX.midnightJs}</li>
        <li>testkit-js: {MIDNIGHT_MATRIX.testkitJs}</li>
        <li>onchain-runtime-v3: {MIDNIGHT_MATRIX.compact.onchainRuntime}</li>
        <li>Wallet SDK: {MIDNIGHT_MATRIX.walletSdk} (facade / dust / shielded must all match this row)</li>
        <li>DApp Connector API: {MIDNIGHT_MATRIX.dappConnectorApi}</li>
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
    id: "inputs-signatures-length-mismatch-192",
    title: "1010 Custom error: 192 = InputsSignaturesLengthMismatch",
    symptom:
      "A circuit that touches unshielded value (e.g. `receiveUnshielded` in a `deposit`) proves fine, then the node rejects it with `1010 Invalid Transaction: Custom error: 192`. Shielded-only calls (`deploy`, a pure shielded circuit) succeed from the same wallet, so it reads like a contract bug.",
    cause:
      "Any unshielded input pulls a NIGHT UTXO into the transaction, and UTXO inputs carry Schnorr signatures. `balanceUnboundTransaction` does NOT add them — the tx arrives with one input and zero signatures. Measured on Preview by the m402 team (Hack Buenos Aires open-track winner).",
    fix: (
      <>
        <p>Sign the recipe between balancing and finalising:</p>
        <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre">
{`const recipe = await wallet.balanceUnboundTransaction(tx, keys, { ttl });
const signed = await wallet.signRecipe(recipe, (p) => keystore.signData(p)); // required
return wallet.finalizeRecipe(signed);`}
        </pre>
        <p className="mt-2">
          Rule of thumb: the moment a circuit reads or sends NIGHT, <code>signRecipe</code> is mandatory.
        </p>
      </>
    ),
    links: [
      { label: "m402 constraints ↗", href: "https://github.com/julianariel/m402/blob/main/docs/constraints.md" },
    ],
  },
  {
    id: "one-wallet-one-tx",
    title: "One wallet cannot submit two transactions concurrently",
    symptom:
      "Two calls fired at once from a single wallet: the first lands, the second is rejected with `1010 Custom error: 170` (InvalidDustSpendProof) — or the test just hangs forever.",
    cause:
      "Both transactions build a DUST spend proof against the same wallet DUST state, and the node throws the second out before contract execution. A rejected submission also never settles its promise, so it waits for a confirmation that never arrives.",
    fix: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Serialize calls per wallet — an agent loop must queue, not fan out.</li>
        <li>Wrap every submit in an explicit timeout so a rejection surfaces as a failure, not a hang.</li>
        <li>
          Contract-level write contention <em>cannot</em> be measured from a single-wallet harness: a low
          "landed" count measures the wallet. Use a second funded wallet.
        </li>
      </ul>
    ),
    links: [
      { label: "m402 constraints ↗", href: "https://github.com/julianariel/m402/blob/main/docs/constraints.md" },
    ],
  },
  {
    id: "leveldb-private-state-traps",
    title: "LEVEL_LOCKED / \"No private state found\" / \"Contract address not set\"",
    symptom:
      "Local failures that look exactly like on-chain contention: `Error: Database failed to open … lock midnight-level-db/LOCK: already held by process { code: 'LEVEL_LOCKED' }`, or `submitCallTx` failing with \"No private state found at private state ID …\" / \"Contract address not set\", or `first argument 'location' must be a non-empty string`.",
    cause:
      "`levelPrivateStateProvider` takes two similarly-named options and only one is a directory: `midnightDbName` is the LevelDB directory on disk (default `midnight-level-db`), `privateStateStoreName` is an object store inside it (default `private-states`). LevelDB is single-writer.",
    fix: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Concurrent callers need different <code>midnightDbName</code> values. Different{" "}
          <code>privateStateStoreName</code> values change nothing — they still open the same directory.
        </li>
        <li>
          A fresh store is empty: call <code>provider.setContractAddress(contractAddress)</code> first, then{" "}
          <code>await provider.set(id, emptyPrivateState())</code>.
        </li>
        <li>
          Passing <code>midnightDbName: undefined</code> is not the same as omitting it — the provider spreads
          your config over its defaults, so an explicit <code>undefined</code> wipes the default. Spread the key
          in only when it is set.
        </li>
        <li>Rule out all four local causes before reading any result as a property of the chain.</li>
      </ul>
    ),
    links: [
      { label: "m402 constraints ↗", href: "https://github.com/julianariel/m402/blob/main/docs/constraints.md" },
    ],
  },
  {
    id: "dead-sync-fibre",
    title: "A sub-wallet's sync dies while the command keeps waiting",
    symptom:
      "A transient indexer WebSocket error kills one sub-wallet's sync fibre (observed on Preview as `Wallet.Sync: [object ErrorEvent]` from `wallet-sdk-dust-wallet`, seconds after start). The facade keeps emitting state that never becomes strictly complete, so the command looks slow rather than failing.",
    cause:
      "Nothing ends the wait except your deadline — so the deadline's value is the whole design. A 60-minute budget is indistinguishable from a hang for an operator.",
    fix: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Use a <strong>10-minute</strong> sync deadline, overridable via an env var (m402 uses{" "}
          <code>MIDNIGHT_SYNC_TIMEOUT_MS</code>).
        </li>
        <li>
          Implement it as an explicit <code>Rx.race</code> against a timer, not{" "}
          <code>Rx.timeout({"{"} each {"}"})</code> placed after a <code>filter</code> — emissions that fail the
          filter never reach the timeout, so its semantics silently depend on pipe position.
        </li>
        <li>Restart the command after a deadline hit; a dead fibre never recovers.</li>
      </ul>
    ),
    links: [
      { label: "m402 constraints ↗", href: "https://github.com/julianariel/m402/blob/main/docs/constraints.md" },
    ],
  },
  {
    id: "node-version-exports",
    title: "ERR_PACKAGE_PATH_NOT_EXPORTED inside a tsx stack trace",
    symptom:
      "The Midnight SDK fails to resolve its ESM exports and the error surfaces deep inside a `tsx` stack trace, reading like a dependency problem.",
    cause:
      "It is a runtime-version problem. The SDK's exports fail to resolve on Node 23 and Node 26. Midnight documents 22 as the floor and pins 24 in `example-hello-world`.",
    fix: (
      <p>
        <strong>Node 22 or 24 only</strong> — 22.12.0 and 24.19.0 are both verified against Preview. Check{" "}
        <code>node -v</code> before debugging anything else, and pin it in{" "}
        <code>.nvmrc</code> / <code>package.json</code> engines.
      </p>
    ),
  },
  {
    id: "sync-cache-genesis-replay",
    title: "Every command re-syncs from genesis (687s cold vs 54s warm)",
    symptom:
      "A single Preview deposit takes ~687s wall clock with ~644s of CPU, of which ~710s is wallet sync — proving is 27s and confirmation 1.4s. The next identical run costs exactly the same.",
    cause:
      "`FluentWalletBuilder` can only build from a seed, and a from-seed wallet starts at `appliedIndex === 0`. Both `shielded/src/v1/Sync.ts` and `dust-wallet/src/v1/Sync.ts` compute `resumeFrom = appliedIndex - 1n` and open the subscription with no cursor when that is negative — so it streams every indexer event from the beginning, every invocation.",
    fix: (
      <>
        <p>
          Persist the sub-wallet states and restore them on the next build. Measured on Preview: 687.5s cold →{" "}
          <strong>53.8s warm</strong> (12.8x), CPU 644s → 12s — that is trial-decryption replay disappearing.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            Use <code>serializeState()</code> / <code>restore()</code> on all three sub-wallets.
          </li>
          <li>
            <strong>All three sub-wallets and the facade must share one <code>txHistoryStorage</code></strong> —
            otherwise shielded and unshielded writes go to a storage the facade never reads.
          </li>
          <li>
            <strong>Never cache before sync completes.</strong> A mid-sync position restores cleanly and resumes
            from somewhere the wallet never applied.
          </li>
          <li>Make restore best-effort: any missing/unreadable file falls back to the from-seed build.</li>
          <li>
            The cache holds the wallet's coins — key it by a hash of master seed + network id and write it{" "}
            <code>0600</code>. It is a wallet secret.
          </li>
          <li>
            Bonus: <code>@midnight-ntwrk/testkit-js</code> costs ~5.2s just to import. Load it lazily so{" "}
            <code>--help</code>, <code>--version</code> and dry-runs don't pay for a wallet builder they never call.
          </li>
        </ul>
      </>
    ),
    links: [
      { label: "m402 constraints ↗", href: "https://github.com/julianariel/m402/blob/main/docs/constraints.md" },
    ],
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
    <SiteShell>
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-20 [&_code]:break-all [&_code]:whitespace-normal [&_code]:text-[11px] sm:[&_code]:text-[12px] [&_pre]:text-[10px] sm:[&_pre]:text-[11px]">
      <span className="eyebrow">Reference · July 2026 snapshot</span>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 leading-[1.05] break-words">
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

      <div className="mt-6 p-4 sm:p-5 border border-primary/40 bg-card">
        <span className="eyebrow text-primary">recommended workaround · local devnet</span>
        <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
          For active development, Midnight DevRel currently advises running against a{" "}
          <strong>local standalone stack</strong> (<code>NetworkId.Undeployed</code>) rather
          than fighting Preprod DUST sync. The node mints unlimited tDUST to the genesis
          wallet and every version is guaranteed to match the SDK bundle you're building
          against.{" "}
          <Link to="/undeployed" className="text-primary underline">
            Start with the Undeployed quick-start →
          </Link>{" "}
          then run{" "}
          <code className="text-foreground">bun scripts/midnight-standalone.mjs up</code>. Verify
          in your browser at{" "}
          <Link to="/undeployed-preflight" className="text-primary underline">
            /undeployed-preflight
          </Link>
          , and see the{" "}
          <Link to="/showcase/choreo-ledger-local" className="text-primary underline">
            Choreo Ledger (Local) demo
          </Link>
          .
        </p>
      </div>

      <div className="mt-6" id="docker-setup-anchor">
        <DockerSetupGuide />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Docker + Git setup for macOS, Windows, and Linux. The Windows tab keeps the real blockers
          hit on a Windows 11 HP laptop before the Midnight stack would even start — BIOS
          virtualization, WSL update, Node.js + PowerShell execution policy.
        </p>
      </div>

      <div className="mt-6 p-4 sm:p-5 border border-border bg-card">
        <span className="eyebrow text-primary">External references · Midnight-skills</span>
        <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
          Browsable skill registry from the community (Kali-Decoder / Tusharpamnani). Each page is a full
          scaffold: contract, wallet wiring, indexer patterns, troubleshooting tables.
        </p>
        <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
          <li>
            <a href="https://midnight-skills.netlify.app" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              midnight-skills.netlify.app ↗
            </a>{" "}<span className="text-muted-foreground">— site</span>
          </li>
          <li>
            <a href="https://github.com/Kali-Decoder/Midnight-skills" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              GitHub source ↗
            </a>
          </li>
          <li>
            <a href="https://midnight-skills.netlify.app/skills/compact" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              compact
            </a>{" "}<span className="text-muted-foreground">— language deep-dive</span>
          </li>
          <li>
            <a href="https://midnight-skills.netlify.app/skills/react-wallet-connector" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              react-wallet-connector
            </a>
          </li>
          <li>
            <a href="https://midnight-skills.netlify.app/skills/midnight-environment-setup" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              midnight-environment-setup
            </a>
          </li>
          <li>
            <a href="https://midnight-skills.netlify.app/skills/indexer" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              indexer
            </a>
          </li>
          <li>
            <a href="https://midnight-skills.netlify.app/skills/example-locker-dapp" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              example-locker-dapp
            </a>
          </li>
          <li>
            <a href="https://midnight-skills.netlify.app/skills/example-counter" target="_blank" rel="noreferrer" className="text-primary underline break-all">
              example-counter
            </a>
          </li>
        </ul>
      </div>

      <nav className="mt-8 p-4 border border-border bg-card text-[12px]">
        <div className="eyebrow text-primary mb-2">On this page</div>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
          {ISSUES.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} className="block py-1 text-foreground/80 hover:text-primary transition-colors">
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
            className="scroll-mt-20 p-4 sm:p-6 md:p-7 border border-border bg-card overflow-hidden"
          >
            <h2 className="font-display text-xl sm:text-2xl text-foreground break-words">{issue.title}</h2>
            <div className="mt-4 grid gap-3 text-sm text-foreground/85 leading-relaxed min-w-0">
              <div className="min-w-0">
                <div className="eyebrow text-primary mb-1">Symptom</div>
                <p>{issue.symptom}</p>
              </div>
              <div className="min-w-0">
                <div className="eyebrow text-primary mb-1">Cause</div>
                <p>{issue.cause}</p>
              </div>
              <div className="min-w-0">
                <div className="eyebrow text-primary mb-1">Workaround</div>
                <div>{issue.fix}</div>
              </div>
            </div>
            {issue.links && issue.links.length > 0 && (
              <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-[11px] uppercase tracking-[0.24em]">
                {issue.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-foreground transition-colors break-all"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </article>

        ))}
      </div>

      <div className="mt-12 p-4 sm:p-6 border border-primary/30 bg-card text-sm text-muted-foreground">
        Source: Midnight team (Nasihudeen Jimoh) responses on the Midnight Discord, June–July 2026, paraphrased
        for reference. When escalating, open a{" "}
        <a href={SERVICE_DESK} target="_blank" rel="noreferrer" className="text-primary underline">
          Service Desk ticket
        </a>{" "}
        with pinned versions, indexer URLs, and whether you're seeing unshielded/DUST sync errors or hangs.
      </div>

      <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-[11px] uppercase tracking-[0.24em]">
        <Link to="/showcase" className="text-primary hover:text-foreground">← Back to showcase</Link>
        <Link to="/showcase/choreo-ledger-local" className="text-primary hover:text-foreground">Choreo Ledger (Local) →</Link>
        <Link to="/showcase/midnight-ledger" className="text-primary hover:text-foreground">Midnight Ledger demo →</Link>
        <Link to="/showcase/programmatic-dust" className="text-primary hover:text-foreground">Programmatic DUST →</Link>
      </div>

    </div>
    </SiteShell>
  );
}
