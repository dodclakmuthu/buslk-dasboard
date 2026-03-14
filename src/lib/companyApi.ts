import { apiRequest } from './api';

export type ApiCompany = {
  id: string;
  name: string;
  ownerUserId: string;
  businessType: string;
  mobileNumber: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCompanyInput = {
  name: string;
  businessType?: string;
  mobileNumber?: string;
  address?: string;
};

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export async function getMyCompany(token: string): Promise<{ company: ApiCompany }> {
  return apiRequest('/companies/my', { token });
}

export async function createCompany(
  token: string,
  input: CreateCompanyInput,
): Promise<{ company: ApiCompany }> {
  return apiRequest('/companies', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function updateMyCompany(
  token: string,
  input: UpdateCompanyInput,
): Promise<{ company: ApiCompany }> {
  return apiRequest('/companies/my', {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}
