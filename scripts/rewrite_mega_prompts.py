#!/usr/bin/env python3
"""Rewrite every idea's megaPrompt for the Midnight ZK blockchain pivot.

Pure-Python, deterministic, idempotent. No API calls.

- Remaps legacy Ethereum hook IDs to Midnight primitives:
    sepolia-deploy   -> compact-deploy
    ipfs-pinata      -> ipfs-content
    privy-social     -> lace-wallet
    nft-provenance   -> private-witness
- Updates quantumHook / quantumTag / quantumHookId / quantumRationale.
- Rewrites megaPrompt with a Compact contract + MidnightJS + Lace + ProofServer recipe.

Sources: docs.midnight.network/llms-full.txt (Compact 0.23, SDK 4.1.1, Proof Server 8.1.0).
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = {h["id"]: h for h in json.loads((DATA / "hooks.json").read_text())}

CREDIT = ("Built during the Creative AI & Quantum Hackathon organised by "
          "StreetKode Fam during Indian Krump Festival 14")

# Legacy hook id -> new Midnight hook id
HOOK_REMAP = {
    "sepolia-deploy":  "compact-deploy",
    "ipfs-pinata":     "ipfs-content",
    "privy-social":    "lace-wallet",
    "nft-provenance":  "private-witness",
    # already-migrated ids stay put
    "compact-deploy":  "compact-deploy",
    "ipfs-content":    "ipfs-content",
    "lace-wallet":     "lace-wallet",
    "private-witness": "private-witness",
}

NETWORK_LABELS = {
    "preview":    "Preview testnet",
    "preprod":    "Preprod testnet (closer to mainnet)",
    "undeployed": "Undeployed / local standalone stack (no faucet needed)",
}

NETWORK_SECRETS = {
    "preview": """REQUIRED SECRETS (Lovable → Project Settings → Secrets) — **PREVIEW** target:
- VITE_NETWORK_ID           preview
- VITE_INDEXER_URL          https://indexer.preview.midnight.network/api/v4/graphql
- VITE_INDEXER_WS_URL       wss://indexer.preview.midnight.network/api/v4/graphql/ws
- VITE_PROOF_SERVER_URL     http://localhost:6300   (run `docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`)
- VITE_DEFAULT_CONTRACT     hex address printed by your first deploy — paste it here so users skip the deploy step

Faucet:   https://midnight-tmnight-preview.nethermind.dev/  (dispenses tNIGHT — click "Generate tDUST" in Lace to delegate)
Explorer: https://preview.midnightexplorer.com/
Notes:    Preview is the fastest network to demo on but resets frequently. Best for iterative dev + hackathon judges.""",

    "preprod": """REQUIRED SECRETS (Lovable → Project Settings → Secrets) — **PREPROD** target:
- VITE_NETWORK_ID           preprod
- VITE_INDEXER_URL          https://indexer.preprod.midnight.network/api/v4/graphql
- VITE_INDEXER_WS_URL       wss://indexer.preprod.midnight.network/api/v4/graphql/ws
- VITE_PROOF_SERVER_URL     http://localhost:6300   (run `docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`)
- VITE_DEFAULT_CONTRACT     hex address printed by your first deploy — paste it here so users skip the deploy step

Faucet:   https://midnight-tmnight-preprod.nethermind.dev/  (dispenses tNIGHT — click "Generate tDUST" in Lace to delegate)
Explorer: https://preprod.midnightexplorer.com/
Notes:    Preprod is closer to mainnet parameters but has known DUST-sync and ZKIR 0.31 quirks. If your
          demo stalls at "Balancing…", switch to the Undeployed local stack variant of this prompt.""",

    "undeployed": """REQUIRED SECRETS (Lovable → Project Settings → Secrets) — **UNDEPLOYED / LOCAL** target:
- VITE_NETWORK_ID           undeployed
- VITE_INDEXER_URL          http://localhost:8088/api/v4/graphql
- VITE_INDEXER_WS_URL       ws://localhost:8088/api/v4/graphql/ws
- VITE_PROOF_SERVER_URL     http://localhost:6300
- VITE_NODE_WS              ws://localhost:9944
- VITE_DEFAULT_CONTRACT     hex address printed by your local deploy

