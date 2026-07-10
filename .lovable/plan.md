## Where you are

Proof server is running locally — `curl http://localhost:6300/health` returned `{"status":"ok"}`. That completes steps 1–2 of the `/proof-server` checklist.

## What to do next

### 3. Fund your preprod wallet with tDUST
1. Open the **Wallet** page in this app and copy your preprod address (starts with `mn_addr_preprod1…`).
2. Go to the **preprod faucet** → `midnight-tmnight-preprod.nethermind.dev`, paste the address, request **tNIGHT**.
3. Open **Lace** (Midnight preview extension), switch to Preprod, and use **Generate tDUST** to convert tNIGHT → tDUST. Deploys spend tDUST, not tNIGHT.
4. Confirm the balance shows up on the Wallet page (Preproduction Midnight Explorer link should also show the funded address).

### 4. Deploy `TimestampLog.compact`
In a terminal at the project root, with Docker + proof server still running:

```bash
chmod 600 .midnight-wallet.local
bun scripts/deploy-midnight.mjs
```

The script will:
- Read your wallet seed from `.midnight-wallet.local`
- Talk to the local proof server on `localhost:6300` to generate the ZK proof
- Submit the deploy tx to preprod
- Write the resulting contract address into `midnight-contract.json`

### 5. Verify on-chain
- Copy the contract address from `midnight-contract.json`.
- Paste it into `preprod.midnightexplorer.com` (the Preproduction explorer link already in the Wallet page).
- Confirm the deploy tx is finalized.

### 6. Wire it back into the site
Once `midnight-contract.json` exists, tell me and I'll load that address in the UI so the app reads/writes against your live contract.

## If something fails
- **`insufficient tDUST`** → step 3 didn't complete; tNIGHT ≠ tDUST, you must run Generate tDUST in Lace.
- **`ECONNREFUSED 127.0.0.1:6300`** → Docker container stopped; `docker start midnight-proof-server`.
- **Proof takes 30–90s** → normal for the first proof while the container warms.

Want me to also add a small "Deploy status" panel on `/proof-server` that reads `midnight-contract.json` and shows the deployed address + explorer link once it exists?
