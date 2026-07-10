import {
  isDeployed,
  type MidnightContractCfg,
  type NetworkId,
} from "@/data/midnight-contract";

export function DeployStatusPanel({ cfg }: { cfg: MidnightContractCfg }) {
  const deployed = isDeployed(cfg);
  const explorerBase = cfg.explorer.replace(/\/$/, "");
  const addressUrl = deployed ? `${explorerBase}/contract/${cfg.address}` : null;
  const txUrl = cfg.deployTx ? `${explorerBase}/tx/${cfg.deployTx}` : null;
  const netId = cfg.networkId as NetworkId;
  const deployCmd =
    netId === "preview"
      ? "bun scripts/deploy-midnight.mjs"
      : "VITE_NETWORK_ID=preprod bun scripts/deploy-midnight.mjs";

  return (
    <div
      className={`border p-5 h-full flex flex-col ${
        deployed ? "border-primary/60 bg-primary/5" : "border-dashed border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow text-primary">{cfg.networkId}</span>
        <span
          className={`text-[10px] tracking-[0.28em] uppercase font-semibold ${
            deployed ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {deployed ? `● live on ${cfg.networkId}` : "○ awaiting deploy"}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground font-light">{cfg.network}</div>

      {deployed ? (
        <div className="mt-3 space-y-2 text-xs font-light text-muted-foreground leading-relaxed flex-1">
          <div>
            <span className="text-foreground uppercase tracking-[0.2em] text-[10px]">Address</span>
            <div className="font-mono text-foreground text-[11px] break-all mt-1">{cfg.address}</div>
          </div>
          {cfg.deployTx && (
            <div>
              <span className="text-foreground uppercase tracking-[0.2em] text-[10px]">Deploy tx</span>
              <div className="font-mono text-foreground text-[11px] break-all mt-1">{cfg.deployTx}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {addressUrl && (
              <a
                href={addressUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 border border-primary/40 text-primary text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition"
              >
                Contract ↗
              </a>
            )}
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition"
              >
                Tx ↗
              </a>
            )}
            <a
              href={cfg.faucet}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition"
            >
              Faucet ↗
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex-1 space-y-3">
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            Not yet deployed. Run{" "}
            <span className="font-mono text-foreground break-all">{deployCmd}</span> locally — the
            script writes the address + tx into{" "}
            <span className="font-mono text-foreground">src/data/midnight-contract.{netId}.json</span>
            .
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={cfg.faucet}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition"
            >
              Faucet ↗
            </a>
            <a
              href={cfg.explorer}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-border text-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:border-primary/60 hover:text-primary transition"
            >
              Explorer ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function DualDeployStatus({
  cfgs,
  className = "",
}: {
  cfgs: MidnightContractCfg[];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {cfgs.map((cfg) => (
        <DeployStatusPanel key={cfg.networkId} cfg={cfg} />
      ))}
    </div>
  );
}
