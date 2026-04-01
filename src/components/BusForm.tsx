import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ApiBus, BusStatus, CreateBusInput } from '@/lib/busApi';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiStaff } from '@/lib/staffApi';
import { listStaff } from '@/lib/staffApi';

type FormState = {
  registrationNumber: string;
  busName: string;
  ntcPermitNumber: string;
  seatCount: string;
  status: BusStatus;
  defaultDriverStaffId: string;
  defaultConductorStaffId: string;
  wageModel: 'PERCENTAGE' | 'FIXED';
  driverPercentage: string;
  conductorPercentage: string;
  fixedDriverWage: string;
  fixedConductorWage: string;
};

const defaultForm = (): FormState => ({
  registrationNumber: '',
  busName: '',
  ntcPermitNumber: '',
  seatCount: '',
  status: 'ACTIVE',
  defaultDriverStaffId: '',
  defaultConductorStaffId: '',
  wageModel: 'PERCENTAGE',
  driverPercentage: '',
  conductorPercentage: '',
  fixedDriverWage: '',
  fixedConductorWage: '',
});

type Props = {
  editing: ApiBus | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    input: CreateBusInput & {
      defaultDriverStaffId?: string | null;
      defaultConductorStaffId?: string | null;
    },
  ) => void;
};

const inputCls =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

