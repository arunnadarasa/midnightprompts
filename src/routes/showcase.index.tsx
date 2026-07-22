import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CONTRACTS, NETWORK_IDS } from "@/data/midnight-contract";
import { DualDeployStatus } from "@/components/DeployStatusPanel";

type NetworkFilter = "all" | "preview" | "preprod" | "undeployed";

const FILTERS: { key: NetworkFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "undeployed", label: "Local · Undeployed" },
  { key: "preview", label: "Preview" },
  { key: "preprod", label: "Preprod" },
];

interface DemoCard {
  key: string;
  to?: string;
  href?: string;
  tag: string;
  badge: string;
  networks: NetworkFilter[];
  title: string;
  body: React.ReactNode;
}

const DEMOS: DemoCard[] = [
  {
    key: "midnight-ledger",
    to: "/showcase/midnight-ledger",
    tag: "Dance · Compact ZK Contract",
    badge: "Preview / Preprod",
    networks: ["preview", "preprod"],
    title: "Midnight Ledger",
    body: (
      <>
        Timestamp original choreography privately. A Compact <code>appendEntry</code> circuit commits
        the message to the public ledger while the author's identity stays hidden behind a ZK-proved
        witness. Public ledger view runs read-only over the Midnight Indexer.
      </>
    ),
  },
  {
    key: "choreokits",
    href: "https://choreokits.lovable.app/",
    tag: "Hackathon starter · Live build",
    badge: "Preview / Preprod / Undeployed",
    networks: ["preview", "preprod", "undeployed"],
    title: "Tokenized Choreo Kits",
    body: (
      <>
        A working end-to-end reference generated from the prompt library: deploy a local Compact
        contract, fund Lace on the Undeployed devnet, and submit ZK transactions. Includes the
        deploy script and the Lace-funding helper. Source code on{" "}
        <a href="https://github.com/arunnadarasa/choreokits" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>
    ),
  },
];

export const Route = createFileRoute("/showcase/")({
  component: ShowcaseIndex,
});

function ShowcaseIndex() {
  const [filter, setFilter] = useState<NetworkFilter>("all");
  const visible = filter === "all" ? DEMOS : DEMOS.filter((d) => d.networks.includes(filter));

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Working <span className="italic text-primary">ZK demos</span>.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Reference builds from the prompt library. Some demos run on public Midnight testnets; others
        run on a local Undeployed stack. Pick a network to see what currently works best.
      </p>

      <DualDeployStatus
        cfgs={NETWORK_IDS.map((n) => CONTRACTS[n])}
        className="mt-10"
      />

      <div className="mt-10 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em]">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 border transition-colors duration-300 ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6">
        {visible.map((demo) => (
          <Link
            key={demo.to}
            to={demo.to}
            className="group block p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="eyebrow text-primary">{demo.tag}</span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">{demo.badge} ↗</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors">
              {demo.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">{demo.body}</p>
          </Link>
        ))}
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

