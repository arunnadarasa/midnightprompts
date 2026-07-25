import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/agentic-experimental")({
  head: () => ({
    meta: [
      { title: "Experimental agentic commerce · Midnight prompts" },
      { name: "description", content: "Why the A2A + AP2, UCP, and x402/mUSDC prompts on this site are marked experimental." },
      { property: "og:title", content: "Experimental agentic commerce · Midnight prompts" },
      { property: "og:description", content: "A2A + AP2, UCP, and x402 with mimic USDC on Midnight — the disclaimer." },
    ],
  }),
  component: AgenticExperimentalPage,
});

function AgenticExperimentalPage() {
  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24 space-y-8">
        <span className="eyebrow">Disclaimer · Agentic commerce</span>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">
          Experimental <span className="italic text-primary">on purpose</span>.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-light">
          The A2A + AP2, UCP, and x402 prompts on this site add an <strong>agentic-commerce
          overlay</strong> on top of the base Midnight ZK stack. That overlay is unfinished
          research — treat everything below as hackathon material, not production.
        </p>

        <section className="border border-amber-500/40 bg-amber-500/5 p-6 space-y-3">
          <h2 className="font-display text-2xl italic">What's real</h2>
          <ul className="list-disc pl-6 space-y-1 text-sm text-foreground/90 font-light leading-relaxed">
            <li>The Compact contracts (<code>MandateVault</code>, <code>OrderLedger</code>, <code>MidnightUSDC</code>) are real Compact 0.23 code and deployable to Preview, Preprod, or a local Undeployed stack.</li>
            <li>The A2A / AP2 / x402 protocol shapes are ported from Google's public specs and the Optimism-catalyst x402 recipe — the envelope, header casing, and nonce rules match the specs.</li>
            <li>Each agentic prompt still ends with a Midnight transaction, so the demo has an auditable on-chain footprint.</li>
          </ul>
        </section>

        <section className="border border-destructive/40 bg-destructive/5 p-6 space-y-3">
          <h2 className="font-display text-2xl italic">What's NOT real</h2>
          <ul className="list-disc pl-6 space-y-1 text-sm text-foreground/90 font-light leading-relaxed">
            <li><strong>mUSDC has no peg and no value.</strong> It's a mimic token so the x402 v2 flow can settle on Midnight. Never treat mUSDC balances as money.</li>
            <li>None of the three contracts have been audited. Do not deploy to Mainnet.</li>
            <li>The facilitator routes fall back to <code>{`{ simulated: true }`}</code> when no contract is deployed for the selected network — that path never touches the chain.</li>
            <li>AP2 mandate signing uses a Compact-witness scheme, NOT the EIP-712 domain the AP2 spec assumes. Don't cross-verify AP2 mandates from this stack against EVM verifiers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl italic">Where to look</h2>
          <ul className="list-disc pl-6 space-y-1 text-sm text-foreground/90 font-light leading-relaxed">
            <li><Link to="/showcase/a2a-ap2-negotiation" className="underline hover:text-primary">A2A + AP2 negotiation demo</Link></li>
            <li><Link to="/showcase/ucp-zk-checkout" className="underline hover:text-primary">UCP ZK-checkout demo</Link></li>
            <li><Link to="/showcase/x402-midnight-paywall" className="underline hover:text-primary">x402 · mUSDC paywall demo</Link></li>
            <li><Link to="/themes" className="underline hover:text-primary">Idea catalogue · A2A + AP2 (500)</Link></li>
            <li><Link to="/themes" className="underline hover:text-primary">Idea catalogue · UCP (250)</Link></li>
            <li><Link to="/themes" className="underline hover:text-primary">Idea catalogue · x402 (250)</Link></li>
          </ul>
        </section>
      </article>
    </SiteShell>
  );
}
