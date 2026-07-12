## Goal

Add `/showcase/move-board` — a third demo that submits a Midnight `callTx` (dance move) against an **already-deployed** contract, so visitors skip the DUST-heavy deploy step and only pay the cheaper call fee. Contract pattern is `midnightntwrk/example-bboard` (post + take with private-author ZK commitment), deployed once from my machine and pinned into project data — same pattern as the existing pinned Midnight Ledger.

## Contract (mirrors example-bboard's public shape, our Compact 0.23 stack)

`contracts/MoveBoard.compact` — small, fits our existing toolchain (Compact 0.23, MidnightJS 4.1.1) rather than dragging in bboard's upstream version pins. Semantics match bboard:

```
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger state: Uint<8>;                        // 0=vacant, 1=occupied
export ledger poster_commitment: Bytes<32>;
export ledger move_label: Opaque<"string">;
export ledger move_count: Counter;

witness localSecretKey(): Bytes<32>;

constructor() { state = 0; }

export circuit post(label: Opaque<"string">): [] {
  assert(state == 0, "occupied");
  const sk = localSecretKey();
  const seq = move_count as Field as Bytes<32>;
  poster_commitment = disclose(
    persistentHash<Vector<3, Bytes<32>>>([pad(32, "moveboard:poster:"), seq, sk])
  );
  move_label = disclose(label);
  state = disclose(1);
  move_count.increment(1);
}

export circuit take(): [] {          // only the original poster can clear
  assert(state == 1, "vacant");
  const sk = localSecretKey();
  const seq = ((move_count as Field) - 1) as Bytes<32>;
  const commit = persistentHash<Vector<3, Bytes<32>>>(
    [pad(32, "moveboard:poster:"), seq, sk]
  );
  assert(commit == poster_commitment, "not poster");
  state = disclose(0);
}
```

Attribution: the demo page cites `github.com/midnightntwrk/example-bboard` as the pattern source; we reimplemented it to match our pinned toolchain.

## Deploy script — one-time, then pin

- New: `scripts/deploy-moveboard.mjs` (mirrors `scripts/deploy-midnight.mjs`). Reads `MIDNIGHT_WALLET_SEED` + `--network=preview|preprod`, deploys once, writes `src/data/moveboard-contract.<network>.json` with `{ address, deployTx, network, compactVersion, ... }` — identical schema to `midnight-contract.<network>.json`.
- New: `src/data/moveboard-contract.preview.json` + `moveboard-contract.preprod.json` seeded with placeholder addresses (all-zero) so the UI can render "awaiting deploy" until the script has run.
- New: `src/data/moveboard-contract.ts` — mirrors `midnight-contract.ts` exports (`MOVEBOARD_CONTRACTS`, `isDeployed`). Reuses `NetworkId` / `PLACEHOLDER_ADDRESS` from `midnight-contract.ts`.

## Route + UI: `src/routes/showcase.move-board.tsx`

- `head()`: distinct title + description ("Post a dance move · Midnight bboard-pattern demo").
- Loader: none (pure client render, MidnightJS is client-only).
- Body:
  - Eyebrow "Demo 03 · Bboard pattern"
  - Explanation: "This demo calls an already-deployed contract on Preprod/Preview. No fresh deploy required — you only pay the (much smaller) callTx DUST cost. Contract pattern from `example-bboard`."
  - Deployed-address card (pinned from `moveboard-contract.<network>.json`, links to `${cfg.explorer}/contract/<address>`).
  - Network toggle Preview / Preprod (same UX as the ledger demo).
  - Lace-connect button (reuses `use-midnight-wallet.ts`).
  - Live state read from indexer via existing helper: shows `move_count`, current `move_label`, `state` (Vacant / Occupied), `poster_commitment`.
  - Input `Enter a dance move`, submit → `post(label)`. If already occupied and the connected wallet's commitment matches, show `Take (clear the board)` → `take()`.
  - `Proving…` state + "this takes 30–120s" copy, matching the other demos.
- Callout linking to `/known-issues#lace-dust-sdk-zero` for the DUST sync issue.

## Contract-call plumbing

- New: `src/lib/moveboard-contract.client.ts` (client-only, dynamic-imported behind `useHydrated()`), exporting `postMove(label)` and `takeMove()`. Uses the existing providers wiring pattern from `use-midnight-wallet.ts`. `createUnprovenCallTx → proveTx → balanceTx → submitTx` (the decoupled pipeline documented in `/known-issues#prove-submit-hang`) so we surface a clean "Proving…" → "Submitting…" state and can add an app-level timeout.
- ZK keys/zkir copied to `public/keys/move-board/` and `public/zkir/move-board/` by the deploy script (same convention as the ledger demo).

## Nav wiring

- `src/routes/showcase.index.tsx`: add a 3rd card ("Move Board — call an existing contract, no deploy"). Copy explicitly frames it as the DUST-sync workaround.
- `src/routes/index.tsx` (homepage): the existing Status card lists Preview/Preprod for the ledger deploy — add a second row for the move-board deploy so visitors can see both pinned contracts.
- No changes to `__root.tsx` header nav (showcase index already lists all demos).

## Out of scope

- No changes to the ideas mega-prompts.
- No changes to the existing midnight-ledger or programmatic-dust demos.
- No SDK/version pin changes.
- Upstream `example-bboard` is credited but not vendored — the Compact source lives in this repo.

## Runbook (what the user does after I ship the code)

```bash
export MIDNIGHT_WALLET_SEED="..."          # existing preprod seed
compact compile contracts/MoveBoard.compact contracts/managed/move-board
cp -r contracts/managed/move-board/keys public/keys/move-board
cp -r contracts/managed/move-board/zkir public/zkir/move-board
bun scripts/deploy-moveboard.mjs --network=preprod   # writes src/data/moveboard-contract.preprod.json
```

After that, `/showcase/move-board` is live and any Lace-connected visitor with Preprod DUST can post a move without deploying anything.
