import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { HOOKS, ALL_IDEAS } from "@/data/ideas";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "Midnight primer · Creative Midnight" },
      { name: "description", content: "Four ZK primitives every idea in this repo leans on: Compact contract deploy on Midnight, private witnesses, Lace wallet + tDUST, and IPFS content commits." },
      { property: "og:title", content: "Midnight primer · Creative Midnight" },
      { property: "og:description", content: "Four Midnight primitives that drive UI features in a Lovable hackathon app." },
    ],
  }),
  component: Primer,
});

const SECRETS_BLURB = [
  { name: "VITE_NETWORK_ID", note: "`preview` (or `preprod`). Matches Lace's network setting.", href: "https://docs.midnight.network/relnotes/network" },
  { name: "VITE_INDEXER_URL", note: "Midnight GraphQL Indexer for public ledger reads.", href: "https://docs.midnight.network/relnotes/network" },
  { name: "VITE_INDEXER_WS_URL", note: "WebSocket endpoint for realtime ledger subscriptions.", href: "https://docs.midnight.network/relnotes/network" },
  { name: "VITE_PROOF_SERVER_URL", note: "Local Docker proof server (port 6300) — required for tx submits.", href: "https://docs.midnight.network/getting-started/installation" },
  { name: "VITE_DEFAULT_CONTRACT", note: "Pre-deployed contract address so users skip the deploy step.", href: "https://docs.midnight.network/getting-started/hello-world" },
];

function Primer() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="eyebrow">primer · midnight</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">Four ZK primitives, demystified.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed font-light">
          Every idea in this repo leans on one of four Midnight primitives. Each runs against
          the Midnight <strong className="text-foreground">preview testnet</strong> — a real ZK L1
          funded by a tDUST faucet, so you can ship a provably private demo with zero hosting
          and no real DUST spent.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <div className="p-6 border border-primary/30 bg-card">
          <h2 className="font-display text-2xl text-foreground italic mb-4">The five secrets</h2>
          <p className="text-sm text-muted-foreground mb-4 font-light">
            Add these in your Lovable project (Settings → Secrets) before pasting any mega-prompt:
          </p>
          <ul className="space-y-3 text-sm">
            {SECRETS_BLURB.map((s) => (
              <li key={s.name} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="font-mono text-[12px] text-primary shrink-0">{s.name}</span>
                <span className="text-foreground/80 font-light flex-1">{s.note}</span>
                <a href={s.href} target="_blank" rel="noreferrer" className="story-gold eyebrow text-primary shrink-0">open ↗</a>
              </li>
            ))}
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 pt-2 border-t border-border">
              <span className="font-mono text-[12px] text-muted-foreground shrink-0">PINATA_JWT</span>
              <span className="text-foreground/60 font-light flex-1">Optional. Only for ideas that pin artefacts to IPFS.</span>
            </li>
          </ul>
          <div className="mt-5 pt-4 border-t border-border text-[11px] text-muted-foreground/80 leading-relaxed font-light">
            <strong className="text-foreground">Terminal (one-time):</strong> install the Compact toolchain
            (<code>compact update</code>), run <code>compact compile</code>, then start the proof server:
            <code className="block mt-2 font-mono text-[10.5px] break-all">docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v</code>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 space-y-4">
        {HOOKS.map((h) => {
          const count = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).length;
          const sample = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).slice(0, 3);
          return (
            <article key={h.id} id={h.id} className="p-6 border border-border bg-card scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <div className="eyebrow text-primary">{h.tag}</div>
                  <h2 className="font-display text-2xl mt-1 text-foreground">{h.name}</h2>
                </div>
                <span className="eyebrow text-muted-foreground">{count} ideas use this</span>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="eyebrow mb-1">kernel</div>
                  <div className="text-foreground/90 font-light leading-relaxed">{h.kernel}</div>
                </div>
                <div>
                  <div className="eyebrow mb-1">how it drives the UI</div>
                  <div className="text-foreground/90 font-light leading-relaxed">{h.ui}</div>
                </div>
              </div>
              {sample.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="eyebrow text-muted-foreground mb-2">EXAMPLE IDEAS</div>
                  <ul className="space-y-1.5">
                    {sample.map((i) => (
                      <li key={i.id}>
                        <Link to="/ideas/$id" params={{ id: i.id }} className="text-sm hover:text-primary font-light">
                          → {i.title} <span className="text-muted-foreground">· {i.theme}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20">
        <div className="p-6 border border-primary/30 bg-card">
          <div className="eyebrow text-primary">networks</div>
          <h2 className="font-display text-2xl text-foreground italic mt-1">Preprod vs Preview vs Mainnet</h2>
          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
            Midnight ships three networks. Addresses, faucets, and SDK versions differ by
            suffix — the wallet you derive from a seed will look different on each.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-normal eyebrow text-muted-foreground"></th>
                  <th className="text-left py-2 px-3 font-normal eyebrow text-primary">Preprod</th>
                  <th className="text-left py-2 px-3 font-normal eyebrow text-primary">Preview</th>
                  <th className="text-left py-2 pl-3 font-normal eyebrow text-primary">Mainnet</th>
                </tr>
              </thead>
              <tbody className="text-foreground/85 font-light align-top">
                {[
                  ["Purpose", "Stable testnet mirroring the current mainnet release train.", "Bleeding-edge testnet for upcoming SDK / protocol changes.", "Real network. Real value."],
                  ["Address prefix", <code className="font-mono text-[11px]">mn_addr_preprod1…</code>, <code className="font-mono text-[11px]">mn_addr_test1…</code>, <code className="font-mono text-[11px]">mn_addr1…</code>],
                  ["Token", "tNIGHT → tDUST (free test tokens)", "tNIGHT → tDUST (free test tokens)", "NIGHT → DUST (real, purchased)"],
                  ["Faucet", "Nethermind preprod faucet", "Midnight preview faucet", "None"],
                  ["SDK version", "Stable, matches current mainnet.", "Next release candidate — may break between drops.", "Stable, audited."],
                  ["Use for", "Demos, hackathon submissions, integration tests.", "Trying features before they hit preprod.", "Production dApps only."],
                  ["Reset policy", "Occasional resets around major upgrades.", "Reset frequently without notice.", "Never."],
                ].map(([label, a, b, c], i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-3 pr-3 eyebrow text-muted-foreground whitespace-nowrap">{label}</td>
                    <td className="py-3 px-3 leading-relaxed">{a}</td>
                    <td className="py-3 px-3 leading-relaxed">{b}</td>
                    <td className="py-3 pl-3 leading-relaxed">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-4 border border-primary/40 bg-background text-sm text-foreground/85 font-light leading-relaxed">
            <strong className="text-primary">Which one for the hackathon?</strong>{" "}
            <strong className="text-foreground">Preprod</strong> is the default in this repo — it
            tracks mainnet behaviour, the faucet is reliable, and the deploy script + wallet JSON
            default there. Only reach for Preview if you need an SDK feature that hasn't landed on
            preprod yet.
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a href="https://docs.midnight.network/relnotes/network" target="_blank" rel="noreferrer" className="text-primary underline">Network endpoints ↗</a>
            <a href="https://docs.midnight.network/relnotes/overview" target="_blank" rel="noreferrer" className="text-primary underline">Release notes ↗</a>
            <a href="https://docs.midnight.network/guides/acquire-tokens" target="_blank" rel="noreferrer" className="text-primary underline">Acquire tokens ↗</a>
          </div>
        </div>
      </section>

    </SiteShell>
  );
}
