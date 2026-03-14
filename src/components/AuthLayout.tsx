import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-10">
      {/* Brand header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-4 5v-3m-6 3h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">BusLK</span>
        <span className="text-xs text-slate-500">Sri Lankan Bus Operations Platform</span>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
