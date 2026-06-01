'use client';
// ============================================================
// app/dashboard/claims/ClaimsModule.tsx
// Client-side shell for the My Claims page.
// Owns all interactive state: tab filter, text search, sort order.
// Receives pre-fetched, serialized claims from the Server Component.
// ============================================================

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { ClaimSummaryCards } from '@/components/claims/ClaimSummaryCards';
import { ClaimsEmptyState } from '@/components/claims/ClaimsEmptyState';
import { SerializedClaim, SerializedPurchasedPolicy, SerializedPolicy } from '@/types';
import { ClaimStatus } from '@/lib/constants/enums';

// ── Types ────────────────────────────────────────────────────

type SortKey = 'newest' | 'oldest' | 'amount_high' | 'amount_low';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'amount_high', label: 'Highest Amount' },
  { value: 'amount_low',  label: 'Lowest Amount' },
];

const TAB_FILTERS: { label: string; value: ClaimStatus | 'ALL' }[] = [
  { label: 'All',               value: 'ALL' },
  { label: 'Pending',           value: ClaimStatus.PENDING },
  { label: 'Under Review',      value: ClaimStatus.UNDER_REVIEW },
  { label: 'Doc Verification',  value: ClaimStatus.DOCUMENT_VERIFICATION },
  { label: 'Approved',          value: ClaimStatus.APPROVED },
  { label: 'Rejected',          value: ClaimStatus.REJECTED },
  { label: 'Paid',              value: ClaimStatus.PAID },
];

interface ClaimsModuleProps {
  claims: SerializedClaim[];
}

// ── Helper ───────────────────────────────────────────────────

function getPolicyName(claim: SerializedClaim): string {
  const pp = claim.purchasedPolicyId as SerializedPurchasedPolicy | null;
  const p  = pp?.policyId as SerializedPolicy | null;
  return p?.name ?? '';
}

// ── Component ────────────────────────────────────────────────

export function ClaimsModule({ claims }: ClaimsModuleProps) {
  const [activeTab, setActiveTab] = useState<ClaimStatus | 'ALL'>('ALL');
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState<SortKey>('newest');
  const [showSort,  setShowSort]  = useState(false);

  // Derived counts for summary cards
  const counts = useMemo(() => ({
    total:    claims.length,
    pending:  claims.filter(c =>
      [ClaimStatus.PENDING, ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.DOCUMENT_VERIFICATION].includes(c.status)
    ).length,
    approved: claims.filter(c => c.status === ClaimStatus.APPROVED).length,
    rejected: claims.filter(c => c.status === ClaimStatus.REJECTED).length,
    paid:     claims.filter(c => c.status === ClaimStatus.PAID).length,
  }), [claims]);

  // Filter + search + sort pipeline
  const filtered = useMemo(() => {
    let list = [...claims];

    // Tab filter
    if (activeTab !== 'ALL') {
      list = list.filter(c => c.status === activeTab);
    }

    // Text search (claim id tail, title, policy name)
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c =>
        c._id.slice(-8).toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        getPolicyName(c).toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sort === 'newest')      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest')      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'amount_high') return b.claimAmount - a.claimAmount;
      if (sort === 'amount_low')  return a.claimAmount - b.claimAmount;
      return 0;
    });

    return list;
  }, [claims, activeTab, search, sort]);

  const isFiltered = activeTab !== 'ALL' || search.trim() !== '';

  function clearFilters() {
    setActiveTab('ALL');
    setSearch('');
    setSort('newest');
  }

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-base-100)] tracking-tight">My Claims</h1>
          <p className="mt-1 text-sm text-[var(--color-base-500)]">
            Track, monitor, and manage all your insurance claims.
          </p>
        </div>
        <Link
          href="/dashboard/claims/file"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-sm font-semibold transition-all duration-200 shadow-[0_4px_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_6px_24px_oklch(58%_0.22_230_/_0.4)] flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          File a New Claim
        </Link>
      </div>

      {/* ── Summary Cards ─────────────────────────────── */}
      <ClaimSummaryCards counts={counts} />

      {/* ── Search + Sort ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
          <input
            type="text"
            placeholder="Search by Claim ID, title, or policy name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm text-[var(--color-base-200)] placeholder-[var(--color-base-600)] focus:outline-none focus:border-[var(--color-brand-600)] focus:ring-1 focus:ring-[var(--color-brand-700)] transition-colors"
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm text-[var(--color-base-300)] hover:border-[var(--color-base-600)] transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4 text-[var(--color-base-500)]" />
            {SORT_OPTIONS.find(o => o.value === sort)?.label}
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 z-20 w-48 stat-card py-1.5 shadow-xl">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sort === opt.value
                      ? 'text-[var(--color-brand-300)] bg-[oklch(18%_0.08_230_/_0.5)]'
                      : 'text-[var(--color-base-400)] hover:text-[var(--color-base-200)] hover:bg-[var(--color-base-700)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Tabs ───────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TAB_FILTERS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              activeTab === tab.value
                ? 'bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border border-[oklch(28%_0.10_230)]'
                : 'text-[var(--color-base-500)] hover:text-[var(--color-base-200)] hover:bg-[var(--color-base-800)]'
            }`}
          >
            {tab.label}
            {tab.value !== 'ALL' && (
              <span className="ml-1.5 text-[9px] opacity-60">
                {claims.filter(c => c.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Results header ────────────────────────────── */}
      {filtered.length > 0 && (
        <p className="text-xs text-[var(--color-base-600)] mb-4">
          Showing {filtered.length} of {claims.length} claim{claims.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Claims Grid ───────────────────────────────── */}
      {filtered.length === 0 ? (
        <ClaimsEmptyState isFiltered={isFiltered} onClearFilter={clearFilters} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(claim => (
            <ClaimCard key={claim._id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
