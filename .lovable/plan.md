## Add a live Lace connect widget to the Midnight Ledger demo page

Wire the docs' React wallet-connect flow into `/showcase/midnight-ledger` (the demo page you're viewing). `/wallet` stays a screenshot walkthrough; `/proof-server` stays script-focused. The demo is where a live "Connect wallet → see your preprod address" widget actually belongs.

## What we'll build

### 1. New client-only hook: `src/lib/use-midnight-wallet.ts`

Per the `lovable-midnight` skill + the docs guide:
- Polls `window.midnight` for up to 5s; picks the connector whose `apiVersion` satisfies `4.x`.
- Exposes `connect()` / `disconnect()` and reactive state:
  `status` (`idle | detecting | ready | connecting | connected | error`),
  `address` (shielded), `coinPublicKey`, `apiVersion`, `network`
  (from `connectedAPI.state()` / `getConfiguration()`), `error`.
- Every `@midnight-ntwrk/*` import is dynamic, inside the hook, behind
  `useHydrated()` — zero SSR touch.

### 2. New component: `src/components/WalletConnectPanel.tsx`

Small panel matching the demo page tokens:
- **Not detected** → lace.io link + "Refresh after install".
- **Ready** → "Connect wallet" button.
- **Connected** → truncated shielded address (with copy), connector API version, connected network; **yellow "Switch Lace to Preprod"** note when the connector network ≠ `preprod`.
- **Error** → inline message + Retry.

Rendered behind `useHydrated()`; SSR emits a stable skeleton.

### 3. Wire it into `/showcase/midnight-ledger`

Insert the panel near the top of the demo, above the existing content, framed as "Try it — connect your Lace wallet to this preprod demo." Nothing else on the page changes.

### 4. Package

`bun add @midnight-ntwrk/dapp-connector-api`. All uses dynamic-imported inside the hook.

## Non-goals

- No signing, no contract calls from the browser — writes stay in the local Node scripts.
- No wallet-state subscription beyond the initial connect handshake.
- No changes to `/wallet` or `/proof-server`.

## Failure-mode coverage (built in)

- **SSR**: hook + panel `useHydrated()`-gated; no top-level `window` access.
- **Lace not 4.x**: explicit "Install/update Lace" state.
- **Wrong network** (Preview while demo is preprod): yellow warning, no auto-switch.
- **Detect timeout**: 5s poll then "Not detected" with retry.

## Immediate next step after approval

Install `@midnight-ntwrk/dapp-connector-api` → write the hook + panel → wire into `/showcase/midnight-ledger`.
