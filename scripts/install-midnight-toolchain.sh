#!/usr/bin/env bash
# Installs the Midnight headless deploy toolchain into the Lovable sandbox.
# Idempotent — safe to re-run.
set -euo pipefail

echo "==> Installing Midnight SDK packages (bun)"
bun add \
  @midnight-ntwrk/wallet@4.1.1 \
  @midnight-ntwrk/wallet-sdk-hd@4.1.1 \
  @midnight-ntwrk/zswap@4.0.0 \
  @midnight-ntwrk/ledger@4.0.0 \
  @midnight-ntwrk/compact-runtime@0.16.0 \
  @midnight-ntwrk/midnight-js-contracts@4.1.1 \
  @midnight-ntwrk/midnight-js-types@4.1.1 \
  @midnight-ntwrk/midnight-js-network-id@4.1.1 \
  @midnight-ntwrk/midnight-js-fetch-zk-config-provider@4.1.1 \
  @midnight-ntwrk/midnight-js-http-client-proof-provider@4.1.1 \
  @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.1.1 \
  @midnight-ntwrk/midnight-js-utils@4.1.1 \
  rxjs pino semver bip39 2>&1 | tail -20 || true

echo "==> Locating midnight-proof-server binary"
if command -v midnight-proof-server >/dev/null 2>&1; then
  echo "already installed: $(command -v midnight-proof-server)"
else
  mkdir -p "$HOME/.midnight/bin"
  # Try the compact-installer path which bundles the proof server binary on Linux x86_64.
  ARCH="$(uname -m)"
  OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
  URL="https://github.com/midnightntwrk/midnight-node/releases/latest/download/midnight-proof-server-${OS}-${ARCH}.tar.gz"
  echo "downloading $URL"
  if curl -fsSL "$URL" -o /tmp/mps.tgz 2>/dev/null; then
    tar -xzf /tmp/mps.tgz -C "$HOME/.midnight/bin/"
    chmod +x "$HOME/.midnight/bin/midnight-proof-server" || true
    echo "installed at $HOME/.midnight/bin/midnight-proof-server"
  else
    echo "WARN: could not fetch prebuilt proof-server binary from $URL"
    echo "      the deploy script will surface this at proof-server startup"
  fi
fi

echo "==> Done."
