## Plan: Add `README.md` at repo root for hackathon participants

Currently the repo has `.lovable/plan.md` (my working notes for you) and `scripts/deploy-midnight.README.md` (deep reference), but no top-level `README.md`. Anyone cloning from GitHub lands on a blank repo page. Fix that with a single `README.md` at the repo root focused on: what this project is, how to run it locally, and — the reason you're asking — how to stand up the Midnight proof server in Docker on macOS/Linux/Windows.

### New file: `README.md` (repo root)

Sections, in order:

1. **What this is** — one paragraph. MidnightPrompts: a TanStack Start site showcasing a deployed Compact contract (`TimestampLog`) on Midnight Preview. Links to the live site (`https://midnightprompts.lovable.app`) and to Midnight docs.

2. **Tech stack (one-liner)** — TanStack Start v1 + Vite 7 + Tailwind v4 + Bun; Midnight SDK 4.x; Compact 0.23.

3. **Prerequisites**
   - Bun ≥ 1.1 (macOS/Linux: `curl -fsSL https://bun.sh/install | bash`; Windows PowerShell: `powershell -c "irm bun.sh/install.ps1 | iex"`)
   - Docker Desktop (for the proof server)
   - Lace wallet browser extension, switched to **Midnight Preview**

4. **Run the site locally**
   ```
   bun install
   bun run dev
   ```
   Opens `http://localhost:8080`.

5. **Deploy the contract yourself (optional)** — brief pointer that this is only needed if you want your own on-chain deployment; the site already reads from `src/data/midnight-contract.json`. Full walkthrough lives in [`scripts/deploy-midnight.README.md`](scripts/deploy-midnight.README.md). Then inline the **condensed 5-step flow from `.lovable/plan.md`** so hackathon folks don't need to open a second doc:
   - Step 1: seed file permissions (macOS/Linux `chmod 600` **and** Windows `icacls` variant)
   - Step 2: confirm tDUST in Lace (tNIGHT → Generate tDUST)
   - Step 3: start Docker Desktop (macOS/Linux notes **and** Windows/WSL 2 notes)
   - Step 4: start the proof server — both shells side by side:
     - macOS/Linux (`docker start … || docker run …` + `curl`)
     - Windows PowerShell (`docker start` + `$LASTEXITCODE` fallback + `curl.exe`)
   - Step 5: `bun scripts/deploy-midnight.mjs`

6. **Proof server lifecycle cheatsheet** — small table:
   | Task | Command |
   |---|---|
   | Check it's running | `docker ps` |
   | Health check | `curl http://localhost:6300/health` (Windows: `curl.exe`) |
   | Tail logs | `docker logs -f midnight-proof-server` |
   | Stop | `docker stop midnight-proof-server` |
   | Resume | `docker start midnight-proof-server` |

7. **Troubleshooting** — same failure table already in `.lovable/plan.md`, including the Windows-specific `error during connect: ... docker_engine: The system cannot find the file specified` row.

8. **Repo layout** — 6-line tree pointing to `contracts/`, `scripts/deploy-midnight.mjs`, `src/routes/`, `src/data/midnight-contract.json`.

9. **License / credits** — one line noting it's a Lovable-generated project for a Midnight hackathon; links to Midnight docs and Lace.

### What I will NOT do

- Not editing `.lovable/plan.md` or `scripts/deploy-midnight.README.md` — they stay as-is; the new README cross-links to the script README for the deep dive.
- No changes to code, contracts, or config.
- No GitHub API calls or repo settings changes — the README is a plain file in the repo; GitHub renders it automatically once you push (or once Lovable's Git sync propagates the commit).

### After I write the file

You'll see `README.md` at the repo root. On the next Git sync it appears on the GitHub repo page automatically as the landing README.
