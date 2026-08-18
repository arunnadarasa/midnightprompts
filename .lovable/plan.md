# Fold the newest Midnight skill section into the mega-prompts

The active Midnight skill has gained one section the project copies don't have yet: **"2026-08 update — ipsmidnight hard-won lessons (runner toolchain, job observability, anchor UX)"**. Everything else in the active skill is already reflected in the project copies and in the prompt builder.

## What's new in it

- **Toolchain pinning:** `compact-js@2.5.3` pulls an unpublished transitive alpha (`ledger-v9@^0.1.0-alpha.1`) so every install dies with `ETARGET / notarget`. Pin `compact-js@2.5.1`, pin every Midnight package exactly, never `@latest` or a caret.
- **Stale-install trap:** a failed install caches a bad resolution on the runner volume; clear `package-lock.json` + `node_modules` before retrying, and ship a "Clear toolchain" action that keeps the volume (and therefore the chain/private state).
- **A stalled install is an OOM kill, not a hang:** 4 vCPU / 4 GB / 10 GB volume, sequential install groups with an npm cache on the volume, ~30 s heartbeats, and surface Fly machine events + exit code (an OOM-killed process has an empty log tail).
- **Detached-job observability:** print `STEP_<name>` / `JOB_FAILED status=<n> during: <phase>` markers, drive a monotonic step timeline off them, persist the failed job's state and log auto-expanded, add copy-log, and never pipe proving logs through `head`/`awk` (SIGPIPE kills the prove).
- **Submitted ≠ verified:** an on-chain tx is `anchored`; only an explicit read-only `commitments.member(...)` check makes it `verified`. One shared tone helper for dot + badge, and once anchored, demote the write action and promote verification.
- **Mobile-first rows for long operations:** single column, metadata first, full-width 2-up action grid, full-width timelines/log tails, truncated titles.

## What I'll change

1. **Skill copies** — append the new section (with its failure-mode and anti-pattern tables) to `.agents/skills/lovable-midnight/SKILL.md` and `public/skills/lovable-midnight/SKILL.md`, keeping their existing m402 and ipsmidnight sections intact.

2. **`src/lib/mega-prompt-variants.ts`**
   - Extend `FLY_RUNNER_LESSONS` (already gated to the `undeployed-fly` variant) with the toolchain-pinning rules, the OOM/resource sizing, the sequential install groups + heartbeat, and the `STEP_`/`JOB_FAILED` marker + monotonic timeline contract.
   - Extend `VERIFICATION_HONESTY` (unconditional, every network) with the anchored-vs-verified status vocabulary, the single shared tone helper, the action demotion/promotion rule, and persisting failed-job logs instead of a toast.
   - Add the long-running-operation row layout rules to the existing frontend standards block.
   - Add matching red flags: `@latest`/caret on a Midnight package, retrying an install without clearing the lockfile, piping proving logs through `head`/`awk`, calling a submitted tx "verified", computing status colour in two places.

3. **`/known-issues`** — two rows: `ETARGET … ledger-v9@^0.1.0-alpha.1` on install, and an install that stalls silently with an empty log tail (OOM, not a hang).

4. **Regenerate the download bundles** — the 16 per-network/OS files plus the streamed multi-GB `llms-full.txt`, re-externalised as assets with a refreshed `public/llms-full.meta.json`. This is the slow part; steps 1–3 are live without it.

## Technical notes

- Prompt blocks are composed per network in `buildVariant`; `FLY_RUNNER_LESSONS` stays behind the `isUndeployedFly` gate while `VERIFICATION_HONESTY` and the red flags apply to all variants.
- Bundles come from `scripts/build-llms-full.mjs` (streaming, so no OOM); only the `*.asset.json` pointers change in the repo.
- No schema or backend changes.
