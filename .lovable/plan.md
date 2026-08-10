# Update the Lovable Midnight skill with MoveNft / zealymidnight learnings

Add a new dated section to the Lovable Midnight skill capturing the hard-won lessons from the StreetRail Move Rights NFT rail (mint → list → buy with mUSDC) on Local Undeployed, from `github.com/arunnadarasa/zealymidnight`.

## What gets added

A new section, `2026-08 update — zealymidnight / MoveNft NFT rail on Undeployed`, covering:

**NFT design rules (the headline lesson)**
- Design Compact for Undeployed dust limits first: public maps must be **insert-only / append-only** for v1. Updating an existing map key makes the dust wallet's fee balancing panic (`wasm.transaction_feesWithMargin`, `transaction_merge` Unreachable). Mint and list insert new keys; buy/transfer append to a `sales` map with a fresh random id; current owner lives in the server-side JSON mirror.
- Do not start from an ERC-721-shaped Compact contract full of overwrites.
- `list` is a reserved Compact keyword — name the circuit `listSale`; calling `callTx.list` against `listSale` artefacts fails silently.
- Owner PK derivation must match server and scripts exactly: `sha256("movenft:owner:v1:" + label)`, never raw `sha256(label)`.
- No cross-contract Compact call in v1: sequence `musdcFaucet` / `musdcTransfer` then `MoveNft.buy` inside one server handler and document it as demo-only atomicity.
- Fresh wallet per call (`withMoveNft`, mirroring `withMusdc`), with `stop()` between contract families. Working order for the full rail: mint → list → faucet → pay → buy.

**Operational rules**
- Address resolution: read `src/data/midnight-contract.undeployed.json` first, env `VITE_*` only as fallback — Vite caches env across redeploys.
- Redeploy checklist after any Compact change: compile → artefacts → `rm -rf midnight-level-db .midnight` → deploy → restart `bun run dev` → run e2e. Never mix new verifier keys with old LevelDB or old chain state.
- One exclusive stack-owner process for e2e; a single uniquely named script (`z-check.mjs`) that prints one `E2E_OK` line and exits non-zero on failure. Never broadly `pkill` shared patterns while another job holds the stack.
- Log long proves with `tee` to a file plus `rg` afterwards — piping through `awk`/`head` SIGPIPEs the prove process and looks like flakiness.
- Pinata is server-only: `PINATA_JWT` / `PINATA_GATEWAY`, never `VITE_PINATA_*`; document in `.env.example` only and restart dev after env changes.
- macOS has no `flock` — use `mkdir`-based locks.

**New failure-mode rows** appended to the existing table: RpcError 117 (stale private state / wiped LevelDB without redeploy), 104 (dirty LevelDB after a failed faucet→mint handoff), 196 (verifier key mismatch — recompiled artefacts without redeploy), plus the `feesWithMargin` / `transaction_merge` map-overwrite row and the `callTx.list` naming row.

**Anti-patterns** added to the existing list: half-wiring Lace signing on Undeployed, ERC-721-shaped Compact maps with overwrites, parallel agents sharing one Docker stack, and shipping README claims ahead of pushed code.

## Files touched

- `.agents/skills/lovable-midnight/SKILL.md` — append the new section, extend the failure-mode table and anti-patterns.
- `public/skills/lovable-midnight/SKILL.md` — same content, matching the fuller public copy's structure (this copy also has the deploy-script and publishing sections, so the NFT rules also get a short cross-reference from its Compact-gotchas section).

No app UI or mega-prompt changes in this plan; say the word if you also want the ~10,000 build prompts regenerated with the NFT rail block.
