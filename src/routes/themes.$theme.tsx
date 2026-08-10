import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { IdeaCard } from "@/components/idea-card";
import { getTheme, IDEAS_BY_THEME, HOOKS, PROTOCOL_LABELS, type Protocol, type Theme } from "@/data/ideas";

type ProtocolFilter = Protocol | "base" | null;


export const Route = createFileRoute("/themes/$theme")({
  head: ({ params }) => {
    const theme = getTheme(params.theme);
    const title = theme ? `${theme.name} · 100 onchain hackathon ideas` : "Theme · Creative Blockchain";
    const desc = theme
      ? `100 buildable hackathon ideas for ${theme.audience} using Lovable + Ethereum Sepolia, Privy, Pinata.`
      : "Browse ideas by discipline.";
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
    const theme = getTheme(params.theme);
    if (!theme) throw notFound();
    return { theme };
  },
  notFoundComponent: ThemeNotFound,
  errorComponent: ThemeError,
  component: ThemePage,
});

function ThemePage() {
  const { theme } = Route.useLoaderData() as { theme: Theme };
  const ideas = IDEAS_BY_THEME[theme.slug];
  const [q, setQ] = useState("");
  const [hookFilter, setHookFilter] = useState<string | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ideas.filter((i) => {
      if (hookFilter && i.quantumHookId !== hookFilter) return false;
      if (protocolFilter === "base" && i.protocol) return false;
      if (protocolFilter && protocolFilter !== "base" && i.protocol !== protocolFilter) return false;
      if (!needle) return true;
      return (
        i.title.toLowerCase().includes(needle) ||
        i.pitch.toLowerCase().includes(needle) ||
        i.subDiscipline.toLowerCase().includes(needle)
      );
    });
  }, [ideas, q, hookFilter, protocolFilter]);


  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-20 pb-10 animate-fade-in">
        <div className="flex items-center gap-2 eyebrow text-muted-foreground">
          <Link to="/themes" className="hover:text-primary transition-colors">Index</Link>
          <span>/</span>
          <span className="text-primary">{theme.slug}</span>
        </div>
        <header className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between border-b border-border pb-8 gap-6">
          <div className="max-w-3xl">
            <span className="eyebrow block mb-4">House · {theme.audience}</span>
            <div className="flex items-center gap-5">
              <span className="text-5xl sm:text-6xl">{theme.emoji}</span>
              <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] italic text-foreground">{theme.name}</h1>
            </div>
          </div>
          <div className="flex gap-8 font-display">
            <div>
              <div className="text-3xl italic text-primary leading-none">{ideas.length}</div>
              <div className="eyebrow text-muted-foreground mt-2">Entries</div>
            </div>
            <div>
              <div className="text-3xl italic text-primary leading-none">{new Set(ideas.map((i) => i.quantumHookId)).size}</div>
              <div className="eyebrow text-muted-foreground mt-2">Primitives</div>
            </div>
          </div>
        </header>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 md:sticky md:top-[76px] z-30 bg-background/85 backdrop-blur-md py-4 sm:py-5 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search entries…"
            className="flex-1 px-4 py-3 bg-transparent border border-border text-sm font-light focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
          />
          <div
            className="flex md:flex-wrap gap-2 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible pb-1 md:pb-0"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
            }}
          >
            <FilterChip active={hookFilter === null} onClick={() => setHookFilter(null)}>
              All
            </FilterChip>
            {HOOKS.map((h) => (
              <FilterChip key={h.id} active={hookFilter === h.id} onClick={() => setHookFilter(h.id)}>
                {h.name}
              </FilterChip>
            ))}
            <span className="shrink-0 w-2" aria-hidden />
          </div>
        </div>
        <div
          className="mt-3 flex md:flex-wrap gap-2 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible pb-1 md:pb-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
          }}
          aria-label="Protocol overlay filter"
        >
          <FilterChip active={protocolFilter === null} onClick={() => setProtocolFilter(null)}>
            All protocols
          </FilterChip>
          <FilterChip active={protocolFilter === "base"} onClick={() => setProtocolFilter("base")}>
            Base only
          </FilterChip>
          {(Object.keys(PROTOCOL_LABELS) as Protocol[]).map((p) => (
            <FilterChip key={p} active={protocolFilter === p} onClick={() => setProtocolFilter(p)}>
              {PROTOCOL_LABELS[p]}
            </FilterChip>
          ))}
          <span className="shrink-0 w-2" aria-hidden />
        </div>

      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="eyebrow text-muted-foreground mb-6">
          Showing {filtered.length} of {ideas.length} entries
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {filtered.map((i) => (
            <IdeaCard key={i.id} idea={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 font-display text-2xl italic text-muted-foreground">No entries match. Clear the filter?</div>
        )}
      </section>
    </SiteShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-[10px] tracking-[0.24em] uppercase font-semibold border transition-colors duration-500 ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-muted-foreground hover:text-primary hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function ThemeNotFound() {
  const params = Route.useParams();
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Theme not found</h1>
        <p className="mt-3 text-muted-foreground">"{params.theme}" isn't one of our 10 disciplines.</p>
        <Link to="/themes" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Browse all themes
        </Link>
      </div>
    </SiteShell>
  );
}

function ThemeError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">This theme didn't load.</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </SiteShell>
  );
}