No faucet needed — the local node mints unlimited tDUST to the genesis wallet.
Explorer: not applicable (chain is local); browse state via the local Indexer GraphQL.
Notes:    This is the **DevRel-advised** path for hackathon work. It bypasses every Preprod
          tDUST-sync + `/check 400` ZKIR issue by pinning the SDK and node to the same version.""",
}

# Backwards-compat alias — some legacy body helpers reference `SECRETS`
SECRETS = NETWORK_SECRETS["preview"]

def local_stack_setup() -> str:
    """OS-specific bring-up instructions for the standalone local Midnight stack."""
    return """LOCAL STACK SETUP (Undeployed variant only — humans run this in a terminal, NOT Lovable):

The `undeployed` target expects a full Midnight standalone stack (node + indexer + proof server)
running on your own machine. All three services are Docker containers.

--- One-command bring-up (all OSes, after Docker is running) ---
```bash
bun scripts/midnight-standalone.mjs up      # pull + start + wait for ready
bun scripts/midnight-standalone.mjs status  # check health
bun scripts/midnight-standalone.mjs down    # stop
```
The `up` command writes `.midnight/standalone.docker-compose.yml`, pulls pinned node / indexer /
proof-server images, starts the three services, and polls readiness on ws://localhost:9944,
http://localhost:8088/api/v4/graphql, and http://localhost:6300/health. First run pulls ~1 GB
and takes 2-5 min; later boots are seconds.

Then verify in the browser: navigate to `/undeployed-preflight` in the app. Four green pills = ready.

For a human-readable walkthrough with copy buttons, also see:
https://midnightprompts.lovable.app/undeployed

--- Docker prerequisites per OS ---

macOS:
```bash
brew install --cask docker      # or download from docker.com/products/docker-desktop
open -a Docker                  # wait for whale icon in menu bar
```

Windows (WSL2):
```powershell
wsl --install                   # then reboot
# Install Docker Desktop, enable "Use the WSL 2 based engine" + Ubuntu integration.
# Run `bun scripts/midnight-standalone.mjs up` from INSIDE the WSL2 Ubuntu shell so
# localhost port forwarding to the browser works.
```

Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER" && newgrp docker
```
For Fedora/Arch swap `apt install` for `dnf install docker docker-compose-plugin` or
`pacman -S docker docker-compose`.

--- Point Lace at the local node (all OSes) ---
Lace -> Settings -> Network -> Custom -> RPC = `ws://localhost:9944` -> Save -> Switch.
The genesis wallet is pre-funded with unlimited tDUST -- no faucet click, no delegation step.

--- Deploy the Compact contract (all OSes) ---
```bash
# after `compact compile` produced contracts/managed/<name>/
VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
# -> prints contract hex address; paste into VITE_DEFAULT_CONTRACT
```

