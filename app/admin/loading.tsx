// ============================================================
// app/admin/loading.tsx
// Shimmer skeleton loader for the admin control panel.
// ============================================================

import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title bar */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-[var(--color-base-800)]" />
          <div className="h-4 w-60 rounded bg-[var(--color-base-800)]" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-[var(--color-base-800)]" />
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 rounded bg-[var(--color-base-700)] animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
              <div className="w-8 h-8 rounded-lg bg-[var(--color-base-700)] animate-shimmer" />
            </div>
            <div className="h-7 w-28 rounded bg-[var(--color-base-700)] animate-shimmer" />
            <div className="h-3 w-36 rounded bg-[var(--color-base-700)] animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Filter panel & list grid */}
      <div className="space-y-4">
        <div className="flex gap-3 bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)] items-center">
          <div className="h-9 w-64 rounded-lg bg-[var(--color-base-800)] animate-shimmer" />
          <div className="h-9 w-32 rounded-lg bg-[var(--color-base-800)] animate-shimmer" />
          <div className="h-9 w-24 rounded-lg bg-[var(--color-base-800)] animate-shimmer ml-auto" />
        </div>

        <div className="border border-[var(--color-base-800)] rounded-xl bg-[var(--color-base-900)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-base-800)] flex gap-4">
            <div className="h-4 w-1/3 rounded bg-[var(--color-base-800)]" />
            <div className="h-4 w-1/4 rounded bg-[var(--color-base-800)]" />
            <div className="h-4 w-1/6 rounded bg-[var(--color-base-800)]" />
            <div className="h-4 w-1/6 rounded bg-[var(--color-base-800)]" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-[var(--color-base-800)] flex gap-4 items-center">
              <div className="h-8 w-8 rounded-full bg-[var(--color-base-800)] animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-[var(--color-base-800)] animate-shimmer" />
                <div className="h-3 w-1/4 rounded bg-[var(--color-base-800)] animate-shimmer" />
              </div>
              <div className="h-4 w-28 rounded bg-[var(--color-base-800)] animate-shimmer" />
              <div className="h-5 w-16 rounded-full bg-[var(--color-base-800)] animate-shimmer" />
              <div className="h-4 w-20 rounded bg-[var(--color-base-800)] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
