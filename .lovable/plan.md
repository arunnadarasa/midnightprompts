
## Goal

Bake the hard-won lessons from the ChoreoCrowd Fund debug session into two places so future Lovable vibe-coders don't lose hours to the same traps:

1. `public/skills/lovable-midnight/SKILL.md` — the downloadable skill.
2. `src/lib/mega-prompt-variants.ts` — the self-contained mega-prompts (~12k combinations).

Central mental model both artefacts will teach:

```text
Undeployed:  UI → POST /api/append-entry → genesis wallet (server) → chain
Other nets:  UI → LaceWalletProvider → Lace signs → chain
Reads:       fetchPublicContractLedger via indexer (all networks)
```

## Changes to `SKILL.md`

Add a new top-level section **"Undeployed writes: the server-append pattern"** near the existing "Funding the Undeployed wallet" section, plus 3 short bullets into the failure-modes table.

Content additions:

1. **Signing-path table** — the mental model above, called out as the #1 architectural decision on Undeployed.
2. **`privateStateStoreName` invariant** — one named constant, used by:
   - `scripts/deploy-midnight.mjs` (`initializeMidnightProviders({ privateStateStoreName })`)
   - `src/lib/append-entry.server.ts` (same value)
   - any CLI test script
   Mismatch → `findDeployedContract` samples a fresh signing key → chain rejects with `RpcError 1010: Invalid Transaction: Custom error: 117`. Debug tip: log first/last 8 chars of the signing key on both sides; they must match.
3. **`ledger()` call shape** — pass `contractState.data` (from `getPublicStates`) or `result.public.nextContractState`, never the raw `ContractState` wrapper. Symptom of misuse: `expected instance of ChargedState`.
4. **Stale contract JSON after Docker reset** — always redeploy after `midnight:down`/`up`; the address in `src/data/midnight-contract.undeployed.json` is invalidated with the chain state.
5. **`ctxPromise` cache invalidation** — server route caches wallet+providers in a module-scope promise; must be invalidated when the contract address (or seed) changes, otherwise the 2nd+ append silently uses the previous contract.
6. **`optimizeDeps.exclude` additions for the server-append path** — add `@midnight-ntwrk/testkit-js`, `pino`, `ws`, `ssh2`, `cpu-features` to the existing exclude list so the dev server no longer hangs on "Loading …".
7. **SSR stub pair for the server function** — `src/lib/append-entry.ssr-stub.ts` returns a 500 "dev-only" response; add it to the `midnightSsrStub()` swap list so the published Worker builds.
8. **UX note** — the "Prove & submit" button being disabled is usually just an empty form field, not a wallet bug; show a tooltip explaining `canFund`.

Also refresh the failure-modes table with three new rows: `Custom error: 117`, `expected instance of ChargedState`, and "dev server stuck on Loading …" — each with the fix.

## Changes to `src/lib/mega-prompt-variants.ts`

Extend the existing `SIGNING_STRATEGY` block (currently mint-flavoured) into a slightly longer, ledger-agnostic recipe that any of the 1,000 ideas can inherit:

- Keep the current mode table but rename the example route to `/api/append-entry` (matches Midnight docs and the ChoreoCrowd project so LLMs pattern-match faster).
- Add a **"Shared constants — must stay identical across deploy + server"** subsection with the `PRIVATE_STATE_STORE` constant and genesis seed.
- Add the `ledger()` call-shape gotcha.
- Add the `optimizeDeps.exclude` server-only additions (append them into the existing `VITE_CONFIG` exclude list rather than duplicate the block, keeping variants self-contained but smaller).
- Add a "Recovery after Docker reset" bullet: down → up → `bun run midnight:deploy` → restart dev → try again.
- Extend `REDFLAGS` with:
  - `Custom error: 117` → signing-key store mismatch (fix: align `privateStateStoreName`).
  - Dev server stuck on "Loading …" → missing `optimizeDeps.exclude` entries.
  - `expected instance of ChargedState` → pass `.data` / `nextContractState`.
  - "Prove & submit disabled" → empty form fields, not a wallet bug.

All additions live inside the existing `SIGNING_STRATEGY` / `REDFLAGS` constants that are already interpolated into every variant, so the change automatically propagates to all ~12,000 prompts on the next `bun run scripts/build-llms-full.mjs`.

## Regeneration + verification

1. Rebuild bundles: `bun run scripts/build-llms-full.mjs`.
2. Rebuild the site (typecheck + Vite build) to confirm no syntax errors slipped into the template string constants.
3. Spot-check one Undeployed prompt (e.g. Preview→Undeployed macOS variant for a random idea) contains the new `PRIVATE_STATE_STORE` + error-117 lines.
4. Verify `public/llms-full.meta.json` `generatedAt` is fresh and file sizes changed as expected.

## Out of scope

- No UI changes (prompt-page tabs, showcase pages, navbar stay put).
- No new routes.
- No changes to the four network variants or the Mainnet disclaimer.
- No changes to `AGENTS.md` or repo-level docs beyond the two files above.
