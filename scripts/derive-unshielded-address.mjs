#!/usr/bin/env bun
/**
 * Derive a Midnight UNSHIELDED address (mn_addr_preprod… / mn_addr_preview…)
 * from the 12/24-word mnemonic stored in the MIDNIGHT_WALLET_SEED env var.
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
import { createKeystore } from "@midnight-ntwrk/wallet-sdk";
import { ShieldedAddress, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey } from "@midnight-ntwrk/wallet-sdk-address-format";
import * as ledger from "@midnight-ntwrk/ledger-v8";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(ROOT, "src/data/midnight-wallet.json");

const mnemonic = process.env.MIDNIGHT_WALLET_SEED;
const wordCount = mnemonic?.trim().split(/\s+/).filter(Boolean).length ?? 0;
if (![12, 15, 18, 21, 24].includes(wordCount)) {
  console.error("MIDNIGHT_WALLET_SEED env var missing or not a valid BIP-39 word count.");
  process.exit(1);
}

// Midnight bech32m network suffix. preprod → "preprod", Preview → "preview",
// DevNet → "dev", Undeployed → "undeployed", MainNet → "" (no suffix).
// Override with --network=<suffix> or MIDNIGHT_NETWORK env var.
const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, v = "true"] = a.slice(2).split("=");
    return [k, v];
  }),
);
const requestedNetwork = args.network ?? process.env.MIDNIGHT_NETWORK ?? "preprod";
const NETWORK_SUFFIX = requestedNetwork === "test" || requestedNetwork === "testnet" ? "preview" : requestedNetwork;
const NETWORK_LABEL = NETWORK_SUFFIX || "mainnet";

const seeds = WalletSeeds.fromMnemonic(mnemonic.trim());
const keystore = createKeystore(seeds.unshielded, NETWORK_SUFFIX === "mainnet" ? "" : NETWORK_SUFFIX);
const unshieldedAddress = keystore.getBech32Address().asString();

// Also derive the shielded address for the same seed at the correct network,
// so both addresses in the JSON refer to the same wallet on preprod.
const shieldedKeys = ledger.ZswapSecretKeys.fromSeed(new Uint8Array(seeds.shielded));
const shieldedAddrObj = new ShieldedAddress(
  new ShieldedCoinPublicKey(Buffer.from(shieldedKeys.coinPublicKey, "hex")),
  new ShieldedEncryptionPublicKey(Buffer.from(shieldedKeys.encryptionPublicKey, "hex")),
);
const shieldedAddress = ShieldedAddress.codec.encode(NETWORK_SUFFIX === "mainnet" ? null : NETWORK_SUFFIX, shieldedAddrObj).asString();

console.error(`[derive] network:            ${NETWORK_LABEL} (suffix="${NETWORK_SUFFIX}")`);
console.error("[derive] unshielded address:", unshieldedAddress);
console.error("[derive] shielded address:  ", shieldedAddress);
const expectedPrefix = NETWORK_SUFFIX === "mainnet" ? "mn_addr1" : `mn_addr_${NETWORK_SUFFIX}1`;
if (!unshieldedAddress.startsWith(expectedPrefix)) {
  console.error("[derive] WARNING: unexpected unshielded prefix:", unshieldedAddress.slice(0, 24));
}
const expectedShieldedPrefix = NETWORK_SUFFIX === "mainnet" ? "mn_shield-addr1" : `mn_shield-addr_${NETWORK_SUFFIX}1`;
if (!shieldedAddress.startsWith(expectedShieldedPrefix)) {
  console.error("[derive] WARNING: unexpected shielded prefix:", shieldedAddress.slice(0, 32));
}

const OUT = args.out ? path.resolve(ROOT, args.out) : DEFAULT_OUT;
const existing = fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT, "utf8"))
  : {};

const faucetByNetwork = {
  preprod: "https://midnight-tmnight-preprod.nethermind.dev/",
  preview: "https://midnight-tmnight-preview.nethermind.dev/",
};

const payload = {
  network: NETWORK_LABEL,
  shieldedAddress,
  unshieldedAddress,
  createdAt: existing.createdAt ?? new Date().toISOString(),
  faucet:
    existing.faucet ?? faucetByNetwork[NETWORK_SUFFIX] ?? faucetByNetwork.preprod,
  docs: "https://docs.midnight.network/guides/acquire-tokens",
  faucetNote:
    `Paste the unshieldedAddress into the ${NETWORK_LABEL} faucet to receive tNIGHT. Then delegate tNIGHT → tDUST in Lace before deploying.`,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.error("[derive] wrote", path.relative(ROOT, OUT));

// stdout: just the address (safe to echo — public).
process.stdout.write(unshieldedAddress + "\n");
