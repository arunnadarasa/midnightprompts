## Generate a Midnight wallet in the sandbox and save its address

Run a one-off script inside the Lovable sandbox that:

1. Generates a fresh 24-word BIP-39 mnemonic.
2. Derives the Midnight **shielded address** (`mn_shield-…`) for network `preprod` using `@midnight-ntwrk/wallet` + `@midnight-ntwrk/wallet-sdk-hd`.
3. Stores the mnemonic as a runtime secret `MIDNIGHT_WALLET_SEED` (never printed to chat, never committed).
4. Writes the public shielded address into `src/data/midnight-wallet.json` (committed) so it's easy to re-copy later:
   ```json
   {
     "network": "preprod",
     "address": "mn_shield-…preprod1…",
     "createdAt": "2026-07-09T…Z",
     "faucet": "https://cloud.google.com/application/web3/faucet/midnight/testnet"
   }
   ```
5. Prints the address + faucet link back to you in chat so you can fund it.

The mnemonic stays only in the `MIDNIGHT_WALLET_SEED` secret (used later by `scripts/deploy-midnight.mjs` phase 2). Nothing sensitive is written to disk in the repo.

### Steps in build mode

1. `bun add @midnight-ntwrk/wallet @midnight-ntwrk/wallet-sdk-hd @midnight-ntwrk/midnight-js-network-id bip39` (dev-only, needed to derive the address).
2. Add `scripts/generate-midnight-wallet.mjs` — generates mnemonic, derives address, writes `src/data/midnight-wallet.json`, prints address, and calls `set_secret` via a printed instruction (or I store it via the secret tool after reading the script's output).
3. Run the script once. Capture the address.
4. Paste the address here with the faucet link.

### What I will NOT do

- Not print the mnemonic in chat.
- Not commit the mnemonic to the repo.
- Not deploy anything yet — this turn is wallet-only. Deploy still needs the local Docker proof-server flow (unchanged).

### Open question

Do you want the address surfaced on the `/showcase/midnight-ledger` page as a "fund this address" banner until deploy completes, or keep it only in `src/data/midnight-wallet.json` + chat?
