#!/usr/bin/env python3
"""Rewrite the `megaPrompt` field on every idea to fit the 5-credit Lovable budget.

Reads each src/data/ideas/<theme>.json, keeps title/pitch/subDiscipline/quantum*
intact, and replaces megaPrompt with a tight, copy-pasteable build prompt.

No API calls. Idempotent.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
THEMES = json.loads((DATA / "themes.json").read_text())

CREDIT = ("Built during the Creative AI & Quantum Hackathon organised by "
          "StreetKode Fam during Indian Krump Festival 14")

SECRETS = """REQUIRED SECRETS (Lovable -> Project Settings -> Secrets):
- METAMASK_PRIVATE_KEY  Sepolia deployer key. Fund it: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- SEPOLIA_RPC_URL       Alchemy Sepolia HTTPS endpoint (https://eth-sepolia.g.alchemy.com/v2/<key>). Create a free app at https://dashboard.alchemy.com/ -> copy the HTTPS URL. Public RPCs throttle/fail under hackathon load — Alchemy is required.
- ETHERSCAN_API_KEY     For `npx hardhat verify`. Get: https://etherscan.io/myapikey
- PRIVY_APP_ID          Google sign-in + sponsored tx. Docs: https://docs.privy.io/llms-full.txt
- PINATA_JWT            IPFS uploads (only if app pins media). Docs: https://docs.pinata.cloud/llms-full.txt"""

BUDGET = """5-CREDIT BUDGET (HARD LIMIT):
- ONE single-page app. No router, no Lovable Cloud, no database, no auth flows beyond Privy drop-in.
- ONE Solidity contract, <=80 lines, deployed to Sepolia, verified on Etherscan.
- Privy is always the auth + sponsored-tx layer (Google login, embedded wallet).
- Pinata/IPFS only if the idea genuinely needs to store a file or metadata.
- At most ONE AI call per user action (use Lovable AI Gateway with LOVABLE_API_KEY if AI is part of the idea).
- Skip tests, skip CI, skip docs pages. Ship the demo, nothing else."""

def safe_name(title: str, fallback: str) -> str:
    return re.sub(r"[^A-Za-z0-9]", "", title)[:36] or fallback

def contract_log(title: str, pitch: str) -> str:
    n = safe_name(title, "Provenance")
    return f"""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// @title {n}
/// @notice {pitch}
/// @notice {CREDIT}
contract {n} {{
    event Logged(address indexed author, string cid, uint256 at);
    /// @notice {CREDIT}
    function log(string calldata cid) external {{
        emit Logged(msg.sender, cid, block.timestamp);
    }}
}}"""

def contract_nft(title: str, pitch: str) -> str:
    n = safe_name(title, "ProvenanceNFT")
    sym = (n[:6] or "PROV").upper()
    return f"""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
/// @title {n}
/// @notice ERC-721 provenance for: {pitch}
/// @notice {CREDIT}
contract {n} is ERC721 {{
    uint256 public nextId;
    mapping(uint256 => string) public cidOf;
    constructor() ERC721("{n}", "{sym}") {{}}
    /// @notice {CREDIT}
    function mint(string calldata cid) external returns (uint256 id) {{
        id = ++nextId; cidOf[id] = cid; _safeMint(msg.sender, id);
    }}
    function tokenURI(uint256 id) public view override returns (string memory) {{
        return string(abi.encodePacked("ipfs://", cidOf[id]));
    }}
}}"""

def needs_ipfs(hook_id: str) -> bool:
    return hook_id in ("ipfs-pinata", "nft-provenance")

def make_prompt(idea: dict, theme: dict) -> str:
    title = idea["title"]; pitch = idea["pitch"]; sub = idea["subDiscipline"]
    hid = idea.get("quantumHookId") or idea.get("chainHookId") or "sepolia-deploy"
    hook_name = idea.get("quantumHook") or "Sepolia smart contract"
    rationale = idea.get("quantumRationale") or ""

    if hid == "nft-provenance":
        contract = contract_nft(title, pitch)
        action = (f"After the user creates a {sub} artefact, pin the file to IPFS via Pinata, "
                  f"then call `mint(cid)` on the deployed contract through Privy's sponsored transaction. "
                  f"Show tokenId, IPFS preview (`https://gateway.pinata.cloud/ipfs/<cid>`), and Etherscan mint-tx link.")
    elif hid == "ipfs-pinata":
        contract = contract_log("CIDLog" + safe_name(title, "Idea"), pitch)
        action = (f"On submit, pin the {sub} artefact to Pinata, then call `log(cid)` on the contract via Privy sponsored tx. "
                  f"Render the CID, IPFS gateway preview, and Etherscan tx link.")
    elif hid == "privy-social":
        contract = contract_log("SocialLog" + safe_name(title, "Idea"), pitch)
        action = (f"Every {sub} action the user performs is sent as a sponsored Sepolia tx (`log(payload)`) "
                  f"and displayed with an Etherscan link. No wallet popups.")
    else:  # sepolia-deploy
        contract = contract_log(title, pitch)
        action = (f"User performs a {sub} action; the app calls `log(payload)` on the contract via Privy sponsored tx "
                  f"and shows the Etherscan link as proof.")

    ipfs_step = ("- src/lib/pinata.ts uploads via `fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', "
                 "{ method:'POST', headers:{ Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}` }, body: fd })`.\n"
                 if needs_ipfs(hid) else "")

    return f"""Build "{title}" in ONE Lovable message. Single-page demo.

CONCEPT
{pitch}
Discipline: {theme['name']} ({sub}).
Onchain primitive: {hook_name}. Why this primitive: {rationale}

{BUDGET}

STACK
- React + Vite single page (the index route).
- SSR-safe Privy mount is mandatory. Never import @privy-io/react-auth at
  module scope of a route file — it crashes SSR. Use
  lazy(() => import('./privy-client-entry')) inside <ClientOnly> + <Suspense>,
  and put <PrivyProvider> only inside privy-client-entry.tsx.
- PrivyProvider config (do NOT stub defaultChain as {{ id, name }} — omit it
  or pass viem's `sepolia`; chainId is passed per-call):
    <PrivyProvider appId={{import.meta.env.VITE_PRIVY_APP_ID}}
      config={{{{ loginMethods:['google','email'],
                embeddedWallets:{{ ethereum:{{ createOnLogin:'users-without-wallets' }} }},
                appearance:{{ theme:'dark' }} }}}}>
- Read the embedded wallet from useWallets, not user.wallet:
    const embedded = wallets.find(w => w.walletClientType === 'privy');
- Every send goes through Privy `useSendTransaction` with BOTH `address`
  and `sponsor`, wrapped in a 45s Promise.race timeout whose reject message
  names the exact dashboard toggles:
    await Promise.race([
      sendTransaction(
        {{ to, data, chainId: 11155111 }},
        {{ address: embedded.address, sponsor: true }}
      ),
      new Promise((_, r) => setTimeout(() => r(new Error(
        "Privy sendTransaction timed out after 45s. Enable Gas sponsorship -> App pays -> Ethereum Sepolia -> Allow transactions from the client."
      )), 45_000)),
    ]);
- Do NOT pass uiOptions:{{ showWalletUIs:false }} — it aborts with
  "signal is aborted without reason". The approval sheet still shows on
  the embedded-EOA path; the fee reads US$0.00.
- Do NOT add ZeroDev / SmartWalletsProvider / a paymaster URL. Native
  Privy sponsorship on Sepolia works with the toggles above and nothing else.
- DASHBOARD PREREQUISITE (one-time): Privy dashboard -> Gas sponsorship
  -> App pays -> add "Ethereum Sepolia" -> toggle "Allow transactions
  from the client" ON. Without this, sendTransaction hangs silently.
{ipfs_step}- Hardhat in /contracts (kept outside the Vite bundle). Install
  `@nomicfoundation/hardhat-toolbox` AND `@nomicfoundation/hardhat-verify@latest`
  (>=3.x — older versions still hit Etherscan v1 and fail with
  "You are using a deprecated V1 endpoint, switch to Etherscan API V2").
- hardhat.config.cjs MUST use the Etherscan v2 single-key shape (NOT the per-network map):
    require("@nomicfoundation/hardhat-toolbox");
    require("@nomicfoundation/hardhat-verify");
    module.exports = {{
      solidity: {{ version: "0.8.24", settings: {{ optimizer: {{ enabled: true, runs: 200 }} }} }},
      networks: {{ sepolia: {{
        url: process.env.SEPOLIA_RPC_URL,                       // Alchemy HTTPS endpoint, REQUIRED
        accounts: [process.env.METAMASK_PRIVATE_KEY.startsWith("0x")
          ? process.env.METAMASK_PRIVATE_KEY : "0x" + process.env.METAMASK_PRIVATE_KEY],
        chainId: 11155111,
      }} }},
      etherscan: {{ apiKey: process.env.ETHERSCAN_API_KEY }},   // single string, NOT {{ sepolia: ... }}
      sourcify: {{ enabled: false }},                            // silences the v2.x prompt
    }};
- Deploy: `npx hardhat run scripts/deploy.cjs --network sepolia`.
- Verify (run RIGHT AFTER deploy, no constructor args for these contracts):
  `npx hardhat verify --network sepolia <address>`
  On success Etherscan returns "Successfully verified contract … on the block explorer"
  and the source becomes readable at
  `https://sepolia.etherscan.io/address/<address>#code`.
- Frontend reads: create a viem public client with the Alchemy URL too —
  `createPublicClient({{ chain: sepolia, transport: http(import.meta.env.VITE_SEPOLIA_RPC_URL) }})`.
  Expose SEPOLIA_RPC_URL to the client by also setting VITE_SEPOLIA_RPC_URL to the same value.
- Write the deployed address to `src/data/contract.json` so the UI links to
  `https://sepolia.etherscan.io/address/<address>`.

CONTRACT (contracts/{safe_name(title,'Provenance')}.sol):
```solidity
{contract}
```

USER FLOW
1. Land on page -> 'Sign in with Google' (Privy) -> embedded wallet auto-provisioned.
2. {action}
3. Footer renders: "{CREDIT}"

{SECRETS}

CREDIT (must appear in UI footer AND as NatSpec on every deployed contract):
{CREDIT}
"""

def main():
    total = 0
    for t in THEMES:
        p = DATA / f"{t['slug']}.json"
        doc = json.loads(p.read_text())
        for idea in doc["ideas"]:
            idea["megaPrompt"] = make_prompt(idea, t)
            total += 1
        p.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
        print(f"  {t['slug']}: {len(doc['ideas'])} prompts rewritten")
    print(f"total: {total}")

if __name__ == "__main__":
    main()
