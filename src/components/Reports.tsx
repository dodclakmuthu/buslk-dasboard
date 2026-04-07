import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/data/mockData';
import {
  TrendingUp, TrendingDown, Wallet, Bus, Users,
  Download, MapPin, Loader2, AlertCircle,
} from 'lucide-react';
import {
  getIncomeReport,
  getExpensesReport,
  getProfitabilityReport,
  getSalariesReport,
  getRouteReport,
  type ReportPeriod,
  type IncomeReportResponse,
  type ExpensesReportResponse,
  type ProfitabilityReportResponse,
  type SalariesReportResponse,
  type RouteReportResponse,
} from '@/lib/reportsApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSLToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
}

const EXPENSE_COLORS: Record<string, string> = {
  diesel: 'from-red-400 to-red-600',
  expressway: 'from-blue-400 to-blue-600',
  runner: 'from-purple-400 to-purple-600',
  parking: 'from-amber-400 to-amber-600',
  meals: 'from-emerald-400 to-emerald-600',
  repairs: 'from-orange-400 to-orange-600',
  other: 'from-slate-400 to-slate-600',
};

// ── CSV export helpers ────────────────────────────────────────────────────────

function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportIncome(data: IncomeReportResponse): void {
  const csvRows: string[][] = [
    ['Bus', 'Bus Name', 'Route', 'Trips', 'Trip Income', 'Extra Income', 'Operational Income', 'Total Income'],
    ...data.rows.map((r) => [r.bus, r.busName, r.route, String(r.tripCount), String(r.tripIncome), String(r.extraIncome), String(r.operationalIncome), String(r.totalIncome)]),
    ['TOTAL', '', '', String(data.summary.totalTrips), String(data.summary.tripIncome), String(data.summary.extraIncome), String(data.summary.operationalIncome), String(data.summary.totalIncome)],
  ];
  downloadCsv(`income-report-${data.period}.csv`, csvRows);
}

function exportExpenses(data: ExpensesReportResponse): void {
  const csvRows: string[][] = [
    ['Bus', 'Bus Name', 'Route', 'Date', 'Source', 'Trip #', 'Category', 'Amount', 'Note'],
    ...data.rows.map((r) => [r.bus, r.busName, r.route, r.date, r.source, String(r.tripNumber), r.category, String(r.amount), r.note]),
    ['TOTAL', '', '', '', '', '', '', String(data.summary.totalExpenses), ''],
  ];
  downloadCsv(`expenses-report-${data.period}.csv`, csvRows);
}

function exportProfitability(data: ProfitabilityReportResponse): void {
  const csvRows: string[][] = [
    ['Bus', 'Bus Name', 'Route', 'Trips', 'Income', 'Expenses', 'DTI', 'Driver Salary', 'Conductor Salary', 'Total Salaries', 'Profit', 'Wage Model'],
    ...data.rows.map((r) => [r.bus, r.busName, r.route, String(r.tripCount), String(r.income), String(r.expenses), String(r.dti), String(r.driverSalary), String(r.conductorSalary), String(r.totalSalaries), String(r.profit), r.wageModel]),
    ['TOTAL', '', '', String(data.summary.totalTrips), String(data.summary.totalIncome), String(data.summary.totalExpenses), String(data.summary.totalDti), '', '', String(data.summary.totalSalaries), String(data.summary.totalProfit), ''],
  ];
  downloadCsv(`profitability-report-${data.period}.csv`, csvRows);
}

function exportSalaries(data: SalariesReportResponse): void {
  const csvRows: string[][] = [
    ['Staff Name', 'Role', 'Bus', 'Bus Name', 'Date', 'Trips', 'DTI', 'Salary', 'Wage Model', 'Calculation'],
    ...data.rows.map((r) => [r.staffName, r.role, r.bus, r.busName, r.date, String(r.tripCount), String(r.dti), String(r.salary), r.wageModel, r.calculationDetail]),
    ['TOTAL', '', '', '', '', '', '', String(data.summary.totalPayable), '', ''],
  ];
  downloadCsv(`salaries-report-${data.period}.csv`, csvRows);
}

