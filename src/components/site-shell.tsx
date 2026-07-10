import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 sm:py-5 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 min-w-0 group">
          <span className="hidden sm:inline eyebrow shrink-0">Vol. 01</span>
          <span className="font-display text-lg sm:text-2xl truncate text-foreground">
            Creative <span className="italic text-primary">Midnight</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavLink to="/themes">Themes</NavLink>
          <NavLink to="/showcase">Showcase</NavLink>
          <NavLink to="/wallet">Wallet</NavLink>
          <NavLink to="/strategy">Strategy</NavLink>
          <NavLink to="/quantum-primer">Primer</NavLink>
          <NavLink to="/about">About</NavLink>
          <a
            href="https://creativequantum.lovable.app/"
            target="_blank"
            rel="noreferrer"
            className="ml-3 px-3 py-2 border border-border text-foreground text-[10px] font-semibold tracking-[0.28em] uppercase hover:border-primary/60 hover:text-primary transition-colors duration-500"
          >
            Hackathon ↗
          </a>
          <a
            href="https://docs.midnight.network/"
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-3 py-2 border border-border text-foreground text-[10px] font-semibold tracking-[0.28em] uppercase hover:border-primary/60 hover:text-primary transition-colors duration-500"
          >
            Midnight Docs ↗
          </a>
          <a
            href="https://preview.midnightexplorer.com/"
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] font-semibold tracking-[0.28em] uppercase hover:bg-foreground transition-colors duration-500"
          >
            Explorer ↗
          </a>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 border border-border text-foreground hover:border-primary/60 transition shrink-0"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background border-l border-border p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="font-display text-xl">Creative <span className="italic text-primary">Midnight</span></span>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-base">
              <MobileLink to="/themes" onClick={close}>Themes</MobileLink>
              <MobileLink to="/showcase" onClick={close}>Showcase</MobileLink>
              <MobileLink to="/wallet" onClick={close}>Wallet</MobileLink>
              <MobileLink to="/strategy" onClick={close}>Strategy</MobileLink>
              <MobileLink to="/quantum-primer" onClick={close}>Primer</MobileLink>
              <MobileLink to="/about" onClick={close}>About</MobileLink>
              <a
                href="https://creativequantum.lovable.app/"
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="mt-3 px-4 py-3 border border-border text-foreground text-[11px] tracking-[0.28em] uppercase font-semibold text-center"
              >
                Hackathon ↗
              </a>
              <a
                href="https://docs.midnight.network/"
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="mt-2 px-4 py-3 border border-border text-foreground text-[11px] tracking-[0.28em] uppercase font-semibold text-center"
              >
                Midnight Docs ↗
              </a>
              <a
                href="https://preview.midnightexplorer.com/"
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="mt-2 px-4 py-3 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold text-center"
              >
                Explorer ↗
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 text-[11px] tracking-[0.24em] uppercase font-medium text-muted-foreground hover:text-primary transition-colors duration-500"
      activeProps={{ className: "px-3 py-1.5 text-[11px] tracking-[0.24em] uppercase font-medium text-primary" }}
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-4 py-3 text-sm tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors border-b border-border/40"
      activeProps={{ className: "px-4 py-3 text-sm tracking-[0.18em] uppercase text-primary border-b border-border/40" }}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col gap-3 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>Vol. 01 · 1,000 entries · 10 disciplines</span>
          <span className="font-display normal-case tracking-normal text-base italic text-primary">Lovable × Midnight Network</span>
          <span>Compact · Lace · tDUST · MMXXVI</span>
        </div>
        <div className="border-t border-border/60 pt-3 normal-case tracking-normal text-[11px] font-light leading-relaxed text-muted-foreground/80">
          Built during the Creative AI &amp; Quantum Hackathon — organised by{" "}
          <span className="text-primary">StreetKode Fam</span> during Indian Krump Festival 14.
        </div>
      </div>
    </footer>
  );
}
