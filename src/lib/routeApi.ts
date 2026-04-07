import { apiRequest } from './api';

export type StopInput = { locationName: string };

export type ApiRouteStop = {
  id: string;
  sequence: number;
  locationName: string;
};

export type ApiRouteScopeType = 'GLOBAL' | 'COMPANY_PRIVATE' | 'COMPANY_REQUEST';

export type ApiRouteApprovalStatus =
  | 'DRAFT'
  | 'PRIVATE_ACTIVE'
  | 'PENDING_APPROVAL'
  | 'PENDING_UPDATE_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'UPDATE_REJECTED';

export type ApiRouteLink = {
  id: string;
  routeNumber: string | null;
  routeCode: string | null;
  routeName: string;
};

export type ApiRouteUser = {
  id: string;
  fullName: string | null;
  mobileNumber: string | null;
};

export type ApiRouteHistorySnapshot = {
  rejectionReason?: string | null;
  routeNumber?: string | null;
  routeName?: string | null;
  approvalStatus?: ApiRouteApprovalStatus | null;
  startLocation?: string | null;
  endLocation?: string | null;
};

export type ApiRouteHistoryEntry = {
  id: string;
  routeId: string;
  versionNumber: number;
  snapshotJson: ApiRouteHistorySnapshot | null;
  snapshotHash: string;
  actionType: 'CREATED' | 'UPDATED' | 'SUBMITTED_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvalStatus: ApiRouteApprovalStatus;
  changedByUserId: string | null;
  reviewByUserId: string | null;
  changedByUser: ApiRouteUser | null;
  reviewedBy: ApiRouteUser | null;
  createdAt: string;
};

export type ApiRouteApprovalStatusSummary = {
  routeId: string;
  approvalStatus: ApiRouteApprovalStatus;
  updateApprovalNeeded: boolean;
  rejectionReason: string | null;
  reviewedByUserId: string | null;
  globalRouteId: string | null;
  lastSubmittedAt: string | null;
  lastApprovedAt: string | null;
  latestApprovedVersion: ApiRouteHistoryEntry | null;
};

export type ApiRoute = {
  id: string;
  companyId: string | null;
  routeNumber: string | null;
  routeCode: string | null;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number | null;
  description: string | null;
  downIsReverseOfUp: boolean;
  sourceType: ApiRouteScopeType;
  approvalStatus: ApiRouteApprovalStatus;
  approvedSnapshotHash?: string | null;
  adminNotes?: string | null;
  rejectionReason: string | null;
  globalRouteId?: string | null;
  globalRoute?: ApiRouteLink | null;
  updateApprovalNeeded?: boolean;
  lastSubmittedAt?: string | null;
  lastApprovedAt?: string | null;
  requestedAt?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  isActive: boolean;
  upStops: ApiRouteStop[];
  downStops: ApiRouteStop[];
  createdAt: string;
  updatedAt: string;
};

export type ApiCompanyRoute = ApiRoute;

export type ApiGlobalRoute = ApiRoute;

export type CreateCompanyRouteInput = {
  routeNumber: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distanceKm?: number;
  description?: string;
  upStops: StopInput[];
  downIsReverseOfUp: boolean;
  downStops?: StopInput[];
};

export type UpdateCompanyRouteInput = Partial<CreateCompanyRouteInput> & {
  isActive?: boolean;
};

export async function listGlobalRoutes(token: string): Promise<{ routes: ApiGlobalRoute[] }> {
  return apiRequest('/company-routes/global', { token });
}

export async function listCompanyRoutes(
  token: string,
  approvalStatus?: ApiRouteApprovalStatus,
): Promise<{ routes: ApiCompanyRoute[] }> {
  const query = approvalStatus ? `?approvalStatus=${encodeURIComponent(approvalStatus)}` : '';
  return apiRequest(`/company-routes${query}`, { token });
}

export async function getCompanyRoute(
  token: string,
  id: string,
): Promise<{ route: ApiCompanyRoute }> {
  return apiRequest(`/company-routes/${id}`, { token });
}

export async function createCompanyRoute(
  token: string,
  input: CreateCompanyRouteInput,
): Promise<{ route: ApiCompanyRoute }> {
  return apiRequest('/company-routes', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function updateCompanyRoute(
  token: string,
  id: string,
  input: UpdateCompanyRouteInput,
): Promise<{ route: ApiCompanyRoute }> {
  return apiRequest(`/company-routes/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

export async function submitCompanyRouteForApproval(
  token: string,
  id: string,
): Promise<{ route: ApiCompanyRoute }> {
  return apiRequest(`/company-routes/${id}/submit-for-approval`, {
    method: 'POST',
    token,
  });
}

export async function getCompanyRouteHistory(
  token: string,
  id: string,
): Promise<{ history: ApiRouteHistoryEntry[] }> {
  return apiRequest(`/company-routes/${id}/history`, { token });
}

export async function getCompanyRouteApprovalStatus(
  token: string,
  id: string,
): Promise<ApiRouteApprovalStatusSummary> {
  return apiRequest(`/company-routes/${id}/approval-status`, { token });
}
