import React from 'react';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PHONE_COUNTRIES,
  SupportedPhoneCountryCode,
  getPhoneCountryByCode,
  sanitizePhoneInput,
} from '@/lib/phone';
import { cn } from '@/lib/utils';

interface PhoneInputFieldProps {
  countryValue: SupportedPhoneCountryCode;
  onCountryChange: (code: SupportedPhoneCountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  hasError?: boolean;
  disabled?: boolean;
}

export default function PhoneInputField({
  countryValue,
  onCountryChange,
  value,
  onChange,
  inputRef,
  hasError = false,
  disabled = false,
}: PhoneInputFieldProps) {
  const country = getPhoneCountryByCode(countryValue);

  return (
    <div
      className={cn(
        'flex h-11 w-full overflow-hidden rounded-md border bg-white transition-shadow',
        hasError
          ? 'border-destructive ring-1 ring-destructive'
          : 'border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      {/* Country selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Select country code"
            className="flex h-full shrink-0 items-center gap-1.5 border-r border-slate-200 bg-slate-50 pl-3 pr-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none"
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {country.flag}
            </span>
            <span className="font-medium tabular-nums tracking-tight">
              {country.dialCode}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          {PHONE_COUNTRIES.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onSelect={() => onCountryChange(c.code as SupportedPhoneCountryCode)}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2',
                countryValue === c.code && 'bg-accent',
              )}
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {c.flag}
              </span>
              <span className="flex-1 text-sm">{c.label}</span>
              <span className="text-xs text-slate-500">{c.dialCode}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Number input */}
      <input
        ref={inputRef}
        type="tel"
        autoComplete="tel"
        placeholder={country.placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
        maxLength={10}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
      />
    </div>
  );
}
