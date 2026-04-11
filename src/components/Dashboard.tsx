import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Route,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardReport, type DashboardAlert, type DashboardReport } from '@/lib/dashboardApi';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getTodayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatPeriodLabel(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat('en-LK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const shortFormatter = new Intl.DateTimeFormat('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (startDate === endDate) return formatter.format(start);
  return `${shortFormatter.format(start)} - ${shortFormatter.format(end)}`;
}

function getStatusClasses(status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD') {
  if (status === 'ACTIVE') {
    return {
      badge: 'bg-emerald-100 text-emerald-700',
      iconWrap: 'bg-emerald-100',
      icon: 'text-emerald-600',
      label: 'active',
    };
  }

  if (status === 'MAINTENANCE') {
    return {
      badge: 'bg-amber-100 text-amber-700',
      iconWrap: 'bg-amber-100',
      icon: 'text-amber-600',
      label: 'maintenance',
    };
  }

  return {
    badge: 'bg-slate-100 text-slate-500',
    iconWrap: 'bg-slate-100',
    icon: 'text-slate-400',
    label: status.toLowerCase(),
  };
}

function getAlertClasses(alert: DashboardAlert) {
  if (alert.type === 'maintenance') {
    return {
      wrapper: 'bg-red-50 border-red-100',
      icon: 'text-red-600',
      title: 'text-red-800',
      body: 'text-red-600',
      Icon: AlertTriangle,
    };
  }

  return {
    wrapper: 'bg-blue-50 border-blue-100',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    body: 'text-blue-600',
    Icon: Clock,
  };
}

const EXPENSE_COLORS: Record<string, string> = {
  diesel: 'bg-red-500',
  expressway: 'bg-blue-500',
  runner: 'bg-purple-500',
  parking: 'bg-amber-500',
  meals: 'bg-emerald-500',
  repairs: 'bg-orange-500',
  other: 'bg-slate-500',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [startDate, setStartDate] = useState<string>(() => getTodayInputValue());
  const [endDate, setEndDate] = useState<string>(() => getTodayInputValue());
  const [dashboard, setDashboard] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    if (!startDate || !endDate) return;

    if (startDate > endDate) {
      setFetchError('End date must be on or after the start date.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const data = await getDashboardReport(token, { startDate, endDate });
      setDashboard(data);
    } catch (err: any) {
      setFetchError(err.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary;
  const quickStats = dashboard?.quickStats;
  const fleetItems = dashboard?.fleetStatus.items ?? [];
  const alerts = dashboard?.alerts ?? [];
  const expenseRows = (dashboard?.expenseBreakdown ?? []).filter((row) => row.amount > 0);
  const periodLabel = useMemo(() => formatPeriodLabel(startDate, endDate), [endDate, startDate]);
  const isInitialLoading = loading && !dashboard;

  const kpiCards = [
    {
      label: 'Total Income',
      value: formatCurrency(summary?.totalIncome ?? 0),
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-600',
      change: dashboard?.dateRange.isSingleDay ? 'Selected day' : 'Selected range',
      changeUp: true,
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary?.totalExpenses ?? 0),
      icon: TrendingDown,
      color: 'from-red-500 to-rose-600',
      change: expenseRows.length > 0 ? `${expenseRows.length} categories` : 'No expenses',
      changeUp: false,
    },
    {
      label: (
        <span className="inline-flex items-center gap-1">
          Net DTI
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Explain DTI"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              DTI = Daily Total Income after deducting expenses.
            </TooltipContent>
          </Tooltip>
        </span>
      ),
      value: formatCurrency(summary?.netDTI ?? 0),
      icon: Wallet,
      color: 'from-amber-500 to-orange-600',
      change: 'Income - Expenses',
      changeUp: true,
    },
    {
      label: 'Trips Completed',
      value:
        summary && summary.totalTrips > summary.tripsCompleted
          ? `${summary.tripsCompleted} / ${summary.totalTrips}`
          : `${summary?.tripsCompleted ?? 0}`,
      icon: Route,
      color: 'from-blue-500 to-indigo-600',
      change:
        (summary?.inProgressTrips ?? 0) > 0
          ? `${summary?.inProgressTrips ?? 0} in progress`
          : 'Completed',
      changeUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {periodLabel} &middot; {quickStats?.activeBuses ?? 0} active buses
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/trips')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              Start New Trip
            </button>
            <button
              onClick={() => navigate('/settlement')}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
            >
              Daily Settlement
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              aria-label="Dashboard start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              aria-label="Dashboard end date"
            />
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {isInitialLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading dashboard…
        </div>
      )}

      {!isInitialLoading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi, idx) => {
              const Icon = kpi.icon;

              return (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.changeUp ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kpi.changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {kpi.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{kpi.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bus Fleet Status + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bus Fleet Status */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Fleet Status Today</h2>
                <button
                  onClick={() => navigate(dashboard?.fleetStatus.viewAllPath ?? '/buses')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                {fleetItems.length === 0 && (
                  <div className="p-5 text-sm text-slate-500">No fleet activity for the selected period.</div>
                )}

                {fleetItems.map((bus) => {
                  const statusClasses = getStatusClasses(bus.status);
                  const routeLabel = bus.route?.routeCode
                    ? `Route ${bus.route.routeCode}: ${bus.route.routeName}`
                    : (bus.route?.routeName ?? 'No route assigned');

                  return (
                    <div key={bus.busId} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusClasses.iconWrap}`}>
                          <Bus className={`w-6 h-6 ${statusClasses.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{bus.registrationNumber}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${statusClasses.badge}`}>
                              {statusClasses.label}
                            </span>
                            {bus.badges
                              .filter((badge) => badge === 'On Trip')
                              .map((badge) => (
                                <span key={badge} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" /> {badge}
                                </span>
                              ))}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{routeLabel}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(bus.income)}</p>
                          <p className="text-xs text-slate-500">{bus.tripCount} trips &middot; {formatCurrency(bus.expense)} exp.</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Bus className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-600">Active Buses</span>
                    </div>
                    <span className="font-bold text-slate-900">{quickStats?.activeBuses ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm text-slate-600">Drivers</span>
                    </div>
                    <span className="font-bold text-slate-900">{quickStats?.drivers ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-slate-600">Conductors</span>
                    </div>
                    <span className="font-bold text-slate-900">{quickStats?.conductors ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-sm text-slate-600">Passengers Today</span>
                    </div>
                    <span className="font-bold text-slate-900">{quickStats?.passengersToday ?? '—'}</span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Alerts</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {alerts.map((alert) => {
                    const styles = getAlertClasses(alert);
                    const Icon = styles.Icon;

                    return (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => navigate(alert.targetPath || (alert.type === 'maintenance' ? '/buses' : '/trips'))}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border ${styles.wrapper}`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.icon}`} />
                        <div>
                          <p className={`text-sm font-medium ${styles.title}`}>{alert.title}</p>
                          <p className={`text-xs ${styles.body}`}>{alert.message}</p>
                        </div>
                      </button>
                    );
                  })}

                  {alerts.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm text-emerald-700">No alerts for the selected period</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Expense Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Expense Breakdown</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {expenseRows.map((row) => {
                    const pct = (summary?.totalExpenses ?? 0) > 0 ? (row.amount / (summary?.totalExpenses ?? 1)) * 100 : 0;
                    return (
                      <div key={row.category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600 capitalize">{row.category}</span>
                          <span className="font-medium text-slate-900">{formatCurrency(row.amount)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${EXPENSE_COLORS[row.category] || 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}

                  {expenseRows.length === 0 && (
                    <p className="text-sm text-slate-500">No expense data for the selected period.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
