#!/usr/bin/env bun
/**
 * Local-only Midnight wallet sanity check.
 *
 * Never paste recovery words into chat. Run this on your own computer with the
 * phrase in MIDNIGHT_WALLET_SEED or in .midnight-wallet.local. This script only
 * prints public addresses and key fingerprints; it never prints the phrase.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WalletSeeds } from "@midnight-ntwrk/testkit-js";
import { createKeystore } from "@midnight-ntwrk/wallet-sdk";
import {
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from "@midnight-ntwrk/wallet-sdk-address-format";
import * as ledger from "@midnight-ntwrk/ledger-v8";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, ".midnight-wallet.local");

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v = "true"] = a.slice(2).split("=");
      return [k, v];
    }),
);

function normalizeNetwork(input) {
  switch (input) {
    case undefined:
    case "preview":
      return "preview";
    case "preprod":
    case "undeployed":
    case "mainnet":
      return input;
    case "test":
    case "testnet":
      return "preview";
    default:
      console.error(`Unknown --network=${input}. Use preview, preprod, undeployed, or mainnet.`);
      process.exit(1);
  }
}

function readMnemonic() {
  const mnemonic = process.env.MIDNIGHT_WALLET_SEED ?? (fs.existsSync(SEED_FILE) ? fs.readFileSync(SEED_FILE, "utf8") : "");
  const words = mnemonic.trim().split(/\s+/).filter(Boolean);
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    console.error("No valid BIP-39 phrase found. Set MIDNIGHT_WALLET_SEED or create .midnight-wallet.local.");
    console.error("Example: MIDNIGHT_WALLET_SEED=\"...\" bun scripts/check-midnight-wallet.mjs --network=preview");
    process.exit(1);
  }
  return words.join(" ");
}

function prefix(kind, network) {
  const suffix = network === "mainnet" ? null : network;
  if (kind === "unshielded") return suffix ? `mn_addr_${suffix}1` : "mn_addr1";
  if (kind === "shielded") return suffix ? `mn_shield-addr_${suffix}1` : "mn_shield-addr1";
  return "";
}

function deriveForNetwork(mnemonic, network) {
  const suffix = network === "mainnet" ? null : network;
  const seeds = WalletSeeds.fromMnemonic(mnemonic);
  const keystore = createKeystore(seeds.unshielded, suffix ?? "");
  const keys = ledger.ZswapSecretKeys.fromSeed(new Uint8Array(seeds.shielded));
  const coinPublicKey = new ShieldedCoinPublicKey(Buffer.from(keys.coinPublicKey, "hex"));
  const encryptionPublicKey = new ShieldedEncryptionPublicKey(Buffer.from(keys.encryptionPublicKey, "hex"));
  const shieldedAddress = ShieldedAddress.codec
    .encode(suffix, new ShieldedAddress(coinPublicKey, encryptionPublicKey))
    .asString();

  return {
    network,
    unshieldedAddress: keystore.getBech32Address().asString(),
    shieldedAddress,
    coinPublicKeyFingerprint: `${keys.coinPublicKey.slice(0, 10)}…${keys.coinPublicKey.slice(-10)}`,
    encryptionPublicKeyFingerprint: `${keys.encryptionPublicKey.slice(0, 10)}…${keys.encryptionPublicKey.slice(-10)}`,
  };
}

const primaryNetwork = normalizeNetwork(args.network ?? process.env.MIDNIGHT_NETWORK ?? "preview");
const mnemonic = readMnemonic();
const networks = args.all === "true" ? ["preview", "preprod"] : [primaryNetwork];

console.log("[midnight-check] Recovery phrase loaded locally; phrase will not be printed.");
for (const network of networks) {
  const result = deriveForNetwork(mnemonic, network);
  console.log("");
  console.log(`[midnight-check] ${network}`);
  console.log(`  unshielded: ${result.unshieldedAddress}`);
  console.log(`  shielded:   ${result.shieldedAddress}`);
  console.log(`  cpk:        ${result.coinPublicKeyFingerprint}`);
  console.log(`  epk:        ${result.encryptionPublicKeyFingerprint}`);

  const unshieldedOk = result.unshieldedAddress.startsWith(prefix("unshielded", network));
  const shieldedOk = result.shieldedAddress.startsWith(prefix("shielded", network));
  if (!unshieldedOk || !shieldedOk) {
    console.error(`  WARNING: address prefix mismatch for ${network}. Do not fund this wallet yet.`);
    process.exitCode = 1;
  }
}

console.log("");
console.log("Compare the public addresses above with Lace. If both match, the deploy script should use the same wallet.");