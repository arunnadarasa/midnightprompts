## Update Primer: include Undeployed network

On `src/routes/quantum-primer.tsx`, extend the "Preprod vs Preview vs Mainnet" section to cover all four networks Midnight ships.

### Changes
1. Rename heading to **"Undeployed vs Preprod vs Preview vs Mainnet"** and update the intro to mention four networks (local + three hosted).
2. Add an **Undeployed** column (leftmost) to the comparison table with these row values:
   - Purpose: Local standalone chain running in Docker — no faucet dance, offline-friendly, resets when you `docker compose down -v`.
   - Address prefix: `mn_addr_undeployed1…` (Lace labels it "Preview" — see Known Issues).
   - Token: tDUST minted by local genesis seed (`…0002`); Lace itself starts at 0 and must be funded via `scripts/fund-lace.sh`.
   - Faucet: None — local `midnight-local-dev faucet` / bundled script instead.
   - SDK version: Matches the Docker image tags pinned in the support matrix (`midnight-node:0.22.5`, `indexer-standalone:4.0.2`, `proof-server:8.0.3`).
   - Use for: Hackathon dev loop, offline demos, first-mint proof warm-up.
   - Reset policy: Whenever you tear down the containers or delete the volume.
3. Update the "Which one for the hackathon?" callout to recommend **Undeployed** for the local dev loop and **Preprod** for the shareable submission, keeping Preview for bleeding-edge SDK needs.
4. Add a small link to `/undeployed` next to the existing docs links at the bottom.

### Technical
- Table stays a single `<table>`; widen `min-w` from `560px` to ~`720px` to fit the extra column without truncation, and keep `overflow-x-auto` for mobile.
- No new components, no routing changes, no data-layer changes — presentation only.
