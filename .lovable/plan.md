## Plan

1. **Do not accept or use your recovery phrase in chat**
   - Treat the 12/24 words as a private key.
   - Keep it only on your local computer or inside a local `.env`/terminal variable that is never committed.

2. **Add a local-only wallet check script**
   - Create a script that derives:
     - Preview unshielded address
     - Preview shielded address using the same seed path as the deploy script
     - Preprod unshielded/shielded addresses for comparison
   - It will print public addresses only, never print the recovery phrase.
   - You can run it locally like:
     ```bash
     MIDNIGHT_WALLET_SEED="your words stay local" bun scripts/check-midnight-wallet.mjs --network=preview
     ```

3. **Fix the likely root cause in the deploy script**
   - The terminal screenshot shows the script is still deriving `mn_addr_preview...` but the shielded address is still `mn_shield-addr_test1...`.
   - That means the unshielded and shielded encoders are not using the same Preview address suffix.
   - Update the deploy script so Preview shielded derivation uses the Preview bech32 suffix consistently instead of the older test suffix path.

4. **Add a built-in mismatch warning**
   - The deploy script will print expected address prefixes for the selected network.
   - If Preview produces `mn_shield-addr_test1...` or `mn_addr_test1...`, it will stop and explain that the SDK is still on the wrong network suffix before asking you to fund anything.

5. **Update the README instructions**
   - Add the exact safe command sequence for checking addresses locally first.
   - Include a warning to never paste recovery words into chat, screenshots, or browser forms.

## What you’ll do after this is implemented

Run the local check first:

```bash
MIDNIGHT_WALLET_SEED="your 12 or 24 words here, only in your terminal" bun scripts/check-midnight-wallet.mjs --network=preview
```

Then compare the printed public addresses against Lace. If they match, you can run:

```bash
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

## Technical notes

- I cannot safely verify your real wallet inside the Lovable sandbox because that would require your recovery phrase to leave your machine.
- I can add deterministic local tooling so you can verify the same SDK code path before doing the deploy.
- The visible mismatch strongly suggests Preview shielded address encoding is still falling back to the legacy `test` suffix while the unshielded address now uses `preview`.