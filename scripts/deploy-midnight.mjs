#!/usr/bin/env bun
/**
 * scripts/deploy-midnight.mjs
 *
 * Two-phase LOCAL deploy for contracts/TimestampLog.compact against Midnight Preprod.
 *
 * WHERE TO RUN THIS: on your own machine. NOT in the Lovable sandbox — the sandbox
 * has no Docker daemon, and Midnight's proof server is only distributed as a
 * Docker image (midnightntwrk/proof-server). Phase 2 fails without it.
 *
 * PHASE 1 (no seed / no funds yet):
 *   bun scripts/deploy-midnight.mjs
 *     → generates a 24-word BIP-39 mnemonic
 *     → writes it to .midnight-wallet.local (gitignored) so re-runs reuse it
 *     → derives the Midnight shielded address and prints it
 *     → exits: "Fund this address, then re-run"
 *
 * PHASE 2 (after tDUST lands, ~30s post-faucet):
 *   docker run -d -p 6300:6300 midnightntwrk/proof-server:latest \
 *     midnight-proof-server -v
 *   bun scripts/deploy-midnight.mjs
 *     → syncs the wallet against the preprod Indexer, checks balance
 *     → calls deployContract(TimestampLog) via midnight-js-contracts
 *     → writes hex address + deploy tx into src/data/midnight-contract.json
 *     → verifies by GraphQL: contractAction(address){state}
 *     → prints MidnightScan URL
 *
 * See scripts/deploy-midnight.README.md for the full walkthrough.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, ".midnight-wallet.local");
const CONTRACT_JSON = path.join(ROOT, "src/data/midnight-contract.json");
const MANAGED = path.join(ROOT, "contracts/managed/timestamp-log");

const NETWORK_ID = process.env.VITE_NETWORK_ID ?? "preprod";
const INDEXER_HTTP =
  process.env.VITE_INDEXER_URL ??
  "https://indexer.preprod.midnight.network/api/v4/graphql";
const INDEXER_WS =
  process.env.VITE_INDEXER_WS_URL ??
  "wss://indexer.preprod.midnight.network/api/v4/graphql/ws";
const NODE_RPC = process.env.VITE_NODE_RPC ?? "https://rpc.preprod.midnight.network";
const PROOF_SERVER = process.env.VITE_PROOF_SERVER_URL ?? "http://localhost:6300";
const FAUCET = "https://midnight-tmnight-preprod.nethermind.dev/";
const EXPLORER = "https://preprod.midnightexplorer.com";

function log(...a) {
  console.log("[midnight-deploy]", ...a);
}
function die(msg) {
  console.error("\n[midnight-deploy] FATAL:", msg, "\n");
  process.exit(1);
}

async function loadOrCreateSeed() {
  if (fs.existsSync(SEED_FILE)) {
    const mnemonic = fs.readFileSync(SEED_FILE, "utf8").trim();
    if (mnemonic.split(/\s+/).length !== 24) {
      die(`${SEED_FILE} exists but is not a 24-word BIP-39 mnemonic.`);
    }
    log("using existing wallet seed from .midnight-wallet.local");
    return { mnemonic, fresh: false };
  }
  const mnemonic = generateMnemonic(256); // 24 words
  fs.writeFileSync(SEED_FILE, mnemonic + "\n", { mode: 0o600 });
  log("generated new 24-word mnemonic → .midnight-wallet.local (0600, gitignored)");
  return { mnemonic, fresh: true };
}

async function buildWallet(mnemonic) {
  // Dynamic imports — these are heavy Node/WASM modules; keep them out of top-level scope so
  // Phase 1 (which doesn't need them) runs fast on a fresh checkout.
  const { WalletBuilder } = await import("@midnight-ntwrk/wallet");
  const { setNetworkId } = await import("@midnight-ntwrk/midnight-js-network-id");
  setNetworkId(NETWORK_ID);

  log(`building wallet for network=${NETWORK_ID}`);
  const wallet = await WalletBuilder.buildFromSeed(
    INDEXER_HTTP,
    INDEXER_WS,
    PROOF_SERVER,
    NODE_RPC,
    mnemonicToSeedSync(mnemonic).toString("hex"),
    NETWORK_ID,
  );
  wallet.start();
  return wallet;
}

async function currentAddressAndBalance(wallet) {
  return new Promise((resolve) => {
    const sub = wallet.state().subscribe((s) => {
      if (s.address) {
        sub.unsubscribe();
        resolve({
          address: s.address,
          balances: s.balances ?? {},
          syncProgress: s.syncProgress,
        });
      }
    });
  });
}

async function proofServerReachable() {
  try {
    const r = await fetch(PROOF_SERVER, { method: "GET" }).catch(() => null);
    return r !== null;
  } catch {
    return false;
  }
}

async function readIndexerState(address) {
  const r = await fetch(INDEXER_HTTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($a: HexEncoded!) { contractAction(address: $a) { state } }`,
      variables: { a: address },
    }),
  });
  const gql = await r.json();
  return gql.data?.contractAction?.state ?? null;
}

function loadContractModule() {
  const cjs = path.join(MANAGED, "contract/index.cjs");
  const js = path.join(MANAGED, "contract/index.js");
  const chosen = fs.existsSync(cjs) ? cjs : js;
  if (!fs.existsSync(chosen)) {
    die(
      `Compiled contract not found. Expected ${cjs} or ${js}. ` +
        `Run: compact compile contracts/TimestampLog.compact contracts/managed/timestamp-log`,
    );
  }
  return chosen;
}

async function main() {
  log("=== phase 1: wallet ===");
  const { mnemonic, fresh } = await loadOrCreateSeed();

  const wallet = await buildWallet(mnemonic);
  const info = await currentAddressAndBalance(wallet);
  const address = info.address;

  console.log("");
  console.log("  Shielded address (SDK-side, used for contract state):");
  console.log("  " + address);
  console.log("");
  console.log("  ⚠ The preprod faucet does NOT accept this shielded address.");
  console.log("    It only accepts an UNSHIELDED address (mn_addr_test1…),");
  console.log("    which is exposed by Lace — not by the wallet SDK.");
  console.log("    See: https://docs.midnight.network/guides/acquire-tokens");
  console.log("    Faucet: " + FAUCET);
  console.log("");

  const tdust = Number(info.balances?.tdust ?? info.balances?.[Object.keys(info.balances)[0]] ?? 0);
  log(`current tDUST balance: ${tdust}`);

  if (fresh || tdust < 1) {
    log("Not enough tDUST to deploy. Do this in Lace, not this script:");
    log(`  1. Install Lace, switch to Midnight preprod, import this 24-word seed`);
    log(`     (from .midnight-wallet.local) so it shares the same wallet.`);
    log(`  2. Copy Lace's Unshielded address (mn_addr_test1…).`);
    log(`  3. Paste into ${FAUCET} and click Request tokens (~2 min for 1000 tNIGHT).`);
    log(`  4. In Lace, click "Generate tDUST" to delegate tNIGHT → tDUST.`);
    log(`  5. Start the proof server:`);
    log(`     docker run -d -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`);
    log(`  6. Re-run: bun scripts/deploy-midnight.mjs`);
    await wallet.close?.();
    process.exit(0);
  }


  log("=== phase 2: deploy ===");
  if (!(await proofServerReachable())) {
    die(
      `Proof server not reachable at ${PROOF_SERVER}. Start it with:\n` +
        `  docker run -d -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v`,
    );
  }

  const contractPath = loadContractModule();
  log(`loading compiled contract from ${path.relative(ROOT, contractPath)}`);
  const contractMod = await import(contractPath);
  const Contract = contractMod.Contract ?? contractMod.default?.Contract;
  if (!Contract) die("Compiled contract module has no exported Contract class.");

  const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");
  const { FetchZkConfigProvider } = await import("@midnight-ntwrk/midnight-js-fetch-zk-config-provider");
  const { httpClientProofProvider } = await import("@midnight-ntwrk/midnight-js-http-client-proof-provider");
  const { indexerPublicDataProvider } = await import("@midnight-ntwrk/midnight-js-indexer-public-data-provider");

  const zkConfigProvider = new FetchZkConfigProvider(
    `file://${MANAGED}`,
    fetch,
  );
  const proofProvider = httpClientProofProvider(PROOF_SERVER, zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(INDEXER_HTTP, INDEXER_WS);

  // 32-byte witness secret persisted alongside the seed (used by localSecretKey witness).
  const witnessFile = path.join(ROOT, ".midnight-witness.local");
  let witnessHex;
  if (fs.existsSync(witnessFile)) {
    witnessHex = fs.readFileSync(witnessFile, "utf8").trim();
  } else {
    witnessHex = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    fs.writeFileSync(witnessFile, witnessHex + "\n", { mode: 0o600 });
    log("generated new witness key → .midnight-witness.local (0600, gitignored)");
  }
  const sk = Buffer.from(witnessHex, "hex");

  log("submitting deployContract — proving may take 30–120s…");
  const t0 = Date.now();
  const deployed = await deployContract(new Contract({ localSecretKey: async () => sk }), {
    privateStateProvider: {
      get: async () => null,
      set: async () => {},
    },
    zkConfigProvider,
    proofProvider,
    publicDataProvider,
    walletProvider: {
      coinPublicKey: address,
      balanceTx: async (tx) => wallet.balanceTransaction(tx),
    },
    midnightProvider: {
      submitTx: async (tx) => wallet.submitTransaction(tx),
    },
  });
  const contractAddress = deployed.deployTxData.public.contractAddress;
  const deployTx = deployed.deployTxData.public.txId;
  log(`deployed in ${(Date.now() - t0) / 1000}s`);
  log(`contract address: ${contractAddress}`);
  log(`deploy tx:        ${deployTx}`);

  // Verify by polling the Indexer for the contract state.
  log("verifying via Indexer (up to 90s)…");
  const deadline = Date.now() + 90_000;
  let stateHex = null;
  while (Date.now() < deadline) {
    stateHex = await readIndexerState(contractAddress);
    if (stateHex) break;
    await new Promise((r) => setTimeout(r, 3000));
  }

  const verified = Boolean(stateHex);
  log(verified ? "verified: Indexer returned state" : "verification pending: no state yet");

  const cfg = JSON.parse(fs.readFileSync(CONTRACT_JSON, "utf8"));
  cfg.address = contractAddress;
  cfg.deployTx = deployTx;
  cfg.deployedAt = new Date().toISOString();
  cfg.verified = verified;
  cfg.explorerTx = `${EXPLORER}/tx/${deployTx}`;
  cfg.explorerAddress = `${EXPLORER}/address/${contractAddress}`;
  fs.writeFileSync(CONTRACT_JSON, JSON.stringify(cfg, null, 2) + "\n");
  log(`updated ${path.relative(ROOT, CONTRACT_JSON)}`);
  log(`explorer: ${cfg.explorerAddress}`);

  await wallet.close?.();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
