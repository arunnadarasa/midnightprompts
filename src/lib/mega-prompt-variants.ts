// AUTO-GENERATED helper. Constants mirrored from scripts/rewrite_mega_prompts.py.
// If you change any block here, mirror the same edit in the Python script
// (or vice-versa) so regenerated JSON and runtime prompts stay in sync.

import type { Idea, Theme, NetworkVariant, Protocol } from "@/data/ideas";
import { MIDNIGHT_MATRIX, SUPPORT_MATRIX_URL } from "./midnight-matrix";

export type OSTarget = "macos" | "windows" | "linux";
export const OS_LABELS: Record<OSTarget, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
};

const MATRIX_PREAMBLE = `VERSION SOURCE OF TRUTH (paste this block at the top of every generated README and every setup panel):

The official Midnight Support Matrix is the source of truth for all versions used below:
${SUPPORT_MATRIX_URL}

Snapshot as of ${MIDNIGHT_MATRIX.snapshotDate}:
- Midnight Node: ${MIDNIGHT_MATRIX.node.preview} (Preview) / ${MIDNIGHT_MATRIX.node.preprod} (Preprod) / ${MIDNIGHT_MATRIX.node.mainnet} (Mainnet)
- Midnight Indexer: ${MIDNIGHT_MATRIX.indexer}
- Proof server (public networks): ${MIDNIGHT_MATRIX.proofServer}
- Midnight.js packages: ${MIDNIGHT_MATRIX.midnightJs}
- Wallet SDK: ${MIDNIGHT_MATRIX.walletSdk}
- DApp Connector API: ${MIDNIGHT_MATRIX.dappConnectorApi}
- testkit-js: ${MIDNIGHT_MATRIX.testkitJs}
- Compact toolchain: ${MIDNIGHT_MATRIX.compact.toolchain} (pragma language_version ${MIDNIGHT_MATRIX.compact.language})
- Compact runtime: ${MIDNIGHT_MATRIX.compact.runtime}
- On-chain runtime: ${MIDNIGHT_MATRIX.compact.onchainRuntime}
- Local Undeployed stack images: proof-server:${MIDNIGHT_MATRIX.localStack.proofServer}, midnight-node:${MIDNIGHT_MATRIX.localStack.node}, indexer-standalone:${MIDNIGHT_MATRIX.localStack.indexer}

If the matrix and this prompt disagree, the matrix wins. Re-check the matrix before installing any pinned package.`;

const CREDIT = "Built during the Creative AI & Quantum Hackathon organised by StreetKode Fam during Indian Krump Festival 14";

const BUDGET = "5-CREDIT BUDGET (HARD LIMIT):\n- ONE single-page Vite + React app. No router, no Lovable Cloud, no database, no server-side auth.\n- ONE Compact contract, \u226480 lines, deployed to Midnight preview testnet.\n- Lace wallet is the auth + tx layer. `window.midnight` is polled; the shielded address is the identity.\n- A locally-run proof server (Docker port 6300) is REQUIRED for any tx submit; the UI must show a\n  \"Proving\u2026 this can take 30\u2013120s\" state and stay usable while proofs generate.\n- Pinata / IPFS only if the idea genuinely stores a file or artefact \u2014 then the CID is committed on-chain.\n- At most ONE AI call per user action (Lovable AI Gateway with LOVABLE_API_KEY if AI is part of the idea).\n- Skip tests, skip CI, skip docs pages. Ship the demo, nothing else.";

const PACKAGES = "PACKAGES (all pinned to the Midnight Support Matrix row; re-check the matrix before installing):\n- @midnight-ntwrk/dapp-connector-api@4.0.1\n- @midnight-ntwrk/midnight-js-contracts@4.1.1\n- @midnight-ntwrk/midnight-js-types@4.1.1\n- @midnight-ntwrk/midnight-js-protocol@4.1.1\n- @midnight-ntwrk/midnight-js-network-id@4.1.1\n- @midnight-ntwrk/midnight-js-fetch-zk-config-provider@4.1.1\n- @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1\n- @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1\n- @midnight-ntwrk/midnight-js-utils@4.1.1\n- @midnight-ntwrk/compact-runtime@0.16.0\n- @midnight-ntwrk/wallet-sdk@1.2.0\n- @midnight-ntwrk/wallet-sdk-address-format@1.0.0 (pin to the wallet-sdk release)\n- @midnight-ntwrk/wallet-sdk-hd@3.1.0-beta.1 (pin to the wallet-sdk release)\n- @midnight-ntwrk/testkit-js@4.1.1 (for Node deploy / faucet scripts)\n- @midnight-ntwrk/ledger-v8@8.1.0\n- rxjs fp-ts semver buffer pino\n- vite-plugin-wasm  vite-plugin-top-level-await  (dev)";

const TOOLCHAIN_COMMON = "COMPACT TOOLCHAIN (one-time setup \u2014 the human runs this in a terminal, not Lovable):\n```bash\ncurl --proto '=https' --tlsv1.2 -LsSf \\\n  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh\nsource ~/.bashrc && compact update\ncompact compile contracts/YourContract.compact contracts/managed/your-contract\n# Bake artefact copy into `bun run compile` from day one \u2014 the browser drifts silently otherwise.\nmkdir -p public/contract && cp -r contracts/managed/your-contract/keys \\\n  contracts/managed/your-contract/zkir contracts/managed/your-contract/contract public/contract/\n# Proof server: PIN THE TAG. For public networks use the matrix tag (8.1.0); for local Undeployed use 8.0.3.\ndocker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v\n# Lifecycle:\n#   docker ps                                  \u2014 confirm 6300:6300 mapping\n#   docker logs -f <container>                 \u2014 tail proofs\n#   docker stop / docker start <container>     \u2014 pause / resume (image cached)\n# Gate: \"Cannot connect to the Docker daemon at unix:///var/run/docker.sock\"\n#       = Docker Desktop / colima is NOT started. Start it, wait for the whale icon, retry.\n```";

const TOOLCHAIN_BY_OS: Record<OSTarget, string> = {
  macos: `${TOOLCHAIN_COMMON}\n\nmacOS prerequisites (run BEFORE the block above):\n\`\`\`bash\n# Docker Desktop (Apple Silicon or Intel):\nbrew install --cask docker    # or download from docker.com/products/docker-desktop\nopen -a Docker                # wait for the whale icon in the menu bar to go steady\n# Node.js LTS (for bun scripts + npx):\nbrew install node             # or nvm install --lts\n\`\`\`\nApple Silicon note: proof-server image is multi-arch \u2014 no --platform flag needed. If Docker\nDesktop stalls at "Starting", quit + reopen; if that fails, reset to factory defaults from\nthe Troubleshoot menu. Copy-button walkthrough: https://midnightprompts.lovable.app/proof-server#docker-setup`,
  windows: `${TOOLCHAIN_COMMON}\n\nWindows prerequisites \u2014 three real blockers people actually hit; do these BEFORE the block above:\n\n  (1) Enable Virtualization in BIOS/UEFI.\n      Task Manager \u2192 Performance \u2192 CPU must show "Virtualization: Enabled". If Disabled,\n      shut down, tap Esc/F10 (HP) or F2/Del at boot, enable SVM Mode / AMD-V / Intel VT-x /\n      Virtualization Technology, save & exit. Without this, Docker Desktop's WSL2 backend cannot start.\n\n  (2) Enable Windows features + update WSL.\n      Win+R \u2192 \`optionalfeatures\` \u2192 tick Windows Subsystem for Linux, Virtual Machine Platform,\n      Windows Hypervisor Platform \u2192 OK \u2192 reboot. Then in PowerShell (Admin):\n      \`\`\`powershell\n      wsl --update\n      wsl --install\n      \`\`\`\n\n  (3) Install Node.js LTS + fix PowerShell execution policy.\n      Download Windows x64 LTS .msi from https://nodejs.org/download (keep "Add to PATH").\n      If \`npm install\` errors with "running scripts is disabled":\n      \`\`\`powershell\n      Set-ExecutionPolicy RemoteSigned -Scope CurrentUser\n      \`\`\`\n\nAfter those three: install Docker Desktop with "Use the WSL 2 based engine" + Ubuntu integration,\nthen run the toolchain commands ABOVE from INSIDE the WSL2 Ubuntu shell (not PowerShell) so\nlocalhost:6300 port forwarding to Windows browsers works. Full walkthrough with copy buttons:\nhttps://midnightprompts.lovable.app/proof-server#docker-setup`,
  linux: `${TOOLCHAIN_COMMON}\n\nLinux prerequisites (Ubuntu/Debian shown; adapt for your distro):\n\`\`\`bash\nsudo apt update\nsudo apt install -y docker.io docker-compose-plugin curl nodejs npm\nsudo systemctl enable --now docker\nsudo usermod -aG docker "$USER" && newgrp docker\n\`\`\`\nFedora: \`sudo dnf install docker docker-compose-plugin nodejs\`.\nArch:   \`sudo pacman -S docker docker-compose nodejs npm\`.\nVerify: \`docker run --rm hello-world\` should print the welcome banner without sudo.\nCopy-button walkthrough: https://midnightprompts.lovable.app/proof-server#docker-setup`,
};

const VITE_CONFIG = `VITE CONFIG (vite.config.ts) — WASM + top-level await are MANDATORY for MidnightJS.
Use the \`noDiscovery\` + explicit-include/exclude shape below. Do NOT put
\`@midnight-ntwrk/compact-runtime\` in \`include\` — dep-pre-bundling then crawls the WASM graph
and blocks the client entry for MINUTES on \`/.vite/deps/react.js\` (blank dev page).

\`\`\`ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import type { Plugin } from 'vite';

// On TanStack Start, restrict top-level-await to the CLIENT env — applied to the SSR
// bundle it crashes workerd with "Identifier '__tla' has already been declared".
function clientTopLevelAwait(): Plugin {
  return { ...topLevelAwait(), applyToEnvironment: (env) => env.name === 'client' };
}

export default defineConfig({
  build: { target: 'esnext', commonjsOptions: { transformMixedEsModules: true, defaultIsModuleExports: 'auto' } },
  plugins: [react(), wasm(), clientTopLevelAwait()],
  resolve: { conditions: ['browser', 'import', 'default'] },
  ssr:     { resolve: { conditions: ['browser', 'node', 'import', 'default'] } },
  optimizeDeps: {
    noDiscovery: true,
    esbuildOptions: { target: 'esnext', supported: { 'top-level-await': true } },
    include: [
      'react', 'react-dom', 'react-dom/client',
      'react/jsx-runtime', 'react/jsx-dev-runtime',
      'buffer', 'object-inspect', 'cross-fetch', '@subsquid/scale-codec',
    ],
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-node-zk-config-provider',
      '@midnight-ntwrk/midnight-js-level-private-state-provider',
      '@midnight-ntwrk/midnight-js-network-id',
      '@midnight-ntwrk/midnight-js-utils',
      '@midnight-ntwrk/wallet',
      '@midnight-ntwrk/wallet-sdk-hd',
    ],
  },
});
\`\`\`

SSR RULE: never import a \`@midnight-ntwrk/*\` package at module scope of a route file — it uses
Node Buffer + browser globals + WASM top-level await and crashes SSR. Load providers behind
\`useEffect\` or a dynamic \`import()\` inside a \`<ClientOnly>\` boundary.

TANSTACK START SSR STUB (Cloudflare Worker target) — MANDATORY when publishing. Keep nitro
ENABLED (do NOT set \`nitro: false\`; that splits SSR into chunks the Worker can't resolve).
Add a Vite plugin that swaps every \`@midnight-ntwrk/*\` import AND your client contract module
(e.g. \`src/lib/contract.ts\`) to inert stubs during the SSR pass — otherwise the SSR crawler
still walks the WASM graph even for \`ssr: false\` routes and dies with \`MISSING_EXPORT\`.

\`\`\`ts
import path from 'node:path';
function midnightSsrStub(): Plugin {
  const wasmStub     = path.resolve('src/lib/midnight-ssr-stub.ts');
  const contractStub = path.resolve('src/lib/contract.ssr-stub.ts');
  const contractReal = path.resolve('src/lib/contract.ts');
  return {
    name: 'midnight-ssr-stub', enforce: 'pre',
    async resolveId(id, importer, options) {
      if (!options?.ssr) return;
      if (id.startsWith('@midnight-ntwrk/')) return wasmStub;
      const resolved = await this.resolve(id, importer, { ...options, skipSelf: true });
      if (resolved && resolved.id === contractReal) return contractStub;
      return resolved;
    },
  };
}
// Add to plugins BEFORE react(): [midnightSsrStub(), react(), wasm(), clientTopLevelAwait()]
// Ship matching empty stubs: src/lib/midnight-ssr-stub.ts (\`export default {}\`) and
// src/lib/contract.ssr-stub.ts that re-exports inert stand-ins for every symbol the
// route imports (publishKit, decodeChainState, KitPayload, loadContractModule, etc.).
\`\`\``;

const MIDNIGHTJS_BOOT = "WALLET DETECT (src/lib/lace.ts) \u2014 poll window.midnight up to 5s:\n```ts\nimport type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';\nimport semver from 'semver';\nexport async function waitForLace(timeoutMs = 5000): Promise<InitialAPI> {\n  return new Promise((resolve, reject) => {\n    const start = Date.now();\n    const t = setInterval(() => {\n      const m = (window as any).midnight ?? {};\n      const w = Object.values(m).find((x: any) =>\n        x && typeof x === 'object' && 'apiVersion' in x &&\n        semver.satisfies(x.apiVersion, '4.x')) as InitialAPI | undefined;\n      if (w) { clearInterval(t); resolve(w); return; }\n      if (Date.now() - start > timeoutMs) { clearInterval(t);\n        reject(new Error('Lace Midnight wallet not found. Install it: https://www.lace.io/')); }\n    }, 100);\n  });\n}\n```\n\nBUFFER POLYFILL (src/main.tsx, MUST be the very first line):\n```ts\nimport { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;\n```\n\nPROVIDERS (src/lib/providers.ts) \u2014 chain Lace + proof server + indexer:\n```ts\nimport { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';\nimport { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';\nimport { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';\nimport { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';\nimport { waitForLace } from './lace';\n\nexport async function initProviders() {\n  setNetworkId(import.meta.env.VITE_NETWORK_ID ?? 'preview');\n  const lace = await waitForLace();\n  const connectedAPI = await lace.connect(import.meta.env.VITE_NETWORK_ID ?? 'preview');\n  const cfg = await connectedAPI.getConfiguration();\n  const zk = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));\n  return {\n    connectedAPI,\n    zkConfigProvider: zk,\n    proofProvider: httpClientProofProvider(cfg.proverServerUri ?? import.meta.env.VITE_PROOF_SERVER_URL, zk),\n    publicDataProvider: indexerPublicDataProvider(cfg.indexerUri, cfg.indexerWsUri),\n  };\n}\n```\n\nREAD-ONLY LEDGER FETCH (no wallet needed \u2014 great for public feeds):\n```ts\nconst INDEXER = import.meta.env.VITE_INDEXER_URL;\nexport async function readLedger(address: string) {\n  const r = await fetch(INDEXER, {\n    method: 'POST', headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      query: `query($a:HexEncoded!){ contractAction(address:$a){ state } }`,\n      variables: { address },\n    }),\n  });\n  return (await r.json()).data?.contractAction?.state as string | null;\n}\n```";

const SIGNING_STRATEGY = `SIGNING STRATEGY — Undeployed vs Preview/Preprod (hard-won lessons from Choreo Kits + ChoreoCrowd Fund):

Mental model — burn this in before writing a line of code:

\`\`\`text
Undeployed:  UI → POST /api/append-entry → genesis wallet (server) → chain
Other nets:  UI → LaceWalletProvider → Lace signs in browser → chain
Reads (all): fetchPublicContractLedger via indexer (no wallet needed)
\`\`\`

| Mode | Signing | UI wallet |
| --- | --- | --- |
| \`undeployed\` | **Server-side** genesis wallet via \`/api/append-entry\` (or \`/api/mint\`, name it after your circuit) | Lace optional / limited |
| \`preview\` / \`preprod\` | Lace \`publishKit\` / \`callTx\` in the browser | Full Lace flow |
| \`mainnet\` | Lace only — NEVER server-side | Full Lace flow, user-initiated |

**Lace CANNOT sign on Undeployed.** Per Midnight docs, Lace cannot balance/sign on the local
\`undeployed\` chain (only Preview/Preprod/Mainnet). Symptoms: ZK proof completes, Lace's "Prove
transaction" dialog spins forever OR submit fails with \`Unexpected error submitting scoped
transaction '<unnamed>': Error\` — even with tDUST funded.

Fix on Undeployed: route every write through a TanStack server route
(\`src/routes/api/append-entry.ts\` → \`src/lib/append-entry.server.ts\`) that reuses the same
\`WalletBuilder\` + genesis seed \`…0002\` as \`scripts/deploy-midnight.mjs\`. Cache the wallet +
providers in a module-scope \`ctxPromise\` so the first call warms them and subsequent calls are
fast. Frontend detects \`import.meta.env.VITE_NETWORK_ID === "undeployed"\` and POSTs
\`{ contractAddress, ...fields }\` to \`/api/append-entry\` instead of calling Lace. Skip the
Lace-connect and tDUST-balance guards on Undeployed entirely.

SHARED CONSTANTS — MUST stay identical across deploy script AND server-append route.
Mismatch = \`RpcError 1010: Invalid Transaction: Custom error: 117\` (see RED FLAGS below).

\`\`\`ts
// src/lib/midnight-shared.ts — import from BOTH deploy script and server route
export const GENESIS_SEED       = '0000000000000000000000000000000000000000000000000000000000000002';
export const PRIVATE_STATE_STORE = 'my-app-priv';   // pick one name, use it EVERYWHERE
\`\`\`

Then in \`scripts/deploy-midnight.mjs\` AND \`src/lib/append-entry.server.ts\`:

\`\`\`ts
import { GENESIS_SEED, PRIVATE_STATE_STORE } from '@/lib/midnight-shared';
initializeMidnightProviders({ privateStateStoreName: PRIVATE_STATE_STORE, /* … */ });
\`\`\`

Why: \`findDeployedContract\` reads/writes the deployer's signing key in a LevelDB store keyed by
\`privateStateStoreName\` + contract address. A mismatched store name → no key found → SDK samples
a FRESH signing key → on-chain contract authority does not match → chain rejects with error 117.
Debug tip: log the first/last 8 chars of \`deployed.deployTxData.private.signingKey\` on both
deploy and append; they must match byte-for-byte.

LEDGER READ CALL SHAPE — pass the INNER state, never the wrapper:

\`\`\`ts
// After getPublicStates():
const { contractState } = await getPublicStates(publicDataProvider, address);
const onChain = ledger(contractState.data);            // ← .data, not contractState

// Right after a successful callTx:
const onChain = ledger(result.public.nextContractState);
\`\`\`

Passing the raw \`ContractState\` wrapper throws \`expected instance of ChargedState\` from the
compiled contract helpers.

RECOVERY AFTER DOCKER RESET — the address in \`src/data/midnight-contract.undeployed.json\` is
invalidated with the chain state. Do this every time:

\`\`\`bash
bun run midnight:down
bun run midnight:up
bun run midnight:deploy       # refreshes midnight-contract.undeployed.json
# restart the dev server so it re-imports the JSON
\`\`\`

Also invalidate the server route's \`ctxPromise\` cache whenever the contract address changes
(re-read the JSON on each request, or re-init when \`address !== cachedAddress\`) — otherwise the
2nd+ append silently uses the previous contract and fails with error 117 or a stale-state error.

VITE optimizeDeps — the server-append path pulls Node-only deps transitively. Add them to
\`optimizeDeps.exclude\` in \`vite.config.ts\` or the dev server hangs on "Loading …":

\`\`\`ts
optimizeDeps: {
  exclude: [
    // … existing @midnight-ntwrk/* entries …
    '@midnight-ntwrk/testkit-js',
    'pino',
    'ws',
    'ssh2',
    'cpu-features',
  ],
}
\`\`\`

Cloudflare build: add \`src/lib/append-entry.server.ts\` → \`src/lib/append-entry.ssr-stub.ts\` to
the \`midnightSsrStub()\` swap list. The stub just returns 500 with a clear "dev-only" message —
the published Worker cannot reach the local Docker stack anyway. Gate the stub on
\`command === "build"\` so dev SSR still loads real Midnight libs for the API route.

UX NOTE — a disabled "Prove & submit" button is almost always empty form fields, not a wallet
bug. Show a tooltip on hover ("Fill in {project name} and {amount} to enable") so the user
doesn't chase a phantom Lace / tDUST problem.`;

