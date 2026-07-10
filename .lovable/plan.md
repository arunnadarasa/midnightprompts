## The blocker

Confirmed against Midnight's April 2026 docs (`llms-full.txt` + Compatibility Matrix v8):

- The proof server is **Docker-only** (`midnightntwrk/proof-server:8.0.3`). No native binary, no npm package, no WASM.
- There is **no hosted / public proof server** — by design, because it needs your private witness data.
- `@midnight-ntwrk/midnight-js-http-client-proof-provider` still requires an HTTP proof server you run yourself (typically `http://localhost:6300`).

Neither the Lovable Linux sandbox nor sub-agents can help — sub-agents share the same sandbox, are read-only, and there's no Docker daemon in either. Deploying `TimestampLog.compact` to Midnight preprod strictly requires a machine you control with Docker.

## Options

### Option A — You run the existing script locally (recommended, ~5 min)

Everything is already in the repo. On your own machine (Mac/Linux/WSL with Docker Desktop):

```bash
# 1. proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest \
  midnight-proof-server -v

# 2. copy your funded seed to .midnight-wallet.local (mode 0600)
#    (same 24-word mnemonic Lace is using so the tDUST is visible)

# 3. deploy
bun install
bun scripts/deploy-midnight.mjs
```

Paste the resulting `address` + `deployTx` back here. I'll:

- commit `src/data/midnight-contract.json` with the values
- add a "Deployed contract" card to `/wallet` (or `/showcase`) linking to `https://preprod.midnightexplorer.com/transactions/<hash>` and `.../contracts/<address>`
- flip the `verified: true` badge on

### Option B — You already deployed via Lace or another machine

Just paste the contract address + deploy tx. Same UI wiring as A, no script run needed.

### Option C — Harden the deploy script first, then you run it

Before you run Option A locally, I do a dry-run pass over `scripts/deploy-midnight.mjs`:

- verify SDK versions still resolve (Ledger v8 compatibility)
- add clearer preflight checks (proof server reachable, tDUST balance ≥ 1, mnemonic loaded)
- make idempotent: if `src/data/midnight-contract.json` already has a live address, skip and just re-verify indexer state
- print the exact MidnightScan URL on success

This costs one extra round-trip but reduces the chance your local run fails halfway.

## What I will NOT do

- Won't pretend the sandbox can deploy — it can't, and faking it (e.g. writing a placeholder address into `midnight-contract.json`) would break the showcase page.
- Won't add a hosted-proof-server dependency — none exists, and sending your witness key to a third party would defeat Midnight's privacy model.

## Recommendation

Pick **A** if you have Docker installed, **B** if you'll deploy via Lace, or **C** if you want the script polished first. Which one?

Let's do A and add a dedicated new page called Proof Server 

https://docs.midnight.network/guides/run-proof-server