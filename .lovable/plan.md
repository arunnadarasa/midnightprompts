## Add Windows setup troubleshooting for Docker / Proof Server

Document the real Windows blockers you hit so other hackathon participants can unblock themselves without needing Perplexity.

### 1. New reusable component: `src/components/WindowsSetupGuide.tsx`
A collapsible "Windows prerequisites" panel with three ordered blockers:

1. **Enable Virtualization in BIOS/UEFI** (HP: Esc / F10 → SVM Mode / AMD-V / Intel VT-x → Enabled → save & reboot). Verify via Task Manager → Performance → CPU → "Virtualization: Enabled".
2. **Update WSL** — Docker Desktop shows "WSL needs updating". Fix: PowerShell (Admin) → `wsl --update`. If it fails with `0x8024001e` / `0x80070002`, enable Windows features via `optionalfeatures`: Windows Subsystem for Linux, Virtual Machine Platform, Windows Hypervisor Platform → reboot → retry.
3. **Install Node.js LTS (x64)** from nodejs.org/download, keep "Add to PATH" checked. If `npm install` errors with "running scripts is disabled", open PowerShell as Admin and run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`, answer `Y`, reopen terminal, retry.

Includes copy buttons for each command and a note that macOS/Linux users can skip the section.

### 2. Wire into existing docs pages
Render `<WindowsSetupGuide />` at the top of the Docker/local-stack instructions on:
- `src/routes/proof-server.tsx` — above the `docker run` block
- `src/routes/undeployed.tsx` — in the quick-start checklist
- `src/routes/undeployed-preflight.tsx` — as a "Stack won't start?" card
- `src/routes/showcase.choreo-ledger-local.tsx` — under the "up" command
- `src/routes/known-issues.tsx` — new "Windows setup blockers" section linking to the guide

### 3. Include in generated mega-prompts
Update `src/lib/mega-prompt-variants.ts` so the Undeployed variant's setup instructions call out the same three Windows blockers with the exact fix commands, and link to `/proof-server#windows-setup`. Preview/Preprod variants get a shorter one-liner ("On Windows? See /proof-server#windows-setup before running Docker.") since they also use the proof server.

### Technical notes
- Pure presentation change — no backend, no data model change.
- Component is client-safe (no browser APIs at module scope).
- No prompt-JSON regeneration needed since prompts are built at render time via `buildVariant`.
