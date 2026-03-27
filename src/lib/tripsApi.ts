import { apiRequest } from './api';
import type { Expense, ExtraIncome, Trip } from '@/data/types';

export type ApiTrip = {
  id: string;
  busId: string;
  driverId: string;
  conductorId?: string | null;
  routeId?: string | null;
  date: string;
  tripNumber: number;
  startPointId: string;
  endPointId?: string | null;
  startTime: string;
  endTime?: string | null;
  status: string;
  income?: number | null;
  passengerCount?: number | null;
  notes?: string | null;
};

export type TripManagementSummary = {
  bus: {
    id: string;
    registrationNumber: string;
    busName?: string | null;
    status: string;
    route?: { id: string; routeCode?: string | null; routeName: string; startLocation?: string; endLocation?: string } | null;
  };
  date: string;
  tripsToday: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  activeTrip: { id: string; tripNumber: number; status: string; startedAt: string | null } | null;
  todayTrips: ApiTrip[];
  todayExpenses: Array<{
    id: string;
    tripId?: string | null;
    busId: string;
    date: string;
    category: string;
    amount: number;
    description?: string | null;
    enteredBy?: string | null;
    timestamp: string;
  }>;
  todayExtraIncomes?: Array<{
    id: string;
    tripId?: string | null;
    busId: string;
    date: string;
    category: string;
    amount: number;
    description?: string | null;
    enteredBy?: string | null;
    timestamp: string;
  }>;
  todayOperationalExpenses?: Array<{
    id: string;
    tripId?: string | null;
    busId: string;
    date: string;
    category: string;
    amount: number;
    description?: string | null;
    enteredBy?: string | null;
    timestamp: string;
  }>;
  todayOperationalIncomes?: Array<{
    id: string;
    tripId?: string | null;
    busId: string;
    date: string;
    category: string;
    amount: number;
    description?: string | null;
    enteredBy?: string | null;
    timestamp: string;
  }>;
};

function mapApiTrip(t: ApiTrip): Trip {
  return {
    id: t.id,
    busId: t.busId,
    driverId: t.driverId,
    conductorId: t.conductorId || '',
    routeId: t.routeId || '',
    date: t.date,
    tripNumber: t.tripNumber,
    startPointId: t.startPointId,
    endPointId: t.endPointId || undefined,
    startTime: t.startTime,
    endTime: t.endTime || undefined,
    status: (t.status as any) as any,
    income: typeof t.income === 'number' ? t.income : (t.income ? Number(t.income) : 0),
    passengerCount: t.passengerCount ?? undefined,
    notes: t.notes ?? undefined,
  } as Trip;
}

function mapExtraIncomeCategory(category: string): ExtraIncome['category'] {
  const raw = (category || '').trim();
  const lower = raw.toLowerCase();
  const upper = raw.toUpperCase();

  if (upper === 'PARCEL' || lower === 'parcel') return 'PARCEL';
  if (upper === 'BAGGAGE' || lower === 'baggage') return 'BAGGAGE';
  if (upper === 'OTHER_EXTRA_INCOME' || lower === 'other_extra_income' || upper === 'OTHER') {
    return 'OTHER_EXTRA_INCOME';
  }

  return 'OTHER_EXTRA_INCOME';
}

function mapApiExpense(e: TripManagementSummary['todayExpenses'][number]): Expense {
  return {
    id: e.id,
    tripId: e.tripId ?? undefined,
    busId: e.busId,
    date: e.date,
    category: (e.category as any) as any,
    amount: e.amount,
    description: e.description ?? undefined,
    enteredBy: e.enteredBy ?? 'system',
    timestamp: e.timestamp,
  };
}

function mapApiExtraIncome(e: NonNullable<TripManagementSummary['todayExtraIncomes']>[number]): ExtraIncome {
  return {
    id: e.id,
    tripId: e.tripId ?? undefined,
    busId: e.busId,
    date: e.date,
    category: mapExtraIncomeCategory(e.category),
    amount: e.amount,
    note: e.description ?? undefined,
    enteredBy: e.enteredBy ?? 'system',
    timestamp: e.timestamp,
  };
}

export type TripManagementUiData = {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  tripsToday: number;
  activeTripId: string | null;
  todayTrips: Trip[];
  todayExpenses: Expense[];
  todayExtraIncomes: ExtraIncome[];
  todayOperationalExpenses: Expense[];
  todayOperationalIncomes: ExtraIncome[];
};

export function mapTripManagementSummaryToUi(summary: TripManagementSummary): TripManagementUiData {
  return {
    totalIncome: summary.totalIncome ?? 0,
    totalExpenses: summary.totalExpenses ?? 0,
    netAmount: summary.netAmount ?? 0,
    tripsToday: summary.tripsToday ?? 0,
    activeTripId: summary.activeTrip?.id ?? null,
    todayTrips: (summary.todayTrips ?? []).map(mapApiTrip),
    todayExpenses: (summary.todayExpenses ?? []).map(mapApiExpense),
    todayExtraIncomes: (summary.todayExtraIncomes ?? []).map(mapApiExtraIncome),
    todayOperationalExpenses: (summary.todayOperationalExpenses ?? []).map(mapApiExpense),
    todayOperationalIncomes: (summary.todayOperationalIncomes ?? []).map(mapApiExtraIncome),
  };
}

export async function listTrips(token?: string): Promise<Trip[]> {
  const res = await apiRequest<{ trips: ApiTrip[] }>('/trips', { token });
  if (!res || !Array.isArray((res as any).trips)) return [];
  return (res.trips as ApiTrip[]).map(mapApiTrip);
}

export async function listTripsForBus(
  token: string,
  params: { busId?: string; date?: string; today?: boolean } = {},
): Promise<Trip[]> {
  const qs = new URLSearchParams();
  if (params.busId) qs.set('busId', params.busId);
  if (params.date) qs.set('date', params.date);
  if (params.today) qs.set('today', 'true');
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await apiRequest<{ trips: ApiTrip[] }>(`/trips${suffix}`, { token });
  if (!res || !Array.isArray((res as any).trips)) return [];
  return (res.trips as ApiTrip[]).map(mapApiTrip);
}

export async function getTripManagementSummary(
  token: string,
  busId: string,
  params: { date?: string; today?: boolean } = { today: true },
): Promise<TripManagementSummary> {
  const qs = new URLSearchParams({ busId });
  if (params.date) qs.set('date', params.date);
  if (params.today) qs.set('today', 'true');
  return apiRequest(`/trips/summary?${qs.toString()}`, { token });
}

export async function startTrip(
  token: string,
  input: {
    busId: string;
    direction?: 'UP' | 'DOWN';
    driverStaffId?: string;
    conductorStaffId?: string;
    routeId?: string;
    startStopId?: string;
    endStopId?: string;
  },
): Promise<{ trip: ApiTrip }> {
  return apiRequest('/trips/start', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function addTripExpense(
  token: string,
  tripId: string,
  input: { category: string; amount: number; note?: string },
): Promise<{ expense: any }> {
  return apiRequest(`/trips/${tripId}/expenses`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function addTripExtraIncome(
  token: string,
  tripId: string,
  input: { category: string; amount: number; note?: string },
): Promise<{ extraIncome: any }> {
  return apiRequest(`/trips/${tripId}/extra-incomes`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function endTrip(
  token: string,
  tripId: string,
  input: { income: number; endStopId?: string; note?: string; endedAt?: string },
): Promise<{ trip: ApiTrip }> {
  return apiRequest(`/trips/${tripId}/end`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export default { listTrips };
