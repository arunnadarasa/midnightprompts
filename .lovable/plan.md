## Where you are

Phase 1 succeeded: your wallet exists, seed is saved in `.midnight-wallet.local`, and the SDK confirmed a shielded address on preprod with 0 tDUST. Nothing to code — the script is waiting on funds.

## Do this now (all in Lace, not the script)

1. **Install Lace** (Midnight-enabled build): https://www.lace.io/ → install the browser extension → open it → switch network to **Midnight Preprod**.
2. **Import the same wallet Lace-side**: choose "Restore wallet" → paste the 24 words from `.midnight-wallet.local` (open the file with `cat .midnight-wallet.local`). Lace will now show the same wallet the script uses.
3. **Copy the Unshielded address** from Lace — it starts with `mn_addr_preprod1…` (or `mn_addr_test1…`). This is NOT the `mn_shield-addr_…` the script printed; the faucet rejects shielded addresses.
4. **Get tNIGHT from the faucet**: https://midnight-tmnight-preprod.nethermind.dev/ → paste the unshielded address → Request tokens. ~2 min later Lace shows ~1000 tNIGHT.
5. **Convert tNIGHT → tDUST**: in Lace click **Generate tDUST**. Wait until Lace shows a non-zero tDUST balance (a minute or two).
6. **Start the proof server** (Docker Desktop must be running first — whale icon in the menubar):
   ```
   docker run -d --name midnight-proof-server -p 6300:6300 \
     midnightntwrk/proof-server:latest midnight-proof-server -v
   curl http://localhost:6300/health
   ```
   Expect `{"status":"ok",...}`. If it's already running from before, `docker start midnight-proof-server` is enough.
7. **Re-run**:
   ```
   bun scripts/deploy-midnight.mjs
   ```
   This time the script skips the funding branch, submits `deployContract`, and (after 30–120s for the first proof) prints:
   - `contract address: <64 hex chars>`
   - `deploy tx:        <64 hex chars>`
   - writes both into `src/data/midnight-contract.json`.

## Then ping me

Paste either the two lines above or the updated `src/data/midnight-contract.json`, and I'll verify the Deploy Status panel on `/proof-server` and the `/showcase/midnight-ledger` link light up correctly.

## If something fails

- Faucet says success but script still shows 0 tDUST → step 5 skipped (you have tNIGHT, not tDUST).
- `Cannot connect to the Docker daemon` → Docker Desktop app itself isn't open. Launch it from Spotlight and wait for the whale icon.
- `ECONNREFUSED 127.0.0.1:6300` on re-run → container stopped: `docker start midnight-proof-server`.
- Deploy proof hangs >3 min on first run → normal for cold container; check `docker logs -f midnight-proof-server` for progress.