'use client';
// ============================================================
// components/claims/ClaimSummaryCards.tsx
// 5-metric overview strip at the top of the My Claims page.
// Receives pre-computed counts from the server page.
// ============================================================

import { FileText, Clock, CheckCircle2, XCircle, Banknote } from 'lucide-react';

interface Counts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
}

interface ClaimSummaryCardsProps {
  counts: Counts;
}

const CARDS = [
  {
    key: 'total' as const,
    label: 'Total Claims',
    desc: 'All claims filed',
    icon: FileText,
    iconBg: 'bg-[oklch(18%_0.08_230)] border-[oklch(28%_0.10_230)]',
    iconColor: 'text-[oklch(72%_0.20_230)]',
    valueColor: 'text-[var(--color-base-100)]',
  },
  {
    key: 'pending' as const,
    label: 'In Progress',
    desc: 'Awaiting review',
    icon: Clock,
    iconBg: 'bg-[oklch(20%_0.05_75)] border-[oklch(30%_0.08_75)]',
    iconColor: 'text-[oklch(78%_0.18_75)]',
    valueColor: 'text-[oklch(78%_0.18_75)]',
  },
  {
    key: 'approved' as const,
    label: 'Approved',
    desc: 'Claims approved',
    icon: CheckCircle2,
    iconBg: 'bg-[oklch(20%_0.05_150)] border-[oklch(30%_0.08_150)]',
    iconColor: 'text-[oklch(72%_0.17_150)]',
    valueColor: 'text-[oklch(72%_0.17_150)]',
  },
  {
    key: 'rejected' as const,
    label: 'Rejected',
    desc: 'Not approved',
    icon: XCircle,
    iconBg: 'bg-[oklch(18%_0.05_25)] border-[oklch(28%_0.08_25)]',
    iconColor: 'text-[oklch(65%_0.20_25)]',
    valueColor: 'text-[oklch(65%_0.20_25)]',
  },
  {
    key: 'paid' as const,
    label: 'Settled',
    desc: 'Payment released',
    icon: Banknote,
    iconBg: 'bg-[oklch(18%_0.08_155)] border-[oklch(28%_0.12_155)]',
    iconColor: 'text-[oklch(75%_0.20_155)]',
    valueColor: 'text-[oklch(75%_0.20_155)]',
  },
];

export function ClaimSummaryCards({ counts }: ClaimSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="stat-card p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none mb-1 ${card.valueColor}`}>
                {counts[card.key]}
              </p>
              <p className="text-xs font-semibold text-[var(--color-base-300)]">{card.label}</p>
              <p className="text-[10px] text-[var(--color-base-600)] mt-0.5">{card.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
