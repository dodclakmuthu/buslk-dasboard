import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiCompany, getMyCompany } from '../lib/companyApi';
import { ApiError } from '../lib/api';
import { useAuth } from './AuthContext';

type LoadStatus = 'loading' | 'done';

type CompanyState = {
  company: ApiCompany | null;
  /** True while the initial company fetch is in-flight (including while auth resolves). */
  isLoadingCompany: boolean;
  hasCompany: boolean;
  refreshCompany: () => Promise<void>;
  /** Optimistically update after create/update without re-fetching. */
  setCompany: (c: ApiCompany | null) => void;
};

const CompanyContext = createContext<CompanyState | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const refreshCompany = useCallback(async () => {
    if (!token) {
      setCompany(null);
      setStatus('done');
      return;
    }
    setStatus('loading');
    try {
      const res = await getMyCompany(token);
      setCompany(res.company);
    } catch (err) {
      // 403 = no company yet, 404 = same — not an error that should break the app
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setCompany(null);
      } else {
        // Unexpected error — still clear company so guard can redirect
        setCompany(null);
      }
    } finally {
      setStatus('done');
    }
  }, [token]);

  useEffect(() => {
    if (isAuthLoading) {
      setStatus('loading');
      return;
    }
    if (!isAuthenticated) {
      setCompany(null);
      setStatus('done');
      return;
    }
    void refreshCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading, token]);

  const value = useMemo<CompanyState>(
    () => ({
      company,
      isLoadingCompany: status === 'loading',
      hasCompany: !!company,
      refreshCompany,
      setCompany,
    }),
    [company, status, refreshCompany],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany(): CompanyState {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
