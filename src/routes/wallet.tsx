import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import step01 from "@/assets/lace-setup-01-account-center.png.asset.json";
import step02 from "@/assets/lace-setup-02-add-wallet.png.asset.json";
import step03 from "@/assets/lace-setup-03-choose-midnight.png.asset.json";
import step04 from "@/assets/lace-setup-04-password.png.asset.json";
import step05 from "@/assets/lace-setup-05-all-done.png.asset.json";
import step06 from "@/assets/lace-setup-06-wallet-view.png.asset.json";
import step07 from "@/assets/lace-setup-07-wallet-tab.png.asset.json";
import step08 from "@/assets/lace-setup-08-center-menu.png.asset.json";
import step09 from "@/assets/lace-setup-09-receive-shielded.png.asset.json";
import step10 from "@/assets/lace-setup-10-receive-unshielded.png.asset.json";

import step11 from "@/assets/lace-setup-11-address-copied.png.asset.json";
import faucet01 from "@/assets/lace-faucet-01-request.png.asset.json";
import faucet02 from "@/assets/lace-faucet-02-processing.png.asset.json";
import net01 from "@/assets/lace-net-01-settings.png.asset.json";
import net02 from "@/assets/lace-net-02-network-modal.png.asset.json";
import net03 from "@/assets/lace-net-03-truncated.png.asset.json";
import net04 from "@/assets/lace-net-04-full-midnight.png.asset.json";
import net05 from "@/assets/lace-net-05-topbar.png.asset.json";
import expanded01 from "@/assets/lace-expanded-01-wallet.png.asset.json";
import expanded02 from "@/assets/lace-expanded-02-settings.png.asset.json";
import expanded03 from "@/assets/lace-expanded-03-view-mode.png.asset.json";
import tdust01 from "@/assets/lace-tdust-01-empty.png.asset.json";
import tdust02 from "@/assets/lace-tdust-02-generate.png.asset.json";
import tdust03 from "@/assets/lace-tdust-03-review.png.asset.json";
import tdust04 from "@/assets/lace-tdust-04-password.png.asset.json";
import tdust05 from "@/assets/lace-tdust-05-processing.png.asset.json";
import tdust06 from "@/assets/lace-tdust-06-refilling.png.asset.json";
import midnightSettings from "@/assets/lace-midnight-settings.png.asset.json";

const TDUST_STEPS = [
  { img: tdust01, tag: "01 · tank empty", title: "Tap the D icon next to Receive", caption: "With tNIGHT in the wallet but 0 / 0 tDUST, click the small D icon to the right of Receive to open Generate tDUST." },
  { img: tdust02, tag: "02 · generate tdust", title: "Send #1 — designate wallet", caption: "The Generate tDUST sheet shows your Dust Address and full tNIGHT balance. Click Send to designate it for tDUST generation." },
  { img: tdust03, tag: "03 · review", title: "Send #2 — review & confirm", caption: "Review Transaction confirms you're designating 1,000 tNIGHT. Click Send again to submit." },
  { img: tdust04, tag: "04 · password", title: "Enter your admin password", caption: "Confirm the transaction with your Lace admin password, then Confirm." },
  { img: tdust05, tag: "05 · processing", title: "Generating the ZK proof", caption: "Processing transaction, generating zero-knowledge proof. Give it a minute — tDUST starts flowing once designation completes." },
  { img: tdust06, tag: "06 · refilling", title: "tDUST tank refilling", caption: "Back on the wallet home the badge flips to Refilling (154h7min) and your tDUST balance climbs — e.g. 420 / 5,000 tDUST. You're ready to deploy." },
];

const EXPANDED_STEPS = [
  { img: expanded02, tag: "01 · settings", title: "Cogwheel → Default View Mode", caption: "Open Settings from the cogwheel and scroll to Default View Mode at the bottom of the list." },
  { img: expanded03, tag: "02 · pick expanded", title: "Choose Expanded → Confirm", caption: "Switch from Side panel (recommended) to Expanded, then Confirm. Lace now opens in a full browser tab." },
  { img: expanded01, tag: "03 · full canvas", title: "No more truncation", caption: "In Expanded mode the Network modal (and every other panel) has room to render — all three Midnight options stay visible." },
];

