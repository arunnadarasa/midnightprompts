// AUTO-GENERATED helper. Constants mirrored from scripts/rewrite_mega_prompts.py.
// If you change any block here, mirror the same edit in the Python script
// (or vice-versa) so regenerated JSON and runtime prompts stay in sync.

import type { Idea, Theme, NetworkVariant } from "@/data/ideas";

export type OSTarget = "macos" | "windows" | "linux";
export const OS_LABELS: Record<OSTarget, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
};

const CREDIT = "Built during the Creative AI & Quantum Hackathon organised by StreetKode Fam during Indian Krump Festival 14";

const BUDGET = "5-CREDIT BUDGET (HARD LIMIT):\n- ONE single-page Vite + React app. No router, no Lovable Cloud, no database, no server-side auth.\n- ONE Compact contract, \u226480 lines, deployed to Midnight preview testnet.\n- Lace wallet is the auth + tx layer. `window.midnight` is polled; the shielded address is the identity.\n- A locally-run proof server (Docker port 6300) is REQUIRED for any tx submit; the UI must show a\n  \"Proving\u2026 this can take 30\u2013120s\" state and stay usable while proofs generate.\n- Pinata / IPFS only if the idea genuinely stores a file or artefact \u2014 then the CID is committed on-chain.\n- At most ONE AI call per user action (Lovable AI Gateway with LOVABLE_API_KEY if AI is part of the idea).\n- Skip tests, skip CI, skip docs pages. Ship the demo, nothing else.";

const PACKAGES = "PACKAGES (all pinned to the versions Midnight ships together):\n- @midnight-ntwrk/dapp-connector-api@4.0.1\n- @midnight-ntwrk/midnight-js-contracts@4.1.1\n- @midnight-ntwrk/midnight-js-types@4.1.1\n- @midnight-ntwrk/midnight-js-protocol@4.1.1\n- @midnight-ntwrk/midnight-js-network-id@4.1.1\n- @midnight-ntwrk/midnight-js-fetch-zk-config-provider@4.1.1\n- @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1\n- @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1\n- @midnight-ntwrk/midnight-js-utils@4.1.1\n- @midnight-ntwrk/compact-runtime@0.16.0\n- rxjs fp-ts semver buffer pino\n- vite-plugin-wasm  vite-plugin-top-level-await  (dev)";

const TOOLCHAIN_COMMON = "COMPACT TOOLCHAIN (one-time setup \u2014 the human runs this in a terminal, not Lovable):\n```bash\ncurl --proto '=https' --tlsv1.2 -LsSf \\\n  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh\nsource ~/.bashrc && compact update\ncompact compile contracts/YourContract.compact contracts/managed/your-contract\ncp -r contracts/managed/your-contract/keys public/keys\ncp -r contracts/managed/your-contract/zkir public/zkir\ndocker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v\n```";

