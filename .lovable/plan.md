# Update `/undeployed` for the new pinned-versions story + fix mobile UX

The Undeployed page still ships the old `api/v4/graphql` indexer path and doesn't mention the genesis seed `…0002`, pinned Docker tags, or the tNIGHT/tDUST rule the rest of the site now teaches. The mobile screenshot also shows every `<pre>` overflowing horizontally (URLs and `VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs` slide off-screen).

## Content updates (`src/routes/undeployed.tsx`)

1. **Indexer path** — swap all `api/v4/graphql` on this page to `api/v1/graphql` (standalone indexer). Update both the `ENV_SNIPPET` block and the "local endpoints" card.
2. **Pinned versions callout** — under the "one command" box, add a small `PINNED VERSIONS` note listing `proof-server:8.0.3 · midnight-node:0.22.5 · indexer-standalone:4.0.2` with a one-liner explaining why (avoids ZKIR mismatch + `latest` tag 404s).
3. **Step 4 (Lace)** — clarify that Lace labels the network "Preview" even when RPC is `ws://localhost:9944`, and that the address prefix `mn_addr_undeployed1…` is the truth. Note "no tNIGHT→tDUST dance here — that trap is Preview/Preprod only".
4. **Step 5 (deploy)** — mention the deploy script uses genesis seed `0x000…0002` directly, so nothing needs to be in Lace for a headless deploy. Link to the download button for `lovable-midnight` SKILL on `/llms#skills`.
5. **New Step 6** — "Wire the wallet UI (optional)" — one-line pointer to `/wallet` for the Connect-Lace boilerplate.

## Mobile UX fixes

Applies to every `<pre>` and endpoint card on the page:

- Replace `overflow-x-auto` on `<pre>` with `whitespace-pre-wrap break-all` (matches the pattern the Lovable-secrets card already uses). Long commands wrap instead of scrolling under the viewport edge.
- Tighten `<pre>` padding on `<sm` (`p-2 sm:p-3`) and drop font size to `text-[10px] sm:text-[11px]` so wrapped commands don't dominate.
- Give the "one command" and "Lovable secrets / local endpoints" cards `overflow-hidden` + `min-w-0` on the flex parents so the `<pre>` inside can actually shrink.
- Bottom CTA row: on mobile, stack the four buttons full-width (`w-full sm:w-auto` + `justify-center`) — right now they wrap awkwardly at ~380px.
- Step numbers: shrink from `w-8 h-8` to `w-7 h-7 sm:w-8 sm:h-8` and tighten `gap-4` to `gap-3 sm:gap-4` so the body has more room on narrow screens.
- Wrap the two-card grid at `sm:grid-cols-2` (already correct) but add `gap-3` and ensure each card uses `min-w-0`.

## Out of scope

- The `/undeployed-preflight` page (separate route; unchanged).
- The `DockerSetupGuide` component (already responsive).
- Regenerating LLM bundles — this is a UI/content change on one route.
