## Plan: Add Windows guide to `.lovable/plan.md`

Hold off on the Preview → Preprod switch until tonight's Windows Lace test.

### Update `.lovable/plan.md`

Keep the current macOS-oriented steps but reorganize so both platforms are covered:

1. **Step 1 (seed file permissions)** — split into:
   - **macOS/Linux:** `chmod 600 .midnight-wallet.local`
   - **Windows (PowerShell):**
     ```powershell
     icacls .midnight-wallet.local /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
     ```
     (removes inherited perms, grants only current user read/write — SDK's equivalent of 0600)

2. **Step 3 (Docker Desktop)** — add Windows notes:
   - Install Docker Desktop for Windows (WSL 2 backend recommended; enable WSL 2 in Windows Features if prompted).
   - Launch Docker Desktop from Start menu; wait for the whale tray icon to say "Docker Desktop is running".
   - First launch may prompt to install/update the WSL 2 kernel — accept.

3. **Step 4 (proof server)** — commands are identical on Windows, but:
   - Run in **PowerShell** or **Windows Terminal**, not cmd.exe (the `||` fallback pattern needs PowerShell 7+ or use two separate commands in older shells).
   - Windows-safe alternative:
     ```powershell
     docker start midnight-proof-server
     if ($LASTEXITCODE -ne 0) {
       docker run -d --name midnight-proof-server -p 6300:6300 `
         midnightntwrk/proof-server:latest midnight-proof-server -v
     }
     curl.exe http://localhost:6300/health
     ```
   - Use `curl.exe` explicitly on Windows — the built-in `curl` alias points to `Invoke-WebRequest` and returns a different shape.

4. **Step 5 (deploy)** — same `bun scripts/deploy-midnight.mjs` on both. Note: install bun on Windows via `powershell -c "irm bun.sh/install.ps1 | iex"`.

5. **Failure table** — add one Windows-specific row:
   | `error during connect: ... docker_engine: The system cannot find the file specified` | Docker Desktop not started or WSL 2 backend not ready | Open Docker Desktop, wait for green status, retry |

No other files change. Preview → Preprod switch stays parked pending tonight's Windows Lace test.
