## Pivot: Creative Blockchain → Creative Midnight

Full pivot to the Midnight ZK blockchain: rebrand the site, replace the four Ethereum primitives with four Midnight-native primitives, rewrite all ~1000 megaprompts, replace the Sepolia Choreo Ledger demo with a live Midnight demo compiled inside the Lovable Linux sandbox, and author a `lovable-midnight` skill.

## Parallel workstreams (sub-agents + sandbox)

Two sub-agents plus one sandbox compile stream run in parallel to keep the wall-clock low.

**Sub-agent A — Docs synthesis (running now).** Reads `docs.midnight.network/llms-full.txt` end-to-end and returns: elevator pitch, canonical 4 primitives, Compact contract template, compiler toolchain, MidnightJS + Lace wiring, ProofServer notes, tDUST endpoints, 5 required secrets, failure-mode table, and unsupported patterns. Its output is the source of truth for everything below.

**Sub-agent B — Megaprompt regen** (spawned after A returns). Rewrites all 1000 prompts across `src/data/ideas/*.json` via AISA (`https://api.aisa.one/v1/chat/completions`, model `qwen3.7-max`, batched 25/theme × 4/hook = 40 parallel calls). Reuses `scripts/regenerate_ideas.py` with a new template block driven by A's output. Idempotent, checkpoint-safe.

**Sandbox stream — Real Midnight demo.** In parallel with B, install the Compact compiler + MidnightJS in `/tmp/midnight/`, compile a minimal timestamp-log contract, generate ZK keys, and wire a live demo replacing `/showcase/choreo-ledger`. All heavy work happens in the sandbox, not committed to `node_modules`.

## Rebrand pass (site)

- `Creative Blockchain` → `Creative Midnight` across: `site-shell.tsx`, `index.tsx` hero + eyebrows, `themes.*` copy, `about.tsx`, `strategy.tsx`, `quantum-primer.tsx` (renamed content, route slug stays for compat), `<head>` titles/descriptions on every route.
- Volume label stays "Vol. 01"; tagline pivots to "one thousand creative disciplines meet a private ZK primitive".
- Nav "Etherscan ↗" button becomes "Midnight Explorer ↗" pointing to the URL sub-agent A returns.
- Footer keeps "Built during the Creative AI & Quantum Hackathon organised by StreetKode Fam during Indian Krump Festival 14".
- Editorial Folio Noir palette + Instrument Serif/Work Sans typography stay unchanged.

## Content model swap

`src/data/ideas/hooks.json` rewritten from 4 Ethereum hooks to 4 Midnight primitives (final names driven by A, planned ranking):

1. `compact-deploy` — Deploy a Compact ZK contract to Midnight testnet; user sees a "verified onchain" proof + explorer link.
2. `private-witness` — A private witness value stays local while a public state update lands onchain; UI shows "proved without revealing".
3. `lace-wallet` — Lace wallet connect + signed transaction; UI shows tDUST balance + a one-tap action.
4. `ipfs-content` — Pin creative content to IPFS (Pinata) and store the CID onchain via the Compact contract; UI shows the CID + a gateway preview.

Field names in `src/data/ideas.ts` stay as `quantumHook*` (JSON schema stable; just the semantic content shifts). Idea IDs regenerate from the new titles, so slugs change — old `/ideas/:id` URLs 404; acceptable per "full pivot".

## Megaprompt template (every one of ~1000 prompts)

Emitted by the updated `scripts/regenerate_ideas.py`:

