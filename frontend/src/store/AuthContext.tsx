import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, type PublicUser } from "../api/auth";

type AuthContextValue = {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  setSession: (token: string, user: PublicUser) => void;
  updateUser: (user: PublicUser) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "levelup_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchMe(token)
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  function setSession(newToken: string, newUser: PublicUser) {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function updateUser(newUser: PublicUser) {
    setUser(newUser);
  }

  async function refreshUser() {
    if (!token) return;
    const { user } = await fetchMe(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setSession, updateUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
