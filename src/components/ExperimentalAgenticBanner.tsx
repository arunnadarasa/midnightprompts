import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function ExperimentalAgenticBanner({ persistent = false }: { persistent?: boolean }) {
  const [ack, setAck] = useState(false);
  useEffect(() => {
    setAck(localStorage.getItem("agentic-banner-ack") === "1");
  }, []);
  if (ack && !persistent) return null;

  return (
    <div className="border border-amber-500/40 bg-amber-500/10 text-amber-100 px-4 py-3 text-xs sm:text-sm flex flex-wrap items-start gap-3 justify-between">
      <div className="max-w-3xl leading-relaxed">
        <strong className="uppercase tracking-[0.24em] text-[10px] block mb-1 text-amber-300">
          Experimental agentic commerce
        </strong>
        Contracts are unaudited. mUSDC is a <em>mimic</em> token — no peg, no value.
        For hackathon and research use only.{" "}
        <Link to="/agentic-experimental" className="underline hover:text-amber-200">
          Read the disclaimer →
        </Link>
      </div>
      {!persistent && (
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("agentic-banner-ack", "1");
            setAck(true);
          }}
          className="text-[10px] tracking-[0.24em] uppercase px-3 py-1 border border-amber-500/40 hover:bg-amber-500/20"
        >
          Got it
        </button>
      )}
    </div>
  );
}
