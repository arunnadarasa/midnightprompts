import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";
import { QuantumChip } from "@/components/quantum-chip";
import { getIdea, getTheme, getHook, IDEAS_BY_THEME, type NetworkVariant } from "@/data/ideas";
import { buildVariant } from "@/lib/mega-prompt-variants";
import { getPlainProposition } from "@/lib/plain-language";


const VARIANT_META: Record<NetworkVariant, { label: string; caption: string; explorer: string | null }> = {
  preview:    { label: "Preview",             caption: "Fastest to demo. Testnet resets often. Faucet: nethermind.dev preview.", explorer: "https://preview.midnightexplorer.com/" },
  preprod:    { label: "Preprod",             caption: "Closer to mainnet parameters. Stable but occasional DUST-sync quirks.", explorer: "https://preprod.midnightexplorer.com/" },
  undeployed: { label: "Undeployed (local)",  caption: "Run the standalone stack on your own machine. No faucet, unlimited tDUST. DevRel-advised.", explorer: null },
};
const VARIANT_KEYS: NetworkVariant[] = ["preview", "preprod", "undeployed"];


export const Route = createFileRoute("/ideas/$id")({
  head: ({ params }) => {
    const idea = getIdea(params.id);
    const title = idea ? `${idea.title} · Creative Midnight idea` : "Idea · Creative Midnight";
    const desc = idea ? idea.pitch : "A Midnight ZK hackathon idea.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const idea = getIdea(params.id);
    if (!idea) throw notFound();
    const theme = getTheme(idea.theme)!;
    const hook = getHook(idea.quantumHookId);
    return { idea, theme, hook };
  },
  notFoundComponent: IdeaNotFound,
  errorComponent: IdeaError,
  component: IdeaPage,
});

const SECRETS = [
  { name: "VITE_NETWORK_ID", note: "`preview` (or `preprod`). Matches Lace's network setting.", href: "https://docs.midnight.network/relnotes/network" },
  { name: "VITE_INDEXER_URL", note: "Midnight GraphQL Indexer for public ledger reads.", href: "https://docs.midnight.network/relnotes/network" },
  { name: "VITE_INDEXER_WS_URL", note: "WebSocket endpoint for realtime ledger subscriptions.", href: "https://docs.midnight.network/relnotes/network" },
  { name: "VITE_PROOF_SERVER_URL", note: "Local Docker proof server (port 6300) — required for tx submits.", href: "https://docs.midnight.network/getting-started/installation" },
  { name: "VITE_DEFAULT_CONTRACT", note: "Pre-deployed contract address so users skip the deploy step.", href: "https://docs.midnight.network/getting-started/hello-world" },
];

