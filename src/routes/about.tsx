import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Creative Midnight" },
      { name: "description", content: "About the Creative Midnight hackathon idea repo — 1,000 Lovable mega-prompts on the Midnight ZK blockchain." },
      { property: "og:title", content: "About · Creative Midnight" },
      { property: "og:description", content: "Why this repo exists and how to use it at the hackathon." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <article className="max-w-2xl mx-auto px-5 pt-16 pb-20 prose prose-invert">
        <span className="eyebrow">about</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-6 text-foreground">A starter pack for the Creative AI &amp; Quantum Hackathon.</h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-light">
          Hackathons live or die on the first hour. This repo gives participants a 1,000-idea
          launchpad so you skip the blank page and start shipping ZK-native demos in one Lovable build.
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">What's inside</h2>
        <ul className="space-y-2 text-muted-foreground font-light">
          <li>· <strong className="text-foreground">10 creative disciplines</strong> — dance, music, visual art, video, photo, writing, film/animation, games, theater, fashion.</li>
          <li>· <strong className="text-foreground">100 ideas per discipline</strong> — each combining a sub-discipline with one of four Midnight primitives.</li>
          <li>· <strong className="text-foreground">A Lovable mega-prompt</strong> per idea — paste, build, ship.</li>
          <li>· <strong className="text-foreground">A Midnight primitive</strong> — Compact contract deploy, private witness, Lace wallet + tDUST, or IPFS content commit.</li>
          <li>· <strong className="text-foreground">TAM / SAM / SOM</strong> — indicative market sizing for your pitch slide.</li>
        </ul>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">How to use it</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal pl-5 font-light">
          <li>Pick a discipline that matches your team's strengths.</li>
          <li>Skim the 100 ideas; click into 2–3 that grab you.</li>
          <li>Install <a href="https://www.lace.io/" target="_blank" rel="noreferrer" className="text-foreground underline decoration-primary">Lace wallet</a> and set the network to Midnight preview.</li>
          <li>Get tDUST from the <a href="https://midnight-tmnight-preview.nethermind.dev/" target="_blank" rel="noreferrer" className="text-foreground underline decoration-primary">Midnight preview faucet</a>.</li>
          <li>Add the five <code>VITE_*</code> secrets in your Lovable project (Settings → Secrets).</li>
          <li>Run the Compact toolchain locally (<code>compact update</code>, <code>compact compile</code>) and start the proof-server Docker container on port 6300.</li>
          <li>Copy the mega-prompt into Lovable. It scaffolds the app, wires Lace + proof server + Indexer, and ships a Compact contract with the hackathon credit baked in.</li>
        </ol>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">Credits</h2>
        <p className="text-muted-foreground font-light">
          Built during the <strong className="text-foreground">Creative AI &amp; Quantum Hackathon</strong> organised by{" "}
          <strong className="text-foreground">StreetKode Fam</strong> during <strong className="text-foreground">Indian Krump Festival 14</strong>.
          Every Compact contract deployed from these prompts carries the same credit as a header comment, so the
          provenance lives alongside the ZK verifying key.{" "}
          <Link to="/strategy" className="text-foreground underline decoration-primary">Read the build strategy →</Link>
        </p>
      </article>
    </SiteShell>
  );
}
