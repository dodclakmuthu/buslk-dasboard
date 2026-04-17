import React from 'react';

import { cn } from '@/lib/utils';

interface BrandMarkProps {
  textClassName?: string;
  imageClassName?: string;
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
  stacked?: boolean;
}

export default function BrandMark({
  textClassName,
  imageClassName,
  className,
  subtitle,
  subtitleClassName,
  stacked = false,
}: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', stacked && 'flex-col gap-2', className)}>
      <img
        src="/logo.png"
        alt="BusEka"
        className={cn('h-10 w-auto object-contain', imageClassName)}
      />
      <div className={cn(stacked && 'text-center')}>
        <span className={cn('text-xl font-bold tracking-tight text-slate-900', textClassName)}>
          Bus<span className="text-orange-500">E</span>ka
        </span>
        {subtitle ? (
          <p className={cn('text-xs text-slate-500', subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}