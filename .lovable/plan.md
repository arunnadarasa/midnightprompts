# Add all Undeployed targets to the LLM Docs downloads

Today the "Prompts by network × OS" section on `/llms` offers only Preview, Preproduction and Undeployed (Local). The idea pages already support two more targets — Undeployed (Fly.io) and Undeployed (Mobile · Android) — so the downloadable bundles should match.

## What changes for the user

The Network selector on `/llms` gets five options:

```text
Preview | Preproduction | Undeployed (Local) | Undeployed (Fly.io) | Undeployed (Mobile)
```

- Preview, Preproduction, Undeployed (Local), Undeployed (Fly.io): three files each, one per host OS (macOS / Windows / Linux).
- Undeployed (Mobile): a single Android file — the mobile prompt builder is host-OS independent, so the Host OS selector is hidden and replaced with a short note plus the existing amber "Experimental · Android only, credit Kuira Labs" framing used on the idea pages.
- Mainnet bundles stay generated but hidden, as today.
- Copy updates: "Nine slimmer files" becomes the correct count (13), and the section blurb mentions the mobile/Fly targets.

## Technical notes

- `scripts/build-llms-full.mjs`: add `undeployed-fly` to the network × OS loop (3 new files) and emit one `llms-prompts-undeployed-mobile.txt` outside the OS loop. Keep `NET_LABEL` in sync with `NETWORK_LABELS` in `src/lib/mega-prompt-variants.ts`. Extend the `fullDoc()` variant matrix and the `llms-full.meta.json` counts accordingly.
- Regenerate the bundles, then externalise each new `.txt` through `lovable-assets` so `public/llms-prompts-undeployed-fly-*.txt.asset.json` and `public/llms-prompts-undeployed-mobile.txt.asset.json` exist (same pattern as the current asset pointers; raw `.txt` files are not committed).
- `src/routes/llms.tsx`: import the new asset pointers, extend the `PROMPTS` map (mobile stored as an OS-less entry), widen the network `TabsList` to a responsive grid so five tabs wrap cleanly on mobile, and conditionally render the Host OS tabs.
- Mobile UX: the network tab list uses a 2-column grid on small screens and 5 columns from `sm` up, matching the wrapping fix already applied on the idea page tabs.
