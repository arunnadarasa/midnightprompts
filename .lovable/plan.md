## Plan: Add Windows Docker instructions to the Proof Server page

The Proof Server page (`/proof-server`) currently shows Docker and deploy steps that assume macOS/Linux (`chmod 600`, `curl`, etc.). Add Windows equivalents inline so hackathon participants on Windows can follow the same step cards without leaving the site.

### What to change

Edit `src/routes/proof-server.tsx` only.

1. **Introduce a minimal platform toggle**  
   Add a small segmented control (macOS / Linux / Windows) near the top of the steps section, using a local `useState`. Keep it lightweight — two buttons styled with existing `border`, `text-[10px]`, `tracking-[0.28em]` uppercase conventions, active state uses `bg-primary text-primary-foreground`.

2. **Branch Step 02 — Boot the proof server**  
   - Keep the same `docker run` command (cross-platform).  
   - Add a conditional note under the code block:  
     - **macOS/Linux**: health check with `curl http://localhost:6300/health`  
     - **Windows**: mention Docker Desktop + WSL 2 backend, health check with `curl.exe http://localhost:6300/health`  
   - Keep the verified box and lifecycle commands as-is; they are already cross-platform.

3. **Branch Step 04 — Deploy TimestampLog.compact**  
   - **macOS/Linux**: keep existing `chmod 600 .midnight-wallet.local`  
   - **Windows**: show PowerShell `icacls .midnight-wallet.local /inheritance:r /grant:r "$env:USERNAME:(R,W)"` as the equivalent permission lock  
   - The rest of the deploy script (`bun install`, `bun scripts/deploy-midnight.mjs`) is identical.

4. **Windows-specific failure tip**  
   Add a single compact troubleshooting line in Step 02: if Docker Desktop on Windows errors with `"The system cannot find the file specified"`, ensure Docker Desktop is running and WSL 2 backend is enabled. Style it as an existing `text-xs text-muted-foreground` note.

### What stays the same

- Steps 01, 03, and 05 have no OS-specific commands; no changes needed.
- Deploy status panel, "Why not in the browser?" grid, and footer CTA buttons remain untouched.
- No new dependencies, no new components, no route changes.

### After the change

The `/proof-server` page will present the same five step cards, but Steps 02 and 04 will dynamically show the correct shell commands and notes for whichever platform the user selects. Default selection can be macOS/Linux (the current audience majority) or no default (user must pick).