const SETUP_STEPS = [
  { img: step01, tag: "01 · account center", title: "Open Lace → Add wallet", caption: "Launch the Lace extension and click the purple Add wallet button at the top of the Account Center." },
  { img: step02, tag: "02 · add wallet", title: "Create a new Lace wallet", caption: "Choose Create a new Lace wallet. Import existing or Hardware Wallet stay for later." },
  { img: step03, tag: "03 · choose midnight", title: "Name it and enable Midnight", caption: "Give the wallet a name, toggle Midnight on (Cardano and Bitcoin optional), then Create Wallet." },
  { img: step04, tag: "04 · password", title: "Enter your admin password", caption: "Confirm with your Lace admin password to authorise wallet creation." },
  { img: step05, tag: "05 · all done", title: "Wallet created", caption: "You'll see All done! — click View Wallet to jump straight in." },
  { img: step06, tag: "06 · wallet view", title: "Midnight account", caption: "The new Midnight #N account loads. The 0 / 0 tDUST · tDUST Tank Empty badge is expected — that's what the faucet fixes." },
  { img: step07, tag: "07 · wallet tab", title: "Wallet tab selected", caption: "The wallet icon on the far left of the bottom bar is your current view — nothing to click yet, just orientation." },
  { img: step08, tag: "08 · center menu", title: "Tap the center circle", caption: "Click the large circle icon in the middle of the bottom bar to open the Lace quick menu (Receive, Accounts, Contacts, Support)." },
  { img: step09, tag: "09 · receive · shielded", title: "Click Receive", caption: "Choose Receive. The default tab is Shielded (mn_shield-addr_…) — useful for private transfers." },
  { img: step10, tag: "10 · receive · unshielded", title: "Switch to Unshielded → copy", caption: "Switch to Unshielded, scroll down and copy the mn_addr_… address. Paste it into the faucet, then use the D icon next to Receive to convert tNIGHT → tDUST." },
  { img: step11, tag: "11 · address copied", title: "Address on the clipboard", caption: "Lace confirms Address copied to clipboard. You now have the mn_addr_preview… / preprod… string ready for the faucet." },
];

const FAUCET_STEPS = [
  { img: faucet01, tag: "01 · paste address", title: "Open the matching faucet", caption: "Go to the preview or preprod faucet, paste your unshielded address, solve the Cloudflare check, then click Request tokens." },
  { img: faucet02, tag: "02 · processing", title: "Transaction submitted", caption: "The button flips to Processing request… and Your transaction is being submitted. tNIGHT usually lands within a block or two." },
];

const NETWORK_STEPS = [
  { img: net01, tag: "01 · settings", title: "Open Settings → Network", caption: "Back in Lace, tap the cogwheel on the bottom bar to open Settings, then choose Network." },
  { img: net02, tag: "02 · pick testnet", title: "Testnet → Preprod / Preview / Custom", caption: "Select Testnet. Cardano offers Preprod or Preview — pick the one that matches the Midnight network you want. For a local Undeployed stack, choose Custom and enter ws://localhost:9944." },
  { img: net03, tag: "03 · small-screen bug", title: "Modal can truncate", caption: "Heads up: on a small laptop screen the Network modal cuts off before the Midnight section. If you only see Cardano and Bitcoin, resize the window." },
  { img: net04, tag: "04 · midnight options", title: "Full modal — 3 Midnight options", caption: "On a larger viewport the modal scrolls to reveal Midnight has 3 options: Undeployed, Preview, Preprod. Pick the one that matches the network you are building on. For local development, choose Undeployed." },
  { img: net05, tag: "05 · top-bar switch", title: "Quick switch from the top bar", caption: "Once configured, the Network pill in the top-right lets you flip between Preview and Preprod without reopening Settings. The Custom/Undeployed entry will also be available if you added it." },
];




export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet · Creative Midnight" },
      { name: "description", content: "Lace — the browser extension wallet for Midnight. DApp connection, hardware wallet support, selective privacy, and the Glacier Drop." },
      { property: "og:title", content: "Wallet · Creative Midnight" },
      { property: "og:description", content: "Lace — the browser extension wallet for Midnight. DApp connection, hardware wallet support, selective privacy, and the Glacier Drop." },
    ],
  }),
  component: Wallet,
});

