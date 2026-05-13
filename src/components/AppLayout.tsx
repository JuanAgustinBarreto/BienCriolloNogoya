import { Link, useRouterState, Outlet, Navigate, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, ShoppingBag, Receipt, BarChart3, LogOut, Shield, Eye } from "lucide-react";
import { Toaster } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ventas", label: "Ventas", icon: ShoppingBag },
  { to: "/gastos", label: "Gastos", icon: Receipt },
  { to: "/resumen", label: "Resumen", icon: BarChart3 },
] as const;

export function AppLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, ready, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (path === "/login") return <Outlet />;
  if (!user) return <Navigate to="/login" />;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <img
            src={logo}
            alt="Bien Criollo"
            className="size-12 rounded-full object-cover ring-2 ring-primary/50 shadow-glow"
          />
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

        {/* User card */}
        <div className="mt-auto space-y-2">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              {isAdmin ? (
                <Shield className="size-3.5 text-primary" />
              ) : (
                <Eye className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {isAdmin ? "Administrador" : "Solo lectura"}
              </span>
            </div>
            <div className="text-sm font-semibold truncate">{user.nombre}</div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:border-destructive hover:text-destructive px-2 py-1.5 text-xs transition-colors"
            >
              <LogOut className="size-3.5" /> Cerrar sesión
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground px-2">
            v1.0 · {new Date().getFullYear()}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Mobile top bar with user/logout */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-border bg-card/40 backdrop-blur">
          <div className="flex items-center gap-2 text-xs">
            {isAdmin ? <Shield className="size-3.5 text-primary" /> : <Eye className="size-3.5 text-muted-foreground" />}
            <span className="font-medium">{user.nombre}</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
            <LogOut className="size-3.5" /> Salir
          </button>
        </div>

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

      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        expand
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border border-border bg-card/90 backdrop-blur-xl shadow-glow text-sm",
            description: "text-muted-foreground",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-muted text-muted-foreground",
          },
        }}
      />
    </div>
  );
}
