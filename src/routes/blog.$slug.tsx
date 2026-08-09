import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Markdown } from "@/components/markdown";
import { getPost } from "@/content/blog";

const BASE = "https://midnightprompts.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const url = `${BASE}/blog/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Article unavailable — Creative Midnight" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Creative Midnight` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            keywords: post.tags.join(", "),
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20 min-w-0">
        <Link
          to="/blog"
          className="text-[10px] tracking-[0.28em] uppercase font-semibold text-muted-foreground hover:text-primary transition-colors duration-500"
        >
          ← Field notes
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.24em] uppercase text-muted-foreground">
          <time dateTime={post.date}>{post.date}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl mt-3 leading-[1.1] [overflow-wrap:anywhere]">
          {post.title}
        </h1>
        <p className="mt-5 text-muted-foreground font-light leading-relaxed break-words">
          {post.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 border border-border text-[10px] tracking-[0.2em] uppercase text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>

        <hr className="my-10 border-border" />

        <Markdown>{post.body}</Markdown>

        {post.devTo ? (
          <a
            href={post.devTo}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-12 px-4 py-2.5 border border-primary text-[10px] tracking-[0.28em] uppercase font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
          >
            Read on dev.to ↗
          </a>
        ) : null}
      </article>
    </SiteShell>
  );
}

function PostNotFound() {
  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-3xl">Article not found</h1>
        <p className="mt-4 text-muted-foreground font-light">That write-up doesn't exist (yet).</p>
        <Link
          to="/blog"
          className="inline-block mt-8 text-[10px] tracking-[0.28em] uppercase font-semibold text-primary"
        >
          All field notes →
        </Link>
      </div>
    </SiteShell>
  );
}