const ASYNC_BUFFER_CLIENT_ENTRY = `ASYNC BUFFER CLIENT ENTRY (TanStack Start) — replaces the module-scope Buffer polyfill.

Vite dep pre-bundling crawls the heavy Midnight WASM graph and can hang the client entry for
minutes on \`/.vite/deps/react.js\` (blank dev page). Fix: a custom \`src/client.tsx\` that polyfills
Buffer ASYNCHRONOUSLY, AFTER the lightweight hydrate path is resolved. Module-scope
\`globalThis.Buffer = Buffer\` races hydration when the optimizer is still crawling.

\`\`\`tsx
// src/client.tsx
import { hydrateRoot } from 'react-dom/client';
import { Buffer } from 'buffer';

async function start() {
  (globalThis as any).Buffer = Buffer;
  const { StartClient } = await import('@tanstack/react-start/client');
  hydrateRoot(document, <StartClient />);
}

start();
\`\`\`

Wire it in \`vite.config.ts\`:
\`\`\`ts
tanstackStart: { client: { entry: 'client' } },
\`\`\`

Keep SSR ON the shell route so the header renders in <2s; gate only Midnight-heavy widgets
(wallet, contract writes) behind \`<ClientOnly>\` and dynamic \`import()\` inside \`useEffect\`.`;

const KIT_FEED_PERSISTENCE = `TX-HASH PERSISTENCE — the indexer exposes contract STATE, not a list of transaction IDs.
If you want a feed showing tx hashes, persist them client-side after the mint.

Best practice from Choreo Kits:
- Define your payload type with an optional \`txId?: string\` from the start; keep the canonical
  type in ONE browser-safe module and re-export it — do not redefine in multiple components.
- Write feed entries to \`localStorage\` AFTER the mint succeeds, attaching the \`txId\` returned
  by the mint path:
  - Undeployed: \`txId\` comes from the \`/api/mint\` response body.
  - Preview / Preprod: \`txId\` comes from Lace \`publishKit\`.
- Render the full \`tx: {hash}\` in the feed; label sources (\`chain\` when read from the indexer,
  \`local\` when read from localStorage).
- Dedupe by \`publishedAt\` and prefer the local row that already has \`txId\` when the indexer
  catches up (usually a few seconds later).`;

const REDFLAGS = "RED FLAGS \u2014 DO NOT ATTEMPT:\n- No bridging to Ethereum / any EVM chain. Midnight is a standalone L1; there is no bridge.\n- No oracle / external HTTP data inside a circuit. Circuits are bounded and cannot do I/O.\n- No recursion in Compact. Loops must be bounded by compile-time constants.\n- No sub-second finality UX. Proofs for k=14 circuits take 30\u2013120s \u2014 build for that latency.\n- No SSR for the write path. MidnightJS uses `window`, `Buffer`, and WASM top-level-await;\n  load every `@midnight-ntwrk/*` behind `<ClientOnly>` + `useEffect`. On TanStack Start, keep\n  nitro ENABLED and stub Midnight packages in the SSR pass (see `midnightSsrStub()`).\n- Do NOT set `nitro: false` on TanStack Start to 'escape SSR'. That splits the SSR output into\n  chunks (`assets/server-*.js` importing `assets/react-*.js`) that the Cloudflare Worker cannot\n  resolve at runtime \u2014 you get `Error: No such module \"assets/react\"` on every request. Keep\n  nitro on and use the `midnightSsrStub()` swap instead.\n- Do NOT sign Undeployed writes with Lace. Lace cannot balance/sign on the local `undeployed`\n  chain \u2014 the proof completes but submit fails silently. Route every write through a server\n  `/api/append-entry` (or `/api/mint`) route that reuses the genesis seed (see SIGNING STRATEGY block).\n- Do NOT let `privateStateStoreName` drift between `scripts/deploy-midnight.mjs` and the\n  server-append route. Mismatch \u2192 `findDeployedContract` samples a FRESH signing key \u2192 chain\n  rejects with `RpcError 1010: Invalid Transaction: Custom error: 117`. Import ONE shared\n  constant (e.g. `PRIVATE_STATE_STORE` from `src/lib/midnight-shared.ts`) in BOTH files. Debug\n  by logging the first/last 8 chars of the signing key on each side \u2014 they must match.\n- Do NOT pass the raw `ContractState` wrapper to `ledger()`. Symptom:\n  `expected instance of ChargedState`. Pass `contractState.data` (from `getPublicStates`) or\n  `result.public.nextContractState` (after a successful `callTx`).\n- Do NOT skip re-deploying after `midnight:down` / `midnight:up`. The chain state is wiped and\n  the address in `src/data/midnight-contract.undeployed.json` is dead. Always run\n  `bun run midnight:deploy` and restart the dev server, or invalidate the server route's\n  `ctxPromise` cache when the JSON changes \u2014 otherwise the 2nd+ append silently targets the\n  previous contract and fails with a stale-state or 117 error.\n- Do NOT diagnose a disabled 'Prove & submit' / 'Mint' button as a wallet or chain bug before\n  checking the form. In 90% of cases `canFund` / `canMint` just needs both fields non-empty.\n  Ship a tooltip that names the missing field so no one loses an hour on this.\n- Do NOT omit `@midnight-ntwrk/testkit-js`, `pino`, `ws`, `ssh2`, `cpu-features` from\n  `optimizeDeps.exclude` when using the server-append pattern. Rolldown/Vite tries to\n  pre-bundle those Node-only transitive deps and the dev server hangs indefinitely on the\n  'Loading \u2026' fallback.\n- Do NOT ship Mainnet without the persistent red risk banner AND the README disclaimer at the top\n  of `README.md`. Mainnet handles REAL value \u2014 this codebase is vibe-coded / unaudited / hackathon-grade.\n- Do NOT route Mainnet writes through a server `/api/mint`. There is no genesis wallet on Mainnet;\n  signing MUST be Lace-only, initiated by the user.\n- Do NOT prompt users for NIGHT seed/recovery phrases. On Mainnet, funds arrive via a withdrawal from\n  an official exchange partner (https://midnight.network/night?tag=exchange) directly to the Lace\n  unshielded address. Never accept a phrase in chat, form, screenshot, or issue tracker.\n- Do NOT ship `levelPrivateStateProvider` to the browser. Its `browser-level` \u2192 `abstract-level`\n  chain breaks under production Rollup with `Class extends value undefined is not a constructor or null`.\n  Use a `localStorage`-backed PrivateStateProvider in the browser; keep `levelPrivateStateProvider`\n  only in Node deploy scripts.\n- No deploying from a Cloudflare Worker / TanStack server function. Deploys are a local `bun`\n  script only \u2014 they need Docker, the proof server, and localhost.\n- Do NOT use `midnightntwrk/midnight-node:latest` (tag often missing) or the partner-chain 2.x\n  tags (need Cardano follower + Postgres). For public networks pin the matrix tags: proof-server:8.1.0,\n  midnight-node:1.0.1 (Preview), indexer:4.3.3. For local Undeployed use the local-dev triple:\n  proof-server:8.0.3, midnight-node:0.22.5, indexer-standalone:4.0.2.\n- Do NOT accept a user's recovery phrase in chat. Ship `scripts/check-midnight-wallet.mjs` that\n  reads `MIDNIGHT_WALLET_SEED` from their shell env and prints only PUBLIC addresses.\n- Do NOT derive shielded and unshielded addresses through different `NetworkId` values \u2014 use ONE\n  `NetworkId` across both encoders and validate the emitted bech32 prefix before writing `.env`";

const EXPERIMENTAL_DISCLAIMER = `EXPERIMENTAL DAPP DISCLAIMER (MANDATORY on ALL networks, non-negotiable on Mainnet):

This dapp is a hackathon artefact \u2014 vibe-coded, not audited, not reviewed by security professionals.
Every generated project MUST ship both of these UI + docs surfaces:

1. README.md \u2014 top-of-file block, verbatim:

\`\`\`markdown
> \u26a0\ufe0f **Experimental / vibe-coded \u2014 not audited.**
> This dapp was built in a hackathon sprint with AI assistance. Contract logic, key handling,
> and UI have NOT been reviewed by security professionals. Do not deposit funds you cannot
> afford to lose. On Mainnet, use only as a proof-of-deploy bragging right. Prefer the
> Undeployed \u2192 Preprod \u2192 Preview dry-run path before touching Mainnet.
\`\`\`

2. Persistent in-app top banner \u2014 create \`src/components/ExperimentalBanner.tsx\` and mount it
in the app root (above \`<Outlet />\` on TanStack Start, or at the top of the single page on plain Vite):

\`\`\`tsx
// src/components/ExperimentalBanner.tsx
import { useEffect, useState } from 'react';

const VARIANTS = {
  mainnet:    { bg: 'bg-red-600',    fg: 'text-white',      msg: 'MAINNET \u00b7 vibe-coded experiment \u2014 funds at risk, no audit. Use only for bragging-right proof-of-deploy.', dismissible: false },
  preview:    { bg: 'bg-amber-500',  fg: 'text-black',      msg: 'Testnet (Preview) \u00b7 experimental hackathon build. Not audited.', dismissible: true },
  preprod:    { bg: 'bg-amber-500',  fg: 'text-black',      msg: 'Testnet (Preprod) \u00b7 experimental hackathon build. Not audited.', dismissible: true },
  undeployed: { bg: 'bg-slate-700',  fg: 'text-slate-100',  msg: 'Local dev chain (Undeployed) \u00b7 not real value. Experimental build.', dismissible: true },
} as const;

export function ExperimentalBanner() {
  const net = (import.meta.env.VITE_NETWORK_ID ?? 'preview') as keyof typeof VARIANTS;
  const v = VARIANTS[net] ?? VARIANTS.preview;
  const key = \`experimental-banner-dismissed-\${net}\`;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (v.dismissible && sessionStorage.getItem(key) === '1') setHidden(true);
  }, [key, v.dismissible]);
  if (hidden) return null;
  return (
    <div role="alert" className={\`\${v.bg} \${v.fg} px-4 py-2 text-center text-sm font-semibold sticky top-0 z-50 flex items-center justify-center gap-3\`}>
      <span>\u26a0\ufe0f {v.msg}</span>
      {v.dismissible && (
        <button
          type="button"
          className="underline opacity-80 hover:opacity-100"
          onClick={() => { sessionStorage.setItem(key, '1'); setHidden(true); }}
        >
          dismiss
        </button>
      )}
    </div>
  );
}
\`\`\`

Rules:
- Mainnet banner is **NON-DISMISSIBLE**. Do not add an escape hatch.
- Preview/Preprod/Undeployed banners dismiss per session (sessionStorage), not permanently.
- Never remove the banner "because it looks better" \u2014 it is a safety surface, not a style choice.
- On Mainnet, also render a "no audit \u00b7 experimental" chip next to every write button.`;


const LOCAL_STACK_INTRO = "LOCAL STACK SETUP (Undeployed variant \u2014 humans run this in a terminal, NOT Lovable):\n\nThe `undeployed` target expects a full Midnight standalone stack (node + indexer + proof server)\nrunning on your own machine. All three services are Docker containers. This is the DevRel-advised\npath for hackathon work \u2014 it bypasses the tNIGHT\u2192tDUST faucet dance entirely and pins SDK + node\nto the same version so `/check 400` ZKIR mismatches don't happen.\n\n--- Canonical `docker-compose.yml` (write to project root; DO NOT use `:latest` tags) ---\n```yaml\nservices:\n  proof-server:\n    image: midnightntwrk/proof-server:8.0.3\n    command: [\"midnight-proof-server\", \"-v\"]\n    ports: [\"6300:6300\"]\n  node:\n    image: midnightntwrk/midnight-node:0.22.5\n    environment:\n      CFG_PRESET: dev            # standalone dev chain, no partner-chain follower\n    ports: [\"9944:9944\"]\n  indexer:\n    image: midnightntwrk/indexer-standalone:4.0.2\n    depends_on: [node]\n    environment:\n      APP__INFRA__NODE__URL: ws://node:9944\n    ports: [\"8088:8088\"]\n```\nStandalone indexer GraphQL path is `/api/v4/graphql` (same as hosted Preview/Preprod).\nDo NOT use `/api/v1/graphql` on the public fly.dev URL (it 308-redirect-loops). Do NOT use\n`midnight-node:latest` (tag often missing) or the partner-chain 2.x tags (they require a Cardano\nfollower + Postgres + a `mock_registrations_file` and will not run standalone).\n\n--- One-command bring-up (after Docker is running) ---\n```bash\nbun scripts/midnight-standalone.mjs up      # pull + start + wait for ready\nbun scripts/midnight-standalone.mjs status  # check health\nbun scripts/midnight-standalone.mjs down    # stop\n```\nThe `up` command writes `.midnight/standalone.docker-compose.yml` (same content as above),\npulls the pinned images, starts the three services, and polls readiness on\nws://localhost:9944, http://localhost:8088/api/v4/graphql, and http://localhost:6300/health.\nFirst run pulls ~1 GB and takes 2\u20135 min; later boots are seconds.\n\nProbe container health with `docker inspect --format '{{.State.Health.Status}}' <name>` BEFORE\nthe 15 s wallet sync wait \u2014 a crash-looping node otherwise hangs 15 s + 8\u00d710 s = 95 s before\nthe first useful error.\n\nThen verify in the browser: navigate to `/undeployed-preflight` in the app. Four green pills = ready.\nFor a human-readable walkthrough with copy buttons, also see:\nhttps://midnightprompts.lovable.app/undeployed";

const LOCAL_STACK_DOCKER_BY_OS: Record<OSTarget, string> = {
  macos: "--- Docker prerequisites (macOS) ---\n```bash\nbrew install --cask docker      # or download from docker.com/products/docker-desktop\nopen -a Docker                  # wait for whale icon in menu bar to go steady\n```\nApple Silicon: proof-server image is multi-arch, no --platform flag needed.\n\nExpanded copy-button guide with official Docker links, a CLI cheat sheet, and common errors:\nhttps://midnightprompts.lovable.app/proof-server#docker-setup",
  windows: "--- Docker prerequisites (Windows / WSL2) ---\nThree real blockers people actually hit; do these BEFORE `wsl --install`:\n\n  (1) Enable Virtualization in BIOS/UEFI.\n      Task Manager \u2192 Performance \u2192 CPU must show \"Virtualization: Enabled\". If Disabled,\n      shut down, tap Esc/F10 (HP) or F2/Del at boot, enable SVM Mode / AMD-V / Intel VT-x /\n      Virtualization Technology, save & exit. Without this, Docker Desktop's WSL2 backend cannot start.\n\n  (2) Enable Windows features + update WSL.\n      Win+R \u2192 `optionalfeatures` \u2192 tick Windows Subsystem for Linux, Virtual Machine Platform,\n      Windows Hypervisor Platform \u2192 OK \u2192 reboot. Then in PowerShell (Admin):\n      ```powershell\n      wsl --update\n      wsl --install\n      ```\n      If `wsl --update` errors with 0x8024001e / 0x80070002, redo (2) and reboot before retrying.\n\n  (3) Install Node.js LTS + fix PowerShell execution policy.\n      Download Windows x64 LTS .msi from https://nodejs.org/download (keep \"Add to PATH\").\n      If `npm install` errors with \"running scripts is disabled\":\n      ```powershell\n      Set-ExecutionPolicy RemoteSigned -Scope CurrentUser\n      ```\n\nAfter those three: install Docker Desktop with \"Use the WSL 2 based engine\" + Ubuntu integration,\nand run `bun scripts/midnight-standalone.mjs up` from INSIDE the WSL2 Ubuntu shell (not PowerShell)\nso localhost port forwarding to the Windows browser works.\nExpanded copy-button guide with official Docker links, a CLI cheat sheet, and common errors:\nhttps://midnightprompts.lovable.app/proof-server#docker-setup",
  linux: "--- Docker prerequisites (Linux) ---\n```bash\nsudo apt update\nsudo apt install -y docker.io docker-compose-plugin\nsudo systemctl enable --now docker\nsudo usermod -aG docker \"$USER\" && newgrp docker\n```\nFedora: `sudo dnf install docker docker-compose-plugin`.\nArch:   `sudo pacman -S docker docker-compose`.\nVerify: `docker run --rm hello-world` should print the welcome banner without sudo.\n\nExpanded copy-button guide with official Docker links, a CLI cheat sheet, and common errors:\nhttps://midnightprompts.lovable.app/proof-server#docker-setup",
};