Full troubleshooting: see the `midnight-environment-setup` skill
(https://midnight-skills.netlify.app/skills/midnight-environment-setup) -- it covers
Docker Desktop failing to start, port 6300 conflicts, WSL2 clock drift, and Lace network
switching."""

BUDGET = """5-CREDIT BUDGET (HARD LIMIT):
- ONE single-page Vite + React app. No router, no Lovable Cloud, no database, no server-side auth.
- ONE Compact contract, ≤80 lines, deployed to Midnight preview testnet.
- Lace wallet is the auth + tx layer. `window.midnight` is polled; the shielded address is the identity.
- A locally-run proof server (Docker port 6300) is REQUIRED for any tx submit; the UI must show a
  "Proving… this can take 30–120s" state and stay usable while proofs generate.
- Pinata / IPFS only if the idea genuinely stores a file or artefact — then the CID is committed on-chain.
- At most ONE AI call per user action (Lovable AI Gateway with LOVABLE_API_KEY if AI is part of the idea).
- Skip tests, skip CI, skip docs pages. Ship the demo, nothing else."""

def safe_name(title: str, fallback: str) -> str:
    return re.sub(r"[^A-Za-z0-9]", "", title)[:36] or fallback

def snake(title: str, fallback: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")[:40]
    return s or fallback

# ---------------------------------------------------------------- Compact snippets

def compact_log(title: str, pitch: str) -> str:
    """A minimal Compact contract: public counter + last message + author commitment via witness."""
    n = safe_name(title, "TimestampLog")
    return f"""// contracts/{n}.compact
// {pitch}
// {CREDIT}
pragma language_version 0.23;

import CompactStandardLibrary;

// Public ledger state — visible to everyone via the Indexer
export ledger entry_count: Counter;
export ledger last_message: Opaque<"string">;
export ledger last_author_commitment: Bytes<32>;

// Private callback wired from TypeScript; the returned bytes never touch chain
witness localSecretKey(): Bytes<32>;

constructor() {{
  entry_count.increment(1);
  last_message = disclose("(empty)");
}}

export circuit authorCommitment(sk: Bytes<32>, seq: Bytes<32>): Bytes<32> {{
  return persistentHash<Vector<3, Bytes<32>>>(
    [pad(32, "{snake(title,'log')}:author:"), seq, sk]
  );
}}

export circuit appendEntry(newMessage: Opaque<"string">): [] {{
  const sk = localSecretKey();
  const seq = entry_count as Field as Bytes<32>;
  last_author_commitment = disclose(authorCommitment(sk, seq));
  last_message = disclose(newMessage);      // disclose is REQUIRED before writing to ledger
  entry_count.increment(1);
}}"""

def compact_witness(title: str, pitch: str) -> str:
    """Private-witness variant: an assert-only circuit that proves ownership without revealing sk."""
    n = safe_name(title, "PrivateProof")
    return f"""// contracts/{n}.compact
// {pitch}  (private-witness pattern)
// {CREDIT}
pragma language_version 0.23;

import CompactStandardLibrary;

export ledger enrolled_commitments: Set<Bytes<32>>;   // public: which commitments are valid
export ledger last_action_count: Counter;

witness localSecretKey(): Bytes<32>;

constructor() {{ last_action_count.increment(1); }}

export circuit enroll(commitmentTag: Bytes<32>): [] {{
  const sk = localSecretKey();
  const c = persistentHash<Vector<2, Bytes<32>>>([commitmentTag, sk]);
  enrolled_commitments.insert(disclose(c));            // sk stays local; only c goes public
}}

export circuit proveOwnership(commitmentTag: Bytes<32>): [] {{
  const sk = localSecretKey();
  const c = persistentHash<Vector<2, Bytes<32>>>([commitmentTag, sk]);
  assert(enrolled_commitments.member(c), "not enrolled");
  last_action_count.increment(1);
}}"""

def compact_ipfs(title: str, pitch: str) -> str:
    """IPFS-CID commit variant."""
    n = safe_name(title, "CIDLedger")
    return f"""// contracts/{n}.compact
// {pitch}  (pin-to-IPFS-then-commit-CID pattern)
// {CREDIT}
pragma language_version 0.23;

import CompactStandardLibrary;

export ledger cid_count: Counter;
export ledger last_cid: Opaque<"string">;
export ledger last_author_commitment: Bytes<32>;

witness localSecretKey(): Bytes<32>;

constructor() {{ cid_count.increment(1); last_cid = disclose("(empty)"); }}

export circuit commitCid(cid: Opaque<"string">): [] {{
  const sk = localSecretKey();
  const seq = cid_count as Field as Bytes<32>;
  last_author_commitment = disclose(
    persistentHash<Vector<3, Bytes<32>>>([pad(32, "cid:author:"), seq, sk])
  );
  last_cid = disclose(cid);
  cid_count.increment(1);
}}"""

# ---------------------------------------------------------------- MidnightJS boilerplate reused in every prompt

MIDNIGHTJS_BOOT = """WALLET DETECT (src/lib/lace.ts) — poll window.midnight up to 5s:
```ts
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import semver from 'semver';
export async function waitForLace(timeoutMs = 5000): Promise<InitialAPI> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      const m = (window as any).midnight ?? {};
      const w = Object.values(m).find((x: any) =>
        x && typeof x === 'object' && 'apiVersion' in x &&
        semver.satisfies(x.apiVersion, '4.x')) as InitialAPI | undefined;
      if (w) { clearInterval(t); resolve(w); return; }
      if (Date.now() - start > timeoutMs) { clearInterval(t);
        reject(new Error('Lace Midnight wallet not found. Install it: https://www.lace.io/')); }
    }, 100);
  });
}
```

BUFFER POLYFILL (src/main.tsx, MUST be the very first line):
```ts
import { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;
```

PROVIDERS (src/lib/providers.ts) — chain Lace + proof server + indexer:
```ts
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { waitForLace } from './lace';

export async function initProviders() {
  setNetworkId(import.meta.env.VITE_NETWORK_ID ?? 'preview');
  const lace = await waitForLace();
  const connectedAPI = await lace.connect(import.meta.env.VITE_NETWORK_ID ?? 'preview');
  const cfg = await connectedAPI.getConfiguration();
  const zk = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  return {
    connectedAPI,
    zkConfigProvider: zk,
    proofProvider: httpClientProofProvider(cfg.proverServerUri ?? import.meta.env.VITE_PROOF_SERVER_URL, zk),
    publicDataProvider: indexerPublicDataProvider(cfg.indexerUri, cfg.indexerWsUri),
  };
}
```

READ-ONLY LEDGER FETCH (no wallet needed — great for public feeds):
```ts
const INDEXER = import.meta.env.VITE_INDEXER_URL;
export async function readLedger(address: string) {
  const r = await fetch(INDEXER, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($a:HexEncoded!){ contractAction(address:$a){ state } }`,
      variables: { address },
    }),
  });
  return (await r.json()).data?.contractAction?.state as string | null;
}
```"""

VITE_CONFIG = """VITE CONFIG (vite.config.ts) — WASM + top-level await are MANDATORY for MidnightJS:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
export default defineConfig({
  build: { target: 'esnext', commonjsOptions: { transformMixedEsModules: true, extensions: ['.js','.cjs'] } },
  plugins: [react(), wasm(), topLevelAwait()],
  optimizeDeps: {
    esbuildOptions: { target: 'esnext', supported: { 'top-level-await': true } },
    include: ['@midnight-ntwrk/compact-runtime'],
    exclude: ['@midnight-ntwrk/onchain-runtime-v3',
              '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm'],
  },
});
```

