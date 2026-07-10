## The mismatch

- Lace + faucet: **Preview** (`mn_addr_preview1…`, `midnight-tmnight-preview.nethermind.dev`)
- Deploy script + app config: **Preprod** (`VITE_NETWORK_ID=preprod`, preprod indexer, preprod explorer)

Preview and Preprod are separate networks with separate ledgers and separate faucets. Funds on one are invisible to the other.

Pick one path. **Option A is faster because your wallet is already funded on preview.**

---

## Option A — Switch the project to Preview (recommended, ~5 min)

**No re-funding needed.** I'll flip every "preprod" reference to "preview".

Files I'll edit:
- `src/data/midnight-contract.json` → `network: "preview"`, `explorer: "https://preview.midnightexplorer.com"`, indexer URLs → preview
- `.env` (or wherever `VITE_NETWORK_ID` / `VITE_INDEXER_URL` / `VITE_INDEXER_WS_URL` / `VITE_NODE_RPC` live) → preview endpoints:
  - `VITE_NETWORK_ID=preview`
  - `VITE_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql`
  - `VITE_INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws`
  - `VITE_NODE_RPC=https://rpc.preview.midnight.network`
- `scripts/deploy-midnight.mjs` — no code change; it already reads `VITE_NETWORK_ID` and maps preview → `NetworkId.TestNet`. It'll pick up the new env.
- Any UI copy on `/proof-server` and `/showcase/midnight-ledger` that hardcodes "Preprod" → "Preview" (labels + explorer/faucet links).

You then:
1. In Lace, make sure you clicked **Generate tDUST** (converts your tNIGHT → tDUST). Wait for the tDUST balance to appear.
2. Confirm proof server is up: `curl http://localhost:6300/health`.
3. Re-run: `bun scripts/deploy-midnight.mjs`.
4. Paste the `contract address` + `deploy tx` here.

Caveat: Preview resets periodically, so any deployed contract may vanish in a few weeks. Fine for a demo, not for anything long-lived.

---

## Option B — Stay on Preprod (more robust, ~5 min + faucet wait)

Keep the code untouched. You:
1. In Lace, switch network from **Midnight Preview** to **Midnight Preprod**.
2. Copy the Preprod unshielded address (`mn_addr_preprod1…`, different from the preview one).
3. Fund at the preprod faucet: `https://midnight-tmnight-preprod.nethermind.dev/`.
4. Click **Generate tDUST** in Lace.
5. Re-run `bun scripts/deploy-midnight.mjs`.

---

## Which do you want?

Reply "A" (switch project to preview) or "B" (stay preprod, I'll re-fund on preprod). Default: A.