const LOCAL_STACK_OUTRO = "--- Point Lace at the local node ---\nLace \u2192 Settings \u2192 Network \u2192 Custom \u2192 RPC = `ws://localhost:9944` \u2192 Save \u2192 Switch.\nThe standalone chain mints unlimited tDUST to a well-known GENESIS SEED \u2014 no faucet click,\nno delegation step. Deploys use that seed directly (see `scripts/deploy-midnight.mjs`).\n\nNETWORK ID MAPPING (memorize \u2014 `undeployed` reuses `NetworkId.Undeployed`, Preview does too):\n- `undeployed` \u2192 NetworkId.Undeployed \u2014 unshielded `mn_addr_undeployed1\u2026`, shielded `mn_shield-addr_undeployed1\u2026`\n- `preview`    \u2192 NetworkId.Undeployed (Lace labels it \"Preview\") \u2014 same prefixes\n- `preprod`    \u2192 NetworkId.TestNet   \u2014 `mn_addr_test1\u2026` / `mn_shield-addr_test1\u2026`\n- `mainnet`    \u2192 NetworkId.MainNet   \u2014 `mn_addr1\u2026` / `mn_shield-addr1\u2026`\nUse ONE NetworkId across BOTH encoders. Validate the emitted bech32 prefix before writing\n`.env` / `src/data/midnight-contract.json`; abort on mismatch.\n\n--- Deploy the Compact contract ---\n```bash\n# after `compact compile` produced contracts/managed/<name>/ and artefacts are in public/contract/\nVITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs\n# \u2192 writes src/data/midnight-contract.undeployed.json (address + txHash + deployedAt)\n# \u2192 paste the address into VITE_DEFAULT_CONTRACT for hot reload\n```\n\nFull troubleshooting: see the `midnight-environment-setup` skill\n(https://midnight-skills.netlify.app/skills/midnight-environment-setup) \u2014 it covers\nDocker Desktop failing to start, port 6300 conflicts, WSL2 clock drift, and Lace network switching.";

function localStackSetup(os: OSTarget): string {
  return `${LOCAL_STACK_INTRO}\n\n${LOCAL_STACK_DOCKER_BY_OS[os]}\n\n${LOCAL_STACK_OUTRO}`;
}

const NETWORK_LABELS: Record<NetworkVariant, string> = {"preview": "Preview testnet", "preprod": "Preprod testnet (closer to mainnet)", "undeployed": "Undeployed / local standalone stack (no faucet needed)", "undeployed-fly": "Undeployed hosted on Fly.io (public demo — no Docker for visitors)", "mainnet": "Mainnet (REAL VALUE — experimental / vibe-coded, use at your own risk)"};

const NETWORK_SECRETS: Record<NetworkVariant, string> = {
  preview: "REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **PREVIEW** target:\n- VITE_NETWORK_ID           preview\n- VITE_INDEXER_URL          https://indexer.preview.midnight.network/api/v4/graphql\n- VITE_INDEXER_WS_URL       wss://indexer.preview.midnight.network/api/v4/graphql/ws\n- VITE_PROOF_SERVER_URL     http://localhost:6300   (run the matrix proof server: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`)\n- VITE_DEFAULT_CONTRACT     hex address printed by your first deploy \u2014 paste it here so users skip the deploy step\n\ntNIGHT \u2260 tDUST \u2014 the #1 support question. Faucet dispenses tNIGHT; deploys spend tDUST. Every user hits this once:\n  1. Copy your UNSHIELDED address (`mn_addr_undeployed1\u2026` on Preview; Lace labels the network \"Preview\").\n  2. Paste into https://midnight-tmnight-preview.nethermind.dev/ \u2192 Request \u2192 tNIGHT arrives.\n  3. In Lace, click \"Generate tDUST\" to delegate tNIGHT \u2192 tDUST appears after a block.\n  4. Only NOW can you deploy \u2014 the deploy script errors with `Insufficient Funds: could not balance dust` otherwise.\nExplorer: https://preview.midnightexplorer.com/\nNotes:    Preview is the fastest network to demo on but resets frequently. Best for iterative dev + hackathon judges.\n          If you don't want to babysit the faucet, use the **Undeployed** variant of this prompt instead.",
  preprod: "REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **PREPROD** target:\n- VITE_NETWORK_ID           preprod\n- VITE_INDEXER_URL          https://indexer.preprod.midnight.network/api/v4/graphql\n- VITE_INDEXER_WS_URL       wss://indexer.preprod.midnight.network/api/v4/graphql/ws\n- VITE_PROOF_SERVER_URL     http://localhost:6300   (run the matrix proof server: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`)\n- VITE_DEFAULT_CONTRACT     hex address printed by your first deploy \u2014 paste it here so users skip the deploy step\n\ntNIGHT \u2260 tDUST \u2014 same trap as Preview. On Preprod the unshielded address prefix is `mn_addr_test1\u2026`\n(NetworkId.TestNet, NOT NetworkId.Undeployed \u2014 use the right one in the deploy script).\n  1. Copy your UNSHIELDED address (`mn_addr_test1\u2026`).\n  2. Paste into https://midnight-tmnight-preprod.nethermind.dev/ \u2192 Request \u2192 tNIGHT arrives.\n  3. In Lace, click \"Generate tDUST\" to delegate \u2192 tDUST appears after a block.\n  4. Only NOW can you deploy.\nExplorer: https://preprod.midnightexplorer.com/\nNotes:    Preprod is closer to mainnet parameters but has known DUST-sync and ZKIR 0.31 quirks. If your\n          demo stalls at \"Balancing\u2026\", switch to the Undeployed local stack variant of this prompt.",
  undeployed: "REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **UNDEPLOYED / LOCAL** target:\n- VITE_NETWORK_ID           undeployed\n- VITE_INDEXER_URL          http://localhost:8088/api/v4/graphql   (standalone indexer uses v4, like the hosted indexers)\n- VITE_INDEXER_WS_URL       ws://localhost:8088/api/v4/graphql/ws\n- VITE_PROOF_SERVER_URL     http://localhost:6300   (local-dev image: `midnightntwrk/proof-server:8.0.3`)\n- VITE_NODE_WS              ws://localhost:9944\n- VITE_DEFAULT_CONTRACT     hex address printed by your local deploy (written to src/data/midnight-contract.undeployed.json)\n\nNo faucet needed \u2014 the local standalone chain mints unlimited tDUST to the genesis seed\n`0x000\u20260002` (yes, the SECOND slot \u2014 seed `\u20260001` is empty). The deploy script uses that seed\ndirectly via `WalletBuilder.buildFromSeed(..., NetworkId.Undeployed)`.\nExplorer: not applicable (chain is local); browse state via the local Indexer GraphQL at\n          http://localhost:8088/api/v4/graphql \u2014 the app's `/undeployed-preflight` page hits it too.\nNotes:    This is the **DevRel-advised** path for hackathon work. It bypasses every Preprod\n          tDUST-sync + `/check 400` ZKIR issue by pinning the SDK and node to the same version.",
  "undeployed-fly": `REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **UNDEPLOYED on FLY.IO** target:
- VITE_NETWORK_ID           undeployed
- VITE_INDEXER_URL          https://choreo-indexer.fly.dev/api/v4/graphql
- VITE_INDEXER_WS_URL       wss://choreo-indexer.fly.dev/api/v4/graphql/ws
- VITE_PROOF_SERVER_URL     https://choreo-proof.fly.dev
- VITE_NODE_WS              (leave unset in the browser \u2014 the node is 6PN-internal only, never public)
- VITE_FAUCET_URL           https://choreo-faucet.fly.dev
- VITE_DEFAULT_CONTRACT     hex address printed by \`scripts/fly-deploy-contract.sh\` (from a 6PN Fly machine)

Rename the four Fly apps to whatever you like; the URLs above are the reference topology from
"Tokenized Choreo Kits" (~\\$15\u201325/mo). Fly \\_publicly\\_ exposes indexer + proof-server + faucet;
the node stays 6PN-internal only. Every visitor uses their own Lace on \`NetworkId.Undeployed\` and
gets tDUST from the in-app faucet button that POSTs to \`\${VITE_FAUCET_URL}/grant\`.

Explorer: not applicable (chain lives on your Fly node). Browse state via the public Indexer
GraphQL at \`\${VITE_INDEXER_URL}\`.
Notes:    Same NetworkId, same seed logic, same Lace UX as local Undeployed \u2014 no Docker on the
          visitor's machine. First mint after redeploy is still \u223c4 min cold (proving-key load).
Readiness (WalletFacade 4.1.1): the correct sync check is
          \`state.dust.state.progress.isStrictlyComplete()\`, NOT \`state.progress?.isSynced\` and NOT
          a plain \`state.progress\` boolean. Getting this wrong makes the "warming up" toast stick
          forever after the wallet is actually ready.
Proof-server URL: use \`https://choreo-proof.fly.dev\` (public, HTTPS via Fly edge). Never wire the
          browser to \`choreo-proof.internal:6300\` \u2014 the proof server binds IPv4, 6PN is IPv6-only,
          and mixed-content also blocks it.`,
  mainnet: `REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **MAINNET** target (\u26a0\ufe0f REAL VALUE):
- VITE_NETWORK_ID           mainnet
- VITE_INDEXER_URL          https://indexer.mainnet.midnight.network/api/v4/graphql
- VITE_INDEXER_WS_URL       wss://indexer.mainnet.midnight.network/api/v4/graphql/ws
- VITE_PROOF_SERVER_URL     http://localhost:6300   (matrix proof server: \`docker run -p 6300:6300 midnightntwrk/proof-server:${MIDNIGHT_MATRIX.proofServer} midnight-proof-server -v\`)
- VITE_DEFAULT_CONTRACT     hex address printed by your first mainnet deploy

Address prefixes are unsuffixed on Mainnet: unshielded \`mn_addr1\u2026\`, shielded \`mn_shield-addr1\u2026\`.
Use \`NetworkId.MainNet\` in the deploy script. Mismatched network ids produce a wrong bech32
prefix \u2014 abort before writing \`.env\` when the prefix disagrees.

ACQUIRING NIGHT (real asset, no faucet):
NIGHT is a real on-chain asset. There is no mainnet faucet. Acquire NIGHT from an official
exchange partner listed at https://midnight.network/night?tag=exchange. Withdraw to your Lace
UNSHIELDED address (\`mn_addr1\u2026\`). Then, inside Lace, click "Generate DUST" to delegate NIGHT
\u2192 DUST \u2014 DUST is what pays circuit-proof fees. Only THEN can you deploy or mint.

Explorer: https://midnightexplorer.com/  (Node ${MIDNIGHT_MATRIX.node.mainnet})

DO NOT ship Mainnet without:
- The persistent red MAINNET risk banner (see EXPERIMENTAL DAPP DISCLAIMER block).
- The README disclaimer at the top of \`README.md\` (verbatim, see below).
- A clear "no audit" chip near every write button.
- A dry-run on Undeployed + Preprod BEFORE touching Mainnet.

NEVER:
- Ask the user for a recovery phrase / seed / private key. Signing is Lace-only on Mainnet.
- Route Mainnet writes through a server \`/api/mint\`. There is no genesis wallet on Mainnet.
- Auto-deposit user funds. Every write must be explicitly initiated by the user in Lace.`,
};

type Hook = { id: string; name: string; tag: string; kernel: string; ui: string };
const HOOKS: Record<string, Hook> = {"compact-deploy": {"id": "compact-deploy", "name": "Compact ZK contract", "tag": "onchain logic", "kernel": "a Compact `.compact` contract compiled to ZK proving/verifying keys and deployed to the Midnight preview testnet, with public ledger state readable from the Indexer", "ui": "a 'verified on Midnight' badge with the live contract address and a Midnight explorer link"}, "private-witness": {"id": "private-witness", "name": "Private witness proof", "tag": "zero-knowledge", "kernel": "a Compact `witness` callback that keeps a user secret local while a ZK proof asserts a property of it \u2014 the proof lands on Midnight, the secret never leaves the browser", "ui": "a 'proved without revealing' chip that flips green after the ZK circuit accepts the witness"}, "lace-wallet": {"id": "lace-wallet", "name": "Lace wallet + tDUST", "tag": "wallet UX", "kernel": "detect `window.midnight`, call `initialAPI.connect('preview')`, let Lace balance the transaction with tDUST and submit it via `midnightProvider.submitTx`", "ui": "a 'Connected via Lace' status pill, the shielded address, and a Proving \u2192 Submitting \u2192 Confirmed transaction trail"}, "ipfs-content": {"id": "ipfs-content", "name": "IPFS content + on-chain CID", "tag": "decentralized storage", "kernel": "pin creative artefacts to IPFS via Pinata, then commit the CID to the public ledger through the Compact contract so provenance is verifiable but the file itself stays on IPFS", "ui": "a 'pinned to IPFS \u00b7 logged on Midnight' chip with the CID, gateway preview, and a Midnight explorer link"}};


function safeName(title: string, fallback: string): string {
  return (title.replace(/[^A-Za-z0-9]/g, "").slice(0, 36)) || fallback;
}
function snake(title: string, fallback: string): string {
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  return s || fallback;
}

function compactLog(title: string, pitch: string): string {
  const n = safeName(title, "TimestampLog");
  return `// contracts/${n}.compact
// ${pitch}
// ${CREDIT}
pragma language_version 0.23;

import CompactStandardLibrary;

// Public ledger state — visible to everyone via the Indexer
export ledger entry_count: Counter;
export ledger last_message: Opaque<"string">;
export ledger last_author_commitment: Bytes<32>;

// Private callback wired from TypeScript; the returned bytes never touch chain
witness localSecretKey(): Bytes<32>;

constructor() {
  entry_count.increment(1);
  last_message = disclose("(empty)");
}

export circuit authorCommitment(sk: Bytes<32>, seq: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>(
    [pad(32, "${snake(title, "log")}:author:"), seq, sk]
  );
}

export circuit appendEntry(newMessage: Opaque<"string">): [] {
  const sk = localSecretKey();
  const seq = entry_count as Field as Bytes<32>;
  last_author_commitment = disclose(authorCommitment(sk, seq));
  last_message = disclose(newMessage);      // disclose is REQUIRED before writing to ledger
  entry_count.increment(1);
}`;
}

function compactWitness(title: string, pitch: string): string {
  const n = safeName(title, "PrivateProof");
  return `// contracts/${n}.compact
// ${pitch}  (private-witness pattern)
// ${CREDIT}
pragma language_version 0.23;

import CompactStandardLibrary;

export ledger enrolled_commitments: Set<Bytes<32>>;   // public: which commitments are valid
export ledger last_action_count: Counter;

witness localSecretKey(): Bytes<32>;

constructor() { last_action_count.increment(1); }

export circuit enroll(commitmentTag: Bytes<32>): [] {
  const sk = localSecretKey();
  const c = persistentHash<Vector<2, Bytes<32>>>([commitmentTag, sk]);
  enrolled_commitments.insert(disclose(c));            // sk stays local; only c goes public
}

export circuit proveOwnership(commitmentTag: Bytes<32>): [] {
  const sk = localSecretKey();
  const c = persistentHash<Vector<2, Bytes<32>>>([commitmentTag, sk]);
  assert(enrolled_commitments.member(c), "not enrolled");
  last_action_count.increment(1);
}`;
}

function compactIpfs(title: string, pitch: string): string {
  const n = safeName(title, "CIDLedger");
  return `// contracts/${n}.compact
// ${pitch}  (pin-to-IPFS-then-commit-CID pattern)
// ${CREDIT}
pragma language_version 0.23;

import CompactStandardLibrary;

export ledger cid_count: Counter;
export ledger last_cid: Opaque<"string">;
export ledger last_author_commitment: Bytes<32>;

witness localSecretKey(): Bytes<32>;

constructor() { cid_count.increment(1); last_cid = disclose("(empty)"); }

export circuit commitCid(cid: Opaque<"string">): [] {
  const sk = localSecretKey();
  const seq = cid_count as Field as Bytes<32>;
  last_author_commitment = disclose(
    persistentHash<Vector<3, Bytes<32>>>([pad(32, "cid:author:"), seq, sk])
  );
  last_cid = disclose(cid);
  cid_count.increment(1);
}`;
}


function bodyCompactDeploy(title: string, pitch: string, sub: string, contract: string): string {
  return `CONTRACT
\`\`\`compact
${contract}
\`\`\`

FRONTEND FLOW
1. Land on page → 'Connect Lace' button → poll \`window.midnight\` → \`connect('preview')\`.
2. Show shielded address, tDUST reminder ("Get testnet DUST → {VITE_FAUCET_URL}"), and Deploy button.
3. On Deploy: import \`deployContract\` from \`@midnight-ntwrk/midnight-js-contracts\`, pass witnesses
   ({ localSecretKey: async () => sk }) where \`sk\` is a 32-byte value persisted in localStorage.
4. Show a "Proving…" spinner for up to 120s while the local proof server crunches.
5. On success, render the deployed address + a Midnight explorer link and persist it to
   \`src/data/midnight-contract.json\` so the app boots straight into it next time.
6. The "${sub}" action calls \`appendEntry(payload)\` — same flow: prove, submit, refresh feed.`;
}

