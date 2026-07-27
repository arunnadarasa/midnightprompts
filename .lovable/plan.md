## Goal

Recommend `midnight-wallet-cli` (npm package `midnight-wallet-cli`, repo `github.com/nel349/midnight-wallet-cli`) as the fastest path from seed → bech32 address, replacing the manual derive/check scripts as the primary recipe.

## Canonical recipe (used everywhere)

```bash
npm i -g midnight-wallet-cli
mn address --seed <64-hex-master-seed> --network preprod   # prints mn_addr_preprod1…
mn balance <mn_addr_preprod1…> --network preprod
```

Notes to include in every surface:
- Seed must be the 64-char hex master seed (32 bytes), not the mnemonic.
- `--network` accepts `preprod`, `preview`, `undeployed`, `mainnet`.
- Prints the unshielded address the faucet needs; shielded address is separate and not what the faucet uses.
- Never paste the seed in chat — run locally.

## Changes

### 1. `src/routes/wallet.tsx`
Add a new top card **"Fastest path: midnight-wallet-cli"** above the existing derive/check scripts section:
- Two-command snippet (`npm i -g …`, `mn address …`).
- Links to npm + GitHub repo.
- One-liner: "Skips wiring up derivation yourself. Our `scripts/derive-unshielded-address.mjs` remains as an offline fallback."
- Show `mn balance` as the follow-up verification command.

### 2. `src/routes/known-issues.tsx`
Add an entry under a "Wallet & funding" grouping (or the closest existing group):
- **Title:** "How do I turn my seed into a bech32 preprod/preview address?"
- **Fix:** the same 2-command CLI recipe + note that the seed is the hex master seed, not the mnemonic. Credit `norm` (Midnight dev-rel) via Discord.

### 3. `src/lib/mega-prompt-variants.ts`
Update the wallet-funding block used by web variants (preview, preprod, undeployed, undeployed-fly) so every one of the ~15k applicable prompts instructs Lovable to:
- Prefer `midnight-wallet-cli` for address derivation.
- Fall back to `scripts/derive-unshielded-address.mjs` only when the CLI is unavailable.
- Verify balance after funding with `mn balance … --network <net>`.

Mainnet variant stays hidden per existing rule; mobile variant unchanged (Kuira handles derivation).

### 4. Lovable Midnight skill (`public/skills/lovable-midnight/SKILL.md` + `.agents/skills/lovable-midnight/SKILL.md`)
Under the funding / preview-preprod section, add a short "Preferred: `midnight-wallet-cli`" subsection with the 2-command recipe, network flag values, and the "seed is 64-hex, not mnemonic" gotcha. Keep the offline `derive-unshielded-address.mjs` path as fallback. Apply via `skills--apply_draft`.

## Out of scope

- No changes to the derive/generate scripts themselves.
- No new route, no navigation change.
- No mainnet surfacing (still hidden).
