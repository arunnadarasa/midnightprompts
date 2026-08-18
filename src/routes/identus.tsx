import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";

export const Route = createFileRoute("/identus")({
  head: () => ({
    meta: [
      { title: "Identus × Midnight · Verifiable credentials + private anchoring" },
      {
        name: "description",
        content:
          "How to pair a Hyperledger Identus Cloud Agent with a Midnight Compact contract: DIDs and verifiable credentials answer who attested, an append-only commitment set proves the document is unchanged. Pinned images, Fly.io invariants, and the failure modes we hit.",
      },
      { property: "og:title", content: "Identus × Midnight — credentials meet private anchoring" },
      {
        property: "og:description",
        content:
          "Cloud Agent 1.40 on Fly Machines, application-role init SQL, IPv6-only 6PN, connectionless issuance, and an append-only Compact commitment registry — the tested version.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IdentusPage,
});

const IPS_APP = "https://ipsmidnight.lovable.app/";
const IPS_REPO = "https://github.com/arunnadarasa/ipsmidnight";
const IDENTUS_DOCS = "https://hyperledger-identus.github.io/docs/";

const INIT_SQL = `-- Identus 1.40's FIRST Flyway statement is
--   ALTER DEFAULT PRIVILEGES ... TO "<db>-application-user"
-- so that LOGIN role must exist per database, or the agent exits 1.
CREATE DATABASE pollux;  CREATE DATABASE connect;
CREATE DATABASE agent;   CREATE DATABASE node;

\\connect pollux
CREATE ROLE "pollux-application-user" WITH LOGIN PASSWORD '<pw>';
GRANT USAGE, CREATE ON SCHEMA public TO "pollux-application-user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO "pollux-application-user";
-- repeat the \\connect + CREATE ROLE + GRANT block for connect, agent, node`;

const FLY_ENV = `# Fly private DNS (<group>.process.<app>.internal) resolves ONLY when the
# machine declares its process group. 6PN is IPv6-only.
config.metadata.fly_process_group = "identus-postgres" | "prism-node" | "cloud-agent"

JAVA_TOOL_OPTIONS="-Djava.net.preferIPv6Addresses=true \\
  -Djava.net.preferIPv4Stack=false -XX:MaxRAMPercentage=70"

# Midnight side of the same app
node RPC bind:  [::]:9944
indexer:        APP__INFRA__API__ADDRESS: "::"

# checks: grace_period 300s · agent memory >= 4096 MB · poll timeout <= 60s
DIDCOMM_SERVICE_URL=https://<app>.fly.dev:8090   # publish internal port 8090`;

const BOOT_LOG = `# The Machines API has no per-container log endpoint, and a crash-looping
# JVM is drowned out by healthy sibling output. Tee it, then read it back.
sh -c 'identus-cloud-agent > /tmp/agent-boot.log 2>&1; c=$?; exit $c' &
tail -F /tmp/agent-boot.log

# read from outside:  POST /v1/apps/<app>/machines/<id>/exec
#   { "cmd": ["sh","-c","tail -n 400 /tmp/agent-boot.log"] }`;

const ANCHOR = `commitment = persistentHash("ips:anchor:v1" || sha256(bundle) || salt)

// contracts/IpsAnchorRegistry.compact — append-only, duplicates rejected
export ledger commitments: Set<Bytes<32>>;

export circuit anchor(commitment: Bytes<32>): [] {
  assert(!commitments.member(disclose(commitment)), "already anchored");
  commitments.insert(disclose(commitment));
}`;

const FAILURES: { symptom: string; cause: string; fix: string }[] = [
  {
    symptom: "Agent: UnknownHostException resolving identus-postgres.process.<app>.internal",
    cause: "Fly private DNS keys off process-group metadata, not the machine name",
    fix: "Set config.metadata.fly_process_group on every machine; add a repair action that back-fills it on existing stacks",
  },
  {
    symptom: "zio.FiberFailure: ERROR: role \"pollux-application-user\" does not exist",
    cause: "Identus 1.40 connects as per-database application roles created by upstream's compose init scripts",
    fix: "Init SQL creates one <db>-application-user per database with GRANT USAGE, CREATE + ALTER DEFAULT PRIVILEGES, inside each DB via \\connect hops",
  },
  {
    symptom: "The role fix has no effect on an existing stack",
    cause: "Postgres init scripts run only against an EMPTY data directory",
    fix: "Destroy and recreate just the Identus Postgres machine (a \"Fix agent DB\" action) — never a full-stack redeploy that also restarts a healthy ledger",
  },
  {
    symptom: "Flyway migration fails with a syntax error near FORMAT",
    cause: "Postgres drifted off 13 — FORMAT is reserved from 14 onward",
    fix: "Pin postgres:13-alpine and recreate the machine on a fresh volume",
  },
  {
    symptom: "Midnight node crash-loops, exit code 1, seconds after start",
    cause: "The 0.22.x node image rejected hand-rolled dev-network CLI flags",
    fix: "midnight-node driven by CFG_PRESET=dev (auto-authoring) instead of flags",
  },
  {
    symptom: "Node and indexer running but unreachable from sibling machines",
    cause: "Services bound to IPv4 loopback; Fly's private network is IPv6-only",
    fix: "Bind node RPC to [::]:9944, set APP__INFRA__API__ADDRESS: \"::\", give the JVM preferIPv6Addresses",
  },
  {
    symptom: "Chain state lost on every machine replacement",
    cause: "The node wrote to the container filesystem",
    fix: "Attach a Fly volume (10 GB) mounted at the node's chain directory",
  },
  {
    symptom: "Log tail returns failed_precondition: machine not running",
    cause: "A crash-looping machine is down for part of each cycle, so exec has no target",
    fix: "File-based fallbacks and a short post-crash window — but the real fix is stopping the crash, not reading it faster",
  },
  {
    symptom: "Health probes spin forever while the machine is already dead",
    cause: "Step state derived from probe results alone",
    fix: "Derive state from machine state first, short-circuit downstream probes on a boot failure, and report restart counts + OOM kills",
  },
  {
    symptom: "GHCR image pull unauthorized",
    cause: "GHCR is not anonymously pullable",
    fix: "Use the Docker Hub tags with explicit versions; never :latest (a re-pushed proof-server:latest shipped incompatible proving keys mid-demo)",
  },
];

function IdentusPage() {
  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* HERO */}
        <span className="eyebrow">Identity · Hyperledger Identus</span>
        <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
          Credentials prove <span className="italic text-primary">who</span>. Midnight proves{" "}
          <span className="italic text-primary">nothing changed</span>.
        </h1>
        <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
          Hyperledger Identus is self-sovereign identity infrastructure: DIDs, verifiable
          credentials and presentations, served by a Cloud Agent. Midnight is where you anchor a
          commitment to a document so a verifier can confirm it existed and is unchanged — without
          ever seeing its contents. Used together you get an attestation with an author and a
          tamper-evident record with no data leak. Everything below is from working builds, not
          the marketing page.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em]">
          <a
            href={IPS_APP}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors duration-500"
          >
            Live demo · IPS Compass ↗
          </a>
          <a
            href={IPS_REPO}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
          >
            GitHub · ipsmidnight ↗
          </a>
          <a
            href={IDENTUS_DOCS}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
          >
            Identus Docs ↗
          </a>
        </div>

        {/* WHAT IT IS */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">The pieces</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            One agent, three services, two SDK edges.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Card
              tag="Cloud Agent"
              title="The REST service you actually call"
              body="A Scala/JVM service exposing DID registrar, connections, issuance and presentation endpoints. It needs a Postgres and a PRISM node beside it; first boot migrates four separate databases, which is why it looks slow and why it needs 4 GB."
            />
            <Card
              tag="PRISM node"
              title="DID method backing"
              body="Publishes did:prism documents. Without Cardano ledger backing it resolves only inside your own stack — fine for a demo, but say so: a third party cannot resolve those DIDs."
            />
            <Card
              tag="Edge SDKs"
              title="TypeScript / Kotlin / Swift"
              body="Wallet-side libraries for holding credentials and answering presentation requests. In a Lovable app the browser talks to your own server functions, and only the server holds the agent's admin key."
            />
            <Card
              tag="DIDComm (optional)"
              title="Skip it with connectionless issuance"
              body="A Mediator lets remote wallets exchange DIDComm messages. If you only need a credential over a digest, connectionless issuance avoids the whole invitation dance — one REST call, an invitation URL, no established connection."
            />
          </div>
        </section>

        {/* WHY PAIR */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Why pair them</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Digest → credential → commitment.
          </h2>
          <p className="mt-6 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The shape below is the one verified in IPS Compass (clinical summaries), and it
            transfers unchanged to a dance licence, a ticket entitlement or an agent mandate. The
            document never leaves your database; the digest is the only thing that travels, and the
            ledger only ever sees a salted commitment.
          </p>
          <ol className="mt-8 grid gap-8">
            <Step
              n={1}
              title="Serialise and digest"
              body={
                <>
                  Canonicalise the document (stable key order, normalised whitespace) and hash it
                  with SHA-256. Non-deterministic serialisation is the number-one reason a verifier
                  recomputes a different digest later.
                </>
              }
            />
            <Step
              n={2}
              title="Issue a credential over the digest"
              body={
                <>
                  Claims carry the digest, the credential type and at most a derived boolean (e.g.{" "}
                  <code>over18</code>). Never a name, a date of birth, or any body content —
                  a credential is not a place to park data you refused to put on a ledger.
                </>
              }
            />
            <Step
              n={3}
              title="Anchor a salted commitment"
              body={
                <>
                  <code>commitment = H(domain ‖ digest ‖ salt)</code>, inserted into an append-only
                  Compact <code>Set</code>. Persist the salt with the anchor — an anchor whose salt
                  is missing is unverifiable and must fail closed, not read as confirmed.
                </>
              }
            />
            <Step
              n={4}
              title="Verify each link independently"
              body={
                <>
                  Structural validation, digest match, a real credential (a pending offer with no
                  JWT is not one), and a membership read against the ledger. Report each pass
                  separately so a partial failure names the broken link.
                </>
              }
            />
          </ol>

          <div className="mt-8 bg-card border border-border">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Append-only commitment registry
              </span>
              <CopyButton text={ANCHOR} />
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs leading-relaxed">
              <code>{ANCHOR}</code>
            </pre>
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Insert-only is not a style choice — overwriting an existing key in a public ledger map
            makes the dust fee balancer panic on the next call. See{" "}
            <Link to="/known-issues" className="underline hover:text-primary">Known issues</Link>.
          </p>
        </section>

        {/* HONESTY */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Say what you actually check</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Three claims almost every demo overstates.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <Card
              tag="Not verification"
              title="Decoding a JWT"
              body="Reading a credential payload is not JWS verification: no signature check, no issuer DID resolution, no status-list lookup. Label it “issuer signature: not verified” until you do all three."
            />
            <Card
              tag="Not verification"
              title="A transaction hash"
              body="A tx hash proves you submitted something. On-chain verification is a read: load public state from the indexer and ask whether commitments.member(commitment) holds."
            />
            <Card
              tag="Not a trust chain"
              title="Simulated mode"
              body="An in-app mock issuer is invaluable for UI work (alg: none, stub signature, always healthy) — and proves nothing. Mark simulated credentials as such in the UI, every time."
            />
          </div>
        </section>

        {/* MODES */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Three ways to run the agent</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Simulated → Docker → Fly Machines.
          </h2>
          <div className="mt-8 border border-border bg-card">
            <MapRow
              from="Simulated"
              to={
                <>
                  In-app mock backed by your own tables. No external service, always healthy. Use it
                  to build every screen before you wait on a JVM boot.
                </>
              }
            />
            <MapRow
              from="Docker (local)"
              to={
                <>
                  <code>docker compose</code> stack reached at{" "}
                  <code>http://localhost:8085/cloud-agent</code>. Localhost only — external DIDComm
                  peers need a tunnel.
                </>
              }
            />
            <MapRow
              from="Fly.io Machines"
              to={
                <>
                  Postgres + prism-node + cloud-agent machines, HTTPS at the app root. Strip{" "}
                  <code>/cloud-agent</code> from the stored base URL for this mode — there is no
                  APISIX gateway in front of a direct Fly deploy.
                </>
              }
            />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="p-6 bg-card border border-border">
              <h3 className="font-display text-xl italic leading-tight">Pin every image</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground font-mono break-all">
                <li>docker.io/identus/identus-cloud-agent:1.40.0</li>
                <li>docker.io/identus/prism-node:2.5.0</li>
                <li>docker.io/postgres:13-alpine</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Docker Hub, not GHCR (not anonymously pullable). Never <code>:latest</code> — a
                re-pushed tag shipped incompatible proving keys mid-demo. Pin digests if you can and
                record the resolved digest with the deployment.
              </p>
            </div>
            <div className="p-6 bg-card border border-border">
              <h3 className="font-display text-xl italic leading-tight">Four databases, four roles</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Create <code>pollux</code>, <code>connect</code>, <code>agent</code> and{" "}
                <code>node</code> as separate databases to avoid migration collisions — and one{" "}
                <code>&lt;db&gt;-application-user</code> LOGIN role inside each. The agent does not
                connect as the superuser.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-card border border-border">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Postgres init SQL
              </span>
              <CopyButton text={INIT_SQL} />
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs leading-relaxed">
              <code>{INIT_SQL}</code>
            </pre>
          </div>

          <div className="mt-6 bg-card border border-border">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Fly machine config that actually boots
              </span>
              <CopyButton text={FLY_ENV} />
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs leading-relaxed">
              <code>{FLY_ENV}</code>
            </pre>
          </div>

          <div className="mt-6 bg-card border border-border">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Build the diagnostics path first
              </span>
              <CopyButton text={BOOT_LOG} />
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs leading-relaxed">
              <code>{BOOT_LOG}</code>
            </pre>
          </div>
        </section>

        {/* INVARIANTS */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Hard-won invariants</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">Non-negotiables.</h2>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground">
            {[
              "Only a PUBLISHED did:prism carrying an assertionMethod key can sign a credential offer. Filter the issuer picker by resolving each DID and show why the excluded ones are excluded.",
              "Connectionless issuance omits connectionId; passing one without an established connection returns a 400 that reads like an agent fault.",
              "DIDComm invitations must advertise a reachable host: publish internal port 8090 and set DIDCOMM_SERVICE_URL=https://<app>.fly.dev:8090. Repair the endpoint on existing apps instead of redeploying.",
              "grace_period 300s on the health check — first boot migrates four databases and a shorter window restarts the machine mid-migration.",
              "Agent memory 4 GB or more; anything less gets OOM-killed during that first migration.",
              "Cap a single readiness poll at 60s — the Machines API rejects longer timeouts with a 400.",
              "Every provisioning function must degrade gracefully when the Fly token is absent: return an \"unconfigured\" state the UI can render, never throw inside a loader.",
              "Treat 404 from a destroy/read as \"already gone\" and mark the record orphaned — Fly resources vanish outside your app.",
              "Scope unique indexes on stack tables by (user_id, kind), or provisioning an Identus stack silently overwrites the Midnight one.",
              "Provision / check / repair / repair-agent-DB / destroy are separate idempotent operations. Repairing a broken agent must never restart a healthy ledger.",
              "Secrets stay server-side: read the Fly token and admin key inside .handler() bodies, keep agent clients in *.server.ts, and let routes import only *.functions.ts.",
              "No env var or flag ships without an upstream source that says it is required. Two speculative fixes (a derived wallet seed, a duplicate POSTGRES_* group) cost a debugging cycle and hid the real error.",
            ].map((rule) => (
              <li key={rule} className="flex gap-3 p-4 bg-card border border-border">
                <span className="text-primary shrink-0">▸</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAILURE MODES */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">Failure modes we hit</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Symptom, root cause, fix.
          </h2>
          <div className="mt-8 -mx-5 sm:mx-0 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm border border-border bg-card">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-4 py-3 border-b border-border font-normal">Symptom</th>
                  <th className="px-4 py-3 border-b border-border font-normal">Root cause</th>
                  <th className="px-4 py-3 border-b border-border font-normal">Fix</th>
                </tr>
              </thead>
              <tbody>
                {FAILURES.map((f) => (
                  <tr key={f.symptom} className="align-top">
                    <td className="px-4 py-4 border-b border-border font-mono text-xs break-words">
                      {f.symptom}
                    </td>
                    <td className="px-4 py-4 border-b border-border text-muted-foreground leading-relaxed">
                      {f.cause}
                    </td>
                    <td className="px-4 py-4 border-b border-border leading-relaxed">{f.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            The meta-lesson: porting a compose stack to Fly Machines is a translation job. Read the
            upstream compose and init scripts before writing a single machine spec — every failure
            above was already answered there.
          </p>
        </section>

        {/* OPPORTUNITY */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">What's the opportunity?</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">
            Where credentials plus private anchoring beat either alone.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Angle
              title="Clinical and personal records"
              body="An International Patient Summary is authored, digested and attested, and only a salted commitment reaches the ledger. A verifier confirms the summary is the one that was issued and unchanged, without a byte of clinical data leaving the source."
            />
            <Angle
              title="Credential-gated agentic commerce"
              body="Gate an A2A / AP2 / x402 flow on a credential before the payment circuit runs. Watch the subjects: the human principal holds the credential, the AI agent holds the mandate — cross-comparing those two DIDs is the classic false “credential mismatch” rejection."
            />
            <Angle
              title="Eligibility and ticketing"
              body="Prove over-18, membership or residency from a derived boolean claim, then anchor the entitlement commitment so a door scan is a membership read rather than a database lookup against a list of names."
            />
            <Angle
              title="Licence and provenance for creative work"
              body="Issue a credential over a choreography, score or master file digest, anchor it privately, and settle usage on a mimic-token rail. The credential names the author; the ledger proves the file predates the dispute."
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em]">
            <Link
              to="/showcase"
              className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
            >
              See the demo in the showcase →
            </Link>
            <Link
              to="/themes"
              className="px-6 py-3 border border-border text-foreground hover:border-primary/60 transition-colors duration-500"
            >
              Browse build prompts →
            </Link>
          </div>
        </section>

        {/* REFERENCES */}
        <section className="mt-16 border-t border-border pt-12">
          <span className="eyebrow">References</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 italic">Read these.</h2>
          <ul className="mt-8 grid gap-2 text-sm">
            <RefLink href={IDENTUS_DOCS} label="Hyperledger Identus documentation" />
            <RefLink href={IPS_APP} label="IPS Compass — live app (Identus × Midnight)" />
            <RefLink
              href={`${IPS_REPO}#issues-encountered-and-how-they-were-solved`}
              label="ipsmidnight — issues encountered and how they were solved"
            />
            <RefLink
              href={`${IPS_REPO}#what-we-would-do-differently-next-time`}
              label="ipsmidnight — what we would do differently next time"
            />
            <RefLink
              href="https://hyperledger-identus.github.io/docs/identus/credentials/issue"
              label="Credential issuance (incl. connectionless flow)"
            />
            <RefLink href="https://build.fhir.org/ig/HL7/fhir-ips/" label="HL7 International Patient Summary IG" />
          </ul>
          <p className="mt-8 text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Sources: the Identus Catalyst console and the Identus NHS console (agent provisioning,
            diagnostics and the ZK presentation layer) plus the IPS Compass build, which is the one
            that joins Identus credentials to a Midnight Compact anchor end to end. Dev-network
            only, unaudited, and not for real patient data.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}

function Card({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="p-6 bg-card border border-border">
      <span className="text-[10px] uppercase tracking-[0.24em] text-primary">{tag}</span>
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

function MapRow({ from, to }: { from: string; to: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[1fr_auto_2fr] items-start gap-3 sm:gap-6 px-5 sm:px-6 py-4 border-b border-border last:border-b-0 text-sm">
      <div className="text-foreground font-display text-lg italic">{from}</div>
      <div className="text-primary hidden sm:block">→</div>
      <div className="text-muted-foreground leading-relaxed break-words">{to}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="grid sm:grid-cols-[auto_1fr] gap-5 items-start">
      <span className="font-display text-3xl italic text-primary leading-none">
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-xl leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function RefLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-4 px-4 py-3 bg-card border border-border hover:border-primary/60 transition-colors duration-500"
      >
        <span className="min-w-0 break-words">{label}</span>
        <span className="text-primary shrink-0">↗</span>
      </a>
    </li>
  );
}