function bodyIpfsContent(title: string, pitch: string, sub: string, contract: string): string {
  return `PINATA STEP (src/lib/pinata.ts):
\`\`\`ts
export async function pinToIPFS(file: Blob, name = "${sub}") {
  const fd = new FormData(); fd.append("file", file, name);
  const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST", headers: { Authorization: \`Bearer \${import.meta.env.VITE_PINATA_JWT}\` },
    body: fd,
  });
  return (await r.json()).IpfsHash as string;
}
\`\`\`

CONTRACT
\`\`\`compact
${contract}
\`\`\`

FRONTEND FLOW
1. User creates a ${sub} artefact in the UI (upload / draw / record / generate).
2. \`const cid = await pinToIPFS(blob)\` → show \`https://gateway.pinata.cloud/ipfs/<cid>\`.
3. \`commitCid(cid)\` via \`findContractInstance(...).callTx.commitCid(witnesses, cid)\`.
4. Proving spinner (30–120s) → confirmation → append \`{cid, tx, at}\` to the on-screen feed.
5. Feed is hydrated from the Indexer (\`readLedger\`), so refreshes work with just the wallet disconnected.`;
}

function bodyLaceWallet(title: string, pitch: string, sub: string, contract: string): string {
  return `CONTRACT
\`\`\`compact
${contract}
\`\`\`

FRONTEND FLOW — Lace is the whole auth story
1. Landing page shows one button: "Connect Lace". No email, no password, no OAuth.
2. On click: \`initProviders()\` → shielded address becomes the identity.
3. tDUST balance strip: \`const bal = await connectedAPI.balanceAndProofOfBalance();\` render it.
4. Every ${sub} action = \`contract.callTx.appendEntry(witnesses, payload)\`. Show status:
   \`Proving → Balancing (Lace adds tDUST fees) → Submitting → Confirmed\` with a Midnight explorer link.
5. If \`waitForLace\` rejects, render the exact install URL for Lace with a friendly nudge —
   no fake "click here to install" placeholder. This is the single biggest onboarding drop-off.`;
}

function bodyPrivateWitness(title: string, pitch: string, sub: string, contract: string): string {
  return `CONTRACT
\`\`\`compact
${contract}
\`\`\`

FRONTEND FLOW — the secret NEVER leaves the browser
1. On first visit, generate a 32-byte secret with \`crypto.getRandomValues(new Uint8Array(32))\`
   and persist it base64-encoded in localStorage. Warn users that clearing storage revokes proofs.
2. The witness callback returns that secret to the Compact circuit — it is used inside the ZK proof
   but never appears in the transaction that goes on chain.
3. "Enroll" action → \`enroll(commitmentTag)\` — commits \`hash(tag, sk)\` on chain.
4. "Prove ${sub}" action → \`proveOwnership(commitmentTag)\` — the circuit asserts the commitment
   is in \`enrolled_commitments\` for THIS wallet's secret. UI shows a green "proved without revealing" chip.
5. Anyone reading the Indexer sees only commitments and a bumped counter — they cannot link
   two proofs to the same user because the secret never appeared on chain.`;
}

type BodyPair = {
  contract: (title: string, pitch: string) => string;
  body: (title: string, pitch: string, sub: string, contract: string) => string;
};
const BODY_BY_HOOK: Record<string, BodyPair> = {
  "compact-deploy":  { contract: compactLog,     body: bodyCompactDeploy },
  "ipfs-content":    { contract: compactIpfs,    body: bodyIpfsContent },
  "lace-wallet":     { contract: compactLog,     body: bodyLaceWallet },
  "private-witness": { contract: compactWitness, body: bodyPrivateWitness },
};

const FRONTEND_STANDARDS = `FRONTEND STANDARDS (Lovable-agent rules — non-negotiable, apply BEFORE writing any component):

1. DESIGN SYSTEM — semantic tokens only, no hardcoded colors in components.
   - Define ALL colors, gradients, shadows, radii as HSL CSS variables in \\\`src/index.css\\\`
     under \\\`:root\\\` and \\\`.dark\\\`, then map them in \\\`tailwind.config.ts\\\` under
     \\\`theme.extend.colors\\\` (\\\`background\\\`, \\\`foreground\\\`, \\\`primary\\\`, \\\`accent\\\`,
     \\\`muted\\\`, \\\`card\\\`, \\\`border\\\`, \\\`ring\\\`, plus idea-specific accents).
   - BANNED in components: \\\`text-white\\\`, \\\`text-black\\\`, \\\`bg-black\\\`, \\\`bg-white\\\`,
     \\\`bg-[#...]\\\`, arbitrary hex, inline \\\`style={{ color: '#...' }}\\\`. Use
     \\\`text-foreground\\\`, \\\`bg-background\\\`, \\\`bg-primary text-primary-foreground\\\`,
     \\\`border-border\\\`, etc. Custom gradients belong in \\\`@layer utilities\\\`.
   - Reject generic AI aesthetics: no default Inter/Poppins body paired with a
     purple/indigo gradient on white unless the idea explicitly asks for it.
     Commit to ONE distinctive direction that matches the theme (Music / Dance /
     Film / Fashion / Writing / etc.) — pick a typography pair (heading + body)
     from Google Fonts loaded in \\\`index.html\\\`, and one accent hue. Dark-mode-first
     (Midnight brand), but ship a working light-mode token set too.

2. SHADCN/UI PRIMITIVES — use \\\`@/components/ui/*\\\` for Button, Card, Dialog, Tabs,
   Toast, Input, Badge. Customize via \\\`cva\\\` variants in the primitive file, never
   by slapping hardcoded utility classes on the call site. Small, focused
   components live in \\\`src/components/\\\`; hooks in \\\`src/hooks/\\\`. No file over
   ~200 lines — split.

3. ASYNC UX — proving takes 30–120 s; the UI must stay alive.
   - Stream a status pill: \\\`Proving → Balancing → Submitting → Confirmed\\\` (or
     \\\`Error\\\`), with a determinate label AND an \\\`aria-live="polite"\\\` region.
     Never a bare spinner.
   - On success, render the Midnight explorer link + a Copy-address button.
   - On failure, render the exact error text with a Copy-error button — no
     silent \\\`console.error\\\`. Toasts via \\\`useToast\\\` from \\\`@/components/ui/use-toast\\\`.
     Never \\\`alert()\\\`.
   - Every async view has loading + empty + error branches. No unhandled promise
     rejections. Every \\\`await\\\` is wrapped in try/catch OR surfaced through an
     error boundary.

4. SEO + HEAD METADATA — set real values in \\\`index.html\\\`, not "Lovable App".
   - \\\`<title>\\\` ≤60 chars, keyword-first. \\\`<meta name="description">\\\` ≤160 chars.
   - Exactly ONE \\\`<h1>\\\`. Use \\\`<main>\\\`, \\\`<section>\\\`, \\\`<article>\\\`, \\\`<nav>\\\`, \\\`<footer>\\\`.
   - \\\`alt\\\` on every image. \\\`loading="lazy"\\\` on below-the-fold images.
   - JSON-LD \\\`WebApplication\\\` block in \\\`<head>\\\`, canonical tag, responsive
     \\\`<meta name="viewport">\\\`.
   - OpenGraph: \\\`og:title\\\`, \\\`og:description\\\`, \\\`og:type=website\\\`,
     \\\`twitter:card=summary_large_image\\\`. Skip \\\`og:image\\\` unless the demo
     produces a real cover.

5. ACCESSIBILITY + RESPONSIVE — mobile-first.
   - Every interactive element is keyboard-reachable with a visible focus ring
     (via the \\\`ring\\\` token). Buttons have \\\`aria-label\\\` when icon-only.
   - Test at 375 px first. Wrap long hashes, addresses, and CIDs with
     \\\`break-all\\\` inside a \\\`min-w-0\\\` flex child so nothing horizontally scrolls.
   - Stack CTA buttons full-width on mobile; row on \\\`sm:\\\` and up.

6. STATE + STORAGE — the 5-credit budget forbids Lovable Cloud.
   - The 32-byte witness secret lives in \\\`localStorage\\\` base64-encoded. NEVER
     POST it anywhere. Warn the user in-app that clearing storage revokes proofs.
   - Contract address + deploy tx hash cached in \\\`localStorage\\\` under a
     namespaced key so the app boots straight into the last deployment.
   - React Query is fine for Indexer reads. No Redux / Zustand / Jotai.

7. LOVABLE-AGENT WORKFLOW (rules for the coding assistant, not the end user).
   - Prefer search-replace over full-file rewrites. Only change what was asked.
   - Verify with build output before claiming done — no "should work" hand-waves.
   - When the user reports a bug, reproduce first: read console logs, network
     requests, and DOM state before proposing a fix.
   - Do NOT introduce new deps for anything the current stack already solves.
`;

const WALLET_BOILERPLATE = "\n\n--- BEGIN: Connect-Lace boilerplate (self-contained, DApp Connector v4) ---\n\nAdd a working \"Connect Lace\" button to the primary page of the app. This\nsection is self-contained \u2014 do NOT install any @midnight-ntwrk/* package for\nthe connect step; the Lace browser extension injects everything you need at\n`window.midnight`. Follow the DApp Connector API v4 exactly as written below.\n\nHARD RULES\n- Do NOT call `enable()` or `state()` \u2014 DApp Connector v4.0 removed them.\n- Do NOT read `window.midnight` at module scope or during SSR \u2014 only inside\n  `useEffect`. Gate the panel render until after hydration.\n- Do NOT hardcode the network \u2014 try Preview, Preprod, and Mainnet in order\n  and use whichever `connect(networkId)` accepts.\n- Reading a shielded address is a permission-only handshake \u2014 no signing,\n  no funds moved.\n- Style the button with shadcn \\`Button\\` + semantic tokens (\\`bg-primary\\`,\n  \\`text-primary-foreground\\`) \u2014 no hardcoded colors, see FRONTEND STANDARDS \u00a71.\n\nCREATE FILE: src/lib/use-midnight-wallet.ts\n```ts\nimport { useCallback, useEffect, useState } from \"react\";\n\nexport type WalletStatus =\n  | \"idle\" | \"detecting\" | \"ready\" | \"connecting\" | \"connected\" | \"error\";\n\ntype Connector = {\n  apiVersion: string;\n  name?: string;\n  connect: (networkId: string) => Promise<ConnectedApi>;\n  isEnabled?: () => Promise<boolean>;\n};\n\ntype ConnectedApi = {\n  getShieldedAddresses?: () => Promise<string[] | Record<string, string>>;\n  getUnshieldedAddress?: () => Promise<string>;\n  getDustAddress?: () => Promise<string>;\n  getConfiguration?: () => Promise<{\n    indexerUri?: string; indexerWsUri?: string; proverServerUri?: string;\n  }>;\n};\n\nfunction pickConnector(): Connector | null {\n  if (typeof window === \"undefined\") return null;\n  const m = (window as unknown as { midnight?: Record<string, Connector> }).midnight;\n  if (!m) return null;\n  for (const v of Object.values(m)) {\n    if (v && typeof v === \"object\" && \"apiVersion\" in v && /^4\\\\./.test(String(v.apiVersion))) {\n      return v as Connector;\n    }\n  }\n  const first = Object.values(m)[0];\n  return first && \"apiVersion\" in first ? (first as Connector) : null;\n}\n\nexport function useMidnightWallet() {\n  const [status, setStatus] = useState<WalletStatus>(\"idle\");\n  const [address, setAddress] = useState<string | null>(null);\n  const [apiVersion, setApiVersion] = useState<string | null>(null);\n  const [network, setNetwork] = useState<string | null>(null);\n  const [error, setError] = useState<string | null>(null);\n  const [tick, setTick] = useState(0);\n\n  useEffect(() => {\n    if (typeof window === \"undefined\") return;\n    setStatus((p) => (p === \"connected\" ? p : \"detecting\"));\n    setError(null);\n    const t0 = Date.now();\n    const iv = window.setInterval(() => {\n      const c = pickConnector();\n      if (c) {\n        window.clearInterval(iv);\n        setApiVersion(c.apiVersion);\n        setStatus((p) => (p === \"connected\" ? p : \"ready\"));\n      } else if (Date.now() - t0 > 5000) {\n        window.clearInterval(iv);\n        setStatus(\"error\");\n        setError(\"No Midnight wallet detected. Install Lace from lace.io.\");\n      }\n    }, 100);\n    return () => window.clearInterval(iv);\n  }, [tick]);\n\n  const connect = useCallback(async () => {\n    try {\n      setError(null);\n      setStatus(\"connecting\");\n      const c = pickConnector();\n      if (!c) throw new Error(\"No Midnight wallet detected.\");\n      const preferred = (import.meta.env.VITE_NETWORK_ID as string) || \"preprod\";\n      const candidates = Array.from(new Set([preferred, \"preview\", \"preprod\", \"undeployed\", \"mainnet\"]));\n      let api: ConnectedApi | null = null;\n      let used: string | null = null;\n      for (const n of candidates) {\n        try { api = await c.connect(n); used = n; break; } catch {}\n      }\n      if (!api || !used) throw new Error(\"Failed to connect to Lace.\");\n      let addr: string | null = null;\n      if (typeof api.getShieldedAddresses === \"function\") {\n        try {\n          const s = await api.getShieldedAddresses();\n          if (Array.isArray(s)) addr = s[0] ?? null;\n          else if (s && typeof s === \"object\") addr = Object.values(s)[0] ?? null;\n        } catch {}\n      }\n      if (!addr && typeof api.getUnshieldedAddress === \"function\") {\n        try { addr = await api.getUnshieldedAddress(); } catch {}\n      }\n      if (!addr) throw new Error(\"Connected but couldn't read an address.\");\n      setAddress(addr);\n      setNetwork(used);\n      setStatus(\"connected\");\n    } catch (e) {\n      setError(e instanceof Error ? e.message : String(e));\n      setStatus(\"error\");\n    }\n  }, []);\n\n  return { status, address, apiVersion, network, error, connect,\n    disconnect: () => { setAddress(null); setNetwork(null); setStatus(\"ready\"); setError(null); },\n    redetect: () => setTick((n) => n + 1) };\n}\n```\n\nMOUNT on the primary page and gate render until hydrated. See\nhttps://midnightprompts.lovable.app for the full component reference.\n\n--- END: Connect-Lace boilerplate ---\n";



