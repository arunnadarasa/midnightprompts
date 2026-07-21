---
name: lovable-midnight
description: Ship a Midnight ZK dApp (Compact contract + Lace wallet + local proof server + Indexer reads) in a single Lovable build. Use when the user asks for anything on the Midnight Network — private-by-default smart contracts, zero-knowledge circuits, Lace wallet, tDUST, or "how do I add privacy to my app".
---

# lovable-midnight

Build a Midnight Network dApp in one shot. Midnight is a privacy-first L1 where every smart contract has a public ledger, a ZK circuit, and a local off-chain component. Circuit parameters are **private by default** — you must call `disclose()` to move any value to public state.

## Non-negotiables

- **Compact language `0.23`**, MidnightJS SDK `midnight-js-contracts@4.1.1` + `wallet@4.0.0` + `wallet-sdk-hd@3.1.0-beta.1`, proof server `midnightntwrk/proof-server:latest`.
- Every `.compact` file starts with `pragma language_version 0.23;` and imports `CompactStandardLibrary`.
- Every ledger write from a circuit parameter needs an explicit `disclose(...)` — otherwise the compiler rejects it. This is the whole privacy model; don't work around it.
- `witness` callbacks (private inputs from TypeScript) return values that never touch the chain. Never send the witness value in a transaction — pass it into the circuit only.
- Circuits are bounded: **no recursion, no dynamic-length loops, no I/O, no oracles.** All loops fold over compile-time constants.
- Proofs for medium circuits (`k=14`) take **30–120s** on the local proof server (first proof after container boot is the slowest; warm proofs are seconds). Every write UI must show a `Proving…` state and stay usable.
- **No SSR.** MidnightJS uses `window`, Node `Buffer`, and WASM with top-level await. Load all `@midnight-ntwrk/*` imports behind a client-only boundary; put `import { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;` as the very first line of `src/main.tsx` (Vite SPA) OR of a client-only entry that a `<ClientOnly>` gate loads (TanStack Start).
- **Do NOT** attempt bridging to Ethereum, oracle calls inside circuits, or sub-second UX.

## Two live networks

| Network | `VITE_NETWORK_ID` | Address prefix | Faucet | Explorer |
| --- | --- | --- | --- | --- |
| Preview (unstable, resets) | `preview` | `mn_shield-addr_test1…` | `midnight-tmnight-preview.nethermind.dev` | `preview.midnightexplorer.com` |
| Preprod (stable, closer to mainnet) | `preprod` | `mn_shield-addr_preprod1…` / unshielded `mn_addr_preprod1…` | `midnight-tmnight-preprod.nethermind.dev` | `preprod.midnightexplorer.com` |

Both explorers accept a contract address (`/contract/<hex>`) or tx hash (`/tx/<hex>`). Prefer preprod for anything demoed to real users.

## Environment secrets

```
VITE_NETWORK_ID=preprod                                            # or preview
VITE_INDEXER_URL=https://indexer.preprod.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URL=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=http://localhost:6300
VITE_DEFAULT_CONTRACT=<hex address printed by first deploy>
```

Optional: `VITE_PINATA_JWT` when the app pins artefacts to IPFS.

## One-time terminal setup (the user does this on their machine)

```bash
# 1. Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc && compact update
compact compile contracts/YourContract.compact contracts/managed/your-contract
cp -r contracts/managed/your-contract/keys ./public/keys
cp -r contracts/managed/your-contract/zkir ./public/zkir

# 2. Proof server — Docker Desktop must be RUNNING first (menubar whale icon).
#    "Cannot connect to the Docker daemon at unix:///.../docker.sock" = Docker Desktop not started.
docker run -d --name midnight-proof-server \
  -p 6300:6300 \
  midnightntwrk/proof-server:latest \
  midnight-proof-server -v

# 3. Verify — expect {"status":"ok","timestamp":"..."}.
curl http://localhost:6300/health

# 4. Lifecycle
docker ps                                    # confirm running + port 6300:6300
docker logs -f midnight-proof-server         # tail
docker stop midnight-proof-server            # pause
docker start midnight-proof-server           # resume (image already pulled)
```

