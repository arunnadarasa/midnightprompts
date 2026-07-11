## Diagnosis

Progress: the bypass worked — the balance gate no longer blocks, and the script actually called `deployContract`. But a fresh, unrelated error surfaced:

```
TypeError: undefined is not an object (evaluating 'context.ctor')
  at compactContext.js:23 (createContract)
  at createUnprovenDeployTxFromVerifierKeys (midnight-js-contracts:953)
```

This is a **shape mismatch between the script and the SDK**, not a wallet/DUST problem:

- `scripts/deploy-midnight.mjs` currently builds `new Contract({ localSecretKey: … })` (raw class from `contracts/managed/timestamp-log/contract/index.js`) and passes that as `compiledContract`.
- `midnight-js-contracts@4.1.1` now expects a **CompactContext-wrapped object** carrying an internal `Symbol` with `{ ctor, witnesses }`. A raw `Contract` instance has no such symbol, so `context.ctor` is undefined and it throws before any tx work happens.

The public factory for the new shape is exported from `@midnight-ntwrk/compact-js` (already installed as a transitive dep):

```js
import { CompiledContract } from '@midnight-ntwrk/compact-js';
const compiledContract = CompiledContract
  .make('TimestampLog', Contract)                                  // class, not instance
  .pipe(
    CompiledContract.withWitnesses({
      localSecretKey: (ctx) => [ctx.privateState, sk],
    }),
    CompiledContract.withCompiledFileAssets(MANAGED),              // path to contracts/managed/timestamp-log
  );
```

The compiled `Contract` class itself is fine — the compact 0.23 output is still what the SDK targets; only the wrapping call changed.

DUST is a separate story: the sync loop shows `dust.isStrictlyComplete=false` for the full 464s and `state.dust.availableCoins: 0`, while the unshielded UTXO is present and `registeredForDustGeneration=true`. That's normal Preview-network DUST-indexer lag, not a bug. Once the shape bug is fixed we'll see whether the deploy actually needs the DUST first or if the wallet's cached "insufficient DUST" surfaces next.

## Plan

Single file, single script — `scripts/deploy-midnight.mjs`.

### Step 1 — Import the CompiledContract factory
Alongside the existing `deployContract` import:

```js
const { CompiledContract } = await import("@midnight-ntwrk/compact-js");
```

### Step 2 — Replace the compiledContract construction
Currently (line 634):
```js
const compiledContract = new Contract({ localSecretKey: (context) => [context.privateState, sk] });
```

Replace with:
```js
const compiledContract = CompiledContract
  .make("TimestampLog", Contract)
  .pipe(
    CompiledContract.withWitnesses({
      localSecretKey: (context) => [context.privateState, sk],
    }),
    CompiledContract.withCompiledFileAssets(MANAGED),
  );
```

`MANAGED` is the existing constant pointing at `contracts/managed/timestamp-log`, which already holds `keys/` and `zkir/` used by `NodeZkConfigProvider`.

### Step 3 — Keep everything else intact
`deployContract(providers, { compiledContract })`, the balance-gate bypass, the DUST diagnostic, the `src/data/midnight-contract.<net>.json` write, and the Indexer verification poll all stay as-is.

### Step 4 — Verify
Have the user re-run with the same command:

```
VITE_NETWORK_ID=preview MIDNIGHT_ALLOW_ZERO_DUST=1 bun scripts/deploy-midnight.mjs
```

Three possible outcomes and what each means:

1. Script proceeds through proving and prints a contract address + tx hash → done, remove the bypass on the next run.
2. Script fails with a fresh, real "insufficient tDUST / balancing failed" error → the DUST sync really was empty, we send a small amount of tNIGHT from Lace to the script's unshielded address and rerun.
3. Different error → we diagnose from the new stack.

### Not changing (per user's UI-only convention)
No UI/business-logic edits, no wallet or Docker changes, no re-derivation, no seed changes.