const TOOLCHAIN_BY_OS: Record<OSTarget, string> = {
  macos: `${TOOLCHAIN_COMMON}\n\nmacOS prerequisites (run BEFORE the block above):\n\`\`\`bash\n# Docker Desktop (Apple Silicon or Intel):\nbrew install --cask docker    # or download from docker.com/products/docker-desktop\nopen -a Docker                # wait for the whale icon in the menu bar to go steady\n# Node.js LTS (for bun scripts + npx):\nbrew install node             # or nvm install --lts\n\`\`\`\nApple Silicon note: proof-server image is multi-arch \u2014 no --platform flag needed. If Docker\nDesktop stalls at "Starting", quit + reopen; if that fails, reset to factory defaults from\nthe Troubleshoot menu. Copy-button walkthrough: https://midnightprompts.lovable.app/proof-server#docker-setup`,
  windows: `${TOOLCHAIN_COMMON}\n\nWindows prerequisites \u2014 three real blockers people actually hit; do these BEFORE the block above:\n\n  (1) Enable Virtualization in BIOS/UEFI.\n      Task Manager \u2192 Performance \u2192 CPU must show "Virtualization: Enabled". If Disabled,\n      shut down, tap Esc/F10 (HP) or F2/Del at boot, enable SVM Mode / AMD-V / Intel VT-x /\n      Virtualization Technology, save & exit. Without this, Docker Desktop's WSL2 backend cannot start.\n\n  (2) Enable Windows features + update WSL.\n      Win+R \u2192 \`optionalfeatures\` \u2192 tick Windows Subsystem for Linux, Virtual Machine Platform,\n      Windows Hypervisor Platform \u2192 OK \u2192 reboot. Then in PowerShell (Admin):\n      \`\`\`powershell\n      wsl --update\n      wsl --install\n      \`\`\`\n\n  (3) Install Node.js LTS + fix PowerShell execution policy.\n      Download Windows x64 LTS .msi from https://nodejs.org/download (keep "Add to PATH").\n      If \`npm install\` errors with "running scripts is disabled":\n      \`\`\`powershell\n      Set-ExecutionPolicy RemoteSigned -Scope CurrentUser\n      \`\`\`\n\nAfter those three: install Docker Desktop with "Use the WSL 2 based engine" + Ubuntu integration,\nthen run the toolchain commands ABOVE from INSIDE the WSL2 Ubuntu shell (not PowerShell) so\nlocalhost:6300 port forwarding to Windows browsers works. Full walkthrough with copy buttons:\nhttps://midnightprompts.lovable.app/proof-server#docker-setup`,
  linux: `${TOOLCHAIN_COMMON}\n\nLinux prerequisites (Ubuntu/Debian shown; adapt for your distro):\n\`\`\`bash\nsudo apt update\nsudo apt install -y docker.io docker-compose-plugin curl nodejs npm\nsudo systemctl enable --now docker\nsudo usermod -aG docker "$USER" && newgrp docker\n\`\`\`\nFedora: \`sudo dnf install docker docker-compose-plugin nodejs\`.\nArch:   \`sudo pacman -S docker docker-compose nodejs npm\`.\nVerify: \`docker run --rm hello-world\` should print the welcome banner without sudo.\nCopy-button walkthrough: https://midnightprompts.lovable.app/proof-server#docker-setup`,
};

const VITE_CONFIG = "VITE CONFIG (vite.config.ts) \u2014 WASM + top-level await are MANDATORY for MidnightJS:\n```ts\nimport { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport wasm from 'vite-plugin-wasm';\nimport topLevelAwait from 'vite-plugin-top-level-await';\nexport default defineConfig({\n  build: { target: 'esnext', commonjsOptions: { transformMixedEsModules: true, extensions: ['.js','.cjs'] } },\n  plugins: [react(), wasm(), topLevelAwait()],\n  optimizeDeps: {\n    esbuildOptions: { target: 'esnext', supported: { 'top-level-await': true } },\n    include: ['@midnight-ntwrk/compact-runtime'],\n    exclude: ['@midnight-ntwrk/onchain-runtime-v3',\n              '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm'],\n  },\n});\n```\n\nSSR RULE: never import a `@midnight-ntwrk/*` package at module scope of a route file \u2014 it uses\nNode Buffer + browser globals + WASM top-level await and crashes SSR. Load providers behind\n`useEffect` or a dynamic `import()` inside a `<ClientOnly>` boundary.";

const MIDNIGHTJS_BOOT = "WALLET DETECT (src/lib/lace.ts) \u2014 poll window.midnight up to 5s:\n```ts\nimport type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';\nimport semver from 'semver';\nexport async function waitForLace(timeoutMs = 5000): Promise<InitialAPI> {\n  return new Promise((resolve, reject) => {\n    const start = Date.now();\n    const t = setInterval(() => {\n      const m = (window as any).midnight ?? {};\n      const w = Object.values(m).find((x: any) =>\n        x && typeof x === 'object' && 'apiVersion' in x &&\n        semver.satisfies(x.apiVersion, '4.x')) as InitialAPI | undefined;\n      if (w) { clearInterval(t); resolve(w); return; }\n      if (Date.now() - start > timeoutMs) { clearInterval(t);\n        reject(new Error('Lace Midnight wallet not found. Install it: https://www.lace.io/')); }\n    }, 100);\n  });\n}\n```\n\nBUFFER POLYFILL (src/main.tsx, MUST be the very first line):\n```ts\nimport { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;\n```\n\nPROVIDERS (src/lib/providers.ts) \u2014 chain Lace + proof server + indexer:\n```ts\nimport { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';\nimport { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';\nimport { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';\nimport { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';\nimport { waitForLace } from './lace';\n\nexport async function initProviders() {\n  setNetworkId(import.meta.env.VITE_NETWORK_ID ?? 'preview');\n  const lace = await waitForLace();\n  const connectedAPI = await lace.connect(import.meta.env.VITE_NETWORK_ID ?? 'preview');\n  const cfg = await connectedAPI.getConfiguration();\n  const zk = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));\n  return {\n    connectedAPI,\n    zkConfigProvider: zk,\n    proofProvider: httpClientProofProvider(cfg.proverServerUri ?? import.meta.env.VITE_PROOF_SERVER_URL, zk),\n    publicDataProvider: indexerPublicDataProvider(cfg.indexerUri, cfg.indexerWsUri),\n  };\n}\n```\n\nREAD-ONLY LEDGER FETCH (no wallet needed \u2014 great for public feeds):\n```ts\nconst INDEXER = import.meta.env.VITE_INDEXER_URL;\nexport async function readLedger(address: string) {\n  const r = await fetch(INDEXER, {\n    method: 'POST', headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      query: `query($a:HexEncoded!){ contractAction(address:$a){ state } }`,\n      variables: { address },\n    }),\n  });\n  return (await r.json()).data?.contractAction?.state as string | null;\n}\n```";