SSR RULE: never import a `@midnight-ntwrk/*` package at module scope of a route file — it uses
Node Buffer + browser globals + WASM top-level await and crashes SSR. Load providers behind
`useEffect` or a dynamic `import()` inside a `<ClientOnly>` boundary."""

PACKAGES = """PACKAGES (all pinned to the versions Midnight ships together):
- @midnight-ntwrk/dapp-connector-api@4.0.1
- @midnight-ntwrk/midnight-js-contracts@4.1.1
- @midnight-ntwrk/midnight-js-types@4.1.1
- @midnight-ntwrk/midnight-js-protocol@4.1.1
- @midnight-ntwrk/midnight-js-network-id@4.1.1
- @midnight-ntwrk/midnight-js-fetch-zk-config-provider@4.1.1
- @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1
- @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1
- @midnight-ntwrk/midnight-js-utils@4.1.1
- @midnight-ntwrk/compact-runtime@0.16.0
- rxjs fp-ts semver buffer pino
- vite-plugin-wasm  vite-plugin-top-level-await  (dev)"""

TOOLCHAIN = """COMPACT TOOLCHAIN (one-time setup — the human runs this in a terminal, not Lovable):
```bash
curl --proto '=https' --tlsv1.2 -LsSf \\
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc && compact update
compact compile contracts/YourContract.compact contracts/managed/your-contract
cp -r contracts/managed/your-contract/keys public/keys
cp -r contracts/managed/your-contract/zkir public/zkir
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
```"""

REDFLAGS = """RED FLAGS — DO NOT ATTEMPT:
- No bridging to Ethereum / any EVM chain. Midnight is a standalone L1; there is no bridge.
- No oracle / external HTTP data inside a circuit. Circuits are bounded and cannot do I/O.
- No sub-second finality UX. Proofs for k=14 circuits take 30–120s — build for that latency.
- No recursion in Compact. Loops must be bounded by compile-time constants.
- No SSR. MidnightJS uses browser globals + WASM + top-level-await; ClientOnly is mandatory."""

# ---------------------------------------------------------------- Per-hook body

def body_compact_deploy(title, pitch, sub, contract):
    return f"""CONTRACT
```compact
{contract}
```

