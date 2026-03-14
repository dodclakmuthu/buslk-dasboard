import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCompany } from '../contexts/CompanyContext';

/**
 * CompanyRoute — sits inside ProtectedRoute (auth already verified).
 * Allows access only when the user has an active company.
 * If no company → redirect to /company/new.
 */
export default function CompanyRoute() {
  const { hasCompany, isLoadingCompany } = useCompany();
  const location = useLocation();

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasCompany) {
    return <Navigate to="/company/new" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
