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
      </div>
    </div>
  );
}
