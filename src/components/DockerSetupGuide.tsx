import { useEffect, useState } from "react";
import { CopyButton } from "@/components/copy-button";

type OS = "macos" | "windows" | "linux";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "macos";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "macos";
}

type Blocker = {
  n: number;
  title: string;
  symptom: string;
  fix: React.ReactNode;
  cmd?: string;
};

const WINDOWS_BLOCKERS: Blocker[] = [
  {
    n: 1,
    title: "Enable Virtualization in BIOS/UEFI",
    symptom:
      "Task Manager → Performance → CPU shows Virtualization: Disabled. Docker Desktop refuses to start; WSL2 backend fails.",
    fix: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>Fully shut down the machine (not restart).</li>
        <li>
          Power on and repeatedly press <code>Esc</code> or <code>F10</code> (HP); <code>F2</code>/<code>Del</code> on most other brands — to enter BIOS/UEFI setup.
        </li>
        <li>
          Find <strong>SVM Mode</strong> (AMD) or <strong>Intel VT-x / Virtualization Technology</strong> and set to <strong>Enabled</strong>.
        </li>
        <li>Save &amp; exit (usually <code>F10</code>) and boot back into Windows.</li>
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
          If it fails with <code>0x8024001e</code> or <code>0x80070002</code>, force-enable the required Windows features first: press <code>Win+R</code>, type <code>optionalfeatures</code>, and tick:
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
            <a href="https://nodejs.org/download" target="_blank" rel="noreferrer" className="text-primary underline">
              nodejs.org/download
            </a>
            . Keep the "Add to PATH" option checked.
          </li>
          <li>
            Open a fresh terminal and verify <code>node -v</code> and <code>npm -v</code> both print versions.
          </li>
          <li>
            If <code>npm install</code> errors with "running scripts is disabled", open <strong>PowerShell as Administrator</strong> and run:
            <pre className="mt-2 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto">Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</pre>
            Answer <code>Y</code> to confirm, close the window, reopen a non-admin terminal, and retry.
          </li>
        </ol>
      </>
    ),
  },
];

