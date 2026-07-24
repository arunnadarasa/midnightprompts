import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { ExperimentalAgenticBanner } from "@/components/ExperimentalAgenticBanner";

export const Route = createFileRoute("/showcase/a2a-ap2-negotiation")({
  head: () => ({
    meta: [
      { title: "A2A + AP2 negotiation on Midnight" },
      { name: "description", content: "Buyer↔seller A2A negotiation closed by an AP2 CartMandate anchored on the Midnight MandateVault Compact contract." },
      { property: "og:title", content: "A2A + AP2 negotiation on Midnight" },
      { property: "og:description", content: "Agent negotiation with a Midnight tx at the end. Experimental hackathon demo." },
    ],
  }),
  component: A2AAP2Page,
});

const TRANSCRIPT = [
  { role: "Buyer agent", body: "IntentMandate: I want 2 tickets to `Krump Cypher Vol.1`, budget 20 mUSDC." },
  { role: "Seller agent", body: "CartMandate offer: 2× Krump Cypher Vol.1 @ 8 mUSDC each — total 16 mUSDC. Expires in 5m." },
  { role: "Buyer agent", body: "Sign CartMandate → witness proof (buyerSecret binds to pk = ap2:buyer:v1)." },
  { role: "Server", body: "POST /api/public/ap2-anchor { mandateHash, buyer, seller, amount, proof }." },
  { role: "Midnight", body: "anchorMandate(...) → tx 0xSIMULATED — MandateVault.anchored_count += 1." },
];

function A2AAP2Page() {
  return (
    <SiteShell>
      <ExperimentalAgenticBanner />
      <article className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20 space-y-8">
        <span className="eyebrow">Showcase · A2A + AP2</span>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">
          Agent negotiation, <span className="italic text-primary">Midnight-anchored</span>.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light max-w-2xl">
          The buyer agent and seller agent exchange typed A2A DataParts. Once they agree, the buyer
          signs an AP2 CartMandate with a Compact witness proof and the server anchors the mandate
          hash on the Midnight <code>MandateVault</code> contract.
        </p>

        <section className="border border-border">
          <header className="px-4 py-3 border-b border-border eyebrow text-primary">Negotiation transcript</header>
          <ol className="divide-y divide-border">
            {TRANSCRIPT.map((t, i) => (
              <li key={i} className="px-4 py-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground mb-1">{i + 1} · {t.role}</div>
                <div className="font-mono text-xs sm:text-sm leading-relaxed">{t.body}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground font-light leading-relaxed">
          <p>
            Contract source: <code>contracts/MandateVault.compact</code>. Deploy with{" "}
            <code>bun run compile</code> on the Undeployed stack, or via the Preview/Preprod deploy
            script.
          </p>
          <p>
            The full protocol block for A2A + AP2 is embedded in every prompt tagged with{" "}
            <Link to="/themes/agentic-a2a-ap2" className="underline hover:text-primary">agentic · a2a-ap2</Link>.
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
