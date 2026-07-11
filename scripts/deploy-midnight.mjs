#!/usr/bin/env bun
/**
 * scripts/deploy-midnight.mjs
 *
 * Two-phase LOCAL deploy for contracts/TimestampLog.compact against Midnight Preview/Preprod.
 *
 * WHERE TO RUN THIS: on your own machine. NOT in the Lovable sandbox — the sandbox
 * has no Docker daemon, and Midnight's proof server is only distributed as a
 * Docker image (midnightntwrk/proof-server). Phase 2 fails without it.
 *
 * PHASE 1 (no seed / no funds yet):
 *   bun scripts/deploy-midnight.mjs
 *     → generates a 24-word BIP-39 mnemonic, or uses MIDNIGHT_WALLET_SEED
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
import { generateMnemonic } from "bip39";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, ".midnight-wallet.local");
const MANAGED = path.join(ROOT, "contracts/managed/timestamp-log");

const NETWORK_ID = process.env.VITE_NETWORK_ID ?? "preview";
const CONTRACT_JSON = path.join(ROOT, `src/data/midnight-contract.${NETWORK_ID}.json`);

// Per-network defaults (overridable via env). Preview + preprod are the two
// hackathon-facing testnets; both are proved by the same local Docker proof server.
const NETWORK_DEFAULTS = {
  preview: {
    indexerHttp: "https://indexer.preview.midnight.network/api/v4/graphql",
    indexerWs: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
    nodeRpc: "https://rpc.preview.midnight.network",
    faucet: "https://midnight-tmnight-preview.nethermind.dev/",
    explorer: "https://preview.midnightexplorer.com",
  },
  preprod: {
    indexerHttp: "https://indexer.preprod.midnight.network/api/v4/graphql",
    indexerWs: "wss://indexer.preprod.midnight.network/api/v4/graphql/ws",
    nodeRpc: "https://rpc.preprod.midnight.network",
    faucet: "https://midnight-tmnight-preprod.nethermind.dev/",
    explorer: "https://preprod.midnightexplorer.com",
  },
};
const defaults = NETWORK_DEFAULTS[NETWORK_ID] ?? NETWORK_DEFAULTS.preview;

const INDEXER_HTTP = process.env.VITE_INDEXER_URL ?? defaults.indexerHttp;
const INDEXER_WS = process.env.VITE_INDEXER_WS_URL ?? defaults.indexerWs;
const NODE_RPC = process.env.VITE_NODE_RPC ?? defaults.nodeRpc;
const PROOF_SERVER = process.env.VITE_PROOF_SERVER_URL ?? "http://localhost:6300";
const FAUCET = defaults.faucet;
const EXPLORER = defaults.explorer;

function log(...a) {
  console.log("[midnight-deploy]", ...a);
}
function die(msg) {
  console.error("\n[midnight-deploy] FATAL:", msg, "\n");
  process.exit(1);
}

async function loadOrCreateSeed() {
  if (process.env.MIDNIGHT_WALLET_SEED) {
    const mnemonic = process.env.MIDNIGHT_WALLET_SEED.trim();
    const wordCount = mnemonic.split(/\s+/).length;
    if (![12, 15, 18, 21, 24].includes(wordCount)) {
      die("MIDNIGHT_WALLET_SEED is not a valid BIP-39 mnemonic length.");
    }
    log("using wallet seed from MIDNIGHT_WALLET_SEED (not printed, not written to disk)");
    return { mnemonic, fresh: false };
  }

  if (fs.existsSync(SEED_FILE)) {
    const mnemonic = fs.readFileSync(SEED_FILE, "utf8").trim();
    const wordCount = mnemonic.split(/\s+/).length;
    if (![12, 15, 18, 21, 24].includes(wordCount)) {
      die(`${SEED_FILE} exists but is not a valid BIP-39 mnemonic length.`);
    }
    log("using existing wallet seed from .midnight-wallet.local");
    return { mnemonic, fresh: false };
  }
  const mnemonic = generateMnemonic(256); // 24 words
  fs.writeFileSync(SEED_FILE, mnemonic + "\n", { mode: 0o600 });
  log("generated new 24-word mnemonic → .midnight-wallet.local (0600, gitignored)");
  return { mnemonic, fresh: true };
}

function normalizeNetworkId(networkId) {
  switch (networkId) {
    case "preview":
    case "preprod":
    case "undeployed":
    case "mainnet":
      return networkId;
    case "test":
    case "testnet":
      return "preview";
    default:
      die(`Unknown VITE_NETWORK_ID="${networkId}" (expected preview|preprod|undeployed|mainnet).`);
  }
}

const ADDRESS_NETWORK = normalizeNetworkId(NETWORK_ID);
const ADDRESS_SUFFIX = ADDRESS_NETWORK === "mainnet" ? null : ADDRESS_NETWORK;

function expectedPrefix(kind, suffix = ADDRESS_SUFFIX) {
  if (kind === "unshielded") return suffix ? `mn_addr_${suffix}1` : "mn_addr1";
  if (kind === "shielded") return suffix ? `mn_shield-addr_${suffix}1` : "mn_shield-addr1";
  if (kind === "cpk") return suffix ? `mn_shield-cpk_${suffix}1` : "mn_shield-cpk1";
  if (kind === "epk") return suffix ? `mn_shield-epk_${suffix}1` : "mn_shield-epk1";
  return "";
}

function assertAddressPrefix(label, address, kind) {
  const prefix = expectedPrefix(kind);
  if (!address.startsWith(prefix)) {
    die(
      `${label} has the wrong network prefix.\n` +
        `Expected: ${prefix}…\n` +
        `Got:      ${address.slice(0, Math.max(prefix.length, 32))}…\n` +
        `Do not fund this wallet until the printed addresses match Lace for ${ADDRESS_NETWORK}.`,
    );
  }
}

async function deriveHdAddresses(mnemonic, network = ADDRESS_NETWORK) {
  const { WalletSeeds } = await import("@midnight-ntwrk/testkit-js");
  const { createKeystore } = await import("@midnight-ntwrk/wallet-sdk");
  const {
    ShieldedAddress,
    ShieldedCoinPublicKey,
    ShieldedEncryptionPublicKey,
  } = await import("@midnight-ntwrk/wallet-sdk-address-format");
  const ledger = await import("@midnight-ntwrk/ledger-v8");

  const suffix = network === "mainnet" ? null : network;
  const seeds = WalletSeeds.fromMnemonic(mnemonic.trim());
  const keystore = createKeystore(seeds.unshielded, suffix ?? "");
  const secretKeys = ledger.ZswapSecretKeys.fromSeed(new Uint8Array(seeds.shielded));
  const coinPublicKeyHex = secretKeys.coinPublicKey;
  const encryptionPublicKeyHex = secretKeys.encryptionPublicKey;
  const coinPublicKey = new ShieldedCoinPublicKey(Buffer.from(coinPublicKeyHex, "hex"));
  const encryptionPublicKey = new ShieldedEncryptionPublicKey(Buffer.from(encryptionPublicKeyHex, "hex"));
  const shieldedAddress = ShieldedAddress.codec
    .encode(suffix, new ShieldedAddress(coinPublicKey, encryptionPublicKey))
    .asString();

  return {
    seedHex: Buffer.from(seeds.shielded).toString("hex"),
    unshieldedAddress: keystore.getBech32Address().asString(),
    shieldedAddress,
    coinPublicKeyHex,
    encryptionPublicKeyHex,
  };
}

async function buildWallet(mnemonic) {
  // Dynamic imports — these are heavy Node/WASM modules; keep them out of top-level scope so
  // Phase 1 (which doesn't need them) runs fast on a fresh checkout.
  const { setNetworkId } = await import("@midnight-ntwrk/midnight-js-network-id");
  const {
    FluentWalletBuilder,
    MidnightWalletProvider,
  } = await import("@midnight-ntwrk/testkit-js");
  setNetworkId(ADDRESS_NETWORK);

  log(`building Lace-compatible wallet for network=${ADDRESS_NETWORK}`);
  // CRITICAL: match Lace's HD derivation. Lace uses WalletSeeds.fromMnemonic
  // (from @midnight-ntwrk/testkit-js + wallet-sdk-hd), which splits the mnemonic
  // into distinct shielded + unshielded seed material. The shielded seed drives
  // the Zswap wallet used for balances + tx signing. The old @midnight-ntwrk/wallet
  // WalletBuilder path still derives different keys, so the deploy path uses the
  // same facade/testkit wallet stack that exposes Lace-compatible addresses.
  const env = {
    walletNetworkId: ADDRESS_NETWORK,
    networkId: ADDRESS_NETWORK,
    indexer: INDEXER_HTTP,
    indexerWS: INDEXER_WS,
    node: NODE_RPC,
    nodeWS: NODE_RPC.replace(/^https:/, "wss:"),
    faucet: FAUCET,
    proofServer: PROOF_SERVER,
  };
  const quietLogger = {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    trace: () => {},
  };
  const { wallet, seeds, keystore } = await FluentWalletBuilder
    .forEnvironment(env)
    .withMnemonic(mnemonic.trim())
    .buildWithoutStarting();
  const ledger = await import("@midnight-ntwrk/ledger-v8");
  const zswapSecretKeys = ledger.ZswapSecretKeys.fromSeed(seeds.shielded);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(seeds.dust);
  const provider = await MidnightWalletProvider.withWallet(
    quietLogger,
    env,
    wallet,
    zswapSecretKeys,
    dustSecretKey,
    keystore,
  );
  await provider.start(false);
  const state = await latestWalletSnapshot(provider.wallet, 30_000);
  return { provider, state, seeds, dustSecretKey, ledger };
}

function readDustBalance(state) {
  try {
    return BigInt(state?.dust?.balance?.(new Date()) ?? 0n);
  } catch {
    return 0n;
  }
}

function toHex(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array) return Buffer.from(value).toString("hex");
  if (Array.isArray(value)) return Buffer.from(value).toString("hex");
  if (typeof value.toString === "function") {
    const s = value.toString();
    if (s && s !== "[object Object]") return s;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function diagnoseDust(state, dustSecretKey) {
  console.log("");
  log("── DUST diagnostic ──");

  // 1. DUST public key from wallet state
  const walletDustPk = toHex(state?.dust?.publicKey);
  log(`state.dust.publicKey:      ${walletDustPk ?? "<undefined>"}`);

  // 2. DUST public key from DustSecretKey.fromSeed(seeds.dust)
  let seedDustPk = null;
  try {
    seedDustPk = toHex(dustSecretKey?.publicKey);
  } catch (e) {
    log(`could not read DustSecretKey.publicKey: ${e?.message ?? e}`);
  }
  log(`DustSecretKey.publicKey:   ${seedDustPk ?? "<undefined>"}`);
  if (walletDustPk && seedDustPk && walletDustPk !== seedDustPk) {
    log("⚠ wallet DUST key ≠ seed-derived DUST key — wallet was wired with the wrong key");
  } else if (walletDustPk && seedDustPk) {
    log("✓ wallet DUST key matches seed-derived DUST key");
  }

  // 3. DUST coins visible to this wallet
  const dustCoins = state?.dust?.availableCoins ?? [];
  log(`state.dust.availableCoins: ${dustCoins.length} coin(s)`);

  // 4. Sync progress
  const dustProgress = state?.dust?.state?.progress;
  const shieldedProgress = state?.shielded?.state?.progress;
  const unshieldedProgress = state?.unshielded?.progress;
  try {
    log(`dust sync isStrictlyComplete: ${dustProgress?.isStrictlyComplete?.() ?? "n/a"}`);
    log(`shielded sync isStrictlyComplete: ${shieldedProgress?.isStrictlyComplete?.() ?? "n/a"}`);
    log(`unshielded sync isStrictlyComplete: ${unshieldedProgress?.isStrictlyComplete?.() ?? "n/a"}`);
  } catch {}

  // 5. NIGHT UTXOs and registration flag
  const nightCoins = state?.unshielded?.availableCoins ?? [];
  log(`state.unshielded.availableCoins: ${nightCoins.length} NIGHT UTXO(s)`);
  let registeredCount = 0;
  nightCoins.forEach((c, i) => {
    const value = c?.value ?? c?.amount ?? "?";
    const reg = c?.meta?.registeredForDustGeneration ?? c?.registeredForDustGeneration ?? null;
    if (reg === true) registeredCount += 1;
    log(`  [${i}] value=${value} registeredForDustGeneration=${reg}`);
  });

  log("── end DUST diagnostic ──");
  console.log("");

  return {
    walletDustPk,
    seedDustPk,
    keyMatches: walletDustPk && seedDustPk ? walletDustPk === seedDustPk : null,
    dustCoinCount: dustCoins.length,
    nightCoinCount: nightCoins.length,
    registeredCount,
  };
}


async function waitForDustBalance(wallet, initialState, timeoutMs = 90_000) {
  log("syncing wallet Dust balance from Indexer…");
  return new Promise((resolve, reject) => {
    let latest = initialState;
    let bestBalance = readDustBalance(initialState);
    let settled = false;
    let sub = { unsubscribe: () => {} };
    const startedAt = Date.now();
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(progress);
      sub.unsubscribe();
      resolve({ state: latest, tdust: bestBalance });
    };
    const report = () => {
      log(`wallet sync check: current tDUST balance ${bestBalance.toString()} (${Math.round((Date.now() - startedAt) / 1000)}s)`);
    };
    const timer = setTimeout(finish, timeoutMs);
    const progress = setInterval(report, 10_000);

    const update = (state) => {
      latest = state ?? latest;
      const balance = readDustBalance(latest);
      if (balance > bestBalance) bestBalance = balance;
      if (bestBalance > 0n) finish();
    };

    update(initialState);
    sub = wallet.state().subscribe({
      next: update,
      error: (error) => {
        clearTimeout(timer);
        clearInterval(progress);
        reject(error);
      },
    });
  });
}

async function latestWalletSnapshot(wallet, timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    let latest;
    let settled = false;
    let sub = { unsubscribe: () => {} };
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      sub.unsubscribe();
      resolve(value);
    };
    const timer = setTimeout(() => {
      if (latest) finish(latest);
      else reject(new Error(`Wallet produced no state within ${timeoutMs}ms`));
    }, timeoutMs);
    sub = wallet.state().subscribe({
      next: (state) => {
        latest = state;
        const synced =
          state.shielded?.state?.progress?.isStrictlyComplete?.() &&
          state.unshielded?.progress?.isStrictlyComplete?.() &&
          state.dust?.state?.progress?.isStrictlyComplete?.();
        if (synced) finish(state);
      },
      error: (error) => {
        clearTimeout(timer);
        reject(error);
      },
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

  const derived = await deriveHdAddresses(mnemonic);
  assertAddressPrefix("HD unshielded address", derived.unshieldedAddress, "unshielded");
  assertAddressPrefix("HD shielded address", derived.shieldedAddress, "shielded");

  log(`derived (HD, matches Lace) unshielded: ${derived.unshieldedAddress}`);
  log(`derived (HD, matches Lace) shielded:   ${derived.shieldedAddress}`);

  const wantsRegister = process.argv.includes("--register-dust");

  const { provider, state, dustSecretKey } = await buildWallet(mnemonic);
  const address = derived.shieldedAddress;

  if (provider.getCoinPublicKey() !== derived.coinPublicKeyHex) {
    die("Wallet provider coin public key does not match the HD-derived Lace key.");
  }
  if (provider.getEncryptionPublicKey() !== derived.encryptionPublicKeyHex) {
    die("Wallet provider encryption public key does not match the HD-derived Lace key.");
  }

  console.log("");
  console.log("  Shielded address (SDK-side, used for contract state):");
  console.log("  " + address);
  console.log("  ↑ This must match the shielded address Lace shows for the same seed.");
  console.log("    If it doesn't, .midnight-wallet.local holds a different mnemonic.");
  console.log("");
  console.log("  ⚠ Faucets do NOT accept shielded addresses.");
  console.log("    Use the UNSHIELDED address (mn_addr_…) printed above / shown in Lace.");
  console.log("    See: https://docs.midnight.network/guides/acquire-tokens");
  console.log("    Faucet: " + FAUCET);
  console.log("");


  const syncedDust = await waitForDustBalance(provider.wallet, state);
  const tdust = Number(syncedDust.tdust);
  log(`current tDUST balance after sync: ${tdust}`);

  const diag = diagnoseDust(syncedDust.state ?? state, dustSecretKey);

  if (wantsRegister) {
    log("── --register-dust: attempting to register NIGHT UTXOs for DUST generation ──");
    const wallet = provider.wallet;
    const fn =
      wallet?.registerNightUtxosForDustGeneration ??
      wallet?.registerForDustGeneration ??
      wallet?.dust?.registerNightUtxos;
    if (typeof fn !== "function") {
      log("This build of @midnight-ntwrk/testkit-js does not expose");
      log("wallet.registerNightUtxosForDustGeneration(). See docs:");
      log("  https://docs.midnight.network/guides/generating-dust-programmatically");
      log("You'll need to run the registration via Lace: click \"Generate tDUST\"");
      log("with THIS script's derived DUST key active (or import this seed into Lace).");
      await provider.stop?.();
      process.exit(1);
    }
    try {
      const res = await fn.call(wallet);
      log(`registration tx submitted: ${JSON.stringify(res).slice(0, 200)}`);
      log("Wait ~1–5 minutes for tDUST to accrue, then re-run without --register-dust.");
    } catch (e) {
      log(`registration failed: ${e?.message ?? e}`);
    }
    await provider.stop?.();
    process.exit(0);
  }

  if (tdust < 1) {
    log("");
    log("=== DIAGNOSIS ===");
    if (diag.keyMatches === false) {
      log("✗ DUST KEY MISMATCH.");
      log(`  Script wallet DUST key:      ${diag.walletDustPk}`);
      log(`  Seed-derived DUST key:       ${diag.seedDustPk}`);
      log("  The wallet provider is wired to a different DUST key than seeds.dust derives.");
      log("  This is an SDK wiring bug — MidnightWalletProvider is not using DustSecretKey.fromSeed(seeds.dust).");
    } else if (diag.nightCoinCount === 0) {
      log("✗ NO NIGHT UTXOs visible to this wallet.");
      log("  Lace's 471 tDUST comes from NIGHT that Lace holds under a different unshielded key.");
      log("  Two options:");
      log("  A) In Lace, SEND some tNIGHT to this script's unshielded address:");
      log(`       ${derived.unshieldedAddress}`);
      log(`     Then in Lace click \"Generate tDUST\" AGAIN so the new NIGHT registers.`);
      log("     Actually — easier: just send tDUST directly from Lace to this shielded address:");
      log(`       ${derived.shieldedAddress}`);
      log("  B) Import the .midnight-wallet.local seed into a fresh Lace wallet");
      log("     and click \"Generate tDUST\" from there.");
    } else if (diag.registeredCount === 0) {
      log("✗ NIGHT UTXOs are visible but NONE are registered for DUST generation");
      log("  against this script's DUST key. Lace registered its OWN DUST key against");
      log("  those NIGHT UTXOs, so the resulting tDUST is only spendable by Lace.");
      log("");
      log("  Fix (one-shot):");
      log("    bun scripts/deploy-midnight.mjs --register-dust");
      log("  Then wait 1–5 min and re-run without the flag.");
    } else {
      log("? DUST key matches and NIGHT is registered, but balance is still 0.");
      log("  DUST accrual may still be catching up on the ledger — wait 1–5 min and re-run.");
    }
    log("");
    log("(Nothing to fix in Lace, Docker, or the seed. See the diagnostic block above.)");
    await provider.stop?.();
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
  const { NodeZkConfigProvider } = await import("@midnight-ntwrk/midnight-js-node-zk-config-provider");
  const { httpClientProofProvider } = await import("@midnight-ntwrk/midnight-js-http-client-proof-provider");
  const { indexerPublicDataProvider } = await import("@midnight-ntwrk/midnight-js-indexer-public-data-provider");

  const zkConfigProvider = new NodeZkConfigProvider(MANAGED);
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
  const providers = {
    privateStateProvider: {
      get: async () => null,
      set: async () => {},
    },
    zkConfigProvider,
    proofProvider,
    publicDataProvider,
    walletProvider: {
      getCoinPublicKey: () => provider.getCoinPublicKey(),
      getEncryptionPublicKey: () => provider.getEncryptionPublicKey(),
      balanceTx: async (tx) => provider.balanceTx(tx),
    },
    midnightProvider: {
      submitTx: async (tx) => provider.submitTx(tx),
    },
  };
  const compiledContract = new Contract({ localSecretKey: (context) => [context.privateState, sk] });
  const deployed = await deployContract(providers, { compiledContract });
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

  await provider.stop?.();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
