'use client';
// ============================================================
// components/claims/ClaimsEmptyState.tsx
// Premium empty-state shown when user has no claims.
// ============================================================

import Link from 'next/link';
import { FileText, PlusCircle } from 'lucide-react';

interface ClaimsEmptyStateProps {
  /** True when filtered/searched to zero results, false when genuinely empty */
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function ClaimsEmptyState({ isFiltered, onClearFilter }: ClaimsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      {/* Layered icon art */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-[oklch(18%_0.08_230_/_0.3)] border border-[oklch(28%_0.10_230_/_0.4)] flex items-center justify-center">
          <FileText className="w-10 h-10 text-[oklch(72%_0.20_230_/_0.4)]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] flex items-center justify-center">
          <PlusCircle className="w-4 h-4 text-[var(--color-base-500)]" />
        </div>
      </div>

      {isFiltered ? (
        <>
          <h3 className="text-lg font-bold text-[var(--color-base-200)] mb-2">
            No claims match your filters
          </h3>
          <p className="text-sm text-[var(--color-base-500)] max-w-sm mb-6">
            Try adjusting your search term, status filter, or sort order.
          </p>
          <button
            onClick={onClearFilter}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm font-semibold text-[var(--color-base-200)] hover:border-[var(--color-base-600)] hover:bg-[var(--color-base-700)] transition-all"
          >
            Clear Filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-[var(--color-base-100)] mb-2">
            You haven&apos;t filed any claims yet
          </h3>
          <p className="text-sm text-[var(--color-base-500)] max-w-sm mb-8">
            When something unexpected happens, file a claim here and our team will guide you through the entire process.
          </p>
          <Link
            href="/dashboard/claims/file"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-sm font-semibold transition-all duration-200 shadow-[0_4px_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_6px_24px_oklch(58%_0.22_230_/_0.4)]"
          >
            <PlusCircle className="w-4 h-4" />
            File Your First Claim
          </Link>
        </>
      )}
    </div>
  );
}
