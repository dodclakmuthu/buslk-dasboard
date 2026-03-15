import { apiRequest } from './api';

export type BusStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD';

export type ApiBus = {
  id: string;
  companyId: string;
  registrationNumber: string;
  busName?: string | null;
  ntcPermitNumber?: string | null;
  routeId?: string | null;
  seatCount?: number | null;
  defaultDriverStaffId?: string | null;
  defaultConductorStaffId?: string | null;
  status: BusStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  route?: { id: string; routeName: string; routeCode?: string | null } | null;
};

export type CreateBusInput = {
  registrationNumber: string;
  busName?: string;
  ntcPermitNumber?: string;
  seatCount?: number;
  status?: BusStatus;
};

export type UpdateBusInput =
  Partial<CreateBusInput> & {
    defaultDriverStaffId?: string | null;
    defaultConductorStaffId?: string | null;
  };

export async function listBuses(token: string): Promise<{ buses: ApiBus[] }> {
  return apiRequest('/buses', { token });
}

export async function createBus(token: string, input: CreateBusInput): Promise<{ bus: ApiBus }> {
  return apiRequest('/buses', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function updateBus(token: string, id: string, input: UpdateBusInput): Promise<{ bus: ApiBus }> {
  return apiRequest(`/buses/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

export async function setBusPin(token: string, id: string, pin: string): Promise<{ pin: any }> {
  return apiRequest(`/buses/${id}/pin`, {
    method: 'POST',
    token,
    body: JSON.stringify({ pin }),
  });
}

export async function resetBusPin(token: string, id: string, pin: string): Promise<{ pin: any }> {
  return apiRequest(`/buses/${id}/pin/reset`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ pin }),
  });
}

export async function updateBusStatus(token: string, id: string, status: BusStatus): Promise<{ bus: ApiBus }> {
  return apiRequest(`/buses/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}
