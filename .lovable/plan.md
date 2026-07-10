## You're at: fresh folder, `bun install` done, `.midnight-wallet.local` present

No `.env` needed — the deploy script now defaults to preview everywhere (network id + indexer + rpc). Move straight to Docker + deploy.

Commands below are grouped **macOS/Linux** vs **Windows (PowerShell)**. Pick your row.

## Run these, in order, from the `midnightprompts-main` folder

1. **Lock down the seed file** (SDK ignores world-readable seeds):

   **macOS/Linux:**
   ```
   chmod 600 .midnight-wallet.local
   ```

   **Windows (PowerShell):**
   ```powershell
   icacls .midnight-wallet.local /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
   ```
   (removes inherited permissions, grants only your user read/write — the SDK's equivalent of `0600`)

2. **Confirm Lace shows tDUST**, not just tNIGHT.
   - Open Lace → make sure network is **Midnight Preview** (top).
   - If the balance line reads only tNIGHT, click **Generate tDUST**, wait ~1 min for the tDUST balance to appear.
   - You cannot deploy without tDUST — the faucet only gives tNIGHT.

3. **Start Docker Desktop.**

   **macOS/Linux:** if the whale icon isn't in your menu bar, launch Docker Desktop and wait until it says "Docker Desktop is running".

   **Windows:**
   - Install Docker Desktop for Windows if you don't have it — use the **WSL 2 backend** (recommended). If Windows prompts you to install/update the WSL 2 kernel on first launch, accept.
   - Launch Docker Desktop from the Start menu; wait for the whale tray icon (bottom-right) to say "Docker Desktop is running".

4. **Start the proof server** (once per machine — the container persists across restarts):

   **macOS/Linux:**
   ```
   docker start midnight-proof-server 2>/dev/null || \
     docker run -d --name midnight-proof-server -p 6300:6300 \
       midnightntwrk/proof-server:latest midnight-proof-server -v
   curl http://localhost:6300/health
   ```

   **Windows (PowerShell / Windows Terminal — not cmd.exe):**
   ```powershell
   docker start midnight-proof-server
   if ($LASTEXITCODE -ne 0) {
     docker run -d --name midnight-proof-server -p 6300:6300 `
       midnightntwrk/proof-server:latest midnight-proof-server -v
   }
   curl.exe http://localhost:6300/health
   ```
   Use `curl.exe` explicitly — PowerShell's built-in `curl` is an alias for `Invoke-WebRequest` and returns a different shape.

   Expect `{"status":"ok",...}`.

5. **Deploy** (same on both platforms):
   ```
   bun scripts/deploy-midnight.mjs
   ```
   Don't have bun on Windows? Install with:
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
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
| `Cannot connect to the Docker daemon` (macOS/Linux) | Docker Desktop app closed | Launch Docker Desktop, then step 4 |
| `error during connect: ... docker_engine: The system cannot find the file specified` (Windows) | Docker Desktop not started or WSL 2 backend not ready | Open Docker Desktop, wait for green status, retry step 4 |
| `insufficient funds` mid-deploy | Lace hasn't finished converting | Wait 60s, retry |
| Proving hangs > 3 min | First cold proof | Watch `docker logs -f midnight-proof-server` — normal for first run |
