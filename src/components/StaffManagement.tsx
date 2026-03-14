import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { UserRole } from '@/data/types';
import { formatCurrency, getTodayString } from '@/data/mockData';
import { SRI_LANKAN_ROUTES } from '@/data/sriLankanRoutes';
import {
  Users, Plus, X, Edit2, Search, UserCheck, UserX, Phone, CreditCard,
  Shield, Bus, Link2, ChevronRight
} from 'lucide-react';

const StaffManagement: React.FC = () => {
  const {
    users, buses, assignments, addUser, updateUser, addAssignment,
    getDrivers, getConductors, getAssignmentForBus, getUserById, currentUser
  } = useAppContext();

  const today = getTodayString();
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [staffForm, setStaffForm] = useState({
    name: '', phone: '', role: 'driver' as UserRole, nic: '', licenseNo: '',
  });

  const [assignForm, setAssignForm] = useState({
    busId: '', driverId: '', conductorId: '',
  });

  const staffMembers = users.filter(u => u.id !== currentUser.id && u.role !== 'owner');

  const filteredStaff = staffMembers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      ...staffForm,
      companyId: currentUser.companyId,
      isActive: true,
    });
    setStaffForm({ name: '', phone: '', role: 'driver', nic: '', licenseNo: '' });
    setShowAddStaff(false);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    addAssignment({
      busId: assignForm.busId,
      driverId: assignForm.driverId,
      conductorId: assignForm.conductorId,
      date: today,
      isActive: true,
    });
    setAssignForm({ busId: '', driverId: '', conductorId: '' });
    setShowAssign(false);
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    manager: { bg: 'bg-purple-100', text: 'text-purple-700' },
    driver: { bg: 'bg-blue-100', text: 'text-blue-700' },
    conductor: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  };

  const activeBuses = buses.filter(b => b.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Staff & Crew</h1>
          <p className="text-slate-500 mt-1">
            {getDrivers().length} drivers &middot; {getConductors().length} conductors &middot; {users.filter(u => u.role === 'manager').length} managers
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all">
            <Link2 className="w-4 h-4" /> Assign Crew
          </button>
          <button onClick={() => { setStaffForm({ name: '', phone: '', role: 'driver', nic: '', licenseNo: '' }); setShowAddStaff(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Today's Assignments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Today's Crew Assignments</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {activeBuses.map(bus => {
            const assignment = getAssignmentForBus(bus.id, today);
            const driver = assignment ? getUserById(assignment.driverId) : null;
            const conductor = assignment ? getUserById(assignment.conductorId) : null;
            const route = SRI_LANKAN_ROUTES.find(r => r.id === bus.routeId);

            return (
              <div key={bus.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Bus className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900">{bus.regNumber}</p>
                  <p className="text-xs text-slate-400">Route {route?.routeNo}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {driver ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs font-medium text-slate-700">{driver.name}</p>
                        <p className="text-[10px] text-blue-500">Driver</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No driver</span>
                  )}
                  {conductor ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                        {conductor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs font-medium text-slate-700">{conductor.name}</p>
                        <p className="text-[10px] text-emerald-500">Conductor</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No conductor</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search staff by name or phone..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none">
          <option value="all">All Roles</option>
          <option value="manager">Managers</option>
          <option value="driver">Drivers</option>
          <option value="conductor">Conductors</option>
        </select>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStaff.map(user => {
          const rc = roleColors[user.role] || { bg: 'bg-slate-100', text: 'text-slate-700' };
          return (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${rc.bg} flex items-center justify-center text-sm font-bold ${rc.text}`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{user.name}</h3>
                    {!user.isActive && <UserX className="w-4 h-4 text-red-400" />}
                  </div>
                  <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${rc.bg} ${rc.text} uppercase mt-1`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
                {user.nic && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>NIC: {user.nic}</span>
                  </div>
                )}
                {user.licenseNo && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>License: {user.licenseNo}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">Joined: {user.joinedDate}</span>
                <button
                  onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add Staff Member</h2>
              <button onClick={() => setShowAddStaff(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input required value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input required value={staffForm.phone} onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="07XXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                <div className="flex gap-3">
                  {(['driver', 'conductor', 'manager'] as UserRole[]).map(role => (
                    <button key={role} type="button" onClick={() => setStaffForm(p => ({ ...p, role }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                        staffForm.role === role ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIC Number</label>
                <input value={staffForm.nic} onChange={e => setStaffForm(p => ({ ...p, nic: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              {(staffForm.role === 'driver') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                  <input value={staffForm.licenseNo} onChange={e => setStaffForm(p => ({ ...p, licenseNo: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddStaff(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Crew Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Assign Crew to Bus</h2>
              <button onClick={() => setShowAssign(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Bus *</label>
                <select required value={assignForm.busId} onChange={e => setAssignForm(p => ({ ...p, busId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Bus</option>
                  {activeBuses.map(b => <option key={b.id} value={b.id}>{b.regNumber} - Route {SRI_LANKAN_ROUTES.find(r => r.id === b.routeId)?.routeNo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver *</label>
                <select required value={assignForm.driverId} onChange={e => setAssignForm(p => ({ ...p, driverId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Driver</option>
                  {getDrivers().map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conductor *</label>
                <select required value={assignForm.conductorId} onChange={e => setAssignForm(p => ({ ...p, conductorId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                  <option value="">Select Conductor</option>
                  {getConductors().map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssign(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  Assign Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
