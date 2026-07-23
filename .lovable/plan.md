1. Snapshot the support matrix
   - Create `src/lib/midnight-matrix.ts` with a typed version snapshot from https://docs.midnight.network/relnotes/support-matrix (fetched 2026-07-23).
   - Include: Node (Preview 1.0.1 / Preprod 1.0.0 / Mainnet 1.0.0), Compact devtools 0.5.1, Compact toolchain 0.31.1, Compact runtime 0.16.0, Compact JS 2.5.1, Platform JS 2.2.4, On-chain runtime 3.0.0, Wallet SDK 1.2.0, Midnight.js 4.1.1, testkit-js 4.1.1, DApp Connector API 4.0.1, Midnight Indexer 4.3.3, Proof server 8.1.0.
   - Include the matrix URL and `generatedAt` so prompts and pages can say: "If these differ, the matrix wins."

2. Update the Lovable skill
   - `public/skills/lovable-midnight/SKILL.md`
   - Add a "Version source of truth" section at the top linking to the matrix.
   - Replace the hardcoded version list with the matrix snapshot.
   - Keep the Compact `pragma language_version 0.23` note but distinguish it from the toolchain version (0.31.1).
   - Note that the local Undeployed Docker images (`midnight-node`, `indexer-standalone`, local `proof-server`) follow the official `midnight-local-dev` repo, not the public-network matrix, because the matrix does not list those local-dev image tags.

3. Update the mega-prompts
   - `src/lib/mega-prompt-variants.ts`
   - Import the matrix snapshot and use it in `PACKAGES`, `TOOLCHAIN_COMMON`, `NETWORK_SECRETS`, `LOCAL_STACK_INTRO`, `REDFLAGS`, and the install scripts.
   - Public-network proof-server command: use `midnightntwrk/proof-server:8.1.0`.
   - Local Undeployed stack: keep `midnightntwrk/proof-server:8.0.3`, `midnightntwrk/midnight-node:0.22.5`, `midnightntwrk/indexer-standalone:4.0.2` (the official `midnight-local-dev` repo tags) and explicitly state these are outside the public-network matrix.
   - Add a "check the matrix first" preamble in every generated prompt so the prompts remain self-contained but point to the live source of truth.

4. Update the site guides and pages
   - `src/data/llms-content.ts`: add a "Support matrix" guide and update the proof-server / known-issues / docker sections to reference the matrix.
   - `src/routes/llms.tsx`: update the skill card description and add a "Support matrix" link in the upstream docs section.
   - `src/routes/proof-server.tsx`, `wallet.tsx`, `quantum-primer.tsx`, `strategy.tsx`, `showcase.midnight-ledger.tsx`: replace `midnightntwrk/proof-server:latest` with the matrix tag.
   - `src/routes/known-issues.tsx`: update the "Preprod support matrix" issue to reflect the matrix values.
   - `src/routes/undeployed.tsx`: update the pinned-versions box to separate public-network packages from local-dev image tags.
   - `README.md`: replace `proof-server:latest` with the matrix tag and add a matrix link.

5. Fix the local stack wrapper
   - `scripts/midnight-standalone.mjs` currently uses `midnightnetwork` and older tags (4.0.0 / 0.13.2-rc1 / 2.1.1). Align it with the official `midnight-local-dev` repo: `midnightntwrk/proof-server:8.0.3`, `midnightntwrk/midnight-node:0.22.5`, `midnightntwrk/indexer-standalone:4.0.2`, and fix the org name.

6. Align installed dependencies
   - `package.json`: bump `@midnight-ntwrk/wallet-sdk` to `1.2.0` to match the matrix. Leave other versions unchanged where they already match the matrix.

7. Regenerate the LLM bundles
   - Run `bun scripts/build-llms-full.mjs`.
   - Externalize each large file with `lovable-assets create` and refresh the `public/*.asset.json` pointers.
   - Verify `public/llms-full.meta.json` reflects the new sizes and generation date.

8. Verify
   - `bun install` (if package.json changed).
   - `bun run build` (or dev build) to confirm TypeScript and imports are clean.
   - Spot-check `/llms`, `/proof-server`, `/known-issues`, and `/undeployed` for the matrix link and updated versions.

Note: the support matrix lists public-network node/indexer/proof-server versions. The local Undeployed Docker images (`midnight-node`, `indexer-standalone`) are not in the matrix, so the plan keeps them pinned to the official `midnight-local-dev` repo tags and explicitly calls that out.