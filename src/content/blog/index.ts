import raw from "./midnight-mega-prompts.md?raw";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  /** Markdown body with the dev.to front matter stripped. */
  body: string;
  /** Canonical dev.to URL once published. */
  devTo?: string;
};

/** Strip the leading `---` front-matter block used by dev.to. */
function stripFrontMatter(md: string): string {
  if (!md.startsWith("---")) return md.trim();
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md.trim();
  return md.slice(md.indexOf("\n", end + 1) + 1).trim();
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "midnight-mega-prompts",
    title: "We generated ~32,000 self-contained build prompts for Midnight",
    description:
      "How one idea becomes ~10,000 prompts across five network targets, why versions live in a single module, and the Midnight failure modes we hit so you don't have to.",
    date: "2026-08-09",
    readingMinutes: 10,
    tags: ["zeroknowledge", "webdev", "blockchain", "ai"],
    body: stripFrontMatter(raw),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
