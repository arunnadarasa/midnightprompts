Update `src/routes/showcase.index.tsx` to show only the two requested showcase items.

1. **Filter the DEMOS array**
   - Remove `Programmatic DUST`, `Choreo Ledger (Local)`, and `Move Board` cards.
   - Keep `Midnight Ledger`.
   - Add a new `Tokenized Choreo Kits` card with:
     - Lovable app link: https://choreokits.lovable.app/
     - GitHub repo: https://github.com/arunnadarasa/choreokits
     - Tag: "Hackathon starter · Live build"
     - Badge: "Preview / Preprod / Undeployed"
     - Networks: `preview`, `preprod`, `undeployed`
     - Description: a short line that mentions it is a working reference build generated from the prompt library, with a deploy script and Lace funding steps.

2. **Make the card link externally**
   - The existing card component uses `Link` from `@tanstack/react-router`, which is internal-only. For external links, use a plain `a` element or add a dedicated external card layout. Since the other card still links to `/showcase/midnight-ledger`, the simplest approach is to render the internal `Link` for `Midnight Ledger` and an `a` tag for `Tokenized Choreo Kits`.

3. **Update the section title and subtitle**
   - Keep the tone consistent, but reflect that the showcase is now a curated pair of working demos rather than Vol. 01 with multiple filters.

No other routes or data files need to be changed. The existing showcase detail pages (`showcase.programmatic-dust.tsx`, `showcase.choreo-ledger-local.tsx`, `showcase.move-board.tsx`) can remain in the codebase; only the index listing is being updated.
