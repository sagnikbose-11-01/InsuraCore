'use client';
// ============================================================
// components/policies/AvailablePlanCard.tsx
// Recommendation card for policies not yet purchased.
// Shows why this plan is recommended based on owned types.
// ============================================================

import Link from 'next/link';
import { ShieldCheck, ArrowRight, Sparkles, Info } from 'lucide-react';
import { SerializedPolicy } from '@/types';
import { PolicyType } from '@/lib/constants/enums';

const TYPE_CONFIG: Record<PolicyType, { badgeBg: string; badgeText: string; badgeBorder: string; reasonPrefix: string }> = {
  HEALTH:   { badgeBg: 'bg-[oklch(20%_0.05_150)]', badgeText: 'text-[oklch(72%_0.17_150)]', badgeBorder: 'border-[oklch(30%_0.08_150)]', reasonPrefix: 'Medical emergencies can cost lakhs — health cover is essential.' },
  AUTO:     { badgeBg: 'bg-[oklch(20%_0.05_75)]',  badgeText: 'text-[oklch(78%_0.18_75)]',  badgeBorder: 'border-[oklch(30%_0.08_75)]',  reasonPrefix: 'Third-party vehicle insurance is legally mandatory in India.' },
  PROPERTY: { badgeBg: 'bg-[oklch(18%_0.08_230)]', badgeText: 'text-[oklch(72%_0.20_230)]', badgeBorder: 'border-[oklch(28%_0.10_230)]', reasonPrefix: 'Protect your home from fire, floods, and natural disasters.' },
  LIFE:     { badgeBg: 'bg-[oklch(18%_0.05_25)]',  badgeText: 'text-[oklch(65%_0.20_25)]',  badgeBorder: 'border-[oklch(28%_0.08_25)]',  reasonPrefix: 'Secure your family\'s financial future with life cover.' },
  TRAVEL:   { badgeBg: 'bg-[oklch(18%_0.05_260)]', badgeText: 'text-[oklch(72%_0.15_260)]', badgeBorder: 'border-[oklch(28%_0.08_260)]', reasonPrefix: 'Cover medical emergencies and trip cancellations abroad.' },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface AvailablePlanCardProps {
  policy: SerializedPolicy;
  isOwned: boolean;
  recommendationReason?: string;
}

export function AvailablePlanCard({ policy, isOwned, recommendationReason }: AvailablePlanCardProps) {
  const cfg = TYPE_CONFIG[policy.type as PolicyType] ?? TYPE_CONFIG.HEALTH;
  const reason = recommendationReason ?? cfg.reasonPrefix;

  return (
    <div className="glass-card group hover:-translate-y-1 hover:border-[rgba(255,255,255,0.12)] transition-all duration-300 flex flex-col">
      <div className="p-6 flex-1">
        {/* Type badge + recommendation tag */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
            <ShieldCheck className="w-3 h-3" />
            {policy.type}
          </div>
          {!isOwned && (
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[oklch(20%_0.05_75)] text-[oklch(78%_0.18_75)] border border-[oklch(30%_0.08_75)]">
              <Sparkles className="w-2.5 h-2.5" />
              Recommended
            </div>
          )}
        </div>

        {/* Name + description */}
        <h3 className="text-sm font-bold text-[var(--color-base-100)] mb-1 group-hover:text-white transition-colors">
          {policy.name}
        </h3>
        <p className="text-xs text-[var(--color-base-500)] line-clamp-2 mb-4">{policy.description}</p>

        {/* Recommendation reason */}
        {!isOwned && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[oklch(20%_0.05_75_/_0.4)] border border-[oklch(30%_0.08_75_/_0.5)] mb-4">
            <Sparkles className="w-3 h-3 text-[oklch(78%_0.18_75)] mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-[oklch(72%_0.15_75)] leading-relaxed">{reason}</p>
          </div>
        )}

        {/* Key figures */}
        <div className="space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-4">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--color-base-500)]">Monthly Premium</span>
            <span className="font-bold text-[var(--color-base-100)]">
              {formatCurrency(policy.premiumAmount)}
              <span className="text-[var(--color-base-500)] font-normal">/mo</span>
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--color-base-500)]">Coverage up to</span>
            <span className={`font-semibold ${cfg.badgeText}`}>{formatCurrency(policy.coverageAmount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--color-base-500)]">Validity</span>
            <span className="text-[var(--color-base-300)]">{policy.validityPeriod} months</span>
          </div>
        </div>
      </div>

      {/* CTA — two buttons for available, one for owned */}
      <div className="px-6 pb-6">
        {isOwned ? (
          <div className="flex gap-2">
            <Link
              href={`/dashboard/policies/plan/${policy._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[var(--color-base-600)] text-xs font-semibold text-[var(--color-base-400)] hover:border-[var(--color-base-500)] hover:text-[var(--color-base-200)] transition-all"
            >
              <Info className="w-3 h-3" />
              View Details
            </Link>
            <div className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-xs font-semibold text-[var(--color-base-500)]">
              Already Owned
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Secondary: Details */}
            <Link
              href={`/dashboard/policies/plan/${policy._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[var(--color-base-600)] text-xs font-semibold text-[var(--color-base-400)] hover:border-[oklch(45%_0.12_230)] hover:text-[var(--color-brand-300)] hover:bg-[oklch(15%_0.05_230_/_0.4)] transition-all"
            >
              <Info className="w-3 h-3" />
              Details
            </Link>
            {/* Primary: Purchase */}
            <Link
              href={`/dashboard/policies/purchase/${policy._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-xs font-semibold transition-colors shadow-[0_2px_12px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_4px_20px_oklch(58%_0.22_230_/_0.45)]"
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
