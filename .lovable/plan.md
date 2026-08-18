# Add a Hyperledger Identus page + IPS Compass showcase demo

A new reference page explaining what Identus adds to a Midnight build (verifiable credentials for *who*, Midnight for *what stayed unchanged*), grounded in the tested learnings from the Catalyst console, the NHS console, and the ipsmidnight / IPS Compass build.

## New page: `/identus`

Sections, in reading order:

1. **What Identus is, in plain language** — self-sovereign identity infrastructure: a Cloud Agent (Scala REST service) + Postgres + PRISM node, optional Mediator for DIDComm, and edge SDKs. DIDs, verifiable credentials, presentations.
2. **Why pair it with Midnight** — Identus answers "who attested this", Midnight answers "this existed and is unchanged, without revealing content". The IPS Compass shape: build a document → SHA-256 digest → credential over the digest → `commitment = H(domain ‖ digest ‖ salt)` inserted into an append-only Compact set.
3. **Three modes** — Simulated (in-app mock, always healthy, good for UI work), Docker local (`http://localhost:8085/cloud-agent`, localhost-only DIDComm), Fly.io Machines (HTTPS at root — **strip `/cloud-agent`** from stored Fly URLs).
4. **Pinned stack** — Docker Hub tags only (GHCR is not anonymously pullable): `identus/identus-cloud-agent:1.40.0`, `identus/prism-node:2.5.0`, `postgres:13-alpine`. Never `:latest`.
5. **Hard-won invariants** (copy-buttoned code where useful):
   - Identus 1.40 connects as `<db>-application-user` roles — the init SQL must `CREATE ROLE` per database (`pollux`, `connect`, `agent`, `node`) with `ALTER DEFAULT PRIVILEGES` + `GRANT USAGE, CREATE ON SCHEMA public` inside each DB via `\connect` hops. Missing roles = `zio.FiberFailure: ERROR: role "pollux-application-user" does not exist`, buried deep in a ZIO trace.
   - Postgres pinned to `13-alpine`; on 16 the bundled Flyway migrations fail with a syntax error near `FORMAT`.
   - Init scripts only run on an empty data dir → the fix is recreating just the Identus Postgres machine ("Fix agent DB"), not a full redeploy.
   - Fly private DNS keys off `config.metadata.fly_process_group`, not machine name; 6PN is IPv6-only → `JAVA_TOOL_OPTIONS=-Djava.net.preferIPv6Addresses=true -Djava.net.preferIPv4Stack=false -XX:MaxRAMPercentage=70`, node RPC on `[::]:9944`, indexer `APP__INFRA__API__ADDRESS: "::"`.
   - Health-check `grace_period: 300s`, agent memory ≥ 4 GB (first boot migrates four databases), readiness polls capped at 60s.
   - Machines API has no per-container log endpoint — tee the entrypoint into `/tmp/agent-boot.log` and read it back via `machines/:id/exec`.
   - Only a **published** `did:prism` with an `assertionMethod` key can sign a credential offer; connectionless issuance skips DIDComm entirely.
   - DIDComm invitations need a reachable host: publish 8090 and set `DIDCOMM_SERVICE_URL=https://<app>.fly.dev:8090`.
   - Data minimisation in credentials: digest + type + derived `over18` boolean; never names, DOB, or clinical content.
   - Honesty rules: decoding a JWT is **not** signature verification; a transaction hash is **not** ledger verification; simulated credentials (`alg: none`) prove nothing. Anchors missing their salt fail closed.
6. **Failure-mode table** — the eight rows from the IPS Compass build (UnknownHostException / process group, node crash-loop on 0.22.x flags, IPv4 loopback vs 6PN, chain state lost without a volume, drowned-out agent logs, `failed_precondition: machine not running`, the application-role failure, probes spinning while a machine is dead) plus the two reverted speculative fixes and the lesson: no env var without an upstream source.
7. **Opportunity for hackathon builders** — where credentials + private anchoring beat either alone: clinical summaries (IPS), credential-gated agentic commerce (the delegation gate where human principal ≠ AI agent DID — cross-comparing those subjects is the classic false "credential mismatch"), ticketing / eligibility, licence provenance for the creative themes.
8. **Reference links** — Identus docs, IPS Compass live app + repo, the Catalyst/NHS console framing.

Page gets its own `head()` (title, description, og:title, og:description, og:type, twitter:card) and follows the existing site card/token styling; mobile-first (stacked headings, wrapping hashes, horizontally scrolling tables).

## Showcase card

Add an **IPS Compass (Identus × Midnight)** card to `src/routes/showcase.index.tsx`, tagged `Health · Identus + Compact`, badge `Undeployed · Fly.io`, filters `undeployed` + `undeployed-fly`. Copy: FHIR IPS authoring → SHA-256 digest → Identus credential → append-only `IpsAnchorRegistry` commitment on a Fly-hosted Undeployed stack, all infra provisioned from inside the app with no local Docker. Links to `https://ipsmidnight.lovable.app/`, the GitHub repo, and the new `/identus` page.

## Navigation

Add **Identus** to the desktop "Build" group and the mobile burger list in `src/components/site-shell.tsx`, next to Mobile Dev.

## Technical notes

- New file `src/routes/identus.tsx` (route string `/identus`), presentation-only — no server functions, no backend, no new dependencies.
- Edits limited to `src/routes/showcase.index.tsx` and `src/components/site-shell.tsx`.
- No mega-prompt or LLM-bundle regeneration in this plan; say the word if you also want an Identus overlay added to the ~10,000 prompts.