const SCRIPTS_FOLDER = `SCRIPTS FOLDER — MANDATORY (all variants):

Every generated app MUST contain a real \`scripts/\` folder. Do NOT reference
any script from README.md that does not exist on disk — regenerate the README
from the actual \`scripts/\` contents at the end.

CREATE FILE: scripts/deploy-midnight.mjs — every gotcha baked in. Nine rules,
memorize them:

  ① Force \`ttlOneHour()\` in BOTH \`walletProvider.balanceTx\` AND
    \`midnightProvider.balanceTx\`. The contracts SDK calls balanceTx without a
    TTL; the dust wallet then crashes with
    \`undefined is not an object (evaluating 'arg0.getTime')\`.
  ② \`ZK_CONFIG_PATH = path.resolve(__dirname, '..', 'contracts/managed/<name>')\`.
    Missing \`..\` → ENOENT on \`scripts/contracts/managed/…\`.
  ③ Standalone genesis funds seed \`0x000…0002\` (SECOND slot, not the first).
    Wrong seed → \`Insufficient Funds: could not balance dust\`.
  ④ Password for privateStoragePasswordProvider needs ≥3 of
    {upper, lower, digit, symbol}. \`Choreo-Kits-Local-2026!\` passes; a
    lowercase-only password fails with "Found: 2".
  ⑤ \`await new Promise(r => setTimeout(r, 15000))\` after \`wallet.start()\` so
    the wallet sees the genesis balance before you deploy.
  ⑥ Adapter must inject TTL — contracts SDK calls \`balanceTx\` with no TTL.
  ⑦ Provide an explicit witness object \`{ localSecretKey: (ctx) => [ctx, key] }\`
    on the \`Contract\` instance. \`withVacantWitnesses\` does NOT satisfy a
    contract that declares any witnesses.
  ⑧ Retry \`deployContract\` up to 8× with a 10 s backoff AND a FRESH
    \`privateStateId\` per attempt — the wallet-sync race is real.
  ⑨ \`initialPrivateState: { localSecretKey: <32-byte Uint8Array> }\` is
    REQUIRED or the constructor throws
    \`does not contain a function-valued field named localSecretKey\`.

\`\`\`js
// Local Node ESM deploy script. Runs on the developer's machine — never in
// the browser or a Cloudflare Worker. Requires the local proof server + a
// running node + indexer (Undeployed) OR a funded Lace on preview/preprod.
//
//   VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
//   VITE_NETWORK_ID=preprod    bun scripts/deploy-midnight.mjs
//
// Writes src/data/midnight-contract.<network>.json so the app hydrates.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { ttlOneHour } from '@midnight-ntwrk/midnight-js-utils';   // ← ①
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { Contract } from '../public/contract/contract/index.cjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NET = process.env.VITE_NETWORK_ID ?? 'undeployed';

// Map VITE_NETWORK_ID → NetworkId. Preview reuses Undeployed. Use ONE across encoders.
const NETWORK_ID = ({
  undeployed: NetworkId.Undeployed,
  preview:    NetworkId.Undeployed,
  preprod:    NetworkId.TestNet,
  mainnet:    NetworkId.MainNet,
})[NET];
setNetworkId(NETWORK_ID);

const contractName = process.env.MIDNIGHT_CONTRACT ?? 'timestamp-log';
// ② Resolve ZK config from PROJECT ROOT, not scripts/
const ZK_CONFIG_PATH = path.resolve(__dirname, '..', 'contracts', 'managed', contractName);
if (!fs.existsSync(ZK_CONFIG_PATH)) {
  console.error(\`Missing \${ZK_CONFIG_PATH}. Run: bun run midnight:compile\`);
  process.exit(1);
}

// ③ Genesis-funded seed on Undeployed (…0002, NOT …0001). On preview/preprod
//    the human uses their Lace wallet — swap this for a headless wallet seed
//    provided via MIDNIGHT_WALLET_SEED shell env (never in code).
const SEED = NET === 'undeployed'
  ? '0000000000000000000000000000000000000000000000000000000000000002'
  : process.env.MIDNIGHT_WALLET_SEED;
if (!SEED) { console.error('Set MIDNIGHT_WALLET_SEED for non-undeployed deploys'); process.exit(1); }

// ④ ≥3 character classes
const PRIVATE_STORAGE_PASSWORD = 'Midnight-Local-Dev-2026!';

const deployerSecret = crypto.getRandomValues(new Uint8Array(32));

const wallet = await WalletBuilder.buildFromSeed(
  process.env.VITE_INDEXER_URL,
  process.env.VITE_INDEXER_WS_URL,
  process.env.VITE_PROOF_SERVER_URL,
  process.env.VITE_NODE_WS ?? 'ws://localhost:9944',
  SEED,
  NETWORK_ID,
);
wallet.start();
await new Promise(r => setTimeout(r, 15000));   // ⑤

const baseProviders = {
  privateStateProvider: levelPrivateStateProvider({ privateStateStoreName: 'midnight-priv' }),
  publicDataProvider:   indexerPublicDataProvider(process.env.VITE_INDEXER_URL, process.env.VITE_INDEXER_WS_URL),
  zkConfigProvider:     new NodeZkConfigProvider(ZK_CONFIG_PATH),
  proofProvider:        httpClientProofProvider(process.env.VITE_PROOF_SERVER_URL),
  privateStoragePasswordProvider: { get: async () => PRIVATE_STORAGE_PASSWORD },
  walletProvider: {
    coinPublicKey: wallet.state().coinPublicKey,
    // ⑥ TTL injected here — contracts SDK calls this without one
    balanceTx: (tx, newCoins) => wallet.balanceTransaction(tx, newCoins, ttlOneHour()),
  },
  midnightProvider: {
    submitTx: (tx) => wallet.submitTransaction(tx),
    balanceTx: (tx, newCoins) => wallet.balanceTransaction(tx, newCoins, ttlOneHour()),
  },
};

// ⑦ Explicit witness — do NOT use withVacantWitnesses when the contract declares any
const contractInstance = new Contract({
  localSecretKey: (ctx) => [ctx, deployerSecret],
});

// ⑧ Retry loop with a fresh privateStateId every attempt
let deployed;
for (let i = 0; i < 8; i++) {
  try {
    deployed = await deployContract(
      { ...baseProviders, privateStateId: \`deploy-\${Date.now()}-\${i}\` },
      {
        contract: contractInstance,
        initialPrivateState: { localSecretKey: deployerSecret }, // ⑨
      },
    );
    break;
  } catch (e) {
    if (i === 7) throw e;
    console.warn(\`Deploy attempt \${i + 1} failed: \${e.message}. Retrying in 10s…\`);
    await new Promise(r => setTimeout(r, 10000));
  }
}

const address = deployed.deployTxData.public.contractAddress;
const out = {
  network: NET,
  address,
  deployTx: deployed.deployTxData.public.txHash,
  deployedAt: new Date().toISOString(),
};
const outPath = \`src/data/midnight-contract.\${NET}.json\`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(\`✓ wrote \${outPath}\`);
console.log(\`  address: \${address}\`);
console.log(\`  paste into VITE_DEFAULT_CONTRACT\`);
process.exit(0);
\`\`\`

CREATE FILE: scripts/check-midnight-wallet.mjs — a "wallet doctor" that reads
\`MIDNIGHT_WALLET_SEED\` from the shell env (NEVER accept a seed phrase in chat)
and prints ONLY public addresses + tDUST balance. Refuse to log the seed.

CREATE FILE (Undeployed variants only): scripts/fund-lace.sh — one-shot Lace
funder that clones midnightntwrk/midnight-local-dev and launches its
interactive faucet CLI. See FUND LACE ON UNDEPLOYED below for the exact
contents and menu-option-2 walkthrough. Wire it up as \`bun run midnight:fund\`.

CREATE FILE: scripts/README.md — list every script (\`deploy-midnight.mjs\`,
\`check-midnight-wallet.mjs\`, \`midnight-standalone.mjs\`, and for Undeployed
also \`fund-lace.sh\`), its inputs, and when to run it. The Undeployed section
of README.md MUST spell out the funding flow verbatim: run \`bun run midnight:fund\`,
choose menu option 2 ("Fund accounts by public key"), paste the Lace UNSHIELDED
address (\`mn_addr_undeployed1…\`), receive 50,000 tNIGHT, tap "Generate tDUST"
in Lace, wait one block. If you add or remove a script, update this file in
the same commit.

DEPENDENCIES the deploy script needs (bun add BEFORE first run — Node ESM
scripts are NOT bundled by Vite; every import must be a real dep). These align
to the Midnight Support Matrix and the active Lovable Midnight skill:
  bun add @midnight-ntwrk/midnight-js-contracts@4.1.1 \\
          @midnight-ntwrk/midnight-js-network-id@4.1.1 \\
          @midnight-ntwrk/midnight-js-types@4.1.1 \\
          @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1 \\
          @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1 \\
          @midnight-ntwrk/midnight-js-node-zk-config-provider@4.1.1 \\
          @midnight-ntwrk/midnight-js-level-private-state-provider@4.1.1 \\
          @midnight-ntwrk/midnight-js-utils@4.1.1 \\
          @midnight-ntwrk/wallet@4.0.0 \\
          @midnight-ntwrk/wallet-sdk@1.2.0 \\
          @midnight-ntwrk/wallet-sdk-address-format@1.0.0 \\
          @midnight-ntwrk/wallet-sdk-hd@3.1.0-beta.1 \\
          @midnight-ntwrk/testkit-js@4.1.1 \\
          @midnight-ntwrk/ledger-v8@8.1.0 \\
          bip39

Add a \`compile\` script to package.json that CHAINS compile → artefact copy →
docker up → deploy so the human runs a single command:

  "scripts": {
    "midnight:compile":   "compact compile contracts/YourContract.compact contracts/managed/your-contract",
    "midnight:artefacts": "rm -rf public/contract && mkdir -p public/contract && cp -r contracts/managed/your-contract/keys contracts/managed/your-contract/zkir contracts/managed/your-contract/contract public/contract/",
    "midnight:up":        "bun scripts/midnight-standalone.mjs up",
    "midnight:fund":      "bash scripts/fund-lace.sh",
    "midnight:deploy":    "bun scripts/deploy-midnight.mjs",
    "compile":            "bun midnight:compile && bun midnight:artefacts && bun midnight:up && bun midnight:deploy"
  }


For the Undeployed variant ALSO create scripts/midnight-standalone.mjs — a
thin wrapper around \`docker compose\` that writes
\`.midnight/standalone.docker-compose.yml\` (see the canonical yaml in the
LOCAL STACK SETUP block above, tagged proof-server:8.0.3, midnight-node:0.22.5,
indexer-standalone:4.0.2), brings up node + indexer + proof-server, and polls
readiness. See https://midnightprompts.lovable.app/undeployed for a reference
implementation that can be copied verbatim.`;

const UNDEPLOYED_FUND_LACE = `FUND LACE ON UNDEPLOYED — the hidden gotcha (READ THIS, it saves hours):

The genesis-funded seed \`0x000…0002\` (SECOND slot; seed \`…0001\` is empty) funds
ONLY the deployer wallet used inside \`scripts/deploy-midnight.mjs\`. It does NOT
fund the Lace browser extension a demo user connects with. A fresh Lace on
\`undeployed\` starts at 0 / 250,000 tDUST, and every write (mint, prove, append)
pays fees in tDUST — so the first click after connect fails with a cryptic
"Unexpected error submitting scoped transaction" or an insufficient-balance
error unless Lace has been funded first.

Two paths — pick ONE based on what the demo actually needs:

PATH A — headless deploy only, no Lace tDUST needed (fastest, RECOMMENDED for
non-interactive demos). \`scripts/deploy-midnight.mjs\` uses \`WalletBuilder\`
against seed \`…0002\` directly. Reads are free through the Indexer. Skip PATH B.

PATH B — the demo needs a connected Lace wallet writing txs. Ship a real funder
script — the one below is the ONE that works. Do NOT invent a "midnight-cli
transfer" incantation; that tool does not ship with Midnight.

CREATE FILE: scripts/fund-lace.sh
\`\`\`bash
#!/usr/bin/env bash
# One-shot funder for the Lace wallet on the local Undeployed Midnight stack.
# Uses the official midnight-local-dev CLI (install from
# https://github.com/midnightntwrk/midnight-local-dev or via Midnight docs/tooling).
# It dispenses tDUST directly to the unshielded address.
set -euo pipefail
ADDRESS="$1"
if [ -z "$ADDRESS" ]; then
  echo "Usage: bun run midnight:fund <LACE_UNSHIELDED_ADDRESS>"
  exit 1
fi
midnight-local-dev faucet --to "$ADDRESS" --network undeployed
\`\`\`

If \`midnight-local-dev\` is not installed yet, clone and install it first:
\`\`\`bash
REPO_DIR="/tmp/midnight-local-dev"
git clone https://github.com/midnightntwrk/midnight-local-dev.git "$REPO_DIR"
cd "$REPO_DIR"
npm install
npm run build
# Verify: ./bin/run --help
\`\`\`

Wire it into package.json so the human runs one command:
\`\`\`json
"scripts": {
  "midnight:fund": "bash scripts/fund-lace.sh"
}
\`\`\`

What the user does:
1. In the app, click "Connect Lace" and copy the UNSHIELDED address (starts with \`mn_addr_undeployed1…\`).
2. In a terminal (where the local stack is running): \`bun run midnight:fund <unshielded-address>\`.
3. Wait for the CLI to confirm tDUST was sent.
4. Back in the app, the tDUST chip flips from "empty" to a live number after ~1 block.

UI guard — MANDATORY. Read the Lace dust balance via the connected API and
disable the write button when it is zero. Show it prominently near the CTA:
\`\`\`ts
const dust = await api.getDustBalance?.();
// dust is typically { balance: bigint, ... } — render "71 / 250,000 tDUST"
// and gate the mint/prove/append button on balance > 0n.
\`\`\`
If the balance is zero, render an inline hint: "Fund your Lace wallet with tDUST
first: run \`bun run midnight:fund\` in your terminal and paste your unshielded address."
This single guard prevents the cryptic proof-submission error path entirely.

VERIFY (green before you demo):
- \`bun scripts/midnight-standalone.mjs status\` → all three services green
- \`/undeployed-preflight\` in this app → four green pills
- Lace tDUST chip in the app UI → non-zero after ~1 block

SAFETY: never accept a user's recovery phrase in chat. If the human wants to
sanity-check their wallet, ship \`scripts/check-midnight-wallet.mjs\` that reads
\`MIDNIGHT_WALLET_SEED\` from the shell env and prints only public addresses.

CREATE FILE: scripts/README.md — include a section titled "Funding Lace on Undeployed" that copies the steps above verbatim. This README is the first place a hackathon participant looks; do not skip it.

References:
- https://docs.midnight.network/llms-full.txt (search: "undeployed", "genesis")
- https://github.com/midnightntwrk/midnight-local-dev`;

const PRIVATE_STATE_PROVIDER = `PRIVATE STATE PROVIDER (browser) — DO NOT ship \`levelPrivateStateProvider\` to the browser:
\`levelPrivateStateProvider\` pulls in \`browser-level\` → \`abstract-level\`, whose CJS/ESM interop breaks
under production Rollup. The published site will show a black screen with
\`TypeError: Class extends value undefined is not a constructor or null\` from \`browser-level-*.js\`.

Instead ship a tiny localStorage-backed \`PrivateStateProvider<string, unknown>\` from day one:
- Key layout: \`<prefix>:<coinPubKey>:contracts:<contractAddress>:states:<privateStateId>\`
  and \`<prefix>:<coinPubKey>:signing:<address>\`.
- JSON-encode \`Uint8Array\` as \`{ __type: "Uint8Array", data: [...] }\` and reverse on read.
- Implement \`setContractAddress\`, \`get/set/remove/clear\`, \`get/set/removeSigningKey\`, \`clearSigningKeys\`;
  stub \`exportPrivateStates\` / \`importPrivateStates\` / \`exportSigningKeys\` / \`importSigningKeys\`.

Node deploy scripts CAN keep using \`levelPrivateStateProvider\` — the ban is browser-only.
Reference: https://midnightprompts.lovable.app/known-issues`;

const TANSTACK_START = `TANSTACK START COMPATIBILITY (if Lovable generates a TanStack Start app instead of a classic Vite SPA):

The same "no SSR for the write path" rule applies. But TanStack Start SSR-renders every route by default,
so you MUST add the Cloudflare-Worker-safe SSR stubbing that the published site requires:

1. Keep Nitro ENABLED. Never set \`nitro: false\` — it splits the SSR bundle into chunks the Worker runtime cannot resolve.
2. Restrict \`vite-plugin-top-level-await\` to the client environment:
\`\`\`ts
function clientTopLevelAwait(): Plugin {
  return { ...topLevelAwait(), applyToEnvironment: (env) => env.name === 'client' };
}
\`\`\`
3. Stub every Midnight package AND the client contract module during the SSR pass:
\`\`\`ts
function midnightSsrStub(): Plugin {
  const wasmStub = path.resolve('src/lib/midnight-ssr-stub.ts');
  const contractStub = path.resolve('src/lib/contract.ssr-stub.ts');
  const contractReal = path.resolve('src/lib/contract.ts');
  return {
    name: 'midnight-ssr-stub',
    enforce: 'pre',
    async resolveId(id, importer, options) {
      if (!options?.ssr) return;
      if (id.startsWith('@midnight-ntwrk/')) return wasmStub;
      const resolved = await this.resolve(id, importer, { ...options, skipSelf: true });
      if (resolved && resolved.id === contractReal) return contractStub;
      return resolved;
    },
  };
}
\`\`\`
Ship \`src/lib/midnight-ssr-stub.ts\` as \`export default {}\` and a matching \`src/lib/contract.ssr-stub.ts\`.
4. Mark every Midnight route \`ssr: false\`. Never import \`@midnight-ntwrk/*\` at module scope of a route file.
5. Do NOT use \`browser-level\` in the browser bundle. Use a localStorage-backed PrivateStateProvider.

Test the production build + Publish → Update on day one. Preview runs on Vite dev; published runs on workerd/Nitro/Rollup,
and the failure modes are invisible in preview. Reference: https://midnightprompts.lovable.app/known-issues`;

