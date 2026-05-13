import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (ready && user) return <Navigate to="/" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "No se pudo iniciar sesión");
      return;
    }
    toast.success("Bienvenido");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 size-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-glow">
          <div className="flex flex-col items-center text-center mb-8">
            <motion.img
              src={logo}
              alt="Bien Criollo"
              initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
              className="size-24 rounded-full object-cover ring-4 ring-primary/40 shadow-glow mb-4"
            />
            <h1 className="text-2xl font-bold text-gradient">Pizzas Bien Criollo</h1>
            <p className="text-sm text-muted-foreground mt-1">Iniciá sesión para continuar</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Usuario</span>
              <div className="relative">
                <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="diego, ariel o usuario"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Contraseña</span>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
            >
              <LogIn className="size-4" />
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/60 text-[11px] text-muted-foreground text-center space-y-1">
            <p><span className="text-primary font-medium">Admin:</span> diego / ariel</p>
            <p><span className="text-primary font-medium">Público:</span> usuario / 1234</p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          © {new Date().getFullYear()} Pizzas Bien Criollo
        </p>
      </motion.div>
    </div>
  );
}
