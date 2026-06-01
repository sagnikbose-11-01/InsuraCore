// ============================================================
// app/dashboard/loading.tsx
// Shimmer skeleton loader for the customer dashboard.
// ============================================================

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-[var(--color-base-800)]" />
        <div className="h-4 w-72 rounded bg-[var(--color-base-800)]" />
      </div>

      {/* 4 Stat Cards Skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-[var(--color-base-750,var(--color-base-700))] animate-shimmer" style={{ animationDelay: `${i * 150}ms` }} />
              <div className="w-8 h-8 rounded-lg bg-[var(--color-base-750,var(--color-base-700))] animate-shimmer" />
            </div>
            <div className="h-7 w-32 rounded bg-[var(--color-base-750,var(--color-base-700))] animate-shimmer" />
            <div className="h-3.5 w-40 rounded bg-[var(--color-base-750,var(--color-base-700))] animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Main Grid: Active Policies & Recent Claims */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Pane: Recent Claims Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 rounded bg-[var(--color-base-800)]" />
            <div className="h-4 w-20 rounded bg-[var(--color-base-800)]" />
          </div>
          
          <div className="border border-[var(--color-base-800)] rounded-xl bg-[var(--color-base-900)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-base-800)] flex gap-4">
              <div className="h-4 w-1/4 rounded bg-[var(--color-base-800)]" />
              <div className="h-4 w-1/4 rounded bg-[var(--color-base-800)]" />
              <div className="h-4 w-1/4 rounded bg-[var(--color-base-800)]" />
              <div className="h-4 w-1/4 rounded bg-[var(--color-base-800)]" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border-b border-[var(--color-base-800)] flex gap-4 items-center">
                <div className="h-10 w-10 rounded-full bg-[var(--color-base-800)] animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-[var(--color-base-800)] animate-shimmer" />
                  <div className="h-3 w-1/3 rounded bg-[var(--color-base-800)] animate-shimmer" />
                </div>
                <div className="h-5 w-16 rounded bg-[var(--color-base-800)] animate-shimmer" />
                <div className="h-4 w-24 rounded bg-[var(--color-base-800)] animate-shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Active Policies Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 rounded bg-[var(--color-base-800)]" />
            <div className="h-4 w-20 rounded bg-[var(--color-base-800)]" />
          </div>

          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-base-700)] animate-shimmer" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 rounded bg-[var(--color-base-700)] animate-shimmer" />
                      <div className="h-3 w-16 rounded bg-[var(--color-base-700)] animate-shimmer" />
                    </div>
                  </div>
                  <div className="h-5 w-14 rounded-full bg-[var(--color-base-700)] animate-shimmer" />
                </div>
                <div className="space-y-2 border-t border-[var(--color-base-700)] pt-3">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-12 rounded bg-[var(--color-base-700)] animate-shimmer" />
                    <div className="h-3.5 w-16 rounded bg-[var(--color-base-700)] animate-shimmer" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3.5 w-16 rounded bg-[var(--color-base-700)] animate-shimmer" />
                    <div className="h-3.5 w-24 rounded bg-[var(--color-base-700)] animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
