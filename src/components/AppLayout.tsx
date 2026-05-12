import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ShoppingBag, Receipt, BarChart3, Pizza } from "lucide-react";
import { Toaster } from "sonner";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ventas", label: "Ventas", icon: ShoppingBag },
  { to: "/gastos", label: "Gastos", icon: Receipt },
  { to: "/resumen", label: "Resumen", icon: BarChart3 },
] as const;

export function AppLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Pizza className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold leading-tight">Bien Criollo</div>
            <div className="text-xs text-muted-foreground">Pizzería</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-primary/15 text-primary font-medium shadow-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-[11px] text-muted-foreground px-2">
          v1.0 · {new Date().getFullYear()}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-border">
        <div className="grid grid-cols-4">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}
