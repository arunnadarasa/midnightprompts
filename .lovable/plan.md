## Problem

Wallet SDK errored `Expected 32-byte seed`. `mnemonicToSeedSync(mnemonic)` returns a 64-byte BIP-39 seed (128 hex chars); the Midnight zswap WASM wants exactly 32 bytes (64 hex chars).

## Fix

In `scripts/deploy-midnight.mjs` `buildWallet(...)`, truncate the BIP-39 seed to its first 32 bytes before passing it in:

```js
const seedHex = mnemonicToSeedSync(mnemonic).toString("hex").slice(0, 64);
```

Pass `seedHex` as the 5th arg to `WalletBuilder.buildFromSeed(...)`. No other changes.

This is stable: the same mnemonic always yields the same 32-byte prefix, so the address stays deterministic across re-runs.

## Then

Re-run `bun scripts/deploy-midnight.mjs`. Expected: prints shielded address + `tDUST balance: 0` + Lace/faucet instructions.