const HOSTING_FLYIO = `HOSTING ON FLY.IO (optional public demo for the Undeployed variant):

If you want a published Lovable demo that any visitor with Lace can test without running Docker,
host the Undeployed stack on FOUR Fly apps in ONE org + region. Battle-tested topology from the
Tokenized Choreo Kits project (~$15–25/mo, proof-server is the biggest at 2GB shared-cpu-2x):

\`\`\`text
choreo-node.internal:9944    # midnight-node:${MIDNIGHT_MATRIX.localStack.node}, 6PN-internal, 1× machine, 1GB volume
choreo-indexer.fly.dev       # indexer-standalone:${MIDNIGHT_MATRIX.localStack.indexer} → ws://choreo-node.internal:9944
choreo-proof.fly.dev         # proof-server:${MIDNIGHT_MATRIX.localStack.proofServer}, memory=2gb, min_machines_running=1
choreo-faucet.fly.dev        # Node.js @midnight-ntwrk/wallet, holds FAUCET_SEED, /grant endpoint
\`\`\`

NON-NEGOTIABLES (each one cost hours in Choreo Kits — do not skip):

1. **Node #0 is the #1 blocker. Fix it FIRST.**
   \`midnight-node:${MIDNIGHT_MATRIX.localStack.node}\` on Fly with only \`CFG_PRESET=dev\` boots as a
   partner-chain follower without a Cardano source and sits at \`best: #0\` forever. Every downstream
   service looks broken (empty indexer, faucet wallet never syncs, deploy times out with
   \`Insufficient Funds\`). Before promoting: \`flyctl ssh console -a choreo-node\` and dump the image's
   \`/entrypoint.sh\` (or \`docker inspect midnightntwrk/midnight-node:${MIDNIGHT_MATRIX.localStack.node}\`)
   to learn which env combination enables standalone sealing FOR THAT TAG. Verify with
   \`flyctl logs -a choreo-node | grep -E "Prepared block|Imported #[1-9]"\`. If you never see block
   imports past #0, don't debug indexer/faucet — it is the node.

2. **Never overwrite the image ENTRYPOINT with \`[processes] app = "..."\`.**
   Fly appends \`[processes]\` as extra args to ENTRYPOINT. A long "command" here silently becomes
   stray args and env is ignored. Keep \`[processes]\` short (or omit); prefer env vars the entrypoint
   script actually reads. Small extras like \`--rpc-external\` are fine.

3. **Single machine per app.** \`flyctl scale count 1\` on every app, \`--ha=false\` on the node app,
   \`min_machines_running=1\` on node + proof-server, \`auto_stop_machines=false\` on the node. Two node
   machines will diverge silently.

4. **Node is never public.** No \`[http_service]\` on the node. Indexer and deploy script reach it
   via the 6PN \`choreo-node.internal:9944\` DNS name over IPv6. Bind the RPC to \`[::]:9944\` inside
   the node so 6PN can reach it.

5. **Indexer must bind to IPv6.** Fly 6PN is IPv6-only.
   \`APP__INFRA__API__ADDRESS = "::"\` — BARE, NOT \`"[::]"\`. TOML parses the bracketed form as a
   sequence and the container crashes at boot.

6. **Indexer path is \`/api/v4/graphql\`.** The \`indexer-standalone:${MIDNIGHT_MATRIX.localStack.indexer}\`
   image exposes v4. \`/api/v1/graphql\` emits a 308 redirect loop on the public fly.dev URL.
   Frontend env: \`VITE_INDEXER_URL=https://choreo-indexer.fly.dev/api/v4/graphql\`,
   \`VITE_INDEXER_WS_URL=wss://choreo-indexer.fly.dev/api/v4/graphql/ws\`.

7. **Proof-server: stock image, NO custom Dockerfile.**
   The \`midnightntwrk/proof-server:${MIDNIGHT_MATRIX.localStack.proofServer}\` base is DISTROLESS —
   no bash, no sleep, no chmod. Any wrapper script fails with \`exec: 127\`. Use:
   \`\`\`toml
   [build] image = "midnightntwrk/proof-server:${MIDNIGHT_MATRIX.localStack.proofServer}"
   [processes] app = "midnight-proof-server -v"
   [[vm]] memory = "2gb"    # 1GB OOMs during proving-key load
   \`\`\`
   Only accessed via the public \`https://choreo-proof.fly.dev\` (IPv4 through Fly edge) — no
   socat/IPv6 wrapper needed. First mint after deploy is still ~4 min cold (proving key load).

8. **Deploy from a 6PN Fly Machine, not the Lovable sandbox or your laptop.**
   The deploy script needs \`ws://choreo-node.internal:9944\`, only reachable inside 6PN. Pattern:
   \`flyctl deploy --build-only --push\` a tiny image containing \`scripts/deploy-midnight.mjs\` +
   compiled artefacts, then \`flyctl machine run <image> -a choreo-node --rm ...\`. Attaching to any
   app in the same org auto-joins 6PN. Contract address is tied to the node volume — destroying it
   nukes every previously-deployed address.

9. **Faucet: FOURTH app, not a Cloudflare Worker.**
   \`@midnight-ntwrk/wallet\` uses WebSocket + WASM patterns workerd rejects. Small Node.js server
   with \`http.createServer\`, \`/grant { address }\` endpoint, in-memory rate-limit, \`FAUCET_SEED\` as
   a Fly secret. Rules:
   - **Bind HTTP to \`"0.0.0.0"\`, NOT \`"::"\`.** Fly-proxy forwards inbound over IPv4 loopback; an
     IPv6-only listener never receives requests and the app looks hung. The wallet's OUTBOUND
     connections to \`choreo-node.internal\` still go over IPv6 — that is independent.
   - **\`FAUCET_SEED\` = exactly 64 hex chars.** \`openssl rand -hex 32\`, NOT \`-base64\`. \`WalletBuilder.buildFromSeed\`
     throws \`InvalidSeed\` on anything else.
   - **Do NOT import \`NetworkId\` from \`@midnight-ntwrk/midnight-js-network-id\` at Bun runtime.**
     The package's ESM entry crashes with an import-map error under Bun. Pass the numeric enum
     value directly (\`0\` for Undeployed) or hard-code the network name string.
   - **Cold-boot: 10–90s.** \`wallet.start()\` takes that long to sync a non-zero balance after
     machine start. \`/grant\` must return \`503 warming up\` until \`/health\` shows the address; UI
     must retry. Never set \`min_machines_running=0\` unless you accept a 90s first-request delay.
     If the node is stuck at #0, cold-boot never ends — check node health FIRST.
   - **Must be funded once.** Send tDUST from the genesis deployer wallet (seed \`…0002\`) to the
     address the faucet prints on boot. Refill when dry — no auto-refill.
   - **CORS.** \`Access-Control-Allow-Origin: *\` (or your Lovable domain) + \`OPTIONS\` handler, or
     the browser POST from the wallet-connect panel fails silently with a network error.

BRING-UP ORDER (do NOT skip step 1):

\`\`\`bash
export FLY_API_TOKEN=FlyV1...           # verbatim from source; a single flipped char kills the macaroon
export FAUCET_SEED=$(openssl rand -hex 32)
export FLY_ORG=personal
./scripts/fly-bootstrap.sh              # creates 4 apps + volume, deploys, scales to 1 (409-tolerant)
# 1. Prove the node authors blocks BEFORE deploying anything else:
flyctl logs -a choreo-node | grep -E "Imported #[1-9]"   # must see non-zero within 2 min
# 2. curl indexer:  curl -X POST https://choreo-indexer.fly.dev/api/v4/graphql \\
#      -d '{"query":"{block(offset:{height:1}){height}}"}'   # non-null block
# 3. curl proof:    curl https://choreo-proof.fly.dev/version   # ${MIDNIGHT_MATRIX.localStack.proofServer}
# 4. curl faucet:   curl https://choreo-faucet.fly.dev/health   # {"ok":true,"address":"mn_addr_undeployed1..."}
# 5. Fund the faucet address once from the genesis deployer (…0002).
# 6. Deploy the contract from a 6PN machine:
./scripts/fly-deploy-contract.sh        # ephemeral machine runs deploy-midnight.mjs
# Paste printed contract address into VITE_DEFAULT_CONTRACT and republish.
\`\`\`

FAILURE-MODE TABLE (new rows from Choreo Kits, copy the fixes verbatim):

| Symptom | Cause | Fix |
| --- | --- | --- |
| Node stays at \`best: #0\`, \`Failed to trigger bootstrap: No known peers\` | Partner-chain follower without Cardano source; \`CFG_PRESET=dev\` alone is not enough on Fly | \`flyctl ssh console -a choreo-node\`, read \`/entrypoint.sh\`, find the standalone-sealer env for the pinned tag |
| Indexer container exits at boot with a TOML/env parse error | \`APP__INFRA__API__ADDRESS = "[::]"\` — brackets make it a TOML sequence | Change to bare \`"::"\` |
| Indexer public URL returns a 308 chain | Using \`/api/v1/graphql\` on standalone 4.x | Use \`/api/v4/graphql\` everywhere (faucet, deploy, frontend) |
| Proof-server custom Dockerfile fails with \`exec: 127\` / \`sleep not found\` | Distroless base has no shell/coreutils | Don't build a custom image; use stock image + \`[processes] app = "midnight-proof-server -v"\` |
| Proof-server OOMs mid-mint, first mint after deploy fails | 1GB machine, proving key needs ~1.5GB | \`[[vm]] memory = "2gb"\`, redeploy |
| Faucet HTTP requests hang / never reach the container | Server bound to \`::\` — Fly-proxy forwards over IPv4 loopback | \`http.createServer(...).listen(PORT, "0.0.0.0")\` |
| Faucet crashes at boot with \`InvalidSeed\` | \`FAUCET_SEED\` not exactly 64 hex chars (base64 output is common cause) | \`flyctl secrets set FAUCET_SEED=$(openssl rand -hex 32) -a choreo-faucet\` |
| Faucet crashes at boot importing \`NetworkId\` from \`@midnight-ntwrk/midnight-js-network-id\` | Package's ESM entry breaks under Bun runtime | Use the numeric enum directly (\`0\` for Undeployed) instead of importing the enum |
| Faucet \`/health\` returns \`{"ok":false,"address":null}\` for >5 min | Almost always the node is stuck at #0, NOT a faucet bug | Check \`flyctl logs -a choreo-node\` FIRST |
| Faucet returns 503 for 60+s after redeploy | Wallet still syncing — expected | UI retry loop + "faucet warming up" toast; don't \`min_machines_running=0\` |
| Faucet returns 500 \`Insufficient Funds\` | Faucet wallet drained | Send more tDUST from genesis deployer (…0002) to the faucet address shown at \`/health\` |
| Node running \`[processes] app = "some-long-command"\` behaves as if env is ignored | \`[processes]\` replaces CMD → gets appended to ENTRYPOINT as stray args | Keep \`[processes]\` short or omit; prefer env vars |
| Two node machines materialise after a \`flyctl deploy\` | \`--ha=true\` (default) | \`--ha=false\` + \`flyctl scale count 1\` on the node app |
| Deploy from Lovable sandbox: WebSocket to \`ws://choreo-node.internal:9944\` fails | Sandbox is not on 6PN | Use \`scripts/fly-deploy-contract.sh\` (ephemeral 6PN machine) |
| Browser: \`Mixed content: HTTPS page requested http://\` | Env still points at \`http://...localhost:6300\` | Use \`https://choreo-proof.fly.dev\`; Fly terminates TLS |
| \`flyctl logs\` returns \`401 Unauthorized\` mid-session | Corrupted / retyped \`FLY_ACCESS_TOKEN\` (one flipped char kills the whole macaroon) | Re-export the token verbatim from the source; never hand-retype |
| \`flyctl apps create\` returns error even though app exists | Some flyctl versions exit 1 on 409 | Bootstrap script uses \`flyctl apps list --json\` grep first — do the same for any new create step |

Full skill reference: https://midnightprompts.lovable.app/undeployed (Fly.io section).`;


const FLYMIDNIGHT_LESSONS = `FLY.IO STACK — HARD-WON LESSONS FROM \`flymidnight\` (2026-07):

These are the fixes that turned a red-across-the-board \`/undeployed-preflight\` into 4 green pills
on a live Fly-hosted stack. All of them are non-obvious; skip any one and hours evaporate.

1. **Readiness = \`state.dust.state.progress.isStrictlyComplete()\`.** WalletFacade 4.1.1 shape.
   Do NOT check \`state.progress?.isSynced\`, \`state.progress === true\`, or the older
   \`walletReady\` boolean \u2014 those never flip on 4.1.1 and the app hangs on "warming up" forever
   even after DUST is fully synced. Log the raw \`state.dust.state.progress\` object once when
   debugging; it exposes \`applyGap\`, \`sourceGap\`, and \`isStrictlyComplete()\`.

2. **Browser \u2192 proof server MUST use the public HTTPS URL.** \`https://choreo-proof.fly.dev\`.
   The proof-server binary listens on IPv4 only, Fly 6PN is IPv6-only, and the browser is
   HTTPS \u2014 \`choreo-proof.internal:6300\` fails on all three counts. Do NOT wrap it with socat;
   the distroless image has no shell (\`exec: 127\`) and public IPv4 through Fly's edge is the
   supported path. Only server-to-server 6PN calls need the \`.internal\` name (indexer \u2192 node,
   faucet \u2192 node); proof server is always public.

3. **\`VITE_DEFAULT_CONTRACT\` must OVERRIDE cached localStorage on load.** After a Fly redeploy
   the volume can rotate, and yesterday's contract address is dead \u2014 but the SPA cached it in
   \`localStorage["midnight-contract-address"]\`. On boot: prefer \`import.meta.env.VITE_DEFAULT_CONTRACT\`
   when set, otherwise fall back to localStorage. Symptom if you invert the priority:
   \`Couldn't find template \u2026\` on every write after redeploy, even though the site was just built.

4. **Health probe order matters.** \`/undeployed-preflight\` must probe node WS FIRST, then
   indexer HTTP, then indexer WS, then proof HTTP. If the node is stuck at #0 (see the Fly
   failure-mode table above), every other probe returns misleading errors and users chase
   phantom bugs. Fail fast on node before painting the rest of the grid.

5. **Fund each Lace visitor from an in-app \`Get tDUST\` button.** The genesis seed \`\u20260002\`
   funds ONLY the deploy wallet; every Lace visitor on Undeployed starts with 0 tDUST and
   writes fail with a cryptic \`Unexpected error submitting scoped transaction\` after signing.
   Wire a Faucet button that POSTs \`{ address: laceUnshieldedAddress }\` to
   \`\${VITE_FAUCET_URL}/grant\`. Poll the Lace \`getDustBalance()\` afterwards; disable the mint
   button until balance > 0.

6. **Retry the faucet with backoff for the first 90 s after redeploy.** \`choreo-faucet\` cold
   boot: \`wallet.start()\` needs 10\u201390 s to sync a non-zero balance. During that window,
   \`/grant\` returns \`503 warming up\`. Show a "faucet warming up (~90 s)" toast, retry
   automatically every 10 s, and don't set \`min_machines_running=0\` on the faucet unless you
   accept that first-request delay.

7. **When you rebuild the node volume, refund the faucet.** Destroying \`chain_data\` on the
   node wipes every previously-minted tDUST, including the faucet wallet. Follow the volume
   destroy with: \`bun scripts/fund-faucet.mjs\` (which uses the genesis \`\u20260002\` seed to send
   tDUST to the faucet's \`/health\` address). Otherwise the next visitor's \`/grant\` returns
   500 \`Insufficient Funds\` and the demo silently breaks.

Cross-reference: the \`flymidnight\` repo (github.com/arunnadarasa/flymidnight) is the canonical
working example \u2014 mirror the file layout when in doubt.`;


function inAppSetupPanel(network: NetworkVariant, os: OSTarget): string {
  const dockerInstall: Record<OSTarget, string> = {
    macos: "Install Docker Desktop for Mac (`brew install --cask docker`, then `open -a Docker`).",
    windows: "Install Docker Desktop for Windows with WSL2 backend. Prereqs: BIOS virtualization ON, `wsl --update`, Node.js LTS on PATH. See https://midnightprompts.lovable.app/proof-server#docker-setup",
    linux: "Install Docker Engine (`sudo apt install docker.io docker-compose-plugin`, then `sudo usermod -aG docker $USER`).",
  };
  const previewPreprod = `1. Install the Lace wallet → https://www.lace.io/
2. Switch Lace to Midnight ${network === "preview" ? "Preview" : "Preprod"}
3. Get tNIGHT from the faucet, then click Generate tDUST in Lace
   → https://midnight-tmnight-${network}.nethermind.dev/
4. Start the proof server (public networks use the matrix tag; local Undeployed uses 8.0.3):
   docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
5. Deploy the contract:
   VITE_NETWORK_ID=${network} bun scripts/deploy-midnight.mjs
6. Paste the printed hex address into VITE_DEFAULT_CONTRACT and reload.`;

  const undeployed = `1. ${dockerInstall[os]}
2. Start the local Midnight stack:
   bun scripts/midnight-standalone.mjs up
3. Point Lace at ws://localhost:9944 (Settings → Network → Custom).
   Lace may label the network "Preview" — that's cosmetic; the
   mn_addr_undeployed1… prefix confirms it's the local chain.
4. Fund your Lace wallet with tDUST (SKIP if the demo only reads or if the
   deploy script is the only writer — see PATH A in FUND LACE ON UNDEPLOYED):
   - Install the local-dev faucet CLI from https://github.com/midnightntwrk/midnight-local-dev
   - In the app, copy your Lace UNSHIELDED address (mn_addr_undeployed1…)
   - bun run midnight:fund <unshielded-address>
   - Wait for the CLI confirmation; the tDUST chip in this app flips from
     "empty" to a live number after ~1 block.
   If midnight-local-dev tries to bring up its own node/indexer/proof-server
   on the same ports, run \`docker compose down\` in this project first.
5. Deploy the contract:
   VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
6. Reload this page. Preflight:
   https://midnightprompts.lovable.app/undeployed-preflight`;

  const undeployedFly = `1. This target expects the FOUR-app Fly.io stack already deployed
   (choreo-node / choreo-indexer / choreo-proof / choreo-faucet). If it isn't
   yet, follow the HOSTING ON FLY.IO block above end-to-end first — the node
   must be authoring blocks (\`flyctl logs -a choreo-node | grep "Imported #[1-9]"\`)
   before any visitor can use the demo.
2. Point Lace at NetworkId.Undeployed (Settings → Network → Custom → RPC.
   Leave the RPC blank or point at the FLY node only if you're the operator;
   ordinary visitors use their existing Undeployed setting). Prefix confirmation:
   mn_addr_undeployed1… on Lace after switching.
3. Click the in-app "Get tDUST" button (wired to \`\${VITE_FAUCET_URL}/grant\`)
   to fund your Lace visitor wallet. The genesis seed only funds the deploy
   wallet; every visitor needs their own tDUST or writes fail with a cryptic
   submission error. Poll Lace.getDustBalance() and disable the mint button
   until balance > 0. If /grant returns 503, retry every 10 s (faucet cold
   boot is 10–90 s).
4. Deploy the contract FROM a 6PN Fly Machine, not the Lovable sandbox or
   your laptop:
   ./scripts/fly-deploy-contract.sh
   (Ephemeral machine \`flyctl machine run\`-s a tiny image containing
   scripts/deploy-midnight.mjs + compiled artefacts, prints the address.)
5. Paste the printed hex into VITE_DEFAULT_CONTRACT (Lovable env vars) and
   republish. VITE_DEFAULT_CONTRACT must OVERRIDE any localStorage-cached
   contract address on boot — otherwise the SPA keeps calling yesterday's
   dead address after a redeploy.
6. Verify the readiness check in wallet code is
   \`state.dust.state.progress.isStrictlyComplete()\` (WalletFacade 4.1.1),
   NOT \`state.progress?.isSynced\`. Wrong shape = "warming up" toast stuck
   forever even after DUST is synced.
7. Preflight the deployed site: it should show 4 green pills for
   node / indexer / proof / faucet — probe order matters, node first.`;

  const steps = network === "undeployed" ? undeployed : network === "undeployed-fly" ? undeployedFly : previewPreprod;

  return `IN-APP SETUP PANEL — MANDATORY (render on the primary page):

Create a <SetupInstructions /> React component and mount it ABOVE the demo
and ABOVE the Connect-Lace panel. It must:
- Be collapsible; persist dismissed state under localStorage key
  "setup-dismissed-${network}".
- Render the numbered steps below verbatim (copy-paste-friendly code blocks
  with a copy button on each shell command).
- Show a small "show setup again" link in the page footer so users can
  reopen it after dismissing.
- Copy is prescriptive — do not ship an empty stub or a TODO placeholder.

${steps}

Also add a one-line "powered by" reference in the footer linking to
https://midnightprompts.lovable.app so end users can browse the full
network variants + preflight tools.`;
}

const MAINNET_ACQUIRE = `MAINNET \u2014 ACQUIRE NIGHT VIA AN OFFICIAL EXCHANGE PARTNER (there is no faucet):

NIGHT is a real on-chain asset with monetary value. Midnight does not run a mainnet faucet.
The ONLY safe way to obtain NIGHT is to buy it from an official exchange partner listed at
https://midnight.network/night?tag=exchange, withdraw it directly to your Lace UNSHIELDED
mainnet address (\`mn_addr1\u2026\`), and then delegate NIGHT \u2192 DUST inside Lace to pay circuit fees.

Steps to render in the in-app setup panel and in \`README.md\`:

1. Install Lace \u2192 https://www.lace.io/ \u2192 switch to Midnight **Mainnet**.
2. Copy your UNSHIELDED mainnet address (\`mn_addr1\u2026\`). NEVER share the shielded address for
   an exchange withdrawal \u2014 exchanges reject it and the funds may not arrive.
3. Buy NIGHT on an official exchange partner (see https://midnight.network/night?tag=exchange
   for the current allowlist). Do NOT source NIGHT from anonymous OTC / social DMs \u2014 those are
   the standard mainnet-phishing vector.
4. Withdraw to your Lace unshielded address. Wait for confirmation.
5. In Lace, click **Generate DUST** to delegate NIGHT \u2192 DUST. DUST pays proof + tx fees.
6. Start the matrix proof server:
   \`docker run -p 6300:6300 midnightntwrk/proof-server:${MIDNIGHT_MATRIX.proofServer} midnight-proof-server -v\`
7. Deploy: \`VITE_NETWORK_ID=mainnet bun scripts/deploy-midnight.mjs\`.
8. Paste the printed hex address into \`VITE_DEFAULT_CONTRACT\` and reload.

HARD RULES on Mainnet:
- Do a full Undeployed \u2192 Preprod \u2192 Preview dry-run BEFORE touching Mainnet. Mainnet is the
  last stop, not the demo path.
- Every write MUST be user-initiated through Lace. No server-side signing, no \`/api/mint\`,
  no genesis wallet \u2014 those exist only on Undeployed.
- Never accept a recovery phrase / seed / private key from the user in chat, forms, screenshots,
  screenshots-of-terminals, or issue trackers. If they want to sanity-check their wallet, ship
  \`scripts/check-midnight-wallet.mjs\` that reads \`MIDNIGHT_WALLET_SEED\` from their shell env
  and prints only PUBLIC addresses.
- Show the red MAINNET banner (see EXPERIMENTAL DAPP DISCLAIMER block) and a "no audit"
  chip next to every write button. Non-dismissible on Mainnet.
- Read-only feeds via the Indexer are fine and cheap (no DUST cost).

Explorer: https://midnightexplorer.com/
Support matrix (Mainnet node ${MIDNIGHT_MATRIX.node.mainnet}): ${SUPPORT_MATRIX_URL}`;