Lace wallet ships from https://www.lace.io/ (Midnight-enabled build). Install → switch network to Preview or Preprod → create/restore wallet → copy the shielded/unshielded address.

## Funding: tNIGHT ≠ tDUST (the #1 support question)

Deploys and shielded txs spend **tDUST**, but the faucet only dispenses **tNIGHT**. Every user hits this once.

1. Copy your **unshielded** address (`mn_addr_preprod1…`) from Lace.
2. Paste it into the preprod faucet, click Request → you now hold tNIGHT.
3. In Lace, click **Generate tDUST** to delegate tNIGHT and mint tDUST.
4. Refresh — the wallet page should show a tDUST balance. Only now can you deploy.

If a deploy fails with "insufficient tDUST", step 3 was skipped.

## The four canonical primitives

| Primitive | When to reach for it | Compact shape |
| --- | --- | --- |
| Compact contract deploy | Public timestamped log of actions | `ledger last_message` + `disclose()` |
| Private witness proof | Prove ownership without revealing identity | `witness sk()` → hash into a `Set` on chain |
| Lace wallet + tDUST | Wallet-first UX, no email flow | `initialAPI.connect(net)` → shielded address |
| IPFS content commit | Big artefacts + on-chain provenance | `Pinata → CID → ledger.last_cid` |

## Canonical Compact contract

```compact
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger entry_count: Counter;
export ledger last_message: Opaque<"string">;
export ledger last_author_commitment: Bytes<32>;

witness localSecretKey(): Bytes<32>;

constructor() { entry_count.increment(1); }

export circuit appendEntry(newMessage: Opaque<"string">): [] {
  const sk = localSecretKey();
  const seq = entry_count as Field as Bytes<32>;
  last_author_commitment = disclose(
    persistentHash<Vector<3, Bytes<32>>>([pad(32, "log:author:"), seq, sk])
  );
  last_message = disclose(newMessage);     // disclose is REQUIRED
  entry_count.increment(1);
}
```

Type-casting rules learned the hard way:
- `Counter → Field → Bytes<32>` is two steps: `x as Field as Bytes<32>`. Direct `as Bytes<32>` fails.
- **String literals in a `constructor()` are `Bytes<N>`, not `Opaque<"string">`.** Do not assign `"(empty)"` to a ledger field of type `Opaque<"string">` — the compiler rejects it. Only `disclose(<circuit-param-of-that-type>)` works.

