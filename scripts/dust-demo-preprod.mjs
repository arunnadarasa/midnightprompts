#!/usr/bin/env node
// Preprod-only DUST generation demo.
// Faithful port of the Midnight Foundation tutorial from
//   https://docs.midnight.network/guides/generating-dust-programmatically
// adapted to the packages already installed in this project
// (@midnight-ntwrk/wallet-sdk instead of the un-hyphenated variant used in the
// docs, and @midnight-ntwrk/ledger-v8 for the ledger primitives).
//
// What this script demonstrates:
//   1. Create a new wallet or restore an existing hex seed.
//   2. Print all three preprod addresses (shielded / unshielded / dust).
//   3. Wait for you to send tNIGHT from the preprod faucet.
//   4. REGISTER the NIGHT UTXOs for DUST generation — this is the step Lace
//      does implicitly when you click "Generate tDUST", and the step the
//      existing deploy-midnight.mjs script assumes is already done.
//   5. Poll state.dust.availableCoins.length >= 1 (the correct readiness
//      signal — balance alone is not spendable).
//
// Wallet seed is written to .midnight-wallet-preprod-demo.local (0600,
// gitignored). This wallet is intentionally separate from the deploy flow's
// mnemonic-based wallet — treat it as a scratch demo wallet.
//
// Usage:  bun scripts/dust-demo-preprod.mjs

import { WebSocket } from "ws";
globalThis.WebSocket = WebSocket;

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as Rx from "rxjs";
import { fileURLToPath } from "url";
import { Buffer } from "buffer";

import {
  HDWallet,
  Roles,
  generateRandomSeed,
  WalletFacade,
  ShieldedWallet,
  DustWallet,
  UnshieldedWallet,
  createKeystore,
  PublicKey,
  NoOpTransactionHistoryStorage,
  DustAddress,
  MidnightBech32m,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from "@midnight-ntwrk/wallet-sdk";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { unshieldedToken } from "@midnight-ntwrk/ledger-v8";
import {
  setNetworkId,
  getNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

// ─── Config ────────────────────────────────────────────────────────────────
const CONFIG = {
  networkId: "preprod",
  indexerHttpUrl: "https://indexer.preprod.midnight.network/api/v4/graphql",
  indexerWsUrl: "wss://indexer.preprod.midnight.network/api/v4/graphql/ws",
  node: "https://rpc.preprod.midnight.network",
  proofServer: "http://localhost:6300",
  faucetUrl: "https://midnight-tmnight-preprod.nethermind.dev/",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, ".midnight-wallet-preprod-demo.local");

// ─── Helpers ───────────────────────────────────────────────────────────────
const toHexBytes = (buf) => Buffer.from(buf).toString("hex");

const formatNight = (raw) => {
  const whole = raw / 1_000_000n;
  const fraction = (raw % 1_000_000n).toString().padStart(6, "0");
  return `${whole.toLocaleString()}.${fraction}`;
};

const formatDust = (raw) => {
  const whole = raw / 1_000_000_000_000_000n;
  const fraction = (raw % 1_000_000_000_000_000n)
    .toString()
    .padStart(15, "0");
  return `${whole.toLocaleString()}.${fraction}`;
};

const withStatus = async (message, fn) => {
  const clocks = ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${clocks[i++ % clocks.length]} ${message}`);
  }, 150);
  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ✅ ${message}\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ❌ ${message}\n`);
    throw e;
  }
};

const prompt = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const isValidDustAddress = (addr) => {
  if (!addr.startsWith("mn_dust_")) return false;
  try {
    MidnightBech32m.parse(addr).decode(DustAddress, getNetworkId());
    return true;
  } catch {
    return false;
  }
};

const promptForDustAddress = async (ownDustAddress) => {
  while (true) {
    const input = await prompt(
      `  Paste your Dust address to designate (Enter for this wallet's): `,
    );
    const target = input || ownDustAddress;
    if (isValidDustAddress(target)) {
      if (target !== ownDustAddress) {
        console.log(`\n  Using external dust address: ${target}\n`);
      } else {
        console.log("");
      }
      return target;
    }
    console.log(
      '  ❌ Invalid dust address. Dust addresses start with "mn_dust_" followed by the network.',
    );
    console.log(
      "     Make sure you're not pasting a shielded or unshielded address.\n",
    );
  }
};