function Wallet() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="eyebrow">tools · midnight</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">Lace — the Midnight wallet.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed font-light max-w-2xl">
          Lace is the official browser extension wallet for Midnight. It connects to DApps, holds
          your shielded and public addresses, and signs transactions without ever exposing your
          private witness data. Built by the same team behind the Midnight network.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">01</span>
            <h3 className="font-display text-xl text-foreground">Browser Extension</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Install in Chrome, Brave, or Edge. One click to connect any Midnight DApp. No
              desktop binary required.
            </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">02</span>
            <h3 className="font-display text-xl text-foreground">Hardware Wallet Support</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Pair with Ledger for cold-storage signing. Keys stay on the device; only proofs
              cross the wire.
            </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">03</span>
            <h3 className="font-display text-xl text-foreground">Selective Privacy</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Choose what to reveal. Every transaction can be fully shielded, fully transparent,
              or somewhere in between — you control the dial.
            </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-3">
            <span className="eyebrow text-primary">04</span>
            <h3 className="font-display text-xl text-foreground">DApp Connection</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Standard injection pattern. Any Lovable build that targets Midnight can request
              accounts, sign proofs, and submit transactions through Lace.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-6">
        <div className="p-6 border border-primary/30 bg-card">
          <div className="eyebrow text-primary">glacier drop</div>
          <h2 className="font-display text-2xl text-foreground italic mt-1">NIGHT Token Community Allocation</h2>
          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
            The Glacier Drop is Midnight's community allocation programme for the NIGHT token.
            Eligible participants — including early testnet contributors, hackathon builders, and
            ecosystem partners — may qualify for a distribution. Lace is the wallet you will use
            to receive and manage the allocation when the programme goes live.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.lace.io/midnight"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500"
            >
              Get Lace ↗
            </a>
            <a
              href="https://docs.midnight.network/"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 transition-colors duration-500"
            >
              Midnight Docs ↗
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <span className="eyebrow">setup walkthrough · lace v2</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
          Create your Midnight wallet <span className="italic text-primary">in ten taps.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          Screens below are from the current Lace release with Midnight support enabled. Steps 09–10
          show where to grab the address the faucet needs, and how to switch on tDUST.
        </p>

        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SETUP_STEPS.map((s) => (
            <li key={s.tag} className="border border-border bg-card flex flex-col">
              <img
                src={s.img.url}
                alt={s.title}
                loading="lazy"
                className="w-full h-auto block border-b border-border bg-background"
              />
              <div className="p-4 flex flex-col gap-1">
                <span className="eyebrow text-primary">{s.tag}</span>
                <span className="font-display text-foreground text-base">{s.title}</span>
                <span className="text-[12px] text-muted-foreground font-light leading-relaxed mt-1">
                  {s.caption}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-[11px] text-muted-foreground font-light">
          Screenshots captured from the Lace browser extension. Wallet UX and additional context:{" "}
          <a
            href="https://docs.midnight.network/guides/acquire-tokens"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Midnight Docs — Acquire tokens ↗
          </a>
          .
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <span className="eyebrow">faucet · request tnight</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
          Fund the wallet <span className="italic text-primary">from the faucet.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          Two public faucets for the testnets, and one local funding path for the Undeployed network.
          Paste the unshielded address you just copied, solve the Cloudflare check, and click{" "}
          <em>Request tokens</em>. For a local Undeployed stack, skip the public faucet and use the
          local funding tool instead.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
          <a
            href="https://midnight-tmnight-preview.nethermind.dev/"
            target="_blank"
            rel="noreferrer"
            className="p-4 border border-border hover:border-primary/50 transition-colors duration-500 group flex flex-col gap-1"
          >
            <span className="eyebrow text-primary">preview faucet ↗</span>
            <span className="font-mono text-muted-foreground break-all">midnight-tmnight-preview.nethermind.dev</span>
          </a>
          <a
            href="https://midnight-tmnight-preprod.nethermind.dev/"
            target="_blank"
            rel="noreferrer"
            className="p-4 border border-border hover:border-primary/50 transition-colors duration-500 group flex flex-col gap-1"
          >
            <span className="eyebrow text-primary">preprod faucet ↗</span>
            <span className="font-mono text-muted-foreground break-all">midnight-tmnight-preprod.nethermind.dev</span>
          </a>
          <div className="p-4 border border-primary/40 bg-card flex flex-col gap-2">
            <span className="eyebrow text-primary">undeployed / local</span>
            <span className="font-display text-foreground text-sm">No public faucet needed</span>
            <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
              The local node mints unlimited tDUST to the genesis wallet. To fund your own Lace wallet, use the local Midnight network tool:
            </p>
            <ul className="list-disc pl-4 text-[11px] text-muted-foreground font-light leading-relaxed space-y-1">
              <li>Fund from a config file (mnemonics) via the <code className="font-mono text-foreground">npm start</code> interactive menu.</li>
              <li>Fund by public key (unshielded Bech32 addresses) — 50,000 tNIGHT per address, then register for DUST in Lace.</li>
            </ul>
            <div className="flex flex-wrap gap-3 mt-1">
              <Link to="/undeployed" className="text-[10px] uppercase tracking-[0.2em] text-primary hover:underline">
                Local quick start →
              </Link>
              <a
                href="https://docs.midnight.network/guides/midnight-local-network"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] uppercase tracking-[0.2em] text-primary hover:underline"
              >
                Midnight docs ↗
              </a>
            </div>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FAUCET_STEPS.map((s) => (
            <li key={s.tag} className="border border-border bg-card flex flex-col">
              <img
                src={s.img.url}
                alt={s.title}
                loading="lazy"
                className="w-full h-auto block border-b border-border bg-background"
              />
              <div className="p-4 flex flex-col gap-1">
                <span className="eyebrow text-primary">{s.tag}</span>
                <span className="font-display text-foreground text-base">{s.title}</span>
                <span className="text-[12px] text-muted-foreground font-light leading-relaxed mt-1">
                  {s.caption}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <span className="eyebrow">lace · switch network</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
          Point Lace at <span className="italic text-primary">Preview, Preprod, or Undeployed.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          Make sure Lace is on the same Midnight network as the faucet or local stack you used. Open
          Settings from the cogwheel on the bottom bar, choose Network, and confirm. If you are
          running the DApp locally on{" "}
          <code className="font-mono text-foreground">localhost</code>, select the Undeployed
          network and point the RPC at{" "}
          <code className="font-mono text-foreground">ws://localhost:9944</code>.
        </p>

        <div className="mt-4 p-4 border border-primary/40 bg-card text-[12px] text-foreground/90 leading-relaxed">
          <strong className="text-primary">Local DApp checklist:</strong>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Lace → Settings → Network → Custom → RPC{" "}
              <code className="font-mono text-foreground">ws://localhost:9944</code>.
            </li>
            <li>
              Start the local stack: <code className="font-mono text-foreground">bun scripts/midnight-standalone.mjs up</code>.
            </li>
            <li>
              Run the{" "}
              <Link to="/undeployed-preflight" className="text-primary underline">
                preflight checks
              </Link>{" "}
              to confirm all four endpoints are green.
            </li>
            <li>
              Need funds? Use the local{" "}
              <a
                href="https://docs.midnight.network/guides/midnight-local-network"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Midnight local network
              </a>{" "}
              tool to fund your Lace wallet.
            </li>
          </ul>
        </div>

        <div className="mt-4 p-4 border border-primary/40 bg-card text-[12px] text-foreground/90 leading-relaxed">
          <strong className="text-primary">Heads up — Lace UI bug:</strong> on small laptop
          screens the Network modal can truncate and hide the Midnight options. If you only see
          Cardano and Bitcoin, resize the window — or, better, switch Lace to{" "}
          <strong className="text-foreground">Expanded</strong> view mode so it opens in a full
          browser tab with room for the whole modal.
        </div>

        <div className="mt-6">
          <span className="eyebrow">fix · expanded view mode</span>
          <h3 className="font-display text-xl sm:text-2xl mt-2 text-foreground">
            Partial fix: <span className="italic text-primary">run Lace expanded.</span>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
            Cogwheel → <em>Default View Mode</em> → <em>Expanded</em> → Confirm. Lace opens in a
            full browser tab from now on, which fixes most clipped panels.
          </p>
          <ol className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {EXPANDED_STEPS.map((s) => (
              <li key={s.tag} className="border border-border bg-card flex flex-col">
                <img
                  src={s.img.url}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-auto block border-b border-border bg-background"
                />
                <div className="p-4 flex flex-col gap-1">
                  <span className="eyebrow text-primary">{s.tag}</span>
                  <span className="font-display text-foreground text-base">{s.title}</span>
                  <span className="text-[12px] text-muted-foreground font-light leading-relaxed mt-1">
                    {s.caption}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 p-4 border border-primary/40 bg-card text-[12px] text-foreground/90 leading-relaxed">
            <strong className="text-primary">Still truncated in Expanded?</strong> The Network
            modal's scroll region can still hide the Midnight options (Undeployed / Preview /
            Preprod) below the fold, even in a full browser tab. Workaround: click into the modal,
            then press <kbd className="px-1.5 py-0.5 border border-border bg-background font-mono text-[10px]">Tab</kbd>{" "}
            repeatedly to walk the focus through the hidden radio options — press{" "}
            <kbd className="px-1.5 py-0.5 border border-border bg-background font-mono text-[10px]">Space</kbd>{" "}
            to select, then click <em>Confirm</em>.
          </div>
        </div>



        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NETWORK_STEPS.map((s) => (
            <li key={s.tag} className="border border-border bg-card flex flex-col">
              <img
                src={s.img.url}
                alt={s.title}
                loading="lazy"
                className="w-full h-auto block border-b border-border bg-background"
              />
              <div className="p-4 flex flex-col gap-1">
                <span className="eyebrow text-primary">{s.tag}</span>
                <span className="font-display text-foreground text-base">{s.title}</span>
                <span className="text-[12px] text-muted-foreground font-light leading-relaxed mt-1">
                  {s.caption}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <span className="eyebrow">lace · midnight settings</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
          Point Lace at your <span className="italic text-primary">proof server.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          Settings → <em>Midnight</em> opens the Midnight-specific config. Two things live here:{" "}
          <strong className="text-foreground">Proof Server</strong> (where ZK proofs are generated)
          and <strong className="text-foreground">Node address</strong> (the RPC Lace queries).
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-6 items-start">
          <img
            src={midnightSettings.url}
            alt="Lace Midnight Settings — Proof Server (Remote/Local) and Node address"
            loading="lazy"
            className="w-full h-auto block border border-border bg-background"
          />
          <div className="flex flex-col gap-4 text-[12px] leading-relaxed">
            <div className="p-4 border border-border bg-card">
              <div className="eyebrow text-primary">proof server · remote</div>
              <p className="mt-2 text-foreground/90">
                Default. Uses{" "}
                <code className="font-mono">https://proof-server.&lt;network&gt;.midnight.network</code>.
                Fastest for casual signing — a trusted remote generates the proof for you. Fine for
                most DApp interactions.
              </p>
            </div>
            <div className="p-4 border border-primary/40 bg-card">
              <div className="eyebrow text-primary">proof server · local</div>
              <p className="mt-2 text-foreground/90">
                <code className="font-mono">http://localhost:6300</code> — this is the Docker
                proof server you run for the deploy script. Most private (proofs never leave your
                machine) and required if you want Lace signing to hit the same prover the script
                uses. Start it with:
              </p>
              <pre className="mt-2 p-3 border border-border bg-background font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap break-all">
{`docker run -d -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`}
              </pre>
            </div>
            <div className="p-4 border border-border bg-card">
              <div className="eyebrow text-primary">node address</div>
              <p className="mt-2 text-foreground/90">
                Leave as{" "}
                <code className="font-mono">https://rpc.&lt;network&gt;.midnight.network</code>{" "}
                unless you're running your own Midnight node. This is the RPC Lace uses to read
                state and submit txs.
              </p>
              <p className="mt-2 text-foreground/90">
                For a local Undeployed stack, point this to{" "}
                <code className="font-mono">ws://localhost:9944</code> — the WebSocket RPC of the
                local Midnight node. Lace treats it as a Custom network, and it must be green in the{" "}
                <Link to="/undeployed-preflight" className="text-primary underline">
                  preflight checks
                </Link>{" "}
                before it will connect.
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground font-light">
              Click <strong className="text-foreground">Save configuration</strong> after any
              change — Lace re-syncs against the new endpoints immediately.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <span className="eyebrow">generate tdust · tnight → tdust</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
          Turn tNIGHT into <span className="italic text-primary">tDUST.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          The faucet only drips tNIGHT. Deploys and shielded txs spend tDUST — so you have to
          designate your tNIGHT once. In your wallet, click the D icon next to Receive, click Send
          twice, and enter your admin password.
        </p>

        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TDUST_STEPS.map((s) => (
            <li key={s.tag} className="border border-border bg-card flex flex-col">
              <img
                src={s.img.url}
                alt={s.title}
                loading="lazy"
                className="w-full h-auto block border-b border-border bg-background"
              />
              <div className="p-4 flex flex-col gap-1">
                <span className="eyebrow text-primary">{s.tag}</span>
                <span className="font-display text-foreground text-base">{s.title}</span>
                <span className="text-[12px] text-muted-foreground font-light leading-relaxed mt-1">
                  {s.caption}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <span className="eyebrow">deploy · script wallet ≠ lace wallet</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-foreground">
          Reuse your Lace seed <span className="italic text-primary">in the deploy script.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          <code className="font-mono text-foreground">scripts/deploy-midnight.mjs</code> generates
          its own 24-word BIP-39 mnemonic on first run and stores it at{" "}
          <code className="font-mono text-foreground">.midnight-wallet.local</code>. That wallet is{" "}
          <em>not</em> your Lace Mac Local wallet — so tDUST you generated in Lace is invisible to
          the script and the deploy exits with <em>Not enough tDUST</em>.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 border border-border bg-card flex flex-col gap-2">
            <span className="eyebrow text-primary">option A · fund the script wallet</span>
            <span className="font-display text-foreground text-base">Import script seed into Lace</span>
            <p className="text-[12px] text-muted-foreground font-light leading-relaxed">
              Open <code className="font-mono text-foreground">.midnight-wallet.local</code>, copy
              the 24 words, and import them as a new wallet in Lace. Faucet tNIGHT to that wallet's
              unshielded address, generate tDUST, then re-run the script.
            </p>
          </div>
          <div className="p-5 border border-primary/40 bg-card flex flex-col gap-2">
            <span className="eyebrow text-primary">option B · reuse an existing lace wallet</span>
            <span className="font-display text-foreground text-base">Paste Lace seed into the script file</span>
            <p className="text-[12px] text-muted-foreground font-light leading-relaxed">
              In Lace: Settings → Show Recovery Phrase for <em>Mac Local</em> (enter admin
              password). Copy the 24 words as one line, then on your machine:
            </p>
            <pre className="mt-1 p-3 border border-border bg-background font-mono text-[11px] text-foreground overflow-x-auto">
{`echo "word1 word2 ... word24" > .midnight-wallet.local
chmod 600 .midnight-wallet.local
bun scripts/deploy-midnight.mjs`}
            </pre>
          </div>
        </div>

        <div className="mt-4 p-4 border border-primary/40 bg-card text-[12px] text-foreground/90 leading-relaxed">
          <strong className="text-primary">Treat the recovery phrase like a password.</strong>{" "}
          <code className="font-mono">.midnight-wallet.local</code> is already gitignored and
          created with <code className="font-mono">0600</code> permissions — don't commit it, don't
          share it, don't paste it into chat.
        </div>

        <div className="mt-4 p-4 border border-border bg-card text-[12px] text-foreground/90 leading-relaxed">
          <strong className="text-primary">Same seed, same addresses.</strong> The deploy script
          now uses the same HD derivation as Lace (
          <code className="font-mono">WalletSeeds.fromMnemonic</code> from{" "}
          <code className="font-mono">@midnight-ntwrk/testkit-js</code>), so Option B produces the
          exact addresses Lace shows. Verify before deploying:
          <pre className="mt-2 p-3 border border-border bg-background font-mono text-[11px] text-foreground overflow-x-auto">
{`MIDNIGHT_WALLET_SEED="$(cat .midnight-wallet.local)" \\
  bun scripts/derive-unshielded-address.mjs --network=preprod`}
          </pre>
          The printed shielded + unshielded addresses must match the ones in Lace. If they don't,
          you pasted the wrong seed.
        </div>

      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20">


        <div className="p-6 border border-border bg-card">
          <div className="eyebrow text-primary">testnet</div>
          <h2 className="font-display text-2xl text-foreground italic mt-1">Faucets &amp; Addresses</h2>
          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
            Once Lace is installed, switch to the network you are building on and copy your address
            to request test tokens. Preprod is the default for hackathon demos; Preview is for
            bleeding-edge SDK features.
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://midnight-tmnight-preprod.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preprod Faucet</div>
                <div className="text-xs text-muted-foreground font-light mt-1">mn_addr_preprod1…</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
            <a
              href="https://midnight-tmnight-preview.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preview Faucet</div>
                <div className="text-xs text-muted-foreground font-light mt-1">mn_addr_preview1…</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://preview.midnightexplorer.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preview Explorer</div>
                <div className="text-xs text-muted-foreground font-light mt-1">preview.midnightexplorer.com</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
            <a
              href="https://preview.midnightexplorer.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors duration-500 group"
            >
              <div>
                <div className="font-display text-foreground">Preview Explorer</div>
                <div className="text-xs text-muted-foreground font-light mt-1">preview.midnightexplorer.com</div>
              </div>
              <span className="text-primary text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
          <div className="mt-4 text-xs text-muted-foreground font-light">
            Read more about the differences between networks in the{" "}
            <Link to="/quantum-primer" hash="networks" className="text-primary underline">Quantum Primer →</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
