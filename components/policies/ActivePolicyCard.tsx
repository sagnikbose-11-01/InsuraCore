'use client';
// ============================================================
// components/policies/ActivePolicyCard.tsx
// Premium card for an owned, active insurance policy.
// Shows coverage, expiry, days remaining, quick-action buttons.
// ============================================================

import Link from 'next/link';
import {
  ShieldCheck, Calendar, Clock, ArrowRight,
  FileText, RefreshCw, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { SerializedPurchasedPolicyWithStats, SerializedPolicy } from '@/types';
import { PolicyType, PolicyStatus } from '@/lib/constants/enums';
import { formatDate } from '@/lib/utils/formatters';
import { differenceInDays } from 'date-fns';

// Per-type design tokens
const TYPE_CONFIG: Record<
  PolicyType,
  { gradient: string; badgeBg: string; badgeText: string; badgeBorder: string; icon: string }
> = {
  HEALTH:   { gradient: 'from-[oklch(20%_0.05_150_/_0.6)]', badgeBg: 'bg-[oklch(20%_0.05_150)]', badgeText: 'text-[oklch(72%_0.17_150)]', badgeBorder: 'border-[oklch(30%_0.08_150)]', icon: '🏥' },
  AUTO:     { gradient: 'from-[oklch(20%_0.05_75_/_0.6)]',  badgeBg: 'bg-[oklch(20%_0.05_75)]',  badgeText: 'text-[oklch(78%_0.18_75)]',  badgeBorder: 'border-[oklch(30%_0.08_75)]',  icon: '🚗' },
  PROPERTY: { gradient: 'from-[oklch(18%_0.08_230_/_0.6)]', badgeBg: 'bg-[oklch(18%_0.08_230)]', badgeText: 'text-[oklch(72%_0.20_230)]', badgeBorder: 'border-[oklch(28%_0.10_230)]', icon: '🏠' },
  LIFE:     { gradient: 'from-[oklch(18%_0.05_25_/_0.6)]',  badgeBg: 'bg-[oklch(18%_0.05_25)]',  badgeText: 'text-[oklch(65%_0.20_25)]',  badgeBorder: 'border-[oklch(28%_0.08_25)]',  icon: '❤️' },
  TRAVEL:   { gradient: 'from-[oklch(18%_0.05_260_/_0.6)]', badgeBg: 'bg-[oklch(18%_0.05_260)]', badgeText: 'text-[oklch(72%_0.15_260)]', badgeBorder: 'border-[oklch(28%_0.08_260)]', icon: '✈️' },
};

const STATUS_CONFIG: Record<
  PolicyStatus,
  { label: string; badge: string }
> = {
  [PolicyStatus.ACTIVE]: {
    label: 'Active',
    badge: 'bg-[oklch(20%_0.05_150_/_0.3)] text-[oklch(72%_0.17_150)] border-[oklch(30%_0.08_150_/_0.5)]',
  },
  [PolicyStatus.EXPIRED]: {
    label: 'Expired',
    badge: 'bg-[oklch(20%_0.02_0_/_0.3)] text-[var(--color-base-400)] border-[var(--color-base-700)]',
  },
  [PolicyStatus.CANCELLED]: {
    label: 'Cancelled',
    badge: 'bg-[oklch(18%_0.05_25_/_0.3)] text-[oklch(65%_0.20_25)] border-[oklch(28%_0.08_25_/_0.5)]',
  },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface ActivePolicyCardProps {
  purchasedPolicy: SerializedPurchasedPolicyWithStats;
}

export function ActivePolicyCard({ purchasedPolicy }: ActivePolicyCardProps) {
  const policy = purchasedPolicy.policyId as SerializedPolicy;
  const cfg = TYPE_CONFIG[policy.type as PolicyType] ?? TYPE_CONFIG.HEALTH;
  const statusCfg = STATUS_CONFIG[purchasedPolicy.status] ?? STATUS_CONFIG[PolicyStatus.ACTIVE];

  const today = new Date();
  const endDate = new Date(purchasedPolicy.endDate);
  const startDate = new Date(purchasedPolicy.startDate);
  const daysRemaining = differenceInDays(endDate, today);
  const totalDays = differenceInDays(endDate, startDate);
  const progressPct = Math.min(100, Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100)));
  
  const isActive = purchasedPolicy.status === PolicyStatus.ACTIVE;
  const isExpiringSoon = isActive && daysRemaining <= 90 && daysRemaining >= 0;
  const isExpired = purchasedPolicy.status === PolicyStatus.EXPIRED || daysRemaining < 0;

  return (
    <div className={`relative overflow-hidden stat-card group hover:border-[var(--color-brand-700)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300`}>
      {/* Type-tinted gradient overlay */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cfg.gradient} to-transparent`} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[rgba(255,255,255,0.02)] to-transparent rounded-bl-full pointer-events-none" />

      <div className="p-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeBorder}`}>
              {cfg.icon}
            </div>
            <div>
              <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1 ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
                <ShieldCheck className="w-2.5 h-2.5" />
                {policy.type} Insurance
              </div>
              <h3 className="text-sm font-bold text-[var(--color-base-100)] leading-tight group-hover:text-white transition-colors">
                {policy.name}
              </h3>
              <p className="text-[10px] text-[var(--color-base-500)] font-mono mt-0.5">
                POL-{purchasedPolicy._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.badge}`}>
            ● {statusCfg.label}
          </span>
        </div>

        {/* ── Coverage + Premium ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
            <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">Coverage</p>
            <p className="text-base font-bold text-[oklch(72%_0.20_230)]">{formatCurrency(policy.coverageAmount)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
            <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">Premium</p>
            <p className="text-base font-bold text-[var(--color-base-200)]">
              {formatCurrency(policy.premiumAmount)}
              <span className="text-[10px] text-[var(--color-base-500)] font-normal">/mo</span>
            </p>
          </div>
        </div>

        {/* ── Dates ── */}
        <div className="flex items-center justify-between text-xs text-[var(--color-base-500)] mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Started {formatDate(purchasedPolicy.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expires {formatDate(purchasedPolicy.endDate)}
          </span>
        </div>

        {/* ── Claim stats ── */}
        <div className="flex items-center justify-between text-[11px] text-[var(--color-base-450)] px-3 py-2 rounded-xl bg-[var(--color-base-950)]/40 border border-[var(--color-base-800)]/60 mb-4">
          <span className="text-[var(--color-base-400)] font-medium">Claims Summary</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-base-200)]">
              {purchasedPolicy.claimStats.total} filed
            </span>
            <span className="text-[var(--color-base-750)]">·</span>
            <span className="font-semibold text-[oklch(72%_0.17_150)]">
              {purchasedPolicy.claimStats.approved} approved
            </span>
            <span className="text-[var(--color-base-750)]">·</span>
            <span className="font-semibold text-[oklch(78%_0.18_75)]">
              {purchasedPolicy.claimStats.underReview} review
            </span>
          </div>
        </div>

        {/* ── Time progress bar ── */}
        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-[var(--color-base-500)]">Policy Duration</span>
            <span className={`font-semibold ${isExpiringSoon ? 'text-[oklch(65%_0.20_25)]' : 'text-[var(--color-base-400)]'}`}>
              {isExpired
                ? 'Expired'
                : purchasedPolicy.status === PolicyStatus.CANCELLED
                ? 'Cancelled'
                : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
              }
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-base-800)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isExpiringSoon
                  ? 'bg-gradient-to-r from-[oklch(65%_0.20_25)] to-[oklch(55%_0.22_25)]'
                  : isExpired || purchasedPolicy.status === PolicyStatus.CANCELLED
                  ? 'bg-[var(--color-base-700)]'
                  : 'bg-gradient-to-r from-[oklch(58%_0.22_230)] to-[oklch(72%_0.20_230)]'
              }`}
              style={{ width: `${isExpired || purchasedPolicy.status === PolicyStatus.CANCELLED ? 100 : progressPct}%` }}
            />
          </div>
        </div>

        {/* ── Expiry warning ── */}
        {isExpiringSoon && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-[oklch(18%_0.05_25)] border border-[oklch(28%_0.08_25)]">
            <AlertTriangle className="w-3.5 h-3.5 text-[oklch(65%_0.20_25)] flex-shrink-0" />
            <p className="text-[10px] text-[oklch(65%_0.20_25)] font-medium">
              Renew before {formatDate(purchasedPolicy.endDate)} to avoid a coverage gap.
            </p>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-[var(--color-base-800)]">
          <Link
            href={`/dashboard/policies/${purchasedPolicy._id}`}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 rounded-lg bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-xs font-semibold transition-colors"
          >
            <ArrowRight className="w-3 h-3" />
            Manage Policy & View Details
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/dashboard/claims?policy=${purchasedPolicy._id}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] text-[var(--color-base-200)] border border-[var(--color-base-700)] text-xs font-semibold transition-colors"
            >
              <FileText className="w-3 h-3" />
              View Claims
            </Link>
            <Link
              href={isActive ? `/dashboard/claims/file` : '#'}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] text-[var(--color-base-200)] border border-[var(--color-base-700)]'
                  : 'bg-[var(--color-base-900)] text-[var(--color-base-600)] border border-[var(--color-base-800)] cursor-not-allowed pointer-events-none'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              File Claim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
