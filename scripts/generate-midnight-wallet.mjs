#!/usr/bin/env bun
/**
 * Generate a Midnight preprod wallet inside the Lovable sandbox.
 *
 * - Creates a fresh 24-word BIP-39 mnemonic.
 * - Builds a Midnight wallet against the preprod Indexer to derive the
 *   Bech32m-encoded shielded address (`mn_shield-…preprod1…`).
 * - Prints the mnemonic ONCE to stdout so the harness can capture it and
 *   store it as the MIDNIGHT_WALLET_SEED secret (never echoed to chat).
 * - Writes the public address + metadata to src/data/midnight-wallet.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { NetworkId } from "@midnight-ntwrk/zswap";
import { firstValueFrom, filter } from "rxjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/data/midnight-wallet.json");

const NETWORK_ID = "TestNet"; // preprod runs the TestNet network id
const INDEXER_HTTP = "https://indexer.preprod.midnight.network/api/v4/graphql";
const INDEXER_WS = "wss://indexer.preprod.midnight.network/api/v4/graphql/ws";
const NODE_RPC = "https://rpc.preprod.midnight.network";
const PROOF_SERVER = "http://localhost:6300"; // not contacted for address derivation
const FAUCET = "https://cloud.google.com/application/web3/faucet/midnight/testnet";

const mnemonic = generateMnemonic(256);
const seedHex = mnemonicToSeedSync(mnemonic).toString("hex").slice(0, 64);

console.error("[gen] building wallet to derive shielded address…");
const wallet = await WalletBuilder.buildFromSeed(
  INDEXER_HTTP,
  INDEXER_WS,
  PROOF_SERVER,
  NODE_RPC,
  seedHex,
  NETWORK_ID,
  "error",
);
wallet.start();

const state = await firstValueFrom(
  wallet.state().pipe(filter((s) => Boolean(s && s.address))),
);
const address = state.address;
console.error("[gen] derived address:", address);

await wallet.close();

const payload = {
  network: "preprod",
  address,
  createdAt: new Date().toISOString(),
  faucet: FAUCET,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.error("[gen] wrote", path.relative(ROOT, OUT));

// The ONLY line on stdout — captured by the harness to store as a secret.
process.stdout.write(`MNEMONIC=${mnemonic}\n`);
process.exit(0);