// ─── Seed persistence ──────────────────────────────────────────────────────
const getOrCreateSeed = async () => {
  if (fs.existsSync(SEED_FILE)) {
    const seed = fs.readFileSync(SEED_FILE, "utf8").trim();
    if (seed.length >= 32) {
      console.log(
        "  Using existing wallet seed from .midnight-wallet-preprod-demo.local\n",
      );
      return seed;
    }
  }
  const choice = await prompt(
    "  Create a new wallet or restore an existing one? (n/r): ",
  );
  if (choice.toLowerCase() === "r") {
    const seed = await prompt("  Enter your hex seed: ");
    if (!seed || seed.length < 32) {
      throw new Error(
        "Invalid seed. The seed should be a 64-character hex string.",
      );
    }
    fs.writeFileSync(SEED_FILE, seed + "\n", { mode: 0o600 });
    console.log(
      "  Restored wallet — saved to .midnight-wallet-preprod-demo.local (0600, gitignored)\n",
    );
    return seed;
  }
  const seed = toHexBytes(generateRandomSeed());
  fs.writeFileSync(SEED_FILE, seed + "\n", { mode: 0o600 });
  console.log("\n  Created new wallet.");
  console.log(
    "  ⚠️  Saved to .midnight-wallet-preprod-demo.local (0600, gitignored).",
  );
  console.log("  Back it up if you plan to fund it beyond a demo.\n");
  return seed;
};

// ─── Derive keys ───────────────────────────────────────────────────────────
const deriveKeys = (seed) => {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hdWallet.type !== "seedOk") {
    throw new Error(
      "Failed to initialize HDWallet from seed. Is the seed a valid hex string?",
    );
  }
  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derivationResult.type !== "keysDerived") {
    throw new Error("Failed to derive keys from seed.");
  }
  hdWallet.hdWallet.clear();
  return derivationResult.keys;
};

// ─── Build wallet ──────────────────────────────────────────────────────────
const buildWallet = async (keys) => {
  setNetworkId(CONFIG.networkId);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(
    keys[Roles.NightExternal],
    getNetworkId(),
  );
  const shieldedConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: {
      indexerHttpUrl: CONFIG.indexerHttpUrl,
      indexerWsUrl: CONFIG.indexerWsUrl,
    },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, "ws")),
  };
  const unshieldedConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: {
      indexerHttpUrl: CONFIG.indexerHttpUrl,
      indexerWsUrl: CONFIG.indexerWsUrl,
    },
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
  };
  const dustConfig = {
    ...shieldedConfig,
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
  };
  const wallet = await WalletFacade.init({
    configuration: { ...shieldedConfig, ...unshieldedConfig, ...dustConfig },
    shielded: (cfg) =>
      ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) =>
      UnshieldedWallet(cfg).startWithPublicKey(
        PublicKey.fromKeyStore(unshieldedKeystore),
      ),
    dust: (cfg) =>
      DustWallet(cfg).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
};

const waitForSync = (wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((state) => state.isSynced),
    ),
  );

