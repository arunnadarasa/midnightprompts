# Rewrite README.md as the full project reference

The current README (149 lines) only describes the original `TimestampLog` demo on Preview/Preprod. It misses almost everything the project has become: ~10,000 visible mega-prompts across 5 network targets and 3 operating systems, the theme/idea browser, the seven showcase demos, the Lovable Midnight skill, the LLM bundles, and the ops lessons captured from the reference repos.

## What the new README covers

1. **Header** — what MidnightPrompts is in two sentences, live site, badges-free plain links (docs, Lace, service desk).
2. **What's inside** — prompt library (1,996 ideas × 5 visible network variants × OS-specific blocks), themes/disciplines, protocol overlays (A2A/AP2, UCP, x402), showcase demos, Lovable Midnight skill, LLM bundles.
3. **Site map** — table of every route with a one-line purpose (`/`, `/themes`, `/ideas/:id`, `/showcase/*`, `/wallet`, `/proof-server`, `/undeployed`, `/undeployed-preflight`, `/mobile`, `/known-issues`, `/quantum-primer`, `/strategy`, `/llms`, `/blog`, `/about`).
4. **Network targets** — Preview, Preprod, Undeployed (local Docker), Undeployed (Fly.io), Undeployed (Mobile/Kuira Android), plus a note that Mainnet prompts are intentionally hidden.
5. **Stack & version pinning** — Bun/TanStack/Vite/React/Tailwind, and the rule that all Midnight versions come from `src/lib/midnight-matrix.ts`, which tracks the official support matrix. Never hardcode versions elsewhere.
6. **Quickstart** — `bun install`, `bun run dev`, `bun run build`, `bun run lint`, `bun run format`; note that browsing needs no wallet or Docker.
7. **Wallet & funding** — Lace setup, unshielded vs shielded addresses, faucet dispenses tNIGHT, Generate tDUST in Lace, the `midnight-wallet-cli` seed→bech32 path, and the offline derive scripts.
8. **Proof server** — Docker commands per OS (macOS/Linux, Windows PowerShell + WSL2 notes), health check, cheatsheet table, EffectStream as a no-Docker alternative.
9. **Deploying contracts** — the `contracts/*.compact` inventory (TimestampLog, MoveBoard, MandateVault, OrderLedger, MidnightUSDC), `compact compile`, and `MIDNIGHT_CONTRACT` / `VITE_NETWORK_ID` matrix for `scripts/deploy-midnight.mjs`, with which JSON file each write targets.
10. **Local Undeployed stack** — `scripts/midnight-standalone.mjs`, container health, indexer/RPC ports, and the preflight page.
11. **Scripts reference** — table of every file in `scripts/` with purpose and example invocation.
12. **Repo layout** — expanded tree covering `contracts/`, `scripts/`, `src/routes`, `src/data/ideas`, `src/lib`, `public/skills`, `public/llms-*`.
13. **LLM bundles & skill** — how `scripts/build-llms-full.mjs` streams the multi-GB bundle, why bundles are externalised as `*.asset.json` CDN pointers rather than committed binaries, and how to install the Lovable Midnight skill.
14. **Hard-won ops lessons** — condensed table pointing at `/known-issues` and the skill: insert-only public maps, wallet lifecycle/LevelDB locking, RpcError 117/104/196, error 192 (`signRecipe`), error 170 (concurrent DUST), Node 22/24 only, sync-cache speedup.
15. **Troubleshooting** — expanded version of the existing table plus the new entries.
16. **Contributing / credits / licence-free credits block** — hackathon credit, Midnight Network, Lace, Lovable.

## Technical notes

- Single file edit: `README.md` (full rewrite). No source or route changes.
- All version numbers quoted in the README are read from `src/lib/midnight-matrix.ts` and `package.json` at write time so the doc matches the pinned matrix.
- Route table and script table are generated from the actual files in `src/routes/` and `scripts/`, not invented.
- Keeps the existing macOS/Linux vs Windows PowerShell split for every shell command, and keeps the `curl.exe` caveat.