function IdeaPage() {
  const { idea, theme, hook } = Route.useLoaderData();
  const related = IDEAS_BY_THEME[theme.slug]
    .filter((i) => i.id !== idea.id && (i.subDiscipline === idea.subDiscipline || i.quantumHookId === idea.quantumHookId))
    .slice(0, 4);

  const [variant, setVariant] = useState<NetworkVariant>("preview");
  const activePrompt = useMemo(() => buildVariant(idea, theme, variant), [idea, theme, variant]);
  const activeMeta = VARIANT_META[variant];


  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-20 animate-fade-in">
        <nav className="eyebrow text-muted-foreground flex items-center gap-2">
          <Link to="/themes" className="hover:text-primary transition-colors">Index</Link>
          <span>/</span>
          <Link to="/themes/$theme" params={{ theme: theme.slug }} className="hover:text-primary transition-colors">{theme.slug}</Link>
          <span>/</span>
          <span className="text-primary">№ {idea.id.slice(-3)}</span>
        </nav>

        <header className="mt-8 pb-10 border-b border-border">
          <span className="eyebrow block mb-6">
            {theme.emoji} {theme.name} · {idea.subDiscipline}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-[0.95] text-foreground break-words">
            {idea.title}
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-muted-foreground leading-relaxed font-light max-w-3xl">{idea.pitch}</p>
          <div className="mt-6">
            <QuantumChip hookId={idea.quantumHookId} label={idea.quantumHook} tag={idea.quantumTag} />
          </div>
        </header>

        <section className="mt-12 p-5 sm:p-10 border border-primary/30 bg-card relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full gold-bloom blur-3xl opacity-60 pointer-events-none" />
          <div className="relative flex items-baseline justify-between gap-4 mb-5">
            <div>
              <span className="eyebrow block mb-2">Section · Onchain</span>
              <h2 className="font-display text-3xl italic text-foreground">The primitive.</h2>
            </div>
            <Link to="/quantum-primer" hash={idea.quantumHookId} className="story-gold eyebrow text-primary">
              full primer →
            </Link>
          </div>
          <p className="relative text-lg text-foreground leading-relaxed font-light">
            {getPlainProposition(idea, theme)}
          </p>
          <p className="relative text-sm text-muted-foreground leading-relaxed mt-4 font-light">
            <span className="eyebrow text-primary mr-3">Why this primitive</span>
            {idea.quantumRationale}
          </p>
          {hook && (
            <div className="relative mt-8 pt-6 border-t border-border grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="eyebrow mb-2">Kernel</div>
                <div className="text-foreground/90 font-light leading-relaxed">{hook.kernel}</div>
              </div>
              <div>
                <div className="eyebrow mb-2">Drives the UI as</div>
                <div className="text-foreground/90 font-light leading-relaxed">{hook.ui}</div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-12">
          <span className="eyebrow block mb-2">Appendix · Secrets</span>
          <h2 className="font-display text-3xl italic text-foreground mb-6">Required keys.</h2>
          <div className="grid sm:grid-cols-2 gap-px bg-border">
            {SECRETS.map((s) => (
              <div key={s.name} className="p-6 bg-card">
                <div className="font-mono text-[12px] tracking-wider text-primary">{s.name}</div>
                <div className="text-sm text-foreground/80 mt-2 font-light leading-relaxed">{s.note}</div>
                <a href={s.href} target="_blank" rel="noreferrer" className="story-gold eyebrow text-primary inline-block mt-3">
                  open ↗
                </a>
              </div>
            ))}
          </div>
          <p className="mt-4 eyebrow text-muted-foreground">
            Add these in your Lovable project under Settings → Secrets before pasting the prompt below.
          </p>
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span className="eyebrow block mb-2">Appendix · Mega-prompt</span>
              <h2 className="font-display text-3xl italic text-foreground">The build prompt.</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-2 border border-primary/40 eyebrow text-primary">
                budget · 1 message
              </span>
              <CopyButton text={activePrompt} label={`Copy · ${activeMeta.label}`} />
            </div>
          </div>

          <div className="mb-4">
            <div className="inline-flex flex-wrap gap-px bg-border border border-border">
              {VARIANT_KEYS.map((k) => {
                const active = k === variant;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setVariant(k)}
                    className={
                      "px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors " +
                      (active
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground/70 hover:text-primary hover:bg-background")
                    }
                    aria-pressed={active}
                  >
                    {VARIANT_META[k].label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-light leading-relaxed max-w-3xl">
              <span className="eyebrow text-primary mr-2">{activeMeta.label}</span>
              {activeMeta.caption}
            </p>
            {variant === "undeployed" && (
              <p className="mt-2 text-xs text-primary/80 font-light leading-relaxed max-w-3xl">
                This variant includes step-by-step Docker + Compose instructions for macOS, Windows (WSL2),
                and Linux inside the prompt.{" "}
                <Link to="/showcase/choreo-ledger-local" className="story-gold text-primary">
                  see the Choreo Ledger (Local) demo →
                </Link>{" "}
                <Link to="/known-issues" className="story-gold text-primary">
                  known issues →
                </Link>
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4 font-light leading-relaxed">
            Paste into a fresh Lovable project. Make sure the secrets for this target are set first.{" "}
            <Link to="/strategy" className="story-gold text-primary">read the build strategy →</Link>
          </p>
          <p className="text-xs text-primary/80 mb-4 font-light leading-relaxed">
            The prompt below includes a self-contained Connect-Lace step (DApp Connector v4) —
            no extra setup needed on the target project.
          </p>

          <pre className="whitespace-pre-wrap break-all font-mono text-[11px] sm:text-[13px] leading-relaxed p-4 sm:p-8 border border-border bg-card text-foreground/90 w-full max-w-full overflow-x-hidden" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", letterSpacing: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>
{activePrompt}
          </pre>
          <div className="mt-5 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em]">
            <a
              href={`https://lovable.dev/?prompt=${encodeURIComponent(activePrompt)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition-colors duration-500"
            >
              Open in Lovable · {activeMeta.label} ↗
            </a>
            {activeMeta.explorer && (
              <a
                href={activeMeta.explorer}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
              >
                Midnight Explorer ↗
              </a>
            )}
            {variant === "undeployed" && (
              <Link
                to="/showcase/choreo-ledger-local"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
              >
                Local stack guide →
              </Link>
            )}
          </div>
        </section>

        <section className="mt-12">
          <span className="eyebrow block mb-2">Appendix · Market</span>
          <h2 className="font-display text-3xl italic text-foreground mb-6">Market sizing.</h2>
          <div className="grid sm:grid-cols-3 gap-px bg-border">
            <MarketCard label="TAM" value={idea.tam} />
            <MarketCard label="SAM" value={idea.sam} gold />
            <MarketCard label="SOM" value={idea.som} />
          </div>
          <p className="mt-4 eyebrow text-muted-foreground">
            Indicative figures for hackathon pitches — refine with your own research before raising.
          </p>
        </section>

        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border">
            <span className="eyebrow block mb-2">See also</span>
            <h2 className="font-display text-3xl italic text-foreground mb-6">Adjacent entries.</h2>
            <div className="grid sm:grid-cols-2 gap-px bg-border">
              {related.map((r) => (
                <Link key={r.id} to="/ideas/$id" params={{ id: r.id }} className="p-6 bg-card hover:bg-background transition-colors duration-500 group">
                  <span className="eyebrow capitalize">{r.subDiscipline}</span>
                  <div className="font-display text-xl mt-2 text-foreground">{r.title}</div>
                  <div className="text-sm text-muted-foreground mt-2 line-clamp-2 font-light">{r.pitch}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteShell>
  );
}

function MarketCard({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  const [num, ...rest] = value.split(" — ");
  return (
    <div className={`p-7 ${gold ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <div className={`text-[10px] tracking-[0.32em] uppercase font-semibold ${gold ? "opacity-80" : "text-primary"}`}>{label}</div>
      <div className={`font-display text-4xl mt-3 italic leading-none ${gold ? "" : "text-primary"}`}>{num}</div>
      <div className={`text-xs mt-3 leading-relaxed font-light ${gold ? "opacity-80" : "text-muted-foreground"}`}>{rest.join(" — ")}</div>
    </div>
  );
}

function IdeaNotFound() {
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Idea not found</h1>
        <Link to="/themes" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Browse themes
        </Link>
      </div>
    </SiteShell>
  );
}

function IdeaError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">This idea didn't load.</h1>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Try again
        </button>
      </div>
    </SiteShell>
  );
}
