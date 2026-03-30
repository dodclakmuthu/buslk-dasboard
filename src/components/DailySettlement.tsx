import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/data/mockData';
import {
  Calculator, Lock, Bus, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Wallet, Users, AlertTriangle,
  Receipt, Loader2, AlertCircle, Printer,
} from 'lucide-react';
import {
  listSettlements,
  getBusSettlementDetail,
  lockBusSettlement,
  type ApiSettlementListResponse,
  type ApiSettlementDetailResponse,
  type ApiSettlementCard,
} from '@/lib/settlementApi';

function getSLToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
}

const DailySettlement: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(getSLToday);
  const [data, setData] = useState<ApiSettlementListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedBus, setExpandedBus] = useState<string | null>(null);
  const [busDetails, setBusDetails] = useState<Record<string, ApiSettlementDetailResponse>>({});
  const [busDetailLoading, setBusDetailLoading] = useState<Record<string, boolean>>({});

  const [lockingBus, setLockingBus] = useState<string | null>(null);

  const loadSettlements = useCallback(async (date: string) => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    setBusDetails({});
    setBusDetailLoading({});
    setExpandedBus(null);
    try {
      const res = await listSettlements(token, date);
      setData(res);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load settlement data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadSettlements(selectedDate);
  }, [selectedDate, loadSettlements]);

  const handleToggleBus = async (card: ApiSettlementCard) => {
    const busId = card.busId;
    if (expandedBus === busId) { setExpandedBus(null); return; }
    setExpandedBus(busId);
    if (!busDetails[busId] && !busDetailLoading[busId]) {
      setBusDetailLoading(prev => ({ ...prev, [busId]: true }));
      try {
        const detail = await getBusSettlementDetail(token!, busId, selectedDate);
        setBusDetails(prev => ({ ...prev, [busId]: detail }));
      } catch (err: any) {
        toast({ title: 'Failed to load detail', description: err.message, variant: 'destructive' });
      } finally {
        setBusDetailLoading(prev => ({ ...prev, [busId]: false }));
      }
    }
  };

  const handleLock = async (busId: string) => {
    if (!token) return;
    setLockingBus(busId);
    try {
      const detail = await lockBusSettlement(token, busId, selectedDate);
      setBusDetails(prev => ({ ...prev, [busId]: detail }));
      toast({ title: 'Settlement locked', description: 'Daily settlement has been finalised.' });
      await loadSettlements(selectedDate);
    } catch (err: any) {
      toast({ title: 'Lock failed', description: err.message, variant: 'destructive' });
    } finally {
      setLockingBus(null);
    }
  };

  const summary = data?.summary ?? { totalIncome: 0, totalExpenses: 0, totalSalaries: 0, netProfit: 0 };
  const buses = data?.buses ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Daily Settlement</h1>
          <p className="text-slate-500 mt-1">Calculate wages, finalize daily accounts</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-slate-700 font-medium mb-1">Failed to load settlement data</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={() => void loadSettlements(selectedDate)}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loaded content */}
      {!loading && !error && (
        <>
          {/* Company-Wide Summary */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 text-slate-300">Company Settlement Summary — {selectedDate}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-slate-400">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Total Salaries</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalSalaries)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Net Profit</span>
                </div>
                <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Per-Bus Settlements */}
          {buses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No trips or expenses recorded for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {buses.map(card => {
                const isExpanded = expandedBus === card.busId;
                const detail = busDetails[card.busId];
                const detailLoading = busDetailLoading[card.busId] ?? false;
                const isLocking = lockingBus === card.busId;
                const routeLabel = card.route
                  ? (card.route.routeCode ?? card.route.routeName)
                  : null;

                return (
                  <div key={card.busId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Bus Header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => void handleToggleBus(card)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <Bus className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-slate-900">{card.registrationNumber}</h3>
                              {card.isLocked && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  <Lock className="w-3 h-3" /> LOCKED
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {routeLabel ? `Route ${routeLabel}` : 'No route assigned'}
                              {' \u00B7 '}
                              {card.wageType === 'percentage' ? 'Percentage' : 'Fixed'} wages
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm text-slate-500">Net Profit</p>
                            <p className={`text-xl font-bold ${card.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(card.netProfit)}
                            </p>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Quick Summary Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                        <div className="bg-emerald-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-emerald-600 font-medium">Income</p>
                          <p className="text-sm font-bold text-emerald-700">{formatCurrency(card.totalIncome)}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-red-600 font-medium">Expenses</p>
                          <p className="text-sm font-bold text-red-700">{formatCurrency(card.totalExpenses)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-amber-600 font-medium">DTI</p>
                          <p className="text-sm font-bold text-amber-700">{formatCurrency(card.dti)}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-blue-600 font-medium">Driver Salary</p>
                          <p className="text-sm font-bold text-blue-700">{formatCurrency(card.driverSalary)}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-purple-600 font-medium">Conductor Salary</p>
                          <p className="text-sm font-bold text-purple-700">{formatCurrency(card.conductorSalary)}</p>
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
                              <span className="font-semibold text-emerald-700">{formatCurrency(card.totalIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">(-) Total Expenses</span>
                              <span className="font-semibold text-red-600">- {formatCurrency(card.totalExpenses)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between">
                              <span className="text-slate-800 font-semibold">Daily Total Income (DTI)</span>
                              <span className="font-bold text-amber-700">{formatCurrency(card.dti)}</span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-slate-600">
                                (-) Driver Salary {card.wageType === 'percentage' ? `(${card.driverPercentage}% of DTI)` : '(Fixed)'}
                              </span>
                              <span className="font-semibold text-blue-600">- {formatCurrency(card.driverSalary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                (-) Conductor Salary {card.wageType === 'percentage' ? `(${card.conductorPercentage}% of DTI)` : '(Fixed)'}
                              </span>
                              <span className="font-semibold text-purple-600">- {formatCurrency(card.conductorSalary)}</span>
                            </div>
                            <div className="border-t-2 border-slate-300 pt-2 flex justify-between">
                              <span className="text-slate-900 font-bold">Owner Net Profit</span>
                              <span className={`font-bold text-lg ${card.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                {formatCurrency(card.netProfit)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Trips + Expenses (lazy loaded) */}
                        {detailLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          </div>
                        ) : detail ? (
                          <>
                            {/* Trip Details */}
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">Trips ({detail.trips.length})</h4>
                              <div className="space-y-2">
                                {detail.trips.length === 0 ? (
                                  <p className="text-sm text-slate-400 px-1">No trips recorded for this date.</p>
                                ) : (
                                  detail.trips.map(trip => (
                                    <div key={trip.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500">#{trip.tripNumber}</span>
                                        <span className="text-sm text-slate-700">
                                          {trip.startTime ?? '—'}{trip.endTime ? ` → ${trip.endTime}` : ''}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                          trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{trip.status}</span>
                                      </div>
                                      <span className="font-semibold text-emerald-700 text-sm">{formatCurrency(trip.income)}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Expense Details */}
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">Expenses ({detail.expenses.length})</h4>
                              <div className="space-y-2">
                                {detail.expenses.length === 0 ? (
                                  <p className="text-sm text-slate-400 px-1">No expenses recorded for this date.</p>
                                ) : (
                                  detail.expenses.map(exp => (
                                    <div key={exp.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3">
                                      <div className="flex items-center gap-3">
                                        <Receipt className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-slate-700 capitalize">{exp.category}</span>
                                        {exp.description && <span className="text-xs text-slate-400">— {exp.description}</span>}
                                      </div>
                                      <span className="font-semibold text-red-600 text-sm">{formatCurrency(exp.amount)}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </>
                        ) : null}

                        {/* Lock Button */}
                        {!card.isLocked && (
                          <div className="flex items-center gap-3 pt-2 no-print">
                            {card.dti < 0 && (
                              <div className="flex items-center gap-2 text-amber-600 text-sm flex-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Warning: DTI is negative. Expenses exceed income.</span>
                              </div>
                            )}
                            <button
                              onClick={() => void handleLock(card.busId)}
                              disabled={isLocking}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all ml-auto disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isLocking ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Locking...</>
                              ) : (
                                <><Lock className="w-4 h-4" /> Lock Settlement</>
                              )}
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
        </>
      )}
    </div>
  );
};

export default DailySettlement;
