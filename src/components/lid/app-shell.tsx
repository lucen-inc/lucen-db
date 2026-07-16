import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Network,
  KanbanSquare,
  Newspaper,
  FileText,
  Command,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { useEffect, useState, type ReactNode } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/organizations", label: "Organizations", icon: Building2 },
  { to: "/people", label: "People", icon: Users },
  { to: "/graph", label: "Relationship Graph", icon: Network },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/news", label: "Intelligence Feed", icon: Newspaper },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="dark min-h-screen text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-border/60 bg-sidebar/70 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-cyan to-holo shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent" />
              <span className="relative font-mono text-[13px] font-bold tracking-tight text-black">
                LID
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold leading-tight">Lucen Intelligence</div>
              <div className="text-[11px] leading-tight text-muted-foreground">
                Database · v1.0
              </div>
            </div>
          </div>

          <button
            onClick={() => setCmdOpen(true)}
            className="mx-3 mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-elevated/50 px-3 py-2 text-left text-[13px] text-muted-foreground transition hover:border-cyan/40 hover:text-foreground"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="flex-1">Search everything…</span>
            <kbd className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>

          <nav className="flex-1 space-y-0.5 px-3">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-elevated text-foreground shadow-inner"
                      : "text-muted-foreground hover:bg-elevated/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      active ? "text-cyan" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_10px_var(--cyan)]" />}
                </Link>
              );
            })}
          </nav>

          <div className="m-3 rounded-xl border border-border/60 bg-gradient-to-br from-cyan/10 to-holo/10 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan" />
              <div className="text-[12px] font-medium">Intelligence Copilot</div>
            </div>
            <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              Ask questions across every entity, relationship and signal.
            </div>
          </div>

          <div className="border-t border-border/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-holo to-cyan text-[11px] font-semibold text-black">
                NM
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium">N. Al Mansouri</div>
                <div className="truncate text-[10.5px] text-muted-foreground">Admin · Sales</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 px-8 py-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
