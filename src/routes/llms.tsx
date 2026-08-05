import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { MIDNIGHT_MATRIX, SUPPORT_MATRIX_URL } from "@/lib/midnight-matrix";

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
import flyMacos from "../../public/llms-prompts-undeployed-fly-macos.txt.asset.json";
import flyWindows from "../../public/llms-prompts-undeployed-fly-windows.txt.asset.json";
import flyLinux from "../../public/llms-prompts-undeployed-fly-linux.txt.asset.json";
import mobileBundle from "../../public/llms-prompts-undeployed-mobile.txt.asset.json";
// Mainnet prompt bundles are generated but hidden in the UI per Midnight DevRel guidance
// (independent devs are currently blacklisted from publishing to mainnet).

const PROMPTS: Record<string, Record<string, { url: string; size: number }>> = {
  preview: { macos: previewMacos, windows: previewWindows, linux: previewLinux },
  preprod: { macos: preprodMacos, windows: preprodWindows, linux: preprodLinux },
  undeployed: { macos: undeployedMacos, windows: undeployedWindows, linux: undeployedLinux },
  "undeployed-fly": { macos: flyMacos, windows: flyWindows, linux: flyLinux },
  "undeployed-mobile": { any: mobileBundle },
};

const NET_LABEL: Record<string, string> = {
  preview: "Preview",
  preprod: "Preproduction",
  undeployed: "Undeployed (Local)",
  "undeployed-fly": "Undeployed (Fly.io)",
  "undeployed-mobile": "Undeployed (Mobile)",
};
const OS_LABEL: Record<string, string> = { macos: "macOS", windows: "Windows", linux: "Linux", any: "Android" };
const FILE_COUNT = Object.values(PROMPTS).reduce((n, m) => n + Object.keys(m).length, 0);

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

  const isMobile = network === "undeployed-mobile";
  const activeOs = isMobile ? "any" : os;
  const selected = PROMPTS[network][activeOs];


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
            mega-prompts across 3 networks × 3 host OSes (9 variants per idea) — packaged as plain-text files
            you can feed to Cursor, Claude Projects, ChatGPT custom GPTs, or paste back into Lovable.
          </p>
          <p className="text-xs text-muted-foreground">
            Last generated: {new Date(meta.generatedAt).toUTCString()}
          </p>
        </header>

        {/* Lovable skill */}
        <section id="skills" className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl">Lovable skills</h2>
            <p className="text-sm text-muted-foreground">
              Drop-in rules for your own Lovable account. Import once, then every new project you build gets the
              pinned Docker tags, deploy-script gotchas, and Midnight architecture guardrails baked in.
            </p>
          </div>
          <Card className="p-6 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg">lovable-midnight</h3>
              <span className="text-xs text-muted-foreground">~16 KB · SKILL.md</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Non-negotiables for shipping a Midnight dApp on Lovable: versions mirror the{" "}
              <a href={SUPPORT_MATRIX_URL} className="text-primary hover:underline" target="_blank" rel="noreferrer">Midnight Support Matrix</a>{" "}
              (currently <code>proof-server:{MIDNIGHT_MATRIX.proofServer}</code> /{" "}
              <code>midnight-node:{MIDNIGHT_MATRIX.node.preview}</code> /{" "}
              <code>indexer-standalone:{MIDNIGHT_MATRIX.indexer}</code>; local Undeployed stack stays on{" "}
              <code>proof-server:{MIDNIGHT_MATRIX.localStack.proofServer}</code> /{" "}
              <code>midnight-node:{MIDNIGHT_MATRIX.localStack.node}</code> /{" "}
              <code>indexer-standalone:{MIDNIGHT_MATRIX.localStack.indexer}</code>). Includes the nine-rule
              deploy-script checklist, network-id mapping, and the failure modes ranked by frequency.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href="/skills/lovable-midnight/SKILL.md" download="lovable-midnight.SKILL.md">
                  <Download className="h-4 w-4 mr-2" /> Download SKILL.md
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy("/skills/lovable-midnight/SKILL.md")}>
                <Copy className="h-4 w-4 mr-2" /> Copy URL
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="https://midskills.sevryn.xyz/" target="_blank" rel="noreferrer">
                  Midskills gallery <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              In your Lovable project → Settings → Skills → <em>New skill</em> → paste the contents of SKILL.md.
              The skill activates on any turn that touches Midnight / Compact / Lace.
            </p>
          </Card>
        </section>


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
              {FILE_COUNT} slimmer files, one per (network, host-OS) combination — including Undeployed (Local),
              Undeployed on Fly.io, and the experimental Android/mobile scaffold. Smaller context, same{" "}
              {meta.ideaCount.toLocaleString()} ideas.
            </p>
          </div>

          <div className="space-y-4">
            <Tabs value={network} onValueChange={setNetwork}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Network</div>
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full h-auto gap-1">
                <TabsTrigger value="preview" className="text-xs sm:text-sm whitespace-normal">Preview</TabsTrigger>
                <TabsTrigger value="preprod" className="text-xs sm:text-sm whitespace-normal">Preproduction</TabsTrigger>
                <TabsTrigger value="undeployed" className="text-xs sm:text-sm whitespace-normal">Undeployed (Local)</TabsTrigger>
                <TabsTrigger value="undeployed-fly" className="text-xs sm:text-sm whitespace-normal">Undeployed (Fly.io)</TabsTrigger>
                <TabsTrigger value="undeployed-mobile" className="text-xs sm:text-sm whitespace-normal">Undeployed (Mobile)</TabsTrigger>
              </TabsList>
              {Object.keys(PROMPTS).map((n) => (
                <TabsContent key={n} value={n} />
              ))}
            </Tabs>

            {isMobile ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 space-y-1">
                <p className="text-sm font-semibold text-amber-500">Experimental · Android only</p>
                <p className="text-xs text-muted-foreground">
                  One host-OS-independent file: native Kotlin + Jetpack Compose scaffolds built on the{" "}
                  <a
                    href="https://kuiralabs.github.io/kuira-sdk-android/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Kuira Android SDK
                  </a>{" "}
                  (credit: Kuira Labs). Lovable doesn't build native mobile apps, so treat these as a starting
                  point — they can break.
                </p>
              </div>
            ) : (
              <Tabs value={os} onValueChange={setOs}>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Host OS</div>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="macos">macOS</TabsTrigger>
                  <TabsTrigger value="windows">Windows</TabsTrigger>
                  <TabsTrigger value="linux">Linux</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <Card className="p-6 space-y-3 min-w-0 overflow-hidden">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-display text-lg break-words">
                  {NET_LABEL[network]} · {OS_LABEL[activeOs]}
                </h3>
                <span className="text-xs text-muted-foreground">{humanSize(selected.size)}</span>
              </div>
              <p className="text-sm text-muted-foreground break-words">
                All {meta.ideaCount.toLocaleString()} ideas as mega-prompts tuned for{" "}
                <strong>{NET_LABEL[network]}</strong>
                {isMobile ? " (Android)" : <> on <strong>{OS_LABEL[activeOs]}</strong></>}.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a
                    href={selected.url}
                    download={isMobile ? "llms-prompts-undeployed-mobile.txt" : `llms-prompts-${network}-${activeOs}.txt`}
                  >
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
