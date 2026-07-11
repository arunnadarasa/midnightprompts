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
  { img: net02, tag: "02 · pick testnet", title: "Testnet → Preprod / Preview", caption: "Select Testnet. Cardano offers Preprod or Preview — pick the one that matches the Midnight network you want." },
  { img: net03, tag: "03 · small-screen bug", title: "Modal can truncate", caption: "Heads up: on a small laptop screen the Network modal cuts off before the Midnight section. If you only see Cardano and Bitcoin, resize the window." },
  { img: net04, tag: "04 · midnight options", title: "Full modal — 3 Midnight options", caption: "On a larger viewport the modal scrolls to reveal Midnight has 3 options: Undeployed, Preview, Preprod. Pick one and Confirm." },
  { img: net05, tag: "05 · top-bar switch", title: "Quick switch from the top bar", caption: "Once configured, the Network pill in the top-right lets you flip between Preview and Preprod without reopening Settings." },
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
          Two faucets, one per network. Paste the unshielded address you just copied, solve the
          Cloudflare check, and click <em>Request tokens</em>. You can pick the network from the
          switcher at the top-right of the faucet page too.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
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
          Point Lace at <span className="italic text-primary">Preview or Preprod.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-2xl">
          Make sure Lace is on the same Midnight network as the faucet you used. Open Settings from
          the cogwheel on the bottom bar, choose Network, and confirm.
        </p>

        <div className="mt-4 p-4 border border-primary/40 bg-card text-[12px] text-foreground/90 leading-relaxed">
          <strong className="text-primary">Heads up — Lace UI bug:</strong> on small laptop
          screens the Network modal can truncate and hide the Midnight options. If you only see
          Cardano and Bitcoin, resize the window to make the modal tall enough to reveal the three
          Midnight choices (Undeployed, Preview, Preprod).
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
                <div className="text-xs text-muted-foreground font-light mt-1">mn_addr_test1…</div>
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
                <div className="font-display text-foreground">Preprod Explorer</div>
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
