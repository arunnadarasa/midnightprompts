import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { ExperimentalAgenticBanner } from "@/components/ExperimentalAgenticBanner";

export const Route = createFileRoute("/showcase/ucp-zk-checkout")({
  head: () => ({
    meta: [
      { title: "UCP ZK checkout on Midnight" },
      { name: "description", content: "RFC 9421-signed UCP checkout that records the order hash on the Midnight OrderLedger contract." },
      { property: "og:title", content: "UCP ZK checkout on Midnight" },
      { property: "og:description", content: "Signed UCP checkout closed by a Midnight tx. Experimental hackathon demo." },
    ],
  }),
  component: UCPPage,
});

const RECEIPT = `HTTP/1.1 200 OK
Content-Type: application/vnd.ucp.order+json
Signature-Input: sig1=("@method" "@path" "midnight-tx");created=1735056000;keyid="ucp:merchant:v1"
Signature: sig1=:MEUCIQD…:
Midnight-Tx: 0xSIMULATED
Midnight-Network: midnight:preprod

{
  "orderId": "ord_01HZ…",
  "itemHash": "0x9f…",
  "buyer":    "mn_addr_test1…",
  "amount":   1600,
  "currency": "mUSDC"
}`;

function UCPPage() {
  return (
    <SiteShell>
      <ExperimentalAgenticBanner />
      <article className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20 space-y-8">
        <span className="eyebrow">Showcase · UCP</span>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">
          Signed checkout, <span className="italic text-primary">recorded on-chain</span>.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light max-w-2xl">
          The merchant serves an RFC 9421-signed <code>/discovery</code> document. Each{" "}
          <code>/checkout</code> POST is validated, hashed, and the resulting order is recorded on
          the Midnight <code>OrderLedger</code> contract. The receipt includes a{" "}
          <code>Midnight-Tx</code> header.
        </p>

        <section className="border border-border">
          <header className="px-4 py-3 border-b border-border eyebrow text-primary">Example signed receipt</header>
          <pre className="p-4 text-[11px] sm:text-xs font-mono leading-relaxed overflow-x-auto">{RECEIPT}</pre>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground font-light leading-relaxed">
          <p>
            Contract source: <code>contracts/OrderLedger.compact</code>. Pair with the UCP
            conformance <code>selfTest</code> op to verify signing keys against the on-chain
            fingerprint.
          </p>
          <p>
            The full protocol block for UCP is embedded in every prompt tagged with{" "}
            <Link to="/themes" className="underline hover:text-primary">agentic · ucp</Link>.
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
