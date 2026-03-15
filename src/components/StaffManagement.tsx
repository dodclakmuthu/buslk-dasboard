import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, X, Search, UserX, Phone, CreditCard, Users, Bus, Link2, Loader2, AlertCircle, Edit2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ApiBus } from '@/lib/busApi';
import { listBuses } from '@/lib/busApi';
import type { ApiAssignment } from '@/lib/assignmentsApi';
import { createAssignment, listAssignments, updateAssignment } from '@/lib/assignmentsApi';
import type { ApiStaff, EmploymentType, StaffRoleType } from '@/lib/staffApi';
import { createStaff, listStaff, updateStaff } from '@/lib/staffApi';

function toIsoDateLocal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const inputCls =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

const ROLE_LABEL: Record<StaffRoleType, string> = {
  DRIVER: 'Driver',
  CONDUCTOR: 'Conductor',
  DRIVER_CONDUCTOR: 'Driver + Conductor',
};

const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  PERMANENT: 'Permanent',
  TEMPORARY: 'Temporary',
  DAILY_HIRE: 'Daily hire',
  CONTRACT: 'Contract',
};

const ROLE_COLORS: Record<StaffRoleType, { bg: string; text: string }> = {
  DRIVER: { bg: 'bg-blue-100', text: 'text-blue-700' },
  CONDUCTOR: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  DRIVER_CONDUCTOR: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

type StaffModalState =
  | { open: false }
  | {
      open: true;
      mode: 'create' | 'edit';
      staff?: ApiStaff;
    };

type AssignmentModalState =
  | { open: false }
  | {
      open: true;
      bus: ApiBus;
      date: string;
      existing?: ApiAssignment;
    };

const StaffManagement: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);

  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingBuses, setLoadingBuses] = useState(true);

  const [staffError, setStaffError] = useState<string | null>(null);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [busesError, setBusesError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => toIsoDateLocal(new Date()));

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | StaffRoleType>('all');
  const [employmentFilter, setEmploymentFilter] = useState<'all' | EmploymentType>('all');

  const [staffModal, setStaffModal] = useState<StaffModalState>({ open: false });
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffModalError, setStaffModalError] = useState<string | null>(null);

  const [assignmentModal, setAssignmentModal] = useState<AssignmentModalState>({ open: false });
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentModalError, setAssignmentModalError] = useState<string | null>(null);

  const staffById = useMemo(() => {
    const m = new Map<string, ApiStaff>();
    for (const s of staff) m.set(s.id, s);
    return m;
  }, [staff]);

  const assignmentsByBusId = useMemo(() => {
    const m = new Map<string, ApiAssignment>();
    for (const a of assignments) m.set(a.busId, a);
    return m;
  }, [assignments]);

  const activeStaff = useMemo(() => staff.filter(s => s.isActive), [staff]);
  const driverOptions = useMemo(
    () => activeStaff.filter(s => s.roleType === 'DRIVER' || s.roleType === 'DRIVER_CONDUCTOR'),
    [activeStaff],
  );
  const conductorOptions = useMemo(
    () => activeStaff.filter(s => s.roleType === 'CONDUCTOR' || s.roleType === 'DRIVER_CONDUCTOR'),
    [activeStaff],
  );

  const loadStaff = useCallback(async () => {
    if (!token) return;
    setLoadingStaff(true);
    setStaffError(null);
    try {
      const res = await listStaff(token);
      setStaff(res.staff);
    } catch (err: any) {
      setStaffError(err?.message ?? 'Failed to load staff');
    } finally {
      setLoadingStaff(false);
    }
  }, [token]);

  const loadBuses = useCallback(async () => {
    if (!token) return;
    setLoadingBuses(true);
    setBusesError(null);
    try {
      const res = await listBuses(token);
      setBuses(res.buses);
    } catch (err: any) {
      setBusesError(err?.message ?? 'Failed to load buses');
    } finally {
      setLoadingBuses(false);
    }
  }, [token]);

  const loadAssignments = useCallback(async () => {
    if (!token) return;
    setLoadingAssignments(true);
    setAssignmentsError(null);
    try {
      const res = await listAssignments(token, { date: selectedDate });
      setAssignments(res.assignments);
    } catch (err: any) {
      setAssignmentsError(err?.message ?? 'Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    if (!token) return;
    void loadStaff();
    void loadBuses();
  }, [token, loadStaff, loadBuses]);

  useEffect(() => {
    if (!token) return;
    void loadAssignments();
  }, [token, loadAssignments]);

  const counts = useMemo(() => {
    const total = staff.length;
    const active = staff.filter(s => s.isActive).length;
    const drivers = staff.filter(s => s.isActive && (s.roleType === 'DRIVER' || s.roleType === 'DRIVER_CONDUCTOR')).length;
    const conductors = staff.filter(s => s.isActive && (s.roleType === 'CONDUCTOR' || s.roleType === 'DRIVER_CONDUCTOR')).length;
    const both = staff.filter(s => s.isActive && s.roleType === 'DRIVER_CONDUCTOR').length;
    return { total, active, drivers, conductors, both };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff
      .filter(s => {
        const matchSearch =
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.mobileNumber ?? '').includes(searchTerm) ||
          (s.nicNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === 'all' || s.roleType === roleFilter;
        const matchEmp = employmentFilter === 'all' || s.employmentType === employmentFilter;
        return matchSearch && matchRole && matchEmp;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [staff, searchTerm, roleFilter, employmentFilter]);

  const openCreateStaff = () => {
    setStaffModalError(null);
    setStaffModal({ open: true, mode: 'create' });
  };

  const openEditStaff = (s: ApiStaff) => {
    setStaffModalError(null);
    setStaffModal({ open: true, mode: 'edit', staff: s });
  };

  const toggleStaffActive = async (s: ApiStaff) => {
    if (!token) return;
    try {
      const res = await updateStaff(token, s.id, { isActive: !s.isActive });
      setStaff(prev => prev.map(x => (x.id === res.staff.id ? res.staff : x)));
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message ?? 'Failed to update staff', variant: 'destructive' });
    }
  };

  const openAssignModal = (bus: ApiBus) => {
    setAssignmentModalError(null);
    const existing = assignmentsByBusId.get(bus.id);
    setAssignmentModal({ open: true, bus, date: selectedDate, existing });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Staff & Crew</h1>
          <p className="text-slate-500 mt-1">
            {counts.active} active staff &middot; {counts.drivers} drivers &middot; {counts.conductors} conductors{counts.both ? ` (incl. ${counts.both} both)` : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const firstBus = buses.find(b => b.status !== 'SOLD');
              if (firstBus) openAssignModal(firstBus);
              else toast({ title: 'No buses', description: 'Add a bus first before assigning crew.', variant: 'destructive' });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
          >
            <Link2 className="w-4 h-4" /> Assign Crew
          </button>
          <button
            onClick={openCreateStaff}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Daily assignments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Daily Crew Assignments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick a date and assign crew per bus. Leaving driver/conductor blank uses the bus default crew (if set).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="sr-only" htmlFor="assignment-date">Assignment date</label>
              <input
                id="assignment-date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              onClick={loadAssignments}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Loading/errors */}
        {(loadingBuses || loadingAssignments || loadingStaff) && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        )}

        {!loadingBuses && busesError && (
          <div className="m-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{busesError}</span>
            <button onClick={loadBuses} className="ml-auto underline text-xs">Retry</button>
          </div>
        )}

        {!loadingAssignments && assignmentsError && (
          <div className="m-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{assignmentsError}</span>
            <button onClick={loadAssignments} className="ml-auto underline text-xs">Retry</button>
          </div>
        )}

        {!loadingBuses && !loadingAssignments && !busesError && !assignmentsError && (
          <div className="divide-y divide-slate-50">
            {buses.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No buses yet.</div>
            ) : (
              buses.map(bus => {
                const existing = assignmentsByBusId.get(bus.id);
                const defaultDriver = bus.defaultDriverStaffId ? staffById.get(bus.defaultDriverStaffId) : undefined;
                const defaultConductor = bus.defaultConductorStaffId ? staffById.get(bus.defaultConductorStaffId) : undefined;
                const isSold = bus.status === 'SOLD';

                return (
                  <div key={bus.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Bus className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{bus.registrationNumber}</p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            isSold ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {bus.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Default: {defaultDriver?.fullName ?? '—'} (Driver) &middot; {defaultConductor?.fullName ?? '—'} (Conductor)
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700">
                        <span className="text-xs text-slate-400">Assigned:</span>{' '}
                        {existing ? (
                          <>
                            <span className="font-medium">{existing.driver.fullName}</span>
                            <span className="text-slate-400"> / </span>
                            <span className="font-medium">{existing.conductor.fullName}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Not assigned</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <button
                        disabled={isSold}
                        onClick={() => openAssignModal(bus)}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all disabled:opacity-60 disabled:hover:bg-white"
                        title={isSold ? 'SOLD buses cannot be assigned' : 'Assign crew'}
                      >
                        {existing ? 'Update' : 'Assign'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, phone, or NIC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="DRIVER">Drivers</option>
          <option value="CONDUCTOR">Conductors</option>
          <option value="DRIVER_CONDUCTOR">Both</option>
        </select>

        <select
          value={employmentFilter}
          onChange={e => setEmploymentFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        >
          <option value="all">All Employment</option>
          <option value="PERMANENT">Permanent</option>
          <option value="TEMPORARY">Temporary</option>
          <option value="DAILY_HIRE">Daily hire</option>
          <option value="CONTRACT">Contract</option>
        </select>
      </div>

      {/* Staff loading/error */}
      {loadingStaff && (
        <div className="flex items-center justify-center py-14 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading staff…
        </div>
      )}
      {!loadingStaff && staffError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{staffError}</span>
          <button onClick={loadStaff} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Staff grid */}
      {!loadingStaff && !staffError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStaff.map(s => {
            const rc = ROLE_COLORS[s.roleType];
            const initials = s.fullName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map(n => n[0])
              .join('')
              .toUpperCase();

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${rc.bg} flex items-center justify-center text-sm font-bold ${rc.text}`}
                    title={ROLE_LABEL[s.roleType]}
                  >
                    {initials || 'ST'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 truncate">{s.fullName}</h3>
                      {!s.isActive && <UserX className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${rc.bg} ${rc.text} uppercase`}>
                        {s.roleType === 'DRIVER_CONDUCTOR' ? 'both' : s.roleType.toLowerCase()}
                      </span>
                      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {EMPLOYMENT_LABEL[s.employmentType]}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditStaff(s)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit staff"
                    aria-label="Edit staff"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{s.mobileNumber ?? '—'}</span>
                  </div>
                  {s.nicNumber && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>NIC: {s.nicNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{s.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button
                    onClick={() => toggleStaffActive(s)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      s.isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Modal */}
      {staffModal.open && (
        <StaffModal
          mode={staffModal.mode}
          staff={staffModal.staff}
          saving={staffSaving}
          error={staffModalError}
          onClose={() => setStaffModal({ open: false })}
          onSubmit={async (input) => {
            if (!token) return;
            setStaffSaving(true);
            setStaffModalError(null);
            try {
              if (staffModal.mode === 'create') {
                const res = await createStaff(token, input);
                setStaff(prev => [res.staff, ...prev]);
                toast({ title: 'Staff added', description: `${res.staff.fullName} created.` });
              } else {
                const res = await updateStaff(token, staffModal.staff!.id, input);
                setStaff(prev => prev.map(s => (s.id === res.staff.id ? res.staff : s)));
                toast({ title: 'Staff updated', description: `${res.staff.fullName} saved.` });
              }
              setStaffModal({ open: false });
            } catch (err: any) {
              setStaffModalError(err?.message ?? 'Failed to save staff');
            } finally {
              setStaffSaving(false);
            }
          }}
        />
      )}

      {/* Assignment Modal */}
      {assignmentModal.open && (
        <AssignmentModal
          bus={assignmentModal.bus}
          date={assignmentModal.date}
          existing={assignmentModal.existing}
          staffById={staffById}
          driverOptions={driverOptions}
          conductorOptions={conductorOptions}
          saving={assignmentSaving}
          error={assignmentModalError}
          onClose={() => setAssignmentModal({ open: false })}
          onSubmit={async (payload) => {
            if (!token) return;
            setAssignmentSaving(true);
            setAssignmentModalError(null);
            try {
              if (assignmentModal.existing) {
                const res = await updateAssignment(token, assignmentModal.existing.id, payload.update);
                setAssignments(prev => prev.map(a => (a.id === res.assignment.id ? res.assignment : a)));
                toast({ title: 'Assignment updated', description: `${res.assignment.bus.registrationNumber} updated.` });
              } else {
                const res = await createAssignment(token, payload.create);
                setAssignments(prev => [res.assignment, ...prev]);
                toast({ title: 'Crew assigned', description: `${res.assignment.bus.registrationNumber} assigned.` });
              }
              setAssignmentModal({ open: false });
            } catch (err: any) {
              setAssignmentModalError(err?.message ?? 'Failed to save assignment');
            } finally {
              setAssignmentSaving(false);
            }
          }}
        />
      )}
    </div>
  );
};

function StaffModal(props: {
  mode: 'create' | 'edit';
  staff?: ApiStaff;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: {
    fullName: string;
    mobileNumber?: string | null;
    nicNumber?: string | null;
    roleType: StaffRoleType;
    employmentType: EmploymentType;
    isActive: boolean;
  }) => void;
}) {
  const initial = props.staff;
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [mobileNumber, setMobileNumber] = useState(initial?.mobileNumber ?? '');
  const [nicNumber, setNicNumber] = useState(initial?.nicNumber ?? '');
  const [roleType, setRoleType] = useState<StaffRoleType>(initial?.roleType ?? 'DRIVER');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initial?.employmentType ?? 'PERMANENT');
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: {
      fullName: string;
      mobileNumber?: string | null;
      nicNumber?: string | null;
      roleType: StaffRoleType;
      employmentType: EmploymentType;
      isActive: boolean;
    } = {
      fullName: fullName.trim(),
      roleType,
      employmentType,
      isActive,
    };

    const mobileTrimmed = mobileNumber.trim();
    if (mobileTrimmed) payload.mobileNumber = mobileTrimmed;
    else if (props.mode === 'edit' && initial?.mobileNumber) payload.mobileNumber = null;

    const nicTrimmed = nicNumber.trim();
    if (nicTrimmed) payload.nicNumber = nicTrimmed;
    else if (props.mode === 'edit' && initial?.nicNumber) payload.nicNumber = null;

    props.onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {props.mode === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}
          </h2>
          <button onClick={props.onClose} className="p-2 hover:bg-slate-100 rounded-lg" disabled={props.saving}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} maxLength={120} />
          </div>

          <div>
            <label className={labelCls}>Phone Number</label>
            <input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className={inputCls} maxLength={30} placeholder="07XXXXXXXX" />
          </div>

          <div>
            <label className={labelCls}>NIC Number</label>
            <input value={nicNumber} onChange={e => setNicNumber(e.target.value)} className={inputCls} maxLength={30} />
          </div>

          <div>
            <label className={labelCls}>Role Type *</label>
            <div className="flex gap-3">
              {(
                [
                  { id: 'DRIVER' as const, label: 'Driver' },
                  { id: 'CONDUCTOR' as const, label: 'Conductor' },
                  { id: 'DRIVER_CONDUCTOR' as const, label: 'Both' },
                ]
              ).map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleType(r.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    roleType === r.id
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Employment Type</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value as EmploymentType)} className={inputCls}>
              <option value="PERMANENT">Permanent</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="DAILY_HIRE">Daily hire</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Active
          </label>

          {props.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {props.error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              disabled={props.saving}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={props.saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {props.saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {props.mode === 'create' ? 'Add Staff' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignmentModal(props: {
  bus: ApiBus;
  date: string;
  existing?: ApiAssignment;
  staffById: Map<string, ApiStaff>;
  driverOptions: ApiStaff[];
  conductorOptions: ApiStaff[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: { create: any; update: any }) => void;
}) {
  const defaultDriver = props.bus.defaultDriverStaffId ? props.staffById.get(props.bus.defaultDriverStaffId) : undefined;
  const defaultConductor = props.bus.defaultConductorStaffId ? props.staffById.get(props.bus.defaultConductorStaffId) : undefined;

  const [driverStaffId, setDriverStaffId] = useState<string>(props.existing?.driverStaffId ?? '');
  const [conductorStaffId, setConductorStaffId] = useState<string>(props.existing?.conductorStaffId ?? '');
  const [notes, setNotes] = useState<string>(props.existing?.notes ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  const driverList = useMemo(() => {
    const list = [...props.driverOptions];
    if (props.existing?.driverStaffId) {
      const current = props.staffById.get(props.existing.driverStaffId);
      if (current && !list.some(s => s.id === current.id)) list.unshift(current);
    }
    return list;
  }, [props.driverOptions, props.existing?.driverStaffId, props.staffById]);

  const conductorList = useMemo(() => {
    const list = [...props.conductorOptions];
    if (props.existing?.conductorStaffId) {
      const current = props.staffById.get(props.existing.conductorStaffId);
      if (current && !list.some(s => s.id === current.id)) list.unshift(current);
    }
    return list;
  }, [props.conductorOptions, props.existing?.conductorStaffId, props.staffById]);

  const validate = (): boolean => {
    setLocalError(null);

    // For create: allow empty (use default). For update: we always compute explicit IDs.
    const effectiveDriver = driverStaffId || props.bus.defaultDriverStaffId || '';
    const effectiveConductor = conductorStaffId || props.bus.defaultConductorStaffId || '';

    if (!effectiveDriver || !effectiveConductor) {
      setLocalError('Driver and conductor must be provided (or set as default crew on the bus).');
      return false;
    }

    if (effectiveDriver === effectiveConductor) {
      const staff = props.staffById.get(effectiveDriver);
      if (!staff || staff.roleType !== 'DRIVER_CONDUCTOR') {
        setLocalError('Same staff member can be both roles only when role type is BOTH.');
        return false;
      }
    }

    return true;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const notesTrimmed = notes.trim();

    if (props.existing) {
      const resolvedDriver = driverStaffId || props.bus.defaultDriverStaffId;
      const resolvedConductor = conductorStaffId || props.bus.defaultConductorStaffId;
      props.onSubmit({
        create: null,
        update: {
          driverStaffId: resolvedDriver,
          conductorStaffId: resolvedConductor,
          notes: notesTrimmed ? notesTrimmed : null,
        },
      });
    } else {
      props.onSubmit({
        create: {
          busId: props.bus.id,
          assignmentDate: props.date,
          ...(driverStaffId ? { driverStaffId } : {}),
          ...(conductorStaffId ? { conductorStaffId } : {}),
          ...(notesTrimmed ? { notes: notesTrimmed } : {}),
        },
        update: null,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {props.existing ? 'Update Crew Assignment' : 'Assign Crew'}
          </h2>
          <button onClick={props.onClose} className="p-2 hover:bg-slate-100 rounded-lg" disabled={props.saving}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{props.bus.registrationNumber}</span>
              <span className="text-xs text-slate-500">{props.date}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Default crew: {defaultDriver?.fullName ?? '—'} (Driver) &middot; {defaultConductor?.fullName ?? '—'} (Conductor)
            </p>
          </div>

          <div>
            <label className={labelCls}>Driver {defaultDriver ? '(optional)' : '*'}</label>
            <select
              value={driverStaffId}
              onChange={e => setDriverStaffId(e.target.value)}
              className={inputCls}
              required={!defaultDriver && !props.existing}
            >
              {defaultDriver ? (
                <option value="">Use default ({defaultDriver.fullName})</option>
              ) : (
                <option value="">Select driver</option>
              )}
              {driverList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName}{s.isActive ? '' : ' (inactive)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Conductor {defaultConductor ? '(optional)' : '*'}</label>
            <select
              value={conductorStaffId}
              onChange={e => setConductorStaffId(e.target.value)}
              className={inputCls}
              required={!defaultConductor && !props.existing}
            >
              {defaultConductor ? (
                <option value="">Use default ({defaultConductor.fullName})</option>
              ) : (
                <option value="">Select conductor</option>
              )}
              {conductorList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName}{s.isActive ? '' : ' (inactive)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className={inputCls}
              rows={3}
              maxLength={300}
              placeholder="Optional"
            />
          </div>

          {(localError || props.error) && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {localError || props.error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              disabled={props.saving}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={props.saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {props.saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {props.existing ? 'Save Assignment' : 'Assign Crew'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StaffManagement;
