## Next step: install script dependencies locally

The error means your fresh checkout hasn't installed npm packages yet. `bip39` (and the Midnight SDK packages the script dynamically imports) live in `package.json` but aren't on disk.

Run once, from the project root:

```bash
bun install
```

Then re-run:

```bash
VITE_NETWORK_ID=preview bun scripts/deploy-midnight.mjs
```

Expected phase‑1 output (with your Lace Mac Local seed in `.midnight-wallet.local`):

```
[midnight-deploy] === phase 1: wallet ===
[midnight-deploy] using existing wallet seed from .midnight-wallet.local
[midnight-deploy] derived (HD, matches Lace) unshielded: mn_addr_preview15sz5jgljxtnh5cfxxe3ekf8egx6rh2lk28zswtdxprsj2hv4yrwql85qg8
  Shielded address (SDK-side, used for contract state):
  mn_shield-addr_preview1m6wf639g7tswe9xryuu2d87n4jcgl7w2dgt25yyzfw8xjjk3zkf0k283g9vz6ygmsplkxwq5vxlnsujr0zfpr3knsxfhj3rgmzpydyqy03tws
```

If both addresses match what Lace shows for Mac Local on Preview, the script will detect your tDUST and move to phase 2 (which needs the Docker proof server running on `localhost:6300`).

## If it still errors after `bun install`

- `Cannot find package '@midnight-ntwrk/…'` → the SDK packages aren't pinned; tell me the exact package name and I'll add it to `package.json`.
- Addresses don't match Lace → paste the printed values and I'll diagnose (likely `.midnight-wallet.local` holds a different mnemonic than the Lace Mac Local seed).
- `Proof server not reachable at http://localhost:6300` → start Docker Desktop, then:
  ```bash
  docker run -d --name midnight-proof-server -p 6300:6300 \
    midnightntwrk/proof-server:latest midnight-proof-server -v
  ```

No code changes needed for this step.
