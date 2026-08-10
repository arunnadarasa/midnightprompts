# Fold the new zealymidnight ops lessons into the mega-prompts and llms-full.txt

The skill now carries the full zealymidnight "ops brain" (five-contract topology, wallet lifecycle, soft-fail appends, ordered RpcError 117 recovery, eight new failure modes). The prompt builder still only has the earlier NFT-rail subset, so every generated prompt is behind the skill. This brings them level and regenerates the download bundles.

## What changes in the prompts

Extend the existing `NFT_LEDGER_LESSONS` block in the prompt builder (it already covers insert-only maps, `listSale`, shared owner-PK, no cross-contract calls, redeploy checklist) with the parts it is missing:

- **Insert-only applies to token contracts too** — overwriting `balances[from]` / `balances[to]` in an mUSDC-style contract reproduces the same fee-balancer panic, just later (on settle/claim instead of mint). Show the safe shapes: `credits` / `credit_to` keyed by nonce, `faucet_claimed` and `spent_nonces` as Sets.
- **Multi-contract topology table** — the five contracts with their circuits and per-contract witness domain separators (`abodc:author:v1`, `movenft:minter:v1`, `ap2:buyer:v1`, `ucp:merchant:v1`, `musdc:signer:v1`), plus the rule that user-facing counts derive from a contract registry array, never a hardcoded number.
- **Never cache a wallet provider across HTTP requests** — open → `callTx` → `stop()` in `finally`, one wallet per request; no long-lived `ctxPromise` holding LevelDB open.
- **One Midnight write at a time** — a UI busy flag on the write action, one process owning the stack in ops.
- **Soft-fail secondary appends** — a primary token transfer plus a secondary registry `appendEntry` must not let the append fail the whole action; the transfer is the receipt.
- **Ordered RpcError 117 recovery checklist** — stop dev, wipe `midnight-level-db .midnight`, recreate containers, full deploy (not single-contract), verify twice, restart dev, hard-refresh, then one action; with the 117 / 104 / 196 action table.
- **Humanize recoverable RPC errors** in the UI instead of leaking `FiberFailure` stacks, and skip optional external verifiers when the network is Undeployed or the secret is absent rather than surfacing `missing_secret`.

Add the matching new rows to the NFT-rail failure-mode table (cached-wallet `SubmissionError`, partial single-contract redeploy, "claim failed" but transfer landed, `Database failed to open`, stale dev-server tree, `bun <<'EOF'` heredoc, orphaned containers after moving the repo, pending rows after a chain wipe) and four new red flags (no cached wallet provider, no hardcoded contract counts, don't re-click through a 117, don't leave a previous chain's branding in copy).

## Regenerating the bundles

Run the bundle builder to rewrite the 16 per-(network × OS) prompt files plus the mobile bundle, then the full combined bundle with the streaming writer, and re-externalise them as assets:

1. Build per-combo files and refresh `public/llms-full.meta.json`.
2. Build `llms-full.txt` (~2.2 GB, includes the hidden Mainnet variants) with the streaming path.
3. Externalise every regenerated `.txt` and update the `*.asset.json` pointers.
4. Verify the `/llms` page shows the new sizes and generation timestamp.

## Technical notes

- Prompt text lives in `src/lib/mega-prompt-variants.ts`; only `NFT_LEDGER_LESSONS` and `REDFLAGS` are touched. No route or UI changes.
- `scripts/build-llms-full.mjs` is used as-is, including its `SKIP_COMBOS` flag, so the full-bundle pass can run separately from the per-combo pass to stay inside memory limits.
- Idea count, network list, and OS list are unchanged — 9,980 visible prompts, 31,936 variants including hidden Mainnet.