const waitForFunds = (wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((state) => state.isSynced),
      Rx.map((s) => s.unshielded.balances[unshieldedToken().raw] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

// ─── Register NIGHT for DUST generation ────────────────────────────────────
const registerForDustGeneration = async (
  wallet,
  unshieldedKeystore,
  targetDustAddress,
  isExternalAddress = false,
) => {
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  if (state.dust.availableCoins.length > 0) {
    const dustBalance = state.dust.balance(new Date());
    console.log(`  DUST already available: ${formatDust(dustBalance)}\n`);
    return;
  }
  const unregisteredCoins = state.unshielded.availableCoins.filter(
    (coin) => coin.meta?.registeredForDustGeneration !== true,
  );
  if (unregisteredCoins.length === 0) {
    console.log(
      "  All NIGHT already registered. Waiting for DUST to generate...",
    );
  } else {
    const dustReceiver = MidnightBech32m.parse(targetDustAddress).decode(
      DustAddress,
      getNetworkId(),
    );
    await withStatus(
      `Registering NIGHT for dust generation → ${targetDustAddress}`,
      async () => {
        const recipe = await wallet.registerNightUtxosForDustGeneration(
          unregisteredCoins,
          unshieldedKeystore.getPublicKey(),
          (payload) => unshieldedKeystore.signData(payload),
          dustReceiver,
        );
        const finalized = await wallet.finalizeRecipe(recipe);
        await wallet.submitTransaction(finalized);
      },
    );
  }
  if (!isExternalAddress) {
    await withStatus(
      "Waiting for DUST to generate (may take 1–2 min; sometimes 10–20)",
      () =>
        Rx.firstValueFrom(
          wallet.state().pipe(
            Rx.throttleTime(5_000),
            Rx.filter((s) => s.isSynced),
            Rx.filter((s) => s.dust.availableCoins.length >= 1),
          ),
        ),
    );
  }
};

const checkDustBalance = async (wallet) => {
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  return {
    balance: state.dust.balance(new Date()),
    coins: state.dust.availableCoins.length,
  };
};

// ─── Main ──────────────────────────────────────────────────────────────────
const main = async () => {
  console.log("");
  console.log("  Midnight Preprod DUST demo");
  console.log(
    "  Docs: https://docs.midnight.network/guides/generating-dust-programmatically",
  );
  console.log("");
  const seed = await getOrCreateSeed();
  const keys = deriveKeys(seed);
  const { wallet, unshieldedKeystore } = await withStatus(
    "Building wallet",
    () => buildWallet(keys),
  );

  const initialState = await Rx.firstValueFrom(wallet.state());
  const networkId = getNetworkId();
  const coinPubKey = ShieldedCoinPublicKey.fromHexString(
    initialState.shielded.coinPublicKey.toHexString(),
  );
  const encPubKey = ShieldedEncryptionPublicKey.fromHexString(
    initialState.shielded.encryptionPublicKey.toHexString(),
  );
  const shieldedAddress = MidnightBech32m.encode(
    networkId,
    new ShieldedAddress(coinPubKey, encPubKey),
  ).toString();
  const unshieldedAddress = unshieldedKeystore.getBech32Address();
  const dustAddress = DustAddress.encodePublicKey(
    networkId,
    initialState.dust.publicKey,
  );

  console.log("");
  console.log("  Wallet Addresses (preprod):");
  console.log(`    Shielded:    ${shieldedAddress}`);
  console.log(
    `    Unshielded:  ${unshieldedAddress}  ← send tNIGHT here`,
  );
  console.log(`    Dust:        ${dustAddress}`);
  console.log("");
  console.log(`  Faucet: ${CONFIG.faucetUrl}`);
  console.log("");

  await withStatus("Syncing wallet with network", () => waitForSync(wallet));

  const state = await Rx.firstValueFrom(wallet.state());
  const nightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust.balance(new Date());
  const dustCoins = state.dust.availableCoins.length;

  let usedExternalAddress = false;

  if (nightBalance > 0n && dustCoins >= 1) {
    console.log(`  tNIGHT Balance: ${formatNight(nightBalance)}`);
    console.log(`  DUST Balance:   ${formatDust(dustBalance)} (${dustCoins} coin${dustCoins === 1 ? "" : "s"})\n`);
    console.log("  Your wallet already has spendable DUST. No action needed.");
  } else if (nightBalance > 0n) {
    console.log(`  tNIGHT Balance: ${formatNight(nightBalance)}`);
    console.log(`  DUST Balance:   ${formatDust(dustBalance)} (${dustCoins} spendable coin${dustCoins === 1 ? "" : "s"})\n`);
    console.log(
      "  You have tNIGHT but no spendable DUST yet. Registering for DUST generation.\n",
    );
    const targetDustAddress = await promptForDustAddress(dustAddress);
    usedExternalAddress = targetDustAddress !== dustAddress;
    await registerForDustGeneration(
      wallet,
      unshieldedKeystore,
      targetDustAddress,
      usedExternalAddress,
    );
  } else {
    console.log(
      "  Waiting for tNIGHT — copy the unshielded address above and paste it into the faucet.",
    );
    console.log("  ⚠️  No extra spaces or newlines.\n");
    const balance = await withStatus(
      "Waiting for incoming tNIGHT",
      () => waitForFunds(wallet),
    );
    console.log(`  tNIGHT Balance: ${formatNight(balance)}\n`);
    const targetDustAddress = await promptForDustAddress(dustAddress);
    usedExternalAddress = targetDustAddress !== dustAddress;
    await registerForDustGeneration(
      wallet,
      unshieldedKeystore,
      targetDustAddress,
      usedExternalAddress,
    );
  }

  if (usedExternalAddress) {
    console.log("");
    console.log(
      "  DUST is being generated to the external address you designated.",
    );
    console.log(
      "  Because DUST is a shielded token, only the wallet holding that dust",
    );
    console.log(
      "  secret key can see the balance. Check the receiving wallet to verify.",
    );
  } else {
    const { balance, coins } = await checkDustBalance(wallet);
    console.log("");
    console.log(
      `  DUST Balance: ${formatDust(balance)} (${coins} spendable coin${coins === 1 ? "" : "s"})`,
    );
    console.log("  DUST generates continuously over time.");
    console.log('  Press Enter to re-check, or type "q" to quit.\n');
    let running = true;
    while (running) {
      const answer = await prompt("  > ");
      if (["q", "quit", "exit"].includes(answer.toLowerCase())) {
        running = false;
      } else {
        const { balance: b, coins: c } = await checkDustBalance(wallet);
        const time = new Date().toLocaleTimeString();
        console.log(
          `  [${time}] DUST Balance: ${formatDust(b)} (${c} spendable coin${c === 1 ? "" : "s"})\n`,
        );
      }
    }
  }

  console.log("");
  console.log(
    "  Wallet seed persisted at .midnight-wallet-preprod-demo.local — re-run this",
  );
  console.log("  script anytime to check DUST accrual.");
  console.log("");
  await wallet.stop();
  process.exit(0);
};

main().catch((err) => {
  console.error("\n  ❌ Error:", err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
