// ============================================================
// app/assessor/history/page.tsx
// Archive of completed claim reviews (APPROVED, REJECTED, PAID).
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorHistory } from '@/services/assessor.service';
import { History, Search, ArrowRight, Eye, CheckCircle2, Ban } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Claim History | Assessor Workspace',
};

export default async function ClaimHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const resolvedParams = await searchParams;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all';
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';

  // Query database completed archive
  const completedClaims = await getAssessorHistory(session.id, { search, status });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" /> Claim History
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Browse and inspect settled, paid, or rejected claim requests.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
          {completedClaims.length} Resolved Cases
        </div>
      </div>

      {/* Filter and Search Action bar */}
      <form method="GET" className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by Claim ID, policy holder name..."
            className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl py-2 pl-9 pr-4 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-500)] focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <select
              name="status"
              defaultValue={status}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl py-2 pl-3 pr-8 text-sm text-[var(--color-base-300)] appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all">
            Filter
          </button>
        </div>
      </form>

      {/* History table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Customer</th>
                <th>Policy Type</th>
                <th>Claim Amount</th>
                <th>Payout Amount</th>
                <th>Status</th>
                <th>Resolution Date</th>
                <th className="text-right">Workspace</th>
              </tr>
            </thead>
            <tbody>
              {completedClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[var(--color-base-500)]">
                    No completed claims found matching current filters.
                  </td>
                </tr>
              ) : (
                completedClaims.map((c: any) => (
                  <tr key={c._id} className="group hover:bg-[var(--color-base-900)]/30">
                    <td className="font-mono text-xs font-semibold text-white">
                      INS-{c._id.slice(-8).toUpperCase()}
                    </td>
                    <td>
                      <div className="font-bold text-sm text-white">{c.customerId?.name}</div>
                      <span className="text-[10px] text-[var(--color-base-550)]">{c.customerId?.email}</span>
                    </td>
                    <td>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-base-300)] bg-[var(--color-base-800)] px-2 py-0.5 rounded border border-[var(--color-base-700)]">
                        {c.policyType || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-semibold text-[var(--color-base-300)]">
                      {formatCurrency(c.claimAmount)}
                    </td>
                    <td className="font-mono text-xs font-semibold text-white">
                      {c.approvedAmount > 0 ? (
                        <span className="text-emerald-400 font-bold">{formatCurrency(c.approvedAmount)}</span>
                      ) : (
                        <span className="text-[var(--color-base-500)]">—</span>
                      )}
                    </td>
                    <td>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-black text-white border",
                        c.status === 'APPROVED' ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" :
                        c.status === 'REJECTED' ? "bg-red-650/15 text-red-400 border-red-500/20" :
                        "bg-blue-600/10 text-blue-400 border-blue-500/20"
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-xs text-[var(--color-base-400)]">
                      {formatDate(c.updatedAt)}
                    </td>
                    <td className="text-right">
                      <Link 
                        href={`/assessor/reviews?claimId=${c._id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-white transition-all"
                        title="Open in Console"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
