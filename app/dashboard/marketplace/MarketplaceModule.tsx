'use client';
// ============================================================
// app/dashboard/marketplace/MarketplaceModule.tsx
// Full marketplace client component: hero, filters, policy
// grid, search, sort. Links to plan detail + purchase flow.
// ============================================================

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, X, ShieldCheck, ArrowRight,
  Sparkles, TrendingUp, Users, FileText, Zap, ChevronDown,
  Star, CheckCircle2, Info, Heart, Car, Home, Plane, Shield,
} from 'lucide-react';
import { SerializedPolicy } from '@/types';
import { PolicyType } from '@/lib/constants/enums';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface MarketplaceStats {
  availablePlans: number;
  activeCustomers: number;
  claimsProcessed: number;
  totalCoverageOffered: number;
}

interface MarketplaceModuleProps {
  policies: SerializedPolicy[];
  stats: MarketplaceStats;
  ownedPolicyIds: string[];
}

type SortKey = 'newest' | 'popular' | 'coverage_high' | 'premium_low' | 'premium_high';

// ─────────────────────────────────────────────────────────────
// Type config
// ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<PolicyType, {
  label: string; icon: React.ReactNode; emoji: string;
  gradient: string; badgeBg: string; badgeText: string; badgeBorder: string;
  cardAccent: string; tagline: string;
}> = {
  HEALTH: {
    label: 'Health', emoji: '🏥',
    icon: <Heart className="w-4 h-4" />,
    gradient: 'from-[oklch(20%_0.06_150_/_0.6)] to-transparent',
    badgeBg: 'bg-[oklch(20%_0.05_150)]', badgeText: 'text-[oklch(72%_0.17_150)]', badgeBorder: 'border-[oklch(30%_0.08_150)]',
    cardAccent: 'oklch(72%_0.17_150)',
    tagline: 'Medical & hospitalization cover',
  },
  AUTO: {
    label: 'Auto', emoji: '🚗',
    icon: <Car className="w-4 h-4" />,
    gradient: 'from-[oklch(20%_0.06_75_/_0.6)] to-transparent',
    badgeBg: 'bg-[oklch(20%_0.05_75)]', badgeText: 'text-[oklch(78%_0.18_75)]', badgeBorder: 'border-[oklch(30%_0.08_75)]',
    cardAccent: 'oklch(78%_0.18_75)',
    tagline: 'Vehicle & third-party protection',
  },
  PROPERTY: {
    label: 'Property', emoji: '🏠',
    icon: <Home className="w-4 h-4" />,
    gradient: 'from-[oklch(18%_0.08_230_/_0.6)] to-transparent',
    badgeBg: 'bg-[oklch(18%_0.08_230)]', badgeText: 'text-[oklch(72%_0.20_230)]', badgeBorder: 'border-[oklch(28%_0.10_230)]',
    cardAccent: 'oklch(72%_0.20_230)',
    tagline: 'Home & contents insurance',
  },
  LIFE: {
    label: 'Life', emoji: '❤️',
    icon: <Shield className="w-4 h-4" />,
    gradient: 'from-[oklch(18%_0.06_25_/_0.6)] to-transparent',
    badgeBg: 'bg-[oklch(18%_0.05_25)]', badgeText: 'text-[oklch(65%_0.20_25)]', badgeBorder: 'border-[oklch(28%_0.08_25)]',
    cardAccent: 'oklch(65%_0.20_25)',
    tagline: 'Family financial protection',
  },
  TRAVEL: {
    label: 'Travel', emoji: '✈️',
    icon: <Plane className="w-4 h-4" />,
    gradient: 'from-[oklch(18%_0.06_260_/_0.6)] to-transparent',
    badgeBg: 'bg-[oklch(18%_0.05_260)]', badgeText: 'text-[oklch(72%_0.15_260)]', badgeBorder: 'border-[oklch(28%_0.08_260)]',
    cardAccent: 'oklch(72%_0.15_260)',
    tagline: 'Global travel & emergency cover',
  },
};

const ALL_TYPES = Object.values(PolicyType);

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',       label: 'Newest First' },
  { value: 'coverage_high', label: 'Highest Coverage' },
  { value: 'premium_low',   label: 'Lowest Premium' },
  { value: 'premium_high',  label: 'Highest Premium' },
];

// ─────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────

