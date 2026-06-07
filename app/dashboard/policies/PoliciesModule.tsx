'use client';

import { useState, useMemo } from 'react';
import { ShieldCheck, Sparkles, Search, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { PolicyPortfolioStats } from '@/components/policies/PolicyPortfolioStats';
import { ActivePolicyCard } from '@/components/policies/ActivePolicyCard';
import { AvailablePlanCard } from '@/components/policies/AvailablePlanCard';
import { PolicyInsights } from '@/components/policies/PolicyInsights';
import { PoliciesEmptyState } from '@/components/policies/PoliciesEmptyState';
import { SerializedPurchasedPolicyWithStats, SerializedPolicy } from '@/types';
import { PolicyStatus, PolicyType } from '@/lib/constants/enums';

interface PortfolioStats {
  activePolicies: number;
  totalCoverage: number;
  monthlyPremium: number;
  totalClaims: number;
  expiringSoon: number;
  pendingClaims: number;
  approvedClaims: number;
}

interface PoliciesModuleProps {
  myPolicies:        SerializedPurchasedPolicyWithStats[];
  availablePolicies: SerializedPolicy[];
  stats:             PortfolioStats;
  userName:          string;
}

type Tab = 'active' | 'available';
type SortKey = 'newest' | 'coverage_high' | 'coverage_low' | 'premium_high' | 'premium_low' | 'expiry';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',        label: 'Newest Purchased' },
  { value: 'coverage_high', label: 'Highest Coverage' },
  { value: 'coverage_low',  label: 'Lowest Coverage' },
  { value: 'premium_high',  label: 'Highest Premium' },
  { value: 'premium_low',   label: 'Lowest Premium' },
  { value: 'expiry',        label: 'Closest Expiry' },
];