function BlockerList({ items }: { items: Blocker[] }) {
  return (
    <div className="space-y-6">
      {items.map((b) => (
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
            <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed space-y-2">{b.fix}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step({ n, title, children }: { n: number | string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="shrink-0 w-7 h-7 border border-primary flex items-center justify-center text-primary font-display text-sm">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display text-base text-foreground">{title}</h4>
        <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-1 p-3 bg-background border border-border font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
      {children}
    </pre>
  );
}

function MacOSPanel() {
  return (
    <div className="space-y-6">
      <Step n={1} title="Install Docker Desktop">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Download from the official{" "}
            <a href="https://docs.docker.com/get-started/get-docker/" target="_blank" rel="noreferrer" className="text-primary underline">
              Docker Get Docker page
            </a>{" "}
            or the macOS install guide at{" "}
            <a href="https://docs.docker.com/desktop/setup/install/mac-install/" target="_blank" rel="noreferrer" className="text-primary underline">
              docs.docker.com/desktop/setup/install/mac-install
            </a>{" "}
            — pick the <strong>Apple Silicon</strong> or <strong>Intel</strong> build to match your Mac.
          </li>
          <li>Open the .dmg, drag Docker to Applications, launch it, grant file access if prompted.</li>
          <li>Wait until the menu-bar whale says "Docker Desktop is running".</li>
          <li>
            Verify in Terminal: <CodeBlock>docker --version{"\n"}docker info</CodeBlock>
          </li>
          <li>
            Stuck at <em>Starting</em>? Quit and reopen Docker Desktop; if it still hangs, reset to factory defaults from the <strong>Troubleshoot</strong> menu.
          </li>
        </ol>
      </Step>
      <Step n={2} title="Install Git">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Either download from{" "}
            <a href="https://git-scm.com/download/mac" target="_blank" rel="noreferrer" className="text-primary underline">
              git-scm.com
            </a>{" "}
            or install via Homebrew:
            <CodeBlock>brew install git</CodeBlock>
          </li>
          <li>
            Verify: <CodeBlock>git --version</CodeBlock>
          </li>
        </ol>
      </Step>
    </div>
  );
}

function WindowsPanel() {
  return (
    <div className="space-y-6">
      <Step n={0} title="Check your Windows version">
        <p>
          Press <code>Win + R</code>, type <code>winver</code>. You need <strong>Windows 10 build 19041+</strong> or <strong>Windows 11</strong>. See{" "}
          <a href="https://docs.docker.com/desktop/setup/install/windows-install/" target="_blank" rel="noreferrer" className="text-primary underline">
            Docker's Windows install guide
          </a>{" "}
          for full requirements.
        </p>
      </Step>
      <Step n={1} title="Install WSL 2">
        <p>
          Open <strong>PowerShell as Administrator</strong> (right-click Start → Terminal (Admin)) and run:
        </p>
        <CodeBlock>wsl --install</CodeBlock>
        <p>
          Restart your PC when prompted. If it says "requires elevation", the PowerShell window isn't running as admin. Docker's{" "}
          <a href="https://docs.docker.com/desktop/features/wsl/" target="_blank" rel="noreferrer" className="text-primary underline">
            WSL 2 backend guide
          </a>{" "}
          has the latest troubleshooting steps.
        </p>
      </Step>
      <Step n={2} title="Install Docker Desktop">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Download from the official{" "}
            <a href="https://docs.docker.com/get-started/get-docker/" target="_blank" rel="noreferrer" className="text-primary underline">
              Docker Get Docker page
            </a>{" "}
            or the{" "}
            <a href="https://docs.docker.com/desktop/setup/install/windows-install/" target="_blank" rel="noreferrer" className="text-primary underline">
              Windows install guide
            </a>
            .
          </li>
          <li>Run the installer and make sure <strong>Use the WSL 2 based engine</strong> is selected.</li>
          <li>Wait until Docker Desktop is running (system-tray whale icon).</li>
          <li>
            Verify in a fresh terminal: <CodeBlock>docker --version{"\n"}docker info</CodeBlock>
          </li>
        </ol>
      </Step>
      <Step n={3} title="Install Git for Windows">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Download from{" "}
            <a href="https://git-scm.com/download/win" target="_blank" rel="noreferrer" className="text-primary underline">
              git-scm.com/download/win
            </a>{" "}
            and run the installer with defaults.
          </li>
          <li>
            Verify in PowerShell: <CodeBlock>git --version</CodeBlock>
          </li>
        </ol>
      </Step>

      <div className="pt-4 border-t border-border">
        <p className="eyebrow text-primary">Blockers we actually hit on Windows</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          If Docker Desktop won't start or npm scripts fail, work through these three. They are the same blockers referenced in the hackathon prompts.
        </p>
      </div>
      <BlockerList items={WINDOWS_BLOCKERS} />
    </div>
  );
}

function LinuxPanel() {
  return (
    <div className="space-y-6">
      <Step n={1} title="Install Docker Engine (no Docker Desktop needed)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Follow your distro's guide at{" "}
            <a href="https://docs.docker.com/engine/install/" target="_blank" rel="noreferrer" className="text-primary underline">
              docs.docker.com/engine/install
            </a>
            .
          </li>
          <li>
            Install the Compose plugin (Debian/Ubuntu example):
            <CodeBlock>sudo apt install docker-compose-plugin</CodeBlock>
          </li>
          <li>
            Add your user to the docker group, then log out &amp; back in:
            <CodeBlock>sudo usermod -aG docker $USER</CodeBlock>
          </li>
          <li>
            Verify: <CodeBlock>docker --version{"\n"}docker compose version</CodeBlock>
          </li>
        </ol>
      </Step>
      <Step n={2} title="Install Git">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Use your package manager, e.g.:
            <CodeBlock>sudo apt install git    # Debian/Ubuntu{"\n"}sudo dnf install git    # Fedora{"\n"}sudo pacman -S git      # Arch</CodeBlock>
          </li>
          <li>
            Verify: <CodeBlock>git --version</CodeBlock>
          </li>
        </ol>
      </Step>
    </div>
  );
}

const TABS: { id: OS; label: string }[] = [
  { id: "macos", label: "macOS" },
  { id: "windows", label: "Windows" },
  { id: "linux", label: "Linux" },
];

export function DockerSetupGuide({
  defaultOpen = false,
  defaultOs,
}: {
  defaultOpen?: boolean;
  defaultOs?: OS;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [os, setOs] = useState<OS>(defaultOs ?? "macos");

  useEffect(() => {
    if (!defaultOs) setOs(detectOS());
  }, [defaultOs]);

  return (
    <section
      id="docker-setup"
      className="border border-border bg-card"
      aria-label="Docker + Git setup prerequisites"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="eyebrow text-primary">Prerequisites</span>
          <p className="mt-1 text-sm text-foreground font-medium">
            Docker + Git setup — macOS, Windows &amp; Linux
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Install Docker Desktop / Engine + Git. Windows tab includes BIOS virtualization, WSL update, and PowerShell fixes we actually hit.
          </p>
        </div>
        <span className="text-primary text-[11px] uppercase tracking-[0.24em] shrink-0">
          {open ? "hide" : "show"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-4 sm:px-5 py-5">
          <div
            role="tablist"
            aria-label="Operating system"
            className="grid grid-cols-3 gap-2 mb-5"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={os === t.id}
                onClick={() => setOs(t.id)}
                className={`px-3 py-2 text-[10px] tracking-[0.28em] uppercase font-semibold border transition ${
                  os === t.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {os === "macos" && <MacOSPanel />}
          {os === "windows" && <WindowsPanel />}
          {os === "linux" && <LinuxPanel />}

          <p className="mt-6 pt-4 text-[11px] text-muted-foreground border-t border-border">
            Once <code>docker info</code> and <code>git --version</code> both work in a fresh terminal, continue with the Midnight proof server and local stack.
          </p>
        </div>
      )}
    </section>
  );
}

// Back-compat alias while consumers migrate. Prefer DockerSetupGuide.
export const WindowsSetupGuide = DockerSetupGuide;