function exportRoutes(data: RouteReportResponse): void {
  const csvRows: string[][] = [
    ['Route', 'Route Code', 'Bus', 'Bus Name', 'Trips', 'Income', 'Expenses', 'DTI', 'Driver Salary', 'Conductor Salary', 'Profit'],
    ...data.rows.map((r) => [r.routeName, r.routeCode, r.bus, r.busName, String(r.tripCount), String(r.income), String(r.expenses), String(r.dti), String(r.driverSalary), String(r.conductorSalary), String(r.profit)]),
    ['TOTAL', '', '', '', String(data.summary.totalTrips), String(data.summary.totalIncome), String(data.summary.totalExpenses), '', '', '', String(data.summary.totalProfit)],
  ];
  downloadCsv(`routes-report-${data.period}.csv`, csvRows);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      <p className="text-sm text-slate-500">Loading report…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="text-sm text-amber-600 hover:underline font-medium"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const Reports: React.FC = () => {
  const { token } = useAuth();

  const [reportType, setReportType] = useState<'income' | 'expense' | 'profit' | 'salary' | 'route'>('income');
  const [selectedDate, setSelectedDate] = useState(getSLToday);

  // Per-tab data state
  const [incomeData, setIncomeData] = useState<IncomeReportResponse | null>(null);
  const [expensesData, setExpensesData] = useState<ExpensesReportResponse | null>(null);
  const [profitData, setProfitData] = useState<ProfitabilityReportResponse | null>(null);
  const [salaryData, setSalaryData] = useState<SalariesReportResponse | null>(null);
  const [routeData, setRouteData] = useState<RouteReportResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const period: ReportPeriod = { date: selectedDate };

  const loadTab = useCallback(
    async (tab: typeof reportType, date: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      const p: ReportPeriod = { date };
      try {
        switch (tab) {
          case 'income': {
            const res = await getIncomeReport(token, p);
            setIncomeData(res);
            break;
          }
          case 'expense': {
            const res = await getExpensesReport(token, p);
            setExpensesData(res);
            break;
          }
          case 'profit': {
            const res = await getProfitabilityReport(token, p);
            setProfitData(res);
            break;
          }
          case 'salary': {
            const res = await getSalariesReport(token, p);
            setSalaryData(res);
            break;
          }
          case 'route': {
            const res = await getRouteReport(token, p);
            setRouteData(res);
            break;
          }
        }
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load report');
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // Load whenever tab or date changes
  useEffect(() => {
    void loadTab(reportType, selectedDate);
  }, [reportType, selectedDate, loadTab]);

  const handleExport = () => {
    switch (reportType) {
      case 'income':
        if (incomeData) exportIncome(incomeData);
        break;
      case 'expense':
        if (expensesData) exportExpenses(expensesData);
        break;
      case 'profit':
        if (profitData) exportProfitability(profitData);
        break;
      case 'salary':
        if (salaryData) exportSalaries(salaryData);
        break;
      case 'route':
        if (routeData) exportRoutes(routeData);
        break;
    }
  };

  const reportTabs = [
    { id: 'income' as const, label: 'Income', icon: TrendingUp },
    { id: 'expense' as const, label: 'Expenses', icon: TrendingDown },
    { id: 'profit' as const, label: 'Profitability', icon: Wallet },
    { id: 'salary' as const, label: 'Salaries', icon: Users },
    { id: 'route' as const, label: 'By Route', icon: MapPin },
  ];

  const hasExportData =
    (reportType === 'income' && !!incomeData) ||
    (reportType === 'expense' && !!expensesData) ||
    (reportType === 'profit' && !!profitData) ||
    (reportType === 'salary' && !!salaryData) ||
    (reportType === 'route' && !!routeData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Insights into your fleet operations</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
          <button
            onClick={handleExport}
            disabled={!hasExportData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                reportType === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Income Report ────────────────────────────────────────────────────── */}
      {reportType === 'income' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Daily Income by Bus — {selectedDate}
            </h2>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => loadTab('income', selectedDate)} />
            ) : !incomeData || incomeData.buses.length === 0 ? (
              <EmptyState message="No income data for this date." />
            ) : (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 uppercase font-semibold">Total Income</p>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrency(incomeData.summary.totalIncome)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Trip Income</p>
                    <p className="text-sm font-bold text-slate-700">{formatCurrency(incomeData.summary.tripIncome)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Extra Income</p>
                    <p className="text-sm font-bold text-slate-700">{formatCurrency(incomeData.summary.extraIncome)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Trips</p>
                    <p className="text-sm font-bold text-slate-700">{incomeData.summary.totalTrips}</p>
                  </div>
                </div>
                {/* Bar chart */}
                <div className="space-y-4">
                  {(() => {
                    const maxIncome = Math.max(...incomeData.buses.map((b) => b.totalIncome), 1);
                    return incomeData.buses.map((b) => (
                      <div key={b.busId} className="flex items-center gap-4">
                        <div className="w-24 text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-900">{b.registrationNumber}</p>
                          <p className="text-[10px] text-slate-400">{b.tripCount} trips</p>
                        </div>
                        <div className="flex-1">
                          <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${Math.max((b.totalIncome / maxIncome) * 100, 5)}%` }}
                            >
                              {b.totalIncome > 0 && (
                                <span className="text-[11px] font-bold text-white">
                                  {formatCurrency(b.totalIncome)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-28 text-right flex-shrink-0 text-[10px] text-slate-400 leading-none">
                          <span title="Trip">{formatCurrency(b.tripIncome)}</span>
                          {b.extraIncome > 0 && (
                            <span className="ml-1 text-amber-500" title="Extra">+{formatCurrency(b.extraIncome)}</span>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Expense Report ───────────────────────────────────────────────────── */}
      {reportType === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Expense Categories — {selectedDate}
            </h2>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => loadTab('expense', selectedDate)} />
            ) : !expensesData || expensesData.summary.byCategory.every((c) => c.amount === 0) ? (
              <EmptyState message="No expense data for this date." />
            ) : (
              <div className="space-y-4">
                {expensesData.summary.byCategory
                  .filter((c) => c.amount > 0)
                  .map(({ category, amount, percentage }) => (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-700 capitalize font-medium">{category}</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${EXPENSE_COLORS[category] ?? 'from-slate-400 to-slate-600'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Expenses by Bus — {selectedDate}
            </h2>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => loadTab('expense', selectedDate)} />
            ) : !expensesData || expensesData.buses.length === 0 ? (
              <EmptyState message="No expense data for this date." />
            ) : (
              <div className="space-y-3">
                {expensesData.buses.map((b) => (
                  <div
                    key={b.busId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                        <Bus className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{b.registrationNumber}</p>
                        <p className="text-[10px] text-slate-400">
                          {b.route
                            ? b.route.routeCode
                              ? `Route ${b.route.routeCode}`
                              : b.route.routeName
                            : '—'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-red-600">{formatCurrency(b.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Profitability Report ─────────────────────────────────────────────── */}
      {reportType === 'profit' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Bus Profitability — {selectedDate}
            </h2>
          </div>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => loadTab('profit', selectedDate)} />
          ) : !profitData || profitData.buses.length === 0 ? (
            <EmptyState message="No profitability data for this date." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Bus</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Route</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Income</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Expenses</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">DTI</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trips</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {profitData.buses.map((b) => (
                    <tr key={b.busId} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{b.registrationNumber}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {b.route
                          ? b.route.routeCode
                            ? `${b.route.routeCode} - ${b.route.routeName}`
                            : b.route.routeName
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-700">
                        {formatCurrency(b.totalIncome)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-red-600">
                        {formatCurrency(b.totalExpenses)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-amber-700">
                        {formatCurrency(b.dti)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">{b.tripCount}</td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          b.profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(b.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold">
                  <tr>
                    <td className="px-6 py-3" colSpan={2}>TOTAL</td>
                    <td className="px-6 py-3 text-right text-emerald-700">
                      {formatCurrency(profitData.summary.totalIncome)}
                    </td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatCurrency(profitData.summary.totalExpenses)}
                    </td>
                    <td className="px-6 py-3 text-right text-amber-700">
                      {formatCurrency(profitData.summary.totalDti)}
                    </td>
                    <td className="px-6 py-3 text-right">{profitData.summary.totalTrips}</td>
                    <td className="px-6 py-3 text-right text-emerald-700">
                      {formatCurrency(profitData.summary.totalProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Salary Report ────────────────────────────────────────────────────── */}
      {reportType === 'salary' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Salary Payable Summary — {selectedDate}</h2>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => loadTab('salary', selectedDate)} />
          ) : !salaryData || salaryData.staff.length === 0 ? (
            <EmptyState message="No salary data for this date. Ensure trips with assigned crew exist." />
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-blue-600 uppercase font-semibold">Driver Payable</p>
                  <p className="text-sm font-bold text-blue-700">{formatCurrency(salaryData.summary.totalDriverPayable)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-emerald-600 uppercase font-semibold">Conductor Payable</p>
                  <p className="text-sm font-bold text-emerald-700">{formatCurrency(salaryData.summary.totalConductorPayable)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-amber-600 uppercase font-semibold">Total Payable</p>
                  <p className="text-sm font-bold text-amber-700">{formatCurrency(salaryData.summary.totalPayable)}</p>
                </div>
              </div>
              <div className="space-y-3">
                {salaryData.staff.map((staff) => (
                  <div
                    key={staff.staffId}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          staff.role === 'driver'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {staff.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{staff.fullName}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {staff.role} &middot; {staff.totalDaysWorked} day(s) &middot; {staff.totalTrips} trip(s)
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-slate-900">
                      {formatCurrency(staff.totalPayable)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Route Report ─────────────────────────────────────────────────────── */}
      {reportType === 'route' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Performance by Route — {selectedDate}
          </h2>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => loadTab('route', selectedDate)} />
          ) : !routeData || routeData.routes.length === 0 ? (
            <EmptyState message="No route data for this date." />
          ) : (
            <div className="space-y-4">
              {routeData.routes.map((r) => (
                <div key={r.routeId} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {r.routeCode ? `Route ${r.routeCode}: ` : ''}{r.routeName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {r.startLocation} → {r.endLocation} &middot; {r.busCount} bus(es) &middot; {r.totalTrips} trip(s)
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        r.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(r.totalProfit)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[10px] text-emerald-600">Income</p>
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(r.totalIncome)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[10px] text-red-600">Expenses</p>
                      <p className="text-sm font-bold text-red-700">{formatCurrency(r.totalExpenses)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-[10px] text-amber-600">DTI</p>
                      <p className="text-sm font-bold text-amber-700">{formatCurrency(r.dti)}</p>
                    </div>
                  </div>
                  {/* Per-bus breakdown */}
                  {r.buses.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {r.buses.map((b) => (
                        <div
                          key={b.busId}
                          className="flex items-center justify-between text-xs text-slate-600 bg-white rounded-lg px-3 py-1.5"
                        >
                          <span className="font-medium text-slate-800">{b.registrationNumber}</span>
                          <span>{b.tripCount} trips</span>
                          <span className="text-emerald-600">{formatCurrency(b.totalIncome)}</span>
                          <span className="text-red-500">{formatCurrency(b.totalExpenses)}</span>
                          <span className={b.profit >= 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                            {formatCurrency(b.profit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
