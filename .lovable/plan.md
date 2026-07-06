
## Goal

Author a new activated skill `lovable-ethereum-sepolia` capturing everything we learned wiring Sepolia + Privy sponsored txs + IPFS + Hardhat verify in this project, so a future Lovable agent doesn't have to rediscover the failure modes.

## Structure

```
.agents/skills/lovable-ethereum-sepolia/
├── SKILL.md
└── references/
    ├── privy-sponsored-tx.md
    ├── hardhat-etherscan-verify.md
    ├── pinata-ipfs.md
    └── failure-modes.md
```

## `SKILL.md` (top-level, always the primer)

Frontmatter:
- `name: lovable-ethereum-sepolia`
- `description: Ship a Lovable app on Ethereum Sepolia — Privy Google/email sign-in with embedded wallet, native Privy gas sponsorship (no ZeroDev), Hardhat deploy + Etherscan verify, optional IPFS via Pinata. Use when the user asks for a Sepolia demo, testnet contract, or sponsored-tx UX on Ethereum.`

Contents:
- **Non-obvious rules** (numbered, each one a "get this wrong and it fails silently" nugget):
  1. Sepolia does NOT need ZeroDev / smart wallets. Native Privy gas sponsorship covers it — just enable it in the Privy dashboard and pass `sponsor: true` per call.
  2. Dashboard config: Gas sponsorship → **App pays** → add **Ethereum Sepolia** → toggle **Allow transactions from the client** ON. Requires TEE execution (current Privy default).
  3. `sendTransaction(tx, { address: embedded.address, sponsor: true })` — both fields required. Approval sheet still shows (fee reads $0); users tap Approve once.
  4. Do NOT pass `uiOptions: { showWalletUIs: false }` — Privy aborts with `signal is aborted without reason`. There is no supported way to skip the approval sheet on the embedded EOA path.
  5. Always wrap the Privy send in a 45s `Promise.race` timeout whose reject message names the exact dashboard toggles — otherwise a mis-configured dashboard hangs the UI forever with no clue.
  6. SSR-safe Privy mount is mandatory (`lazy(() => import("./privy-client-entry"))` inside `<ClientOnly>` + `<Suspense>`). Never import `@privy-io/react-auth` at module scope of a route.
  7. Chain config in Privy is optional for sponsorship (the dashboard sponsors by chainId) but pass `chainId: 11155111` on every `sendTransaction` call so the wallet doesn't default to mainnet.
  8. viem event reads on Sepolia: use `createPublicClient({ chain: sepolia, transport: http() })` and cap `getLogs` to the last ~9000 blocks — the free public RPC rate-limits big ranges. For production reliability wire an Alchemy RPC URL.
  9. Contract deploys use a plain Node EOA via Hardhat + `METAMASK_PRIVATE_KEY` — sponsorship is only for user-triggered txs, not for deploys. Fund the deployer from `https://sepoliafaucet.com` or Alchemy's faucet.
  10. Etherscan v2 verification for Sepolia uses `chainid=11155111` in the URL query, one `ETHERSCAN_API_KEY`. Sourcify is optional; unlike Fuji there is no second explorer to submit to.

- **When to use** table (Sepolia demo, sponsored tx UX, provenance mint, timestamp/log contract, IPFS-backed metadata).
- **Required secrets** table.
- **Reference index** pointing to the four files in `references/`.
- **Related skills** — cross-link `evvm-privy-integration` (SSR-safe Privy mount is spelled out there), `robinhood-lovable` (Hardhat + Pinata patterns), `lovable-avalanche-x402` (multi-verifier Etherscan v2 pattern).

## `references/privy-sponsored-tx.md`

- Canonical `privy-client-entry.tsx` shape used in this project (Bridge with `usePrivy` + `useWallets` + `useSendTransaction`, exposing a typed context; `sendTransaction(tx, { address, sponsor: true })` inside `Promise.race` with 45s timeout).
- Canonical `privy-root.tsx` SSR-safe mount.
- Dashboard walkthrough with exact toggle names.
- Exact error → cause table (aborted, timed out, popup shows non-zero fee, "insufficient funds").
- Note: no `uiOptions`; no `chainConfigs` needed; keep `defaultChain`/`supportedChains` out of the provider config for Sepolia (Privy defaults are fine) — mention that if you DO set them, use viem's `sepolia` object, never a stub.

## `references/hardhat-etherscan-verify.md`

- `hardhat.config.cjs` block with `networks.sepolia`, `etherscan.apiKey.sepolia`, `chainId: 11155111`.
- Deploy script pattern using `METAMASK_PRIVATE_KEY` + `SEPOLIA_RPC_URL` (Alchemy).
- `npx hardhat verify --network sepolia <address>` with constructor-args note.
- Etherscan v2 curl fallback (`api.etherscan.io/v2/api?chainid=11155111`) for cases where the CLI complains about the compiler version — include the canonical `v0.8.28+commit.7893614a` string.
- Persist deployed address to `src/data/contract.json` shape (`{ address, chainId: 11155111, explorer: "https://sepolia.etherscan.io" }`) for the UI to consume.

## `references/pinata-ipfs.md`

- Minimal browser upload with `PINATA_JWT` (publishable-JWT rules — must be scoped, never a full account JWT).
- CID → `https://gateway.pinata.cloud/ipfs/<cid>` and `https://ipfs.io/ipfs/<cid>` gateway examples.
- When to pin metadata JSON separately from media (ERC-721 tokenURI pattern).

## `references/failure-modes.md`

Symptom → cause → fix table covering every real bug we hit:

| Symptom | Cause | Fix |
|---|---|---|
| `signal is aborted without reason` on `sendTransaction` | Passed `uiOptions.showWalletUIs: false` alongside `sponsor: true` | Remove `uiOptions` entirely; Privy has no supported "no-popup" flag for the EOA path |
| Privy popup shows non-zero fee ("US$17.34" etc.) | Missing `sponsor: true` in options | Add `sponsor: true` |
| Sponsored call hangs forever | "Allow transactions from the client" is OFF, or Sepolia is not in the sponsored chain list | Fix in Privy dashboard; the 45s timeout surfaces this cleanly |
| `insufficient funds for gas` on user tx | Sponsorship not enabled on this chain; Privy fell back to user-paid | Enable App pays → Ethereum Sepolia |
| Etherscan verify: "Missing or unsupported chainid parameter" | Sent `chainid` in POST body to Etherscan v2 | Put `chainid=11155111` in URL query string |
| `getLogs` returns `block range too large` | Public RPC rate-limit | Cap range (~9000 blocks) OR use Alchemy RPC |
| SSR build crash importing `@privy-io/react-auth` | Top-level Privy import in a route | Move behind `ClientOnly` + `lazy()` |
| Ledger address in event ≠ signed-in address | Reading `user.wallet.address` instead of `wallets.find(w => w.walletClientType === "privy").address` | Prefer the embedded wallet from `useWallets()` |

## Out of scope

- Not a chat/AI skill — no Lovable AI Gateway content.
- No ZeroDev / smart-wallet path (explicitly excluded — that lives in `robinhood-lovable`).
- No mainnet deploy playbook — Sepolia-only.
- No new secrets requested from the user; the skill is documentation only.

## Delivery

After writing the four files under `.agents/skills/lovable-ethereum-sepolia/`, apply via `skills--apply_draft`. Report back as saved and active.
