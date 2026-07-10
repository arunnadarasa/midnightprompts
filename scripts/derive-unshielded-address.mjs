#!/usr/bin/env bun
/**
 * Derive the Midnight preprod UNSHIELDED address (mn_addr_test1…) from the
 * 24-word mnemonic stored in the MIDNIGHT_WALLET_SEED env var.
 *
 * Deterministic and offline — no Indexer, RPC, or proof server required.
 * Uses @midnight-ntwrk/testkit-js's WalletSeeds + wallet-sdk's createKeystore,
 * the same code path testkit's DAppConnectorWalletAdapter.getUnshieldedAddress()
 * uses, which in turn matches what Lace produces from the same seed.
 *
 * Writes both shielded + unshielded addresses to src/data/midnight-wallet.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WalletSeeds } from "@midnight-ntwrk/testkit-js";
import { createKeystore, NetworkId } from "@midnight-ntwrk/wallet-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/data/midnight-wallet.json");

const mnemonic = process.env.MIDNIGHT_WALLET_SEED;
if (!mnemonic || mnemonic.trim().split(/\s+/).length !== 24) {
  console.error("MIDNIGHT_WALLET_SEED env var missing or not 24 words.");
  process.exit(1);
}

const seeds = WalletSeeds.fromMnemonic(mnemonic.trim());
const keystore = createKeystore(seeds.unshielded, NetworkId.TestNet);
const unshieldedAddress = keystore.getBech32Address().asString();

console.error("[derive] unshielded address:", unshieldedAddress);
if (!unshieldedAddress.startsWith("mn_addr_test1")) {
  console.error(
    "[derive] WARNING: unexpected prefix. Got:",
    unshieldedAddress.slice(0, 20),
  );
}

const existing = fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT, "utf8"))
  : {};
const shieldedAddress =
  existing.shieldedAddress ?? existing.address ?? null;

const payload = {
  network: "preprod",
  shieldedAddress,
  unshieldedAddress,
  createdAt: existing.createdAt ?? new Date().toISOString(),
  faucet:
    existing.faucet ?? "https://midnight-tmnight-preprod.nethermind.dev/",
  docs: "https://docs.midnight.network/guides/acquire-tokens",
  faucetNote:
    "Paste the unshieldedAddress into the preprod faucet to receive tNIGHT. Then delegate tNIGHT → tDUST in Lace before deploying.",
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.error("[derive] wrote", path.relative(ROOT, OUT));

// stdout: just the address (safe to echo — public).
process.stdout.write(unshieldedAddress + "\n");
