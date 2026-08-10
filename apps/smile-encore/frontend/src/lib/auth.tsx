import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import Client, { Local } from "./client";

const TOKEN_STORAGE_KEY = "smile_encore_token";

interface AuthContextValue {
  token: string | null;
  client: Client;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));

  const client = useMemo(
    () => new Client(Local, token ? { auth: { authorization: `Bearer ${token}` } } : undefined),
    [token],
  );

  // Unauthenticated client, used only for the login call itself.
  const anonClient = useMemo(() => new Client(Local), []);

  const login = async (username: string, password: string) => {
    const res = await anonClient.auth.login({ username, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, res.accessToken);
    setToken(res.accessToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  };

  return <AuthContext.Provider value={{ token, client, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
