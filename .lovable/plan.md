# Yes — use `@midnight-ntwrk/testkit-js` to derive the unshielded address in the sandbox

Great find. Testkit-js exposes exactly what we need, deterministically from
a seed, with no Docker / proof server / Lace involvement.

## Why this works

From <https://docs.midnight.network/api-reference/testkit-js/classes/MidnightWalletProvider>
and the recent testkit fix commit (`f1b980b`):

- `MidnightWalletProvider.build(logger, env, seed)` constructs the full
  wallet stack from a seed.
- Its `unshieldedKeystore` field is a `UnshieldedKeystore`.
- `unshieldedKeystore.getBech32Address().asString()` returns the
  `mn_addr_test1…` Bech32m address — the exact format the Nethermind
  preprod faucet accepts.

Same seed → same address as Lace would produce, because both go through
the wallet-sdk unshielded key path (`ledger.addressFromKey(signatureVerifyingKey(sk))`).

## Plan

1. **Install** `@midnight-ntwrk/testkit-js@^4.0.4` (dev dep).
2. **New script** `scripts/derive-unshielded-address.mjs`:
   - Load the 24-word mnemonic from the `MIDNIGHT_WALLET_SEED` secret
     (already stored in the sandbox — never printed).
   - Convert to seed bytes with `bip39.mnemonicToSeedSync`, take the first
     32 bytes as the hex seed testkit-js expects.
   - Build a preprod `EnvironmentConfiguration` pointing at the same
     Indexer / RPC we already use (`indexer.preprod.midnight.network`,
     `rpc.preprod.midnight.network`). No proof server URL needed for
     address derivation; we'll pass a dummy value and never call
     `balanceTx`.
   - Call `MidnightWalletProvider.build(logger, env, seedHex)`.
   - Read `provider.unshieldedKeystore.getBech32Address().asString()` →
     `mn_addr_test1…`.
   - Also cross-check that the shielded address it derives matches the one
     already in `src/data/midnight-wallet.json`. If they don't match, abort
     and log the mismatch (would mean testkit derives a different account
     path than `WalletBuilder` did — need to know before we tell you to
     fund it).
   - Write both addresses back into `src/data/midnight-wallet.json`:

     ```json
     {
       "network": "preprod",
       "shieldedAddress": "mn_shield-addr_test1…",
       "unshieldedAddress": "mn_addr_test1…",
       "createdAt": "…",
       "faucet": "https://midnight-tmnight-preprod.nethermind.dev/",
       "docs": "https://docs.midnight.network/guides/acquire-tokens"
     }
     ```
   - Print the unshielded address to chat (public — safe to share).
3. **Run it once** in the sandbox and paste the resulting `mn_addr_test1…`
   in the reply.
4. **Update the showcase page** (`/showcase/midnight-ledger`) to display
   the unshielded address in the "fund this" panel with a copy button,
   linking directly to the faucet.

## Fallback if testkit-js won't install cleanly

If `bun add @midnight-ntwrk/testkit-js` conflicts with our pinned
`@midnight-ntwrk/wallet@4.0.0` (testkit may pull a newer wallet), the
alternative from the same docs (`sdks/official/wallet-developer-guide`)
is a two-package direct derivation:

```ts
import { UnshieldedAddress, MidnightBech32m } from
  '@midnight-ntwrk/wallet-sdk-address-format';
import * as ledger from '@midnight-ntwrk/ledger-v8';

const vk = ledger.signatureVerifyingKey(unshieldedSk.toString('hex'));
const addr = new UnshieldedAddress(Buffer.from(ledger.addressFromKey(vk), 'hex'));
const bech32 = MidnightBech32m.encode('preprod', addr).toString();
```

Requires installing `@midnight-ntwrk/ledger-v8` and bumping
`@midnight-ntwrk/wallet-sdk-address-format` to a version that exports
`UnshieldedAddress` (our current copy doesn't). I'll only fall back to
this if testkit-js install fails.

## Files I'll create / edit

- `package.json` / `bun.lock` — add `@midnight-ntwrk/testkit-js` dev dep.
- `scripts/derive-unshielded-address.mjs` — new derivation script.
- `src/data/midnight-wallet.json` — add real `unshieldedAddress`.
- `src/routes/showcase.midnight-ledger.tsx` — show both addresses; the
  unshielded one is the "paste into the faucet" address.
- `scripts/deploy-midnight.README.md` — replace "import into Lace" step
  with "run `bun scripts/derive-unshielded-address.mjs`".

Approve and I'll ship it.
