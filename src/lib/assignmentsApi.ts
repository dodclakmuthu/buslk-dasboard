import { apiRequest } from './api';
import type { StaffRoleType } from './staffApi';

export type AssignmentStatus = 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export type AssignmentStaff = {
  id: string;
  fullName: string;
  roleType: StaffRoleType;
};

export type AssignmentBus = {
  id: string;
  registrationNumber: string;
  status: string;
};

export type ApiAssignment = {
  id: string;
  companyId: string;
  busId: string;
  assignmentDate: string;
  driverStaffId: string;
  conductorStaffId: string;
  assignedByUserId: string;
  status: AssignmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bus: AssignmentBus;
  driver: AssignmentStaff;
  conductor: AssignmentStaff;
};

export type CreateAssignmentInput = {
  busId: string;
  assignmentDate: string; // YYYY-MM-DD or ISO
  driverStaffId?: string;
  conductorStaffId?: string;
  notes?: string | null;
};

export type UpdateAssignmentInput = {
  assignmentDate?: string;
  driverStaffId?: string;
  conductorStaffId?: string;
  status?: AssignmentStatus;
  notes?: string | null;
};

export async function listAssignments(
  token: string,
  params?: { date?: string; busId?: string },
): Promise<{ assignments: ApiAssignment[] }> {
  const qp = new URLSearchParams();
  if (params?.date) qp.set('date', params.date);
  if (params?.busId) qp.set('busId', params.busId);
  const suffix = qp.toString() ? `?${qp.toString()}` : '';
  return apiRequest(`/assignments${suffix}`, { token });
}

export async function createAssignment(token: string, input: CreateAssignmentInput): Promise<{ assignment: ApiAssignment }> {
  return apiRequest('/assignments', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function updateAssignment(token: string, id: string, input: UpdateAssignmentInput): Promise<{ assignment: ApiAssignment }> {
  return apiRequest(`/assignments/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}
