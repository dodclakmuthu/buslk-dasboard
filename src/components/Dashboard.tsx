import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SRI_LANKAN_ROUTES } from '@/data/sriLankanRoutes';
import { formatCurrency, getTodayString } from '@/data/mockData';
import {
  Bus, TrendingUp, TrendingDown, Wallet, Users, Route, Clock,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';


const Dashboard: React.FC = () => {
  const {
    buses, trips, expenses, users,
    getTripsByBusAndDate, getExpensesByBusAndDate,
    setCurrentView
  } = useAppContext();


  const today = getTodayString();
  const activeBuses = buses.filter(b => b.status === 'active');
  const todayTrips = trips.filter(t => t.date === today);
  const todayExpenses = expenses.filter(e => e.date === today);
  const completedTrips = todayTrips.filter(t => t.status === 'completed');
  const inProgressTrips = todayTrips.filter(t => t.status === 'in-progress');

  const todayTotalIncome = completedTrips.reduce((sum, t) => sum + t.income, 0);
  const todayTotalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayDTI = todayTotalIncome - todayTotalExpenses;
  const totalPassengers = completedTrips.reduce((sum, t) => sum + (t.passengerCount || 0), 0);

  const activeDrivers = users.filter(u => u.role === 'driver' && u.isActive).length;
  const activeConductors = users.filter(u => u.role === 'conductor' && u.isActive).length;

  // Alerts
  const expiringPermits = buses.filter(b => {
    if (!b.permitExpiry) return false;
    const diff = new Date(b.permitExpiry).getTime() - new Date(today).getTime();
    return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
  });

  const kpiCards = [
    {
      label: "Today's Income",
      value: formatCurrency(todayTotalIncome),
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      change: '+8.2%',
      changeUp: true,
    },
    {
      label: "Today's Expenses",
      value: formatCurrency(todayTotalExpenses),
      icon: TrendingDown,
      color: 'from-red-500 to-rose-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700',
      change: '-3.1%',
      changeUp: false,
    },
    {
      label: 'Net DTI',
      value: formatCurrency(todayDTI),
      icon: Wallet,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      change: '+12.5%',
      changeUp: true,
    },
    {
      label: 'Trips Completed',
      value: `${completedTrips.length} / ${todayTrips.length}`,
      icon: Route,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: `${inProgressTrips.length} in progress`,
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
            Tuesday, March 10, 2026 &middot; {activeBuses.length} active buses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('trips')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            Start New Trip
          </button>
          <button
            onClick={() => setCurrentView('settlement')}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
          >
            Daily Settlement
          </button>
        </div>
      </div>

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
              onClick={() => setCurrentView('buses')}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {buses.map(bus => {
              const route = SRI_LANKAN_ROUTES.find(r => r.id === bus.routeId);
              const busTrips = getTripsByBusAndDate(bus.id, today);
              const busExpenses = getExpensesByBusAndDate(bus.id, today);
              const busIncome = busTrips.filter(t => t.status === 'completed').reduce((s, t) => s + t.income, 0);
              const busExpenseTotal = busExpenses.reduce((s, e) => s + e.amount, 0);
              const activeTrip = busTrips.find(t => t.status === 'in-progress');

              return (
                <div key={bus.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${bus.status === 'active' ? 'bg-emerald-100' : bus.status === 'maintenance' ? 'bg-amber-100' : 'bg-slate-100'}
                    `}>
                      <Bus className={`w-6 h-6 ${bus.status === 'active' ? 'text-emerald-600' : bus.status === 'maintenance' ? 'text-amber-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{bus.regNumber}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase
                          ${bus.status === 'active' ? 'bg-emerald-100 text-emerald-700' : bus.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}
                        `}>
                          {bus.status}
                        </span>
                        {activeTrip && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> On Trip
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        Route {route?.routeNo}: {route?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(busIncome)}</p>
                      <p className="text-xs text-slate-500">{busTrips.length} trips &middot; {formatCurrency(busExpenseTotal)} exp.</p>
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
                <span className="font-bold text-slate-900">{activeBuses.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600">Drivers</span>
                </div>
                <span className="font-bold text-slate-900">{activeDrivers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-600">Conductors</span>
                </div>
                <span className="font-bold text-slate-900">{activeConductors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm text-slate-600">Passengers Today</span>
                </div>
                <span className="font-bold text-slate-900">{totalPassengers}</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Alerts</h3>
            <div className="space-y-3">
              {expiringPermits.map(bus => (
                <div key={bus.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">{bus.regNumber} Permit Expiry</p>
                    <p className="text-xs text-amber-600">Expires: {bus.permitExpiry}</p>
                  </div>
                </div>
              ))}
              {buses.filter(b => b.status === 'maintenance').map(bus => (
                <div key={bus.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{bus.regNumber} in Maintenance</p>
                    <p className="text-xs text-red-600">No trips can be scheduled</p>
                  </div>
                </div>
              ))}
              {inProgressTrips.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">{inProgressTrips.length} Trip(s) In Progress</p>
                    <p className="text-xs text-blue-600">Awaiting completion and income entry</p>
                  </div>
                </div>
              )}
              {expiringPermits.length === 0 && buses.filter(b => b.status === 'maintenance').length === 0 && inProgressTrips.length === 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-emerald-700">All clear! No pending alerts.</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Expense Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {['diesel', 'expressway', 'runner', 'parking', 'meals', 'repairs', 'other'].map(cat => {
                const catExpenses = todayExpenses.filter(e => e.category === cat);
                const total = catExpenses.reduce((s, e) => s + e.amount, 0);
                if (total === 0) return null;
                const pct = todayTotalExpenses > 0 ? (total / todayTotalExpenses) * 100 : 0;
                const colors: Record<string, string> = {
                  diesel: 'bg-red-500', expressway: 'bg-blue-500', runner: 'bg-purple-500',
                  parking: 'bg-amber-500', meals: 'bg-emerald-500', repairs: 'bg-orange-500', other: 'bg-slate-500',
                };
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 capitalize">{cat}</span>
                      <span className="font-medium text-slate-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[cat] || 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
