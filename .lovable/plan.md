# Regenerate the full LLM bundle with the new NFT lessons

The 16 per-network/OS prompt bundles already include the new NFT / marketplace lessons (insert-only ledger maps, `listSale` naming, redeploy + e2e discipline). The single combined `llms-full.txt` download is still the July asset and predates them, so it must be rebuilt.

## The problem to solve first

Building `llms-full.txt` today concatenates every variant into one JavaScript string, which is roughly 2.5 GB and crashes the generator with `RangeError: Out of memory`. That is why the script currently skips it unless `BUILD_FULL=1`, and why the published file is stale.

## Approach

1. Rewrite the full-bundle generation in `scripts/build-llms-full.mjs` to stream: open a write stream, emit the core guides, then loop idea → network → OS and write each prompt chunk immediately, awaiting backpressure. No giant in-memory array or `join()`.
2. Keep the full bundle limited to the five networks currently visible (Preview, Preprod, Undeployed local, Undeployed Fly, Undeployed Mobile) plus the hidden Mainnet variant exactly as the per-combo files do, so the content matches what the site serves.
3. Run the streaming build, then externalise `public/llms-full.txt` as a Lovable asset and refresh `public/llms-full.txt.asset.json` so the `/llms` download points at the fresh file.
4. Refresh `public/llms-full.meta.json` with the real full-bundle size and generation timestamp, and confirm the `/llms` page shows the updated size/date.

## Size caveat

At ~2.5 GB the combined download is impractical for most users and may exceed asset limits. If the upload fails, the fallback is a "curated full" bundle: core guides plus one prompt per idea for each of the five visible networks at a single default host OS (macOS), which lands near 800 MB, with the per-OS files remaining the way to get Windows/Linux variants. I will report which of the two shipped.

## Technical notes

- Only `scripts/build-llms-full.mjs`, the regenerated `public/llms-*.txt` outputs, their `.asset.json` pointers, and `public/llms-full.meta.json` change.
- No prompt content changes: `src/lib/mega-prompt-variants.ts` already carries the NFT block, so this is purely a regeneration of the combined artefact.
- Large `.txt` files stay out of the repo; only asset pointers are committed.
