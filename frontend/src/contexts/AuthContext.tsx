import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TokenPair } from '../types';
import * as authService from '../services/auth.service';
import { setTokens, clearTokens } from '../services/api.client';

function parseJwt(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.userId, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const parsed = parseJwt(token);
      if (parsed) setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await authService.login(email, password);
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setUser(data.user);
  }

  async function register(email: string, password: string, firstName?: string, lastName?: string) {
    const data = await authService.register(email, password, firstName, lastName);
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setUser(data.user);
  }

  async function logout() {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      try { await authService.logout(refresh); } catch { /* ignore */ }
    }
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useTokenPair(): TokenPair | null {
  const access = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');
  if (access && refresh) return { accessToken: access, refreshToken: refresh };
  return null;
}
