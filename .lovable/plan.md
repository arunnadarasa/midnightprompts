Add a third showcase card for the live-built Midnight Fireside demo.

## Change

Edit `src/routes/showcase.index.tsx` — append a new entry to the `DEMOS` array:

- **key:** `choreocrowd-fund`
- **href:** `https://choreo-crow.lovable.app/`
- **tag:** `Fireside live build · Undeployed`
- **badge:** `Undeployed`
- **networks:** `["undeployed"]`
- **title:** ChoreoCrowd Fund
- **body:** Short description — private onchain crowdfunding for dance projects, built live during the Midnight Fireside chat. Demonstrates the server-append pattern (UI → `/api/append-entry` → genesis wallet) for local Undeployed writes, since Lace can't sign on Undeployed. Links to the live app and the [GitHub repo](https://github.com/arunnadarasa/midnightfireside).

Also update the intro copy: change "Two reference builds" → "Three reference builds" and mention the fireside demo briefly.

No other files touched.
