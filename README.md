# MidnightPrompts

A TanStack Start site that showcases a live [Compact](https://docs.midnight.network/develop/tutorial/building/) smart contract (`TimestampLog`) deployed on the **Midnight Preview** testnet. Built for the Midnight hackathon.

- Live site: <https://midnightprompts.lovable.app>
- Midnight docs: <https://docs.midnight.network>
- Lace wallet: <https://www.lace.io>

## Stack

TanStack Start v1 · Vite 7 · React 19 · Tailwind v4 · Bun · Midnight SDK 4.x · Compact 0.23

## Prerequisites

- **Bun** ≥ 1.1
  - macOS/Linux: `curl -fsSL https://bun.sh/install | bash`
  - Windows (PowerShell): `powershell -c "irm bun.sh/install.ps1 | iex"`
- **Docker Desktop** (only needed if you want to run the proof server and deploy your own contract)
- **Lace wallet** browser extension, switched to **Midnight Preview**

## Run the site locally

```bash
bun install
bun run dev
```

Opens `http://localhost:8080`. The site reads the current contract address from [`src/data/midnight-contract.json`](src/data/midnight-contract.json), so it works out of the box — no wallet or Docker needed just to browse.

---

## Deploy your own contract (optional)

Only needed if you want to redeploy `contracts/TimestampLog.compact` to your own address. The full reference walkthrough lives in [`scripts/deploy-midnight.README.md`](scripts/deploy-midnight.README.md); the condensed hackathon-friendly version follows.

Commands are grouped **macOS/Linux** vs **Windows (PowerShell)** — pick your row.

### 1. Lock down the seed file

The SDK ignores world-readable seed files.

**macOS/Linux:**
```bash
chmod 600 .midnight-wallet.local
```

**Windows (PowerShell):**
```powershell
icacls .midnight-wallet.local /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
```

### 2. Confirm you have tDUST in Lace

Deploys spend **tDUST**, but the faucet only dispenses **tNIGHT**.

- Open Lace → switch to **Midnight Preview** (top of the wallet).
- If the balance line reads only tNIGHT, click **Generate tDUST** and wait ~1 min for the tDUST balance to appear.

### 3. Start Docker Desktop

**macOS/Linux:** launch Docker Desktop and wait for the whale icon in the menu bar to say "Docker Desktop is running".

**Windows:**
- Install Docker Desktop with the **WSL 2 backend** (recommended). If Windows prompts you to install/update the WSL 2 kernel on first launch, accept.
- Launch Docker Desktop from the Start menu; wait for the tray icon (bottom-right) to say "Docker Desktop is running".

### 4. Start the proof server

Once per machine — the container persists across restarts.

**macOS/Linux:**
```bash
docker start midnight-proof-server 2>/dev/null || \
  docker run -d --name midnight-proof-server -p 6300:6300 \
    midnightntwrk/proof-server:latest midnight-proof-server -v
curl http://localhost:6300/health
```

**Windows (PowerShell or Windows Terminal — not cmd.exe):**
```powershell
docker start midnight-proof-server
if ($LASTEXITCODE -ne 0) {
  docker run -d --name midnight-proof-server -p 6300:6300 `
    midnightntwrk/proof-server:latest midnight-proof-server -v
}
curl.exe http://localhost:6300/health
```

> Use `curl.exe` explicitly on Windows — PowerShell's built-in `curl` is an alias for `Invoke-WebRequest` and returns a different shape.

Expect `{"status":"ok",...}`.

### 5. Deploy

```bash
bun scripts/deploy-midnight.mjs
```

First proof after container boot takes 30–120s; subsequent proofs are seconds. On success the script writes the new address + tx hash into `src/data/midnight-contract.json` and prints the explorer URL.

---

## Proof server cheatsheet

| Task | Command |
|---|---|
| Check it's running | `docker ps` |
| Health check | `curl http://localhost:6300/health` (Windows: `curl.exe …`) |
| Tail logs | `docker logs -f midnight-proof-server` |
| Stop | `docker stop midnight-proof-server` |
| Resume | `docker start midnight-proof-server` |

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `tDUST balance: 0` | Skipped "Generate tDUST" in Lace | Step 2 |
| `ECONNREFUSED 127.0.0.1:6300` | Proof server not running | Step 4 |
| `Cannot connect to the Docker daemon` (macOS/Linux) | Docker Desktop app closed | Launch Docker Desktop, retry |
| `error during connect: ... docker_engine: The system cannot find the file specified` (Windows) | Docker Desktop not started or WSL 2 backend not ready | Open Docker Desktop, wait for green status, retry |
| `insufficient funds` mid-deploy | Lace hasn't finished converting tNIGHT → tDUST | Wait 60s, retry |
| Proving hangs > 3 min | First cold proof after boot | Watch `docker logs -f midnight-proof-server` — normal for the first run |

## Repo layout

```
contracts/                        Compact source + compiled ZK artifacts
  TimestampLog.compact            The on-chain contract
  managed/timestamp-log/          Compiled contract + keys + zkir (generated)
scripts/
  deploy-midnight.mjs             Local deploy script (Bun + Docker proof server)
  deploy-midnight.README.md       Full deploy reference
src/
  routes/                         TanStack Start file-based routes
  data/midnight-contract.json     Address + tx hash of the currently deployed contract
```

## Credits

Built with [Lovable](https://lovable.dev) for the Midnight hackathon. Contract runtime by [Midnight Network](https://midnight.network); wallet by [Lace](https://www.lace.io).
