# Add zealymidnight (MoveNft rail) to the showcase

Add a new demo card for `github.com/arunnadarasa/zealymidnight` to the showcase page.

## The card

- Title: **StreetRail Move Rights NFT**
- Tag: `NFT rail · Undeployed`, badge `Undeployed`
- Network filter: `undeployed`, so it appears under both "All" and the Undeployed filter
- Placed after **ChoreoCrowd Fund**, keeping the Undeployed demos grouped before the Fly.io and agentic cards
- Links to the GitHub repo (no live app URL was provided — if there is a Lovable demo link, I can point the card at it and keep GitHub as a secondary link)

Body copy summarises what makes it a reference build: a Compact NFT rail where mint → `listSale` → buy settles in mUSDC on the local Undeployed stack, using the server-append genesis-wallet write path, with insert-only/append-only ledger maps (the fix for the dust `feesWithMargin` / `transaction_merge` panic on overwrites), and verified end to end (`E2E_OK`).

## Technical notes

- Single edit to `src/routes/showcase.index.tsx`: one new entry in the `DEMOS` array following the existing external-demo shape (`key`, `href`, `tag`, `badge`, `networks`, `title`, `body`), reusing the same `min-w-0 overflow-hidden` card and `break-all` inline-code styling already in place for mobile.
- No changes to the network filter list, contract data, or skill files.