const BusForm: React.FC<Props> = ({ editing, saving, error, onClose, onSubmit }) => {
  const { token } = useAuth();

  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          registrationNumber: editing.registrationNumber,
          busName: editing.busName ?? '',
          ntcPermitNumber: editing.ntcPermitNumber ?? '',
          seatCount: editing.seatCount != null ? String(editing.seatCount) : '',
          status: editing.status,
          defaultDriverStaffId: editing.defaultDriverStaffId ?? '',
          defaultConductorStaffId: editing.defaultConductorStaffId ?? '',
          wageModel: editing.wageModel ?? 'PERCENTAGE',
          driverPercentage: editing.driverPercentage != null ? String(editing.driverPercentage) : '',
          conductorPercentage: editing.conductorPercentage != null ? String(editing.conductorPercentage) : '',
          fixedDriverWage: editing.fixedDriverWage != null ? String(editing.fixedDriverWage) : '',
          fixedConductorWage: editing.fixedConductorWage != null ? String(editing.fixedConductorWage) : '',
        }
      : defaultForm(),
  );

  useEffect(() => {
    if (!editing || !token) return;
    setStaffLoading(true);
    setStaffError(null);
    void (async () => {
      try {
        const res = await listStaff(token);
        setStaff(res.staff);
      } catch (err: any) {
        setStaffError(err?.message ?? 'Failed to load staff');
      } finally {
        setStaffLoading(false);
      }
    })();
  }, [editing, token]);

  const activeStaff = useMemo(() => staff.filter(s => s.isActive), [staff]);
  const driverOptions = useMemo(
    () => activeStaff.filter(s => s.roleType === 'DRIVER' || s.roleType === 'DRIVER_CONDUCTOR'),
    [activeStaff],
  );
  const conductorOptions = useMemo(
    () => activeStaff.filter(s => s.roleType === 'CONDUCTOR' || s.roleType === 'DRIVER_CONDUCTOR'),
    [activeStaff],
  );

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateBusInput & {
      defaultDriverStaffId?: string | null;
      defaultConductorStaffId?: string | null;
    } = {
      registrationNumber: form.registrationNumber.trim(),
      ...(form.busName.trim() && { busName: form.busName.trim() }),
      ...(form.ntcPermitNumber.trim() && { ntcPermitNumber: form.ntcPermitNumber.trim() }),
      ...(form.seatCount && { seatCount: parseInt(form.seatCount, 10) }),
      status: form.status,
      wageModel: form.wageModel,
      ...(form.driverPercentage !== '' && { driverPercentage: parseFloat(form.driverPercentage) }),
      ...(form.conductorPercentage !== '' && { conductorPercentage: parseFloat(form.conductorPercentage) }),
      ...(form.fixedDriverWage !== '' && { fixedDriverWage: parseFloat(form.fixedDriverWage) }),
      ...(form.fixedConductorWage !== '' && { fixedConductorWage: parseFloat(form.fixedConductorWage) }),
    };

    // Defaults are only supported on update (edit mode).
    if (editing) {
      input.defaultDriverStaffId = form.defaultDriverStaffId ? form.defaultDriverStaffId : null;
      input.defaultConductorStaffId = form.defaultConductorStaffId ? form.defaultConductorStaffId : null;
    }

    onSubmit(input);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {editing ? 'Edit Bus' : 'Add New Bus'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Reg + permit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Registration Number *</label>
              <input
                required
                value={form.registrationNumber}
                onChange={set('registrationNumber')}
                maxLength={20}
                placeholder="e.g. NB-1234"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>NTC Permit Number</label>
              <input
                value={form.ntcPermitNumber}
                onChange={set('ntcPermitNumber')}
                maxLength={40}
                placeholder="e.g. NTC/WP/138/001"
                className={inputCls}
              />
            </div>
          </div>

          {/* Bus name + seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Bus Name</label>
              <input
                value={form.busName}
                onChange={set('busName')}
                maxLength={80}
                placeholder="e.g. Colombo Express"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Seat Count</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.seatCount}
                onChange={set('seatCount')}
                placeholder="e.g. 54"
                className={inputCls}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>

          {/* Route — deferred */}
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 flex items-center gap-2">
            <span className="text-slate-400">🗺</span>
            Route assignment will be available once routes are configured in the Routes module.
          </div>

          {/* Wage Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
            <p className="text-sm font-semibold text-slate-900">Wage Settings</p>
            <div>
              <label className={labelCls}>Wage Model</label>
              <select value={form.wageModel} onChange={set('wageModel')} className={inputCls}>
                <option value="PERCENTAGE">Percentage of Daily Income</option>
                <option value="FIXED">Fixed Daily Wage</option>
              </select>
            </div>
            {form.wageModel === 'PERCENTAGE' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Driver %</label>
                  <input type="number" min={0} max={100} step={0.5}
                    value={form.driverPercentage}
                    onChange={set('driverPercentage')}
                    placeholder="e.g. 12"
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Conductor %</label>
                  <input type="number" min={0} max={100} step={0.5}
                    value={form.conductorPercentage}
                    onChange={set('conductorPercentage')}
                    placeholder="e.g. 8"
                    className={inputCls} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Driver Wage (Rs.)</label>
                  <input type="number" min={0}
                    value={form.fixedDriverWage}
                    onChange={set('fixedDriverWage')}
                    placeholder="e.g. 4500"
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Conductor Wage (Rs.)</label>
                  <input type="number" min={0}
                    value={form.fixedConductorWage}
                    onChange={set('fixedConductorWage')}
                    placeholder="e.g. 3500"
                    className={inputCls} />
                </div>
              </div>
            )}
          </div>

          {/* Default crew (optional) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Default Crew (optional)</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used as a fallback for daily assignments when you leave roles blank.
                </p>
              </div>
            </div>

            {!editing ? (
              <div className="mt-3 text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
                Save the bus first to set default crew.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {staffError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    {staffError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Default Driver</label>
                    <select
                      value={form.defaultDriverStaffId}
                      onChange={set('defaultDriverStaffId')}
                      className={inputCls}
                      disabled={staffLoading}
                    >
                      <option value="">None</option>
                      {driverOptions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Default Conductor</label>
                    <select
                      value={form.defaultConductorStaffId}
                      onChange={set('defaultConductorStaffId')}
                      className={inputCls}
                      disabled={staffLoading}
                    >
                      <option value="">None</option>
                      {conductorOptions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Update Bus' : 'Register Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusForm;