## Vite config essentials (classic Vite SPA)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
export default defineConfig({
  build: { target: 'esnext', commonjsOptions: { transformMixedEsModules: true } },
  plugins: [react(), wasm(), topLevelAwait()],
  optimizeDeps: {
    esbuildOptions: { target: 'esnext', supported: { 'top-level-await': true } },
    include: ['@midnight-ntwrk/compact-runtime'],
    exclude: ['@midnight-ntwrk/onchain-runtime-v3',
              '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm'],
  },
});
```

## TanStack Start compatibility (Lovable's current default)

TanStack Start SSR-renders every route by default; MidnightJS crashes under SSR (`window is not defined`, top-level-await, WASM). Rules:

- **Never** import `@midnight-ntwrk/*` at module scope of a route file. Do all MidnightJS work inside `useEffect` or a lazy component behind a `useHydrated()` / `<ClientOnly>` gate.
- Keep the Compact deploy in a **`bun scripts/deploy-midnight.mjs`** Node script that talks to the local proof server on `localhost:6300` — do NOT deploy from a server function (Cloudflare Worker runtime has no Docker, no proof server, no long-lived TCP to localhost).
- Write the deploy result to `src/data/midnight-contract.json` (address, deployTx, network, versions) so the browser can import it as static JSON and hydrate an explorer link.
- Read-only Indexer GraphQL queries are the ONLY Midnight surface safe in a loader / server function — and only against the public Indexer HTTPS endpoint, never through the proof server.

## MidnightJS bootstrap

```ts
// src/main.tsx  — very first line, before ANY other import:
import { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;
```

```ts
// src/lib/providers.ts  (client-only)
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import semver from 'semver';

export async function initProviders() {
  const net = import.meta.env.VITE_NETWORK_ID ?? 'preprod';
  setNetworkId(net);
  const lace = await new Promise<any>((res, rej) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      const w = Object.values((window as any).midnight ?? {}).find((x: any) =>
        x && 'apiVersion' in x && semver.satisfies(x.apiVersion, '4.x'));
      if (w) { clearInterval(iv); res(w); }
      else if (Date.now() - t0 > 5000) { clearInterval(iv); rej(new Error('Install Lace: https://www.lace.io/')); }
    }, 100);
  });
  const api = await lace.connect(net);
  const cfg = await api.getConfiguration();
  const zk = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  return {
    connectedAPI: api,
    proofProvider: httpClientProofProvider(cfg.proverServerUri ?? import.meta.env.VITE_PROOF_SERVER_URL, zk),
    publicDataProvider: indexerPublicDataProvider(cfg.indexerUri, cfg.indexerWsUri),
    zkConfigProvider: zk,
  };
}
```

## Reading public ledger state (no wallet needed)

```ts
const r = await fetch(import.meta.env.VITE_INDEXER_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query($a:HexEncoded!){ contractAction(address:$a){ state } }`,
    variables: { a: contractAddress },
  }),
});
const stateHex = (await r.json()).data?.contractAction?.state;
```

Decode with the compiled contract's `ledger(state)` helper from `contracts/managed/<name>/contract/index.cjs` — but only in a client-only module.

## Deploy status UI pattern

Ship a small panel that imports `src/data/midnight-contract.json` and branches on address. Treat the all-zero address (`0000…0000`) as "not yet deployed":

```tsx
import contract from '@/data/midnight-contract.json';
const PLACEHOLDER = '0'.repeat(64);
const deployed = contract.address && contract.address !== PLACEHOLDER;
const explorer = contract.explorer?.replace(/\/$/, '') ?? 'https://preprod.midnightexplorer.com';
// deployed → link to `${explorer}/contract/${contract.address}` and `${explorer}/tx/${contract.deployTx}`
// not deployed → show the "run bun scripts/deploy-midnight.mjs" hint
```

This lets the marketing page hydrate the moment the user's local deploy script writes the JSON, with no rebuild coordination.

## Failure modes ranked by frequency

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Cannot connect to the Docker daemon at unix:///…/docker.sock` | Docker Desktop app itself isn't running | Open Docker Desktop from Spotlight, wait for the whale menubar icon, re-run `docker run …` |
| `compile error: disclose() required` | Assigning a circuit param straight to a ledger field | Wrap in `disclose(...)` |
| `cannot cast Counter to Bytes<32>` | Direct cast | `x as Field as Bytes<32>` |
| Assigning a string literal to `Opaque<"string">` ledger field in `constructor()` | Literals are `Bytes<N>`, not `Opaque` | Skip the initial assignment or set from a circuit param via `disclose()` |
| Deploy fails "insufficient tDUST" but faucet said success | Faucet gave tNIGHT; you never converted | In Lace click **Generate tDUST** — see funding section |
| `ReferenceError: Buffer is not defined` | Missing Node polyfill | Add the buffer polyfill line as the FIRST line of `src/main.tsx` |
| Contract state undefined after deploy | ZK keys not served to browser | `cp keys public/keys && cp zkir public/zkir` before `vite dev` |
| Proof hangs / times out | Proof server not running, wrong port, or first-boot warm-up | `docker ps` → `curl http://localhost:6300/health`; first proof after boot takes ~30–120s |
| `window is not defined` at build / SSR | MidnightJS at module scope in a TanStack route/loader | Move behind `useEffect` / `useHydrated()`; deploys go through the `bun scripts/deploy-midnight.mjs` Node script, not a server function |
| `Lace not found` | Extension not installed / page loaded before injection | Poll `window.midnight` for 5s before rejecting |
| `Cannot find package 'bip39'` (or `@midnight-ntwrk/*`) running the deploy script | Deploy/derive scripts are Node ESM, not bundled by Vite — every import must be a real dep in `package.json` | `bun add bip39 @midnight-ntwrk/wallet @midnight-ntwrk/wallet-sdk-hd @midnight-ntwrk/midnight-js-network-id @midnight-ntwrk/zswap` before running |
| Deploy prints `mn_addr_preview1...` but Lace shows `mn_shield-addr_test1...` (or vice versa) — user says "addresses don't match" | Preview shielded vs unshielded encoders drifted: one uses the `preview` bech32 suffix, the other the legacy `test` suffix. Lace won't recognize a mixed pair | Derive BOTH addresses through the SAME `NetworkId` value (Preview → `NetworkId.Undeployed`, Preprod → `NetworkId.TestNet`); print expected prefix and hard-fail the script if the emitted bech32 suffix doesn't match |
| User asks you to verify their wallet using their 12/24 recovery words in chat | Recovery phrase = full wallet control; sandbox exfiltration risk | REFUSE. Ship a local-only `scripts/check-midnight-wallet.mjs` that reads `MIDNIGHT_WALLET_SEED` from their shell env and prints only public addresses. Never accept, echo, or log the phrase |

## Network → NetworkId mapping (source of the Preview mismatch)

The MidnightJS `NetworkId` enum does NOT have a `Preview` member. Wrong mapping = wrong bech32 suffix = Lace rejects the address.

| `VITE_NETWORK_ID` | `NetworkId` (from `@midnight-ntwrk/zswap`) | Unshielded prefix | Shielded prefix |
| --- | --- | --- | --- |
| `preview` | `NetworkId.Undeployed` | `mn_addr_undeployed1…` (Lace shows as "Preview") | `mn_shield-addr_undeployed1…` |
| `preprod` / `testnet` | `NetworkId.TestNet` | `mn_addr_test1…` (Lace labels "Preprod") | `mn_shield-addr_test1…` |
| `mainnet` | `NetworkId.MainNet` | `mn_addr1…` | `mn_shield-addr1…` |

Use ONE `NetworkId` variable across both encoders in a script — do not branch per address type. Validate the emitted prefix before writing `src/data/midnight-contract.json`; abort on mismatch rather than deploying to the wrong network.

## Recovery-phrase safety (hard rule)

If the user offers their seed phrase to "just check it in the sandbox", refuse and give them a local script instead:

```js
// scripts/check-midnight-wallet.mjs — runs on the user's machine only
import * as bip39 from 'bip39';
import { NetworkId } from '@midnight-ntwrk/zswap';
// ...derive the same way the deploy script does, from process.env.MIDNIGHT_WALLET_SEED
// PRINT: network, unshielded address, shielded address. NEVER print the seed.
```

Invocation: `MIDNIGHT_WALLET_SEED="word1 word2 ..." bun scripts/check-midnight-wallet.mjs --network=preview`. Never log, echo, or `console.log` the seed; read it once, derive, discard.

## Anti-patterns

- Don't call `initialAPI.connect(...)` without `setNetworkId(...)` first.
- Don't store the 32-byte witness secret on the server or in a cookie — localStorage only.
- Don't pretend a public ledger commitment is private. It's public. Only the witness stays hidden.
- Don't run the write path under SSR / `build:dev` prerender. Read-only Indexer views are SSR-safe; wallet + proof-server writes are not.
- Don't try to deploy from a Cloudflare Worker / TanStack server function — no Docker, no proof-server access, no localhost. Deploys are a local `bun` script.
- Don't hardcode `preview` when the user demoed on `preprod` (or vice versa). Explorer + faucet + indexer URLs all differ.
- Don't accept a user's recovery phrase in chat or run it through the Lovable sandbox — give them a local script that reads the seed from their own shell env.
- Don't derive unshielded and shielded addresses through different `NetworkId` values in the same script — that's the bug that makes Lace say the addresses don't match.
- Don't assume Node scripts under `scripts/` inherit Vite's dep resolution — every `import` must be `bun add`-ed into `package.json`.
