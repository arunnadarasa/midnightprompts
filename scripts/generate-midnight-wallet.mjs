#!/usr/bin/env bun
/**
 * Generate a Midnight preprod wallet inside the Lovable sandbox.
 *
 * - Creates a fresh 24-word BIP-39 mnemonic.
 * - Derives Lace-compatible shielded + unshielded preprod addresses offline.
 * - Prints the mnemonic ONCE to stdout so the harness can capture it and
 *   store it as the MIDNIGHT_WALLET_SEED secret (never echoed to chat).
 * - Writes the public address + metadata to src/data/midnight-wallet.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMnemonic } from "bip39";
import { WalletSeeds } from "@midnight-ntwrk/testkit-js";
import { createKeystore } from "@midnight-ntwrk/wallet-sdk";
import { ShieldedAddress, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey } from "@midnight-ntwrk/wallet-sdk-address-format";
import * as ledger from "@midnight-ntwrk/ledger-v8";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/data/midnight-wallet.json");

const NETWORK_SUFFIX = "preprod";
const FAUCET = "https://midnight-tmnight-preprod.nethermind.dev/";

const mnemonic = generateMnemonic(256);
const seeds = WalletSeeds.fromMnemonic(mnemonic);
const keystore = createKeystore(seeds.unshielded, NETWORK_SUFFIX);
const shieldedKeys = ledger.ZswapSecretKeys.fromSeed(new Uint8Array(seeds.shielded));
const shieldedAddrObj = new ShieldedAddress(
  new ShieldedCoinPublicKey(Buffer.from(shieldedKeys.coinPublicKey, "hex")),
  new ShieldedEncryptionPublicKey(Buffer.from(shieldedKeys.encryptionPublicKey, "hex")),
);
const shieldedAddress = ShieldedAddress.codec.encode(NETWORK_SUFFIX, shieldedAddrObj).asString();
const unshieldedAddress = keystore.getBech32Address().asString();
console.error("[gen] derived shielded address:", shieldedAddress);
console.error("[gen] derived unshielded address:", unshieldedAddress);

const payload = {
  network: "preprod",
  shieldedAddress,
  unshieldedAddress,
  createdAt: new Date().toISOString(),
  faucet: FAUCET,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.error("[gen] wrote", path.relative(ROOT, OUT));

// The ONLY line on stdout — captured by the harness to store as a secret.
process.stdout.write(`MNEMONIC=${mnemonic}\n`);
process.exit(0);