FRONTEND FLOW
1. Land on page → 'Connect Lace' button → poll `window.midnight` → `connect('preview')`.
2. Show shielded address, tDUST reminder ("Get testnet DUST → {{VITE_FAUCET_URL}}"), and Deploy button.
3. On Deploy: import `deployContract` from `@midnight-ntwrk/midnight-js-contracts`, pass witnesses
   ({{ localSecretKey: async () => sk }}) where `sk` is a 32-byte value persisted in localStorage.
4. Show a "Proving…" spinner for up to 120s while the local proof server crunches.
5. On success, render the deployed address + a Midnight explorer link and persist it to
   `src/data/midnight-contract.json` so the app boots straight into it next time.
6. The "{sub}" action calls `appendEntry(payload)` — same flow: prove, submit, refresh feed."""

def body_ipfs_content(title, pitch, sub, contract):
    return f"""PINATA STEP (src/lib/pinata.ts):
```ts
export async function pinToIPFS(file: Blob, name = "{sub}") {{
  const fd = new FormData(); fd.append("file", file, name);
  const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {{
    method: "POST", headers: {{ Authorization: `Bearer ${{import.meta.env.VITE_PINATA_JWT}}` }},
    body: fd,
  }});
  return (await r.json()).IpfsHash as string;
}}
```

CONTRACT
```compact
{contract}
```

FRONTEND FLOW
1. User creates a {sub} artefact in the UI (upload / draw / record / generate).
2. `const cid = await pinToIPFS(blob)` → show `https://gateway.pinata.cloud/ipfs/<cid>`.
3. `commitCid(cid)` via `findContractInstance(...).callTx.commitCid(witnesses, cid)`.
4. Proving spinner (30–120s) → confirmation → append `{{cid, tx, at}}` to the on-screen feed.
5. Feed is hydrated from the Indexer (`readLedger`), so refreshes work with just the wallet disconnected."""

def body_lace_wallet(title, pitch, sub, contract):
    return f"""CONTRACT
```compact
{contract}
```

FRONTEND FLOW — Lace is the whole auth story
1. Landing page shows one button: "Connect Lace". No email, no password, no OAuth.
2. On click: `initProviders()` → shielded address becomes the identity.
3. tDUST balance strip: `const bal = await connectedAPI.balanceAndProofOfBalance();` render it.
4. Every {sub} action = `contract.callTx.appendEntry(witnesses, payload)`. Show status:
   `Proving → Balancing (Lace adds tDUST fees) → Submitting → Confirmed` with a Midnight explorer link.
5. If `waitForLace` rejects, render the exact install URL for Lace with a friendly nudge —
   no fake "click here to install" placeholder. This is the single biggest onboarding drop-off."""

def body_private_witness(title, pitch, sub, contract):
    return f"""CONTRACT
```compact
{contract}
```

FRONTEND FLOW — the secret NEVER leaves the browser
1. On first visit, generate a 32-byte secret with `crypto.getRandomValues(new Uint8Array(32))`
   and persist it base64-encoded in localStorage. Warn users that clearing storage revokes proofs.
2. The witness callback returns that secret to the Compact circuit — it is used inside the ZK proof
   but never appears in the transaction that goes on chain.
3. "Enroll" action → `enroll(commitmentTag)` — commits `hash(tag, sk)` on chain.
4. "Prove {sub}" action → `proveOwnership(commitmentTag)` — the circuit asserts the commitment
   is in `enrolled_commitments` for THIS wallet's secret. UI shows a green "proved without revealing" chip.
