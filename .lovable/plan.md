## What you're looking at

The Lace screen in the screenshot is **Settings → Your Keys**. `Encryption key` and `Coin key` are private key material — not addresses. Nothing to paste into the faucet from there. Also: **do not share those hex strings** with anyone (including me). Whoever holds them controls the wallet.

## Where the unshielded address actually lives in Lace

1. Click **Done** to close the "Your Keys" sheet.
2. In the left/bottom nav of Lace, click **Receive** (icon looks like a down-arrow into a tray). On some Lace builds it's under the wallet name → **Receive funds**.
3. Lace shows two tabs / two addresses for Midnight:
   - **Shielded** — starts with `mn_shield-addr_test1…` (long, ~130 chars). This is what the script printed. Faucet REJECTS this.
   - **Unshielded** — starts with `mn_addr_test1…` or `mn_addr_preprod1…` (much shorter). **This is the one you copy.**
4. Click the copy icon next to the Unshielded address.
5. Paste it into the preprod faucet: https://midnight-tmnight-preprod.nethermind.dev/ → Request tokens.
6. Wait ~1–2 min for tNIGHT to arrive → in Lace click **Generate tDUST** → wait for tDUST balance to appear.
7. Then re-run `bun scripts/deploy-midnight.mjs` (with the proof server already running on `localhost:6300`).

## If Lace only shows one address

Some Lace builds default to hiding the unshielded address. Toggle:
- Lace **Settings → Preferences → Show unshielded (Midnight)**, or
- On the Receive screen, look for a **Shielded / Unshielded** switch at the top.

## Sanity check

Confirm you're on **Midnight Preprod** in Lace (network switcher at the top of the wallet). If Lace is on "Midnight Preview" or Cardano, the address it shows won't match the network the script and faucet target.

## Next reply

Once you have the `mn_addr_…` unshielded string, you don't need to paste it here — just use it at the faucet. Ping me after the deploy script finishes and prints `contract address` + `deploy tx`.