import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../lib/authApi';
import { COOKIE_SESSION_TOKEN } from '../lib/api';
import type { SignupChallenge } from '../lib/pendingSignup';

type AuthState = {
  token: string | null;
  user: authApi.AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: authApi.LoginInput) => Promise<void>;
  signup: (input: authApi.SignupInput) => Promise<SignupChallenge>;
  verifySignupOtp: (input: authApi.VerifySignupOtpInput) => Promise<void>;
  resendSignupOtp: (challengeId: string) => Promise<SignupChallenge>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<authApi.AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistToken = useCallback((nextToken: string | null) => {
    setToken(nextToken);
  }, []);

  const refreshMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authApi.me();
      setUser(res.user);
      persistToken(COOKIE_SESSION_TOKEN);
    } catch {
      persistToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [persistToken]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (input: authApi.LoginInput) => {
      const res = await authApi.login(input);
      persistToken(COOKIE_SESSION_TOKEN);
      setUser(res.user);
      setIsLoading(false);
    },
    [persistToken],
  );

  const signup = useCallback(async (input: authApi.SignupInput) => {
    const res = await authApi.signup(input);
    persistToken(null);
    setUser(null);
    setIsLoading(false);
    return res.challenge;
  }, [persistToken]);

  const verifySignupOtp = useCallback(async (input: authApi.VerifySignupOtpInput) => {
    const res = await authApi.verifySignupOtp(input);
    persistToken(COOKIE_SESSION_TOKEN);
    setUser(res.user);
    setIsLoading(false);
  }, [persistToken]);

  const resendSignupOtp = useCallback(async (challengeId: string) => {
    const res = await authApi.resendSignupOtp(challengeId);
    return res.challenge;
  }, []);

  const logout = useCallback(() => {
    void authApi.logout().catch(() => undefined);
    persistToken(null);
    setUser(null);
    setIsLoading(false);
  }, [persistToken]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      signup,
      verifySignupOtp,
      resendSignupOtp,
      logout,
      refreshMe,
    }),
    [token, user, isLoading, login, signup, verifySignupOtp, resendSignupOtp, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
