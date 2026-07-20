import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

type Blocker = {
  n: number;
  title: string;
  symptom: string;
  fix: React.ReactNode;
  cmd?: string;
};

const BLOCKERS: Blocker[] = [
  {
    n: 1,
    title: "Enable Virtualization in BIOS/UEFI",
    symptom:
      "Task Manager → Performance → CPU shows Virtualization: Disabled. Docker Desktop refuses to start; WSL2 backend fails.",
    fix: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Fully shut down the machine (not restart).</li>
        <li>
          Power on and repeatedly press <code>Esc</code> or <code>F10</code> (HP);{" "}
          <code>F2</code>/<code>Del</code> on most other brands — to enter BIOS/UEFI setup.
        </li>
        <li>
          Find <strong>SVM Mode</strong> (AMD) or <strong>Intel VT-x / Virtualization Technology</strong> and set to{" "}
          <strong>Enabled</strong>.
        </li>
        <li>
          Save &amp; exit (usually <code>F10</code>) and boot back into Windows.
        </li>
        <li>Confirm Task Manager → Performance → CPU now shows Virtualization: Enabled.</li>
      </ol>
    ),
  },
  {
    n: 2,
    title: "Update WSL (Docker Desktop shows \"WSL needs updating\")",
    symptom:
      "Docker Desktop displays a red WSL banner and Try Again does nothing. Docker Engine never starts.",
    cmd: "wsl --update",
    fix: (
      <>
        <p>Open <strong>PowerShell as Administrator</strong> and run:</p>
        <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">wsl --update</pre>
        <p className="mt-2">
          If it fails with <code>0x8024001e</code> or <code>0x80070002</code>, force-enable the required
          Windows features first: press <code>Win+R</code>, type <code>optionalfeatures</code>, and tick:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Windows Subsystem for Linux</li>
          <li>Virtual Machine Platform</li>
          <li>Windows Hypervisor Platform</li>
        </ul>
        <p className="mt-2">Click OK, reboot, then re-run <code>wsl --update</code>.</p>
      </>
    ),
  },
  {
    n: 3,
    title: "Install Node.js LTS (x64) + fix PowerShell execution policy",
    symptom:
      "npm / bun not recognised, or npm install errors with \"running scripts is disabled on this system\".",
    cmd: "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser",
    fix: (
      <>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Download the <strong>Windows x64 (.msi)</strong> LTS installer from{" "}
            <a
              href="https://nodejs.org/download"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              nodejs.org/download
            </a>
            . Keep the "Add to PATH" option checked.
          </li>
          <li>
            Open a fresh terminal and verify <code>node -v</code> and <code>npm -v</code> both print
            versions.
          </li>
          <li>
            If <code>npm install</code> errors with "running scripts is disabled", open{" "}
            <strong>PowerShell as Administrator</strong> and run:
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">
              Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
            </pre>
            Answer <code>Y</code> to confirm, close the window, reopen a non-admin terminal, and
            retry.
          </li>
        </ol>
      </>
    ),
  },
];

export function WindowsSetupGuide({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id="windows-setup"
      className="border border-border bg-card"
      aria-label="Windows setup prerequisites"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="eyebrow text-primary">Windows prerequisites</span>
          <p className="mt-1 text-sm text-foreground font-medium">
            Docker on Windows — the 3 blockers we actually hit
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            BIOS virtualization · WSL update · Node.js + PowerShell policy. macOS &amp; Linux users can skip.
          </p>
        </div>
        <span className="text-primary text-[11px] uppercase tracking-[0.24em] shrink-0">
          {open ? "hide" : "show"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-4 sm:px-5 py-5 space-y-6">
          {BLOCKERS.map((b) => (
            <div key={b.n} className="flex gap-3 sm:gap-4">
              <div className="shrink-0 w-7 h-7 border border-primary flex items-center justify-center text-primary font-display text-sm">
                {b.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h4 className="font-display text-base text-foreground">{b.title}</h4>
                  {b.cmd && <CopyButton text={b.cmd} label="Copy cmd" />}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground italic">{b.symptom}</p>
                <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed space-y-2">
                  {b.fix}
                </div>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-2 border-t border-border">
            Once all three checks pass, restart Docker Desktop and confirm{" "}
            <code>docker info</code> works in a fresh terminal before continuing.
          </p>
        </div>
      )}
    </section>
  );
}
