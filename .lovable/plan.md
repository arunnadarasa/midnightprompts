Plan: Add Undeployed local-network instructions to the wallet page

Current state (verified by reading `src/routes/wallet.tsx`):
- The wallet page only explains Preview and Preprod faucets.
- The “Point Lace at …” section only mentions Preview/Preprod.
- The network-switch screenshots mention that Midnight has 3 options (Undeployed, Preview, Preprod), but the page never tells a user to actually pick Undeployed when running a local DApp.
- The Midnight docs confirm that for the local Undeployed network you switch Lace to Undeployed and fund via config file or public key.

What we will build

1. Update the “Point Lace at…” heading in `src/routes/wallet.tsx` to include Undeployed.
   - New heading: *“Point Lace at Preview, Preprod, or Undeployed.”*
   - Add a short intro paragraph explaining that if the DApp is running locally on `localhost`, the matching network is **Undeployed** and the Lace RPC must be `ws://localhost:9944`.

2. Add a “Local Undeployed” callout card inside the network section.
   - Steps: switch Lace to Undeployed, add custom RPC `ws://localhost:9944`, run the local stack.
   - Link to `/undeployed` (quick-start) and `/undeployed-preflight` (health check) using the existing `Link` import.
   - Keep the same card/border styling already used for the expanded-view-mode fix.

3. Add a third “faucet” card for the local Undeployed network.
   - Headline: no public faucet needed — the local stack mints tDUST to the genesis wallet.
   - Include the two funding methods from the docs:
     - Option A: `npm start` interactive menu → fund from a config file (`accounts.json` with mnemonics).
     - Option B: fund by public key (Bech32 unshielded addresses) — `50,000 tNIGHT` per address, then register for DUST in Lace.
   - Link to the official Midnight local network guide for full details.

4. Tighten the existing network-step captions so they reference the local path.
   - Where the network steps mention the 3 Midnight options, add a sentence that for local development the right choice is **Undeployed**.

5. Verify responsive layout.
   - Use the existing `grid grid-cols-1 sm:grid-cols-2` / `sm:grid-cols-3` patterns so the new cards work on mobile and tablet.

Files changed
- `src/routes/wallet.tsx` (content only; no new dependencies or assets).

No new dependencies, no backend changes, no route changes.

Out of scope
- Updating the prompt builder (`src/lib/mega-prompt-variants.ts`) — that already has Undeployed instructions; this plan is only about the wallet page.
- Changing the wallet connection logic; the connector already tries `undeployed` as a candidate.