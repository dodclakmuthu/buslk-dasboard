import React from 'react';

import BrandMark from './BrandMark';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="light min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center px-4 py-10">
      {/* Brand header */}
      <div className="mb-6">
        <BrandMark
          stacked
          imageClassName="h-14"
          subtitle="Sri Lankan Bus Operations Platform"
        />
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
