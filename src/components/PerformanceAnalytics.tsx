import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/data/mockData';
import ReportsSectionNav from './ReportsSectionNav';
import {
  getPerformanceReport,
  type PerformanceCategory,
  type PerformanceChartSeries,
  type PerformanceMetric,
  type PerformanceReportResponse,
  type PerformanceSummaryBus,
  type PerformanceSummaryStaff,
} from '@/lib/reportsApi';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartPageSkeleton } from './PageSkeletons';

type EntityOption = {
  id: string;
  label: string;
  description: string;
};

function getSLToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
}

function shiftYmd(ymd: string, days: number): string {
  const date = new Date(`${ymd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-LK', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

const CATEGORY_LABELS: Record<PerformanceCategory, string> = {
  DRIVERS: 'Drivers',
  CONDUCTORS: 'Conductors',
  BUSES: 'Buses',
};

const METRIC_LABELS: Record<PerformanceMetric, string> = {
  income: 'Income',
  salary: 'Salary',
  expenses: 'Expenses',
};

const CHART_COLORS = [
  '#f59e0b',
  '#0f766e',
  '#dc2626',
  '#2563eb',
  '#7c3aed',
  '#ea580c',
  '#0891b2',
  '#65a30d',
];

function LoadingState() {
  return <ChartPageSkeleton showHeader={false} />;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600 font-medium">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm text-amber-600 hover:underline font-medium"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <p className="text-slate-400 text-sm">No performance data found for the selected filters.</p>
    </div>
  );
}

function toEntityOptions(
  category: PerformanceCategory,
  summary: Array<PerformanceSummaryStaff | PerformanceSummaryBus>,
): EntityOption[] {
  if (category === 'BUSES') {
    return (summary as PerformanceSummaryBus[]).map((row) => ({
      id: row.id,
      label: row.registrationNumber,
      description: row.routeName ?? 'Unassigned route',
    }));
  }

  return (summary as PerformanceSummaryStaff[]).map((row) => ({
    id: row.id,
    label: row.name,
    description: row.role.replace(/_/g, ' '),
  }));
}

function getInitialSelection(options: EntityOption[]): string[] {
  return options.slice(0, Math.min(4, options.length)).map((option) => option.id);
}

const PerformanceAnalytics: React.FC = () => {
  const { token } = useAuth();

  const today = useMemo(() => getSLToday(), []);
  const [category, setCategory] = useState<PerformanceCategory>('DRIVERS');
  const [startDate, setStartDate] = useState(() => shiftYmd(today, -6));
  const [endDate, setEndDate] = useState(today);
  const [metric, setMetric] = useState<PerformanceMetric>('income');
  const [data, setData] = useState<PerformanceReportResponse | null>(null);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<PerformanceChartSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category === 'BUSES' && metric === 'salary') {
      setMetric('income');
    }
  }, [category]);

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getPerformanceReport(token, {
        category,
        startDate,
        endDate,
        metric,
      });
      setData(response);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  }, [category, endDate, metric, startDate, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.data.summary ?? [];
  const entityOptions = useMemo(() => toEntityOptions(category, summary), [category, summary]);

  useEffect(() => {
    const availableIds = new Set(entityOptions.map((option) => option.id));

    setSelectedEntityIds((current) => {
      const next = current.filter((id) => availableIds.has(id));
      if (next.length > 0) return next;
      return getInitialSelection(entityOptions);
    });
  }, [entityOptions]);

  useEffect(() => {
    if (!token || !data) {
      setChartSeries([]);
      return;
    }

    if (selectedEntityIds.length === 0) {
      setChartSeries(data.data.chart.series);
      return;
    }

    let cancelled = false;

    const loadEntitySeries = async () => {
      setChartLoading(true);
      try {
        const responses = await Promise.all(
          selectedEntityIds.map((entityId) =>
            getPerformanceReport(token, {
              category,
              startDate,
              endDate,
              metric,
              entityIds: [entityId],
            }),
          ),
        );

        if (cancelled) return;
        setChartSeries(
          responses.flatMap((response) => response.data.chart.series).filter((series) => series.metric === metric),
        );
      } catch {
        if (!cancelled) {
          setChartSeries([]);
        }
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };

    void loadEntitySeries();

    return () => {
      cancelled = true;
    };
  }, [category, data, endDate, metric, selectedEntityIds, startDate, token]);

  const chart = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.data.chart.labels,
      series: chartSeries,
    };
  }, [chartSeries, data]);

  const visibleSummary = useMemo(() => {
    if (selectedEntityIds.length === 0) return summary;
    const selected = new Set(selectedEntityIds);
    return summary.filter((row) => selected.has(row.id));
  }, [selectedEntityIds, summary]);

  const chartData = useMemo(() => {
    if (!chart) return [];

    return chart.labels.map((label, index) => {
      const point: Record<string, string | number> = { date: label };
      for (const series of chart.series) {
        point[series.key] = series.values[index] ?? 0;
      }
      return point;
    });
  }, [chart]);

  const chartConfig = useMemo<ChartConfig>(() => {
    if (!chart) return {};

    return Object.fromEntries(
      chart.series.map((series, index) => [
        series.key,
        {
          label: series.label,
          color: CHART_COLORS[index % CHART_COLORS.length],
        },
      ]),
    );
  }, [chart]);

  const totals = useMemo(() => {
    if (category === 'BUSES') {
      const rows = visibleSummary as PerformanceSummaryBus[];
      return {
        entityCount: rows.length,
        workingDays: rows.reduce((sum, row) => sum + row.activeDays, 0),
        income: rows.reduce((sum, row) => sum + row.totalIncome, 0),
        expenses: rows.reduce((sum, row) => sum + row.totalExpenses, 0),
        dti: rows.reduce((sum, row) => sum + row.netDTI, 0),
        trips: rows.reduce((sum, row) => sum + row.tripCount, 0),
      };
    }

    const rows = visibleSummary as PerformanceSummaryStaff[];
    return {
      entityCount: rows.length,
      workingDays: rows.reduce((sum, row) => sum + row.workingDays, 0),
      income: rows.reduce((sum, row) => sum + row.incomeOnWorkingDays, 0),
      salary: rows.reduce((sum, row) => sum + row.salary, 0),
      expenses: rows.reduce((sum, row) => sum + row.expensesOnWorkingDays, 0),
      dti: 0,
      trips: 0,
    };
  }, [category, visibleSummary]);

  const entityButtonLabel = useMemo(() => {
    if (selectedEntityIds.length === 0) return 'All entities';
    if (selectedEntityIds.length === 1) {
      return entityOptions.find((option) => option.id === selectedEntityIds[0])?.label ?? '1 selected';
    }
    return `${selectedEntityIds.length} selected`;
  }, [entityOptions, selectedEntityIds]);

  const toggleEntity = (entityId: string, checked: boolean) => {
    setSelectedEntityIds((current) => {
      if (checked) {
        return current.includes(entityId) ? current : [...current, entityId];
      }
      return current.filter((id) => id !== entityId);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Performance Analytics</h1>
          <p className="text-slate-500 mt-1">Working-day performance for drivers, conductors, and buses</p>
        </div>
      </div>

      <ReportsSectionNav />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-[170px]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">Category</p>
            <Select value={category} onValueChange={(value) => setCategory(value as PerformanceCategory)}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRIVERS">Drivers</SelectItem>
                <SelectItem value="CONDUCTORS">Conductors</SelectItem>
                <SelectItem value="BUSES">Buses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[160px]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">Metric</p>
            <Select value={metric} onValueChange={(value) => setMetric(value as PerformanceMetric)}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                {category !== 'BUSES' && <SelectItem value="salary">Salary</SelectItem>}
                <SelectItem value="expenses">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[160px]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">Start Date</p>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-[160px]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">End Date</p>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="min-w-[220px] flex-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
              {category === 'BUSES' ? 'Buses' : category === 'DRIVERS' ? 'Drivers' : 'Conductors'}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="truncate">{entityButtonLabel}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] max-h-[320px] overflow-y-auto">
                <DropdownMenuLabel>Select entities</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <button
                  type="button"
                  onClick={() => setSelectedEntityIds(getInitialSelection(entityOptions))}
                  className="w-full text-left px-2 py-1.5 text-sm text-amber-700 hover:bg-amber-50 rounded-sm"
                >
                  Reset to recommended
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEntityIds(entityOptions.map((option) => option.id))}
                  className="w-full text-left px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-sm"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEntityIds([])}
                  className="w-full text-left px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-sm"
                >
                  Clear selection
                </button>
                <DropdownMenuSeparator />
                {entityOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.id}
                    checked={selectedEntityIds.includes(option.id)}
                    onCheckedChange={(checked) => toggleEntity(option.id, checked === true)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-slate-400">{option.description}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Performance Trend</h2>
            <p className="text-sm text-slate-500 mt-1">
              One line per selected {CATEGORY_LABELS[category].toLowerCase().slice(0, -1)} for {METRIC_LABELS[metric].toLowerCase()}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 mr-2">Entities</span>
              <span className="font-semibold text-slate-900">{totals.entityCount}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 mr-2">Working Days</span>
              <span className="font-semibold text-slate-900">{totals.workingDays}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 mr-2">{category === 'BUSES' ? 'Net DTI' : 'Salary'}</span>
              <span className="font-semibold text-slate-900">{formatCurrency(category === 'BUSES' ? totals.dti : totals.salary)}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : chartLoading && chartSeries.length === 0 ? (
          <LoadingState />
        ) : !chart || chart.series.length === 0 || visibleSummary.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] lg:h-[360px] w-full">
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={80}
                tickFormatter={(value) => formatCompactCurrency(Number(value))}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{String(name)}</span>
                        <span className="font-mono font-medium text-foreground">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {chart.series.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={`var(--color-${series.key})`}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <p className="text-sm text-slate-500 mt-1">Filtered rows for the selected category</p>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : visibleSummary.length === 0 ? (
          <EmptyState />
        ) : category === 'BUSES' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Registration Number</th>
                  <th className="py-3 pr-4 font-semibold">Route</th>
                  <th className="py-3 pr-4 font-semibold">Active Days</th>
                  <th className="py-3 pr-4 font-semibold">Total Income</th>
                  <th className="py-3 pr-4 font-semibold">Total Expenses</th>
                  <th className="py-3 pr-4 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      Net DTI
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-slate-400 hover:text-slate-600">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          DTI = Daily Trip Income after expenses
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </th>
                  <th className="py-3 font-semibold">Trips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(visibleSummary as PerformanceSummaryBus[]).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{row.registrationNumber}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.routeName ?? 'Unassigned'}</td>
                    <td className="py-3 pr-4 text-slate-700">{row.activeDays}</td>
                    <td className="py-3 pr-4 text-emerald-700 font-medium">{formatCurrency(row.totalIncome)}</td>
                    <td className="py-3 pr-4 text-red-600 font-medium">{formatCurrency(row.totalExpenses)}</td>
                    <td className="py-3 pr-4 font-medium text-slate-900">{formatCurrency(row.netDTI)}</td>
                    <td className="py-3 text-slate-700">{row.tripCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Working Days</th>
                  <th className="py-3 pr-4 font-semibold">Income on Working Days</th>
                  <th className="py-3 pr-4 font-semibold">Salary</th>
                  <th className="py-3 font-semibold">Expenses on Working Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(visibleSummary as PerformanceSummaryStaff[]).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.role.replace(/_/g, ' ')}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{row.workingDays}</td>
                    <td className="py-3 pr-4 text-emerald-700 font-medium">{formatCurrency(row.incomeOnWorkingDays)}</td>
                    <td className="py-3 pr-4 font-medium text-slate-900">{formatCurrency(row.salary)}</td>
                    <td className="py-3 text-red-600 font-medium">{formatCurrency(row.expensesOnWorkingDays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalytics;