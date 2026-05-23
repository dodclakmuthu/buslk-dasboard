import React, { useCallback, useEffect, useState } from 'react';
import {
  Route, Play, Square, MapPin, Bus,
  X, Receipt, ArrowRight, Loader2, AlertCircle, RefreshCw, PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePolling } from '@/hooks/usePolling';
import { ApiBus, listBuses, addOperationalExpense, addOperationalIncome } from '@/lib/busApi';
import { listStaff, ApiStaff } from '@/lib/staffApi';
import {
  getTripManagementSummary,
  mapTripManagementSummaryToUi,
  startTrip,
  endTrip,
  addTripExpense,
  addTripExtraIncome,
  TripManagementUiData,
} from '@/lib/tripsApi';
import { EXPENSE_CATEGORIES, ExpenseCategory, ExtraIncomeCategory, Trip, Expense, ExtraIncome } from '@/data/types';
import { TripsPageSkeleton } from './PageSkeletons';

// ─── Local helpers ────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const EXTRA_INCOME_CATEGORIES: { value: ExtraIncomeCategory; label: string }[] = [
  { value: 'PARCEL', label: 'Parcel' },
  { value: 'BAGGAGE', label: 'Baggage' },
  { value: 'OTHER_EXTRA_INCOME', label: 'Other Income' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const TripManagement: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // ── Buses ──────────────────────────────────────────────────────────────────
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [busesError, setBusesError] = useState<string | null>(null);

  const loadBuses = useCallback(async () => {
    if (!token) return;
    setBusesLoading(true);
    setBusesError(null);
    try {
      const { buses: data } = await listBuses(token);
      setBuses(data.filter(b => b.isActive));
    } catch (err: any) {
      setBusesError(err.message ?? 'Failed to load buses');
    } finally {
      setBusesLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadBuses(); }, [loadBuses]);

  useEffect(() => {
    if (busesLoading || buses.length === 0) return;

    setSelectedBusId((current) => {
      if (current && buses.some((bus) => bus.id === current)) {
        return current;
      }

      return buses[0]?.id ?? '';
    });
  }, [buses, busesLoading]);

  // ── Staff ──────────────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<ApiStaff[]>([]);

  useEffect(() => {
    if (!token) return;
    listStaff(token)
      .then(({ staff }) => setStaffList(staff.filter(s => s.isActive)))
      .catch(() => { /* non-critical */ });
  }, [token]);

  const drivers = staffList.filter(s => s.roleType === 'DRIVER' || s.roleType === 'DRIVER_CONDUCTOR');
  const conductors = staffList.filter(s => s.roleType === 'CONDUCTOR' || s.roleType === 'DRIVER_CONDUCTOR');

  // ── Selected bus + summary ─────────────────────────────────────────────────
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [summary, setSummary] = useState<TripManagementUiData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const loadSummary = useCallback(async (busId?: string) => {
    const id = busId ?? selectedBusId;
    if (!token || !id) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const raw = await getTripManagementSummary(token, id, { today: true });
      setSummary(mapTripManagementSummaryToUi(raw));
    } catch (err: any) {
      setSummaryError(err.message ?? 'Failed to load trip data');
    } finally {
      setSummaryLoading(false);
    }
  }, [token, selectedBusId]);

  useEffect(() => {
    if (selectedBusId) { void loadSummary(selectedBusId); }
    else { setSummary(null); }
  }, [selectedBusId]); // eslint-disable-line react-hooks/exhaustive-deps

  usePolling(
    () => loadSummary(),
    { enabled: !!selectedBusId && !!token, intervalMs: 5 * 60 * 1000 },
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const busTrips: Trip[] = summary?.todayTrips ?? [];
  const allExpenses: Expense[] = [...(summary?.todayExpenses ?? []), ...(summary?.todayOperationalExpenses ?? [])];
  const allExtraIncomes: ExtraIncome[] = [...(summary?.todayExtraIncomes ?? []), ...(summary?.todayOperationalIncomes ?? [])];
  const hasActiveTrip = busTrips.some(t => t.status === 'in-progress');

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showStartTrip, setShowStartTrip] = useState(false);
  const [showEndTrip, setShowEndTrip] = useState<Trip | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

  // ── Start trip ─────────────────────────────────────────────────────────────
  const [tripForm, setTripForm] = useState({ driverId: '', conductorId: '', startTime: '' });
  const [startTripLoading, setStartTripLoading] = useState(false);
  const [startTripError, setStartTripError] = useState<string | null>(null);

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBusId) return;
    setStartTripLoading(true);
    setStartTripError(null);
    try {
      await startTrip(token, {
        busId: selectedBusId,
        driverStaffId: tripForm.driverId || undefined,
        conductorStaffId: tripForm.conductorId || undefined,
      });
      setTripForm({ driverId: '', conductorId: '', startTime: '' });
      setShowStartTrip(false);
      await loadSummary();
      toast({ title: 'Trip Started', description: 'New trip has been started.' });
    } catch (err: any) {
      setStartTripError(err.message ?? 'Failed to start trip');
    } finally {
      setStartTripLoading(false);
    }
  };

  // ── End trip ───────────────────────────────────────────────────────────────
  const [endTripForm, setEndTripForm] = useState({ income: 0, passengerCount: 0, notes: '' });
  const [endTripLoading, setEndTripLoading] = useState(false);
  const [endTripError, setEndTripError] = useState<string | null>(null);

  const handleEndTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !showEndTrip) return;
    setEndTripLoading(true);
    setEndTripError(null);
    try {
      await endTrip(token, showEndTrip.id, {
        income: endTripForm.income,
        note: endTripForm.notes.trim() || undefined,
      });
      setEndTripForm({ income: 0, passengerCount: 0, notes: '' });
      setShowEndTrip(null);
      await loadSummary();
      toast({ title: 'Trip Completed', description: `Income: ${formatCurrency(endTripForm.income)}` });
    } catch (err: any) {
      setEndTripError(err.message ?? 'Failed to end trip');
    } finally {
      setEndTripLoading(false);
    }
  };

  // ── Add Expense ────────────────────────────────────────────────────────────
  const [expenseForm, setExpenseForm] = useState<{ category: ExpenseCategory; amount: number; tripId: string; description: string }>({
    category: 'diesel', amount: 0, tripId: '', description: '',
  });
  const [addExpenseLoading, setAddExpenseLoading] = useState(false);
  const [addExpenseError, setAddExpenseError] = useState<string | null>(null);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBusId) return;
    setAddExpenseLoading(true);
    setAddExpenseError(null);
    try {
      if (expenseForm.tripId) {
        await addTripExpense(token, expenseForm.tripId, {
          category: expenseForm.category,
          amount: expenseForm.amount,
          note: expenseForm.description.trim() || undefined,
        });
      } else {
        await addOperationalExpense(token, selectedBusId, {
          category: expenseForm.category,
          amount: expenseForm.amount,
          description: expenseForm.description.trim() || undefined,
        });
      }
      setExpenseForm({ category: 'diesel', amount: 0, tripId: '', description: '' });
      setShowAddExpense(false);
      await loadSummary();
      toast({ title: 'Expense Added', description: `Rs. ${expenseForm.amount.toLocaleString()} recorded.` });
    } catch (err: any) {
      setAddExpenseError(err.message ?? 'Failed to add expense');
    } finally {
      setAddExpenseLoading(false);
    }
  };

  // ── Add Income ─────────────────────────────────────────────────────────────
  const [incomeForm, setIncomeForm] = useState<{ category: ExtraIncomeCategory; amount: number; tripId: string; description: string }>({
    category: 'PARCEL', amount: 0, tripId: '', description: '',
  });
  const [addIncomeLoading, setAddIncomeLoading] = useState(false);
  const [addIncomeError, setAddIncomeError] = useState<string | null>(null);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBusId) return;
    setAddIncomeLoading(true);
    setAddIncomeError(null);
    try {
      if (incomeForm.tripId) {
        await addTripExtraIncome(token, incomeForm.tripId, {
          category: incomeForm.category,
          amount: incomeForm.amount,
          note: incomeForm.description.trim() || undefined,
        });
      } else {
        await addOperationalIncome(token, selectedBusId, {
          category: incomeForm.category,
          amount: incomeForm.amount,
          description: incomeForm.description.trim() || undefined,
        });
      }
      setIncomeForm({ category: 'PARCEL', amount: 0, tripId: '', description: '' });
      setShowAddIncome(false);
      await loadSummary();
      toast({ title: 'Income Added', description: `Rs. ${incomeForm.amount.toLocaleString()} recorded.` });
    } catch (err: any) {
      setAddIncomeError(err.message ?? 'Failed to add income');
    } finally {
      setAddIncomeLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStaffName = (staffId: string | null | undefined) => {
    if (!staffId) return '—';
    const s = staffList.find(st => st.id === staffId);
    return s ? s.fullName.split(' ')[0] : '—';
  };

  const isTripsInitialLoading = busesLoading && buses.length === 0 && !busesError;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Trip Management</h1>
          <p className="text-slate-500 mt-1">Manage daily trips, income, and expenses</p>
        </div>
        {selectedBusId && (
          <button
            onClick={() => loadSummary()}
            disabled={summaryLoading}
            className="self-start flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {isTripsInitialLoading ? (
        <TripsPageSkeleton showHeader={false} />
      ) : (
        <>
          {/* Bus Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Bus</label>

            {busesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-3 rounded-xl border-2 border-slate-100 bg-white text-center space-y-2">
                    <div className="w-6 h-6 rounded mx-auto bg-slate-100/80 animate-pulse" />
                    <div className="h-4 w-16 mx-auto rounded bg-slate-100/80 animate-pulse" />
                    <div className="h-3 w-10 mx-auto rounded bg-slate-100/80 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : busesError ? (
              <div className="flex items-center gap-2 text-red-500 py-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{busesError}</span>
                <button onClick={loadBuses} className="ml-2 text-xs underline">Retry</button>
              </div>
            ) : buses.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No active buses found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {buses.map(bus => (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedBusId(bus.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedBusId === bus.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <Bus className={`w-6 h-6 mx-auto mb-1 ${selectedBusId === bus.id ? 'text-amber-600' : 'text-slate-400'}`} />
                    <p className={`text-sm font-bold ${selectedBusId === bus.id ? 'text-amber-700' : 'text-slate-700'}`}>
                      {bus.registrationNumber}
                    </p>
                    <p className="text-[10px] text-slate-400">{bus.route?.routeCode ?? bus.busName ?? '—'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedBusId && (
            <>
              {summaryLoading && !summary ? (
                <TripsPageSkeleton showHeader={false} showBusSelector={false} />
              ) : (
                <>
                  {summaryError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {summaryError}
                      <button onClick={() => loadSummary()} className="ml-auto underline text-xs">Retry</button>
                    </div>
                  )}

          {/* Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium">Total Income</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(summary?.totalIncome ?? 0)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs text-red-600 font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(summary?.totalExpenses ?? 0)}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">Net (DTI)</p>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(summary?.netAmount ?? 0)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Trips Today</p>
              <p className="text-xl font-bold text-blue-700">{summary?.tripsToday ?? 0}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              disabled={hasActiveTrip}
              onClick={() => { setTripForm({ driverId: '', conductorId: '', startTime: '' }); setStartTripError(null); setShowStartTrip(true); }}
              title={hasActiveTrip ? 'End the current active trip before starting a new one' : undefined}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Play className="w-4 h-4" /> Start New Trip
            </button>
            <button
              onClick={() => { setExpenseForm({ category: 'diesel', amount: 0, tripId: '', description: '' }); setAddExpenseError(null); setShowAddExpense(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              <Receipt className="w-4 h-4" /> Add Expense
            </button>
            <button
              onClick={() => { setIncomeForm({ category: 'PARCEL', amount: 0, tripId: '', description: '' }); setAddIncomeError(null); setShowAddIncome(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Income
            </button>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Today's Trips</h2>
            </div>
            {busTrips.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No trips recorded yet today</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {busTrips.map(trip => {
                  const tripExpenses = allExpenses.filter(e => e.tripId === trip.id);
                  const tripExpenseTotal = tripExpenses.reduce((s, e) => s + e.amount, 0);

                  return (
                    <div key={trip.id} className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                            ${trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : trip.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
                          `}>
                            #{trip.tripNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">Trip #{trip.tripNumber}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                ${trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : trip.status === 'in-progress' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-500'}
                              `}>
                                {trip.status === 'in-progress' ? 'IN PROGRESS' : trip.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{trip.startPointId || '—'}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>{trip.endPointId || '…'}</span>
                            </div>
                          </div>
                        </div>
                        {trip.status === 'in-progress' && (
                          <button
                            onClick={() => { setEndTripForm({ income: 0, passengerCount: 0, notes: '' }); setEndTripError(null); setShowEndTrip(trip); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                          >
                            <Square className="w-3 h-3" /> End Trip
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-[11px] text-slate-400">Time</p>
                          <p className="font-medium text-slate-700">{trip.startTime}{trip.endTime ? ` → ${trip.endTime}` : ''}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Income</p>
                          <p className="font-medium text-emerald-700">{trip.income > 0 ? formatCurrency(trip.income) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Expenses</p>
                          <p className="font-medium text-red-600">{tripExpenseTotal > 0 ? formatCurrency(tripExpenseTotal) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Crew</p>
                          <p className="font-medium text-slate-700 truncate">{getStaffName(trip.driverId)} / {getStaffName(trip.conductorId)}</p>
                        </div>
                      </div>

                      {tripExpenses.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tripExpenses.map(exp => (
                            <span key={exp.id} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                              <span className="capitalize">{exp.category}</span>: {formatCurrency(exp.amount)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Today's Expenses</h2>
            </div>
            {allExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No expenses recorded</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {allExpenses.map(exp => (
                  <div key={exp.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 capitalize">{exp.category.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-400">{exp.description || (exp.tripId ? 'Trip expense' : 'Daily expense')}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

                  {/* Extra Incomes List */}
                  {allExtraIncomes.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="p-5 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-900">Today's Extra Income</h2>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {allExtraIncomes.map(inc => (
                          <div key={inc.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                <PlusCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 capitalize">{inc.category.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-slate-400">{inc.note || (inc.tripId ? 'Trip extra income' : 'Operational income')}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-blue-600">{formatCurrency(inc.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ── Start Trip Modal ──────────────────────────────────────────────── */}
      {showStartTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Start New Trip</h2>
              <button onClick={() => setShowStartTrip(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleStartTrip} className="p-6 space-y-4">
              {startTripError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{startTripError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                <select value={tripForm.driverId} onChange={e => setTripForm(p => ({ ...p, driverId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Driver (optional)</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conductor</label>
                <select value={tripForm.conductorId} onChange={e => setTripForm(p => ({ ...p, conductorId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Conductor (optional)</option>
                  {conductors.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input type="time" value={tripForm.startTime} onChange={e => setTripForm(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStartTrip(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={startTripLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {startTripLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Start Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── End Trip Modal ────────────────────────────────────────────────── */}
      {showEndTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">End Trip #{showEndTrip.tripNumber}</h2>
              <button onClick={() => setShowEndTrip(null)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEndTrip} className="p-6 space-y-4">
              {endTripError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{endTripError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trip Income (Rs.) *</label>
                <input required type="number" min={0} value={endTripForm.income || ''} onChange={e => setEndTripForm(p => ({ ...p, income: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Enter total cash collected" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passenger Count</label>
                <input type="number" min={0} value={endTripForm.passengerCount || ''}
                  onChange={e => setEndTripForm(p => ({ ...p, passengerCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={endTripForm.notes} onChange={e => setEndTripForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  rows={2} placeholder="Any notes about this trip…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEndTrip(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={endTripLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {endTripLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Expense Modal ─────────────────────────────────────────────── */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              {addExpenseError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{addExpenseError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => setExpenseForm(p => ({ ...p, category: cat.value }))}
                      className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                        expenseForm.category === cat.value ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-100 text-slate-700 hover:border-slate-200'
                      }`}>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs.) *</label>
                <input required type="number" min={1} value={expenseForm.amount || ''} onChange={e => setExpenseForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Trip (Optional)</label>
                <select value={expenseForm.tripId} onChange={e => setExpenseForm(p => ({ ...p, tripId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">General / Daily Expense</option>
                  {busTrips.map(t => <option key={t.id} value={t.id}>Trip #{t.tripNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input value={expenseForm.description} onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g., Full tank at Kadawatha" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={addExpenseLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {addExpenseLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Income Modal ──────────────────────────────────────────────── */}
      {showAddIncome && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add Income</h2>
              <button onClick={() => setShowAddIncome(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddIncome} className="p-6 space-y-4">
              {addIncomeError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{addIncomeError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {EXTRA_INCOME_CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => setIncomeForm(p => ({ ...p, category: cat.value }))}
                      className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                        incomeForm.category === cat.value ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-100 text-slate-700 hover:border-slate-200'
                      }`}>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs.) *</label>
                <input required type="number" min={1} value={incomeForm.amount || ''} onChange={e => setIncomeForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Trip (Optional)</label>
                <select value={incomeForm.tripId} onChange={e => setIncomeForm(p => ({ ...p, tripId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Operational / Daily Income</option>
                  {busTrips.map(t => <option key={t.id} value={t.id}>Trip #{t.tripNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input value={incomeForm.description} onChange={e => setIncomeForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g., Parcel from Colombo" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddIncome(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={addIncomeLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {addIncomeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
