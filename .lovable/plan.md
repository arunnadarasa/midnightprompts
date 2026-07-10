## Goal

Add a clear, at-a-glance comparison of Midnight's three networks — **Preproduction**, **Preview**, and **Mainnet** — to the `/quantum-primer` page so hackathon participants know which one to target and why.

## Where

`src/routes/quantum-primer.tsx` — append a new section near the end of the article (after the existing primer content, before any final CTAs if present). Section heading: "Preprod vs Preview vs Mainnet".

## Content

Short intro sentence: Midnight ships three networks; addresses, faucets, and tooling differ by suffix.

Then a comparison table (rendered as a responsive grid of three cards on mobile, a real `<table>` on `sm+`) with these rows:

| | Preproduction (`preprod`) | Preview (`test`) | Mainnet (`main`) |
| --- | --- | --- | --- |
| Purpose | Stable testnet mirroring mainnet release train | Bleeding-edge testnet for upcoming SDK / protocol changes | Real network, real value |
| Address prefix | `mn_addr_preprod1…` / `mn_shield-addr_preprod1…` | `mn_addr_test1…` / `mn_shield-addr_test1…` | `mn_addr1…` / `mn_shield-addr1…` (no suffix) |
| Token | tNIGHT → tDUST (test tokens, free) | tNIGHT → tDUST (test tokens, free) | NIGHT → DUST (real, purchased) |
| Faucet | Nethermind preprod faucet | Midnight preview faucet | none |
| SDK version | Stable release matching current mainnet | Next release candidate — may break between drops | Stable release, audited |
| Use for | Demos, hackathon submissions, integration tests against release-candidate mainnet parity | Trying new SDK features before they hit preprod | Production dApps only |
| Reset policy | Occasional resets around major upgrades | Reset frequently without notice | Never |

Then a short "which one for the hackathon?" callout: **Preprod** is the default for demos in this repo — it matches mainnet behaviour, faucet is reliable, and the deploy script + wallet JSON default there. Preview is only useful if you need a not-yet-released SDK feature.

Links row (small, at the bottom of the section):
- `https://docs.midnight.network/relnotes/network` — network endpoints reference
- `https://docs.midnight.network/relnotes/overview` — release notes / current SDK versions
- `https://docs.midnight.network/guides/acquire-tokens` — faucet + tDUST delegation guide

## Styling

Reuse existing tokens on the page — `border border-primary/30 bg-card`, `eyebrow text-primary` labels, `font-display` for the heading, `text-muted-foreground` body, `font-mono text-xs` for the address-prefix cells. Table uses `border-border` dividers, small text (`text-xs sm:text-sm`), and `overflow-x-auto` on the wrapper so it scrolls cleanly on narrow screens. No new dependencies.

## Out of scope

- No nav changes, no new route.
- No edits to other pages, JSON, scripts, or contract code.
- No copy changes to the existing primer content — this is purely additive.

## Verification

Open `/quantum-primer` in the preview, confirm the new section renders after the existing content, the table is readable on mobile (scroll or stacked), and all three doc links open in a new tab.