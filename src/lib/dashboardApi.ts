import { apiRequest } from './api';

export type DashboardDateRange = {
  startDate: string;
  endDate: string;
  label: string;
  isSingleDay: boolean;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpenses: number;
  netDTI: number;
  tripsCompleted: number;
  totalTrips: number;
  inProgressTrips: number;
};

export type DashboardFleetStatus = {
  items: Array<{
    busId: string;
    registrationNumber: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD';
    route: {
      id: string;
      routeCode: string | null;
      routeName: string;
      startLocation: string;
      endLocation: string;
    } | null;
    tripCount: number;
    income: number;
    expense: number;
    badges: string[];
    hasInProgressTrip: boolean;
  }>;
  viewAllPath: string;
};

export type DashboardQuickStats = {
  activeBuses: number;
  drivers: number;
  conductors: number;
  passengersToday: number | null;
};

export type DashboardAlert = {
  id: string;
  type: 'maintenance' | 'trip_in_progress';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  targetPath: string;
};

export type DashboardExpenseBreakdownRow = {
  category: 'diesel' | 'expressway' | 'runner' | 'parking' | 'meals' | 'repairs' | 'other';
  amount: number;
};

export type DashboardReport = {
  dateRange: DashboardDateRange;
  summary: DashboardSummary;
  fleetStatus: DashboardFleetStatus;
  quickStats: DashboardQuickStats;
  alerts: DashboardAlert[];
  expenseBreakdown: DashboardExpenseBreakdownRow[];
};

export type DashboardReportParams = {
  date?: string;
  startDate?: string;
  endDate?: string;
};

export async function getDashboardReport(
  token: string,
  params: DashboardReportParams = {},
): Promise<DashboardReport> {
  const qs = new URLSearchParams();

  if (params.date) qs.set('date', params.date);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest(`/reports/dashboard${suffix}`, { token });
}