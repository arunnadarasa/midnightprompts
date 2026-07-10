## You're at: fresh folder, `bun install` done, `.midnight-wallet.local` present

No `.env` needed — the deploy script now defaults to preview everywhere (network id + indexer + rpc). Move straight to Docker + deploy.

## Run these, in order, from the `midnightprompts-main` folder

1. **Lock down the seed file** (SDK ignores world-readable seeds):
   ```
   chmod 600 .midnight-wallet.local
   ```

2. **Confirm Lace shows tDUST**, not just tNIGHT.
   - Open Lace → make sure network is **Midnight Preview** (top).
   - If the balance line reads only tNIGHT, click **Generate tDUST**, wait ~1 min for the tDUST balance to appear.
   - You cannot deploy without tDUST — the faucet only gives tNIGHT.

3. **Start Docker Desktop** if the whale icon isn't in your menu bar. Wait until it says "Docker Desktop is running".

4. **Start the proof server** (once per machine — the container persists across restarts):
   ```
   docker start midnight-proof-server 2>/dev/null || \
     docker run -d --name midnight-proof-server -p 6300:6300 \
       midnightntwrk/proof-server:latest midnight-proof-server -v
   curl http://localhost:6300/health
   ```
   Expect `{"status":"ok",...}`.

5. **Deploy:**
   ```
   bun scripts/deploy-midnight.mjs
   ```

## What success looks like

```
[midnight-deploy] === phase 1: wallet ===
[midnight-deploy] using existing wallet seed from .midnight-wallet.local
[midnight-deploy] building wallet for network=preview (enum=2)
  Shielded address (SDK-side...):
  mn_shield-addr_test1...
[midnight-deploy] current tDUST balance: <N ≥ 1>
[midnight-deploy] === phase 2: deploy ===
[midnight-deploy] submitting deployContract — proving may take 30–120s…
[midnight-deploy] deployed in 45.2s
[midnight-deploy] contract address: <64 hex>
[midnight-deploy] deploy tx:        <64 hex>
[midnight-deploy] verified: Indexer returned state
[midnight-deploy] updated src/data/midnight-contract.json
```

## Paste back to me

Just the last block — `contract address`, `deploy tx`, and `verified: …`. I'll wire it into the site.

## If it fails

| Error | Cause | Fix |
|---|---|---|
| `tDUST balance: 0` | Skipped Generate tDUST | Step 2 |
| `ECONNREFUSED 127.0.0.1:6300` | Proof server not running | Step 4 |
| `Cannot connect to the Docker daemon` | Docker Desktop app closed | Launch Docker Desktop, then step 4 |
| `insufficient funds` mid-deploy | Lace hasn't finished converting | Wait 60s, retry |
| Proving hangs > 3 min | First cold proof | Watch `docker logs -f midnight-proof-server` — normal for first run |