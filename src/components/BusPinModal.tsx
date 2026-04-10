import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ApiBus } from '@/lib/busApi';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type Mode = 'set' | 'reset';
type VerifyMode = 'verify';
type AllModes = Mode | VerifyMode;

type Props = {
  bus: ApiBus;
  mode: AllModes;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (pin: string) => void;
};

const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

export default function BusPinModal({ bus, mode, saving, error, onClose, onSubmit }: Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [touched, setTouched] = useState({ pin: false, confirmPin: false });
  const isVerifyMode = mode === 'verify';
  const pinInputRef = useRef<React.ElementRef<typeof InputOTP> | null>(null);

  const title = mode === 'set' ? 'Set Bus PIN' : mode === 'reset' ? 'Reset Bus PIN' : 'Confirm Bus PIN';
  const subtitle = useMemo(() => {
    if (mode === 'set') return 'Set a 4-digit PIN for the bus-side app.';
    if (mode === 'verify') return 'Enter the current 4-digit bus PIN to confirm these bus changes.';
    return 'Reset the current PIN by setting a new 4-digit PIN.';
  }, [mode]);

  const pinError = useMemo(() => {
    if (!touched.pin) return null;
    if (!/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits.';
    return null;
  }, [pin, touched.pin]);

  const confirmError = useMemo(() => {
    if (isVerifyMode) return null;
    if (!touched.confirmPin) return null;
    if (confirmPin !== pin) return 'PINs do not match.';
    return null;
  }, [confirmPin, isVerifyMode, pin, touched.confirmPin]);

  const canSubmit = /^\d{4}$/.test(pin) && (isVerifyMode || confirmPin === pin) && !saving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ pin: true, confirmPin: !isVerifyMode });
    if (!/^\d{4}$/.test(pin)) return;
    if (!isVerifyMode && confirmPin !== pin) return;
    onSubmit(pin);
  };

  useEffect(() => {
    if (!error || !isVerifyMode) return;

    const normalized = error.toLowerCase();
    if (!normalized.includes('invalid bus pin')) return;

    setPin('');
    setTouched((prev) => ({ ...prev, pin: false }));

    requestAnimationFrame(() => {
      pinInputRef.current?.focus();
    });
  }, [error, isVerifyMode]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl mb-10">
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
            <InputOTP
              ref={pinInputRef}
              maxLength={4}
              autoFocus
              value={pin}
              onChange={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setTouched((t) => ({ ...t, pin: true }))}
              pattern="^[0-9]*$"
              inputMode="numeric"
              autoComplete={isVerifyMode ? 'current-password' : 'new-password'}
              containerClassName="justify-center"
              className="w-full"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                <InputOTPSlot index={1} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                <InputOTPSlot index={2} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                <InputOTPSlot index={3} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
              </InputOTPGroup>
            </InputOTP>
            {pinError && <p className="text-xs text-red-600 mt-1">{pinError}</p>}
          </div>

          {!isVerifyMode && (
            <div>
              <label className={labelCls}>Confirm PIN *</label>
              <InputOTP
                maxLength={4}
                value={confirmPin}
                onChange={(value) => setConfirmPin(value.replace(/\D/g, '').slice(0, 4))}
                onBlur={() => setTouched((t) => ({ ...t, confirmPin: true }))}
                pattern="^[0-9]*$"
                inputMode="numeric"
                autoComplete="new-password"
                containerClassName="justify-center"
                className="w-full"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                  <InputOTPSlot index={1} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                  <InputOTPSlot index={2} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                  <InputOTPSlot index={3} mask className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-base text-slate-900 first:rounded-xl first:border last:rounded-xl" />
                </InputOTPGroup>
              </InputOTP>
              {confirmError && <p className="text-xs text-red-600 mt-1">{confirmError}</p>}
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
              {mode === 'set' ? 'Set PIN' : mode === 'reset' ? 'Reset PIN' : 'Confirm & Update'}
            </button>
          </div>

          {!isVerifyMode && (
            <p className="text-xs text-slate-400">
              For security, the PIN is not displayed after saving.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
