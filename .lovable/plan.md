## Goal

Add a 5th mega-prompt variant **Undeployed (Mobile)** targeting native Android via the Kuira SDK, marked Experimental, credited to kuiralabs. Adds ~3,000 prompts (1,000 ideas × 3 OS tabs — though Android is the only real target, we'll keep the OS tab to match the existing UI and note that "Your Machine" refers to the *dev host*, not the runtime).

## Scope

Presentation + prompt-builder only. No contract or backend changes.

### 1. `src/data/ideas.ts`
- Extend `NetworkVariant` union with `"undeployed-mobile"`.

### 2. `src/lib/mega-prompt-variants.ts`
- Add `undeployed-mobile` entry to the network variants map:
  - Label: **Undeployed (Mobile)**
  - Sublabel/badge: **Experimental · Android only**
  - Description mentions Lovable does not build native Android apps, so this prompt is a starting scaffold for Cursor/Android Studio, expect breakage.
  - Body composed of: existing Undeployed local infra lessons + a new `MOBILE_KURA_BLOCK` covering:
    - Kuira SDK `0.1.0-alpha05`, Compact `0.31.1`, `mn localnet` CLI (not Docker), `mn airdrop` for NIGHT, in-app dust registration.
    - Passkey / `rpId` non-negotiables, `assetlinks.json`, full reinstall after rpId change, emulator needs Google account + screen lock.
    - `adb shell settings put secure show_ime_with_hard_keyboard 1`, `uiautomator dump` (screencap blocked by FLAG_SECURE).
    - `rememberSaveable` + `LaunchedEffect` write-through form-enablement pattern.
    - Reference repo: `github.com/arunnadarasa/mobilemidnight`.
    - Credit + link: `https://kuiralabs.github.io/kuira-sdk-android/`.
  - Experimental disclaimer banner text (reused by UI).

### 3. `src/routes/ideas.$id.tsx`
- Add the 5th tab **Undeployed (Mobile)** with an "Experimental" pill.
- Above the copy button (when this tab is active), render an amber warning banner:
  - "Experimental · Android only. Lovable doesn't generate native Android apps — use this prompt as a starting scaffold in Cursor / Android Studio with the Kuira SDK. Expect breakage."
  - Credit line linking to `https://kuiralabs.github.io/kuira-sdk-android/`.
- Keep the existing OS (macOS/Windows/Linux) toggle — clarify it means "dev host for `mn localnet` + Android Studio".

### 4. `src/routes/mobile.tsx`
- Add a small callout linking to the new **Undeployed (Mobile)** prompt tab so mobile-dev visitors discover the 1,000 prompts.

### 5. Skill sync (docs only)
- No skill edit needed; mobile/Kuira lessons already landed in a prior turn. This plan only reuses them inside the new prompt block.

## Non-goals

- No changes to Preview / Preprod / Undeployed / Undeployed (Fly.io) tabs.
- Mainnet stays hidden.
- No new showcase entry (mobilemidnight is already referenced on `/mobile`).

## Math

1,000 ideas × 1 new network variant = **1,000 new prompts per OS**, ×3 OS tabs = **3,000 additional prompt permutations**, consistent with the user's estimate.
