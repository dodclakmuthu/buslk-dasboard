import React, { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ApiBus, BusStatus } from '@/lib/busApi';

type Props = {
  bus: ApiBus;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (status: BusStatus) => void;
};

const inputCls =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

const ALL_STATUSES: BusStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD'];

export default function BusStatusModal({ bus, saving, error, onClose, onSubmit }: Props) {
  const [status, setStatus] = useState<BusStatus>(bus.status);

  const changed = useMemo(() => status !== bus.status, [status, bus.status]);
  const canSubmit = changed && !saving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change Status</h2>
            <p className="text-sm text-slate-500 mt-1">
              {bus.registrationNumber} &middot; Select a new status
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" disabled={saving}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BusStatus)}
              className={inputCls}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {status === 'SOLD' && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              Marking a bus as SOLD keeps it for history but it should not be used for future operations.
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

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
              disabled={!canSubmit}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
