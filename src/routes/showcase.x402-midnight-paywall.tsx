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

        <section className="space-y-2 text-sm text-muted-foreground font-light leading-relaxed border border-border p-4">
          <div className="eyebrow text-primary">Prior art · m402</div>
          <p>
            <a href="https://github.com/julianariel/m402" target="_blank" rel="noreferrer" className="underline hover:text-primary">m402</a>{" "}
            (Hack Buenos Aires open-track winner) runs the same 402-and-retry flow on Midnight with{" "}
            <strong>no payer in the payment</strong>: a vault pools NIGHT and mints a shielded credit
            1:1, and its <code>pay</code> circuit takes no payer argument and reads no caller
            identity. The gateway only reads the chain — the agent submits its own transaction.
          </p>
          <p>
            Quote the cost honestly. Measured on Preview, a <code>pay</code> is{" "}
            <strong>23–25 s end to end: proof 1.4 s, submit 22.5 s, chain 1.5 s</strong>, and
            verifying a proof takes ~3.4 ms. Submission dominates; calling the whole 25 s
            "generating a zero-knowledge proof" is wrong by an order of magnitude. The bigger cost is
            wallet sync — 687 s cold from seed vs 54 s with the sub-wallet states cached.
          </p>
          <p>
            Its{" "}
            <a href="https://github.com/julianariel/m402/blob/main/docs/constraints.md" target="_blank" rel="noreferrer" className="underline hover:text-primary">docs/constraints.md</a>{" "}
            is required reading before you design a payment circuit; the failure modes are on our{" "}
            <Link to="/known-issues" className="underline hover:text-primary">Known issues</Link> page.
          </p>
        </section>

      </article>
    </SiteShell>
  );
}
