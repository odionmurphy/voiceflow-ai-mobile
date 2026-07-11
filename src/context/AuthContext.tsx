import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../utils/storage";
import { AuthUser } from "../types/auth";
import { fetchMe } from "../api/auth";

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        setToken(stored);
        try {
          const me = await fetchMe();
          setUser(me);
        } catch {
          // Token expired or invalid - clear it so the user is sent back to login
          await removeToken();
          setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function signIn(newToken: string, newUser: AuthUser) {
    await saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function signOut() {
    await removeToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
