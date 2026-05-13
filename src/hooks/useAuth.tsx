import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "general";
export type AuthUser = { username: string; nombre: string; role: Role };

const USERS: Record<string, { password: string; nombre: string; role: Role }> = {
  diego: { password: "diego123", nombre: "Diego", role: "admin" },
  ariel: { password: "ariel123", nombre: "Ariel", role: "admin" },
  usuario: { password: "1234", nombre: "Usuario General", role: "general" },
};

const STORAGE_KEY = "bc_auth_user";

type Ctx = {
  user: AuthUser | null;
  isAdmin: boolean;
  ready: boolean;
  login: (username: string, password: string) => { ok: boolean; error?: string };
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

  const login = (username: string, password: string) => {
    const u = USERS[username.trim().toLowerCase()];
    if (!u || u.password !== password) return { ok: false, error: "Usuario o contraseña incorrectos" };
    const authUser: AuthUser = { username: username.trim().toLowerCase(), nombre: u.nombre, role: u.role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { ok: true };
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