// -----------------------------------------------------------------------------
// AGENTIC-COMMERCE OVERLAY BLOCKS (idea.protocol)
// -----------------------------------------------------------------------------
// Every agentic prompt MUST end with a Midnight transaction. Each block ships:
//   1) A Compact contract sketch specific to the protocol
//   2) A server route or facilitator sketch that submits the tx
//   3) A disclaimer + banner requirement (unaudited, hackathon use only)
//   4) A pointer to the reference showcase demo on this site

const EXPERIMENTAL_AGENTIC = `EXPERIMENTAL AGENTIC-COMMERCE BANNER — MANDATORY:

Render <ExperimentalAgenticBanner /> at the TOP of every page that touches the
agentic overlay. Copy (do NOT reword):

  "Experimental agentic commerce. Contracts are unaudited. mUSDC is a mimic
   token — no peg, no value. For hackathon and research use only. See
   https://midnightprompts.lovable.app/agentic-experimental"

The banner is non-dismissible on Mainnet. On other networks it may be collapsible
but must persist between sessions (localStorage key "agentic-banner-ack").`;

// ---------------------------------------------------------------------------
// AGENTIC_INFRA_LESSONS — 2026-08 hard-won lessons from three working repos:
//   • agenticmidnight  (A2A + AP2 anchor on Undeployed)
//   • ucpmidnight      (UCP appendEntry on Undeployed)
//   • x402midnight     (mUSDC facilitator + EffectStream Sepolia overlay)
// This appendix is included verbatim at the end of every overlay block so a
// hackathon participant pasting a single mega-prompt never needs the skill.
// ---------------------------------------------------------------------------
const AGENTIC_INFRA_LESSONS = `AGENTIC INFRA — NON-NEGOTIABLES (learned from three working repos, do NOT deviate)

1) SDK ↔ INDEXER ALIGNMENT (this is the #1 time-sink):
   Local \`indexer-standalone:4.0.2\` accepts ONLY the pinned stack:
     @midnight-ntwrk/midnight-js-contracts@4.1.1
     @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1
     @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1
     @midnight-ntwrk/midnight-js-node-zk-config-provider@4.1.1
     @midnight-ntwrk/midnight-js-level-private-state-provider@4.1.1
     @midnight-ntwrk/midnight-js-network-id@4.1.1
     @midnight-ntwrk/midnight-js-utils@4.1.1
     @midnight-ntwrk/wallet-sdk@1.2.0
     @midnight-ntwrk/testkit-js@4.1.1
     @midnight-ntwrk/zswap@4.0.0
     ws
   NEVER use @midnight-ntwrk/wallet@5 against this indexer — its GraphQL subs
   (\`wallet\`, \`ProgressUpdate\`, \`ViewingUpdate\`) don't exist on 4.0.2 and every
   deploy fails: \`Unknown field "wallet" on type "Subscription"\`.
   Deploy must use \`MidnightWalletProvider\` + \`testkit-js\`, NOT \`WalletBuilder\`.
   Every Node deploy script MUST polyfill: \`globalThis.WebSocket = ws\`.
   Every deploy import above MUST be \`bun add\`-ed into package.json — Vite dep
   resolution does NOT apply to Node scripts under scripts/.

2) NetworkId is TYPE-ONLY at 4.1.1:
   \`import { NetworkId } from "@midnight-ntwrk/midnight-js-network-id"\` returns
   a TS type, not a runtime value. Use \`setNetworkId("undeployed")\` (string).
   The wallet-sdk runtime enum is namespace-nested: \`NetworkId.NetworkId.Undeployed\`.

3) Compiled artefact resolution:
   Compact 0.31 emits ESM \`contracts/managed/<name>/contract/index.js\`.
   Deploy scripts MUST resolve \`.js\` first, \`.cjs\` only as fallback.
   Symptom of getting this wrong: \`MODULE_NOT_FOUND\` on \`contract/index.cjs\`.

4) Full \`midnight-local-dev/standalone.yml\` compose env — NOT just NODE_URL:
   \`\`\`yaml
   indexer:
     image: midnightntwrk/indexer-standalone:4.0.2
     environment:
       APP__INFRA__NODE__URL: ws://node:9944
       APP__APPLICATION__NETWORK_ID: undeployed
       APP__INFRA__STORAGE__PASSWORD: indexer
       APP__INFRA__PUB_SUB__PASSWORD: indexer
       APP__INFRA__LEDGER_STATE_STORAGE__PASSWORD: indexer
       APP__INFRA__SECRET: "303132333435363738393031323334353637383930313233343536373839303132"
       APP__INFRA__SPO_NODE__BLOCKFROST_ID: "placeholder-not-used-standalone"
     ports: ["8088:8088"]
   \`\`\`
   Missing \`APP__INFRA__SECRET\` → indexer exits at boot with
   \`missing field 'secret' for key "INFRA" in \`APP__\` environment variable(s)\`.
   Readiness check MUST be POST to /api/v4/graphql (GET returns 405).
   Available subscriptions on 4.0.2: blocks, contractActions, dustLedgerEvents,
   shieldedTransactions, unshieldedTransactions, zswapLedgerEvents. NO \`wallet\`.

5) SERVER-APPEND ARCHITECTURE (mandatory on Undeployed):
   \`\`\`
   Undeployed:  UI → POST /api/public/<verb> → genesis wallet (server) → chain
   Other nets:  UI → Lace publishKit → chain
   Reads:       indexer GraphQL, no wallet needed
   \`\`\`
   Lace CANNOT sign on Undeployed. To make server-append reload the deploy-time
   witness (avoid RpcError 117), put shared constants in \`src/lib/midnight-shared.ts\`
   and import them from BOTH \`scripts/deploy-midnight.mjs\` and every \`*.server.ts\`:
     • \`GENESIS_SEED = "0000…0002"\` — genesis-funds live on 0002, NOT 0001.
     • \`PRIVATE_STATE_ID\` — stable string, NEVER \`Date.now()\`.
     • \`PRIVATE_STATE_STORE\` — shared LevelDB store name.
     • \`PRIVATE_STORAGE_PASSWORD\` — ≥ 3 char classes.
     • \`DEPLOYER_SECRET_HEX\` — DETERMINISTIC, never \`crypto.getRandomValues\`.
     • Deterministic buyer/merchant PK via:
       \`persistentHash<Vector<2, Bytes<32>>>([pad(32, "<domain>:v1"), sk])\`

6) \`providers.privateStateProvider.setContractAddress(contractAddress)\` MUST be
   called BEFORE any get/set on every server route. Skipping this =
   \`RpcError 117: cannot find private state\` at append time.

7) Persist deploy metadata to \`src/data/midnight-contract.undeployed.json\`:
   \`{ contractAddress, deployTxId, privateStateId, buyerPk, network, deployedAt }\`.
   Server routes read this to bind \`findDeployedContract\` at request time.

8) \`levelPrivateStateProvider\` at 4.1.1 requires:
   • A **function** password provider (NOT the outdated \`{ get: async () => … }\`).
   • An explicit \`accountId\`.
   The old shape on the outer providers bag fails silently.

9) VITE CONFIG (\`vite.config.ts\`):
   • Any plugin that swaps \`@midnight-ntwrk/*\` or \`*.server.ts\` for SSR stubs
     MUST set \`apply: "build"\`. Without this, \`vite dev\` local API handlers hit
     the stub and \`/api/public/<verb>\` silently returns
     \`{ simulated: true, midnightTxHash: "0xSIMULATED" }\`.
     A UI that shows "ANCHORED" from \`0xSIMULATED\` is a bug, not a demo mode —
     fail loudly in the server route when the contract JSON is missing or
     \`VITE_NETWORK_ID !== "undeployed"\`.
   • \`optimizeDeps.exclude\` MUST include (missing entries hang dev on "Loading…"):
     "@midnight-ntwrk/testkit-js", "@midnight-ntwrk/wallet-sdk",
     "@midnight-ntwrk/midnight-js-contracts",
     "@midnight-ntwrk/midnight-js-http-client-proof-provider",
     "@midnight-ntwrk/midnight-js-indexer-public-data-provider",
     "@midnight-ntwrk/midnight-js-node-zk-config-provider",
     "@midnight-ntwrk/midnight-js-level-private-state-provider",
     "@midnight-ntwrk/midnight-js-network-id",
     "@midnight-ntwrk/midnight-js-utils", "@midnight-ntwrk/wallet",
     "@midnight-ntwrk/compact-runtime", "@midnight-ntwrk/onchain-runtime-v3",
     "pino", "ws", "ssh2", "cpu-features"

10) COMPACT GOTCHAS:
    • \`pad(32, "<domain>:v1")\` — the string MUST be ≤ 32 UTF-8 bytes.
      Approved short separators: "ap2:buyer:v1", "ucp:merchant:v1",
      "musdc:signer:v1", "abodc:author:v1". Longer names fail with
      \`cannot pad "…" to length 32 since its utf8-equivalent already exceeds\`.
    • Never initialise an \`Opaque<"string">\` ledger field with a string literal
      in \`constructor()\` — literals are \`Bytes<N>\` and the compiler rejects
      the assignment. Drop the init; set from a circuit param via \`disclose()\`.

11) UI STABILITY:
    NEVER call parent \`setState\` during render in a wallet-bubble panel.
    Chrome "Page Unresponsive" is the tell. Bubble via \`useEffect\` only.
    Symptom: Connect Lace button "does nothing" — main thread dead from a
    React infinite-update loop, not a Lace bug.

12) ACCEPTANCE RULE (source of truth = the indexer, NOT the SDK):
    Verify every Undeployed write via GraphQL POST to /api/v4/graphql:
    \`\`\`graphql
    query($a: HexEncoded!) {
      contractAction(address: $a) {
        ... on ContractCall {
          entryPoint
          transaction { hash block { height } }
        }
      }
    }
    \`\`\`
    The midnight-js \`txId\` returned by \`callTx\` and the indexer ledger \`hash\`
    are DIFFERENT strings — both are real. Never string-match one against the
    other. Never accept \`0xSIMULATED\` as success in the UI.
    After every \`midnight:down\`/\`up\`: redeploy AND restart Vite (LevelDB is
    wiped, and \`ctxPromise\` is cached in-process).`;


const A2A_AP2_BLOCK = `AGENTIC OVERLAY — A2A + AP2 (Google Agent-to-Agent + Agent Payments Protocol)

This idea sits on the A2A 0.3 negotiation loop and closes with an AP2 CartMandate
anchored on Midnight. Reference: https://a2a.dev · https://github.com/google-agentic-commerce/AP2

A2A ENVELOPE (JSON-RPC 2.0, transport = HTTPS):
  POST /agent   { "jsonrpc":"2.0", "id":"<uuid>", "method":"message/send",
                  "params": { "message": { "parts": [
                    { "kind": "data",
                      "mimeType": "application/vnd.ap2.intent-mandate+json",
                      "data": { … } } ] } } }
  Status machine: submitted → working → input-required → completed | rejected | failed
  Buyer/seller MIME types (do NOT drift — verifiers key off these strings):
    • application/vnd.ap2.intent-mandate+json
    • application/vnd.ap2.cart-mandate+json
    • application/vnd.ap2.payment-mandate+json

FLOW (implement exactly this shape):
  1) Buyer agent POSTs an A2A "message/send" with an IntentMandate DataPart.
  2) Seller agent replies with one or more CartMandate offers as DataParts
     (MIME: application/vnd.ap2.cart-mandate+json).
  3) Buyer signs the chosen CartMandate with a Compact-witness proof binding
     the cart hash to their buyer public key. This is NOT EIP-712 — cross-
     verifying AP2 mandates from this stack against EVM verifiers will NOT work.
     Buyer public keys are Compact-witness derived (see contract below).
  4) Server calls /api/public/ap2-anchor which submits anchorMandate(...) on
     the MandateVault Compact contract deployed for this project.
  5) UI displays the negotiation transcript AND the resulting Midnight tx hash
     with a link to the Indexer.

REQUIRED CONTRACT — contracts/MandateVault.compact
\`\`\`compact
pragma language_version 0.23;
import CompactStandardLibrary;

// Cart mandate anchors: each entry is (mandateHash, buyerAddress, sellerAddress, amount).
export ledger anchored_count: Counter;
export ledger last_mandate_hash: Bytes<32>;
export ledger last_buyer: Bytes<32>;
export ledger last_seller: Bytes<32>;
export ledger last_amount: Uint<64>;

witness buyerSecret(): Bytes<32>;

constructor() {
  anchored_count.increment(1);
}

// Anchor a signed CartMandate on-chain. Every write is disclosed intentionally.
export circuit anchorMandate(
  mandateHash: Bytes<32>,
  buyer: Bytes<32>,
  seller: Bytes<32>,
  amount: Uint<64>,
): [] {
  // Bind the anchor to the buyer's private key (witness) to prove the buyer
  // authorised THIS mandate, without revealing the key itself.
  // Domain separator "ap2:buyer:v1" is 12 UTF-8 bytes — safely under pad(32).
  // NEVER reuse "ucp:merchant:v1" here — cross-verifier failures otherwise.
  const sk = buyerSecret();
  const pk = persistentHash<Vector<2, Bytes<32>>>([pad(32, "ap2:buyer:v1"), sk]);
  assert(pk == buyer, "buyer signature invalid");

  last_mandate_hash = disclose(mandateHash);
  last_buyer = disclose(buyer);
  last_seller = disclose(seller);
  last_amount = disclose(amount);
  anchored_count.increment(1);
}
\`\`\`

REQUIRED SERVER ROUTE — src/routes/api/public/ap2-anchor.ts

- POST { mandateHash, buyer, seller, amount, proof, publicInputs }
- On Undeployed:
    • Uses the SHARED src/lib/midnight-shared.ts constants (GENESIS_SEED "…0002",
      deterministic DEPLOYER_SECRET_HEX, stable PRIVATE_STATE_ID, shared store).
    • Instantiates providers via src/lib/midnight-providers.server.ts.
    • Calls providers.privateStateProvider.setContractAddress(contractAddress).
    • Uses findDeployedContract + callTx.anchorMandate(...).
    • Returns { midnightTxHash, network: "undeployed", indexerUrl, simulated: false }.
- On Preview/Preprod: uses the caller's Lace \`publishKit\` — server just validates.
- On missing contract JSON or VITE_NETWORK_ID !== "undeployed" for the Undeployed
  path: return HTTP 500 with a clear error. NEVER return midnightTxHash "0xSIMULATED"
  with success:true — a lying success is worse than a hard failure.

BUYER PK DERIVATION (client-side, must match the circuit EXACTLY):
  \`persistentHash<Vector<2, Bytes<32>>>([pad(32, "ap2:buyer:v1"), sk])\`
  No extra fields, no different order, no reused domain separator.

REFERENCE SHOWCASE: /showcase/a2a-ap2-negotiation on this site is the canonical
buyer↔seller negotiation demo with an anchored CartMandate.

${AGENTIC_INFRA_LESSONS}

${EXPERIMENTAL_AGENTIC}`;

const UCP_BLOCK = `AGENTIC OVERLAY — UCP (Universal Commerce Protocol)

This idea uses UCP's typed checkout schema and closes by recording the order on a
Midnight OrderLedger contract. The discovery + self-test endpoints stay off-chain.

FLOW:
  1) Merchant serves GET /api/public/ucp/discovery — signed with RFC 9421
     HTTP Message Signatures. The signing key's fingerprint is anchored ONCE
     on OrderLedger.recordSigningKey when the app first boots.
  2) Buyer POSTs to /api/public/ucp/checkout with { items, buyer, currency }.
  3) Server validates the checkout with Zod, computes itemHash = keccak256(items),
     assigns an orderId, and calls appendEntry / recordOrder(orderId, itemHash,
     buyer, amount) on the OrderLedger Compact contract.
  4) Server returns a UCP-shaped order receipt signed with RFC 9421 including a
     "Midnight-Tx" custom header carrying the tx hash.
  5) UI shows the signed-headers view side-by-side with the Midnight tx hash.

BOOTSTRAP RULE (do not skip):
  recordSigningKey MUST be called EXACTLY ONCE — either from a bootstrap route
  or the deploy script — before the first UCP checkout. If a receipt's RFC 9421
  signature verifies but the on-chain \`signing_key_fpr\` is still the zero value,
  the app skipped bootstrap. Callers verify RFC 9421 signatures against the
  on-chain fingerprint, NOT just the discovery doc.

REQUIRED CONTRACT — contracts/OrderLedger.compact
\`\`\`compact
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger order_count: Counter;
export ledger last_order_id: Bytes<32>;
export ledger last_item_hash: Bytes<32>;
export ledger last_buyer: Bytes<32>;
export ledger last_amount: Uint<64>;
export ledger signing_key_fpr: Bytes<32>;

witness merchantSecret(): Bytes<32>;

constructor() {
  order_count.increment(1);
}

// Pin the merchant's UCP signing-key fingerprint on-chain. Callers can verify
// RFC 9421 signatures against this record instead of trusting discovery alone.
// Domain separator "ucp:merchant:v1" is 15 UTF-8 bytes — safe under pad(32).
export circuit recordSigningKey(fpr: Bytes<32>): [] {
  const sk = merchantSecret();
  const pk = persistentHash<Vector<2, Bytes<32>>>([pad(32, "ucp:merchant:v1"), sk]);
  assert(pk == signing_key_fpr || signing_key_fpr == default<Bytes<32>>(),
         "merchant signature invalid");
  signing_key_fpr = disclose(fpr);
}

export circuit recordOrder(
  orderId: Bytes<32>,
  itemHash: Bytes<32>,
  buyer: Bytes<32>,
  amount: Uint<64>,
): [] {
  last_order_id = disclose(orderId);
  last_item_hash = disclose(itemHash);
  last_buyer = disclose(buyer);
  last_amount = disclose(amount);
  order_count.increment(1);
}
\`\`\`

REQUIRED SERVER ROUTES — src/routes/api/public/
  - ucp-discovery.ts   → GET; returns the discovery document, RFC 9421 signed
                         over covered components (@method, @path, @authority,
                         content-digest, date). Include \`keyid\` = the SHA-256
                         fingerprint that was recorded on-chain.
  - ucp-checkout.ts    → POST; validates with Zod, calls recordOrder via the
                         shared Undeployed provider bag (see AGENTIC INFRA
                         section §5 — same pattern as anchorMandate).
  - ucp-self-test.ts   → GET; runs the UCP conformance self-test off-chain:
                         verifies its own discovery signature, round-trips a
                         Zod-validated checkout envelope, asserts on-chain
                         \`signing_key_fpr\` matches the discovery keyid, and
                         returns { pass: boolean, checks: [...] }.

MERCHANT PK DERIVATION (must match the circuit):
  \`persistentHash<Vector<2, Bytes<32>>>([pad(32, "ucp:merchant:v1"), sk])\`

REFERENCE SHOWCASE: /showcase/ucp-zk-checkout on this site.

${AGENTIC_INFRA_LESSONS}

${EXPERIMENTAL_AGENTIC}`;

