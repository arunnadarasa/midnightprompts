## Goal

The mega-prompt on each `/ideas/:id` page must be **self-contained** — when a user pastes it into a fresh Lovable project, it should instruct that project's AI to build a working "Connect Lace" button using the v4 DApp Connector API, without relying on the private `lovable-midnight` skill or any file in this repo.

## What we add

### A) Fix the local wallet hook (so this app also works)
`src/lib/use-midnight-wallet.ts` — replace the removed `api.state()` call with v4 methods:
- Try `api.getShieldedAddresses()` → first entry (handles both array and record shapes).
- Fall back to `api.getUnshieldedAddress()`.
- Legacy fallback: `if (typeof api.state === "function") await api.state()`.
- Type `ConnectedApi` updated to match v4; keep candidate-network loop and `inferNetworkFromAddress`.

### B) One shared "Connect Wallet" boilerplate, appended to every mega-prompt

Create `src/data/mega-prompt-wallet-boilerplate.ts` exporting a single `WALLET_CONNECT_BOILERPLATE` string. It's a self-contained instruction block written to be pasted verbatim into a fresh Lovable project. It tells the target AI to:

1. Create `src/lib/use-midnight-wallet.ts` with the v4-correct hook (candidate-network loop over `preview` / `preprod` / `mainnet`, no `.state()`, uses `getShieldedAddresses` → `getUnshieldedAddress`, error/redetect states).
2. Create `src/components/WalletConnectPanel.tsx` — the same panel shape we use here (hydration-gated, connect/connecting/connected/error states, address truncation + copy, wrong-network hint).
3. Mount `<WalletConnectPanel expectedNetwork={import.meta.env.VITE_NETWORK_ID ?? "preprod"} />` on the primary page.
4. Note prerequisites in the pasted text: install Lace, switch it to Preview or Preprod, get tDUST from the matching faucet; no signing / no funds moved by connect.
5. Explicit contract with the target AI: **do not** import `@midnight-ntwrk/*` for the connect step, **do not** call `enable()` or `state()` (v4 removed them), read `window.midnight` under `useEffect` only.

The block is delimited with a clearly marked header so it's obvious in the rendered prompt:
```
--- BEGIN: Connect-Lace boilerplate (self-contained, DApp Connector v4) ---
…
--- END: Connect-Lace boilerplate ---
```

### C) Rewrite every idea JSON to append the boilerplate

Update `scripts/rewrite_mega_prompts.py` (or add a new small script — pick the existing one if it already targets these files) to:
- Load each of `src/data/ideas/{dance,music,visual-art,video,photography,writing,film-animation,games,theater,fashion}.json`.
- For every idea in `ideas[]`, if `megaPrompt` doesn't already contain the boilerplate sentinel (`--- BEGIN: Connect-Lace boilerplate`), append `\n\n` + boilerplate.
- Write the JSON back with the same 2-space formatting.
- Idempotent: rerunning does nothing.

Run it once. Result: every `Idea.megaPrompt` now ends with the self-contained wallet section, and `/ideas/:id` renders it inside the existing `<pre>` — no route/component change needed.

### D) Idea page (optional, small)

Above the mega-prompt in `src/routes/ideas.$id.tsx`, add one line: "The prompt below includes a self-contained Connect Lace step — no extra setup on the target project." No wallet panel embedded on the idea page itself (that's showcase's job).

## Not in scope

- The tDUST / ZKIR support-matrix screenshot: that's a Midnight infra ticket (server-side prover vs. wallet-sdk-dust-wallet version drift). Nothing in this repo can fix it. Happy to add a "known issue" callout on the Programmatic DUST page as a follow-up if you want.

## Verification

- Local app: `/showcase/midnight-ledger` connects with Lace on Preview or Preprod (no `i.state is not a function`), chip reflects the actual network.
- Open any `/ideas/:id`: the mega-prompt now ends with the `--- BEGIN: Connect-Lace boilerplate ---` block containing full `use-midnight-wallet.ts` and `WalletConnectPanel.tsx` source.
- Rerun the rewrite script → no diff (idempotent).
- Copy one prompt into a fresh Lovable project → that project's AI can build the Connect Lace button without needing this repo's skill.
