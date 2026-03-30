import { apiRequest } from './api';

// ── Response shapes (mirrors backend BusSettlementCard / BusSettlementDetail) ──

export type ApiSettlementCard = {
  busId: string;
  registrationNumber: string;
  busName: string | null;
  route: { id: string; routeName: string; routeCode: string | null } | null;
  date: string;
  /** 'percentage' | 'fixed' */
  wageType: string;
  totalIncome: number;
  totalExpenses: number;
  dti: number;
  driverSalary: number;
  conductorSalary: number;
  netProfit: number;
  driverPercentage: number | null;
  conductorPercentage: number | null;
  fixedDriverWage: number | null;
  fixedConductorWage: number | null;
  isLocked: boolean;
};

export type ApiSettlementSummary = {
  totalIncome: number;
  totalExpenses: number;
  totalSalaries: number;
  netProfit: number;
};

export type ApiSettlementListResponse = {
  date: string;
  summary: ApiSettlementSummary;
  buses: ApiSettlementCard[];
};

export type ApiSettlementTrip = {
  id: string;
  tripNumber: number;
  direction: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  income: number;
};

export type ApiSettlementExpense = {
  id: string;
  tripId: string | null;
  category: string;
  amount: number;
  description: string | null;
};

export type ApiSettlementDetailResponse = ApiSettlementCard & {
  breakdown: {
    tripIncome: number;
    extraIncome: number;
    operationalIncome: number;
    tripExpenses: number;
    operationalExpenses: number;
  };
  trips: ApiSettlementTrip[];
  expenses: ApiSettlementExpense[];
};

// ── API functions ──────────────────────────────────────────────────────────────

/** GET /settlements?date=YYYY-MM-DD */
export async function listSettlements(
  token: string,
  date: string,
): Promise<ApiSettlementListResponse> {
  return apiRequest<ApiSettlementListResponse>(
    `/settlements?date=${encodeURIComponent(date)}`,
    { token },
  );
}

/** GET /settlements/:busId?date=YYYY-MM-DD */
export async function getBusSettlementDetail(
  token: string,
  busId: string,
  date: string,
): Promise<ApiSettlementDetailResponse> {
  return apiRequest<ApiSettlementDetailResponse>(
    `/settlements/${encodeURIComponent(busId)}?date=${encodeURIComponent(date)}`,
    { token },
  );
}

/** POST /settlements/:busId/lock — body: { date } */
export async function lockBusSettlement(
  token: string,
  busId: string,
  date: string,
): Promise<ApiSettlementDetailResponse> {
  return apiRequest<ApiSettlementDetailResponse>(
    `/settlements/${encodeURIComponent(busId)}/lock`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ date }),
    },
  );
}

/** POST /settlements/lock-all?date=YYYY-MM-DD */
export async function lockAllSettlements(
  token: string,
  date: string,
): Promise<{ date: string; locked: number; failed: number }> {
  return apiRequest(
    `/settlements/lock-all?date=${encodeURIComponent(date)}`,
    { method: 'POST', token },
  );
}
