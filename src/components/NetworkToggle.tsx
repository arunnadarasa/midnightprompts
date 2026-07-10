import { NETWORK_IDS, type NetworkId } from "@/data/midnight-contract";

export function NetworkToggle({
  value,
  onChange,
  className = "",
}: {
  value: NetworkId;
  onChange: (n: NetworkId) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {NETWORK_IDS.map((n) => {
        const active = n === value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`px-3 py-2 text-[10px] tracking-[0.28em] uppercase font-semibold border transition ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:border-primary/60 hover:text-primary"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
