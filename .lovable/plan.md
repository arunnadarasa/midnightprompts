## Update Lovable Midnight skill + Mobile Dev page with mobilemidnight learnings

Source material: `arunnadarasa/mobilemidnight` (Tokenized Choreo Kits Android build) + attached Cursor session notes. First verified end-to-end Kuira dApp on Undeployed — real passkey forge, `mn airdrop` funding, on-device ZK proving, 2 kits published.

### 1. Lovable Midnight skill — new "Mobile / Kuira Android" section

Append to both `.agents/skills/lovable-midnight/SKILL.md` and `public/skills/lovable-midnight/SKILL.md` (kept identical). New H2 section placed after the current Fly.io block, before "Anti-patterns".

Content:

- **When to reach for Kuira** vs the web/Lace path: mobile-first hackathon lanes, passkey biometric identity, no browser extension. Not a drop-in replacement — different toolchain (Gradle/Kotlin/AVD), different funding path.
- **Verified stack** (from mobilemidnight): Kuira SDK `0.1.0-alpha05`, Compact `0.31.1`, `mn localnet` (CLI), on-device proving. Not the Docker `midnight-node:0.22.5` stack — Kuira targets `mn localnet` directly.
- **Non-negotiables** (hard rules, mirror the tone of the existing skill):
  - Passkey `rpId` MUST be a real hosted domain with a live `assetlinks.json` matching the package name + debug SHA-256. `REPLACE_ME` / `.example` fails forge with `CreateCredentialNoCreateOptionException`.
  - After any `rpId` / assetlinks change: **uninstall then reinstall** — `adb install -r` leaves Credential Manager in stale state.
  - Emulator needs a **signed-in Google account** AND a screen lock before passkey create will offer any options. DAL correctness alone is insufficient.
  - Force soft keyboard on emulator: `adb shell settings put secure show_ime_with_hard_keyboard 1` + Gboard. Hardware keyboard silently fails on Compose + WebView fields.
  - NIGHT on Undeployed = `mn airdrop 10000 --wallet <addr> --network undeployed`. There is no in-app faucet. Then **Register dust in-app** (not `mn dust register` for the Kuira flow).
  - Copy addresses from device UI/uiautomator, never OCR/screenshots — `l`↔`1` in bech32 kills the checksum (`Invalid checksum… expected "2xmr28"`).
  - Kuira wallet UI uses `FLAG_SECURE` → `screencap` returns black frames. Use `uiautomator dump` for automation.
- **Form-enablement pattern** (real app bug we hit): Publish/Deploy buttons must derive `enabled` from the same state the TextFields write to. Local `rememberSaveable` form state with write-through to ViewModel via `LaunchedEffect`; don't gate UI on a fire-and-forget VM helper that only reads `.value`.
- **Verified happy path** (bash snippet): `mn localnet up` → `./gradlew :app:installDebug` → forge → receive address → `mn airdrop` → register dust → deploy catalog → publish kit (30–120s cold prove).
- **Failure modes table** (new rows, same style as the Fly table):
  - `CreateCredentialNoCreateOptionException` → no signed-in Google account / no screen lock
  - `packageMatchesRpAssetlinks: false` → DAL not hosted or SHA mismatch or `.example` rpId
  - Passkey create silently canceled after "correct" DAL fix → forgot to uninstall/reinstall
  - `Invalid checksum expected "…"` on `mn airdrop` → address retyped from screenshot; use device copy
  - Screencap comes back black → `FLAG_SECURE`; switch to `uiautomator dump /dev/tty`
  - `adb input text` fills field but Google/JS validation still says empty → use on-screen Gboard
  - Publish button stays disabled with all fields visibly filled → enablement reads different state than TextField
- **Anti-patterns** (append bullets):
  - Don't automate Google account recovery / security codes through chat — codes expire in ~60s, "Code 1/Code 2" prompts are number-match, not the 10-digit field.
  - Don't try to substitute Docker `midnight-node:0.22.5` for `mn localnet` under Kuira — the SDK expects the `mn` toolchain.
  - Don't leave `emulator-*.png`, debug ingest scripts, or `.cursor/debug-*.log` in the tree.
- **Cross-references**: link back to the existing `midnight-environment-setup` skill for the `mn` CLI install; note that the four-app Fly.io topology from the Fly section is still valid as the proof/indexer backend if you'd rather host than run `mn localnet` on a laptop.

### 2. `src/routes/mobile.tsx` — expand with verified-build content

Additive changes only; keep the current Hero, Opportunity, Angles, Stack Mapping, Getting Started, References sections. Insertions and one edit:

- **Above "Hackathon angles", add a new "Verified reference build" section**: card block for `mobilemidnight` / Tokenized Choreo Kits, with:
  - Live repo link: `https://github.com/arunnadarasa/mobilemidnight`
  - Pinned stack line: Kuira SDK `0.1.0-alpha05`, Compact `0.31.1`, Undeployed via `mn localnet`, on-device proving.
  - "What was shipped" bullets: passkey Sigil forge, 10,000 NIGHT airdrop, dust registered, catalog deployed, 2 kits published (~25s warm prove).
  - "Learnings extracted into the Lovable Midnight skill" callout with link to `/llms` (skill download card).
- **Update "Getting started"** — reword step 1 to mention `mn localnet up` (not Docker) as the Kuira-native local devnet, and step 3 to add the `mn airdrop … --network undeployed` + in-app Register dust funding path. Keep the existing indexer/proof-URL guidance for teams choosing to point at Fly.io instead.
- **New "Passkey setup checklist" subsection** (short, 5 bullets) under Getting started: real domain rpId, hosted `assetlinks.json` with package + debug SHA-256, signed-in Google account on the AVD, screen lock set, soft keyboard forced on. One line: "Skipping any of these turns into a multi-hour Credential Manager rabbit hole — see the skill's Mobile section for the full failure-mode table."
- **Add one row to the Stack Mapping table**: `mn airdrop --network undeployed` → same CLI as web demos; the mobile app just consumes the funded address.
- **References section**: add a card for `mobilemidnight` repo alongside the existing Kuira SDK + Docs cards; keep the "no mobile demo yet" showcase card copy but change wording to "first *hosted* mobile demo yet — mobilemidnight is the reference build".

### 3. Out of scope

- No new mega-prompt variant for Android (would need Gradle/Kotlin scaffolding — different generator).
- No changes to `showcase.index.tsx` — mobilemidnight is a repo-only reference, no hosted preview URL.
- No changes to `site-shell.tsx` navigation.
- No changes to ideas JSON or theme filters.

### Files touched

- `.agents/skills/lovable-midnight/SKILL.md` — append Mobile/Kuira section
- `public/skills/lovable-midnight/SKILL.md` — same content, keep in sync
- `src/routes/mobile.tsx` — insertions + Getting-started edits described above
