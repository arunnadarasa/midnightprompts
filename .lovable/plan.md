## Goal

Surface the hard-won learnings from the "Fly.io — Tokenized Choreo Kits" build so hackathon participants who want to host their own Undeployed stack (not just run it locally on Docker) skip the pitfalls we already hit — including the currently-open node blocker.

## Where it lives

Add a new "Host Undeployed on Fly.io (optional)" section at the bottom of `src/routes/undeployed.tsx` with anchor `#fly`. That page is already the canonical home for the Undeployed network story — Fly is the "make it multi-user demoable" variant of the same stack, so it belongs there rather than as a new route. No nav change needed.

Also update the ChoreoKits card on `src/routes/showcase.index.tsx` with a one-line note pointing to `/undeployed#fly` for the recipe.

Update `src/routes/undeployed.tsx` head meta description to mention Fly hosting.

## Content to add (five subsections)

1. **Four-app topology.** `choreo-node` (6PN-internal only, `ws://…internal:9944`), `choreo-indexer` (public HTTPS + WSS on `/api/v4/graphql`), `choreo-proof` (public HTTPS), `choreo-faucet` (public HTTPS `/grant`, in-memory rate limit). Reference the `scripts/fly-bootstrap.sh` shape.

2. **Non-obvious gotchas (bullet list).**
   - Proof server needs `memory = "2gb"` — the k=13 proving key OOMs on 1GB mid-mint.
   - `auto_stop_machines = false` on proof + node — cold start ≈ 4 min of user-visible "Proving…".
   - Proof server binary is IPv4-only. It's fine as-is when accessed via the public `https://…fly.dev` URL (fly-proxy enters over IPv4); if you ever need to reach it over 6PN you need a `socat` sidecar that binds `[::]` and forwards to `127.0.0.1`.
   - Node must bind IPv6 for 6PN: `--experimental-rpc-endpoint "listen-addr=[::]:9944,methods=unsafe"`. Default preset is IPv4-only, so indexer/faucet can't reach it via `.internal`.
   - Never scale `choreo-node` above 1 machine — two machines = two participants = forked chain. `flyctl scale count 1` after every deploy.
   - No `[http_service]` on the node — RPC stays 6PN-internal; expose via `[[services]]` on port 9944 only.
   - Pin `midnight-node:0.22.5`. Do **not** bump to 2.x — those are Partner Chain builds that need Cardano `db-sync` and crash-loop on standalone.
   - Persistent `chain_data` volume (1 GB) on node — wipe it and every previously-deployed contract address becomes invalid.
   - Faucet wallet has to be pre-funded once from the genesis seed (`…0002`) before `/grant` works. Expose `/health` so you can see the balance while it syncs.

3. **⚠️ OPEN BLOCKER — standalone node stuck at block #0 on Fly.** New subsection with an amber "Open issue" label. Symptoms and current state:
   - `midnight-node:0.22.5` with `CFG_PRESET=dev` + `SIDECHAIN_BLOCK_BENEFICIARY=<hex>` boots in **partner-chain mode**, not standalone sealer mode. Logs show `Idle (0 peers)` forever and one line: `Failed to trigger bootstrap: No known peers`.
   - Downstream effect: faucet wallet (`buildFromSeed`) never finishes sync, `getUnshieldedAddress()` returns `null`, `/grant` returns 503 `faucet warming up`.
   - Proof server and indexer are healthy in this state (`/version` → `8.0.3`; GraphQL `{ __typename }` responds on `/api/v4/graphql`) — the blocker is authoring, not plumbing.
   - Working theory: `SIDECHAIN_BLOCK_BENEFICIARY` alone flips the image into partner-chain expectations; standalone `--dev` sealer needs a different env combination (or the entrypoint expects a flag that `[processes]` in `fly/node/fly.toml` is currently overriding).
   - Suggested next probe (not done in this edit): `flyctl ssh console -a choreo-node`, dump `/entrypoint.sh` and the image's supported env vars, and compare against `midnightntwrk/midnight-local-dev`'s `standalone.yml` node env block, which authors blocks fine locally with the same tag.
   - Workaround while unresolved: use the local `docker compose` stack for Undeployed (already documented above on this page); Fly hosting only unlocks once the standalone sealer boots.

4. **Deploy flow.** `fly-bootstrap.sh` (creates 4 apps + volume + secrets, deploys) → fund faucet once from `…0002` → `fly-deploy-contract.sh` runs on a Fly Machine so it can reach `choreo-node.internal` over 6PN → paste the returned address into your app's `VITE_DEFAULT_CONTRACT` env var and republish.

5. **When to reach for Fly vs local Docker.** Local Docker for offline dev / preflight; Fly when you need a publicly demoable dApp any judge with Lace can hit. Warning: Fly is public infra — treat `FAUCET_SEED` like a real key, rate-limit `/grant`, and never point Lace at the hosted node from Mainnet.

## Copy tone

Matches the rest of `/undeployed`: `whitespace-pre-wrap break-all` code blocks, muted-foreground body, `eyebrow` labels, `<a target="_blank" rel="noreferrer">` for external links. The open-blocker box gets a distinct `border-amber-500/40` (or existing warning token if present) so it visually separates from the "working" gotchas.

## Out of scope

- No changes to `src/lib/mega-prompt-variants.ts` and no regeneration of the 10 LLM bundles this turn. Fly hosting is optional infra with an open blocker; not appropriate to bake into every hackathon prompt yet. Say the word and I'll fold it in once the node authoring is resolved.
- No new route, no nav change.
- No changes to `use-midnight-wallet.ts` or `NetworkToggle`.

## Files touched

- `src/routes/undeployed.tsx` — new `#fly` section with the five subsections above + updated head description.
- `src/routes/showcase.index.tsx` — one-line addition to the ChoreoKits card body linking to `/undeployed#fly`.
