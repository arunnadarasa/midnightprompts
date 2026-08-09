import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Card } from "@/components/ui/card";
import { BLOG_POSTS } from "@/content/blog";

const TITLE = "Field Notes — Creative Midnight";
const DESCRIPTION =
  "Engineering write-ups from building on Midnight: the mega-prompt generator, version pinning against the support matrix, and the failure modes we hit across local, Fly.io and Android targets.";
const URL = "https://midnightprompts.lovable.app/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="eyebrow text-primary">Field notes</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-tight">
          Engineering <span className="italic text-primary">write-ups</span>
        </h1>
        <p className="mt-5 text-muted-foreground font-light leading-relaxed">
          What we learned building the prompt generator and the reference dApps — written up so the next
          hackathon team doesn't re-debug it.
        </p>

        <div className="mt-12 flex flex-col gap-5">
          {BLOG_POSTS.map((post) => (
            <Card key={post.slug} className="min-w-0 overflow-hidden p-6 sm:p-7 bg-card border-border">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.24em] uppercase text-muted-foreground">
                <time dateTime={post.date}>{post.date}</time>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min read</span>
              </div>
              <h2 className="font-display text-2xl mt-3 leading-tight [overflow-wrap:anywhere]">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="hover:text-primary transition-colors duration-500"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed break-words">
                {post.description}
              </p>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="inline-block mt-5 text-[10px] tracking-[0.28em] uppercase font-semibold text-primary hover:text-foreground transition-colors duration-500"
              >
                Read the article →
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
