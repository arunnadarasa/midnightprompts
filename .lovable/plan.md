# Extend the Lovable Midnight skill with the full zealymidnight ops brain

The skill already has a `2026-08 update — zealymidnight / MoveNft NFT rail on Undeployed` section covering insert-only maps, `listSale` naming, owner-PK domain, and the redeploy checklist. The new Cursor notes add a lot the skill does not yet have: the five-contract topology, the wallet-lifecycle rule, soft-fail secondary appends, single-writer discipline, and an ordered RpcError 117 recovery checklist.

## What gets added (extending the existing zealymidnight section, not a new one)

**Five-contract topology table** — MoveRegistry (`abodc:author:v1`), MoveNft (`movenft:minter:v1`), MandateVault (`ap2:buyer:v1`), OrderLedger (`ucp:merchant:v1`), MidnightUSDC (`musdc:signer:v1`), with circuits per contract and the rule that the UI's contract-count copy must derive from `CONTRACTS.length`, never a hardcoded word.

**New non-negotiables**
- Never cache a `MidnightWalletProvider` across HTTP requests: open → `callTx` → `stop()` in `finally`. A cached wallet holds LevelDB open and breaks the next contract family's call.
- Insert-only applies to the token contract too: mUSDC must insert `credits` / `credit_to` by nonce and use `faucet_claimed` / `spent_nonces` Sets — never overwrite `balances[from]` / `balances[to]`.
- One Midnight write at a time: UI-level busy flag, and a single exclusive ops owner of the Docker/LevelDB stack.
- Soft-fail secondary registry appends — the token transfer is the primary receipt; a failed `appendEntry` must not fail the user action.
- Resolve addresses from the deploy JSON first, env `VITE_*` second; after redeploy restart Vite **and** hard-refresh the browser.
- Third-party keys stay server-only (`PINATA_JWT`, never `VITE_PINATA_*`); skip optional external verifiers (e.g. ERC-1271) when the network is Undeployed or the secret is absent, instead of surfacing `missing_secret:` in the UI.

**Ordered RpcError 117 recovery checklist**: stop Vite → `rm -rf midnight-level-db .midnight` → recreate node/indexer/proof via compose → full deploy → verify with a debug transfer script expecting two `OK` lines → restart dev server → hard-refresh → exactly one UI action. Plus the code map: 117 = run the checklist (don't re-click), 104 = wipe + full deploy, 196 = recompile artefacts + wipe + deploy, and a note that `SubmissionError` / `FiberFailure` usually wrap `RpcError 1010 … Custom error: 117`.

**Failure-mode rows** appended to the existing table: cached wallet → next transfer `SubmissionError`; partial single-contract redeploy on dirty state; claim throwing on the secondary append after the transfer already landed; parallel clicks/agents → `Database failed to open`; wrong Vite working tree judged as a UX bug; `bun <<'EOF'` printing help instead of running; orphaned Docker containers after the compose workdir moved; stale UI "Pending" rows in localStorage after a chain wipe (not live stuck txs).

**Anti-patterns** added: hardcoding a contract count in user-facing copy, retrying the same failing UI click through a 117, and leaving stale chain-of-origin branding in user-visible strings after a network migration.

**Prove-log discipline** already present (`tee` + `rg`, no `awk`/`head`) gets a cross-reference from the new recovery section.

## Files touched

- `.agents/skills/lovable-midnight/SKILL.md` — extend the zealymidnight section, failure-mode table, anti-patterns.
- `public/skills/lovable-midnight/SKILL.md` — same content, matching the fuller public copy's structure and its Compact-gotchas cross-reference.

No app UI or mega-prompt regeneration in this plan — say the word if you also want the ~10,000 build prompts and `llms-full.txt` rebuilt with these rules.
