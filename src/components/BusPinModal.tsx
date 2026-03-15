import React, { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ApiBus } from '@/lib/busApi';

type Mode = 'set' | 'reset';

type Props = {
  bus: ApiBus;
  mode: Mode;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (pin: string) => void;
};

const inputCls =
  'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

export default function BusPinModal({ bus, mode, saving, error, onClose, onSubmit }: Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [touched, setTouched] = useState({ pin: false, confirmPin: false });

  const title = mode === 'set' ? 'Set Bus PIN' : 'Reset Bus PIN';
  const subtitle = useMemo(() => {
    if (mode === 'set') return 'Set a 4-digit PIN for the bus-side app.';
    return 'Reset the current PIN by setting a new 4-digit PIN.';
  }, [mode]);

  const pinError = useMemo(() => {
    if (!touched.pin) return null;
    if (!/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits.';
    return null;
  }, [pin, touched.pin]);

  const confirmError = useMemo(() => {
    if (!touched.confirmPin) return null;
    if (confirmPin !== pin) return 'PINs do not match.';
    return null;
  }, [confirmPin, pin, touched.confirmPin]);

  const canSubmit = /^\d{4}$/.test(pin) && confirmPin === pin && !saving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ pin: true, confirmPin: true });
    if (!/^\d{4}$/.test(pin)) return;
    if (confirmPin !== pin) return;
    onSubmit(pin);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {bus.registrationNumber} &middot; {subtitle}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" disabled={saving}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelCls}>PIN *</label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setTouched((t) => ({ ...t, pin: true }))}
              placeholder="4 digits"
              className={inputCls}
            />
            {pinError && <p className="text-xs text-red-600 mt-1">{pinError}</p>}
          </div>

          <div>
            <label className={labelCls}>Confirm PIN *</label>
            <input
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setTouched((t) => ({ ...t, confirmPin: true }))}
              placeholder="Repeat 4 digits"
              className={inputCls}
            />
            {confirmError && <p className="text-xs text-red-600 mt-1">{confirmError}</p>}
          </div>

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
              {mode === 'set' ? 'Set PIN' : 'Reset PIN'}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            For security, the PIN is not displayed after saving.
          </p>
        </form>
      </div>
    </div>
  );
}
