---
name: lovable-ethereum-sepolia
description: Ship a Lovable app on Ethereum Sepolia — Privy Google/email sign-in with embedded wallet, native Privy gas sponsorship (no ZeroDev), Hardhat deploy + Etherscan verify, optional IPFS via Pinata. Use when the user asks for a Sepolia demo, testnet contract, sponsored-tx UX on Ethereum, or timestamp / provenance / mint flow on Sepolia.
---

# Lovable · Ethereum Sepolia

Everything needed to ship a working Sepolia demo: Google sign-in via Privy,
embedded wallet, **native Privy gas sponsorship** (no ZeroDev, no smart
wallets), one Solidity contract deployed + verified on Etherscan, optional
IPFS pin via Pinata. Chain id `11155111`.

## Non-obvious rules (get these wrong and it silently fails)

1. **Sepolia does NOT need ZeroDev or smart wallets.** Privy's native gas
   sponsorship covers Sepolia. Enable it in the dashboard and pass
   `sponsor: true` per call — that's it. Don't wire `SmartWalletsProvider`
   or a paymaster URL.

2. **Dashboard config (one-time, user).** Privy dashboard → Gas
   sponsorship → **App pays** → add chain **Ethereum Sepolia** → toggle
   **Allow transactions from the client** ON. Native sponsorship requires
   TEE execution, which is the current Privy default. Without any of
   these, `sendTransaction` hangs or falls back to user-paid with a
   non-zero fee.

3. **Both fields on every call:**
   ```ts
   sendTransaction(
     { to, data, chainId: 11155111 },
     { address: embedded.address, sponsor: true }
   );
   ```
   Approval sheet still appears — fee reads **US$0.00** — user taps
   Approve once. There is no supported way to skip that sheet on the
   embedded-EOA path.

4. **Do NOT pass `uiOptions: { showWalletUIs: false }`.** Privy aborts the
   send with `signal is aborted without reason`. This is the #1 way to
   waste an hour thinking sponsorship is broken. Just remove the field.

5. **Wrap `sendTransaction` in a 45s `Promise.race` timeout** whose reject
   message names the exact dashboard toggles. Without it, a misconfigured
   dashboard hangs the UI forever with no diagnosable error. Reference
   shape in `references/privy-sponsored-tx.md`.

6. **SSR-safe Privy mount is mandatory.** `lazy(() => import("./privy-client-entry"))`
   inside `<ClientOnly>` + `<Suspense>`. Never import
   `@privy-io/react-auth` at module scope of a route file — SSR bundle
   explodes. See `evvm-privy-integration` skill for the full mount pattern.

7. **Pass `chainId: 11155111` on every `sendTransaction`.** Sponsorship
   is configured per-chain in the dashboard; if you omit `chainId` the
   embedded wallet may default to mainnet and the sponsor rule does not
   match. You do NOT need `defaultChain`/`supportedChains` in the
   `PrivyProvider` config — if you set them anyway, use viem's `sepolia`
   object, never a `{ id, name } as never` stub.

8. **viem event reads on the free public RPC rate-limit past ~9000 blocks.**
   Cap `getLogs` ranges (`fromBlock = head - 9000n`) or wire an Alchemy
   URL. For production reliability keep both:
   `import.meta.env.VITE_SEPOLIA_RPC_URL` in the browser, `SEPOLIA_RPC_URL`
   in Hardhat.

9. **Contract deploys use a plain Node EOA, not sponsorship.** Hardhat
   reads `METAMASK_PRIVATE_KEY` + `SEPOLIA_RPC_URL`. Fund from
   `https://sepoliafaucet.com` or Alchemy's faucet. Sponsorship only
   covers user-triggered txs at runtime.

10. **Etherscan v2 verification for Sepolia uses `chainid=11155111` in the
    URL query string, not the POST body.** One `ETHERSCAN_API_KEY` covers
    every chain via v2. Unlike Fuji (Snowtrace + Etherscan) there is no
    second explorer to submit to. See
    `references/hardhat-etherscan-verify.md`.

## When to use

| User asks for… | Use this skill |
| --- | --- |
| A Sepolia demo / testnet dApp | Yes |
| Gas-sponsored UX on Ethereum L1 (no popup fee) | Yes |
| Timestamp / event-log / provenance contract on Sepolia | Yes |
| ERC-721 mint with IPFS-backed metadata on Sepolia | Yes (pair with `references/pinata-ipfs.md`) |
| Sepolia → L2 bridging / CCTP | No — see `dance-ucp-arc-circle` |
| Mainnet payments | No — use `payments--enable_*` |
| A different testnet (Base Sepolia, Fuji, Amoy, Robinhood, Tempo) | Use the matching chain-specific skill |

## Required secrets

| Name | Purpose | When |
| --- | --- | --- |
| `PRIVY_APP_ID` (+ `VITE_PRIVY_APP_ID`) | Google/email login + embedded wallet | Always |
| `METAMASK_PRIVATE_KEY` | Hardhat deployer EOA | Only if you deploy a contract |
| `SEPOLIA_RPC_URL` (+ `VITE_SEPOLIA_RPC_URL`) | Alchemy HTTPS URL | Recommended; free public RPC works but rate-limits |
| `ETHERSCAN_API_KEY` | Etherscan v2 verify | Only if you deploy a contract |
| `PINATA_JWT` (+ `VITE_PINATA_JWT`) | IPFS pinning | Only if the app pins media/metadata |

**Do NOT add** any ZeroDev / bundler / paymaster keys — native Privy
sponsorship handles it.

## Reference index

- `references/privy-sponsored-tx.md` — canonical `privy-client-entry.tsx`
  and `privy-root.tsx`, dashboard walkthrough, error table
- `references/hardhat-etherscan-verify.md` — deploy script, verify CLI +
  curl fallback, `src/data/contract.json` shape
- `references/pinata-ipfs.md` — browser upload, gateway URLs, ERC-721
  metadata pattern
- `references/failure-modes.md` — symptom → cause → fix table

## Related skills

- `evvm-privy-integration` — SSR-safe Privy mount pattern (deeper coverage of `PrivyRoot` + `ClientOnly`)
- `robinhood-lovable` — Hardhat + Blockscout verify + Pinata + smart-wallet path (use for Robinhood testnet, not Sepolia)
- `lovable-avalanche-x402` — Etherscan v2 multi-verifier pattern (Fuji + Routescan)
- `lovable-tempo` — TIP-20 pay pattern for Tempo, similar Privy sponsorship shape

## Canonical minimal `src/data/contract.json`

```json
{
  "address": "0x…",
  "deployTx": "0x…",
  "chainId": 11155111,
  "network": "Sepolia",
  "explorer": "https://sepolia.etherscan.io"
}
```

The UI reads `contractCfg.address` + `contractCfg.chainId` from this file
and links every tx via `${contractCfg.explorer}/tx/${hash}`.
