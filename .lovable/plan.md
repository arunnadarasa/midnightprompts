## Dedicated Mobile Dev page for Kuira SDK

Create `/mobile` — a new route framing the kuira-sdk-android opportunity for hackathon participants.

### New route

`src/routes/mobile.tsx` with own `head()` metadata (title, description, og:title, og:description).

### Page structure

1. **Hero** — "Ship a Midnight dApp as a native Android app." Eyebrow: "Mobile · Kuira SDK". CTA buttons to the GitHub repo and to `/undeployed` (local dev loop).

2. **What's the opportunity?** — 3–4 short bullets:
   - No Lace dependency — end users install a normal Android app, no browser extension.
   - Passkey-derived identity — biometric unlock instead of seed phrases; lowers UX friction dramatically.
   - Embedded wallet + contract runtime — one Gradle dependency ships signing, proving hooks, and Compact contract calls.
   - Opens Midnight to ~3B Android users and to hackathon categories the desktop-only demos can't reach (field/offline, wearables, POS, tap-to-pay).

3. **Hackathon angles** — card grid of build ideas that only make sense on mobile:
   - Tap-to-anchor: NFC/QR + on-device ZK proof → Compact ledger commit.
   - Offline-first choreography/receipts that batch-submit when online.
   - Passkey-gated agent wallets for A2A/AP2/UCP/x402 payments from a phone.
   - Mobile-first crowdfunding (ChoreoCrowd-style) with in-app tDUST funding.

4. **How it fits the existing stack** — short table mapping desktop pieces to mobile equivalents:
   - Lace extension → Kuira embedded wallet
   - Browser proof-server calls → on-device or Fly.io HTTPS proof server (link to `/undeployed#fly`)
   - `VITE_DEFAULT_CONTRACT` → same deploy script; Android reads the address from a config endpoint
   - Undeployed local devnet → same Docker stack; phone points at LAN IP or Fly URL

5. **Getting started** — three numbered steps:
   1. Deploy a contract with the existing `scripts/deploy-midnight.mjs` (link).
   2. Add the Gradle dependency from the Kuira README (external link).
   3. Point the SDK at the same indexer/proof URLs the web demos use.

6. **References** — GitHub repo, Discord dev-chat callout (Jay Albert's recommendation), and a link back to `/showcase` noting there's no mobile demo yet and the first hackathon build gets featured.

### Navigation

Update `src/components/site-shell.tsx`:
- Desktop: move the existing external "Mobile SDK ↗" link into the "Build ▾" dropdown as an internal `/mobile` link (keep the external repo link inside that page).
- Mobile burger: replace the external "Mobile SDK ↗" entry with an internal "Mobile Dev" entry in the "Build & Setup" section, still near the current position.

### Homepage nudge

In `src/routes/index.tsx`, add one small card/line in the existing bento or Fireside area pointing to `/mobile` so the opportunity is discoverable from the landing page. No layout overhaul.

### Out of scope (intentionally)

- No mega-prompt variant, no new ideas JSON, no showcase card yet — those can follow once a mobile reference build exists.
- No changes to `mega-prompt-variants.ts` or theme filter chips.
- No SDK integration in this repo — this is a marketing/orientation page.
