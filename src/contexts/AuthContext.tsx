import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../lib/authApi';

type AuthState = {
  token: string | null;
  user: authApi.AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: authApi.LoginInput) => Promise<void>;
  signup: (input: authApi.SignupInput) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'busapp.accessToken';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<authApi.AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  const persistToken = useCallback((nextToken: string | null) => {
    setToken(nextToken);
    try {
      if (nextToken) localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      else localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.me(token);
      setUser(res.user);
    } catch {
      persistToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [persistToken, token]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (input: authApi.LoginInput) => {
      const res = await authApi.login(input);
      persistToken(res.accessToken);
      setUser(res.user);
    },
    [persistToken],
  );

  const signup = useCallback(async (input: authApi.SignupInput) => {
    const res = await authApi.signup(input);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
    setIsLoading(false);
  }, [persistToken]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
      refreshMe,
    }),
    [token, user, isLoading, login, signup, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