5. Anyone reading the Indexer sees only commitments and a bumped counter — they cannot link
   two proofs to the same user because the secret never appeared on chain."""

BODY_BY_HOOK = {
    "compact-deploy":  (compact_log,     body_compact_deploy),
    "ipfs-content":    (compact_ipfs,    body_ipfs_content),
    "lace-wallet":     (compact_log,     body_lace_wallet),
    "private-witness": (compact_witness, body_private_witness),
}

# ---------------------------------------------------------------- prompt builder

def make_prompt(idea: dict, theme: dict, network: str = "preview") -> str:
    title = idea["title"]; pitch = idea["pitch"]; sub = idea["subDiscipline"]
    hid = idea.get("quantumHookId") or "compact-deploy"
    hook = HOOKS.get(hid) or HOOKS["compact-deploy"]
    hook_name = hook["name"]
    rationale = idea.get("quantumRationale") or f"This idea fits {hook_name} because it needs {hook['tag']}."

    contract_fn, body_fn = BODY_BY_HOOK.get(hid, BODY_BY_HOOK["compact-deploy"])
    contract = contract_fn(title, pitch)
    body = body_fn(title, pitch, sub, contract)

    net_label = NETWORK_LABELS.get(network, network)
    net_secrets = NETWORK_SECRETS.get(network, NETWORK_SECRETS["preview"])
    local_block = f"\n\n{local_stack_setup()}\n" if network == "undeployed" else ""

    return f"""Build "{title}" in ONE Lovable message. Single-page Midnight ZK demo.

TARGET NETWORK: **{net_label}** (VITE_NETWORK_ID = `{network}`)
This is one of three variants of the same idea — Preview / Preprod / Undeployed. Only the network
config, secrets, and (for Undeployed) local-stack setup differ. Contract + UI + Lace flow are identical.

CONCEPT
{pitch}
Discipline: {theme['name']} ({sub}).
Onchain primitive: {hook_name} ({hook['tag']}). Why this primitive: {rationale}

{BUDGET}

STACK
- React + Vite single page (index route only).
- Midnight {net_label}. Compact language 0.23. MidnightJS SDK 4.1.1.
- Lace wallet is the sole auth surface — no Privy, no MetaMask, no OAuth.
- Local proof server (Docker port 6300) does all ZK proving. The UI shows Proving state.
- No SSR. All MidnightJS imports live behind `<ClientOnly>` + `useEffect`.

{PACKAGES}

{TOOLCHAIN}
{local_block}
{VITE_CONFIG}

{MIDNIGHTJS_BOOT}

{body}

{REDFLAGS}

{net_secrets}

FURTHER REFERENCE (community skills registry — browsable, per-primitive scaffolds):
- Site:   https://midnight-skills.netlify.app
- Source: https://github.com/Kali-Decoder/Midnight-skills
- `compact`                    — Compact 0.23 language deep-dive, ledger vs witness, disclose(), Merkle patterns
- `react-wallet-connector`     — full DApp Connector API scaffold (enumerate window.midnight by UUID)
- `midnight-environment-setup` — Compact compiler + Docker + proof server bring-up
- `indexer`                    — public data provider + GraphQL patterns for read-only ledger views
- `example-locker-dapp`        — timelock vault reference (blockTimeGte, receive/sendUnshielded)
- `example-counter`            — smallest end-to-end Compact + MidnightJS reference
If the target Lovable session is on this workspace, those six are already active. Otherwise, drop
`.agents/skills/<name>/SKILL.md` into your project from the repo above and run `skills--apply_draft`.

CREDIT (must appear in UI footer AND as a header comment on every Compact contract):
{CREDIT}
"""

# ---------------------------------------------------------------- main

VARIANTS = ("preview", "preprod", "undeployed")

def main():
    total = 0
    for t in THEMES:
        p = DATA / f"{t['slug']}.json"
        doc = json.loads(p.read_text())
        for idea in doc["ideas"]:
            legacy = idea.get("quantumHookId", "compact-deploy")
            new_hid = HOOK_REMAP.get(legacy, "compact-deploy")
            new_hook = HOOKS[new_hid]
            idea["quantumHookId"] = new_hid
            idea["quantumHook"] = new_hook["name"]
            idea["quantumTag"] = new_hook["tag"]
            idea["quantumRationale"] = (
                f"This idea fits {new_hook['name']} because {new_hook['tag']} is exactly what "
                f"a {idea.get('subDiscipline','creative')} demo needs: {new_hook['kernel'][:120]}..."
            )
            variants = {net: make_prompt(idea, t, net) for net in VARIANTS}
            idea["megaPromptVariants"] = variants
            idea["megaPrompt"] = variants["preview"]  # backward-compat default
            total += 1
        p.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
        print(f"  {t['slug']}: {len(doc['ideas'])} × 3 variants rewritten")
    print(f"total ideas: {total} — total prompts: {total * 3}")

if __name__ == "__main__":
    main()
