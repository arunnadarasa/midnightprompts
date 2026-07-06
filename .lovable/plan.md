
## Goal

Rewrite the Privy sponsorship section inside every `megaPrompt` string in `src/data/ideas/*.json` to match the working native-gas-sponsorship recipe from the `lovable-ethereum-sepolia` skill. In-place edit, no generator rerun.

## Approach

Every one of the ~1000 prompts contains the same 4-line Privy block:

```
- Privy embedded wallet wraps `<App />` in src/main.tsx:
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{ loginMethods:['google'], embeddedWallets:{createOnLogin:'users-without-wallets'},
                defaultChain:{ id: 11155111, name:'Sepolia' } }}>
- All txs via Privy `useSendTransaction` with `{ sponsor: true }` (zero-gas for the user).
```

A one-off Python script (`scripts/patch_privy_block.py`, not committed as source-of-truth — just a utility) loads each JSON, does a single `str.replace` of that exact block with the new block below, writes the file back with the same indentation/encoding. Idempotent: if the old block is absent, the file is left untouched.

### New block that replaces it

```
- SSR-safe Privy mount is mandatory. Never import @privy-io/react-auth at
  module scope of a route file — it crashes SSR. Use
  lazy(() => import('./privy-client-entry')) inside <ClientOnly> + <Suspense>,
  and put <PrivyProvider> only inside privy-client-entry.tsx.
- PrivyProvider config (do NOT stub defaultChain as { id, name } — omit it
  or pass viem's `sepolia`; chainId is passed per-call):
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{ loginMethods:['google','email'],
                embeddedWallets:{ ethereum:{ createOnLogin:'users-without-wallets' } },
                appearance:{ theme:'dark' } }}>
- Read the embedded wallet from useWallets, not user.wallet:
    const embedded = wallets.find(w => w.walletClientType === 'privy');
- Every send goes through Privy `useSendTransaction` with BOTH `address`
  and `sponsor`, wrapped in a 45s Promise.race timeout whose reject message
  names the exact dashboard toggles:
    await Promise.race([
      sendTransaction(
        { to, data, chainId: 11155111 },
        { address: embedded.address, sponsor: true }
      ),
      new Promise((_, r) => setTimeout(() => r(new Error(
        "Privy sendTransaction timed out after 45s. Enable Gas sponsorship -> App pays -> Ethereum Sepolia -> Allow transactions from the client."
      )), 45_000)),
    ]);
- Do NOT pass uiOptions:{ showWalletUIs:false } — it aborts with
  "signal is aborted without reason". The approval sheet still shows on
  the embedded-EOA path; the fee reads US$0.00.
- Do NOT add ZeroDev / SmartWalletsProvider / a paymaster URL. Native
  Privy sponsorship on Sepolia works with the toggles above and nothing else.
- DASHBOARD PREREQUISITE (one-time): Privy dashboard -> Gas sponsorship
  -> App pays -> add "Ethereum Sepolia" -> toggle "Allow transactions
  from the client" ON. Without this, sendTransaction hangs silently.
```

Everything else in every prompt — CONCEPT, 5-CREDIT BUDGET, Hardhat / Etherscan-v2 verify block, CONTRACT, USER FLOW, REQUIRED SECRETS, CREDIT — stays byte-for-byte identical.

## Files touched

- `src/data/ideas/dance.json`
- `src/data/ideas/music.json`
- `src/data/ideas/visual-art.json`
- `src/data/ideas/video.json`
- `src/data/ideas/photography.json`
- `src/data/ideas/writing.json`
- `src/data/ideas/film-animation.json`
- `src/data/ideas/games.json`
- `src/data/ideas/theater.json`
- `src/data/ideas/fashion.json`
- `scripts/rewrite_mega_prompts.py` — same string swap applied to the template literal so a future regenerate stays consistent with the JSONs.

No changes to UI code, routes, contracts, or any other file.

## Verification

- `grep -c "Allow transactions from the client" src/data/ideas/*.json` → 100 per file.
- `grep -c "showWalletUIs" src/data/ideas/*.json` → 100 per file.
- `grep -c "defaultChain:{ id: 11155111" src/data/ideas/*.json` → 0 (old stub is gone).
- `jq '.ideas | length' src/data/ideas/*.json` → still 100 per file, still valid JSON.
- Open `/ideas/dance-choreo-ledger-0` in the preview and copy the prompt — inspect that the STACK block matches the new text.

## Out of scope

Design tokens, UI, routes, contract data, other skills.
