# Failure modes — Sepolia + Privy + Hardhat

Every entry is a real bug that shipped in a Lovable Sepolia project. Read
this before spending more than 5 minutes debugging.

## Privy / sponsored transactions

| Symptom | Cause | Fix |
| --- | --- | --- |
| `signal is aborted without reason` (in the UI, right after tapping the action button) | Passed `uiOptions: { showWalletUIs: false }` alongside `sponsor: true` | Remove `uiOptions` entirely — Privy has no supported "no-popup" flag on the embedded-EOA path |
| Privy approval sheet shows a non-zero fee (e.g. "US$17.34") | Missing `sponsor: true` in the second arg of `sendTransaction` | Add `sponsor: true` — the fee should read `US$0.00` |
| Sponsored call hangs indefinitely with no error | "Allow transactions from the client" toggle is OFF, OR Sepolia is not in the sponsored chain list | Fix in Privy dashboard → Gas sponsorship. The 45s `Promise.race` timeout (see `privy-sponsored-tx.md`) surfaces this cleanly |
| `insufficient funds for gas` in the wallet UI | Same as above — Privy fell back to user-paid because sponsorship didn't match | Confirm dashboard config AND that `chainId: 11155111` is passed on the send |
| The address in `Logged(address, cid, at)` events doesn't match the "Signed in as" address | Reading `user.wallet.address` (which can be an external linked wallet) instead of the embedded wallet | Use `wallets.find(w => w.walletClientType === "privy")?.address` from `useWallets()` |
| SSR build crash `ReferenceError: window is not defined` importing `@privy-io/react-auth` | Top-level Privy import in a route file — SSR bundle explodes | Move behind `<ClientOnly>` + `lazy(() => import(...))`. See `evvm-privy-integration` for full mount pattern |
| Google login works but no wallet is minted | `embeddedWallets.ethereum.createOnLogin` not set | Set `{ ethereum: { createOnLogin: "users-without-wallets" } }` in `PrivyProvider` config |

## viem / RPC

| Symptom | Cause | Fix |
| --- | --- | --- |
| `getLogs` returns `block range too large` or `-32005` rate limit | Public RPC caps large block ranges | Cap to `head - 9000n` blocks OR wire Alchemy via `VITE_SEPOLIA_RPC_URL` |
| `balanceOf`/`getBlockNumber` flakes intermittently | Same free-RPC rate limit | Wire Alchemy RPC; keep the public URL as fallback |
| Contract call reverts silently | Wrong `chainId` — wallet on mainnet, calldata for Sepolia | Pass `chainId: 11155111` explicitly on `sendTransaction` |

## Hardhat / Etherscan

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Missing or unsupported chainid parameter` (Etherscan v2 curl) | `chainid` sent in POST body | Move `chainid=11155111` into URL query string |
| `insufficient funds` on `npx hardhat run scripts/deploy.cjs` | Deployer EOA (from `METAMASK_PRIVATE_KEY`) not funded | Get Sepolia ETH from `https://sepoliafaucet.com` or Alchemy faucet |
| `compiler version mismatch` on verify | Used `"0.8.28"` instead of the full commit string | Use `v0.8.28+commit.7893614a` (canonical form on `https://etherscan.io/solcversions`) |
| `Bytecode does not match` | Optimizer settings differ between compile and verify | Match `optimizer.enabled` and `runs` |
| `unable to locate ContractCode` right after deploy | Explorer hasn't indexed yet | Wait 15-30s after `waitForDeployment` before verifying |
| CLI verify hangs on Sourcify | Sourcify default enabled | Set `sourcify: { enabled: false }` in `hardhat.config.cjs` |

## Environment / secrets

| Symptom | Cause | Fix |
| --- | --- | --- |
| `import.meta.env.VITE_SEPOLIA_RPC_URL` is `undefined` in the browser | Added `SEPOLIA_RPC_URL` only, without the `VITE_` mirror | Add BOTH secrets — Vite only inlines env vars prefixed with `VITE_` |
| `process.env.METAMASK_PRIVATE_KEY` undefined in Hardhat | Ran Hardhat outside the sandbox / without the secret injected | Ensure Hardhat runs inside `code--exec` where the secret env is available |
| Pinata upload 401 despite valid JWT | Full-account JWT expired, or JWT missing `pinFileToIPFS` scope | Recreate scoped JWT |
