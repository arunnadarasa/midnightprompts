## Goal

Derive the **Midnight Preview testnet** shielded + unshielded addresses from the existing `MIDNIGHT_WALLET_SEED` (same 24-word mnemonic already used for preprod), and surface them alongside the preprod pair.

The Preview network is a separate Midnight testnet from preprod. Its bech32m network suffix is `test` (per Midnight's `NetworkId` mapping: `Undeployed`→`undeployed`, `DevNet`→`dev`, `TestNet`→`test`, `MainNet`→ none). So Preview addresses look like `mn_addr_test1…` and `mn_shield-addr_test1…`.

## Changes

1. **`scripts/derive-unshielded-address.mjs`** — make the network suffix a CLI flag / env var instead of a hardcoded `"preprod"`. Default stays `preprod` for back-compat. Also accept an `--out` path so we can write to a different JSON file per network.

   ```
   bun scripts/derive-unshielded-address.mjs --network=test --out=src/data/midnight-wallet-preview.json
   ```

2. **New file `src/data/midnight-wallet-preview.json`** — same shape as `midnight-wallet.json`, populated by running the script with `--network=test`. `network` field = `"preview"`, `faucet` points at the Preview faucet URL (same Nethermind faucet — it exposes a network selector; keep the docs link).

3. **`src/routes/showcase.midnight-ledger.tsx`** — import the new Preview JSON and render a second card ("Preview network") next to the existing preprod card, each showing its shielded + unshielded address with copy buttons. No other UI/business-logic changes.

4. **`scripts/deploy-midnight.README.md`** — add a one-liner showing the `--network=test` invocation for Preview.

## Out of scope

- Any change to preprod addresses, the deploy script, or the contract/wallet business logic.
- Generating a *separate* seed for Preview. Same seed → different network suffix → different-looking address, which is the standard Midnight pattern.

## Verification

After switching to build mode I'll run the script with `--network=test`, confirm the output starts with `mn_addr_test1` / `mn_shield-addr_test1`, and check the showcase route renders both cards.