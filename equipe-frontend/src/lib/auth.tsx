import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; level: string }) => Promise<void>;
  logout: () => void;
  update: (patch: Partial<BuzzUser>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const KEY = "buzz.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BuzzUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (err) {
      console.warn("Falha ao ler dados de autenticação local:", err);
    }
    setLoading(false);
  }, []);

  const persist = (u: BuzzUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(KEY);
    }
  };

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const existing = localStorage.getItem(KEY);
    if (existing) {
      const u = JSON.parse(existing) as BuzzUser;
      if (u.email.toLowerCase() === email.toLowerCase()) {
        persist(u);
        return;
      }
    }
    const u: BuzzUser = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      level: "Residencial",
      createdAt: new Date().toISOString(),
      onboarded: false,
    };
    persist(u);
  };

  const signup: AuthCtx["signup"] = async ({ name, email, level }) => {
    await new Promise((r) => setTimeout(r, 700));
    const u: BuzzUser = {
      id: crypto.randomUUID(),
      name,
      email,
      level,
      createdAt: new Date().toISOString(),
      onboarded: false,
    };
    persist(u);
  };

  const logout = () => persist(null);
  const update = (patch: Partial<BuzzUser>) => {
    if (!user) return;
    persist({ ...user, ...patch });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
