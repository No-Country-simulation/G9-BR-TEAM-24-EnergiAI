import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getStoredToken, setStoredToken } from "./api";

export interface BuzzUser {
  id: string;
  name: string;
  email: string;
  level: string;
  createdAt: string;
  xp?: number;
  streak?: number;
  onboarded: boolean;
}

interface AuthCtx {
  user: BuzzUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; level: string }) => Promise<void>;
  logout: () => void;
  update: (patch: Partial<BuzzUser>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const USER_KEY = "buzz.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BuzzUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = getStoredToken();
      const rawUser = localStorage.getItem(USER_KEY);
      if (savedToken && rawUser) {
        setToken(savedToken);
        setUser(JSON.parse(rawUser));
      }
    } catch (err) {
      console.warn("Falha ao inicializar autenticação:", err);
      logout();
    } finally {
      setLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("buzz:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("buzz:unauthorized", handleUnauthorized);
  }, []);

  const persist = (newToken: string | null, u: BuzzUser | null) => {
    setToken(newToken);
    setUser(u);
    setStoredToken(newToken);
    if (u) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    const u: BuzzUser = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      level: res.user.level || "Residencial",
      createdAt: res.user.createdAt || new Date().toISOString(),
      onboarded: res.user.onboarded ?? true,
    };
    persist(res.token, u);
  };

  const signup: AuthCtx["signup"] = async ({ name, email, password, level }) => {
    const res = await api.register({ name, email, password, level });
    const u: BuzzUser = {
      id: res.user.id,
      name: res.user.name || name,
      email: res.user.email || email,
      level: res.user.level || level,
      createdAt: res.user.createdAt || new Date().toISOString(),
      onboarded: false,
    };
    persist(res.token, u);
  };

  const logout = () => persist(null, null);

  const update = (patch: Partial<BuzzUser>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    persist(token, updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
