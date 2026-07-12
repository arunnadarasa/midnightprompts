import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/showcase/programmatic-dust")({
  head: () => ({
    meta: [
      { title: "Programmatic DUST — Showcase" },
      { name: "description", content: "Run the Midnight docs' end-to-end DUST tutorial locally: create a wallet, print addresses, fund it with tNIGHT, and register NIGHT UTXOs for DUST generation." },
      { property: "og:title", content: "Programmatic DUST — Showcase" },
      { property: "og:description", content: "Run the Midnight docs' end-to-end DUST tutorial locally with Bun and the wallet SDK." },
    ],
  }),
  component: ProgrammaticDustDemo,
});

const DOCS_URL = "https://docs.midnight.network/guides/generating-dust-programmatically";
const FAUCET_URL = "https://midnight-tmnight-preprod.nethermind.dev/";

function ProgrammaticDustDemo() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Demo · Preprod only · Wallet SDK</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Programmatic <span className="italic text-primary">DUST</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        A local, terminal-first walkthrough of the Midnight Foundation tutorial. It creates a
        wallet, prints the shielded / unshielded / dust addresses, waits for tNIGHT from the faucet,
        then explicitly registers NIGHT UTXOs for DUST generation — the same step Lace performs when
        you click <em>Generate tDUST</em>, but exposed through the wallet SDK.
      </p>

      <div className="mt-8 p-5 border border-primary/30 bg-card">
        <div className="eyebrow text-primary">run it</div>
        <pre className="font-mono mt-3 text-sm break-all whitespace-pre-wrap text-foreground">
          bun scripts/dust-demo-preprod.mjs
        </pre>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The script writes its scratch wallet to{" "}
          <code>.midnight-wallet-preprod-demo.local</code> (0600, gitignored) and polls the wallet
          state until spendable DUST coins appear.
        </p>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
        <div className="p-5 border border-border bg-card">
          <div className="eyebrow text-primary">what it does</div>
          <ol className="mt-3 space-y-2 text-muted-foreground list-decimal pl-4 leading-relaxed">
            <li>Creates or restores a hex wallet seed.</li>
            <li>Derives shielded, unshielded, and DUST addresses.</li>
            <li>Prompts you to fund the unshielded address with the preprod tNIGHT faucet.</li>
            <li>Registers NIGHT UTXOs for DUST generation to a target DUST address.</li>
            <li>Polls until <code>state.dust.availableCoins.length &gt;= 1</code> — the true spendable signal.</li>
          </ol>
        </div>

        <div className="p-5 border border-border bg-card">
          <div className="eyebrow text-primary">prerequisites</div>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-4 leading-relaxed">
            <li><a href="https://bun.sh/" target="_blank" rel="noreferrer" className="text-primary underline">Bun</a> runtime.</li>
            <li>A local Midnight proof server on port 6300.</li>
            <li>Preprod tNIGHT from the faucet to the unshielded address.</li>
            <li>Patience — DUST generation can take 1–20 minutes.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-5 border border-border bg-card">
        <div className="eyebrow text-primary">why this exists</div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The deploy script for the Midnight Ledger demo assumes tDUST is already available. That
          usually happens inside Lace, but the docs also show how to do it entirely in code. This
          script mirrors that guide so you can automate the full flow from wallet creation to
          spendable DUST without leaving the terminal.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="text-primary underline">Midnight docs ↗</a>
          <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="text-primary underline">Preprod tNIGHT faucet ↗</a>
          <a href="/proof-server" className="text-primary underline">Proof-server setup ↗</a>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Preprod-specific gotchas (fresh-wallet sync stalls, <code>DustSpendProcessed</code> decode errors,
          DUST-regeneration concurrency caps):{" "}
          <Link to="/known-issues" className="text-primary underline">see known issues →</Link>
        </p>
      </div>

    </div>
  );
}
