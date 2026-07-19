Goal: reduce the friction for a hackathon participant to go from the Lovable app to a working local Midnight demo. All actual Midnight node / indexer / proof-server traffic stays on the user's machine (Docker on localhost); the Lovable app only probes and guides from the browser.

Current state:
- `bun scripts/midnight-standalone.mjs up` starts node + indexer + proof-server locally.
- `/undeployed-preflight` probes the four local endpoints from the browser.
- `/showcase/choreo-ledger-local` documents the manual steps.
- The wallet panel connects to Lace but doesn't special-case the Undeployed custom-RPC flow.

What we will build:

1. New `/undeployed` quick-start route
   - Plain-language explanation of the architecture: Lovable app runs in the browser, the Midnight stack runs locally via Docker, Lace talks to `ws://localhost:9944`.
   - Visual 3-step checklist:
     1. Docker Desktop / Docker Engine running.
     2. `bun scripts/midnight-standalone.mjs up`.
     3. Open `/undeployed-preflight` and verify four green pills.
   - Links to `/showcase/choreo-ledger-local`, `/known-issues`, and the Midnight Service Desk.

2. Enhance `/undeployed-preflight`
   - Add a "Start / restart stack" card with the copyable one-command `bun scripts/midnight-standalone.mjs up`.
   - Add a "Lace network" card: if `window.midnight` is detected, show the exact custom-RPC value (`ws://localhost:9944`) and a link to Lace settings; if not, show the install/enable extension hint.
   - Add a "Deploy contract" card that generates and copies the command:
     ```bash
     VITE_NETWORK_ID=undeployed bun scripts/deploy-midnight.mjs
     ```
   - Add a "Copy env vars for Lovable" button that copies the full `VITE_*` snippet so the user can paste it into Lovable Project Settings → Secrets.
   - Keep the existing four endpoint probes and the all-green "ready to deploy" state.

3. Network-aware wallet panel
   - Update `WalletConnectPanel` to recognize `undeployed` addresses (`mn_shield-addr_undeployed1…`).
   - When the app is set to `VITE_NETWORK_ID=undeployed`, warn if Lace is connected to a public network (`preview`/`preprod`) and point the user to `/undeployed-preflight`.
   - Show the detected Lace network name and the expected local RPC.

4. Showcase network selector
   - Add a small network selector on `/showcase` and `/showcase/choreo-ledger-local` (Preview / Preprod / Undeployed).
   - When Undeployed is selected, surface the one-command bring-up, the preflight link, and the local deploy command instead of faucet/explorer instructions.

5. Navigation and cross-links
   - Add an "Undeployed" link to the desktop nav and mobile burger menu between "Preflight" and the external links.
   - Update the homepage service-desk card to also mention the local devnet path.
   - Update the 1000-prompts generator (`scripts/rewrite_mega_prompts.py`) so the Undeployed variant links directly to `/undeployed` and `/undeployed-preflight`, then regenerate the prompt files.

Architecture diagram:

````text
  +--------------------+        ws://localhost:9944        +------------------+
  | Lovable app        |  <------------------------------> | local midnight   |
  | (browser)          |                                   | node (Docker)    |
  |                    |  http://localhost:8088            |                  |
  | /undeployed        |  <------------------------------> | local indexer    |
  | /undeployed-preflight                                  | (Docker)         |
  +--------------------+  http://localhost:6300            |                  |
         |             |  <------------------------------> | local proof-srv  |
         |             |                                   +------------------+
         |             |                                          ^
         |             |                                          |
         |             |                                          |
         |             |                                   +------------------+
         |             |                                   | Lace wallet      |
         |             |                                   | (browser ext)    |
         |             |                                   +------------------+
         |             |
         v             v
  +--------------------+
  | Lovable Cloud      |  <- no direct connection to local stack; only serves
  | (SSR + static)     |     the app shell and routes
  +--------------------+
````

Files to create/edit:
- `src/routes/undeployed.tsx` (new)
- `src/routes/undeployed-preflight.tsx` (edit)
- `src/components/WalletConnectPanel.tsx` (edit)
- `src/routes/showcase.index.tsx` (edit)
- `src/routes/showcase.choreo-ledger-local.tsx` (edit)
- `src/components/site-shell.tsx` (edit)
- `src/routes/index.tsx` (edit)
- `scripts/rewrite_mega_prompts.py` (edit) + regenerate prompts

Out of scope:
- Hosting a Midnight node inside Lovable Cloud (serverless Workers cannot run Docker or long-lived local processes).
- Automating Docker installation (we will link to the official installers).
- Changing the existing `midnight-standalone.mjs` container logic beyond minor CLI-output polish.