# Hardhat deploy + Etherscan verify on Sepolia

Sepolia chain id: **11155111**. Explorer: `https://sepolia.etherscan.io`.
Etherscan v2 covers Sepolia — one `ETHERSCAN_API_KEY` works across all
supported chains via the `chainid` URL query parameter.

## `hardhat.config.cjs`

```js
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify"); // >=3.x

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [
        process.env.METAMASK_PRIVATE_KEY.startsWith("0x")
          ? process.env.METAMASK_PRIVATE_KEY
          : "0x" + process.env.METAMASK_PRIVATE_KEY,
      ],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: { sepolia: process.env.ETHERSCAN_API_KEY },
  },
  sourcify: { enabled: false },
};
```

## Deploy script (`scripts/deploy.cjs`)

```js
const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("ChoreoLedger");
  const c = await Contract.deploy(/* constructor args */);
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log("Deployed:", addr);
  console.log("Tx:", c.deploymentTransaction().hash);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Run:

```
npx hardhat run scripts/deploy.cjs --network sepolia
```

Persist to `src/data/contract.json`:

```json
{
  "address": "0x…",
  "deployTx": "0x…",
  "chainId": 11155111,
  "network": "Sepolia",
  "explorer": "https://sepolia.etherscan.io"
}
```

## Verify (CLI path — try first)

```
npx hardhat verify --network sepolia <address>
# with constructor args:
npx hardhat verify --network sepolia <address> "arg1" "arg2"
```

CLI verification usually takes ~10-15s. Blockscout/Sourcify is disabled
above because it's not needed and its failures pollute the output.

## Verify (curl fallback — Etherscan v2)

Use when the CLI complains about compiler version, or when you have a
flattened source blob to submit directly.

```bash
curl "https://api.etherscan.io/v2/api?chainid=11155111" \
  --data-urlencode "module=contract" \
  --data-urlencode "action=verifysourcecode" \
  --data-urlencode "contractaddress=0x…" \
  --data-urlencode "sourceCode=$(cat MyContract.flat.sol)" \
  --data-urlencode "codeformat=solidity-single-file" \
  --data-urlencode "contractname=MyContract" \
  --data-urlencode "compilerversion=v0.8.28+commit.7893614a" \
  --data-urlencode "optimizationUsed=1" \
  --data-urlencode "runs=200" \
  --data-urlencode "licenseType=3" \
  --data-urlencode "apikey=$ETHERSCAN_API_KEY"
```

Returns `{ "status": "1", "result": "<guid>" }`. Poll:

```bash
curl "https://api.etherscan.io/v2/api?chainid=11155111&module=contract&action=checkverifystatus&guid=<guid>&apikey=$ETHERSCAN_API_KEY"
```

Until `"Pass - Verified"`.

## Common failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Missing or unsupported chainid parameter` | Put `chainid` in POST body instead of URL query | Move `chainid=11155111` into the URL |
| `insufficient funds` on deploy | Deployer EOA not funded | Faucet: `https://sepoliafaucet.com` (Alchemy) or `https://www.infura.io/faucet/sepolia` |
| `compiler version mismatch` | Passed `"0.8.28"` instead of the full commit string | Use canonical `v0.8.28+commit.7893614a` (see `https://etherscan.io/solcversions`) |
| `Bytecode does not match` on verify | Optimizer settings differ between deploy and verify | Match `runs` + `enabled` in both places |
| Verify succeeds but page still shows "Not Verified" | Explorer index lag | Wait ~30-60s; hard-refresh |

## Compile + deploy in the Lovable sandbox (no local toolchain)

Same pattern as the avalanche skill — install `solc` + `viem` on demand,
compile from a heredoc, sign+deploy with `viem`, then verify via the curl
above. Full script in `lovable-avalanche-x402/references` — swap
`avalancheFuji` for `sepolia` from `viem/chains` and `chainid=43113` for
`chainid=11155111`.
