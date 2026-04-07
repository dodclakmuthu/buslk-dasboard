import { apiRequest } from './api';

// ── Shared ────────────────────────────────────────────────────────────────────

export type ReportPeriod = {
  date?: string;
  startDate?: string;
  endDate?: string;
};

function buildQuery(period: ReportPeriod): string {
  const params = new URLSearchParams();
  if (period.startDate && period.endDate) {
    params.set('startDate', period.startDate);
    params.set('endDate', period.endDate);
  } else if (period.date) {
    params.set('date', period.date);
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

// ── Income report ─────────────────────────────────────────────────────────────

export type IncomeReportTrip = {
  tripId: string;
  date: string;
  tripNumber: number;
  direction: string;
  status: string;
  tripIncome: number;
  extraIncome: number;
  totalIncome: number;
  extraIncomeBreakdown: Array<{ id: string; category: string; amount: number; note: string | null }>;
};

export type IncomeReportOperationalIncome = {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string | null;
};

export type IncomeReportBus = {
  busId: string;
  registrationNumber: string;
  busName: string | null;
  route: { routeName: string; routeCode: string | null } | null;
  tripCount: number;
  tripIncome: number;
  extraIncome: number;
  operationalIncome: number;
  totalIncome: number;
  trips: IncomeReportTrip[];
  operationalIncomes: IncomeReportOperationalIncome[];
};

export type IncomeReportRow = {
  bus: string;
  busName: string;
  route: string;
  tripCount: number;
  tripIncome: number;
  extraIncome: number;
  operationalIncome: number;
  totalIncome: number;
};

export type IncomeReportResponse = {
  period: string;
  summary: {
    totalBuses: number;
    totalTrips: number;
    tripIncome: number;
    extraIncome: number;
    operationalIncome: number;
    totalIncome: number;
  };
  buses: IncomeReportBus[];
  rows: IncomeReportRow[];
};

export async function getIncomeReport(
  token: string,
  period: ReportPeriod,
): Promise<IncomeReportResponse> {
  return apiRequest(`/reports/income${buildQuery(period)}`, { token });
}

// ── Expenses report ───────────────────────────────────────────────────────────

export type ExpenseCategoryBreakdown = {
  category: string;
  amount: number;
  percentage: number;
};

export type ExpenseReportItem = {
  id: string;
  source: 'trip' | 'operational';
  date: string;
  tripId: string | null;
  tripNumber: number | null;
  category: string;
  amount: number;
  note: string | null;
};

export type ExpenseReportBus = {
  busId: string;
  registrationNumber: string;
  busName: string | null;
  route: { routeName: string; routeCode: string | null } | null;
  total: number;
  byCategory: Record<string, number>;
  items: ExpenseReportItem[];
};

export type ExpenseReportRow = {
  bus: string;
  busName: string;
  route: string;
  date: string;
  source: string;
  tripNumber: number | string;
  category: string;
  amount: number;
  note: string;
};

export type ExpensesReportResponse = {
  period: string;
  summary: {
    totalExpenses: number;
    byCategory: ExpenseCategoryBreakdown[];
  };
  buses: ExpenseReportBus[];
  rows: ExpenseReportRow[];
};

export async function getExpensesReport(
  token: string,
  period: ReportPeriod,
): Promise<ExpensesReportResponse> {
  return apiRequest(`/reports/expenses${buildQuery(period)}`, { token });
}

// ── Profitability report ──────────────────────────────────────────────────────

export type ProfitabilityReportBus = {
  busId: string;
  registrationNumber: string;
  busName: string | null;
  route: { id: string; routeName: string; routeCode: string | null } | null;
  tripCount: number;
  totalIncome: number;
  totalExpenses: number;
  dti: number;
  driverSalary: number;
  conductorSalary: number;
  totalSalaries: number;
  profit: number;
  wageModel: string;
  incomeBreakdown: { tripIncome: number; extraIncome: number; operationalIncome: number };
  expenseBreakdown: { tripExpenses: number; operationalExpenses: number };
};

export type ProfitabilityReportRow = {
  bus: string;
  busName: string;
  route: string;
  tripCount: number;
  income: number;
  expenses: number;
  dti: number;
  driverSalary: number;
  conductorSalary: number;
  totalSalaries: number;
  profit: number;
  wageModel: string;
};

export type ProfitabilityReportResponse = {
  period: string;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalDti: number;
    totalSalaries: number;
    totalProfit: number;
    totalTrips: number;
  };
  buses: ProfitabilityReportBus[];
  rows: ProfitabilityReportRow[];
};

export async function getProfitabilityReport(
  token: string,
  period: ReportPeriod,
): Promise<ProfitabilityReportResponse> {
  return apiRequest(`/reports/profitability${buildQuery(period)}`, { token });
}

// ── Salaries report ───────────────────────────────────────────────────────────

export type SalaryAssignment = {
  busId: string;
  registrationNumber: string;
  busName: string | null;
  date: string;
  tripCount: number;
  dti: number;
  salary: number;
  wageModel: string;
  calculationDetail: string;
};

export type SalaryReportStaff = {
  staffId: string;
  fullName: string;
  roleType: string;
  role: 'driver' | 'conductor';
  totalTrips: number;
  totalDaysWorked: number;
  totalPayable: number;
  assignments: SalaryAssignment[];
};

export type SalaryReportRow = {
  staffName: string;
  role: string;
  bus: string;
  busName: string;
  date: string;
  tripCount: number;
  dti: number;
  salary: number;
  wageModel: string;
  calculationDetail: string;
};

export type SalariesReportResponse = {
  period: string;
  summary: {
    totalStaff: number;
    totalDriverPayable: number;
    totalConductorPayable: number;
    totalPayable: number;
  };
  staff: SalaryReportStaff[];
  rows: SalaryReportRow[];
};

export async function getSalariesReport(
  token: string,
  period: ReportPeriod,
): Promise<SalariesReportResponse> {
  return apiRequest(`/reports/salaries${buildQuery(period)}`, { token });
}

// ── Route report ──────────────────────────────────────────────────────────────

export type RouteReportBus = {
  busId: string;
  registrationNumber: string;
  busName: string | null;
  tripCount: number;
  totalIncome: number;
  totalExpenses: number;
  dti: number;
  driverSalary: number;
  conductorSalary: number;
  profit: number;
};

export type RouteReportRoute = {
  routeId: string;
  routeName: string;
  routeCode: string | null;
  startLocation: string;
  endLocation: string;
  busCount: number;
  totalTrips: number;
  totalIncome: number;
  totalExpenses: number;
  dti: number;
  totalProfit: number;
  buses: RouteReportBus[];
};

export type RouteReportRow = {
  routeName: string;
  routeCode: string;
  bus: string;
  busName: string;
  tripCount: number;
  income: number;
  expenses: number;
  dti: number;
  driverSalary: number;
  conductorSalary: number;
  profit: number;
};

export type RouteReportResponse = {
  period: string;
  summary: {
    totalRoutes: number;
    totalBuses: number;
    totalTrips: number;
    totalIncome: number;
    totalExpenses: number;
    totalProfit: number;
  };
  routes: RouteReportRoute[];
  rows: RouteReportRow[];
};

export async function getRouteReport(
  token: string,
  period: ReportPeriod,
): Promise<RouteReportResponse> {
  return apiRequest(`/reports/routes${buildQuery(period)}`, { token });
}
