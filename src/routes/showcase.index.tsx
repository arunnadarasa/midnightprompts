import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CONTRACTS, NETWORK_IDS } from "@/data/midnight-contract";
import { DualDeployStatus } from "@/components/DeployStatusPanel";

type NetworkFilter = "all" | "preview" | "preprod" | "undeployed" | "undeployed-fly";

const FILTERS: { key: NetworkFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "undeployed", label: "Local · Undeployed" },
  { key: "undeployed-fly", label: "Fly.io · Undeployed" },
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
    key: "choreocrowd-fund",
    href: "https://choreo-crow.lovable.app/",
    tag: "Fireside live build · Undeployed",
    badge: "Undeployed",
    networks: ["undeployed"],
    title: "ChoreoCrowd Fund",
    body: (
      <>
        Private onchain crowdfunding for dance projects — built live during the Midnight Fireside
        chat. Demonstrates the server-append pattern (UI → <code>/api/append-entry</code> → genesis
        wallet) for local Undeployed writes, since Lace can't sign on the Undeployed chain. Source on{" "}
        <a href="https://github.com/arunnadarasa/midnightfireside" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>
    ),
  },
  {
    key: "zealymidnight",
    href: "https://github.com/arunnadarasa/zealymidnight",
    tag: "NFT rail · Undeployed",
    badge: "Undeployed",
    networks: ["undeployed"],
    title: "StreetRail Move Rights NFT",
    body: (
      <>
        A Compact NFT rail for move rights: mint → <code>listSale</code> → buy, settled in mUSDC on
        the local Undeployed stack. Writes go through the server-append genesis wallet, and the
        public ledger maps are strictly insert-only / append-only — the fix for the dust
        fee-balancer panic (<code>transaction_feesWithMargin</code> / <code>transaction_merge</code>)
        that hits any circuit overwriting an existing map key. Verified end to end
        (<code>E2E_OK</code>). Source on{" "}
        <a href="https://github.com/arunnadarasa/zealymidnight" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
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
        deploy script and the Lace-funding helper. Live on Fly.io — see the{" "}
        <Link to="/undeployed" hash="fly" className="underline hover:text-primary">hosting recipe & open blocker</Link>. Source on{" "}
        <a href="https://github.com/arunnadarasa/choreokits" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>

    ),
  },
  {
    key: "flymidnight",
    href: "https://flymidnight.lovable.app/",
    tag: "Hosted Undeployed · Fly.io",
    badge: "Fly.io · Undeployed",
    networks: ["undeployed", "undeployed-fly"],
    title: "flymidnight",
    body: (
      <>
        Public Fly.io-hosted Undeployed stack — four apps (node · indexer · proof · faucet)
        deployed once, any visitor with Lace can try the demo without running Docker. Canonical
        reference for the WalletFacade 4.1.1 readiness check
        (<code>state.dust.state.progress.isStrictlyComplete()</code>), the public HTTPS proof-server
        URL, and the in-app <code>Get tDUST</code> faucet button. Live demo at{" "}
        <a href="https://flymidnight.lovable.app/" target="_blank" rel="noreferrer" className="underline hover:text-primary">flymidnight.lovable.app</a>; source on{" "}
        <a href="https://github.com/arunnadarasa/flymidnight" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>
    ),
  },
  {
    key: "a2a-ap2",
    href: "https://agenticmidnight.lovable.app/",
    tag: "Agentic · A2A + AP2",
    badge: "External demo",
    networks: ["preview", "preprod", "undeployed"],
    title: "A2A + AP2 Negotiation",
    body: (
      <>
        Buyer and seller agents exchange typed A2A DataParts, agree on a CartMandate,
        and anchor the signed mandate on the Midnight <code>MandateVault</code> Compact
        contract. Live demo at{" "}
        <a href="https://agenticmidnight.lovable.app/" target="_blank" rel="noreferrer" className="underline hover:text-primary">agenticmidnight.lovable.app</a>; source on{" "}
        <a href="https://github.com/arunnadarasa/agenticmidnight" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>
    ),
  },
  {
    key: "ucp-checkout",
    href: "https://ucpmidnight.lovable.app/",
    tag: "Agentic · UCP",
    badge: "External demo",
    networks: ["preview", "preprod", "undeployed"],
    title: "UCP ZK-Checkout",
    body: (
      <>
        RFC 9421-signed discovery and checkout, closed by recording the order hash on the
        Midnight <code>OrderLedger</code>. Live demo at{" "}
        <a href="https://ucpmidnight.lovable.app/" target="_blank" rel="noreferrer" className="underline hover:text-primary">ucpmidnight.lovable.app</a>; source on{" "}
        <a href="https://github.com/arunnadarasa/ucpmidnight" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>
    ),
  },
  {
    key: "x402-paywall",
    href: "https://x402midnight.lovable.app/",
    tag: "Agentic · x402 · mUSDC",
    badge: "External demo",
    networks: ["preview", "preprod", "undeployed"],
    title: "x402 Midnight Paywall",
    body: (
      <>
        Pay 0.01 mUSDC to unlock a protected endpoint. Ports the x402 v2 envelope +{" "}
        <code>PAYMENT-SIGNATURE</code>/<code>PAYMENT-RESPONSE</code> headers to Midnight,
        settling via the mimic <code>MidnightUSDC</code> contract. Live demo at{" "}
        <a href="https://x402midnight.lovable.app/" target="_blank" rel="noreferrer" className="underline hover:text-primary">x402midnight.lovable.app</a>; source on{" "}
        <a href="https://github.com/arunnadarasa/x402midnight" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>.
      </>
    ),
  },
  {
    key: "m402",
    href: "https://m402-web-three.vercel.app/",
    tag: "Agentic · x402 · no payer",
    badge: "Preview · hackathon winner",
    networks: ["preview"],
    title: "m402 — private agentic payments",
    body: (
      <>
        The reference private-payments rail: the same 402-and-retry flow, but the payment{" "}
        <strong>carries no payer</strong>. A vault pools NIGHT and mints a shielded credit 1:1, and{" "}
        <code>pay</code> takes no payer argument and reads no caller identity — it only proves it
        holds a valid credit worth the published price. The gateway is a pure reader: the agent
        submits its own transaction and the gateway watches the indexer for the receipt, so it never
        signs and cannot fake a payment. Open-track winner at Hack Buenos Aires. Live at{" "}
        <a href="https://m402-web-three.vercel.app/" target="_blank" rel="noreferrer" className="underline hover:text-primary">m402-web-three.vercel.app</a>; source on{" "}
        <a href="https://github.com/julianariel/m402" target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>{" "}
        — read{" "}
        <a href="https://github.com/julianariel/m402/blob/main/docs/constraints.md" target="_blank" rel="noreferrer" className="underline hover:text-primary">docs/constraints.md</a>{" "}
        before you design any payment circuit. Its findings are folded into our{" "}
        <Link to="/known-issues" className="underline hover:text-primary">Known issues</Link> page and
        every mega-prompt.
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
      <span className="eyebrow">Showcase · Curated builds</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Working <span className="italic text-primary">ZK demos</span>.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Three reference builds from the prompt library: a Compact-contract ledger, a hackathon-ready
        token kit, and the ChoreoCrowd Fund demo built live during the Midnight Fireside chat. All
        include deploy scripts, Lace wallet steps, and are tested on public testnets and the local
        Undeployed stack.
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
        {visible.map((demo) => {
          const card = (
            <>
              <div className="flex items-center justify-between gap-x-4 gap-y-1 flex-wrap">
                <span className="eyebrow text-primary break-words">{demo.tag}</span>
                <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground break-words">{demo.badge} ↗</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors break-words">
                {demo.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl [overflow-wrap:anywhere] [&_code]:break-all">{demo.body}</p>
            </>
          );
          return demo.href ? (
            <a
              key={demo.key}
              href={demo.href}
              target="_blank"
              rel="noreferrer"
              className="group block min-w-0 overflow-hidden p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
            >
              {card}
            </a>
          ) : (
            <Link
              key={demo.key}
              to={demo.to!}
              className="group block min-w-0 overflow-hidden p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
            >
              {card}
            </Link>
          );
        })}
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