- **Concept** — title, sub-discipline, pitch (from AISA).
- **5-credit budget rule** — single-page app, one Compact contract, Lace wallet, no cloud, no DB, no auth beyond wallet.
- **Compact contract snippet** — parameterized version of A's timestamp-log template, tailored per hook (private witness for `private-witness` prompts, ERC-721-equivalent for `ipfs-content` prompts, etc.).
- **MidnightJS wiring** — Lace detect, signed tx, ledger read (from A's exact code).
- **Required secrets** — the 5 A returns (planned: `LACE_WALLET_MNEMONIC` for a burner deployer, `MIDNIGHT_TESTNET_RPC_URL`, `MIDNIGHT_INDEXER_URL`, `MIDNIGHT_PROOF_SERVER_URL`, `PINATA_JWT`). All included, with faucet URL + install links.
- **Hackathon credit** — in the prompt body AND as a required NatSpec-equivalent comment on every deployed Compact contract.

`scripts/patch_privy_block.py` is retired; a new `scripts/patch_midnight_block.py` performs the in-place replacement so we can update all 1000 prompts without a full AISA regen if only the template changes.

## Live Midnight demo (replaces Choreo Ledger)

- New route `src/routes/showcase.midnight-ledger.tsx`; existing `showcase.choreo-ledger.tsx` deleted.
- Sandbox pipeline:
  1. `code--exec` installs the Compact compiler per A's instructions in `/tmp/midnight/`.
  2. Compile `contracts/MidnightLedger.compact`, generate proving/verifying artifacts.
  3. Commit only the tiny public verifying key + contract address JSON to `src/data/midnight-contract.json`. Heavy artifacts stay in the sandbox and get referenced by URL if hosted; otherwise the demo runs read-only.
- Frontend: Lace detect → connect → show tDUST balance → "Log an entry" button → signed tx → live ledger feed of recent public entries, read via the indexer URL A returns. SSR-safe: MidnightJS is browser-only, mounted via `lazy(() => import(...))` inside `<ClientOnly>` (same pattern as the retired Privy client entry).
- No ProofServer sidecar in production if A confirms browser-side proving works; otherwise document that judges need to run a local proof server and skip the live sign-in — read-only feed still works.

## New `lovable-midnight` skill

Structure mirrors `lovable-ethereum-sepolia`:

```
.agents/skills/lovable-midnight/
├── SKILL.md               (primer + 10 non-obvious rules + when-to-use table)
├── references/
│   ├── compact-contract.md
│   ├── lace-wallet.md
│   ├── proof-server-and-testnet.md
│   └── failure-modes.md
```

All content sourced from sub-agent A + our own compile experience in the sandbox. Failure-modes table gets every new bug we hit during the demo build. Applied via `skills--apply_draft` at the end.

## Cleanup

- Delete: `contracts/`, `scripts/hardhat/*`, `src/components/privy-root.tsx`, `src/components/privy-client-entry.tsx`, `src/routes/showcase.choreo-ledger.tsx`, `src/data/contract.json`, `src/data/privy.json`.
- Remove Ethereum secrets from the required list (`METAMASK_PRIVATE_KEY`, `ETHERSCAN_API_KEY`, `PRIVY_APP_ID`, `SEPOLIA_RPC_URL`). Ask the user via `add_secret` for the 5 new Midnight secrets when we get to the demo step.
- Keep: Editorial Folio Noir tokens, Instrument Serif/Work Sans, all layout, TAM/SAM/SOM structure, market-sizing bento, mobile-safe `<pre>` overflow rules.

## Sequenced execution (build mode)

1. Wait for sub-agent A to finish; read its report.
2. Rebrand pass (site copy, `hooks.json`, quantum-primer content).
3. Update `scripts/regenerate_ideas.py` template with A's snippets; spawn sub-agent B to rerun the regen; block until B's checkpoint is complete.
4. In parallel with (3): sandbox-compile the demo contract, ship `/showcase/midnight-ledger`.
5. Delete Ethereum artifacts.
6. Author + apply `lovable-midnight` skill.
7. Playwright smoke test at 384px mobile: `/`, `/themes`, one idea page, `/showcase/midnight-ledger`. Screenshot each; confirm no horizontal overflow.

## Out of scope

- Cadence / non-EVM Ethereum-flavored chains.
- Bridging tDUST to any other chain.
- Runtime Midnight tools in the site itself beyond the one demo route.
- Mainnet — testnet-only pivot.
- Preserving old `/ideas/:id` URLs.
