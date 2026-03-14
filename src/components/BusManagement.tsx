import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SRI_LANKAN_ROUTES } from '@/data/sriLankanRoutes';
import { formatCurrency } from '@/data/mockData';
import { Bus as BusType, ServiceType, WageModel, SERVICE_TYPES } from '@/data/types';
import {
  Bus, Plus, X, Edit2, Search, Filter, ChevronDown, Shield, Calendar,
  AlertTriangle, CheckCircle2, Wrench, MapPin
} from 'lucide-react';

const BusManagement: React.FC = () => {
  const { buses, addBus, updateBus, currentUser } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    regNumber: '', ntcPermitNo: '', routeId: '', serviceType: 'normal' as ServiceType,
    seatCount: 50, wageModel: 'percentage' as WageModel, driverPercentage: 12,
    conductorPercentage: 8, fixedDriverWage: 4000, fixedConductorWage: 3000,
    permitExpiry: '', insuranceExpiry: '', fitnessExpiry: '',
  });

  const resetForm = () => {
    setFormData({
      regNumber: '', ntcPermitNo: '', routeId: '', serviceType: 'normal',
      seatCount: 50, wageModel: 'percentage', driverPercentage: 12,
      conductorPercentage: 8, fixedDriverWage: 4000, fixedConductorWage: 3000,
      permitExpiry: '', insuranceExpiry: '', fitnessExpiry: '',
    });
    setEditingBus(null);
    setShowForm(false);
  };

  const openEdit = (bus: BusType) => {
    setEditingBus(bus);
    setFormData({
      regNumber: bus.regNumber, ntcPermitNo: bus.ntcPermitNo || '', routeId: bus.routeId,
      serviceType: bus.serviceType, seatCount: bus.seatCount, wageModel: bus.wageModel,
      driverPercentage: bus.driverPercentage || 12, conductorPercentage: bus.conductorPercentage || 8,
      fixedDriverWage: bus.fixedDriverWage || 4000, fixedConductorWage: bus.fixedConductorWage || 3000,
      permitExpiry: bus.permitExpiry || '', insuranceExpiry: bus.insuranceExpiry || '',
      fitnessExpiry: bus.fitnessExpiry || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBus) {
      updateBus(editingBus.id, {
        ...formData,
        driverPercentage: formData.wageModel === 'percentage' ? formData.driverPercentage : undefined,
        conductorPercentage: formData.wageModel === 'percentage' ? formData.conductorPercentage : undefined,
        fixedDriverWage: formData.wageModel === 'fixed' ? formData.fixedDriverWage : undefined,
        fixedConductorWage: formData.wageModel === 'fixed' ? formData.fixedConductorWage : undefined,
      });
    } else {
      addBus({
        ...formData,
        ownerId: currentUser.id,
        companyId: currentUser.companyId,
        status: 'active',
        driverPercentage: formData.wageModel === 'percentage' ? formData.driverPercentage : undefined,
        conductorPercentage: formData.wageModel === 'percentage' ? formData.conductorPercentage : undefined,
        fixedDriverWage: formData.wageModel === 'fixed' ? formData.fixedDriverWage : undefined,
        fixedConductorWage: formData.wageModel === 'fixed' ? formData.fixedConductorWage : undefined,
      });
    }
    resetForm();
  };

  const filteredBuses = buses.filter(b => {
    const matchSearch = b.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ntcPermitNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Bus Fleet</h1>
          <p className="text-slate-500 mt-1">{buses.length} buses registered &middot; {buses.filter(b => b.status === 'active').length} active</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
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
            placeholder="Search by registration or permit number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Bus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBuses.map(bus => {
          const route = SRI_LANKAN_ROUTES.find(r => r.id === bus.routeId);
          const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            active: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
            inactive: { bg: 'bg-slate-100', text: 'text-slate-500', icon: <X className="w-3 h-3" /> },
            maintenance: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Wrench className="w-3 h-3" /> },
          };
          const st = statusColors[bus.status];

          return (
            <div key={bus.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <Bus className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{bus.regNumber}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                        {st.icon} {bus.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => openEdit(bus)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">Route {route?.routeNo}: {route?.origin} → {route?.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>{bus.ntcPermitNo || 'No permit number'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Bus className="w-4 h-4 text-slate-400" />
                    <span>{bus.serviceType.replace('-', ' ')} &middot; {bus.seatCount} seats</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-medium">Wage Model</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {bus.wageModel === 'percentage'
                          ? `${bus.driverPercentage}% / ${bus.conductorPercentage}%`
                          : `Rs.${bus.fixedDriverWage} / Rs.${bus.fixedConductorWage}`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 uppercase font-medium">Permit Expiry</p>
                      <p className="text-sm font-semibold text-slate-900">{bus.permitExpiry || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-3 flex gap-2">
                <button
                  onClick={() => updateBus(bus.id, { status: bus.status === 'active' ? 'inactive' : 'active' })}
                  className="flex-1 text-xs font-medium py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => updateBus(bus.id, { status: 'maintenance' })}
                  className="flex-1 text-xs font-medium py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Maintenance
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Bus Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number *</label>
                  <input required value={formData.regNumber} onChange={e => setFormData(p => ({ ...p, regNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g., NB-1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NTC Permit Number</label>
                  <input value={formData.ntcPermitNo} onChange={e => setFormData(p => ({ ...p, ntcPermitNo: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g., NTC/WP/138/001" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Route *</label>
                <select required value={formData.routeId} onChange={e => setFormData(p => ({ ...p, routeId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none">
                  <option value="">Select Route</option>
                  {SRI_LANKAN_ROUTES.map(r => (
                    <option key={r.id} value={r.id}>Route {r.routeNo}: {r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                  <select value={formData.serviceType} onChange={e => setFormData(p => ({ ...p, serviceType: e.target.value as ServiceType }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none">
                    {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seat Count</label>
                  <input type="number" min={10} max={80} value={formData.seatCount} onChange={e => setFormData(p => ({ ...p, seatCount: parseInt(e.target.value) || 50 }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                </div>
              </div>

              {/* Wage Model */}
              <div className="bg-slate-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Wage Model</label>
                <div className="flex gap-3 mb-4">
                  <button type="button" onClick={() => setFormData(p => ({ ...p, wageModel: 'percentage' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${formData.wageModel === 'percentage' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600'}`}>
                    Percentage Based
                  </button>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, wageModel: 'fixed' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${formData.wageModel === 'fixed' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600'}`}>
                    Fixed Daily Wage
                  </button>
                </div>
                {formData.wageModel === 'percentage' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Driver %</label>
                      <input type="number" min={0} max={50} value={formData.driverPercentage}
                        onChange={e => setFormData(p => ({ ...p, driverPercentage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Conductor %</label>
                      <input type="number" min={0} max={50} value={formData.conductorPercentage}
                        onChange={e => setFormData(p => ({ ...p, conductorPercentage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Driver Daily Wage (Rs.)</label>
                      <input type="number" min={0} value={formData.fixedDriverWage}
                        onChange={e => setFormData(p => ({ ...p, fixedDriverWage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Conductor Daily Wage (Rs.)</label>
                      <input type="number" min={0} value={formData.fixedConductorWage}
                        onChange={e => setFormData(p => ({ ...p, fixedConductorWage: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Document Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Permit Expiry</label>
                  <input type="date" value={formData.permitExpiry} onChange={e => setFormData(p => ({ ...p, permitExpiry: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Expiry</label>
                  <input type="date" value={formData.insuranceExpiry} onChange={e => setFormData(p => ({ ...p, insuranceExpiry: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fitness Expiry</label>
                  <input type="date" value={formData.fitnessExpiry} onChange={e => setFormData(p => ({ ...p, fitnessExpiry: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                  {editingBus ? 'Update Bus' : 'Register Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;
