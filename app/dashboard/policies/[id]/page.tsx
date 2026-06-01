// ============================================================
// app/dashboard/policies/[id]/page.tsx
// Premium policy detail page: full policy info, benefits,
// eligibility, renewal info, and file-claim CTA.
// Route: /dashboard/policies/[purchasedPolicyId]
// ============================================================

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { DashboardShell } from '@/components/shared/DashboardShell';
import Link from 'next/link';
import {
  ChevronLeft, ShieldCheck, Calendar, Clock, DollarSign,
  CheckCircle2, AlertTriangle, FileText, Info, RefreshCw,
  Banknote, Tag, ListChecks,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { PolicyStatus, PolicyType } from '@/lib/constants/enums';
import { SerializedPolicy } from '@/types';
import { differenceInDays } from 'date-fns';
import { connectDB } from '@/lib/db/mongoose';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import Policy from '@/models/Policy';

export const metadata: Metadata = { title: 'Policy Details | InsuraCore' };

// Per-type design tokens
const TYPE_CONFIG: Record<PolicyType, {
  gradient: string; badgeBg: string; badgeText: string; badgeBorder: string;
  icon: string; benefits: string[]; exclusions: string[];
}> = {
  HEALTH: {
    gradient: 'from-[oklch(20%_0.05_150_/_0.5)]', badgeBg: 'bg-[oklch(20%_0.05_150)]',
    badgeText: 'text-[oklch(72%_0.17_150)]', badgeBorder: 'border-[oklch(30%_0.08_150)]',
    icon: '🏥',
    benefits: ['Hospitalisation cover up to policy limit', 'Pre & post hospitalisation expenses', 'Day-care procedures', 'Ambulance charges', 'Organ donor expenses', 'Mental health treatment'],
    exclusions: ['Pre-existing conditions (first 2 years)', 'Cosmetic surgery', 'Self-inflicted injuries', 'Dental treatment (unless accidental)', 'Experimental treatments'],
  },
  AUTO: {
    gradient: 'from-[oklch(20%_0.05_75_/_0.5)]', badgeBg: 'bg-[oklch(20%_0.05_75)]',
    badgeText: 'text-[oklch(78%_0.18_75)]', badgeBorder: 'border-[oklch(30%_0.08_75)]',
    icon: '🚗',
    benefits: ['Own damage protection', 'Third-party liability (legally mandatory)', 'Theft cover', 'Natural calamity damage', 'Personal accident cover for owner-driver', 'Zero depreciation add-on eligible'],
    exclusions: ['Drunk driving', 'Driving without valid licence', 'Wear and tear', 'Mechanical/electrical breakdown', 'War or nuclear hazards'],
  },
  PROPERTY: {
    gradient: 'from-[oklch(18%_0.08_230_/_0.5)]', badgeBg: 'bg-[oklch(18%_0.08_230)]',
    badgeText: 'text-[oklch(72%_0.20_230)]', badgeBorder: 'border-[oklch(28%_0.10_230)]',
    icon: '🏠',
    benefits: ['Fire and allied perils', 'Flood and inundation cover', 'Earthquake damage', 'Theft and burglary', 'Structural damage cover', 'Temporary accommodation expenses'],
    exclusions: ['Wear and tear', 'Wilful destruction', 'War or nuclear risks', 'Properties left unoccupied for 60+ days', 'Pre-existing defects'],
  },
  LIFE: {
    gradient: 'from-[oklch(18%_0.05_25_/_0.5)]', badgeBg: 'bg-[oklch(18%_0.05_25)]',
    badgeText: 'text-[oklch(65%_0.20_25)]', badgeBorder: 'border-[oklch(28%_0.08_25)]',
    icon: '❤️',
    benefits: ['Death benefit (sum assured)', 'Terminal illness benefit', 'Accidental death benefit rider', 'Premium waiver on disability', 'Loan against policy eligible', 'Tax benefits under 80C & 10(10D)'],
    exclusions: ['Suicide within first year', 'Death due to intoxication', 'Hazardous activities', 'Fraudulent disclosure', 'War or civil disturbance'],
  },
  TRAVEL: {
    gradient: 'from-[oklch(18%_0.05_260_/_0.5)]', badgeBg: 'bg-[oklch(18%_0.05_260)]',
    badgeText: 'text-[oklch(72%_0.15_260)]', badgeBorder: 'border-[oklch(28%_0.08_260)]',
    icon: '✈️',
    benefits: ['Emergency medical expenses abroad', 'Trip cancellation / curtailment', 'Baggage loss and delay', 'Passport loss assistance', 'Personal accident cover', 'Flight delay compensation'],
    exclusions: ['Pre-existing medical conditions', 'Adventure sports (unless add-on)', 'Travel to high-risk countries', 'Self-inflicted illness', 'Pregnancy-related claims'],
  },
};

// Direct DB fetch for a purchased policy by its _id
async function getPurchasedPolicyById(purchasedId: string, userId: string) {
  await connectDB();
  try {
    const pp = await PurchasedPolicy.findOne({ _id: purchasedId, userId }).populate('policyId');
    return pp;
  } catch {
    return null;
  }
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const purchasedPolicy = await getPurchasedPolicyById(id, session.id);
  if (!purchasedPolicy) notFound();

  const policy = purchasedPolicy.policyId as unknown as SerializedPolicy & {
    name: string; type: PolicyType; description: string;
    premiumAmount: number; coverageAmount: number;
    validityPeriod: number; eligibility: string[];
  };

  const cfg = TYPE_CONFIG[policy.type as PolicyType] ?? TYPE_CONFIG.HEALTH;
  const today = new Date();
  const endDate = new Date(purchasedPolicy.endDate);
  const startDate = new Date(purchasedPolicy.startDate);
  const daysRemaining = differenceInDays(endDate, today);
  const totalDays = differenceInDays(endDate, startDate);
  const progressPct = Math.min(100, Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100)));
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 90;
  const isExpired = daysRemaining < 0;
  const policyRef = `POL-${(purchasedPolicy._id as { toString(): string }).toString().slice(-8).toUpperCase()}`;

  return (
    <DashboardShell>
      {/* ── Back ─────────────────────────────────── */}
      <Link
        href="/dashboard/policies"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-base-500)] hover:text-[var(--color-base-200)] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to My Policies
      </Link>

      {/* ── Hero header ──────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${cfg.gradient} via-[var(--color-base-900)] to-[var(--color-base-900)] border border-[var(--color-base-800)] p-6 mb-8`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeBorder}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-xs font-mono text-[var(--color-base-500)] mb-1">{policyRef}</p>
              <h1 className="text-xl font-bold text-[var(--color-base-100)]">{policy.name}</h1>
              <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
                <ShieldCheck className="w-2.5 h-2.5" />
                {policy.type} Insurance
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] text-sm font-semibold text-[oklch(72%_0.17_150)]">
            <CheckCircle2 className="w-4 h-4" />
            Active Policy
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ════════ MAIN (2/3) ════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Overview */}
          <div className="stat-card p-6">
            <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-4">Policy Overview</h2>
            <p className="text-sm text-[var(--color-base-400)] leading-relaxed mb-6">{policy.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Coverage Amount', value: formatCurrency(policy.coverageAmount), icon: ShieldCheck, valueClass: `font-bold ${cfg.badgeText}` },
                { label: 'Monthly Premium', value: `${formatCurrency(policy.premiumAmount)}/mo`, icon: DollarSign, valueClass: 'font-bold text-[var(--color-base-100)]' },
                { label: 'Validity Period', value: `${policy.validityPeriod} months`, icon: Clock, valueClass: 'font-semibold text-[var(--color-base-200)]' },
                { label: 'Start Date', value: formatDate(purchasedPolicy.startDate), icon: Calendar, valueClass: 'font-medium text-[var(--color-base-300)]' },
                { label: 'Expiry Date', value: formatDate(purchasedPolicy.endDate), icon: Calendar, valueClass: `font-medium ${isExpiringSoon ? 'text-[oklch(65%_0.20_25)]' : 'text-[var(--color-base-300)]'}` },
                { label: 'Days Remaining', value: isExpired ? 'Expired' : `${daysRemaining} days`, icon: Clock, valueClass: `font-bold ${isExpiringSoon ? 'text-[oklch(65%_0.20_25)]' : 'text-[var(--color-base-100)]'}` },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
                  <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <item.icon className="w-2.5 h-2.5" /> {item.label}
                  </p>
                  <p className={`text-sm ${item.valueClass}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Time progress */}
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--color-base-500)]">Policy Duration Used</span>
                <span className="text-[var(--color-base-400)] font-medium">{progressPct}% elapsed</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-base-800)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${isExpiringSoon ? 'bg-gradient-to-r from-[oklch(65%_0.20_25)] to-[oklch(55%_0.22_25)]' : `bg-gradient-to-r from-[oklch(58%_0.22_230)] to-[oklch(72%_0.20_230)]`}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="stat-card p-6">
            <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[oklch(72%_0.17_150)]" />
              What's Covered
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {cfg.benefits.map(benefit => (
                <div key={benefit} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(72%_0.17_150)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[var(--color-base-400)]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="stat-card p-6">
            <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[oklch(65%_0.20_25)]" />
              Exclusions
            </h2>
            <div className="space-y-2.5">
              {cfg.exclusions.map(ex => (
                <div key={ex} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(65%_0.20_25)] mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-[var(--color-base-500)]">{ex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          {policy.eligibility && policy.eligibility.length > 0 && (
            <div className="stat-card p-6">
              <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[var(--color-base-500)]" />
                Eligibility Criteria
              </h2>
              <div className="space-y-2">
                {policy.eligibility.map((e: string) => (
                  <div key={e} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(72%_0.20_230)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-base-400)]">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ════════ SIDEBAR (1/3) ════════ */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="stat-card p-5">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/claims/file"
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-sm font-semibold transition-colors shadow-[0_2px_12px_oklch(58%_0.22_230_/_0.3)]"
              >
                <FileText className="w-4 h-4" />
                File a Claim
              </Link>
              <button className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] border border-[var(--color-base-700)] text-[var(--color-base-200)] text-sm font-semibold transition-colors">
                <RefreshCw className="w-4 h-4" />
                Renew Policy
              </button>
              <button className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] border border-[var(--color-base-700)] text-[var(--color-base-200)] text-sm font-semibold transition-colors">
                <Banknote className="w-4 h-4" />
                Download Policy Doc
              </button>
            </div>
          </div>

          {/* Expiry warning */}
          {isExpiringSoon && (
            <div className="p-4 rounded-xl bg-[oklch(18%_0.05_25)] border border-[oklch(28%_0.08_25)]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[oklch(65%_0.20_25)]" />
                <p className="text-sm font-semibold text-[oklch(65%_0.20_25)]">Expiring Soon</p>
              </div>
              <p className="text-xs text-[oklch(55%_0.15_25)] leading-relaxed">
                This policy expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Renew now to avoid a coverage gap.
              </p>
            </div>
          )}

          {/* Policy metadata */}
          <div className="stat-card p-5">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4">Policy Information</p>
            <div className="space-y-3">
              {[
                { label: 'Reference No.',  value: policyRef },
                { label: 'Policy Name',    value: policy.name },
                { label: 'Category',       value: `${policy.type} Insurance` },
                { label: 'Status',         value: purchasedPolicy.status },
                { label: 'Issue Date',     value: formatDate(purchasedPolicy.startDate) },
                { label: 'Valid Until',    value: formatDate(purchasedPolicy.endDate) },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-[var(--color-base-600)] uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-medium text-[var(--color-base-300)] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
            <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
              Claims are processed within <strong>3–5 business days</strong>. Ensure supporting documents are uploaded promptly.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
