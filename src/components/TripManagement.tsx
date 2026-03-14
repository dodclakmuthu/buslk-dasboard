import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SRI_LANKAN_ROUTES, getRoutePoints } from '@/data/sriLankanRoutes';
import { formatCurrency, getTodayString } from '@/data/mockData';
import { ExpenseCategory, EXPENSE_CATEGORIES, Trip } from '@/data/types';
import {
  Route, Play, Square, MapPin, Bus,
  X, Receipt, ArrowRight
} from 'lucide-react';


const TripManagement: React.FC = () => {
  const {
    buses, addTrip, updateTrip, addExpense,
    getTripsByBusAndDate, getExpensesByBusAndDate, getAssignmentForBus,
    getBusById, getUserById, getDrivers, getConductors
  } = useAppContext();


  const today = getTodayString();
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [showStartTrip, setShowStartTrip] = useState(false);
  const [showEndTrip, setShowEndTrip] = useState<Trip | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Start trip form
  const [tripForm, setTripForm] = useState({
    driverId: '', conductorId: '', startPointId: '', endPointId: '', startTime: '',
  });

  // End trip form
  const [endTripForm, setEndTripForm] = useState({
    income: 0, passengerCount: 0, endPointId: '', endTime: '', notes: '',
  });

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    category: 'diesel' as ExpenseCategory, amount: 0, description: '', tripId: '',
  });

  const activeBuses = buses.filter(b => b.status === 'active');
  const selectedBus = getBusById(selectedBusId);
  const busTrips = selectedBusId ? getTripsByBusAndDate(selectedBusId, today) : [];
  const busExpenses = selectedBusId ? getExpensesByBusAndDate(selectedBusId, today) : [];
  const assignment = selectedBusId ? getAssignmentForBus(selectedBusId, today) : undefined;

  const route = selectedBus ? SRI_LANKAN_ROUTES.find(r => r.id === selectedBus.routeId) : undefined;
  const routePoints = route ? getRoutePoints(route.id) : [];

  const totalIncome = busTrips.filter(t => t.status === 'completed').reduce((s, t) => s + t.income, 0);
  const totalExpenses = busExpenses.reduce((s, e) => s + e.amount, 0);

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus || !route) return;
    const tripNumber = busTrips.length + 1;
    addTrip({
      busId: selectedBusId,
      driverId: tripForm.driverId || (assignment?.driverId || ''),
      conductorId: tripForm.conductorId || (assignment?.conductorId || ''),
      routeId: route.id,
      date: today,
      tripNumber,
      startPointId: tripForm.startPointId,
      endPointId: tripForm.endPointId || undefined,
      startTime: tripForm.startTime || new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'in-progress',
      income: 0,
    });
    setTripForm({ driverId: '', conductorId: '', startPointId: '', endPointId: '', startTime: '' });
    setShowStartTrip(false);
  };

  const handleEndTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEndTrip) return;
    updateTrip(showEndTrip.id, {
      income: endTripForm.income,
      passengerCount: endTripForm.passengerCount || undefined,
      endPointId: endTripForm.endPointId || showEndTrip.endPointId,
      endTime: endTripForm.endTime || new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'completed',
      notes: endTripForm.notes || undefined,
    });
    setEndTripForm({ income: 0, passengerCount: 0, endPointId: '', endTime: '', notes: '' });
    setShowEndTrip(null);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      busId: selectedBusId,
      tripId: expenseForm.tripId || undefined,
      date: today,
      category: expenseForm.category,
      amount: expenseForm.amount,
      description: expenseForm.description,
      enteredBy: 'user-1',
    });
    setExpenseForm({ category: 'diesel', amount: 0, description: '', tripId: '' });
    setShowAddExpense(false);
  };

  const getPointName = (pointId: string) => {
    if (!route) return pointId;
    const pt = route.points.find(p => p.id === pointId);
    return pt?.name || pointId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Trip Management</h1>
          <p className="text-slate-500 mt-1">Manage daily trips, income, and expenses</p>
        </div>
      </div>

      {/* Bus Selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Bus</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {activeBuses.map(bus => (
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
              <p className={`text-sm font-bold ${selectedBusId === bus.id ? 'text-amber-700' : 'text-slate-700'}`}>{bus.regNumber}</p>
              <p className="text-[10px] text-slate-400">Route {SRI_LANKAN_ROUTES.find(r => r.id === bus.routeId)?.routeNo}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedBusId && selectedBus && (
        <>
          {/* Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium">Total Income</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs text-red-600 font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">Net (DTI)</p>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(totalIncome - totalExpenses)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Trips Today</p>
              <p className="text-xl font-bold text-blue-700">{busTrips.length}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setTripForm({
                  driverId: assignment?.driverId || '',
                  conductorId: assignment?.conductorId || '',
                  startPointId: '', endPointId: '', startTime: '',
                });
                setShowStartTrip(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              <Play className="w-4 h-4" /> Start New Trip
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            >
              <Receipt className="w-4 h-4" /> Add Expense
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
                  const driver = getUserById(trip.driverId);
                  const conductor = getUserById(trip.conductorId);
                  const tripExpenses = busExpenses.filter(e => e.tripId === trip.id);
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
                              <span>{getPointName(trip.startPointId)}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>{trip.endPointId ? getPointName(trip.endPointId) : '...'}</span>
                            </div>
                          </div>
                        </div>
                        {trip.status === 'in-progress' && (
                          <button
                            onClick={() => {
                              setEndTripForm({ income: 0, passengerCount: 0, endPointId: '', endTime: '', notes: '' });
                              setShowEndTrip(trip);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                          >
                            <Square className="w-3 h-3" /> End Trip
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-[11px] text-slate-400">Time</p>
                          <p className="font-medium text-slate-700">{trip.startTime} {trip.endTime ? `→ ${trip.endTime}` : ''}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Income</p>
                          <p className="font-medium text-emerald-700">{trip.income > 0 ? formatCurrency(trip.income) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Expenses</p>
                          <p className="font-medium text-red-600">{tripExpenseTotal > 0 ? formatCurrency(tripExpenseTotal) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">Crew</p>
                          <p className="font-medium text-slate-700 truncate">{driver?.name?.split(' ')[0]} / {conductor?.name?.split(' ')[0]}</p>
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
            {busExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No expenses recorded</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {busExpenses.map(exp => (
                  <div key={exp.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 capitalize">{exp.category.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-400">{exp.description || 'No description'}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Start Trip Modal */}
      {showStartTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Start New Trip</h2>
              <button onClick={() => setShowStartTrip(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleStartTrip} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                <select value={tripForm.driverId} onChange={e => setTripForm(p => ({ ...p, driverId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Driver</option>
                  {getDrivers().map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conductor</label>
                <select value={tripForm.conductorId} onChange={e => setTripForm(p => ({ ...p, conductorId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Conductor</option>
                  {getConductors().map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Point *</label>
                <select required value={tripForm.startPointId} onChange={e => setTripForm(p => ({ ...p, startPointId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Start Point</option>
                  {routePoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination (Optional)</label>
                <select value={tripForm.endPointId} onChange={e => setTripForm(p => ({ ...p, endPointId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Destination</option>
                  {routePoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input type="time" value={tripForm.startTime} onChange={e => setTripForm(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStartTrip(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Start Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Trip Modal */}
      {showEndTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">End Trip #{showEndTrip.tripNumber}</h2>
              <button onClick={() => setShowEndTrip(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEndTrip} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trip Income (Rs.) *</label>
                <input required type="number" min={0} value={endTripForm.income || ''} onChange={e => setEndTripForm(p => ({ ...p, income: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Enter total cash collected" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passenger Count</label>
                <input type="number" min={0} value={endTripForm.passengerCount || ''} onChange={e => setEndTripForm(p => ({ ...p, passengerCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Point</label>
                <select value={endTripForm.endPointId} onChange={e => setEndTripForm(p => ({ ...p, endPointId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select End Point</option>
                  {routePoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input type="time" value={endTripForm.endTime} onChange={e => setEndTripForm(p => ({ ...p, endTime: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={endTripForm.notes} onChange={e => setEndTripForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" rows={2}
                  placeholder="Any notes about this trip..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEndTrip(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => setExpenseForm(p => ({ ...p, category: cat.value }))}
                      className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                        expenseForm.category === cat.value ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-200'
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
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Add Expense
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
