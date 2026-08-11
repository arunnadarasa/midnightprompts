# MidnightPrompts

A hackathon launchpad for the [Midnight](https://midnight.network) zero-knowledge blockchain: **1,996 build ideas × 5 network targets × 3 operating systems ≈ 10,000 self-contained Lovable mega-prompts**, plus live Compact contract demos, a Lace wallet playbook, a downloadable Lovable skill, and an ops "known issues" brain distilled from real builds.

- Live site: <https://midnightprompts.lovable.app>
- Midnight docs: <https://docs.midnight.network>
- Support matrix (source of truth for versions): <https://docs.midnight.network/relnotes/support-matrix>
- Lace wallet: <https://www.lace.io>
- Midnight Service Desk: <https://midnightntwrk.github.io/servicedesk/>

Built during the **Creative AI & Quantum Hackathon** organised by **StreetKode Fam** at **Indian Krump Festival 14**.

---

## Table of contents

1. [What's inside](#whats-inside)
2. [Site map](#site-map)
3. [Network targets](#network-targets)
4. [Stack and version pinning](#stack-and-version-pinning)
5. [Quickstart](#quickstart)
6. [Wallet and funding](#wallet-and-funding)
7. [Proof server](#proof-server)
8. [Deploying contracts](#deploying-contracts)
9. [Local Undeployed stack](#local-undeployed-stack)
10. [Scripts reference](#scripts-reference)
11. [Repo layout](#repo-layout)
12. [LLM bundles and the Lovable skill](#llm-bundles-and-the-lovable-skill)
13. [Hard-won ops lessons](#hard-won-ops-lessons)
14. [Troubleshooting](#troubleshooting)
15. [Contributing](#contributing)
16. [Credits](#credits)

---

## What's inside

**The prompt library.** 1,996 ideas spread over 10 creative disciplines (dance, music, visual art, video, photography, writing, film/animation, games, theater, fashion). Every idea page renders a complete, copy-paste **mega-prompt** for Lovable: contract skeleton, deploy script, wallet wiring, proof-server setup, frontend standards, and failure-mode table — no external context required.

Each prompt is generated per **network target** and per **operating system**, so the Docker/Lace/CLI commands inside the prompt already match the reader's machine.

**Protocol overlays.** 1,000 of the ideas are agentic-commerce variants layered onto the existing themes and filterable on each theme page:

| Overlay | Ideas | What it adds |
| --- | --- | --- |
| Base | ~996 | Compact contract + Lace + proof server + Indexer |
| A2A / AP2 | 500 | Agent-to-agent negotiation, mandate vaults, signed intents |
| UCP | 250 | ZK checkout / commerce protocol flows |
| x402 | 250 | HTTP 402 paywall with an mUSDC mimic token and a facilitator |

**Showcase demos.** Live and reference builds — `TimestampLog` on Preview/Preprod, MoveBoard (bboard pattern, no custom contract needed), Choreo Ledger on the local Undeployed stack, programmatic DUST, agentic negotiation, ZK checkout, x402 paywall, plus external reference repos (flymidnight, mobilemidnight, zealymidnight/StreetRail, m402).

**Reference material.** Wallet playbook, proof-server guide (with the Windows/WSL2 blockers spelled out), Undeployed-network guide including Fly.io hosting, mobile (Kuira Android SDK) guide, a quantum/ZK primer, a build-strategy write-up, a known-issues page, and a blog.

**Downloads.** The whole corpus as `llms-*.txt` bundles for feeding your own LLM, and the **Lovable Midnight skill** to install in your own Lovable account.

---

## Site map

| Route | Purpose |
| --- | --- |
| `/` | Landing page — bento grid, fireside chat video, entry points |
| `/themes` | The 10 creative disciplines |
| `/themes/:theme` | ~200 ideas per discipline, with the protocol filter chips |
| `/ideas/:id` | One idea + the full mega-prompt, with network and OS selectors |
| `/showcase` | Index of all demos, local and external |
| `/showcase/midnight-ledger` | `TimestampLog` live on Preview / Preprod / Undeployed |
| `/showcase/move-board` | MoveBoard — public board contract, bboard pattern |
| `/showcase/choreo-ledger-local` | Local-only demo against the Undeployed stack |
| `/showcase/programmatic-dust` | Registering NIGHT UTXOs for DUST from code (preprod) |
| `/showcase/a2a-ap2-negotiation` | Agent-to-agent / AP2 mandate flow |
| `/showcase/ucp-zk-checkout` | UCP ZK checkout flow |
| `/showcase/x402-midnight-paywall` | x402 v2 paywall with the MidnightUSDC mimic token |
| `/wallet` | Lace setup, addresses, faucet, tDUST, seed → bech32 |
| `/proof-server` | Docker proof server per OS, health checks, EffectStream alternative |
| `/undeployed` | Local Undeployed network + Fly.io hosting guide |
| `/undeployed-preflight` | Checklist before running the local stack |
| `/mobile` | Native Android via the Kuira SDK, with the reference build |
| `/known-issues` | Verified failure modes and measured workarounds |
| `/quantum-primer` | Plain-language ZK / quantum primer |
| `/strategy` | How the prompt corpus was built and why |
| `/llms` | Download the LLM bundles and the Lovable Midnight skill |
| `/blog`, `/blog/:slug` | Technical write-ups |
| `/about` | What this repo is and how to use it at a hackathon |
| `/agentic-experimental` | Experimental agentic-commerce surface |
| `/api/public/x402-proxy` | Server route backing the x402 demo |

Routing is file-based (TanStack Start). See [`src/routes/README.md`](src/routes/README.md) for the conventions — do not add `src/pages/` or a `_app/` layout.

---

## Network targets

| Target | Prompt tab | Notes |
| --- | --- | --- |
| **Preview** | Preview | Public testnet, unstable, resets. Fastest to try. |
| **Preprod** | Preproduction | Public testnet, stable, closest to mainnet. |
| **Undeployed (local)** | Undeployed | Your own node + indexer + proof server in Docker. No faucet wait, no resets. Recommended dev loop. |
| **Undeployed (Fly.io)** | Undeployed (Fly.io) | Same stack hosted on Fly.io so teammates and a deployed frontend can reach it over HTTPS. |
| **Undeployed (Mobile)** | Undeployed (Mobile) | Experimental, Android only — Kuira Android SDK against a local node. |
| Mainnet | *hidden* | Mainnet prompt variants exist in the generator but are intentionally not shown in the UI. |

---

## Stack and version pinning

TanStack Start v1 · Vite · React 19 · Tailwind v4 · TypeScript · Bun · Midnight JS 4.x · Compact 0.23

**All Midnight version numbers live in one file: [`src/lib/midnight-matrix.ts`](src/lib/midnight-matrix.ts).** It mirrors the official [support matrix](https://docs.midnight.network/relnotes/support-matrix), which Midnight Dev Rel treats as the source of truth. Prompts, setup guides, the standalone stack, and the contract JSON files all read from it. When the matrix moves, edit that file — never hardcode a version anywhere else.

Current snapshot (`snapshotDate` in that file):

| Component | Version |
| --- | --- |
| Compact language / toolchain | 0.23 / 0.31.1 |
| Compact devtools / runtime | 0.5.1 / 0.16.0 |
| midnight-js | 4.1.1 |
| testkit-js | 4.1.1 |
| dapp-connector-api | 4.0.1 |
| wallet-sdk | 1.2.0 |
| Indexer | 4.3.3 |
| Proof server | 8.1.0 (local stack: 8.0.3) |
| ledger-v8 | 8.1.0 |
| Node (preview / preprod / mainnet) | 1.0.1 / 1.0.0 / 1.0.0 |

Node.js runtime: use **Node 22 or 24**. Node 23 and 26 fail on the SDK's ESM exports.

---

## Quickstart

Browsing the site needs no wallet, no Docker, and no secrets — the contract addresses are read from committed JSON.

```bash
bun install
bun run dev        # http://localhost:8080
```

Other scripts:

| Command | What it does |
| --- | --- |
| `bun run dev` | Dev server with HMR on port 8080 |
| `bun run build` | Production build |
| `bun run build:dev` | Development-mode build (used for prerender checks) |
| `bun run preview` | Serve the production build locally |
| `bun run lint` | ESLint |
| `bun run format` | Prettier write |

Prerequisites for the *building* parts (not for browsing):

- **Bun** ≥ 1.1 — macOS/Linux: `curl -fsSL https://bun.sh/install | bash` · Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`
- **Docker Desktop** (proof server, local Undeployed stack)
- **Lace** browser extension, switched to a Midnight network

---

## Wallet and funding

Full walkthrough with screenshots: [`/wallet`](https://midnightprompts.lovable.app/wallet).

Key facts that trip everyone up:

1. A Midnight wallet has **two** addresses. The faucet only accepts the **unshielded** one (`mn_addr_preview1…` / `mn_addr_preprod1…`). Pasting the shielded address (`mn_shield-addr_…`) returns "Provided address is invalid".
2. The faucet dispenses **tNIGHT**. Deploys spend **tDUST**. Converting one to the other (delegation) is a Lace UI action — click **Generate tDUST** and wait for the tank to show a non-zero balance. There is no public SDK method for it in the current release train; the programmatic equivalent (registering NIGHT UTXOs for DUST generation) is demonstrated in [`scripts/dust-demo-preprod.mjs`](scripts/dust-demo-preprod.mjs).
3. **NIGHT is unshielded and DUST is non-transferable.** Design your token flows accordingly — mimic tokens (e.g. MidnightUSDC) exist for exactly this reason.

Faucets: [Preview](https://midnight-tmnight-preview.nethermind.dev/) · [Preprod](https://midnight-tmnight-preprod.nethermind.dev/)

### Getting your addresses without Lace

Never paste recovery words into chat, screenshots, or a browser form. Keep the mnemonic in `.midnight-wallet.local` (mode `0600`, gitignored) or pass it for one command only.

**macOS/Linux:**
```bash
chmod 600 .midnight-wallet.local

# derive both addresses offline
bun scripts/derive-unshielded-address.mjs --network=preview

# verify the SDK sees the same wallet Lace shows
MIDNIGHT_WALLET_SEED="your words stay local" \
  bun scripts/check-midnight-wallet.mjs --network=preview
```

**Windows (PowerShell):**
```powershell
icacls .midnight-wallet.local /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
bun scripts/derive-unshielded-address.mjs --network=preview
```

The printed shielded + unshielded addresses must match Lace exactly, and for Preview must start with `mn_shield-addr_preview1…` / `mn_addr_preview1…`. If you see `…test1…`, do not fund or deploy yet.

Seed derivation uses `WalletSeeds.fromMnemonic` (testkit-js + wallet-sdk-hd) — the same HD path Lace uses. `midnight-wallet-cli` is the recommended route for a plain seed → bech32 conversion.

---

## Proof server

The proof server is distributed only as a Docker image. Start it once per machine; the container persists across restarts.

**macOS/Linux:**
```bash
docker start midnight-proof-server 2>/dev/null || \
  docker run -d --name midnight-proof-server -p 6300:6300 \
    midnightntwrk/proof-server:latest midnight-proof-server -v
curl http://localhost:6300/health
```

**Windows (PowerShell or Windows Terminal — not `cmd.exe`):**
```powershell
docker start midnight-proof-server
if ($LASTEXITCODE -ne 0) {
  docker run -d --name midnight-proof-server -p 6300:6300 `
    midnightntwrk/proof-server:latest midnight-proof-server -v
}
curl.exe http://localhost:6300/health
```

> Use `curl.exe` explicitly on Windows — PowerShell's `curl` is an alias for `Invoke-WebRequest` and returns a different shape.

Expect `{"status":"ok",...}`.

Windows specifics: install Docker Desktop with the **WSL 2 backend**, accept the kernel update prompt on first launch, and wait for the tray icon to report "Docker Desktop is running" before deploying.

### Cheatsheet

| Task | Command |
| --- | --- |
| Check it's running | `docker ps` |
| Health check | `curl http://localhost:6300/health` (Windows: `curl.exe …`) |
| Tail logs | `docker logs -f midnight-proof-server` |
| Stop | `docker stop midnight-proof-server` |
| Resume | `docker start midnight-proof-server` |

First proof after container boot takes 30–120 s; later proofs are seconds.

### No-Docker alternative

If Docker/WSL2 is a dead end on your machine, [EffectStream](https://github.com/effectstream/effectstream) can host the proving/runtime pieces instead. See [`/proof-server`](https://midnightprompts.lovable.app/proof-server) and [`/undeployed`](https://midnightprompts.lovable.app/undeployed).

---

## Deploying contracts

Contracts live in [`contracts/`](contracts):

| File | Role |
| --- | --- |
| `TimestampLog.compact` | Append-only timestamp log — the original demo |
| `MoveBoard.compact` | Public board (bboard pattern), the "no custom logic needed" demo |
| `MandateVault.compact` | AP2-style mandate vault for agentic payments |
| `OrderLedger.compact` | Order/settlement ledger for UCP and x402 flows |
| `MidnightUSDC.compact` | mUSDC mimic token (Midnight is not EVM-compatible; native USDC does not exist) |

Compiled ZK artifacts live under `contracts/managed/<contract>/` and are committed, so you can deploy without installing the Compact toolchain. Recompile only if you edited a `.compact` file:

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc && compact update
compact compile contracts/TimestampLog.compact contracts/managed/timestamp-log
```

### One script, two axes

[`scripts/deploy-midnight.mjs`](scripts/deploy-midnight.mjs) is selected by two env vars:

```bash
# TimestampLog on preview (defaults) → src/data/midnight-contract.preview.json
bun scripts/deploy-midnight.mjs

# TimestampLog on preprod            → src/data/midnight-contract.preprod.json
VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs

# MoveBoard on the local stack       → src/data/moveboard-contract.undeployed.json
MIDNIGHT_CONTRACT=move-board VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
```

| Env var | Default | Values |
| --- | --- | --- |
| `MIDNIGHT_CONTRACT` | `timestamp-log` | `timestamp-log`, `move-board` |
| `VITE_NETWORK_ID` | `preview` | `preview`, `preprod`, `undeployed`, `mainnet` |
| `VITE_PROOF_SERVER_URL` | `http://localhost:6300` | any reachable proof server |
| `VITE_INDEXER_URL` / `VITE_INDEXER_WS_URL` | per-network | override the Indexer |
| `VITE_NODE_RPC` | per-network | override the node RPC |
| `MIDNIGHT_WALLET_SEED` | — | mnemonic held in the shell only (not written to disk) |
| `MIDNIGHT_ALLOW_ZERO_DUST` | — | `1` to skip the balance guard |
| `MIDNIGHT_FORCE_DEPLOY` | — | `1` to redeploy over an existing address |

What the script does: reload the mnemonic → sync against the Indexer and check tDUST ≥ 1 → load the compiled keys + zkir → `deployContract` (30–120 s for a `k=14` circuit) → write `address`, `deployTx`, `deployedAt` into the matching `src/data/*-contract.<network>.json` → poll the Indexer up to 90 s until `contractAction(address).state` is non-null, then set `verified: true` → print the explorer URL.

Commit the updated JSON — that is what the showcase pages hydrate from.

### What "verified" means on Midnight

There is no Etherscan-style source verifier. Two things stand in for it:

- The ZK verifier keys in `contracts/managed/<contract>/keys/*.verifier` are baked into on-chain state at deploy time. The network rejects any transaction that doesn't prove under those exact keys — verification is enforced by the chain, not by a separate step.
- Off-chain, the deploy script confirms `contractAction(address).state` decodes under the compiled ledger schema. That's the closest equivalent to a "verified source" badge.

The full reference walkthrough is in [`scripts/deploy-midnight.README.md`](scripts/deploy-midnight.README.md).

---

## Local Undeployed stack

Recommended for hackathon work: no faucet queues, no testnet resets, instant blocks.

```bash
bun scripts/midnight-standalone.mjs up      # pull + start + wait for readiness
bun scripts/midnight-standalone.mjs status  # container + endpoint health
bun scripts/midnight-standalone.mjs logs    # or: logs node | indexer | proof-server
bun scripts/midnight-standalone.mjs down    # stop + remove
```

It writes a compose file into `.midnight/` and pins the node/indexer/proof-server images from `midnight-matrix.ts` (`localStack`). Endpoints:

| Service | Endpoint |
| --- | --- |
| Node RPC | `ws://localhost:9944` |
| Indexer (HTTP) | `http://localhost:8088/api/v4/graphql` |
| Indexer (WS) | `ws://localhost:8088/api/v4/graphql/ws` |
| Proof server | `http://localhost:6300` |

Point Lace at the local node with a custom network, then walk [`/undeployed-preflight`](https://midnightprompts.lovable.app/undeployed-preflight) before your first deploy. For a shared/HTTPS deployment of the same stack, see the Fly.io section on [`/undeployed`](https://midnightprompts.lovable.app/undeployed).

---

## Scripts reference

| Script | Purpose |
| --- | --- |
| `scripts/deploy-midnight.mjs` | Deploy a Compact contract to any target and write the address JSON |
| `scripts/midnight-standalone.mjs` | Up/down/status/logs for the local node + indexer + proof server |
| `scripts/check-midnight-wallet.mjs` | Print derived addresses and balances for a seed; sanity-check against Lace |
| `scripts/derive-unshielded-address.mjs` | Derive shielded + unshielded addresses offline (no Lace, no network) |
| `scripts/generate-midnight-wallet.mjs` | Create a fresh mnemonic into `.midnight-wallet.local` (0600) |
| `scripts/dust-demo-preprod.mjs` | Register NIGHT UTXOs for DUST generation programmatically (preprod) |
| `scripts/build-llms-full.mjs` | Stream-generate `llms-core.txt`, per-combo prompt bundles, and the multi-GB `llms-full.txt` |
| `scripts/generate-agentic-ideas.py` | Distribute the 1,000 A2A/AP2/UCP/x402 ideas into the theme JSON files |
| `scripts/rewrite_mega_prompts.py` | Bulk edit of prompt text across the idea corpus |
| `scripts/append_wallet_boilerplate.py` | Append the Lace connect boilerplate to prompts |
| `scripts/deploy-midnight.README.md` | Long-form deploy reference |

---

## Repo layout

```text
contracts/
  TimestampLog.compact  MoveBoard.compact  MandateVault.compact
  OrderLedger.compact   MidnightUSDC.compact
  managed/<contract>/            compiled contract + keys + zkir (committed)
scripts/                         deploy, wallet, local stack, bundle generators
public/
  skills/lovable-midnight/SKILL.md   the downloadable Lovable skill
  llms-core.txt                      small always-committed digest
  llms-full.meta.json                sizes + counts + generatedAt
  llms-*.txt.asset.json              CDN pointers for the large bundles
src/
  routes/                        file-based routes (see routes/README.md)
  components/                    site shell, wallet panel, deploy status, docker guide
  data/
    ideas/<theme>.json           the 1,996 ideas, one file per discipline
    ideas.ts                     loader, theme index, NetworkVariant union
    midnight-contract.*.json     TimestampLog deploy records per network
    moveboard-contract.*.json    MoveBoard deploy records per network
    llms-content.ts              site header + guides used by the bundles
  lib/
    midnight-matrix.ts           SINGLE SOURCE for all Midnight versions
    mega-prompt-variants.ts      the prompt generator (network × OS × overlay)
    use-midnight-wallet.ts       Lace connect / network-agnostic wallet hook
  content/blog/                  markdown posts
```

---

## LLM bundles and the Lovable skill

`bun run scripts/build-llms-full.mjs` regenerates every download offered on [`/llms`](https://midnightprompts.lovable.app/llms):

- `llms-core.txt` — small digest of the site (committed).
- `llms-prompts-<network>-<os>.txt` — one bundle per combination (roughly 160–205 MB each).
- `llms-full.txt` — everything, currently ~2.5 GB across 31,936 variants (includes the hidden mainnet tab).
- `llms-full.meta.json` — `generatedAt`, `ideaCount`, `variantCount`, and per-bundle byte sizes; the `/llms` page renders straight from this.

The generator uses **streaming writes** — building the full bundle in memory OOMs. The `.txt` outputs are **not committed**: they are uploaded as CDN assets and only the small `*.asset.json` pointers live in git. That keeps the repo cloneable while the downloads stay multi-gigabyte.

**The Lovable Midnight skill** is [`public/skills/lovable-midnight/SKILL.md`](public/skills/lovable-midnight/SKILL.md) (drafted at `.agents/skills/lovable-midnight/SKILL.md`). Download it from `/llms` and install it in your own Lovable workspace to get the same Midnight rules — contract topology, insert-only ledgers, wallet lifecycle, agentic-commerce overlays, mobile rules — applied to your builds automatically.

---

## Hard-won ops lessons

Distilled from real builds (StreetRail/zealymidnight, flymidnight, mobilemidnight, ChoreoCrowd Fund, m402). Full detail with reproduction steps on [`/known-issues`](https://midnightprompts.lovable.app/known-issues) and in the skill.

| Lesson | Why it matters |
| --- | --- |
| **Public maps are insert-only** | Overwriting a key in a public `Map` triggers a `feesWithMargin` panic on Undeployed. Model token balances as a fold over an append-only `credits` map. |
| **One wallet provider per request** | Share a wallet across concurrent requests and LevelDB locks (`LEVEL_LOCKED`); always `stop()` in a `finally`. |
| **Serialize submits** | Concurrent wallet writes produce `InvalidDustSpendProof` (error 170). Queue transaction submissions. |
| **`signRecipe` on NIGHT-touching circuits** | Skipping it yields `InputsSignaturesLengthMismatch` (error 192). |
| **Cache wallet sync state** | Serializing sub-wallet state and sharing one `txHistoryStorage` cut cold start from 687 s to 54 s (12.8×). |
| **RpcError 117 / 104 / 196** | Usually stale local state: wipe `midnight-level-db`, recreate containers, full redeploy — in that order. |
| **32-byte Compact limits** | Witness domain separators and string fields are capped; long identifiers fail at compile or runtime. |
| **Node 22 or 24 only** | Node 23/26 break on the SDK's ESM export maps. |
| **Be honest about cost** | A private payment is ~23–25 s end to end: ~1.4 s proving, ~22.5 s submission, ~1.5 s chain. Show that in your UI instead of a spinner that looks broken. |
| **Reserved words** | `list` is reserved in Compact — name the circuit `listSale`, etc. |
| **Humanize RPC errors** | Raw `RpcError` codes read as "the app is broken". Map them to plain sentences. |

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `tDUST balance: 0` | Skipped "Generate tDUST" in Lace, or delegation hasn't settled | Click Generate tDUST, wait ~60 s, re-run |
| `ECONNREFUSED 127.0.0.1:6300` | Proof server not running | Start the container ([Proof server](#proof-server)) |
| `Cannot connect to the Docker daemon` | Docker Desktop closed (macOS/Linux) | Launch Docker Desktop, retry |
| `error during connect: … docker_engine: The system cannot find the file specified` | Docker Desktop not started or WSL 2 backend not ready (Windows) | Open Docker Desktop, wait for green status, retry |
| `insufficient funds` mid-deploy | tNIGHT → tDUST conversion incomplete | Wait 60 s, retry |
| Proving hangs > 3 min | First cold proof after container boot | Normal once; watch `docker logs -f midnight-proof-server` |
| `no zk keys for circuit …` | `compact compile` never ran, or `contracts/managed/<contract>/` is missing | Recompile the contract |
| `Cannot find module @midnight-ntwrk/…` | Deps not installed | `bun install` |
| Faucet: "Provided address is invalid" | Pasted the shielded address | Use the unshielded `mn_addr_…` address |
| Error 192 `InputsSignaturesLengthMismatch` | Missing `signRecipe` on a NIGHT-touching circuit | Add `signRecipe` before submit |
| Error 170 `InvalidDustSpendProof` | Concurrent wallet writes | Serialize submissions |
| `LEVEL_LOCKED` | Two wallet instances on one LevelDB dir | One provider per request, `stop()` in `finally` |
| `RpcError 117 / 104 / 196` | Stale local chain state | Wipe `midnight-level-db`, recreate containers, full redeploy |
| Sync never completes | Dead sync fibre | Restart the wallet with a fresh cached state; see `/known-issues` |
| Node crashes on import | Node 23 or 26 | Switch to Node 22 or 24 |

---

## Contributing

- Version numbers: edit [`src/lib/midnight-matrix.ts`](src/lib/midnight-matrix.ts) only.
- Prompt content: edit [`src/lib/mega-prompt-variants.ts`](src/lib/mega-prompt-variants.ts), then regenerate bundles with `bun run scripts/build-llms-full.mjs` and refresh `public/llms-full.meta.json`.
- Ideas: edit `src/data/ideas/<theme>.json`; the agentic overlays are produced by `scripts/generate-agentic-ideas.py`.
- New ops lesson: add it to `/known-issues`, the skill (`public/skills/lovable-midnight/SKILL.md`), and the relevant prompt block — all three, or the corpus drifts.
- Routes: file-based, one file per route, no `src/pages/`. Every content route needs its own `head()` metadata.
- Before pushing: `bun run lint` and `bun run build`.
- Never commit `.midnight-wallet.local`, `.midnight-witness.local`, seeds, or generated `.txt` bundles.

---

## Credits

Built with [Lovable](https://lovable.dev) for the **Creative AI & Quantum Hackathon** by **StreetKode Fam** during **Indian Krump Festival 14**. Contract runtime by [Midnight Network](https://midnight.network); wallet by [Lace](https://www.lace.io). Every Compact contract deployed from these prompts carries the hackathon credit as a header comment, so provenance lives alongside the ZK verifying key.

Reference builds whose lessons are baked into the prompts and the skill: [zealymidnight / StreetRail](https://github.com/arunnadarasa/zealymidnight), [flymidnight](https://github.com/arunnadarasa/flymidnight), [mobilemidnight](https://github.com/arunnadarasa/mobilemidnight), [midnightfireside](https://github.com/arunnadarasa/midnightfireside), [m402](https://github.com/julianariel/m402), [EffectStream](https://github.com/effectstream/effectstream), [Kuira Android SDK](https://github.com/kuiralabs/kuira-sdk-android).
