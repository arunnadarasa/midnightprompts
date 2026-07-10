import preview from "./midnight-contract.preview.json";
import preprod from "./midnight-contract.preprod.json";

export type NetworkId = "preview" | "preprod";

export type MidnightContractCfg = {
  network: string;
  networkId: string;
  compactVersion: string;
  sdkVersion: string;
  proofServerVersion: string;
  address: string;
  deployTx: string | null;
  explorer: string;
  rpc: string;
  indexerHttp: string;
  indexerWs: string;
  faucet: string;
  addressPrefix?: string;
  unshieldedPrefix?: string;
  note?: string;
};

export const PLACEHOLDER_ADDRESS =
  "0000000000000000000000000000000000000000000000000000000000000000";

export const CONTRACTS: Record<NetworkId, MidnightContractCfg> = {
  preview: preview as MidnightContractCfg,
  preprod: preprod as MidnightContractCfg,
};

export const NETWORK_IDS: NetworkId[] = ["preview", "preprod"];

export function isDeployed(cfg: MidnightContractCfg) {
  return !!cfg.address && cfg.address !== PLACEHOLDER_ADDRESS;
}