const REDFLAGS = "RED FLAGS \u2014 DO NOT ATTEMPT:\n- No bridging to Ethereum / any EVM chain. Midnight is a standalone L1; there is no bridge.\n- No oracle / external HTTP data inside a circuit. Circuits are bounded and cannot do I/O.\n- No sub-second finality UX. Proofs for k=14 circuits take 30\u2013120s \u2014 build for that latency.\n- No recursion in Compact. Loops must be bounded by compile-time constants.\n- No SSR. MidnightJS uses browser globals + WASM + top-level-await; ClientOnly is mandatory.";

const LOCAL_STACK_INTRO = "LOCAL STACK SETUP (Undeployed variant only \u2014 humans run this in a terminal, NOT Lovable):\n\nThe `undeployed` target expects a full Midnight standalone stack (node + indexer + proof server)\nrunning on your own machine. All three services are Docker containers.\n\n--- One-command bring-up (after Docker is running) ---\n```bash\nbun scripts/midnight-standalone.mjs up      # pull + start + wait for ready\nbun scripts/midnight-standalone.mjs status  # check health\nbun scripts/midnight-standalone.mjs down    # stop\n```\nThe `up` command writes `.midnight/standalone.docker-compose.yml`, pulls pinned node / indexer /\nproof-server images, starts the three services, and polls readiness on ws://localhost:9944,\nhttp://localhost:8088/api/v4/graphql, and http://localhost:6300/health. First run pulls ~1 GB\nand takes 2-5 min; later boots are seconds.\n\nThen verify in the browser: navigate to `/undeployed-preflight` in the app. Four green pills = ready.\n\nFor a human-readable walkthrough with copy buttons, also see:\nhttps://midnightprompts.lovable.app/undeployed";

const LOCAL_STACK_DOCKER_BY_OS: Record<OSTarget, string> = {
  macos: "--- Docker prerequisites (macOS) ---\n```bash\nbrew install --cask docker      # or download from docker.com/products/docker-desktop\nopen -a Docker                  # wait for whale icon in menu bar to go steady\n```\nApple Silicon: proof-server image is multi-arch, no --platform flag needed.\n\nExpanded copy-button guide with official Docker links, a CLI cheat sheet, and common errors:\nhttps://midnightprompts.lovable.app/proof-server#docker-setup",
  windows: "--- Docker prerequisites (Windows / WSL2) ---\nThree real blockers people actually hit; do these BEFORE `wsl --install`:\n\n  (1) Enable Virtualization in BIOS/UEFI.\n      Task Manager \u2192 Performance \u2192 CPU must show \"Virtualization: Enabled\". If Disabled,\n      shut down, tap Esc/F10 (HP) or F2/Del at boot, enable SVM Mode / AMD-V / Intel VT-x /\n      Virtualization Technology, save & exit. Without this, Docker Desktop's WSL2 backend cannot start.\n\n  (2) Enable Windows features + update WSL.\n      Win+R \u2192 `optionalfeatures` \u2192 tick Windows Subsystem for Linux, Virtual Machine Platform,\n      Windows Hypervisor Platform \u2192 OK \u2192 reboot. Then in PowerShell (Admin):\n      ```powershell\n      wsl --update\n      wsl --install\n      ```\n      If `wsl --update` errors with 0x8024001e / 0x80070002, redo (2) and reboot before retrying.\n\n  (3) Install Node.js LTS + fix PowerShell execution policy.\n      Download Windows x64 LTS .msi from https://nodejs.org/download (keep \"Add to PATH\").\n      If `npm install` errors with \"running scripts is disabled\":\n      ```powershell\n      Set-ExecutionPolicy RemoteSigned -Scope CurrentUser\n      ```\n\nAfter those three: install Docker Desktop with \"Use the WSL 2 based engine\" + Ubuntu integration,\nand run `bun scripts/midnight-standalone.mjs up` from INSIDE the WSL2 Ubuntu shell (not PowerShell)\nso localhost port forwarding to the Windows browser works.\nCopy-button version: https://midnightprompts.lovable.app/proof-server#docker-setup",
  linux: "--- Docker prerequisites (Linux) ---\n```bash\nsudo apt update\nsudo apt install -y docker.io docker-compose-plugin\nsudo systemctl enable --now docker\nsudo usermod -aG docker \"$USER\" && newgrp docker\n```\nFedora: `sudo dnf install docker docker-compose-plugin`.\nArch:   `sudo pacman -S docker docker-compose`.\nVerify: `docker run --rm hello-world` should print the welcome banner without sudo.",
};

