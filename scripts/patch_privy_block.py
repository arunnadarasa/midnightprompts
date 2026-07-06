#!/usr/bin/env python3
"""In-place patch the Privy STACK block inside every megaPrompt across all
theme JSONs. Idempotent: files without the old block are skipped."""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"

OLD = """- Privy embedded wallet wraps `<App />` in src/main.tsx:
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{ loginMethods:['google'], embeddedWallets:{createOnLogin:'users-without-wallets'},
                defaultChain:{ id: 11155111, name:'Sepolia' } }}>
- All txs via Privy `useSendTransaction` with `{ sponsor: true }` (zero-gas for the user)."""

NEW = """- SSR-safe Privy mount is mandatory. Never import @privy-io/react-auth at
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
  from the client" ON. Without this, sendTransaction hangs silently."""

THEMES = ["dance","music","visual-art","video","photography","writing",
          "film-animation","games","theater","fashion"]

total_patched = 0
for slug in THEMES:
    p = DATA / f"{slug}.json"
    doc = json.loads(p.read_text())
    n = 0
    for idea in doc["ideas"]:
        mp = idea.get("megaPrompt","")
        if OLD in mp:
            idea["megaPrompt"] = mp.replace(OLD, NEW)
            n += 1
    p.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
    print(f"  {slug}: {n}/{len(doc['ideas'])} patched")
    total_patched += n
print(f"total patched: {total_patched}")
