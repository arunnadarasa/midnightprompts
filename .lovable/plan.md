## Goal

Add an **OS selector** (macOS / Windows / Linux) on the idea prompt page, alongside the existing Network variant tabs. Picking an OS swaps the Docker + prerequisites block inside the generated mega-prompt so participants only see the setup commands relevant to their machine.

## UI changes — `src/routes/ideas.$id.tsx`

- Add `const [os, setOs] = useState<OS>("macos")` next to the existing `variant` state. Auto-detect from `navigator.userAgent` in a `useEffect` (same helper used by `DockerSetupGuide`).
- Extend `buildVariant` call: `buildVariant(idea, theme, variant, os)`.
- Add a second row of 3 pill-tabs (macOS / Windows / Linux) directly under the Network tabs, same visual treatment. Label: "Your machine".
- Keep the existing "Copy · <variant>" button; label becomes `Copy · <variant> · <os>` so users can tell copied prompts apart.

## Prompt content changes — `src/lib/mega-prompt-variants.ts`

Add:

```ts
export type OSTarget = "macos" | "windows" | "linux";
```

Replace the current mixed-OS Docker prose with per-OS blocks:

- **`TOOLCHAIN_BY_OS[os]`** — replaces the current `TOOLCHAIN` constant. Same Compact installer + proof-server `docker run` command in all three, but:
  - macOS: `brew install --cask docker` hint + Apple Silicon note.
  - Windows: `wsl --install`, `wsl --update`, BIOS virtualization callout, PowerShell execution-policy fix, and pointer to `/proof-server#docker-setup`. Recommend running commands inside the WSL2 Ubuntu shell.
  - Linux: `sudo apt install docker.io docker-compose-plugin` + `usermod -aG docker`.

- **`LOCAL_STACK_SETUP_BY_OS[os]`** — replaces the current multi-OS `LOCAL_STACK_SETUP`. Only the "Docker prerequisites" section changes per OS; the "One-command bring-up", Lace RPC, and deploy sections stay shared and are appended after the OS-specific block.

- **`inAppSetupPanel(network, os)`** — pass `os` through so the numbered steps reference the right install command (Docker Desktop vs Docker Engine) in step 1.

`buildVariant(idea, theme, network, os = "macos")` selects the right per-OS strings and interpolates them into the template. Default arg keeps existing callers compiling.

## Keep unchanged

- The existing prebuilt JSON dump (if any) still uses the default `macos` — no data regeneration required. Idea data / hooks / contract bodies are OS-agnostic and untouched.
- `scripts/rewrite_mega_prompts.py` — not on the runtime path any more; leave as-is or update in a follow-up. The runtime `buildVariant` is what the idea page renders.
- Network variant tabs, faucet / secrets copy, and all showcase pages.

## Verification

- Typecheck the two edited files.
- In the preview open one idea page: switch across all 3×3 combinations (network × OS) and confirm:
  - The Docker install block visibly changes per OS.
  - The Copy button label reflects the current selection.
  - The Undeployed local-stack block adapts its "Docker prerequisites" section per OS.
- Confirm no runtime error when `os` defaults on other callers of `buildVariant` (grep for callers).