const LOCAL_STACK_OUTRO = "--- Point Lace at the local node ---\nLace \u2192 Settings \u2192 Network \u2192 Custom \u2192 RPC = `ws://localhost:9944` \u2192 Save \u2192 Switch.\nThe genesis wallet is pre-funded with unlimited tDUST \u2014 no faucet click, no delegation step.\n\n--- Deploy the Compact contract ---\n```bash\n# after `compact compile` produced contracts/managed/<name>/\nVITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs\n# \u2192 prints contract hex address; paste into VITE_DEFAULT_CONTRACT\n```\n\nFull troubleshooting: see the `midnight-environment-setup` skill\n(https://midnight-skills.netlify.app/skills/midnight-environment-setup) \u2014 it covers\nDocker Desktop failing to start, port 6300 conflicts, WSL2 clock drift, and Lace network switching.";

function localStackSetup(os: OSTarget): string {
  return `${LOCAL_STACK_INTRO}\n\n${LOCAL_STACK_DOCKER_BY_OS[os]}\n\n${LOCAL_STACK_OUTRO}`;
}

const NETWORK_LABELS: Record<NetworkVariant, string> = {"preview": "Preview testnet", "preprod": "Preprod testnet (closer to mainnet)", "undeployed": "Undeployed / local standalone stack (no faucet needed)"};

