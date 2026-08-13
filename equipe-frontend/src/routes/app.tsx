import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  BarChart3,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getStoredToken } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    const token = getStoredToken();
    if (!token) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AppShell,
});

const NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/entries", label: "Solicitar Análise", icon: PlusCircle },
  { to: "/app/analysis", label: "Resultado", icon: Sparkles },
  { to: "/app/stats", label: "Estatísticas", icon: BarChart3 },
  { to: "/app/settings", label: "Configurações", icon: Settings },
] as const;

function AppShell() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="animate-pulse text-muted-foreground">Carregando dados da sessão…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 p-5">
          <div className="grid size-9 place-items-center rounded-xl gradient-primary-bg shadow-glow">
            <Zap className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Buzz</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary"
                  />
                )}
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="grid size-8 place-items-center rounded-lg gradient-primary-bg">
                <Zap className="size-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Buzz</span>
            </div>

            <div className="hidden lg:block text-sm text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border bg-card px-2 py-1.5 pr-3 hover:bg-accent/10">
                    <div className="grid size-7 place-items-center rounded-full gradient-primary-bg text-xs font-bold text-primary-foreground">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>
                    <Settings className="mr-2 size-4" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/login" });
                    }}
                  >
                    <LogOut className="mr-2 size-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border bg-background/85 p-1 backdrop-blur-xl shadow-soft lg:hidden">
        {NAV.map((n) => {
          const active = pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px]",
                active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
              )}
            >
              <n.icon className="size-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
