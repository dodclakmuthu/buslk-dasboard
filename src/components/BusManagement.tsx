import React, { useCallback, useEffect, useState } from 'react';
import { Bus, Plus, Edit2, Search, CheckCircle2, Wrench, Shield, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiBus, BusStatus, CreateBusInput, listBuses, createBus, updateBus } from '@/lib/busApi';
import BusForm from '@/components/BusForm';
import { useToast } from '@/hooks/use-toast';

const STATUS_STYLES: Record<BusStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  INACTIVE: { bg: 'bg-slate-100', text: 'text-slate-500', icon: <span className="w-3 h-3 inline-block rounded-full border border-slate-400" /> },
  MAINTENANCE: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Wrench className="w-3 h-3" /> },
};

const BusManagement: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState<ApiBus | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    try {
      const { buses: data } = await listBuses(token);
      setBuses(data);
    } catch (err: any) {
      setFetchError(err.message ?? 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleFormSubmit = async (input: CreateBusInput) => {
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editingBus) {
        const { bus } = await updateBus(token, editingBus.id, input);
        setBuses(prev => prev.map(b => (b.id === bus.id ? bus : b)));
        toast({ title: 'Bus updated', description: `${bus.registrationNumber} saved.` });
      } else {
        const { bus } = await createBus(token, input);
        setBuses(prev => [...prev, bus]);
        toast({ title: 'Bus registered', description: `${bus.registrationNumber} added to fleet.` });
      }
      setShowForm(false);
      setEditingBus(null);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (bus: ApiBus, status: BusStatus) => {
    if (!token) return;
    try {
      const { bus: updated } = await updateBus(token, bus.id, { status });
      setBuses(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const filteredBuses = buses.filter(b => {
    const matchSearch =
      b.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ntcPermitNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.busName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Bus Fleet</h1>
          <p className="text-slate-500 mt-1">
            {buses.length} buses registered &middot; {buses.filter(b => b.status === 'ACTIVE').length} active
          </p>
        </div>
        <button
          onClick={() => { setEditingBus(null); setFormError(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Bus
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by registration, name, or permit number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading fleet…
        </div>
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{fetchError}</span>
          <button onClick={load} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && filteredBuses.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Bus className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-500">{buses.length === 0 ? 'No buses registered yet' : 'No buses match your search'}</p>
          {buses.length === 0 && (
            <p className="text-sm mt-1">Click "Add New Bus" to register your first vehicle.</p>
          )}
        </div>
      )}

      {/* Bus Cards Grid */}
      {!loading && !fetchError && filteredBuses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuses.map(bus => {
            const st = STATUS_STYLES[bus.status];
            const routeLabel = bus.route?.routeName ?? 'No route assigned';

            return (
              <div key={bus.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
                        <Bus className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{bus.registrationNumber}</h3>
                        {bus.busName && <p className="text-xs text-slate-400">{bus.busName}</p>}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {st.icon} {bus.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditingBus(bus); setFormError(null); setShowForm(true); }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{routeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{bus.ntcPermitNumber ?? 'No permit number'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Bus className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{bus.seatCount != null ? `${bus.seatCount} seats` : 'Seats not set'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 px-5 py-3 flex gap-2">
                  <button
                    onClick={() => handleQuickStatus(bus, bus.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className="flex-1 text-xs font-medium py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {bus.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleQuickStatus(bus, 'MAINTENANCE')}
                    disabled={bus.status === 'MAINTENANCE'}
                    className="flex-1 text-xs font-medium py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  >
                    Maintenance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <BusForm
          editing={editingBus}
          saving={saving}
          error={formError}
          onClose={() => { setShowForm(false); setEditingBus(null); setFormError(null); }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default BusManagement;