function formatCurrency(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_00_00_00_000) return `₹${(n / 1_00_00_00_000).toFixed(1)}B`;
    if (n >= 1_00_00_000)    return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
    if (n >= 1_00_000)       return `₹${(n / 1_00_000).toFixed(0)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// ─────────────────────────────────────────────────────────────
// Hero Stats Bar
// ─────────────────────────────────────────────────────────────

function HeroStats({ stats }: { stats: MarketplaceStats }) {
  const items = [
    { icon: <ShieldCheck className="w-5 h-5" />, value: stats.availablePlans.toString(), label: 'Available Plans', color: 'text-[oklch(72%_0.20_230)]' },
    { icon: <Users className="w-5 h-5" />, value: stats.activeCustomers.toLocaleString('en-IN'), label: 'Active Customers', color: 'text-[oklch(72%_0.17_150)]' },
    { icon: <FileText className="w-5 h-5" />, value: stats.claimsProcessed.toLocaleString('en-IN'), label: 'Claims Processed', color: 'text-[oklch(78%_0.18_75)]' },
    { icon: <TrendingUp className="w-5 h-5" />, value: formatCurrency(stats.totalCoverageOffered, true), label: 'Coverage Offered', color: 'text-[oklch(65%_0.20_25)]' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="stat-card p-5 flex items-center gap-4">
          <div className={`flex-shrink-0 ${item.color}`}>{item.icon}</div>
          <div>
            <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            <p className="text-[11px] text-[var(--color-base-500)] font-medium mt-0.5">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category Filter Pills
// ─────────────────────────────────────────────────────────────

function CategoryFilters({
  selected,
  onChange,
  counts,
}: {
  selected: PolicyType | 'all';
  onChange: (v: PolicyType | 'all') => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('all')}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
          selected === 'all'
            ? 'bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border-[oklch(28%_0.10_230)] shadow-[0_0_12px_oklch(58%_0.22_230_/_0.2)]'
            : 'bg-[var(--color-base-800)] text-[var(--color-base-400)] border-[var(--color-base-700)] hover:border-[var(--color-base-600)] hover:text-[var(--color-base-200)]'
        }`}
      >
        All Plans
        <span className="text-[10px] opacity-60">({counts['all'] ?? 0})</span>
      </button>
      {ALL_TYPES.map(type => {
        const cfg = TYPE_CONFIG[type];
        const isActive = selected === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              isActive
                ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`
                : 'bg-[var(--color-base-800)] text-[var(--color-base-400)] border-[var(--color-base-700)] hover:border-[var(--color-base-600)] hover:text-[var(--color-base-200)]'
            }`}
          >
            <span>{cfg.emoji}</span>
            {cfg.label}
            <span className="text-[10px] opacity-60">({counts[type] ?? 0})</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Policy Card
// ─────────────────────────────────────────────────────────────

function PolicyCard({ policy, isOwned }: { policy: SerializedPolicy; isOwned: boolean }) {
  const cfg = TYPE_CONFIG[policy.type as PolicyType] ?? TYPE_CONFIG.HEALTH;

  return (
    <div className={`glass-card group flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden ${isOwned ? 'opacity-80' : ''}`}>

      {/* Subtle top-left gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} pointer-events-none`} />

      {/* Owned ribbon */}
      {isOwned && (
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] text-[10px] font-semibold text-[oklch(72%_0.17_150)]">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Owned
        </div>
      )}

      <div className="relative z-10 p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeBorder}`}>
            {cfg.emoji}
          </div>
          <div className="min-w-0">
            <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1.5 ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
              {cfg.label}
            </div>
            <h3 className="text-sm font-bold text-[var(--color-base-100)] leading-tight group-hover:text-white transition-colors line-clamp-2">
              {policy.name}
            </h3>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-[var(--color-base-500)] mb-4 leading-relaxed line-clamp-2">
          {policy.description}
        </p>

        {/* Assessor creator badge */}
        {policy.createdByName && (
          <div className="flex items-center gap-1.5 mb-3 text-[10px] text-[var(--color-base-500)]">
            <Star className="w-3 h-3 text-[oklch(78%_0.18_75)] flex-shrink-0" />
            <span>By <span className="text-[var(--color-base-300)] font-medium">{policy.createdByName}</span></span>
          </div>
        )}

        {/* Key metrics */}
        <div className="space-y-2.5 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-base-500)]">Coverage</span>
            <span className="font-bold" style={{ color: cfg.cardAccent }}>
              {formatCurrency(policy.coverageAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-base-500)]">Premium</span>
            <span className="font-semibold text-[var(--color-base-200)]">
              {formatCurrency(policy.premiumAmount)}<span className="text-[var(--color-base-500)] font-normal">/mo</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-base-500)]">Duration</span>
            <span className="text-[var(--color-base-300)]">{policy.validityPeriod} months</span>
          </div>
          {policy.eligibility && policy.eligibility.length > 0 && (
            <div className="flex justify-between items-start text-xs pt-1">
              <span className="text-[var(--color-base-500)] flex-shrink-0">Eligibility</span>
              <span className="text-[var(--color-base-400)] text-right ml-3 line-clamp-1">
                {policy.eligibility[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="relative z-10 px-6 pb-6 pt-0">
        {isOwned ? (
          <div className="flex gap-2">
            <Link
              href={`/dashboard/policies/plan/${policy._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--color-base-600)] text-xs font-semibold text-[var(--color-base-400)] hover:border-[var(--color-base-500)] hover:text-[var(--color-base-200)] transition-all"
            >
              <Info className="w-3 h-3" />
              View Details
            </Link>
            <div className="flex-1 flex items-center justify-center py-2 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-xs font-semibold text-[var(--color-base-500)]">
              Already Owned
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href={`/dashboard/policies/plan/${policy._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--color-base-600)] text-xs font-semibold text-[var(--color-base-400)] hover:border-[oklch(45%_0.12_230)] hover:text-[oklch(72%_0.20_230)] hover:bg-[oklch(15%_0.05_230_/_0.3)] transition-all"
            >
              <Info className="w-3 h-3" />
              Details
            </Link>
            <Link
              href={`/dashboard/policies/purchase/${policy._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-xs font-semibold transition-all shadow-[0_2px_12px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_4px_20px_oklch(58%_0.22_230_/_0.5)]"
            >
              Purchase
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function MarketplaceModule({ policies, stats, ownedPolicyIds }: MarketplaceModuleProps) {
  const ownedSet = useMemo(() => new Set(ownedPolicyIds), [ownedPolicyIds]);

  const [search, setSearch]           = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PolicyType | 'all'>('all');
  const [sortBy, setSortBy]           = useState<SortKey>('newest');
  const [showSort, setShowSort]       = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [premiumMax, setPremiumMax]   = useState<number>(100000);
  const sortRef = useRef<HTMLDivElement>(null);

  // Count per category for filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: policies.length };
    for (const p of policies) {
      counts[p.type] = (counts[p.type] ?? 0) + 1;
    }
    return counts;
  }, [policies]);

  // Max premium in the dataset (for slider)
  const maxPremiumInData = useMemo(() => Math.max(...policies.map(p => p.premiumAmount), 10000), [policies]);

  // Filtered + sorted policies
  const filtered = useMemo(() => {
    let list = [...policies];

    if (categoryFilter !== 'all') {
      list = list.filter(p => p.type === categoryFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }

    list = list.filter(p => p.premiumAmount <= premiumMax);

    list.sort((a, b) => {
      if (sortBy === 'coverage_high') return b.coverageAmount - a.coverageAmount;
      if (sortBy === 'premium_low')   return a.premiumAmount - b.premiumAmount;
      if (sortBy === 'premium_high')  return b.premiumAmount - a.premiumAmount;
      // newest: by createdAt desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [policies, categoryFilter, search, premiumMax, sortBy]);

  const ownedCount = filtered.filter(p => ownedSet.has(p._id)).length;
  const availableCount = filtered.length - ownedCount;

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-[oklch(15%_0.06_230_/_0.9)] via-[oklch(10%_0.03_230_/_0.5)] to-[var(--color-base-950)] border border-[oklch(25%_0.08_230_/_0.5)]">
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_70%_30%,oklch(55%_0.22_230_/_0.08),transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(ellipse_at_30%_70%,oklch(65%_0.20_25_/_0.05),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 px-8 py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(18%_0.08_230_/_0.8)] border border-[oklch(35%_0.12_230_/_0.5)] text-xs font-semibold text-[oklch(72%_0.20_230)]">
              <Zap className="w-3 h-3" />
              InsuraCore Marketplace
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Your Protection,{' '}
            <span className="bg-gradient-to-r from-[oklch(72%_0.22_230)] to-[oklch(72%_0.20_150)] bg-clip-text text-transparent">
              Personalised
            </span>
          </h1>
          <p className="text-[var(--color-base-400)] text-sm max-w-xl leading-relaxed mb-8">
            Browse {stats.availablePlans} curated insurance plans across Health, Auto, Property, Life, and Travel. All products verified and IRDAI compliant.
          </p>

          <HeroStats stats={stats} />
        </div>
      </div>

      {/* ── Filters Row ─────────────────────────────── */}
      <div className="mb-6 space-y-4">
        {/* Search + Sort + Filter toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
            <input
              id="marketplace-search"
              type="text"
              placeholder="Search by plan name, type, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm text-[var(--color-base-200)] placeholder-[var(--color-base-600)] focus:outline-none focus:border-[var(--color-brand-600)] focus:ring-1 focus:ring-[var(--color-brand-700)] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-base-500)] hover:text-[var(--color-base-300)]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Premium Filter Toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
              showFilters
                ? 'bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border-[oklch(28%_0.10_230)]'
                : 'bg-[var(--color-base-800)] border-[var(--color-base-700)] text-[var(--color-base-300)] hover:border-[var(--color-base-600)]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSort(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-sm text-[var(--color-base-300)] hover:border-[var(--color-base-600)] transition-colors whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4 text-[var(--color-base-500)]" />
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-base-500)]" />
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

        {/* Premium filter expanded */}
        {showFilters && (
          <div className="stat-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--color-base-300)]">Max Monthly Premium</p>
              <span className="text-sm font-bold text-[oklch(72%_0.20_230)]">{formatCurrency(premiumMax)}/mo</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPremiumInData}
              step={500}
              value={premiumMax}
              onChange={e => setPremiumMax(Number(e.target.value))}
              className="w-full h-1.5 rounded-full accent-[oklch(58%_0.22_230)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-base-600)] mt-1.5">
              <span>₹0</span>
              <span>{formatCurrency(maxPremiumInData)}</span>
            </div>
          </div>
        )}

        {/* Category filter pills */}
        <CategoryFilters
          selected={categoryFilter}
          onChange={setCategoryFilter}
          counts={categoryCounts}
        />
      </div>

      {/* ── Results summary ──────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--color-base-500)]">
            <span className="font-semibold text-[var(--color-base-200)]">{filtered.length}</span> plan{filtered.length !== 1 ? 's' : ''} found
          </p>
          {ownedCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] text-[oklch(72%_0.17_150)] font-semibold">
              {ownedCount} owned
            </span>
          )}
          {availableCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] font-semibold">
              {availableCount} available
            </span>
          )}
        </div>

        {/* Clear filters */}
        {(search || categoryFilter !== 'all' || premiumMax < maxPremiumInData) && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter('all'); setPremiumMax(maxPremiumInData); }}
            className="text-xs text-[var(--color-base-500)] hover:text-[var(--color-danger-400)] flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* ── Policy Grid ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 border border-[var(--color-base-800)] rounded-2xl bg-[var(--color-base-900)]">
          <ShieldCheck className="w-10 h-10 text-[var(--color-base-700)] mb-4" />
          <p className="text-base font-semibold text-[var(--color-base-300)] mb-1">No plans found</p>
          <p className="text-sm text-[var(--color-base-500)] mb-4 text-center max-w-xs">
            No insurance plans match your current filters. Try adjusting your search or filters.
          </p>
          <button
            onClick={() => { setSearch(''); setCategoryFilter('all'); setPremiumMax(maxPremiumInData); }}
            className="px-4 py-2 rounded-lg bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] text-xs text-[var(--color-base-200)] font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(policy => (
            <PolicyCard
              key={policy._id}
              policy={policy}
              isOwned={ownedSet.has(policy._id)}
            />
          ))}
        </div>
      )}

      {/* ── Bottom trust bar ────────────────────────── */}
      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        {[
          { icon: <ShieldCheck className="w-5 h-5 text-[oklch(72%_0.17_150)]" />, title: 'IRDAI Regulated', desc: 'All products compliant with Indian insurance regulations' },
          { icon: <Zap className="w-5 h-5 text-[oklch(78%_0.18_75)]" />, title: 'Instant Activation', desc: 'Coverage begins immediately upon purchase confirmation' },
          { icon: <Sparkles className="w-5 h-5 text-[oklch(72%_0.20_230)]" />, title: 'Expert-Curated', desc: 'Reviewed by certified insurance assessors' },
        ].map(item => (
          <div key={item.title} className="stat-card p-5 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-base-200)]">{item.title}</p>
              <p className="text-xs text-[var(--color-base-500)] mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
