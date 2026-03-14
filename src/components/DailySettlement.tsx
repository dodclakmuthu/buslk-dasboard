import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SRI_LANKAN_ROUTES } from '@/data/sriLankanRoutes';
import { formatCurrency, getTodayString } from '@/data/mockData';
import {
  Calculator, Lock, Unlock, Bus, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Wallet, Users, CheckCircle2, AlertTriangle,
  ArrowRight, Receipt, DollarSign
} from 'lucide-react';

const DailySettlement: React.FC = () => {
  const {
    buses, trips, expenses, settlements, calculateSettlement, lockSettlement,
    getTripsByBusAndDate, getExpensesByBusAndDate, getBusById, getUserById
  } = useAppContext();

  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedBus, setExpandedBus] = useState<string | null>(null);

  const activeBuses = buses.filter(b => b.status !== 'inactive');

  const busSettlements = useMemo(() => {
    return activeBuses.map(bus => {
      const existing = settlements.find(s => s.busId === bus.id && s.date === selectedDate);
      if (existing) return { bus, settlement: existing, isExisting: true };
      const calculated = calculateSettlement(bus.id, selectedDate);
      return { bus, settlement: calculated, isExisting: false };
    }).filter(item => item.settlement && (item.settlement.totalIncome > 0 || item.settlement.totalExpenses > 0));
  }, [activeBuses, settlements, selectedDate, calculateSettlement]);

  const totalIncome = busSettlements.reduce((s, item) => s + (item.settlement?.totalIncome || 0), 0);
  const totalExpenses = busSettlements.reduce((s, item) => s + (item.settlement?.totalExpenses || 0), 0);
  const totalSalaries = busSettlements.reduce((s, item) => s + (item.settlement?.driverSalary || 0) + (item.settlement?.conductorSalary || 0), 0);
  const totalProfit = busSettlements.reduce((s, item) => s + (item.settlement?.netProfit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Daily Settlement</h1>
          <p className="text-slate-500 mt-1">Calculate wages, finalize daily accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Company-Wide Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 text-slate-300">Company Settlement Summary — {selectedDate}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Total Salaries</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalSalaries)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Net Profit</span>
            </div>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Per-Bus Settlements */}
      {busSettlements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <Calculator className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No trips or expenses recorded for this date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {busSettlements.map(({ bus, settlement, isExisting }) => {
            if (!settlement) return null;
            const route = SRI_LANKAN_ROUTES.find(r => r.id === bus.routeId);
            const isExpanded = expandedBus === bus.id;
            const busTrips = getTripsByBusAndDate(bus.id, selectedDate);
            const busExpenses = getExpensesByBusAndDate(bus.id, selectedDate);

            return (
              <div key={bus.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Bus Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedBus(isExpanded ? null : bus.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Bus className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-900">{bus.regNumber}</h3>
                          {settlement.isLocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              <Lock className="w-3 h-3" /> LOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">Route {route?.routeNo} &middot; {settlement.wageModel === 'percentage' ? 'Percentage' : 'Fixed'} wages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-slate-500">Net Profit</p>
                        <p className={`text-xl font-bold ${settlement.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(settlement.netProfit)}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Quick Summary Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                    <div className="bg-emerald-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-emerald-600 font-medium">Income</p>
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(settlement.totalIncome)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-red-600 font-medium">Expenses</p>
                      <p className="text-sm font-bold text-red-700">{formatCurrency(settlement.totalExpenses)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-amber-600 font-medium">DTI</p>
                      <p className="text-sm font-bold text-amber-700">{formatCurrency(settlement.dti)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-blue-600 font-medium">Driver Salary</p>
                      <p className="text-sm font-bold text-blue-700">{formatCurrency(settlement.driverSalary)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-purple-600 font-medium">Conductor Salary</p>
                      <p className="text-sm font-bold text-purple-700">{formatCurrency(settlement.conductorSalary)}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Calculation Breakdown */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Calculation Breakdown</h4>
                      <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Trip Income</span>
                          <span className="font-semibold text-emerald-700">{formatCurrency(settlement.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">(-) Total Expenses</span>
                          <span className="font-semibold text-red-600">- {formatCurrency(settlement.totalExpenses)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between">
                          <span className="text-slate-800 font-semibold">Daily Total Income (DTI)</span>
                          <span className="font-bold text-amber-700">{formatCurrency(settlement.dti)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-slate-600">
                            (-) Driver Salary {settlement.wageModel === 'percentage' ? `(${settlement.driverPercentage}% of DTI)` : '(Fixed)'}
                          </span>
                          <span className="font-semibold text-blue-600">- {formatCurrency(settlement.driverSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            (-) Conductor Salary {settlement.wageModel === 'percentage' ? `(${settlement.conductorPercentage}% of DTI)` : '(Fixed)'}
                          </span>
                          <span className="font-semibold text-purple-600">- {formatCurrency(settlement.conductorSalary)}</span>
                        </div>
                        <div className="border-t-2 border-slate-300 pt-2 flex justify-between">
                          <span className="text-slate-900 font-bold">Owner Net Profit</span>
                          <span className={`font-bold text-lg ${settlement.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {formatCurrency(settlement.netProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Trips ({busTrips.length})</h4>
                      <div className="space-y-2">
                        {busTrips.map(trip => (
                          <div key={trip.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500">#{trip.tripNumber}</span>
                              <span className="text-sm text-slate-700">{trip.startTime} {trip.endTime ? `→ ${trip.endTime}` : ''}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                              }`}>{trip.status}</span>
                            </div>
                            <span className="font-semibold text-emerald-700 text-sm">{formatCurrency(trip.income)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expense Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Expenses ({busExpenses.length})</h4>
                      <div className="space-y-2">
                        {busExpenses.map(exp => (
                          <div key={exp.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <Receipt className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-slate-700 capitalize">{exp.category}</span>
                              {exp.description && <span className="text-xs text-slate-400">— {exp.description}</span>}
                            </div>
                            <span className="font-semibold text-red-600 text-sm">{formatCurrency(exp.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lock Button */}
                    {!settlement.isLocked && (
                      <div className="flex items-center gap-3 pt-2">
                        {settlement.dti < 0 && (
                          <div className="flex items-center gap-2 text-amber-600 text-sm flex-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Warning: DTI is negative. Expenses exceed income.</span>
                          </div>
                        )}
                        <button
                          onClick={() => lockSettlement(settlement)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all ml-auto"
                        >
                          <Lock className="w-4 h-4" /> Lock Settlement
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailySettlement;
