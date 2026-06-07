// ============================================================
// app/assessor/reviews/page.tsx
// Comprehensive Review Center for filtering and sorting claims.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { Search, Filter, SlidersHorizontal, Download } from 'lucide-react';
import { ClaimsQueue } from '@/components/assessor/ClaimsQueue';
import { getAssessorReviewQueue } from '@/services/assessor.service';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Review Center | Assessor Workspace',
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const resolvedParams = await searchParams;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all';
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';

  const claimsPromise = getAssessorReviewQueue(session.id, { status, search });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Review Center</h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Manage, filter, and process your entire claim review queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-white transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Action Bar (Filters & Search) */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
          <input
            type="text"
            placeholder="Search by Claim ID, Policy Holder, or keywords..."
            className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-lg py-2 pl-9 pr-4 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-500)] focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
            <select className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-lg py-2 pl-9 pr-8 text-sm text-[var(--color-base-300)] appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 transition-all">
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="under_review">Under Review</option>
              <option value="fraud">Fraud Flagged</option>
            </select>
          </div>
          
          <button className="p-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)] text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-800)] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Table */}
      <ClaimsQueue claimsPromise={claimsPromise} />
    </div>
  );
}
