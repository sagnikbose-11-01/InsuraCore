'use client';
// ============================================================
// components/policies/PolicyPortfolioStats.tsx
// Five-metric overview row: active count, total coverage,
// monthly spend, claims used, expiring soon.
// Pure presentational — all values computed server-side.
// ============================================================

import { ShieldCheck, Wallet, DollarSign, FileText, AlertTriangle, FileCheck } from 'lucide-react';

interface PortfolioStats {
  activePolicies: number;
  totalCoverage: number;
  monthlyPremium: number;
  totalClaims: number;
  expiringSoon: number;    // active policies expiring within 90 days
  pendingClaims: number;
  approvedClaims: number;
}

interface PolicyPortfolioStatsProps {
  stats: PortfolioStats;
  userName: string;
}

function formatCrore(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)}Cr`;
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(1)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const METRICS = (stats: PortfolioStats) => [
  {
    label:     'Active Policies',
    value:     String(stats.activePolicies),
    desc:      'currently protecting you',
    icon:      ShieldCheck,
    iconBg:    'bg-[oklch(18%_0.08_230)] border-[oklch(28%_0.10_230)]',
    iconColor: 'text-[oklch(72%_0.20_230)]',
    valColor:  'text-[var(--color-base-100)]',
  },
  {
    label:     'Total Coverage',
    value:     formatCrore(stats.totalCoverage),
    desc:      'maximum claimable',
    icon:      Wallet,
    iconBg:    'bg-[oklch(20%_0.05_150)] border-[oklch(30%_0.08_150)]',
    iconColor: 'text-[oklch(72%_0.17_150)]',
    valColor:  'text-[oklch(72%_0.17_150)]',
  },
  {
    label:     'Monthly Premium',
    value:     formatCurrency(stats.monthlyPremium),
    desc:      'total monthly spend',
    icon:      DollarSign,
    iconBg:    'bg-[oklch(20%_0.05_75)] border-[oklch(30%_0.08_75)]',
    iconColor: 'text-[oklch(78%_0.18_75)]',
    valColor:  'text-[oklch(78%_0.18_75)]',
  },
  {
    label:     'Claims Filed',
    value:     String(stats.totalClaims),
    desc:      'across all policies',
    icon:      FileText,
    iconBg:    'bg-[oklch(18%_0.05_285)] border-[oklch(28%_0.10_285)]',
    iconColor: 'text-[oklch(72%_0.18_285)]',
    valColor:  'text-[var(--color-base-100)]',
  },
  {
    label:     'Pending Claims',
    value:     String(stats.pendingClaims),
    desc:      'awaiting assessment',
    icon:      AlertTriangle,
    iconBg:    stats.pendingClaims > 0
      ? 'bg-[oklch(18%_0.05_25)] border-[oklch(28%_0.08_25)]'
      : 'bg-[var(--color-base-800)] border-[var(--color-base-700)]',
    iconColor: stats.pendingClaims > 0 ? 'text-[oklch(65%_0.20_25)]' : 'text-[var(--color-base-500)]',
    valColor:  stats.pendingClaims > 0 ? 'text-[oklch(65%_0.20_25)]' : 'text-[var(--color-base-100)]',
  },
  {
    label:     'Approved Claims',
    value:     String(stats.approvedClaims),
    desc:      'settled or payout ready',
    icon:      FileCheck,
    iconBg:    'bg-[oklch(20%_0.05_150)] border-[oklch(30%_0.08_150)]',
    iconColor: 'text-[oklch(72%_0.17_150)]',
    valColor:  'text-[oklch(72%_0.17_150)]',
  },
];

export function PolicyPortfolioStats({ stats, userName }: PolicyPortfolioStatsProps) {
  const metrics = METRICS(stats);

  return (
    <div className="mb-8">
      {/* Personalized greeting banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[oklch(15%_0.08_230)] via-[oklch(12%_0.06_240)] to-[oklch(10%_0.04_250)] border border-[oklch(25%_0.08_230)] p-6 mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_center,oklch(25%_0.12_230_/_0.4),transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 w-48 h-24 bg-[radial-gradient(ellipse_at_center,oklch(20%_0.08_260_/_0.3),transparent_70%)]" />
        <div className="relative z-10">
          <p className="text-lg font-semibold text-[var(--color-base-100)] mb-1">
            Welcome back, {userName.split(' ')[0]} 👋
          </p>
          {stats.activePolicies > 0 ? (
            <p className="text-sm text-[var(--color-base-400)]">
              You are protected under{' '}
              <span className="text-[oklch(72%_0.20_230)] font-semibold">{stats.activePolicies} active {stats.activePolicies === 1 ? 'policy' : 'policies'}</span>{' '}
              worth{' '}
              <span className="text-[oklch(72%_0.17_150)] font-semibold">{formatCrore(stats.totalCoverage)}</span>{' '}
              in total coverage.
            </p>
          ) : (
            <p className="text-sm text-[var(--color-base-400)]">
              You currently have no active policies. Start protecting yourself today.
            </p>
          )}
          {stats.expiringSoon > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[oklch(18%_0.05_25)] border border-[oklch(28%_0.08_25)]">
              <AlertTriangle className="w-3.5 h-3.5 text-[oklch(65%_0.20_25)]" />
              <span className="text-xs text-[oklch(65%_0.20_25)] font-medium">
                {stats.expiringSoon} {stats.expiringSoon === 1 ? 'policy' : 'policies'} expiring within 90 days
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="stat-card p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${m.iconBg}`}>
                <Icon className={`w-4 h-4 ${m.iconColor}`} />
              </div>
              <div>
                <p className={`text-xl font-bold leading-none mb-1 ${m.valColor}`}>{m.value}</p>
                <p className="text-xs font-semibold text-[var(--color-base-300)]">{m.label}</p>
                <p className="text-[10px] text-[var(--color-base-600)] mt-0.5">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
