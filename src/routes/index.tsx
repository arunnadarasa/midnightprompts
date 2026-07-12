import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { THEMES, ALL_IDEAS, HOOKS } from "@/data/ideas";
import { CONTRACTS, isDeployed, NETWORK_IDS } from "@/data/midnight-contract";
import { MOVEBOARD_CONTRACTS, isMoveBoardDeployed } from "@/data/moveboard-contract";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creative Midnight — 1,000 ZK hackathon ideas for Lovable" },
      { name: "description", content: "A browseable repo of 1,000 mega-prompts pairing ten creative disciplines with Midnight's private-by-default ZK primitives: Compact contracts, Lace wallet, private witnesses, and IPFS content. Built during the Creative AI & Quantum Hackathon." },
      { property: "og:title", content: "Creative Midnight — 1,000 ZK hackathon ideas for Lovable" },
      { property: "og:description", content: "A browseable repo of 1,000 mega-prompts pairing ten creative disciplines with Midnight's private-by-default ZK primitives: Compact contracts, Lace wallet, private witnesses, and IPFS content. Built during the Creative AI & Quantum Hackathon." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = ALL_IDEAS[42] ?? ALL_IDEAS[0];
  const portrait = ALL_IDEAS[317] ?? ALL_IDEAS[1];
  return (
    <SiteShell>
      {/* HERO — editorial folio header */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-24 pb-12 sm:pb-20 animate-fade-in">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-border pb-10 lg:pb-12 gap-8">
          <div className="max-w-3xl">
            <span className="eyebrow block mb-6">Collection No. 01 — 1,000 Midnight Ideas</span>
            <h1 className="font-display text-[clamp(3.25rem,9vw,8.5rem)] leading-[0.92] tracking-tight text-foreground">
              Creative <span className="italic text-primary">Midnight</span>
            </h1>
            <p className="mt-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
              One thousand conceptual threads where the world's creative
              disciplines meet a private ZK primitive — Compact smart contracts
              on Midnight, the Lace wallet, private witnesses that never leave
              the browser, and IPFS-committed provenance — each one ready
              to ship in a single Lovable build.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em]">
            <Link
              to="/themes"
              className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
            >
              Browse the Index
            </Link>
            <a
              href="https://midnight-tmnight-preprod.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors duration-500"
            >
              Preprod Faucet ↗
            </a>
            <a
              href="https://midnight-tmnight-preview.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
            >
              Preview Faucet ↗
            </a>
          </div>
        </header>

        {/* BENTO — primary repository grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 auto-rows-[260px] gap-4 md:gap-5">
          <Link
            to="/ideas/$id"
            params={{ id: featured.id }}
            className="md:col-span-2 md:row-span-2 group relative overflow-hidden bg-card border border-border p-8 sm:p-10 flex flex-col justify-between hover:border-primary/50 transition-all duration-500"
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full gold-bloom blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <span className="eyebrow">Primary Directive · {featured.theme}</span>
              <h2 className="font-display text-3xl sm:text-5xl md:text-[3.25rem] mt-6 leading-[1.05] italic text-foreground">
                {featured.title}
              </h2>
            </div>
            <div className="relative z-10">
              <p className="text-sm text-muted-foreground max-w-md mb-7 leading-relaxed line-clamp-3 font-light">
                {featured.pitch}
              </p>
              <div className="flex items-center gap-4 border-t border-border pt-5">
                <div className="w-12 h-px bg-primary" />
                <span className="eyebrow text-primary">View Entry</span>
              </div>
            </div>
          </Link>

          <Link
            to="/ideas/$id"
            params={{ id: portrait.id }}
            className="md:row-span-2 group bg-card border border-border p-7 flex flex-col hover:border-primary/50 transition-all duration-500"
          >
            <div className="flex-1 flex flex-col">
              <div className="w-full aspect-[3/4] bg-background border border-border/60 mb-6 overflow-hidden relative">
                <div className="absolute inset-0 gold-bloom opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[9rem] italic text-primary/30 leading-none">02</span>
                </div>
              </div>
              <h3 className="font-display text-2xl leading-tight text-foreground">{portrait.title}</h3>
            </div>
            <div className="pt-4 mt-4 border-t border-border/60">
              <span className="eyebrow text-muted-foreground capitalize">Theme · {portrait.theme}</span>
            </div>
          </Link>

          <div className="bg-primary text-primary-foreground p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <span className="font-display text-7xl italic leading-none">1k</span>
            <span className="eyebrow text-primary-foreground/80 mt-3" style={{ color: "var(--color-primary-foreground)", opacity: 0.85 }}>
              ZK Entries
            </span>
          </div>

          <Link
            to="/quantum-primer"
            className="group bg-card border border-border p-7 flex flex-col justify-between hover:border-primary/50 transition-colors duration-500"
          >
            <span className="eyebrow">Section II</span>
            <div>
              <h3 className="font-display text-2xl leading-tight text-foreground italic">Four Midnight primitives.</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-3 font-light">
                Compact contract deploys, private witnesses, Lace wallet + tDUST, and IPFS content commits — the four kernels every entry leans on.
              </p>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <div className="w-1 h-1 rounded-full bg-primary" />
              <div className="w-1 h-1 rounded-full bg-primary" />
              <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
          </Link>

          <Link
            to="/strategy"
            className="md:col-span-2 group relative bg-background border border-primary/30 p-8 sm:p-10 flex items-center justify-between gap-6 hover:border-primary transition-colors duration-500"
          >
            <div className="max-w-md">
              <span className="eyebrow">Appendix · Build Strategy</span>
              <h3 className="font-display text-2xl sm:text-3xl mt-3 text-foreground">The Five-Secret Protocol</h3>
              <p className="text-sm text-muted-foreground mt-2 font-light leading-relaxed">
                Five secrets, one Lovable build, every contract provable on Midnight preview + preprod.
              </p>
            </div>
            <span className="w-12 h-12 shrink-0 rounded-full border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
              →
            </span>
          </Link>

          <div className="bg-card border border-border p-7">
            <div className="h-full border-l border-primary/30 pl-5 flex flex-col justify-center gap-3">
              <span className="eyebrow">Status</span>
              <p className="font-display text-xl italic text-foreground leading-tight">
                Live on Midnight preview + preprod.
              </p>
              <div className="flex flex-col gap-1.5 text-[10px] tracking-[0.24em] uppercase">
                {NETWORK_IDS.map((n) => {
                  const cfg = CONTRACTS[n];
                  const live = isDeployed(cfg);
                  return (
                    <Link
                      key={n}
                      to="/proof-server"
                      className={`flex items-center justify-between gap-2 hover:text-primary transition-colors ${live ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <span>{live ? "●" : "○"} {n}</span>
                      <span className="text-muted-foreground/70">{live ? "deployed" : "awaiting"}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-2 pt-3 border-t border-border/60 flex flex-col gap-1.5 text-[10px] tracking-[0.24em] uppercase">
                <span className="text-muted-foreground/70 normal-case tracking-[0.16em]">Move Board · bboard pattern</span>
                {NETWORK_IDS.map((n) => {
                  const cfg = MOVEBOARD_CONTRACTS[n];
                  const live = isMoveBoardDeployed(cfg);
                  return (
                    <Link
                      key={`mb-${n}`}
                      to="/showcase/move-board"
                      className={`flex items-center justify-between gap-2 hover:text-primary transition-colors ${live ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <span>{live ? "●" : "○"} {n}</span>
                      <span className="text-muted-foreground/70">{live ? "deployed" : "awaiting"}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-7 md:col-span-2">
            <div className="h-full border-l border-primary/30 pl-5 flex flex-col justify-center gap-3">
              <span className="eyebrow">Support · Midnight team</span>
              <p className="font-display text-xl italic text-foreground leading-tight">
                Hit a Preprod wall? Open a Service Desk ticket.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bug reports, 1010 rejections, /check 400, DUST sync stalls — routed to the Midnight engineering team.
              </p>
              <div className="flex flex-wrap gap-5 text-[11px] uppercase tracking-[0.24em] mt-1">
                <a
                  href="https://midnightntwrk.github.io/servicedesk/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:text-foreground transition-colors"
                >
                  Service Desk ↗
                </a>
                <Link to="/known-issues" className="text-primary hover:text-foreground transition-colors">
                  Known issues →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 border-t border-border">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <span className="eyebrow block mb-3">Chapter I · Disciplines</span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground italic">Ten houses, one private chain.</h2>
          </div>
          <Link to="/themes" className="story-gold text-sm tracking-[0.24em] uppercase text-primary">See full index →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
          {THEMES.map((t, idx) => (
            <Link
              key={t.slug}
              to="/themes/$theme"
              params={{ theme: t.slug }}
              className="group p-6 bg-card hover:bg-background transition-colors duration-500 flex flex-col gap-4 min-h-[180px]"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-3xl">{t.emoji}</span>
                <span className="font-display italic text-primary/60 text-xs">{String(idx + 1).padStart(2, "0")}/10</span>
              </div>
              <div className="font-display text-xl leading-tight text-foreground mt-auto">{t.name}</div>
              <div className="eyebrow text-muted-foreground group-hover:text-primary transition-colors">100 entries →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 border-t border-border">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <span className="eyebrow block mb-3">Chapter II · Primitives</span>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground italic">The four kernels.</h2>
          </div>
          <Link to="/quantum-primer" className="story-gold text-sm tracking-[0.24em] uppercase text-primary">Read the primer →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {HOOKS.map((h, idx) => (
            <Link
              key={h.id}
              to="/quantum-primer"
              hash={h.id}
              className="group p-7 bg-card hover:bg-background transition-colors duration-500 flex flex-col gap-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">{h.tag}</span>
                <span className="font-display italic text-primary/50 text-xs">№ {String(idx + 1).padStart(2, "0")}</span>
              </div>
              <div className="font-display text-2xl leading-tight text-foreground">{h.name}</div>
              <div className="text-[12px] text-muted-foreground line-clamp-3 font-light leading-relaxed">{h.kernel}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 border-t border-border">
        <span className="eyebrow block mb-3">Chapter III · Method</span>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground italic max-w-2xl">Three movements, ten minutes.</h2>
        <ol className="mt-10 grid md:grid-cols-3 gap-px bg-border">
          <Step n={1} title="Choose a house" body="Skim ten disciplines. Open the one that suits your team." />
          <Step n={2} title="Read an entry" body="Pitch, ZK primitive, plain-language proposition, market sizing." />
          <Step n={3} title="Copy the mega-prompt" body="Add five secrets, paste into Lovable, deploy to Midnight preview or preprod. Ship." />
        </ol>
        <p className="mt-10 eyebrow text-muted-foreground">
          {ALL_IDEAS.length.toLocaleString()} entries indexed · zero backend · ready to prove on Midnight
        </p>
      </section>
    </SiteShell>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="p-8 bg-card flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Movement {String(n).padStart(2, "0")}</span>
        <span className="font-display italic text-primary text-3xl leading-none">{String(n).padStart(2, "0")}</span>
      </div>
      <div className="font-display text-2xl text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground font-light leading-relaxed">{body}</div>
    </li>
  );
}
