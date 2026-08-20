import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  getAccessToken,
  getSessionUser,
  clearSession,
  SessionUser,
} from "@/services/session";
import { esRolAdmin, esRolTecnico } from "@/services/auth.services";

type SessionContextType = {
  user: SessionUser | null;
  rol: string | null;
  isLogged: boolean;
  loading: boolean;
  isAdmin: boolean;
  isTecnico: boolean;
  login: (user: SessionUser) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const stored = await getSessionUser();
    setUser(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback((usuario: SessionUser) => {
    setUser(usuario);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo<SessionContextType>(() => {
    const rol = user?.rol ?? null;
    return {
      user,
      rol,
      isLogged: !!user,
      loading,
      isAdmin: esRolAdmin(rol),
      isTecnico: esRolTecnico(rol),
      login,
      logout,
      refreshSession,
    };
  }, [user, loading, login, logout, refreshSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}