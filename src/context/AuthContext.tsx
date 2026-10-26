import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { checkCredentials } from '../lib/auth';
import type { User } from '../types';

const STORAGE_KEY = 'salespulse.user';
const FAKE_NETWORK_DELAY_MS = 300;

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked. The app still works for this session.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, FAKE_NETWORK_DELAY_MS));
    const found = checkCredentials(email, password);
    if (!found) throw new Error('Invalid email or password');
    storeUser(found);
    setUser(found);
  }, []);

  const logout = useCallback(() => {
    storeUser(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
