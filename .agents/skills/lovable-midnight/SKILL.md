---
name: lovable-midnight
description: Ship a Midnight ZK dApp (Compact contract + Lace wallet + local proof server + Indexer reads) in a single Lovable build. Use when the user asks for anything on the Midnight Network — private-by-default smart contracts, zero-knowledge circuits, Lace wallet, tDUST, or "how do I add privacy to my app".
---

# lovable-midnight

Build a Midnight Network dApp in one shot. Midnight is a privacy-first L1 where every smart contract has a public ledger, a ZK circuit, and a local off-chain component. Circuit parameters are **private by default** — you must call `disclose()` to move any value to public state.

## Non-negotiables

- **Compact language `0.23`**, MidnightJS SDK `4.1.1`, proof server `8.1.0`.
- Every `.compact` file starts with `pragma language_version 0.23;` and imports `CompactStandardLibrary`.
- Every ledger write from a circuit parameter needs an explicit `disclose(...)` — otherwise the compiler rejects it. This is the whole privacy model; don't work around it.
- `witness` callbacks (private inputs from TypeScript) return values that never touch the chain. Never send the witness value in a transaction — pass it into the circuit only.
- Circuits are bounded: **no recursion, no dynamic-length loops, no I/O, no oracles.** All loops fold over compile-time constants.
- Proofs for medium circuits (`k=14`) take **30–120s** on the local proof server. Every write UI must show a `Proving…` state and stay usable.
- **No SSR.** MidnightJS uses `window`, Node `Buffer`, and WASM with top-level await. Load all `@midnight-ntwrk/*` imports behind `<ClientOnly>` or `useEffect`; put `import { Buffer } from 'buffer'; (globalThis as any).Buffer = Buffer;` as the very first line of `src/main.tsx`.
- **Do NOT** attempt bridging to Ethereum, oracle calls inside circuits, or sub-second UX.

## Five environment secrets

```
VITE_NETWORK_ID=preview                                           # or preprod
VITE_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=http://localhost:6300
VITE_DEFAULT_CONTRACT=<hex address printed by first deploy>
```

Optional: `VITE_PINATA_JWT` when the app pins artefacts to IPFS.

## One-time terminal setup (the user does this on their machine)

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc && compact update
compact compile contracts/YourContract.compact contracts/managed/your-contract
cp -r contracts/managed/your-contract/keys ./public/keys
cp -r contracts/managed/your-contract/zkir ./public/zkir
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
```

Lace wallet ships from https://www.lace.io/. tDUST comes from the faucet https://midnight-tmnight-preview.nethermind.dev/.

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

## Vite config essentials

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
  const net = import.meta.env.VITE_NETWORK_ID ?? 'preview';
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

## Failure modes ranked by frequency

| Symptom | Cause | Fix |
| --- | --- | --- |
| `compile error: disclose() required` | Assigning a circuit param straight to a ledger field | Wrap in `disclose(...)` |
| `cannot cast Counter to Bytes<32>` | Direct cast | `x as Field as Bytes<32>` |
| Assigning a string literal to `Opaque<"string">` ledger field in `constructor()` | Literals are `Bytes<N>`, not `Opaque` | Skip the initial assignment or set from a circuit param via `disclose()` |
| `ReferenceError: Buffer is not defined` | Missing Node polyfill | Add the buffer polyfill line as the FIRST line of `src/main.tsx` |
| Contract state undefined after deploy | ZK keys not served to browser | `cp keys public/keys && cp zkir public/zkir` before `vite dev` |
| Proof hangs / times out | Proof server not running or blocked by CORS | `docker run -p 6300:6300 …` and verify `curl http://localhost:6300` |
| `window is not defined` at build | MidnightJS at module scope | Move behind `useEffect` or `<ClientOnly>` |
| `Lace not found` | Extension not installed / page loaded before injection | Poll `window.midnight` for 5s before rejecting |

## Anti-patterns

- Don't call `initialAPI.connect(...)` without `setNetworkId(...)` first.
- Don't store the 32-byte witness secret on the server or in a cookie — localStorage only.
- Don't pretend a public ledger commitment is private. It's public. Only the witness stays hidden.
- Don't run the write path under SSR / `build:dev` prerender. Read-only Indexer views are SSR-safe; wallet + proof-server writes are not.
