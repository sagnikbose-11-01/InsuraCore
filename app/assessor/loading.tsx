// ============================================================
// app/assessor/loading.tsx
// Shimmer skeleton loader for the assessor claims queue.
// ============================================================

import React from 'react';

export default function AssessorLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title block */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded bg-[var(--color-base-800)]" />
        <div className="h-4 w-64 rounded bg-[var(--color-base-800)]" />
      </div>

      {/* Analytics stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] space-y-2 relative overflow-hidden">
            <div className="h-3.5 w-24 rounded bg-[var(--color-base-700)] animate-shimmer" style={{ animationDelay: `${i * 120}ms` }} />
            <div className="h-7 w-16 rounded bg-[var(--color-base-700)] animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Queue items skeletons */}
      <div className="space-y-4">
        <div className="h-5 w-36 rounded bg-[var(--color-base-800)]" />
        
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 rounded bg-[var(--color-base-700)] animate-shimmer" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-base-700)] animate-shimmer" />
                </div>
                <div className="h-5 w-20 rounded bg-[var(--color-base-700)] animate-shimmer" />
              </div>

              <div className="space-y-2 border-t border-[var(--color-base-700)] pt-3 text-xs">
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 rounded bg-[var(--color-base-700)] animate-shimmer" />
                  <div className="h-3.5 w-16 rounded bg-[var(--color-base-700)] animate-shimmer" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3.5 w-16 rounded bg-[var(--color-base-700)] animate-shimmer" />
                  <div className="h-3.5 w-24 rounded bg-[var(--color-base-700)] animate-shimmer" />
                </div>
              </div>

              <div className="flex gap-2 pt-1.5">
                <div className="h-8 flex-1 rounded bg-[var(--color-base-700)] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
