import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SRI_LANKAN_ROUTES } from '@/data/sriLankanRoutes';
import { formatCurrency, getTodayString } from '@/data/mockData';
import {
  BarChart3, TrendingUp, TrendingDown, Wallet, Bus, Users,
  Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, MapPin
} from 'lucide-react';

const Reports: React.FC = () => {
  const { buses, trips, expenses, settlements, users, getUserById } = useAppContext();
  const [reportType, setReportType] = useState<'income' | 'expense' | 'profit' | 'salary' | 'route'>('income');

  const today = getTodayString();

  // Generate last 7 days
  const last7Days = useMemo(() => {
    const days: string[] = [];
    const base = new Date('2026-03-10');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  // Bus-wise income for today
  const busIncomeData = useMemo(() => {
    return buses.filter(b => b.status !== 'inactive').map(bus => {
      const busTrips = trips.filter(t => t.busId === bus.id && t.date === today && t.status === 'completed');
      const busExpenses = expenses.filter(e => e.busId === bus.id && e.date === today);
      const income = busTrips.reduce((s, t) => s + t.income, 0);
      const expense = busExpenses.reduce((s, e) => s + e.amount, 0);
      const route = SRI_LANKAN_ROUTES.find(r => r.id === bus.routeId);
      return { bus, income, expense, profit: income - expense, route, tripCount: busTrips.length };
    });
  }, [buses, trips, expenses, today]);

  // Route-wise data
  const routeData = useMemo(() => {
    const routeMap = new Map<string, { income: number; expense: number; trips: number; buses: number }>();
    buses.forEach(bus => {
      const busTrips = trips.filter(t => t.busId === bus.id && t.date === today && t.status === 'completed');
      const busExpenses = expenses.filter(e => e.busId === bus.id && e.date === today);
      const income = busTrips.reduce((s, t) => s + t.income, 0);
      const expense = busExpenses.reduce((s, e) => s + e.amount, 0);
      const existing = routeMap.get(bus.routeId) || { income: 0, expense: 0, trips: 0, buses: 0 };
      routeMap.set(bus.routeId, {
        income: existing.income + income,
        expense: existing.expense + expense,
        trips: existing.trips + busTrips.length,
        buses: existing.buses + 1,
      });
    });
    return Array.from(routeMap.entries()).map(([routeId, data]) => {
      const route = SRI_LANKAN_ROUTES.find(r => r.id === routeId);
      return { route, ...data, profit: data.income - data.expense };
    }).filter(r => r.income > 0 || r.expense > 0);
  }, [buses, trips, expenses, today]);

  // Salary data
  const salaryData = useMemo(() => {
    const staffMap = new Map<string, { name: string; role: string; totalSalary: number; days: number }>();
    settlements.forEach(s => {
      const bus = buses.find(b => b.id === s.busId);
      if (!bus) return;

      // Find crew from trips
      const tripIds = s.trips;
      const relatedTrips = trips.filter(t => tripIds.includes(t.id));
      if (relatedTrips.length > 0) {
        const driverId = relatedTrips[0].driverId;
        const conductorId = relatedTrips[0].conductorId;
        const driver = getUserById(driverId);
        const conductor = getUserById(conductorId);

        if (driver) {
          const existing = staffMap.get(driverId) || { name: driver.name, role: 'Driver', totalSalary: 0, days: 0 };
          staffMap.set(driverId, { ...existing, totalSalary: existing.totalSalary + s.driverSalary, days: existing.days + 1 });
        }
        if (conductor) {
          const existing = staffMap.get(conductorId) || { name: conductor.name, role: 'Conductor', totalSalary: 0, days: 0 };
          staffMap.set(conductorId, { ...existing, totalSalary: existing.totalSalary + s.conductorSalary, days: existing.days + 1 });
        }
      }
    });
    return Array.from(staffMap.values());
  }, [settlements, buses, trips, getUserById]);

  // Expense category breakdown
  const expenseCategoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    const todayExpenses = expenses.filter(e => e.date === today);
    todayExpenses.forEach(e => {
      catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
    });
    return Array.from(catMap.entries()).map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, today]);

  const maxIncome = Math.max(...busIncomeData.map(d => d.income), 1);

  const reportTabs = [
    { id: 'income' as const, label: 'Income', icon: TrendingUp },
    { id: 'expense' as const, label: 'Expenses', icon: TrendingDown },
    { id: 'profit' as const, label: 'Profitability', icon: Wallet },
    { id: 'salary' as const, label: 'Salaries', icon: Users },
    { id: 'route' as const, label: 'By Route', icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Insights into your fleet operations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reportTabs.map(tab => {
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

      {/* Income Report */}
      {reportType === 'income' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Income by Bus — {today}</h2>
            <div className="space-y-4">
              {busIncomeData.map(({ bus, income, tripCount, route }) => (
                <div key={bus.id} className="flex items-center gap-4">
                  <div className="w-20 text-right">
                    <p className="text-sm font-bold text-slate-900">{bus.regNumber}</p>
                    <p className="text-[10px] text-slate-400">{tripCount} trips</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max((income / maxIncome) * 100, 5)}%` }}
                      >
                        {income > 0 && <span className="text-[11px] font-bold text-white">{formatCurrency(income)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense Report */}
      {reportType === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Expense Categories — {today}</h2>
            <div className="space-y-4">
              {expenseCategoryData.map(({ category, amount }) => {
                const totalExp = expenseCategoryData.reduce((s, d) => s + d.amount, 0);
                const pct = totalExp > 0 ? (amount / totalExp) * 100 : 0;
                const colors: Record<string, string> = {
                  diesel: 'from-red-400 to-red-600', expressway: 'from-blue-400 to-blue-600',
                  runner: 'from-purple-400 to-purple-600', parking: 'from-amber-400 to-amber-600',
                  meals: 'from-emerald-400 to-emerald-600', repairs: 'from-orange-400 to-orange-600',
                  other: 'from-slate-400 to-slate-600',
                };
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 capitalize font-medium">{category}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(amount)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${colors[category] || 'from-slate-400 to-slate-600'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Expenses by Bus — {today}</h2>
            <div className="space-y-3">
              {busIncomeData.filter(d => d.expense > 0).map(({ bus, expense, route }) => (
                <div key={bus.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                      <Bus className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{bus.regNumber}</p>
                      <p className="text-[10px] text-slate-400">Route {route?.routeNo}</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-600">{formatCurrency(expense)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profitability Report */}
      {reportType === 'profit' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Bus Profitability — {today}</h2>
          </div>
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
                {busIncomeData.map(({ bus, income, expense, profit, route, tripCount }) => (
                  <tr key={bus.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{bus.regNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{route?.routeNo} - {route?.name?.split('(')[0]}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-700">{formatCurrency(income)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">{formatCurrency(expense)}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-700">{formatCurrency(income - expense)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{tripCount}</td>
                    <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td className="px-6 py-3" colSpan={2}>TOTAL</td>
                  <td className="px-6 py-3 text-right text-emerald-700">{formatCurrency(busIncomeData.reduce((s, d) => s + d.income, 0))}</td>
                  <td className="px-6 py-3 text-right text-red-600">{formatCurrency(busIncomeData.reduce((s, d) => s + d.expense, 0))}</td>
                  <td className="px-6 py-3 text-right text-amber-700">{formatCurrency(busIncomeData.reduce((s, d) => s + d.income - d.expense, 0))}</td>
                  <td className="px-6 py-3 text-right">{busIncomeData.reduce((s, d) => s + d.tripCount, 0)}</td>
                  <td className="px-6 py-3 text-right text-emerald-700">{formatCurrency(busIncomeData.reduce((s, d) => s + d.profit, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Salary Report */}
      {reportType === 'salary' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Salary Payable Summary</h2>
          {salaryData.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No settled salary data available. Lock daily settlements to see salary reports.</p>
          ) : (
            <div className="space-y-3">
              {salaryData.map((staff, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      staff.role === 'Driver' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{staff.name}</p>
                      <p className="text-xs text-slate-500">{staff.role} &middot; {staff.days} day(s) settled</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-slate-900">{formatCurrency(staff.totalSalary)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Route Report */}
      {reportType === 'route' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance by Route — {today}</h2>
          <div className="space-y-4">
            {routeData.map((data, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Route {data.route?.routeNo}: {data.route?.name}</h3>
                    <p className="text-xs text-slate-500">{data.buses} bus(es) &middot; {data.trips} trips</p>
                  </div>
                  <span className={`text-lg font-bold ${data.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatCurrency(data.profit)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-emerald-600">Income</p>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrency(data.income)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-red-600">Expenses</p>
                    <p className="text-sm font-bold text-red-700">{formatCurrency(data.expense)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-amber-600">Profit</p>
                    <p className="text-sm font-bold text-amber-700">{formatCurrency(data.profit)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
