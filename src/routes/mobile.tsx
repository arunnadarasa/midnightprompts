import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/mobile")({
  head: () => ({
    meta: [
      { title: "Mobile Dev · Ship Midnight dApps as native Android apps" },
      {
        name: "description",
        content:
          "The Kuira Android SDK ships passkey-derived identity, an embedded wallet, and the Compact contract runtime as one Gradle dependency — no Lace, no browser extension. Opens Midnight ZK dApps to ~3B Android users.",
      },
      { property: "og:title", content: "Mobile Dev · Midnight on Android with Kuira SDK" },
      {
        property: "og:description",
        content:
          "Passkey identity, embedded wallet, contract runtime — one Gradle dep. The hackathon opportunity for native mobile Midnight dApps.",
      },
    ],
  }),
  component: MobileDev,
});

const KUIRA_REPO = "https://github.com/kuiralabs/kuira-sdk-android";
const KUIRA_DOCS = "https://kuiralabs.github.io/kuira-sdk-android/";
const MOBILEMIDNIGHT_REPO = "https://github.com/arunnadarasa/mobilemidnight";



function MobileDev() {
  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* HERO */}
        <span className="eyebrow">Mobile · Kuira SDK</span>
        <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
          Ship a Midnight dApp as a <span className="italic text-primary">native Android app</span>.
        </h1>
        <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
          Kuira Labs' open-source Android SDK bundles passkey-derived identity, an embedded wallet,
          and the Compact contract runtime into a single Gradle dependency. No Lace, no browser
          extension, no seed phrase — biometric unlock and a normal app-store install.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em]">
          <a
            href={KUIRA_REPO}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors duration-500"
          >
            GitHub · kuira-sdk-android ↗
          </a>
          <a
            href={KUIRA_DOCS}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
          >
            SDK Docs ↗
          </a>
          <Link
            to="/undeployed"
            className="px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Local dev loop →
          </Link>
        </div>

        {/* OPPORTUNITY */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">What's the opportunity?</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            The desktop-only ceiling, lifted.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Card
              tag="No extension"
              title="Ship to any Android user"
              body="Lace is a browser extension — a large UX filter for non-crypto-native users. Kuira ships as an app: install from the Play Store, open, use. Instantly reachable by the ~3B active Android devices."
            />
            <Card
              tag="Passkey identity"
              title="Biometrics instead of seed phrases"
              body="Identity derives from a WebAuthn/passkey stored in the device secure enclave. Unlock with fingerprint or face — no 24 words to lose, no phishable private key on disk."
            />
            <Card
              tag="One Gradle dep"
              title="Wallet + proving + Compact runtime"
              body="Signing, tDUST balance handling, ZK proving hooks, and Compact circuit calls all ship in the SDK. You write app UI; the SDK talks to indexer, proof server, and node."
            />
            <Card
              tag="New hackathon lanes"
              title="Categories desktop can't reach"
              body="NFC tap-to-anchor, POS receipts, offline-first field capture, wearable check-ins, mobile-only crowdfunding. Verticals gated behind a phone form-factor open up."
            />
          </div>
        </section>

        {/* VERIFIED REFERENCE BUILD */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Verified reference build</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            mobilemidnight — Tokenized Choreo Kits.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The first verified end-to-end Kuira dApp on Undeployed: passkey Sigil forge, 10,000 NIGHT
            airdrop, dust registered, catalog deployed, and two kits published on-chain with a
            ~25s warm on-device prove.
          </p>
          <div className="mt-6 p-6 border border-primary/40 bg-card">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-start">
              <div>
                <span className="eyebrow text-primary">Pinned stack</span>
                <div className="font-display text-lg mt-2 leading-tight">
                  Kuira SDK <code>0.1.0-alpha05</code> · Compact <code>0.31.1</code> ·{" "}
                  <code>mn localnet</code> · on-device proving
                </div>
                <ul className="mt-4 text-sm text-muted-foreground leading-relaxed space-y-1.5 list-disc pl-5">
                  <li>Passkey Sigil forge (WebAuthn / Credential Manager)</li>
                  <li>NIGHT funded via <code>mn airdrop … --network undeployed</code></li>
                  <li>Dust registered in-app (not via <code>mn dust register</code>)</li>
                  <li>Compact catalog deployed, 2 kits published (~25s warm prove)</li>
                </ul>
              </div>
              <a
                href={MOBILEMIDNIGHT_REPO}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-foreground transition-colors duration-500 text-[11px] uppercase tracking-[0.24em] whitespace-nowrap"
              >
                Repo ↗
              </a>
            </div>
            <p className="mt-5 text-xs text-muted-foreground/80 leading-relaxed">
              Every hard-won lesson from this build — passkey rpId + assetlinks, emulator
              prerequisites, `mn airdrop` funding path, address-checksum pitfalls, `FLAG_SECURE`
              screencap workarounds — is folded into the{" "}
              <Link to="/llms" className="underline hover:text-primary">
                Lovable Midnight skill
              </Link>{" "}
              you can download for your own Lovable projects.
            </p>
          </div>
        </section>


        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Hackathon angles</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Builds that only make sense on mobile.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Angle
              title="Tap-to-anchor choreography"
              body="Dancer taps phone on a stage NFC tag → on-device ZK proof commits the move to a Compact ledger. Judges scan the tag to verify authorship without exposing the routine."
            />
            <Angle
              title="Offline-first receipts"
              body="Field workers capture provenance without connectivity. The SDK queues signed intents; when online, it batch-submits ZK proofs to Midnight. Perfect for photojournalism, expedition logs, or supply-chain provenance."
            />
            <Angle
              title="Passkey agent wallets"
              body="Give an on-device A2A / AP2 / UCP / x402 agent its own passkey-scoped wallet. Micro-payments and CartMandate anchoring settle on Midnight without ever seeing a seed phrase."
            />
            <Angle
              title="Mobile-first crowdfunding"
              body="ChoreoCrowd-style campaigns where backers contribute tDUST from a phone. In-app faucet button (same pattern as flymidnight) means first-time users can try the flow with zero external setup."
            />
          </div>
        </section>

        {/* STACK MAPPING */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">How it fits the existing stack</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Same primitives, new client.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The mobile SDK slots into the same Midnight infrastructure the web demos already use —
            you don't rebuild anything server-side, you just add a second client.
          </p>
          <div className="mt-8 border border-border overflow-hidden">
            <MapRow
              from="Lace browser extension"
              to="Kuira embedded wallet (passkey-derived)"
            />
            <MapRow
              from="Browser proof-server fetch"
              to="On-device proving or Fly.io HTTPS proof server"
              cta={<Link to="/undeployed" hash="fly" className="underline hover:text-primary">Fly.io recipe →</Link>}
            />
            <MapRow
              from="scripts/deploy-midnight.mjs"
              to="Same script — Android reads VITE_DEFAULT_CONTRACT from a config endpoint"
            />
            <MapRow
              from="Local Docker Undeployed stack"
              to="Same stack — phone points at LAN IP (or Fly URL) instead of localhost"
            />
            <MapRow
              from="Indexer GraphQL over WSS"
              to="Same endpoint — SDK opens the WSS from the app process"
            />
            <MapRow
              from="Web faucet button / tDUST balance UI"
              to={<><code>mn airdrop … --network undeployed</code> + in-app "Register dust"</>}
            />

          </div>
        </section>

        {/* GETTING STARTED */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Getting started</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">Three steps to a first build.</h2>
          <ol className="mt-8 space-y-6">
            <Step
              n={1}
              title="Start the Kuira-native local devnet"
              body={
                <>
                  Kuira targets the <code>mn</code> CLI toolchain, not the Docker{" "}
                  <code>midnight-node:0.22.5</code> stack the web demos use. Run{" "}
                  <code>mn localnet up</code> to bring up an Undeployed devnet the SDK understands
                  natively. (You can still point Kuira at a Fly.io-hosted indexer + proof server if
                  you'd rather not run a devnet on your laptop —{" "}
                  <Link to="/undeployed" hash="fly" className="underline hover:text-primary">
                    Fly.io recipe →
                  </Link>
                  )
                </>
              }
            />
            <Step
              n={2}
              title="Add the Kuira Gradle dependency"
              body={
                <>
                  Follow the SDK README to add the dependency, initialise the passkey identity, and
                  wire the embedded wallet. The Kuira docs walk through the minimal Android Studio
                  project.{" "}
                  <a
                    href={KUIRA_REPO}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-primary"
                  >
                    SDK README ↗
                  </a>
                </>
              }
            />
            <Step
              n={3}
              title="Fund the Sigil with mn airdrop, then Register dust in-app"
              body={
                <>
                  There is no in-app browser faucet on mobile. Forge the passkey Sigil, copy the{" "}
                  <code>mn_addr_undeployed1…</code> address from the app UI (do NOT retype from a
                  screenshot — <code>l</code>/<code>1</code> collisions break the checksum), then:
                  <pre className="mt-3 p-3 bg-muted/40 border border-border text-xs overflow-x-auto">
                    <code>mn airdrop 10000 --wallet &lt;addr&gt; --network undeployed</code>
                  </pre>
                  Then tap <strong>Register dust</strong> in the app (NOT <code>mn dust register</code>{" "}
                  — Kuira uses its own registration flow). Now Deploy the catalog and Publish a kit;
                  expect ~30–120s cold on-device prove.
                </>
              }
            />
          </ol>

          <div className="mt-10 p-6 border border-border bg-card">
            <span className="eyebrow text-primary">Passkey setup checklist</span>
            <h3 className="font-display text-xl mt-2 italic leading-tight">
              Skip any of these and you'll spend hours in Credential Manager exceptions.
            </h3>
            <ul className="mt-4 text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>
                <strong>Real domain <code>rpId</code></strong> — not <code>REPLACE_ME</code>,
                not <code>.example</code>. GitHub Pages works (e.g.{" "}
                <code>arunnadarasa.github.io</code>).
              </li>
              <li>
                <strong>Hosted <code>assetlinks.json</code></strong> at{" "}
                <code>https://&lt;rpId&gt;/.well-known/assetlinks.json</code> with your Android
                package + debug (or release) signing SHA-256.
              </li>
              <li>
                <strong>Signed-in Google account</strong> on the AVD or device — passkey create has
                no options without it, DAL correctness alone is not enough.
              </li>
              <li>
                <strong>Screen lock set</strong> — biometric/PIN. Password Manager refuses to offer
                create otherwise.
              </li>
              <li>
                <strong>Soft keyboard forced on:</strong>{" "}
                <code>adb shell settings put secure show_ime_with_hard_keyboard 1</code> + Gboard.
                Host-keyboard input silently fails on Compose and WebView fields.
              </li>
              <li>
                <strong>After any <code>rpId</code>/assetlinks change: full uninstall then
                reinstall.</strong> <code>adb install -r</code> leaves Credential Manager cached.
              </li>
            </ul>
          </div>
        </section>



        {/* REFERENCES */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">References</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">Where to dig deeper.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={KUIRA_REPO}
              target="_blank"
              rel="noreferrer"
              className="block p-6 border border-border hover:border-primary/60 transition-colors duration-500"
            >
              <span className="eyebrow text-primary">GitHub</span>
              <div className="font-display text-xl mt-2">kuiralabs/kuira-sdk-android ↗</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Source, issue tracker, and the canonical README with Gradle instructions.
              </p>
            </a>
            <a
              href={KUIRA_DOCS}
              target="_blank"
              rel="noreferrer"
              className="block p-6 border border-border hover:border-primary/60 transition-colors duration-500"
            >
              <span className="eyebrow text-primary">Docs site</span>
              <div className="font-display text-xl mt-2">kuiralabs.github.io/kuira-sdk-android ↗</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Hosted API reference and guides for identity, wallet, and contract calls.
              </p>
            </a>
            <a
              href={MOBILEMIDNIGHT_REPO}
              target="_blank"
              rel="noreferrer"
              className="block p-6 border border-primary/40 hover:border-primary transition-colors duration-500"
            >
              <span className="eyebrow text-primary">Reference build</span>
              <div className="font-display text-xl mt-2">arunnadarasa/mobilemidnight ↗</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tokenized Choreo Kits — first verified Kuira dApp on Undeployed. Passkey Sigil,{" "}
                <code>mn airdrop</code> funding, on-device prove, 2 kits published.
              </p>
            </a>
            <Link
              to="/showcase"
              className="block p-6 border border-border hover:border-primary/60 transition-colors duration-500"
            >
              <span className="eyebrow text-primary">Showcase</span>
              <div className="font-display text-xl mt-2">No hosted mobile demo yet →</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                mobilemidnight is the reference repo; the first team to ship a{" "}
                <em>hosted</em> Kuira demo gets featured on the showcase page.
              </p>
            </Link>

            <Link
              to="/undeployed"
              className="block p-6 border border-border hover:border-primary/60 transition-colors duration-500"
            >
              <span className="eyebrow text-primary">Infrastructure</span>
              <div className="font-display text-xl mt-2">Undeployed + Fly.io hosting →</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                How to run the node, indexer, and proof server locally or on Fly.io so your Android
                app has something to talk to.
              </p>
            </Link>
          </div>
          <p className="mt-8 text-xs text-muted-foreground/80 leading-relaxed max-w-2xl">
            Kuira SDK was surfaced by Jay Albert (Midnight Network) in the <code>#dev-chat</code>{" "}
            Discord as the recommended path for hackathon teams building mobile Midnight dApps.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}

function Card({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="p-6 border border-border">
      <span className="eyebrow text-primary">{tag}</span>
      <h3 className="font-display text-xl mt-3 leading-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Angle({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6 bg-card border border-border">
      <h3 className="font-display text-xl leading-tight italic">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function MapRow({ from, to, cta }: { from: string; to: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 px-5 sm:px-6 py-4 border-b border-border last:border-b-0 text-sm">
      <div className="text-muted-foreground">{from}</div>
      <div className="text-primary hidden sm:block">→</div>
      <div className="text-foreground">
        {to}
        {cta ? <div className="mt-1 text-xs">{cta}</div> : null}
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="grid sm:grid-cols-[auto_1fr] gap-5 items-start">
      <span className="font-display text-3xl italic text-primary leading-none">
        {String(n).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-display text-xl leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </li>
  );
}
