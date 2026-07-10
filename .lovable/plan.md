## Why I can't push the deploy button myself

The Lovable sandbox has no Docker, no access to your `localhost:6300` proof server, and no copy of your 24-word mnemonic. Midnight's privacy model is exactly this — the proof + signing must happen where the secret key lives, which is your machine. So the deploy is one command **you** run; I handle everything before and after.

## Step 1 — you run (in your Mac terminal, at the project root)

```bash
# sanity checks
docker ps | grep midnight-proof-server            # confirm still running
curl -s http://localhost:6300/health              # {"status":"ok",...}
ls -la .midnight-wallet.local                     # must exist, mode 0600

# if the wallet file isn't there yet:
echo "your twenty four word mnemonic here" > .midnight-wallet.local
chmod 600 .midnight-wallet.local

# deploy
bun install
bun scripts/deploy-midnight.mjs
```

The script will:
1. Load the mnemonic → derive the preprod wallet
2. Sync the wallet against the preprod indexer (shows tDUST balance)
3. Load the compiled `TimestampLog` ZK keys
4. Send the deploy tx via **your local proof server** at `localhost:6300`
5. Wait for finalization on preprod
6. Print `address: 0x…` + `deployTx: 0x…` and write both into `src/data/midnight-contract.json`

Expected time: ~30–120s for the first proof (container warm-up), then ~15–30s to finalize.

## Step 2 — you paste the output into chat

Just paste the two lines the script prints (address + deployTx). Or paste the whole new contents of `src/data/midnight-contract.json` if it's easier. Either works.

## Step 3 — I wire it into the site (build mode)

Once I have the address + tx hash I will, in one turn:

1. Update `src/data/midnight-contract.json` with the real values (address, deployTx, and flip a `verified: true` flag).
2. Verify the Deploy Status panel on `/proof-server` flips from "○ awaiting deploy" to "● live on preprod" with working explorer links (`preprod.midnightexplorer.com/contract/…` and `/tx/…`).
3. Update the `/showcase/midnight-ledger` page so the "Contract address" box shows the real hex + a link to the explorer instead of `0x00… (contract not yet deployed on this network)`.
4. Point the "Read latest entry" call at the live contract via the preprod Indexer GraphQL endpoint so the showcase hydrates from real chain state.

## If the deploy fails, common causes

| Error | Fix |
|---|---|
| `insufficient tDUST` | You have tNIGHT but never clicked **Generate tDUST** in Lace. Do that, wait 10s, retry. |
| `ECONNREFUSED 127.0.0.1:6300` | Proof server container stopped. `docker start midnight-proof-server`. |
| Script hangs at "Proving…" for >3 min | First proof after boot; give it another minute. If still stuck, `docker logs -f midnight-proof-server` and paste the tail here. |
| `wallet sync: 0 tDUST` even though Lace shows a balance | The mnemonic in `.midnight-wallet.local` isn't the same wallet you funded. Double-check it matches the Lace account you funded. |

## Optional — want me to make the deploy script safer first?

Before you run it I can, if useful:
- Add a preflight check to the script (health check + tDUST balance + confirms address before broadcasting).
- Print the derived address at the top so you can compare it to Lace before it spends anything.

Say **"add preflight"** and I'll do that in this turn; otherwise just run the deploy and paste the output.
