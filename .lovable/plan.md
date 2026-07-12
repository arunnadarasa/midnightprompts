## Issue

The Move Board demo (`/showcase/move-board`, labelled "Demo 03") currently shows placeholder addresses because no contract is deployed yet. The on-page instructions already tell the user to run the local deploy, but `scripts/deploy-midnight.mjs` is broken for the `MIDNIGHT_CONTRACT=move-board` path: `ROOT` and `SEED_FILE` are never defined, and there are duplicate declarations of `NETWORK_ID` / `CONTRACT_JSON` that overwrite the correct move-board data file path. Running the command would crash with `ReferenceError: ROOT is not defined`.

## Goal

Make `MIDNIGHT_CONTRACT=move-board VITE_NETWORK_ID=preview|preprod bun scripts/deploy-midnight.mjs` work end-to-end so a user can deploy the Move Board contract locally and have the site hydrate from the resulting address.

## Plan

1. **Repair `scripts/deploy-midnight.mjs`**
   - Define `ROOT` and `SEED_FILE` at the top of the script (e.g. `const __dirname = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.join(__dirname, ".."); const SEED_FILE = path.join(ROOT, ".midnight-wallet.local");`).
   - Remove the duplicate `const NETWORK_ID` / `const CONTRACT_JSON` block at lines 65–66 that currently forces the output path to `midnight-contract.<net>.json` even for `move-board`.
   - Keep the existing `CONTRACT_MAP` and `CONTRACT_CFG.dataFile()` logic intact so both `timestamp-log` and `move-board` writes land in the correct JSON files.

2. **Verify script syntax**
   - Run a static parse check (e.g. `node --check scripts/deploy-midnight.mjs` or `bun` syntax check) to confirm no `ReferenceError` and no duplicate-const errors.

3. **Confirm on-page instructions match**
   - The `/showcase/move-board` page already lists the exact commands the user needs:
     ```
     compact compile contracts/MoveBoard.compact contracts/managed/move-board
     cp -r contracts/managed/move-board/keys public/keys/move-board
     cp -r contracts/managed/move-board/zkir public/zkir/move-board
     MIDNIGHT_CONTRACT=move-board VITE_NETWORK_ID=<network> bun scripts/deploy-midnight.mjs
     ```
   - No UI changes are required unless the script fix reveals a mismatch in paths or env vars.

## Out of scope

- No changes to the Move Board contract source.
- No changes to the deploy flow for `timestamp-log` (Demo 01).
- No new pages or navigation changes.
- No changes to the README beyond what is necessary to keep the on-page instructions accurate.

## Verification

After the fix, a user can follow the commands printed on `/showcase/move-board` and the script will write the deployed address into `src/data/moveboard-contract.<network>.json`, at which point the demo page will show the live contract link and explorer URL.