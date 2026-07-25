## Goal

Add [effectstream/effectstream](https://github.com/effectstream/effectstream) as a first-class alternative to Docker Compose / Fly.io for running the local Midnight stack, with a short explainer of what it is and why a hackathon participant would pick it.

## What Effectstream is (in one paragraph)

Chain-abstraction orchestrator (84★, MIT). Ships `@effectstream/midnight-node`, `@effectstream/midnight-indexer`, `@effectstream/midnight-proof-server` as npm-installed binary wrappers — so `bun add` replaces the Windows/Docker pain we currently document. Also ships an `orchestrator` CLI (`bunx orchestrator start --background / status / logs / stop`) that supervises node + indexer + proof-server + deployment + frontend as one dev loop. Ships two Midnight templates: `evm-midnight-v2` (EVM + Midnight ERC-721 sync + ZK contracts + React) and `zswap-da` (Midnight Zswap decentralized liquidity).

## Where it lives on the site

Primary home: **`/undeployed`** — sits between the existing "Docker Compose" and "Fly.io hosted stack" sections as a third option ("no-Docker path"). Same page already frames the local-stack tradeoffs, so it's the natural fit.

Secondary mention: **`/proof-server`** — one line in the setup guide pointing at `@effectstream/midnight-proof-server` for readers who want to skip Docker Desktop entirely on Windows.

No changes to mega-prompts, showcase, or navigation for now (can follow later if the user wants).

## Changes

1. `src/routes/undeployed.tsx` — new section "Alternative: Effectstream orchestrator (no Docker)":
   - One-paragraph explainer
   - `bun add` snippet for the three npm-wrapped binaries
   - `bunx orchestrator start --background` quickstart
   - Links to repo + `templates/evm-midnight-v2` + `templates/zswap-da`
   - Callout: still experimental; use Docker Compose if you hit issues
2. `src/routes/proof-server.tsx` — short "Skip Docker with Effectstream" note in the setup guide with a link to the section on `/undeployed`.

No new routes, no navbar changes, no mega-prompt regeneration.
