import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders article markdown with the site's editorial styling.
 * No `prose` plugin is installed, so every element is mapped explicitly.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="min-w-0 text-[15px] sm:text-base leading-relaxed text-muted-foreground font-light">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: () => null,
          h2: ({ children }) => (
            <h2 className="font-display text-2xl sm:text-3xl text-foreground mt-14 mb-4 leading-tight [overflow-wrap:anywhere]">
              {children as ReactNode}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-xl text-foreground mt-10 mb-3 leading-tight [overflow-wrap:anywhere]">
              {children as ReactNode}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-4 break-words [overflow-wrap:anywhere]">{children as ReactNode}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
              className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary break-words"
            >
              {children as ReactNode}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 pl-5 list-disc space-y-2 marker:text-primary/70">{children as ReactNode}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 pl-5 list-decimal space-y-2 marker:text-primary/70">{children as ReactNode}</ol>
          ),
          li: ({ children }) => <li className="break-words [overflow-wrap:anywhere]">{children as ReactNode}</li>,
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">{children as ReactNode}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-primary/50 pl-4 italic text-foreground/80">
              {children as ReactNode}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-border" />,
          code: ({ className, children }) => {
            const isBlock = typeof className === "string" && className.includes("language-");
            if (isBlock) {
              return <code className="block font-mono text-[12px] sm:text-[13px] leading-relaxed">{children as ReactNode}</code>;
            }
            return (
              <code className="font-mono text-[0.85em] px-1.5 py-0.5 bg-muted/60 text-foreground break-all">
                {children as ReactNode}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 max-w-full overflow-x-auto border border-border bg-muted/30 p-4 text-foreground">
              {children as ReactNode}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-6 -mx-5 sm:mx-0 overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">{children as ReactNode}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="border-b border-border">{children as ReactNode}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-[10px] tracking-[0.2em] uppercase text-foreground font-semibold align-top">
              {children as ReactNode}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top border-t border-border/50 break-words [overflow-wrap:anywhere]">
              {children as ReactNode}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
