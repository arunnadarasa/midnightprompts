## Why the mismatch

The script and Lace derive **different keys from the same 24 words** because they use different derivation paths:

- **Lace** uses the official Midnight HD derivation (`@midnight-ntwrk/wallet-sdk-hd` via `WalletSeeds.fromMnemonic`), which splits the mnemonic into distinct **shielded** and **unshielded** seed material. This produces addresses like `mn_shield-addr_preprod1cah9s…` and `mn_addr_preprod1jgkgn…`.
- **`scripts/deploy-midnight.mjs`** takes a shortcut: `mnemonicToSeedSync(mnemonic).slice(0, 64)` — the first 32 bytes of the raw BIP-39 seed — and feeds that straight into `WalletBuilder.buildFromSeed`. That is a *different* private key, so it derives a different shielded address (`mn_shield-addr_test1vzn…`) and, because tDUST is held by the Lace-derived key, the script sees 0 balance.

There is also a **network-suffix bug**: the script hardcodes `NetworkId.TestNet` for both `preview` and `preprod`, which is why its derived address shows the `…test1…` prefix instead of `…preprod1…` even when `VITE_NETWORK_ID=preprod`.

Your existing `scripts/derive-unshielded-address.mjs` already does it correctly (uses `WalletSeeds.fromMnemonic` + per-network bech32 suffix) — that's why the addresses it prints match Lace. The deploy script just needs to follow the same path.

## Fix

### 1. `scripts/deploy-midnight.mjs` — derive keys the way Lace does

Replace the naive seed derivation with the HD path used by `derive-unshielded-address.mjs`:

```js
import { WalletSeeds } from "@midnight-ntwrk/testkit-js";
// …
const seeds = WalletSeeds.fromMnemonic(mnemonic.trim());
// Shielded seed drives the Zswap wallet used for balance + tx signing.
const seedHex = Buffer.from(seeds.shielded).toString("hex");
const wallet = await WalletBuilder.buildFromSeed(
  INDEXER_HTTP, INDEXER_WS, PROOF_SERVER, NODE_RPC,
  seedHex, networkEnum,
);
```

Fix the network mapping so preview and preprod pick the correct `NetworkId`:

```js
switch (NETWORK_ID) {
  case "preprod": networkEnum = NetworkId.TestNet; break;   // preprod == TestNet enum
  case "preview": networkEnum = NetworkId.Undeployed; break; // preview uses Undeployed
  case "mainnet": networkEnum = NetworkId.MainNet; break;
  default: die(...);
}
```

(Confirm the exact enum name for preview against `@midnight-ntwrk/zswap`; if the SDK groups both under `TestNet`, then the mismatch is purely in the bech32 suffix — the shielded key itself is correct once we switch to `WalletSeeds`.)

### 2. Sanity check after the change

Add a startup log that prints the derived shielded + unshielded addresses side-by-side and asserts the prefix matches the target network:

```
[deploy] network=preprod
[deploy] shielded:   mn_shield-addr_preprod1cah9s…   ← should match Lace
[deploy] unshielded: mn_addr_preprod1jgkgn…         ← should match Lace
```

If the printed shielded address doesn't match the one you pasted from Lace, the run aborts before spending anything.

### 3. `src/routes/wallet.tsx` — update the "Script wallet ≠ Lace wallet" callout

The current callout says Option B (paste Lace's seed) will make the script match Lace. That was wrong before this fix. Update it to note:
- The script now uses the same HD derivation as Lace, so Option B genuinely produces the same addresses.
- Include a one-liner: "Verify by running `bun scripts/derive-unshielded-address.mjs` — the printed addresses must match Lace before deploying."

### 4. `scripts/deploy-midnight.README.md`

Mirror the same explanation: "Prior versions derived a different key from the same mnemonic. If you deployed with an older script, your funds are on the Lace-derived address and the script's own address is empty — paste your Lace seed into `.midnight-wallet.local` and re-run."

## Not changing

Compact contract, provider wiring, proof-server flow, faucet/tDUST UI walkthrough, `derive-unshielded-address.mjs` (already correct).

## Expected result

After the fix, with your Lace Mac Local 24 words in `.midnight-wallet.local` and `VITE_NETWORK_ID=preprod`, the script prints `mn_shield-addr_preprod1cah9s…` (matching your Lace preprod address), sees the tDUST you already have, and proceeds to phase 2.
