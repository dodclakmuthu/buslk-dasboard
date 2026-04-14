import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCompany } from '../contexts/CompanyContext';
import { GuardScreenSkeleton } from './PageSkeletons';

/**
 * CompanyRoute — sits inside ProtectedRoute (auth already verified).
 * Allows access only when the user has an active company.
 * If no company → redirect to /company/new.
 */
export default function CompanyRoute() {
  const { hasCompany, isLoadingCompany } = useCompany();
  const location = useLocation();

  if (isLoadingCompany) {
    return <GuardScreenSkeleton />;
  }

  if (!hasCompany) {
    return <Navigate to="/company/new" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
