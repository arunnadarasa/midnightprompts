import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTRACTS, NETWORK_IDS } from "@/data/midnight-contract";
import { DualDeployStatus } from "@/components/DeployStatusPanel";

export const Route = createFileRoute("/showcase/")({
  component: ShowcaseIndex,
});

function ShowcaseIndex() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Working <span className="italic text-primary">ZK demos</span>, deployed live.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Reference builds from the prompt library. Each demo is a real Compact contract on the
        Midnight preview and preprod testnets. State is read from the public Indexer — no wallet
        needed to browse.
      </p>

      <DualDeployStatus
        cfgs={NETWORK_IDS.map((n) => CONTRACTS[n])}
        className="mt-10"
      />

      <div className="mt-12 grid gap-6">
        <Link
          to="/showcase/midnight-ledger"
          className="group block p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-primary">Dance · Compact ZK Contract</span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Live ↗</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors">
            Midnight Ledger
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Timestamp original choreography privately. A Compact <code>appendEntry</code> circuit commits
            the message to the public ledger while the author's identity stays hidden behind a ZK-proved
            witness. Public ledger view runs read-only over the Midnight Indexer.
          </p>
        </Link>

        <Link
          to="/showcase/programmatic-dust"
          className="group block p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-primary">Preprod only · Wallet SDK</span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Docs ↗</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors">
            Programmatic DUST
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Create a wallet, print all three addresses, fund the unshielded address with tNIGHT, then
            explicitly register NIGHT UTXOs for DUST generation. The docs' end-to-end flow, mirrored
            locally with <code>bun scripts/dust-demo-preprod.mjs</code>.
          </p>
        </Link>

        <Link
          to="/showcase/choreo-ledger-local"
          className="group block p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-primary">Local dev · advised by Midnight DevRel</span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Local ↗</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors">
            Choreo Ledger (Local)
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            The Demo 01 Compact contract, run against a <strong>local standalone stack</strong>{" "}
            (<code>NetworkId.Undeployed</code>: node + indexer + proof-server on{" "}
            <code>localhost</code>). Zero faucet, unlimited tDUST, no Preprod sync bugs — the
            path Midnight DevRel currently recommends while Preprod stabilises.
          </p>
        </Link>

        <Link
          to="/showcase/move-board"
          className="group block p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-primary">Bboard pattern · call an existing contract</span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Live ↗</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors">
            Move Board
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Post a dance move against an <strong>already-deployed</strong> contract — no fresh deploy per visitor.
            Skips the DUST-heavy deploy step (helpful while the Preprod DUST sync bug is around) and only pays the
            small <code>callTx</code> fee. Contract pattern from{" "}
            <code>midnightntwrk/example-bboard</code>.
          </p>
        </Link>
      </div>

      <Link
        to="/known-issues"
        className="mt-8 group block p-5 border border-primary/30 hover:border-primary/60 transition-colors duration-500"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="eyebrow text-primary">Reference · Preprod snapshot</span>
          <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Known issues ↗</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Hitting <code>1010 InvalidDustSpendProof</code>, <code>DustSpendProcessed</code> decode errors, or{" "}
          <code>/check 400 bad input</code>? Field notes from the Midnight team, with the current workaround
          for each.
        </p>
      </Link>
    </div>
  );
}

