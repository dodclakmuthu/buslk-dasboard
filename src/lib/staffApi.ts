import { apiRequest } from './api';

export type StaffRoleType = 'DRIVER' | 'CONDUCTOR' | 'DRIVER_CONDUCTOR';
export type EmploymentType = 'PERMANENT' | 'TEMPORARY' | 'DAILY_HIRE' | 'CONTRACT';

export type ApiStaff = {
  id: string;
  companyId: string;
  fullName: string;
  mobileNumber: string | null;
  nicNumber: string | null;
  roleType: StaffRoleType;
  employmentType: EmploymentType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateStaffInput = {
  fullName: string;
  mobileNumber?: string | null;
  nicNumber?: string | null;
  roleType: StaffRoleType;
  employmentType?: EmploymentType;
  isActive?: boolean;
};

export type UpdateStaffInput = Partial<CreateStaffInput>;

export async function listStaff(token: string): Promise<{ staff: ApiStaff[] }> {
  return apiRequest('/staff', { token });
}

export async function createStaff(token: string, input: CreateStaffInput): Promise<{ staff: ApiStaff }> {
  return apiRequest('/staff', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function updateStaff(token: string, id: string, input: UpdateStaffInput): Promise<{ staff: ApiStaff }> {
  return apiRequest(`/staff/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}