const NETWORK_SECRETS: Record<NetworkVariant, string> = {
  preview: "REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **PREVIEW** target:\n- VITE_NETWORK_ID           preview\n- VITE_INDEXER_URL          https://indexer.preview.midnight.network/api/v4/graphql\n- VITE_INDEXER_WS_URL       wss://indexer.preview.midnight.network/api/v4/graphql/ws\n- VITE_PROOF_SERVER_URL     http://localhost:6300   (run `docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`)\n- VITE_DEFAULT_CONTRACT     hex address printed by your first deploy \u2014 paste it here so users skip the deploy step\n\nFaucet:   https://midnight-tmnight-preview.nethermind.dev/  (dispenses tNIGHT \u2014 click \"Generate tDUST\" in Lace to delegate)\nExplorer: https://preview.midnightexplorer.com/\nNotes:    Preview is the fastest network to demo on but resets frequently. Best for iterative dev + hackathon judges.",
  preprod: "REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **PREPROD** target:\n- VITE_NETWORK_ID           preprod\n- VITE_INDEXER_URL          https://indexer.preprod.midnight.network/api/v4/graphql\n- VITE_INDEXER_WS_URL       wss://indexer.preprod.midnight.network/api/v4/graphql/ws\n- VITE_PROOF_SERVER_URL     http://localhost:6300   (run `docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`)\n- VITE_DEFAULT_CONTRACT     hex address printed by your first deploy \u2014 paste it here so users skip the deploy step\n\nFaucet:   https://midnight-tmnight-preprod.nethermind.dev/  (dispenses tNIGHT \u2014 click \"Generate tDUST\" in Lace to delegate)\nExplorer: https://preprod.midnightexplorer.com/\nNotes:    Preprod is closer to mainnet parameters but has known DUST-sync and ZKIR 0.31 quirks. If your\n          demo stalls at \"Balancing\u2026\", switch to the Undeployed local stack variant of this prompt.",
  undeployed: "REQUIRED SECRETS (Lovable \u2192 Project Settings \u2192 Secrets) \u2014 **UNDEPLOYED / LOCAL** target:\n- VITE_NETWORK_ID           undeployed\n- VITE_INDEXER_URL          http://localhost:8088/api/v4/graphql\n- VITE_INDEXER_WS_URL       ws://localhost:8088/api/v4/graphql/ws\n- VITE_PROOF_SERVER_URL     http://localhost:6300\n- VITE_NODE_WS              ws://localhost:9944\n- VITE_DEFAULT_CONTRACT     hex address printed by your local deploy\n\nNo faucet needed \u2014 the local node mints unlimited tDUST to the genesis wallet.\nExplorer: not applicable (chain is local); browse state via the local Indexer GraphQL.\nNotes:    This is the **DevRel-advised** path for hackathon work. It bypasses every Preprod\n          tDUST-sync + `/check 400` ZKIR issue by pinning the SDK and node to the same version.",
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

const WALLET_BOILERPLATE = "\n\n--- BEGIN: Connect-Lace boilerplate (self-contained, DApp Connector v4) ---\n\nAdd a working \"Connect Lace\" button to the primary page of the app. This\nsection is self-contained \u2014 do NOT install any @midnight-ntwrk/* package for\nthe connect step; the Lace browser extension injects everything you need at\n`window.midnight`. Follow the DApp Connector API v4 exactly as written below.\n\nHARD RULES\n- Do NOT call `enable()` or `state()` \u2014 DApp Connector v4.0 removed them.\n- Do NOT read `window.midnight` at module scope or during SSR \u2014 only inside\n  `useEffect`. Gate the panel render until after hydration.\n- Do NOT hardcode the network \u2014 try Preview, Preprod, and Mainnet in order\n  and use whichever `connect(networkId)` accepts.\n- Reading a shielded address is a permission-only handshake \u2014 no signing,\n  no funds moved.\n\nCREATE FILE: src/lib/use-midnight-wallet.ts\n```ts\nimport { useCallback, useEffect, useState } from \"react\";\n\nexport type WalletStatus =\n  | \"idle\" | \"detecting\" | \"ready\" | \"connecting\" | \"connected\" | \"error\";\n\ntype Connector = {\n  apiVersion: string;\n  name?: string;\n  connect: (networkId: string) => Promise<ConnectedApi>;\n  isEnabled?: () => Promise<boolean>;\n};\n\ntype ConnectedApi = {\n  getShieldedAddresses?: () => Promise<string[] | Record<string, string>>;\n  getUnshieldedAddress?: () => Promise<string>;\n  getDustAddress?: () => Promise<string>;\n  getConfiguration?: () => Promise<{\n    indexerUri?: string; indexerWsUri?: string; proverServerUri?: string;\n  }>;\n};\n\nfunction pickConnector(): Connector | null {\n  if (typeof window === \"undefined\") return null;\n  const m = (window as unknown as { midnight?: Record<string, Connector> }).midnight;\n  if (!m) return null;\n  for (const v of Object.values(m)) {\n    if (v && typeof v === \"object\" && \"apiVersion\" in v && /^4\\\\./.test(String(v.apiVersion))) {\n      return v as Connector;\n    }\n  }\n  const first = Object.values(m)[0];\n  return first && \"apiVersion\" in first ? (first as Connector) : null;\n}\n\nexport function useMidnightWallet() {\n  const [status, setStatus] = useState<WalletStatus>(\"idle\");\n  const [address, setAddress] = useState<string | null>(null);\n  const [apiVersion, setApiVersion] = useState<string | null>(null);\n  const [network, setNetwork] = useState<string | null>(null);\n  const [error, setError] = useState<string | null>(null);\n  const [tick, setTick] = useState(0);\n\n  useEffect(() => {\n    if (typeof window === \"undefined\") return;\n    setStatus((p) => (p === \"connected\" ? p : \"detecting\"));\n    setError(null);\n    const t0 = Date.now();\n    const iv = window.setInterval(() => {\n      const c = pickConnector();\n      if (c) {\n        window.clearInterval(iv);\n        setApiVersion(c.apiVersion);\n        setStatus((p) => (p === \"connected\" ? p : \"ready\"));\n      } else if (Date.now() - t0 > 5000) {\n        window.clearInterval(iv);\n        setStatus(\"error\");\n        setError(\"No Midnight wallet detected. Install Lace from lace.io.\");\n      }\n    }, 100);\n    return () => window.clearInterval(iv);\n  }, [tick]);\n\n  const connect = useCallback(async () => {\n    try {\n      setError(null);\n      setStatus(\"connecting\");\n      const c = pickConnector();\n      if (!c) throw new Error(\"No Midnight wallet detected.\");\n      const preferred = (import.meta.env.VITE_NETWORK_ID as string) || \"preprod\";\n      const candidates = Array.from(new Set([preferred, \"preview\", \"preprod\", \"undeployed\", \"mainnet\"]));\n      let api: ConnectedApi | null = null;\n      let used: string | null = null;\n      for (const n of candidates) {\n        try { api = await c.connect(n); used = n; break; } catch {}\n      }\n      if (!api || !used) throw new Error(\"Failed to connect to Lace.\");\n      let addr: string | null = null;\n      if (typeof api.getShieldedAddresses === \"function\") {\n        try {\n          const s = await api.getShieldedAddresses();\n          if (Array.isArray(s)) addr = s[0] ?? null;\n          else if (s && typeof s === \"object\") addr = Object.values(s)[0] ?? null;\n        } catch {}\n      }\n      if (!addr && typeof api.getUnshieldedAddress === \"function\") {\n        try { addr = await api.getUnshieldedAddress(); } catch {}\n      }\n      if (!addr) throw new Error(\"Connected but couldn't read an address.\");\n      setAddress(addr);\n      setNetwork(used);\n      setStatus(\"connected\");\n    } catch (e) {\n      setError(e instanceof Error ? e.message : String(e));\n      setStatus(\"error\");\n    }\n  }, []);\n\n  return { status, address, apiVersion, network, error, connect,\n    disconnect: () => { setAddress(null); setNetwork(null); setStatus(\"ready\"); setError(null); },\n    redetect: () => setTick((n) => n + 1) };\n}\n```\n\nMOUNT on the primary page and gate render until hydrated. See\nhttps://midnightprompts.lovable.app for the full component reference.\n\n--- END: Connect-Lace boilerplate ---\n";



const SCRIPTS_FOLDER = `SCRIPTS FOLDER — MANDATORY (all variants):

Every generated app MUST contain a real \`scripts/\` folder. Do NOT reference
any script from README.md that does not exist on disk — regenerate the README
from the actual \`scripts/\` contents at the end.

CREATE FILE: scripts/deploy-midnight.mjs
\`\`\`js
// Local Node ESM deploy script. Runs on the developer's machine, NOT in the
// browser and NOT in a Cloudflare Worker. Requires a running proof server.
//
//   VITE_NETWORK_ID=preview  bun scripts/deploy-midnight.mjs
//
// Writes src/data/midnight-contract.<network>.json so the app hydrates.
import fs from 'node:fs';
import path from 'node:path';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

const NET = process.env.VITE_NETWORK_ID ?? 'preview';
setNetworkId(NET);

const contractName = process.env.MIDNIGHT_CONTRACT ?? 'timestamp-log';
const managed = path.resolve(\`contracts/managed/\${contractName}\`);
if (!fs.existsSync(managed)) {
  console.error(\`Missing \${managed}. Run: compact compile contracts/<Name>.compact \${managed}\`);
  process.exit(1);
}

// Load compiled contract module + zk assets, wire providers, call
// deployContract(...) with your witnesses, then persist the result:
const out = {
  network: NET,
  address: '<hex printed by deployContract>',
  deployTx: '<hex tx hash>',
  deployedAt: new Date().toISOString(),
};
const outPath = \`src/data/midnight-contract.\${NET}.json\`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(\`✓ wrote \${outPath}\`);
console.log(\`  address: \${out.address}\`);
console.log(\`  paste into VITE_DEFAULT_CONTRACT\`);
\`\`\`

CREATE FILE: scripts/README.md — list every script, its inputs, and when to
run it. If you add or remove a script, update this file in the same commit.

DEPENDENCIES the deploy script needs (bun add BEFORE first run — Node ESM
scripts are NOT bundled by Vite; every import must be a real dep):
  bun add @midnight-ntwrk/midnight-js-contracts@4.1.1 \\
          @midnight-ntwrk/midnight-js-network-id@4.1.1 \\
          @midnight-ntwrk/midnight-js-types@4.1.1 \\
          @midnight-ntwrk/zswap bip39

For the Undeployed variant ALSO create scripts/midnight-standalone.mjs — a
thin wrapper around \`docker compose\` that writes
\`.midnight/standalone.docker-compose.yml\`, brings up node + indexer +
proof-server, and polls readiness. See
https://midnightprompts.lovable.app/undeployed for a reference implementation
that can be copied verbatim.`;

const UNDEPLOYED_FUND_LACE = `FUND LACE ON UNDEPLOYED (local devnet only):

The local standalone stack mints unlimited tDUST to a well-known genesis
wallet. There is no faucet click; you either use the genesis wallet or
transfer from it once.

Option A — use the genesis wallet directly (fastest, dev-only):
1. In Lace, create a NEW account labelled "midnight-local-dev" and import
   the genesis mnemonic published in midnightntwrk/midnight-local-dev
   (repo README → "genesis wallet"). NEVER reuse this mnemonic on
   Preview/Preprod/Mainnet — it is public.
2. Lace → Settings → Network → Custom → RPC = ws://localhost:9944 →
   Save → Switch. tDUST balance appears immediately after sync.

Option B — keep your own Lace account, transfer once from genesis:
1. Copy your own Lace unshielded address (mn_addr_undeployed1...).
2. From the midnight-local-dev repo, run its fund-wallet helper
   (or: midnight-cli transfer --to <your-addr> --amount 1000000000 from
   the genesis account) against ws://localhost:9944.
3. Refresh Lace — tDUST balance shows non-zero. Only now can you deploy.

Verify:
- bun scripts/midnight-standalone.mjs status → all three services green.
- Open /undeployed-preflight in this app → four green pills.
- If tDUST is still zero after 60s, restart Lace and re-check network is
  ws://localhost:9944 (Lace may label it "Preview" — that is expected;
  the address prefix "undeployed" confirms the network).

References (embed as links in the in-app setup panel):
- https://docs.midnight.network/llms-full.txt (search: "undeployed", "genesis")
- https://github.com/midnightntwrk/midnight-local-dev`;

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
4. Start the proof server:
   docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
5. Deploy the contract:
   VITE_NETWORK_ID=${network} bun scripts/deploy-midnight.mjs
6. Paste the printed hex address into VITE_DEFAULT_CONTRACT and reload.`;

  const undeployed = `1. ${dockerInstall[os]}
2. Start the local Midnight stack:
   bun scripts/midnight-standalone.mjs up
3. Point Lace at ws://localhost:9944 (Settings → Network → Custom).
4. Fund your Lace wallet — see FUND LACE ON UNDEPLOYED above:
   import the genesis mnemonic OR transfer from genesis with
   midnight-cli / the fund-wallet helper in midnightntwrk/midnight-local-dev.
5. Deploy the contract:
   VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
6. Reload this page. Preflight:
   https://midnightprompts.lovable.app/undeployed-preflight`;

  const steps = network === "undeployed" ? undeployed : previewPreprod;

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

  return `Build "${title}" in ONE Lovable message. Single-page Midnight ZK demo.

TARGET NETWORK: **${netLabel}** (VITE_NETWORK_ID = \`${network}\`)
This is one of three variants of the same idea — Preview / Preprod / Undeployed. Only the network
config, secrets, and (for Undeployed) local-stack setup differ. Contract + UI + Lace flow are identical.

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
${localBlock}${undeployedFundBlock}
${SCRIPTS_FOLDER}

${VITE_CONFIG}

${MIDNIGHTJS_BOOT}

${body}

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
If the target Lovable session is on this workspace, those six skills are already active. Otherwise, drop
\`.agents/skills/<name>/SKILL.md\` into your project from the repo above and run \`skills--apply_draft\`.

CREDIT (must appear in UI footer AND as a header comment on every Compact contract):
${CREDIT}
`.replace(/\s+$/, "") + WALLET_BOILERPLATE;
}
