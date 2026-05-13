import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "general";
export type AuthUser = { id: string; username: string; nombre: string; role: Role };

const STORAGE_KEY = "bc_auth_user";

type Ctx = {
  user: AuthUser | null;
  isAdmin: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const login = async (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    if (!u || !password) return { ok: false, error: "Completá usuario y contraseña" };
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, username, password, nombre, role")
        .eq("username", u)
        .maybeSingle();
      if (error) return { ok: false, error: "Error al conectar con el servidor" };
      if (!data || data.password !== password) {
        return { ok: false, error: "Usuario o contraseña incorrectos" };
      }
      const authUser: AuthUser = {
        id: data.id,
        username: data.username,
        nombre: data.nombre,
        role: (data.role === "admin" ? "admin" : "general") as Role,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return { ok: true };
    } catch {
      return { ok: false, error: "Error inesperado al iniciar sesión" };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === "admin", ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
