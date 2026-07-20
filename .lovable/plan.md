## Goal

Fix three gaps in the generated hackathon apps (example: `arunnadarasa/choreokits` shipped without a `scripts/` folder even though the README referenced one):

1. Every generated app must include a real `scripts/` folder with `deploy-midnight.mjs` and (for Undeployed) `midnight-standalone.mjs`.
2. Every generated app's frontend must render an explicit "One-time local setup" panel so end users see the required terminal steps in-app, not only in the mega-prompt.
3. The Undeployed variant must document how to fund Lace on a local devnet (genesis wallet, `ws://localhost:9944`, no faucet — but with the exact Lace steps and the fallback path for a non-genesis wallet).

Because the JSON files no longer store prompts (they are built at render time by `buildVariant`), a single edit to `src/lib/mega-prompt-variants.ts` updates all 996 ideas × 3 networks. `scripts/rewrite_mega_prompts.py` is edited only to keep the two sources in sync — no JSON regeneration is required.

## Files touched

- `src/lib/mega-prompt-variants.ts` — add three new blocks and inject them into `buildVariant`.
- `scripts/rewrite_mega_prompts.py` — mirror the same three blocks so the Python source stays canonical.
- `src/routes/ideas.$id.tsx` — extend the small "wallet boilerplate" callout to also mention the scripts + setup-panel additions, so users glancing at the idea page know what changed.

No other routes, no JSON, no data model changes.

## New block 1 — `SCRIPTS_FOLDER` (all three variants)

Instructs Lovable to create `scripts/deploy-midnight.mjs` in every generated app, mirroring this project's script. Includes:

- Full contents of a minimal `deploy-midnight.mjs` (reads `VITE_NETWORK_ID`, loads `contracts/managed/<name>/`, calls `deployContract`, prints the hex address, writes `src/data/midnight-contract.<network>.json`).
- A `scripts/README.md` stub that explains when to run it.
- Explicit rule: `README.md` MUST NOT reference a script that does not exist on disk — regenerate the README from the actual `scripts/` contents.
- For the Undeployed variant only, also include `scripts/midnight-standalone.mjs` (thin wrapper — bring-up / status / down for the local Docker stack, matching this project's script).

## New block 2 — `IN_APP_SETUP_PANEL` (all three variants)

Instructs Lovable to render a `<SetupInstructions />` component on the primary page, above the demo. Content is variant-aware:

- **Preview / Preprod:** Install Lace → switch network → faucet URL → `docker run -p 6300:6300 midnightntwrk/proof-server:latest` → `VITE_NETWORK_ID=<network> bun scripts/deploy-midnight.mjs` → paste address into `VITE_DEFAULT_CONTRACT`.
- **Undeployed:** Docker prerequisite per OS → `bun scripts/midnight-standalone.mjs up` → point Lace at `ws://localhost:9944` → deploy → link to `/undeployed-preflight` in *this* project as a reference walkthrough.

The panel must be collapsible, persist "dismissed" state in `localStorage`, and expose a "show setup again" link in the footer. Copy is prescriptive so the generated app doesn't ship an empty stub.

## New block 3 — `UNDEPLOYED_FUND_LACE` (Undeployed variant only)

Adds a "Fund your Lace wallet on Undeployed" section, sourced from `docs.midnight.network/llms-full.txt` and `github.com/midnightntwrk/midnight-local-dev`:

- Default path: the standalone stack mints unlimited tDUST to the genesis wallet; import the genesis mnemonic into Lace as a *dev-only* account. Include the standard warning that the mnemonic is public and must never be reused on Preview / Preprod / Mainnet.
- Alternative path: keep your own Lace account and transfer tDUST from genesis using `midnight-cli` (or the local-dev repo's helper) — one command, exact syntax.
- Verify: refresh Lace, DUST balance shows non-zero; if it doesn't, run `bun scripts/midnight-standalone.mjs status` and check `/undeployed-preflight`.

## Wiring in `buildVariant`

Insert order inside the returned prompt:

```text
STACK
PACKAGES
TOOLCHAIN
{LOCAL_STACK_SETUP if undeployed}
{UNDEPLOYED_FUND_LACE if undeployed}
SCRIPTS_FOLDER                 ← new, all variants
VITE_CONFIG
MIDNIGHTJS_BOOT
{body}
IN_APP_SETUP_PANEL             ← new, all variants (variant-aware text)
RED FLAGS
{netSecrets}
FURTHER REFERENCE
CREDIT
+ WALLET_BOILERPLATE (unchanged)
```

## Verification

- Load `/ideas/<any-id>` in the preview, switch between the three network tabs, confirm each variant now contains the `SCRIPTS_FOLDER` and `IN_APP_SETUP_PANEL` sections, and that only the Undeployed tab contains `UNDEPLOYED_FUND_LACE`.
- Character-count check: the added blocks are ~4 KB total; well under the Lovable single-message ceiling that the existing prompts already sit inside.
- No JSON regeneration and no build config changes are required — the runtime builder covers all 2,988 variants.

## Not doing

- No changes to the JSON idea files, no new npm packages, no changes to `/undeployed`, `/undeployed-preflight`, or the showcase pages.
- No changes to the wallet-connect boilerplate itself — it already works; the new blocks sit alongside it.
