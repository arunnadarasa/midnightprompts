import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import meta from "../../public/llms-full.meta.json";
import fullAsset from "../../public/llms-full.txt.asset.json";
import previewMacos from "../../public/llms-prompts-preview-macos.txt.asset.json";
import previewWindows from "../../public/llms-prompts-preview-windows.txt.asset.json";
import previewLinux from "../../public/llms-prompts-preview-linux.txt.asset.json";
import preprodMacos from "../../public/llms-prompts-preprod-macos.txt.asset.json";
import preprodWindows from "../../public/llms-prompts-preprod-windows.txt.asset.json";
import preprodLinux from "../../public/llms-prompts-preprod-linux.txt.asset.json";
import undeployedMacos from "../../public/llms-prompts-undeployed-macos.txt.asset.json";
import undeployedWindows from "../../public/llms-prompts-undeployed-windows.txt.asset.json";
import undeployedLinux from "../../public/llms-prompts-undeployed-linux.txt.asset.json";

const PROMPTS: Record<string, Record<string, { url: string; size: number }>> = {
  preview: { macos: previewMacos, windows: previewWindows, linux: previewLinux },
  preprod: { macos: preprodMacos, windows: preprodWindows, linux: preprodLinux },
  undeployed: { macos: undeployedMacos, windows: undeployedWindows, linux: undeployedLinux },
};

const NET_LABEL: Record<string, string> = { preview: "Preview", preprod: "Preproduction", undeployed: "Undeployed" };
const OS_LABEL: Record<string, string> = { macos: "macOS", windows: "Windows", linux: "Linux" };

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const Route = createFileRoute("/llms")({
  head: () => ({
    meta: [
      { title: "LLM Docs — Creative Midnight" },
      {
        name: "description",
        content:
          "Downloadable llms-full.txt of the entire Creative Midnight site — guides, Docker/wallet/proof-server setup, and all 1,000 hackathon mega-prompts across 3 networks × 3 host OSes.",
      },
      { property: "og:title", content: "LLM Docs — Creative Midnight" },
      {
        property: "og:description",
        content: "Feed the full Creative Midnight hackathon reference into Cursor, Claude, ChatGPT, or Lovable.",
      },
    ],
  }),
  component: LlmsPage,
});

function LlmsPage() {
  const [network, setNetwork] = useState<string>("undeployed");
  const [os, setOs] = useState<string>("macos");

  const selected = PROMPTS[network][os];

  const copy = (url: string) => {
    const abs = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
    navigator.clipboard.writeText(abs);
    toast.success("URL copied to clipboard");
  };

  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-10">
        <header className="space-y-3">
          <span className="eyebrow">Reference bundle</span>
          <h1 className="font-display text-3xl sm:text-5xl">LLM Docs</h1>
          <p className="text-muted-foreground max-w-2xl">
            The entire Creative Midnight site — guides, Docker setup for macOS · Windows · Linux, wallet flows,
            proof-server, Undeployed local stack, known issues, and all {meta.ideaCount.toLocaleString()} idea
            mega-prompts in {meta.variantCount.toLocaleString()} variants (3 networks × 3 host OSes) — packaged as
            plain-text files you can feed to Cursor, Claude Projects, ChatGPT custom GPTs, or paste back into Lovable.
          </p>
          <p className="text-xs text-muted-foreground">
            Last generated: {new Date(meta.generatedAt).toUTCString()}
          </p>
        </header>

        {/* Full + core */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl">Full bundle</h2>
              <span className="text-xs text-muted-foreground">{humanSize(fullAsset.size)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Everything: all guides + all {meta.variantCount.toLocaleString()} prompt variants. Big — use it as a
              knowledge-base upload for tools that support long files (Claude Projects, custom GPTs).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={fullAsset.url} download={fullAsset.original_filename}>
                  <Download className="h-4 w-4 mr-2" /> Download llms-full.txt
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy(fullAsset.url)}>
                <Copy className="h-4 w-4 mr-2" /> Copy URL
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl">Core (guides only)</h2>
              <span className="text-xs text-muted-foreground">{humanSize(meta.sizes.core)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Just the reference guides — wallet, proof-server, Docker (macOS/Windows/Linux), Undeployed, known issues,
              strategy, primer. Fits comfortably in any LLM context window.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href="/llms-core.txt" download>
                  <Download className="h-4 w-4 mr-2" /> Download llms-core.txt
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy("/llms-core.txt")}>
                <Copy className="h-4 w-4 mr-2" /> Copy URL
              </Button>
            </div>
          </Card>
        </section>

        {/* Per-combo prompts */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl">Prompts by network × OS</h2>
            <p className="text-sm text-muted-foreground">
              Nine slimmer files, one per (network, host-OS) combination. Smaller context, same {meta.ideaCount.toLocaleString()} ideas.
            </p>
          </div>

          <div className="space-y-4">
            <Tabs value={network} onValueChange={setNetwork}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Network</div>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="preprod">Preproduction</TabsTrigger>
                <TabsTrigger value="undeployed">Undeployed</TabsTrigger>
              </TabsList>
              {Object.keys(PROMPTS).map((n) => (
                <TabsContent key={n} value={n} />
              ))}
            </Tabs>

            <Tabs value={os} onValueChange={setOs}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Host OS</div>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="macos">macOS</TabsTrigger>
                <TabsTrigger value="windows">Windows</TabsTrigger>
                <TabsTrigger value="linux">Linux</TabsTrigger>
              </TabsList>
            </Tabs>

            <Card className="p-6 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg">
                  {NET_LABEL[network]} · {OS_LABEL[os]}
                </h3>
                <span className="text-xs text-muted-foreground">{humanSize(selected.size)}</span>
              </div>
              <p className="text-sm text-muted-foreground break-all">
                All {meta.ideaCount.toLocaleString()} ideas as mega-prompts tuned for{" "}
                <strong>{NET_LABEL[network]}</strong> on <strong>{OS_LABEL[os]}</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a href={selected.url} download={`llms-prompts-${network}-${os}.txt`}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
                <Button size="sm" variant="outline" onClick={() => copy(selected.url)}>
                  <Copy className="h-4 w-4 mr-2" /> Copy URL
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Usage */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl">How to use it</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 space-y-2">
              <h3 className="font-semibold">Cursor / Windsurf</h3>
              <p className="text-sm text-muted-foreground">
                Settings → Features → Docs → <em>Add doc</em>. Paste the URL above. The IDE re-indexes it as a
                first-class doc source.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <h3 className="font-semibold">Claude Projects</h3>
              <p className="text-sm text-muted-foreground">
                Create a Project → <em>Knowledge</em> → upload <code>llms-full.txt</code>. Every conversation in the
                project now has the whole hackathon reference in scope.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <h3 className="font-semibold">ChatGPT custom GPT</h3>
              <p className="text-sm text-muted-foreground">
                My GPTs → Configure → <em>Knowledge</em> → upload the core file or the network-specific prompt bundle.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <h3 className="font-semibold">Lovable</h3>
              <p className="text-sm text-muted-foreground">
                Paste any single mega-prompt in one message — or reference the URL and ask the model to fetch it.
                Prompts are self-contained.
              </p>
            </Card>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl">Upstream Midnight docs</h2>
          <p className="text-sm text-muted-foreground">
            For the Midnight team's own always-fresh export of the protocol docs:
          </p>
          <a
            href="https://docs.midnight.network/llms-full.txt"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            docs.midnight.network/llms-full.txt <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      </div>
    </SiteShell>
  );
}
