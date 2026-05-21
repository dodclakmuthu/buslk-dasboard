import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const panelClass = 'bg-white rounded-2xl border border-slate-100 shadow-sm';

function HeaderSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className={`h-10 ${compact ? 'w-28' : 'w-32'} rounded-xl`} />
        <Skeleton className={`h-10 ${compact ? 'w-28' : 'w-36'} rounded-xl`} />
      </div>
    </div>
  );
}

export function GuardScreenSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <HeaderSkeleton compact />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={panelClass + ' p-5'}>
            <div className="flex items-start justify-between">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={panelClass + ' lg:col-span-2'}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-52" />
                  </div>
                  <div className="hidden sm:block text-right space-y-2">
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={panelClass + ' p-5'}>
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-8" />
                </div>
              ))}
            </div>
          </div>

          <div className={panelClass + ' p-5'}>
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-slate-100 p-3 space-y-2">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 rounded-full mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={panelClass + ' p-5'}>
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaffPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}

      <div className={panelClass}>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-100 p-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-40 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={panelClass + ' p-5'}>
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TripsPageSkeleton({
  showHeader = true,
  showBusSelector = true,
}: {
  showHeader?: boolean;
  showBusSelector?: boolean;
}) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}

      {showBusSelector && (
        <div className={panelClass + ' p-5'}>
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-3 rounded-xl border-2 border-slate-100 bg-white text-center space-y-2">
                <Skeleton className="h-6 w-6 rounded mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-3 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-2">
          <Skeleton className="h-3 w-20 bg-emerald-100/80" />
          <Skeleton className="h-7 w-24 bg-emerald-100/80" />
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100 space-y-2">
          <Skeleton className="h-3 w-20 bg-red-100/80" />
          <Skeleton className="h-7 w-24 bg-red-100/80" />
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-2">
          <Skeleton className="h-3 w-16 bg-amber-100/80" />
          <Skeleton className="h-7 w-24 bg-amber-100/80" />
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
          <Skeleton className="h-3 w-16 bg-blue-100/80" />
          <Skeleton className="h-7 w-16 bg-blue-100/80" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-36 rounded-xl bg-emerald-100/80" />
        <Skeleton className="h-10 w-32 rounded-xl bg-red-100/80" />
        <Skeleton className="h-10 w-32 rounded-xl bg-blue-100/80" />
      </div>

      <div className={panelClass}>
        <div className="p-5 border-b border-slate-100">
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, statIndex) => (
                  <div key={statIndex} className="space-y-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClass}>
        <div className="p-5 border-b border-slate-100">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton({
  cards = 6,
  showHeader = true,
  showFilters = true,
}: {
  cards?: number;
  showHeader?: boolean;
  showFilters?: boolean;
}) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton />}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className={panelClass + ' p-5 space-y-4'}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton({ rows = 6, showHeader = true }: { rows?: number; showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton />}
      <div className={panelClass}>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RouteMasterPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={panelClass + ' overflow-hidden'}>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-4 w-5 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-28 rounded-xl" />
        ))}
      </div>
      <div className={panelClass + ' p-6 space-y-5'}>
        <Skeleton className="h-6 w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl p-3 bg-slate-50 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 space-y-2">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
              <div className="w-24 space-y-2">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-40 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function NotificationsPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={panelClass + ' p-4'}>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettlementPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}
      <div className="rounded-2xl bg-slate-900 p-6 space-y-4">
        <Skeleton className="h-6 w-56 bg-white/20" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={panelClass + ' p-4'}>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {showHeader && <HeaderSkeleton compact />}
      <div className={panelClass + ' p-5'}>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={panelClass + ' lg:col-span-2 p-5 space-y-3'}>
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <div className={panelClass + ' p-5 space-y-3'}>
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormFieldsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
