## Goal
Embed the uploaded Android emulator screenshot on `/mobile` to show what a working Midnight mobile dApp looks like.

## Steps
1. Register the uploaded image as a Lovable asset:
   - `lovable-assets create --file /mnt/user-uploads/Screenshot_2026-07-26_at_00.09.34.png --filename mobilemidnight-emulator.png > src/assets/mobilemidnight-emulator.png.asset.json`
2. In `src/routes/mobile.tsx`, inside the existing **Verified reference build** section (mobilemidnight — Tokenized Choreo Kits), add a two-column layout: keep the current prose on the left, add the screenshot on the right (stacked on mobile).
   - Import the asset JSON, render an `<img>` with `alt="mobilemidnight Android emulator — Tokenized Choreo Kits demo running on Midnight Undeployed"`.
   - Constrain width (`max-w-xs` / phone-frame proportions), rounded border, subtle shadow, caption underneath: "Android emulator · Kuira SDK 0.1.0-alpha05 · Midnight Undeployed · 25.8 s wall time per publish".
3. No other pages touched.

## Non-goals
- No changes to prompts, routes list, or other showcase pages.
