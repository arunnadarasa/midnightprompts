## Goal

Turn the existing Windows-only setup guide into a full cross-platform Docker + Git install guide (macOS, Windows, Linux), keeping the Windows-specific blockers you hit and adding the OpenClaw-style install steps for the other two OSes.

## Changes

### 1. Rename + refactor `src/components/WindowsSetupGuide.tsx` → `src/components/DockerSetupGuide.tsx`

- Add an OS tab switcher (macOS / Windows / Linux), auto-selecting the detected platform via `navigator.userAgent`.
- Keep the collapsible card shell and existing `autoOpen` prop behavior.
- Sections per OS:

  **macOS tab**
  - Install Docker Desktop (Apple Silicon vs Intel), verify with `docker --version` / `docker info`.
  - Install Git: git-scm download or `brew install git`, verify with `git --version`.

  **Windows tab** (keeps everything already there, adds the missing pre-steps from the OpenClaw doc)
  - Step 0: check version with `winver` (need Win10 build 19041+ or Win11).
  - Step 1: `wsl --install` from PowerShell as Administrator (elevation warning), restart.
  - Step 2: Docker Desktop install, enable WSL 2 when prompted, verify.
  - Existing blockers preserved: BIOS virtualization (HP + generic), `wsl --update` fix, Node.js LTS + PowerShell `Set-ExecutionPolicy RemoteSigned`.
  - Install Git for Windows, verify.

  **Linux tab**
  - Docker Engine install link, `docker-compose-plugin`, `sudo usermod -aG docker $USER` + relog, verify `docker compose version`.
  - Note: no Docker Desktop needed.
  - Install Git via distro package manager, verify.

- Skip the OpenClaw-specific "NHS personal laptop" callout and any OpenClaw-app steps — this guide stays scoped to Docker + Git prerequisites for the Midnight proof server / undeployed stack.

### 2. Update all consumers of the old component

Replace `WindowsSetupGuide` imports/usages with `DockerSetupGuide` in:
- `src/routes/proof-server.tsx` (keep `autoOpen` on Windows detection; also auto-open on any non-detected OS)
- `src/routes/undeployed.tsx`
- `src/routes/undeployed-preflight.tsx`
- `src/routes/showcase.choreo-ledger-local.tsx`
- `src/routes/known-issues.tsx` (rename the "Windows setup blockers" heading to "Docker + Git setup (Windows / macOS / Linux)"; keep the anchor link working via an `id`)

### 3. Mega-prompt builder (`src/lib/mega-prompt-variants.ts`)

- Rename the "Windows setup" block to "Docker + Git prerequisites" and include a 3-line summary per OS plus the Windows blockers (BIOS virt, `wsl --update`, PowerShell execution policy).
- Applies to all three variants (Preview / Preprod / Undeployed), since Docker is needed for the proof server on every network.

### 4. Leave unchanged

- The `WalletConnectPanel`, contract demos, ideas dataset generation, and skills wiring — this is a docs-only change.

## Verification

- `tsgo` typecheck on renamed component + updated route imports.
- Visit `/proof-server`, `/undeployed`, `/undeployed-preflight`, `/showcase/choreo-ledger-local`, `/known-issues` in the preview; confirm tabs render, default to the correct OS, and the Windows tab still contains the BIOS / WSL / Node / PowerShell blockers.
- Regenerate one mega-prompt and confirm the new prerequisites block appears in each network variant.
