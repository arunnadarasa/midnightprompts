# Add the MoveNft / zealymidnight lessons to the mega-prompts

The ~10,000 build prompts get a new self-contained block so anyone generating an NFT, ticket, licence or marketplace idea doesn't rediscover the Undeployed dust-overwrite trap.

## What gets added to every prompt

A new block, `NFT / MARKETPLACE LEDGER DESIGN — HARD-WON LESSONS (zealymidnight)`, placed alongside the existing signing-strategy and Fly.io lesson blocks:

- Public ledger maps must be **insert-only / append-only**. Updating an existing map key makes the dust fee balancer panic (`wasm.transaction_feesWithMargin`, `transaction_merge` Unreachable) on the second `callTx`. Mint and `listSale` insert new keys; buy/transfer append to a `sales` map under a fresh random id; the current owner lives in the server JSON mirror.
- Do not model NFTs as ERC-721 in Compact (`_owners[tokenId] = newOwner` is the exact overwrite that breaks).
- `list` is a reserved Compact keyword — name the circuit `listSale`; `callTx.list` against `listSale` artefacts fails silently.
- One shared owner-PK helper (`sha256("<app>:owner:v1:" + label)`) imported by both server routes and scripts, so diagnostics can't disagree with the chain.
- No cross-contract Compact call in v1: sequence token faucet/transfer then `buy` in one server handler and label it demo-only atomicity.
- Fresh wallet per call with `stop()` between contract families; working rail order mint → list → faucet → pay → buy.
- Address resolution: deploy JSON first, `VITE_*` only as fallback (Vite caches env across redeploys).
- Redeploy checklist: compile → artefacts → `rm -rf midnight-level-db .midnight` → deploy → restart dev → e2e. Never mix new verifier keys with an old LevelDB.
- One exclusive stack-owner e2e script printing a single `E2E_OK` line; never broadly `pkill` shared patterns; `tee` prove logs instead of piping to `awk`/`head` (SIGPIPE kills the prove).
- Pinata secrets are server-only (`PINATA_JWT`, never `VITE_PINATA_*`).
- A failure-mode table covering `feesWithMargin` / `transaction_merge`, `callTx.list`, `not owner`, and RpcError 117 / 104 / 196.

Three matching lines are added to the existing RED FLAGS list (no overwriting maps, no ERC-721-shaped Compact, no parallel agents on one Docker stack / LevelDB).

## Technical notes

- `src/lib/mega-prompt-variants.ts`: new `NFT_LEDGER_LESSONS` const, interpolated into the web-variant template next to `SIGNING_STRATEGY`; appended lines inside `REDFLAGS`. The mobile (Kuira) variant gets a one-line pointer in its non-negotiables since it shares the Compact ledger constraints.
- Prompt counts, network variants, OS targets, themes and idea data are unchanged.
- Regenerate the downloadable bundles with `bun scripts/build-llms-full.mjs`, refresh `public/llms-full.meta.json`, and re-externalise the regenerated `.txt` files through `lovable-assets` so the `/llms` download pointers stay valid.
- Verify with a typecheck plus a spot-check that a rendered prompt on an idea page contains the new block.