export function PoliciesModule({
  myPolicies,
  availablePolicies,
  stats,
  userName,
}: PoliciesModuleProps) {
  const [tab, setTab] = useState<Tab>('active');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PolicyStatus>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [showSort, setShowSort] = useState(false);

  const activePolicies = myPolicies.filter(p => p.status === PolicyStatus.ACTIVE);

  // Collect owned policy types for insights
  const ownedTypes = Array.from(
    new Set(
      activePolicies.map(p => (p.policyId as SerializedPolicy).type)
    )
  );

  // For available plans, mark already-owned ones
  const ownedPolicyIds = new Set(
    activePolicies.map(p => (p.policyId as SerializedPolicy)._id)
  );

  // Split available into recommended (not owned) and already owned
  const recommended = availablePolicies.filter(p => !ownedPolicyIds.has(p._id));
  const alreadyOwned = availablePolicies.filter(p => ownedPolicyIds.has(p._id));

  // Filter and Sort purchased policies
  const filteredMyPolicies = useMemo(() => {
    let list = [...myPolicies];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter);
    }

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const policy = p.policyId as SerializedPolicy;
        return (
          policy.name.toLowerCase().includes(q) ||
          policy.type.toLowerCase().includes(q) ||
          p._id.slice(-8).toLowerCase().includes(q)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      const polA = a.policyId as SerializedPolicy;
      const polB = b.policyId as SerializedPolicy;
      if (sortBy === 'newest') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      if (sortBy === 'coverage_high') {
        return polB.coverageAmount - polA.coverageAmount;
      }
      if (sortBy === 'coverage_low') {
        return polA.coverageAmount - polB.coverageAmount;
      }
      if (sortBy === 'premium_high') {
        return polB.premiumAmount - polA.premiumAmount;
      }
      if (sortBy === 'premium_low') {
        return polA.premiumAmount - polB.premiumAmount;
      }
      if (sortBy === 'expiry') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      return 0;
    });

    return list;
  }, [myPolicies, statusFilter, search, sortBy]);

  const isFiltered = statusFilter !== 'all' || search.trim() !== '';

  function clearFilters() {
    setStatusFilter('all');
    setSearch('');
    setSortBy('newest');
  }

  // Empty state: no purchased policies at all
  if (myPolicies.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-base-100)] tracking-tight">My Policies</h1>
          <p className="mt-1 text-sm text-[var(--color-base-500)]">Manage, monitor, and expand your insurance protection.</p>
        </div>
        <PoliciesEmptyState />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Page title ─────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-base-100)] tracking-tight">My Policies</h1>
        <p className="mt-1 text-sm text-[var(--color-base-500)]">Manage, monitor, and expand your insurance protection.</p>
      </div>

      {/* ── Portfolio stats + greeting ──────────────── */}
      <PolicyPortfolioStats stats={stats} userName={userName} />

      {/* ── Tab strip ──────────────────────────────── */}
      <div className="flex gap-1 mb-8 border-b border-[var(--color-base-800)]">
        <button
          onClick={() => setTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 -mb-px ${
            tab === 'active'
              ? 'border-[var(--color-brand-500)] text-[var(--color-brand-300)]'
              : 'border-transparent text-[var(--color-base-500)] hover:text-[var(--color-base-300)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Your Policies
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border border-[oklch(28%_0.10_230)]">
            {myPolicies.length}
          </span>
        </button>
        <button
          onClick={() => setTab('available')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 -mb-px ${
            tab === 'available'
              ? 'border-[var(--color-brand-500)] text-[var(--color-brand-300)]'
              : 'border-transparent text-[var(--color-base-500)] hover:text-[var(--color-base-300)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Expand Your Coverage
          {recommended.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(20%_0.05_75)] text-[oklch(78%_0.18_75)] border border-[oklch(30%_0.08_75)]">
              {recommended.length} new
            </span>
          )}
        </button>
      </div>

      {/* ── Active tab content ─────────────────────── */}
      {tab === 'active' && (
        <>
          {/* Search, Filter, Sort Row */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
              <input
                type="text"
                placeholder="Search by policy name or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm text-[var(--color-base-200)] placeholder-[var(--color-base-600)] focus:outline-none focus:border-[var(--color-brand-600)] focus:ring-1 focus:ring-[var(--color-brand-700)] transition-colors"
              />
            </div>

            {/* Status filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {(['all', PolicyStatus.ACTIVE, PolicyStatus.EXPIRED, PolicyStatus.CANCELLED] as const).map(s => {
                const count = s === 'all'
                  ? myPolicies.length
                  : myPolicies.filter(p => p.status === s).length;
                const label = s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase();
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 border ${
                      statusFilter === s
                        ? 'bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border-[oklch(28%_0.10_230)]'
                        : 'text-[var(--color-base-500)] hover:text-[var(--color-base-200)] hover:bg-[var(--color-base-850)] border-transparent'
                    }`}
                  >
                    {label}
                    <span className="ml-1 text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Sort selector */}
            <div className="relative">
              <button
                onClick={() => setShowSort(v => !v)}
                className="flex items-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm text-[var(--color-base-300)] hover:border-[var(--color-base-600)] transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4 text-[var(--color-base-500)]" />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 stat-card py-1.5 shadow-xl">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === opt.value
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

          {filteredMyPolicies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-[var(--color-base-800)] rounded-2xl bg-[var(--color-base-900)] mb-10">
              <AlertCircle className="w-8 h-8 text-[var(--color-base-600)] mb-3" />
              <p className="text-sm font-semibold text-[var(--color-base-300)] mb-1">No matching policies found</p>
              <p className="text-xs text-[var(--color-base-500)] mb-4 text-center">We couldn&apos;t find any purchased policies matching your search or filters.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] text-xs text-[var(--color-base-200)] font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                {filteredMyPolicies.map(p => (
                  <ActivePolicyCard key={p._id} purchasedPolicy={p} />
                ))}
              </div>

              {/* Insights below active cards */}
              <PolicyInsights ownedTypes={ownedTypes as PolicyType[]} />
            </>
          )}
        </>
      )}

      {/* ── Available tab content ──────────────────── */}
      {tab === 'available' && (
        <>
          {recommended.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[oklch(78%_0.18_75)] mb-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended for you — gaps in your coverage
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {recommended.map(policy => (
                  <AvailablePlanCard
                    key={policy._id}
                    policy={policy}
                    isOwned={false}
                  />
                ))}
              </div>
            </section>
          )}

          {alreadyOwned.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-base-500)] mb-5 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Plans you already own
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {alreadyOwned.map(policy => (
                  <AvailablePlanCard
                    key={policy._id}
                    policy={policy}
                    isOwned={true}
                  />
                ))}
              </div>
            </section>
          )}

          {recommended.length === 0 && alreadyOwned.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-[var(--color-base-500)] mb-4">No plans available at the moment.</p>
              <a
                href="/dashboard/marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-semibold text-sm transition-all"
              >
                Browse Marketplace
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
