import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet · Creative Midnight" },
      { name: "description", content: "Lace — the browser extension wallet for Midnight. DApp connection, hardware wallet support, selective privacy, and the Glacier Drop." },
      { property: "og:title", content: "Wallet · Creative Midnight" },
      { property: "og:description", content: "Lace — the browser extension wallet for Midnight. DApp connection, hardware wallet support, selective privacy, and the Glacier Drop." },
    ],
  }),
  component: Wallet,
});

function Wallet() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="eyebrow">tools · midnight</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">Lace — the Midnight wallet.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed font-light max-w-2xl">
          Lace is the official browser extension wallet for Midnight. It connects to DApps, holds
          your shielded and public addresses, and signs transactions without ever exposing your
          private witness data. Built by the same team behind the Midnight network.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">01</span>
            <h3 className="font-display text-xl text-foreground">Browser Extension</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Install in Chrome, Brave, or Edge. One click to connect any Midnight DApp. No
              desktop binary required.
            </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">02</span>
            <h3 className="font-display text-xl text-foreground">Hardware Wallet Support</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Pair with Ledger for cold-storage signing. Keys stay on the device; only proofs
              cross the wire.
            </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">03</span>
            <h3 className="font-display text-xl text-foreground">Selective Privacy</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Choose what to reveal. Every transaction can be fully shielded, fully transparent,
              or somewhere in between — you control the dial.
            </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">04</span>
            <h3 className="font-display text-xl text-foreground">DApp Connection</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Standard injection pattern. Any Lovable build that targets Midnight can request
              accounts, sign proofs, and submit transactions through Lace.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-6">
        <div className="p-6 border border-primary/30 bg-card">
          <div className="eyebrow text-primary">glacier drop</div>
          <h2 className="font-display text-2xl text-foreground italic mt-1">NIGHT Token Community Allocation</h2>
          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
            The Glacier Drop is Midnight's community allocation programme for the NIGHT token.
            Eligible participants — including early testnet contributors, hackathon builders, and
            ecosystem partners — may qualify for a distribution. Lace is the wallet you will use
            to receive and manage the allocation when the programme goes live.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.lace.io/midnight"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500"
            >
              Get Lace ↗
            </a>
            <a
              href="https://docs.midnight.network/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 transition-colors duration-500"
            >
              Midnight Docs ↗
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20">
        <div className="p-6 border border-border bg-card">
          <div className="eyebrow text-primary">testnet</div>
          <h2 className="font-display text-2xl text-foreground italic mt-1">Faucets &amp; Addresses</h2>
          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
            Once Lace is installed, switch to the network you are building on and copy your address
            to request test tokens. Preprod is the default for hackathon demos; Preview is for
            bleeding-edge SDK features.
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://midnight-tmnight-preprod.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preprod Faucet</div>
                <div className="text-xs text-muted-foreground font-light mt-1">mn_addr_preprod1…</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
            <a
              href="https://midnight-tmnight-preview.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preview Faucet</div>
                <div className="text-xs text-muted-foreground font-light mt-1">mn_addr_test1…</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://preprod.midnightexplorer.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preprod Explorer</div>
                <div className="text-xs text-muted-foreground font-light mt-1">preprod.midnightexplorer.com</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
            <a
              href="https://preview.midnightexplorer.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preview Explorer</div>
                <div className="text-xs text-muted-foreground font-light mt-1">preview.midnightexplorer.com</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
          <div className="mt-4 text-xs text-muted-foreground font-light">
            Read more about the differences between networks in the{" "}
            <Link to="/quantum-primer" hash="networks" className="text-primary underline">Quantum Primer →</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