const X402_BLOCK = `AGENTIC OVERLAY — x402 with mUSDC (mimic USDC) on Midnight + EffectStream Sepolia overlay

This idea ports the x402 v2 pay-per-call protocol (originally EVM-only) to
Midnight. USDC is NOT native to Midnight — we ship a mimic token, MidnightUSDC.
No peg, no value — hackathon experiment. The prompt MUST make this loud and clear.

BASELINE (ported from the Optimism Blockchain Catalyst project — same envelope,
same header casing):
  - v2 envelope: { x402Version: 2, accepted, payload: { signature, authorization } }
    (v1 shape { scheme, network, payload } at the top level is REJECTED as
     \`invalid_payload\`. Wrap the chosen PaymentRequirement under \`accepted\`.)
  - Literal-cased headers: PAYMENT-SIGNATURE (request) / PAYMENT-RESPONSE (response)
  - Same-origin proxy route to sidestep CORS on external facilitators
  - Per-request random 32-byte nonce; validAfter=now-60s; validBefore=now+300s
  - Idempotent per nonce: concurrent retries return the first result.

MIDNIGHT-SPECIFIC ADAPTATIONS:
  - Scheme = "midnight-mUSDC" (NOT "exact")
  - Network id = "midnight:preview" | "midnight:preprod" | "midnight:undeployed"
  - Signature = Compact-witness proof over (from, to, amount, nonce, expiry)
    binding a witness secret key. Domain values are read from the deployed
    MidnightUSDC contract, not from requirement.extra (same rule as EVM x402 —
    trusting requirement.extra silently breaks the digest).
  - Settlement = facilitator submits MidnightUSDC.transfer(from, to, amount) as
    a real tx on Midnight. Returns the Midnight tx hash in PAYMENT-RESPONSE.

MULTI-ACCEPT CHALLENGE (mandatory for the EffectStream demo):
  /api/public/x402-challenge MUST advertise BOTH rails so the client picks one:
  \`\`\`json
  { "x402Version": 2,
    "accepts": [
      { "scheme": "midnight-mUSDC", "network": "midnight:undeployed",
        "asset": "<MidnightUSDC address>", "amount": "10000",
        "maxTimeoutSeconds": 300 },
      { "scheme": "exact", "network": "eip155:11155111",
        "asset": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",  // USDC Sepolia
        "amount": "10000", "extra": { "name": "USD Coin", "version": "2" },
        "maxTimeoutSeconds": 300 },
      { "scheme": "exact", "network": "eip155:11155111",
        "asset": "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4",  // EURC Sepolia
        "amount": "10000", "extra": { "name": "EURC", "version": "1" },
        "maxTimeoutSeconds": 300 },
      { "scheme": "exact", "network": "eip155:11155111",
        "asset": "0x3a3fe695F684Bf9b9e43CF43C2b895Ea5e392bB3",  // cirBTC Sepolia
        "amount": "1000",  "extra": { "name": "cirBTC", "version": "1" },
        "maxTimeoutSeconds": 300 } ] }
  \`\`\`
  Per-asset decimals: USDC = 6, EURC = 6, cirBTC = 8.
  Use a helper: \`priceMicroUsdToTokenAtomic(asset, priceMicroUsd)\`.

REQUIRED CONTRACT — contracts/MidnightUSDC.compact
\`\`\`compact
pragma language_version 0.23;
import CompactStandardLibrary;

// mUSDC — mimic USDC. 6 decimals like real USDC.
export ledger total_supply: Uint<64>;
export ledger balances: Map<Bytes<32>, Uint<64>>;
// Anti-replay: spent nonces on-chain (client MUST also generate a fresh
// crypto.getRandomValues(new Uint8Array(32)) per attempt — never reuse).
export ledger spent_nonces: Set<Bytes<32>>;

witness senderSecret(): Bytes<32>;

constructor() {
  total_supply = 0;
}

// Faucet: anyone can mint a small amount for demo. Hackathon-only.
export circuit faucet(to: Bytes<32>, amount: Uint<64>): [] {
  assert(amount <= 10000000 as Uint<64>, "faucet cap: 10 mUSDC");
  const prev = balances.member(disclose(to)) ? balances.lookup(disclose(to)) : 0 as Uint<64>;
  balances.insert(disclose(to), disclose((prev + amount) as Uint<64>));
  total_supply = disclose((total_supply + amount) as Uint<64>);
}

// EIP-3009-style transfer with authorization. Nonce prevents replay.
// Domain separator "musdc:signer:v1" is 15 UTF-8 bytes — safe under pad(32).
export circuit transfer(
  from: Bytes<32>,
  to: Bytes<32>,
  amount: Uint<64>,
  nonce: Bytes<32>,
): [] {
  const sk = senderSecret();
  const pk = persistentHash<Vector<2, Bytes<32>>>([pad(32, "musdc:signer:v1"), sk]);
  assert(pk == from, "signer does not match from address");
  assert(!spent_nonces.member(disclose(nonce)), "nonce already spent");

  const fromBal = balances.member(disclose(from)) ? balances.lookup(disclose(from)) : 0 as Uint<64>;
  assert(fromBal >= amount, "insufficient mUSDC");
  const toBal = balances.member(disclose(to)) ? balances.lookup(disclose(to)) : 0 as Uint<64>;

  balances.insert(disclose(from), disclose((fromBal - amount) as Uint<64>));
  balances.insert(disclose(to),   disclose((toBal + amount) as Uint<64>));
  spent_nonces.insert(disclose(nonce));
}
\`\`\`

REQUIRED SERVER ROUTES — src/routes/api/public/
  - x402-challenge.ts    → 402 with the multi-accept accepts[] above
  - x402-verify.ts       → verifies the mUSDC proof against the contract's verifier
  - x402-settle.ts       → submits MidnightUSDC.transfer, returns Midnight tx hash
  - x402-proxy.ts        → same-origin CORS proxy that forwards PAYMENT-SIGNATURE
                           (request) + PAYMENT-RESPONSE (response) verbatim
  - sepolia-fulfill.ts   → after a successful Sepolia payment, triggers the
                           Midnight \`anchorChunk\` overlay (see EffectStream)

PAYMENT-RESPONSE payload (base64 JSON):
  { "success": true, "network": "midnight:<net>", "payer": "mn_addr…",
    "midnightTxHash": "0x…", "indexerUrl": "https://…" }

EFFECTSTREAM — SEPOLIA OVERLAY (not a bridge):
  EffectStream syncs a Sepolia Circle-asset payment into a Midnight
  \`anchorChunk(chunkHash)\` call on a \`StreamingChoreographyIP\` contract.
  Assets STAY on Sepolia — Midnight only stores the chunk anchor.
  UI copy MUST NOT describe this as "bridging USDC onto Midnight".
  Repo reference: https://github.com/effectstream/effectstream

  Sepolia paywall requirements:
    • \`ChunkPaywall.sol\` with \`pay(token, chunkHash, amount)\`, an allowlist of
      Circle tokens, and a \`ChunkPaid\` event.
    • Deploy with \`forge create --broadcast\`. WITHOUT \`--broadcast\`, forge
      silently dry-runs and reports success while nothing lands on-chain —
      always confirm on Sepolia Etherscan via \`cast receipt\` before continuing.
    • Verify with Etherscan V2 (V1 hosts are deprecated):
        --verifier-url https://api.etherscan.io/v2/api?chainid=11155111
        --skip-is-verified-check
      (V1's is-verified preflight misreports valid V2 keys as \`Invalid API Key\`.)
    • Also verify on Sourcify — Sourcify ≠ Etherscan.

  Wallet + RPC failure modes to plan for BEFORE writeContract:
    • Infura rejects any gas > 2²⁴ = 16 777 216. When \`eth_estimateGas\` fails
      (usually 0 token balance / no allowance / simulation revert), MetaMask
      falls back to 21 000 000 → Infura rejects → viem wraps as if it were a
      contract revert. Fix by funding + approving first, then relying on
      \`estimateContractGas\` output. Map RPC gas-cap errors in the UI to a
      clear "estimation failed; check balance & allowance" message.
    • Surface \`balance ≥ required\` + allowance side-by-side with the pay
      button, including a link to https://faucet.circle.com/ for Sepolia
      Circle tokens.

  \`/api/public/sepolia-fulfill\` FAIL-LOUD contract:
    Return HTTP error (not 200) when either:
      - the SCIP contract JSON is missing, OR
      - \`VITE_NETWORK_ID !== "undeployed"\`.
    NEVER return \`midnightTxHash: "0xSIMULATED"\` with \`success: true\`.

TWO WALLETS, TWO NETWORKS (do not conflate in code or UI copy):
  • Sepolia   → MetaMask + Circle-faucet-funded USDC/EURC/cirBTC.
  • Undeployed → server-side genesis wallet (see AGENTIC INFRA §5).
  Lace on Undeployed still needs tDUST if the user signs client-side;
  server-append uses genesis funds instead — do NOT force Lace here.

REFERENCE SHOWCASE: /showcase/x402-midnight-paywall on this site.

FAILURE MODES (self-diagnostic table — copy into README):
  | Symptom                                                                       | Cause                                                       | Fix                                                              |
  |-------------------------------------------------------------------------------|-------------------------------------------------------------|------------------------------------------------------------------|
  | \`Unknown field "wallet" on type "Subscription"\`                              | wallet@5 against indexer 4.0.2                              | Pin the stack in AGENTIC INFRA §1                                |
  | \`missing field 'secret' for key "INFRA"\`                                     | Compose only sets NODE_URL                                  | Adopt the full standalone.yml env in AGENTIC INFRA §4            |
  | \`cannot pad "…" to length 32\`                                                | Domain separator > 32 UTF-8 bytes                           | Use short separators — AGENTIC INFRA §10                         |
  | \`disclose("(empty)")\` compile error                                          | Literal assigned to \`Opaque<"string">\` field                | Drop constructor init                                            |
  | \`MODULE_NOT_FOUND\` on \`contract/index.cjs\`                                  | Compact 0.31 emits ESM \`.js\`                               | Resolve \`.js\` first — AGENTIC INFRA §3                          |
  | \`NetworkId is not defined\` at runtime                                        | Type-only at 4.1.1                                          | \`setNetworkId("undeployed")\` — AGENTIC INFRA §2                 |
  | \`/api/public/<verb>\` always returns \`simulated: true\` in dev                | \`midnightSsrStub()\` runs on all SSR                        | Gate with \`apply: "build"\` — AGENTIC INFRA §9                   |
  | \`RpcError 117\`                                                               | Random deployerSecret / privateStateId / store between deploy and server | Shared \`src/lib/midnight-shared.ts\` — AGENTIC INFRA §5    |
  | Indexer POST returns 405                                                      | Sent GET                                                    | GraphQL requires POST — AGENTIC INFRA §12                        |
  | Chrome "Page Unresponsive" on wallet-connect                                  | Parent \`setState\` during render                             | Bubble via \`useEffect\` only — AGENTIC INFRA §11                 |
  | UI shows "ANCHORED" with \`0xSIMULATED\`                                       | Server silently returned fake hash                          | Fail loudly; verify via indexer \`contractAction\` — §12          |
  | Etherscan verify: \`Invalid API Key\` on a valid key                           | Foundry hit V1 host                                         | V2 with \`--skip-is-verified-check\`                              |
  | \`gas limit too high (cap: 16777216, tx: 21000000)\`                           | estimateGas failed → MetaMask 21M fallback → Infura cap     | Fund + approve first; surface balance vs required                |
  | \`forge create\` "succeeded" but nothing on-chain                              | Missing \`--broadcast\`                                       | Add \`--broadcast\`; verify explorer receipt                      |

${AGENTIC_INFRA_LESSONS}

${EXPERIMENTAL_AGENTIC}`;

const PROTOCOL_BLOCKS: Record<Protocol, string> = {
  "a2a-ap2": A2A_AP2_BLOCK,
  "ucp":     UCP_BLOCK,
  "x402":    X402_BLOCK,
};


export function buildVariant(idea: Idea, theme: Theme, network: NetworkVariant, os: OSTarget = "macos"): string {
  const { title, pitch, subDiscipline: sub } = idea;
  const hid = idea.quantumHookId || "compact-deploy";
  const hook = HOOKS[hid] ?? HOOKS["compact-deploy"];
  const hookName = hook.name;
  const rationale = idea.quantumRationale || `This idea fits ${hookName} because it needs ${hook.tag}.`;

  const pair = BODY_BY_HOOK[hid] ?? BODY_BY_HOOK["compact-deploy"];
  const contract = pair.contract(title, pitch);
  const body = pair.body(title, pitch, sub, contract);

  const netLabel = NETWORK_LABELS[network] ?? network;
  const netSecrets = NETWORK_SECRETS[network] ?? NETWORK_SECRETS.preview;
  const localBlock = network === "undeployed" ? `\n\n${localStackSetup(os)}\n` : "";
  const undeployedFundBlock = network === "undeployed" ? `\n${UNDEPLOYED_FUND_LACE}\n` : "";
  const flyioBlock = network === "undeployed" ? `\n${HOSTING_FLYIO}\n` : "";
  const mainnetBlock = network === "mainnet" ? `\n${MAINNET_ACQUIRE}\n` : "";
  const protocolBlock = idea.protocol ? `\n\n${PROTOCOL_BLOCKS[idea.protocol]}\n` : "";


  return `${MATRIX_PREAMBLE}

Build "${title}" in ONE Lovable message. Single-page Midnight ZK demo.

TARGET NETWORK: **${netLabel}** (VITE_NETWORK_ID = \`${network}\`)
This is one of FOUR variants of the same idea — Preview / Preprod / Undeployed / Mainnet. Only the network
config, secrets, signing surface, and disclaimers differ. Contract + UI + Lace flow are otherwise identical.

CONCEPT
${pitch}
Discipline: ${theme.name} (${sub}).
Onchain primitive: ${hookName} (${hook.tag}). Why this primitive: ${rationale}

${BUDGET}

STACK
- React + Vite single page (index route only).
- Midnight ${netLabel}. Compact language 0.23. MidnightJS SDK 4.1.1.
- Lace wallet is the sole auth surface — no Privy, no MetaMask, no OAuth.
- Local proof server (Docker port 6300) does all ZK proving. The UI shows Proving state.
- No SSR. All MidnightJS imports live behind \`<ClientOnly>\` + \`useEffect\`.

${PACKAGES}

${TOOLCHAIN_BY_OS[os]}
${localBlock}${undeployedFundBlock}${flyioBlock}${mainnetBlock}
${EXPERIMENTAL_DISCLAIMER}

${SCRIPTS_FOLDER}

${VITE_CONFIG}

${MIDNIGHTJS_BOOT}

${ASYNC_BUFFER_CLIENT_ENTRY}

${SIGNING_STRATEGY}

${KIT_FEED_PERSISTENCE}

${FRONTEND_STANDARDS}

${PRIVATE_STATE_PROVIDER}

${TANSTACK_START}

${body}
${protocolBlock}
${inAppSetupPanel(network, os)}


${REDFLAGS}

${netSecrets}

FURTHER REFERENCE (community skills registry — browsable, per-primitive scaffolds):
- Site:   https://midnight-skills.netlify.app
- Source: https://github.com/Kali-Decoder/Midnight-skills
- This app's Undeployed quick-start: https://midnightprompts.lovable.app/undeployed
- This app's preflight checks:      https://midnightprompts.lovable.app/undeployed-preflight
- \`compact\`                    — Compact 0.23 language deep-dive, ledger vs witness, disclose(), Merkle patterns
- \`react-wallet-connector\`     — full DApp Connector API scaffold (enumerate window.midnight by UUID)
- \`midnight-environment-setup\` — Compact compiler + Docker + proof server bring-up
- \`indexer\`                    — public data provider + GraphQL patterns for read-only ledger views
- \`example-locker-dapp\`        — timelock vault reference (blockTimeGte, receive/sendUnshielded)
- \`example-counter\`            — smallest end-to-end Compact + MidnightJS reference
- Fly.io hosting (four-app topology + failure-mode table): https://midnightprompts.lovable.app/undeployed#flyio
- Signing strategy (Undeployed uses server /api/mint; Preview/Preprod uses Lace publishKit): see SIGNING STRATEGY block above
If the target Lovable session is on this workspace, those six skills are already active. Otherwise, drop
\`.agents/skills/<name>/SKILL.md\` into your project from the repo above and run \`skills--apply_draft\`.

CREDIT (must appear in UI footer AND as a header comment on every Compact contract):
${CREDIT}
`.replace(/\s+$/, "") + WALLET_BOILERPLATE;
}
