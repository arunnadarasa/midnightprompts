## Goal

Let hackathon participants know that Lace ships as a **mobile wallet** (like MetaMask / Phantom) but currently only for **Cardano** — Midnight support on mobile is not out yet, so Midnight dApps still need the Lace **browser extension** on desktop.

## Changes

1. **`src/routes/showcase.midnight-ledger.tsx`** — add a small callout block right above the existing "fund this address" grid (preprod / preview cards). Content:
   - Heading: "Wallet · Lace"
   - One line: Lace is available as a mobile wallet today, but only for Cardano. Midnight support on mobile is not shipped yet, so use the Lace **desktop browser extension** for these demos.
   - Three links:
     - `https://www.lace.io/` — Get Lace
     - `https://docs.midnight.network/blog/connect-dapp-lace-wallet` — Connect a dApp with Lace
     - `https://docs.midnight.network/relnotes/overview` — Midnight release notes
   - Styling: matches existing bordered card look (`border border-primary/30 bg-card`, `eyebrow` label, small text, `text-primary underline` links).

2. **`src/routes/strategy.tsx`** — add the same callout as a standalone section in a location that fits the page's existing rhythm (near any existing wallet / tooling references, or appended as a new section if none exists). Same three links, same wording, same visual treatment as the showcase card so the two pages stay consistent.

## Out of scope

- No changes to wallet derivation scripts, JSON data files, or contract logic.
- No new dependencies, no image/asset generation.
- No copy changes to the existing preprod / preview funding cards.

## Verification

After switching to build mode I'll open both routes in the preview and confirm the callout renders, links open in a new tab, and layout still looks right on mobile widths.