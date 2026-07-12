import preview from "./moveboard-contract.preview.json";
import preprod from "./moveboard-contract.preprod.json";
import type { MidnightContractCfg, NetworkId } from "./midnight-contract";
import { PLACEHOLDER_ADDRESS } from "./midnight-contract";

export const MOVEBOARD_CONTRACTS: Record<NetworkId, MidnightContractCfg> = {
  preview: preview as MidnightContractCfg,
  preprod: preprod as MidnightContractCfg,
};

export function isMoveBoardDeployed(cfg: MidnightContractCfg) {
  return !!cfg.address && cfg.address !== PLACEHOLDER_ADDRESS;
}
