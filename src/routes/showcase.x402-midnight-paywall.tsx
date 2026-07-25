import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { ExperimentalAgenticBanner } from "@/components/ExperimentalAgenticBanner";

export const Route = createFileRoute("/showcase/x402-midnight-paywall")({
  head: () => ({
    meta: [
      { title: "x402 paywall on Midnight (mUSDC)" },
      { name: "description", content: "Pay 0.01 mUSDC to unlock a protected endpoint. Ports x402 v2 to Midnight with the MidnightUSDC mimic token." },
      { property: "og:title", content: "x402 paywall on Midnight (mUSDC)" },
      { property: "og:description", content: "x402 v2 envelope + PAYMENT-SIGNATURE headers, settled by a real Midnight tx. Experimental hackathon demo." },
    ],
  }),
  component: X402Page,
});

const STEPS = [
  { title: "Challenge", body: "GET /api/public/x402-challenge → 402 { x402Version:2, accepts:[{ scheme:'midnight-mUSDC', network:'midnight:preprod', asset:'0x…MidnightUSDC', amount:'10000' }] }" },
  { title: "Sign", body: "Local circuit produces witness proof over (from, to, amount, nonce, expiry). Wrap in v2 envelope under `accepted`." },
  { title: "Retry", body: "GET /api/public/x402-proxy with base64 PAYMENT-SIGNATURE header." },
  { title: "Settle", body: "Facilitator submits MidnightUSDC.transfer(...). Returns PAYMENT-RESPONSE: { midnightTxHash, network, payer }." },
];

function X402Page() {
  return (
    <SiteShell>
      <ExperimentalAgenticBanner persistent />
      <article className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20 space-y-8">
        <span className="eyebrow">Showcase · x402 · mUSDC</span>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">
          Pay 0.01 mUSDC, <span className="italic text-primary">unlock the endpoint</span>.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light max-w-2xl">
          A Midnight facilitator ports the x402 v2 spec off Base and onto a Compact-witness signing
          scheme. Settlement uses <code>MidnightUSDC</code>, a mimic token with no peg. Read the{" "}
          <Link to="/agentic-experimental" className="underline hover:text-primary">disclaimer</Link> before
          extending.
        </p>

        <ol className="border border-border divide-y divide-border">
          {STEPS.map((s, i) => (
            <li key={i} className="p-4">
              <div className="eyebrow text-primary mb-1">Step {i + 1} · {s.title}</div>
              <p className="font-mono text-[11px] sm:text-xs leading-relaxed break-words">{s.body}</p>
            </li>
          ))}
        </ol>

        <section className="space-y-2 text-sm text-muted-foreground font-light leading-relaxed">
          <p>
            Contract source: <code>contracts/MidnightUSDC.compact</code>. Faucet caps every mint at
            10 mUSDC — deploy your own if you need more headroom.
          </p>
          <p>
            The full protocol block for x402 is embedded in every prompt tagged with{" "}
            <Link to="/themes" className="underline hover:text-primary">agentic · x402</Link>.
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
