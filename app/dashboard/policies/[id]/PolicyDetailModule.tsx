'use client';
// ============================================================
// app/dashboard/policies/[id]/PolicyDetailModule.tsx
// Client-side shell for the Policy Detail page.
// Manages tab navigation: Overview, Claims, Timeline, Documents, Payments.
// Handles mock quick-actions like Renewal and Document Downloading.
// ============================================================

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ShieldCheck, Calendar, Clock, DollarSign,
  CheckCircle2, AlertTriangle, FileText, Info, RefreshCw,
  Banknote, Tag, ListChecks, Download, Plus, ArrowRight,
  UserCheck, ShieldAlert, FileDigit, HelpCircle, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  SerializedPurchasedPolicy, SerializedPolicy,
  SerializedClaim, SerializedClaimDocument, SerializedPayment, SerializedNotification, SerializedUser
} from '@/types';
import { PolicyType, PolicyStatus, ClaimStatus, DocumentStatus, PaymentStatus } from '@/lib/constants/enums';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { differenceInDays } from 'date-fns';

interface PolicyDetailModuleProps {
  purchasedPolicy: SerializedPurchasedPolicy;
  claims:          SerializedClaim[];
  documents:       SerializedClaimDocument[];
  payments:        SerializedPayment[];
  notifications:   SerializedNotification[];
}

type TabKey = 'overview' | 'claims' | 'timeline' | 'documents' | 'payments';

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

const STATUS_CONFIG: Record<PolicyStatus, { label: string; badge: string }> = {
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

const CLAIM_STATUS_CONFIG: Record<ClaimStatus, { label: string; badge: string }> = {
  [ClaimStatus.PENDING]: {
    label: 'Pending',
    badge: 'bg-[var(--color-base-800)] text-[var(--color-base-400)] border-[var(--color-base-750)]',
  },
  [ClaimStatus.SUBMITTED]: {
    label: 'Submitted',
    badge: 'bg-[oklch(18%_0.08_230_/_0.3)] text-[oklch(72%_0.20_230)] border-[oklch(28%_0.10_230_/_0.5)]',
  },
  [ClaimStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    badge: 'bg-[oklch(18%_0.05_75_/_0.3)] text-[oklch(78%_0.18_75)] border-[oklch(28%_0.08_75_/_0.5)]',
  },
  [ClaimStatus.DOCUMENT_VERIFICATION]: {
    label: 'Doc Verification',
    badge: 'bg-[oklch(18%_0.05_260_/_0.3)] text-[oklch(72%_0.15_260)] border-[oklch(28%_0.08_260_/_0.5)]',
  },
  [ClaimStatus.APPROVED]: {
    label: 'Approved',
    badge: 'bg-[oklch(20%_0.05_150_/_0.3)] text-[oklch(72%_0.17_150)] border-[oklch(30%_0.08_150_/_0.5)]',
  },
  [ClaimStatus.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-[oklch(18%_0.05_25_/_0.3)] text-[oklch(65%_0.20_25)] border-[oklch(28%_0.08_25_/_0.5)]',
  },
  [ClaimStatus.PAID]: {
    label: 'Settled Payout',
    badge: 'bg-[oklch(20%_0.05_150_/_0.3)] text-[oklch(72%_0.17_150)] border-[oklch(30%_0.08_150_/_0.5)]',
  },
};

const DOC_STATUS_CONFIG: Record<DocumentStatus, { label: string; badge: string }> = {
  [DocumentStatus.UPLOADED]: {
    label: 'Uploaded',
    badge: 'bg-[var(--color-base-800)] text-[var(--color-base-400)] border-[var(--color-base-700)]',
  },
  [DocumentStatus.VERIFIED]: {
    label: 'Verified',
    badge: 'bg-[oklch(20%_0.05_150_/_0.3)] text-[oklch(72%_0.17_150)] border-[oklch(30%_0.08_150_/_0.5)]',
  },
  [DocumentStatus.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-[oklch(18%_0.05_25_/_0.3)] text-[oklch(65%_0.20_25)] border-[oklch(28%_0.08_25_/_0.5)]',
  },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; badge: string }> = {
  [PaymentStatus.PENDING]: {
    label: 'Pending Payout',
    badge: 'bg-[var(--color-base-800)] text-[var(--color-base-400)] border-[var(--color-base-700)]',
  },
  [PaymentStatus.SUCCESS]: {
    label: 'Settled',
    badge: 'bg-[oklch(20%_0.05_150_/_0.3)] text-[oklch(72%_0.17_150)] border-[oklch(30%_0.08_150_/_0.5)]',
  },
  [PaymentStatus.FAILED]: {
    label: 'Failed Payout',
    badge: 'bg-[oklch(18%_0.05_25_/_0.3)] text-[oklch(65%_0.20_25)] border-[oklch(28%_0.08_25_/_0.5)]',
  },
};

export function PolicyDetailModule({
  purchasedPolicy,
  claims,
  documents,
  payments,
  notifications,
}: PolicyDetailModuleProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const policy = purchasedPolicy.policyId as SerializedPolicy;
  const cfg = TYPE_CONFIG[policy.type as PolicyType] ?? TYPE_CONFIG.HEALTH;
  const statusCfg = STATUS_CONFIG[purchasedPolicy.status] ?? STATUS_CONFIG[PolicyStatus.ACTIVE];

  const today = new Date();
  const endDate = new Date(purchasedPolicy.endDate);
  const startDate = new Date(purchasedPolicy.startDate);
  const daysRemaining = differenceInDays(endDate, today);
  const totalDays = differenceInDays(endDate, startDate);
  const progressPct = Math.min(100, Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100)));
  const isExpiringSoon = purchasedPolicy.status === PolicyStatus.ACTIVE && daysRemaining >= 0 && daysRemaining <= 90;
  const isExpired = purchasedPolicy.status === PolicyStatus.EXPIRED || daysRemaining < 0;
  const policyRef = `POL-${purchasedPolicy._id.slice(-8).toUpperCase()}`;

  // Gather unique assessors assigned to claims under this policy
  const assessors = useMemo(() => {
    const list: { name: string; email: string; specialization?: string }[] = [];
    const seen = new Set<string>();

    claims.forEach(c => {
      if (c.assignedAssessorId) {
        const assessor = c.assignedAssessorId as SerializedUser;
        if (assessor && !seen.has(assessor._id)) {
          seen.add(assessor._id);
          list.push({
            name: assessor.name,
            email: assessor.email,
            specialization: assessor.specialization,
          });
        }
      }
    });
    return list;
  }, [claims]);

  // Derive chronology timeline events
  const timelineEvents = useMemo(() => {
    const events: { date: Date; title: string; desc: string; type: string; color: string; icon: any }[] = [];

    // Event 1: Policy Purchased
    events.push({
      date: new Date(purchasedPolicy.startDate),
      title: 'Policy Purchased',
      desc: `You purchased the ${policy.name} plan. Premium of ${formatCurrency(policy.premiumAmount)}/mo commenced.`,
      type: 'PURCHASE',
      icon: ShieldCheck,
      color: 'text-[oklch(72%_0.17_150)] bg-[oklch(20%_0.05_150_/_0.2)] border-[oklch(30%_0.08_150)]',
    });

    // Event 2: Claims lifecycle
    claims.forEach(c => {
      events.push({
        date: new Date(c.createdAt),
        title: `Claim Filed: CLM-${c._id.slice(-8).toUpperCase()}`,
        desc: `Submitted claim for "${c.title}" worth ${formatCurrency(c.claimAmount)}.`,
        type: 'CLAIM_FILED',
        icon: FileText,
        color: 'text-[oklch(72%_0.20_230)] bg-[oklch(18%_0.08_230_/_0.2)] border-[oklch(28%_0.10_230)]',
      });

      if (c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.PAID) {
        events.push({
          date: new Date(c.updatedAt || c.createdAt),
          title: `Claim Approved`,
          desc: `Approved for settlement payout of ${formatCurrency(c.approvedAmount || c.claimAmount)}.`,
          type: 'CLAIM_APPROVED',
          icon: CheckCircle2,
          color: 'text-[oklch(72%_0.17_150)] bg-[oklch(20%_0.05_150_/_0.2)] border-[oklch(30%_0.08_150)]',
        });
      }

      if (c.status === ClaimStatus.REJECTED) {
        events.push({
          date: new Date(c.updatedAt || c.createdAt),
          title: `Claim Rejected`,
          desc: `Claim review completed and application was rejected by the assessment team.`,
          type: 'CLAIM_REJECTED',
          icon: ShieldAlert,
          color: 'text-[oklch(65%_0.20_25)] bg-[oklch(18%_0.05_25_/_0.2)] border-[oklch(28%_0.08_25)]',
        });
      }

      if (c.status === ClaimStatus.PAID) {
        events.push({
          date: new Date(c.updatedAt || c.createdAt),
          title: `Settlement Paid`,
          desc: `Settlement payout completed via registered payment mechanism.`,
          type: 'CLAIM_PAID',
          icon: Banknote,
          color: 'text-[oklch(72%_0.17_150)] bg-[oklch(20%_0.05_150_/_0.2)] border-[oklch(30%_0.08_150)]',
        });
      }
    });

    // Event 3: Policy Expiration
    events.push({
      date: new Date(purchasedPolicy.endDate),
      title: isExpired ? 'Policy Expired' : 'Coverage Expiration Scheduled',
      desc: isExpired ? 'Policy period concluded. Protection is currently inactive.' : 'Scheduled termination of current coverage period.',
      type: 'EXPIRY',
      icon: Clock,
      color: isExpired
        ? 'text-[oklch(65%_0.20_25)] bg-[oklch(18%_0.05_25_/_0.2)] border-[oklch(28%_0.08_25)]'
        : 'text-[var(--color-base-500)] bg-[var(--color-base-800)] border-[var(--color-base-700)]',
    });

    // Newest first
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [purchasedPolicy, claims, isExpired, policy.name, policy.premiumAmount]);

  function handleMockRenew() {
    toast.info('Policy renewal is handled automatically or via support. An agent will contact you 30 days before expiration.');
  }

  function handleMockDownload() {
    toast.success('Certificate of Insurance download started successfully!');
  }

  return (
    <div className="animate-fade-in">
      {/* ── Back Link ── */}
      <Link
        href="/dashboard/policies"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-base-500)] hover:text-[var(--color-base-200)] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to My Policies
      </Link>

      {/* ── Hero header ── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${cfg.gradient} via-[var(--color-base-900)] to-[var(--color-base-900)] border border-[var(--color-base-800)] p-6 mb-8`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
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
          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold ${statusCfg.badge}`}>
            ● {statusCfg.label}
          </span>
        </div>
      </div>

      {/* ── Main Layout grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ════════ LEFT MODULE (2/3) ════════ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Inner Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-[var(--color-base-800)] scrollbar-hide">
            {(['overview', 'claims', 'timeline', 'documents', 'payments'] as const).map(tabKey => {
              const label = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 border-b-2 -mb-[2px] ${
                    isActive
                      ? 'border-[var(--color-brand-500)] text-[var(--color-brand-300)] font-bold'
                      : 'border-transparent text-[var(--color-base-500)] hover:text-[var(--color-base-200)] hover:bg-[var(--color-base-850)]'
                  }`}
                >
                  {label}
                  {tabKey === 'claims' && claims.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--color-base-800)] text-[10px] text-[var(--color-base-400)]">
                      {claims.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="stat-card p-6">
                <h3 className="text-sm font-bold text-[var(--color-base-200)] mb-3">Policy Overview</h3>
                <p className="text-sm text-[var(--color-base-400)] leading-relaxed mb-6">
                  {policy.description || 'No description available for this policy template.'}
                </p>

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
                        <item.icon className="w-3 h-3" /> {item.label}
                      </p>
                      <p className={`text-sm ${item.valueClass}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress elapsed */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--color-base-500)]">Term Utilization</span>
                    <span className="text-[var(--color-base-300)] font-semibold">{progressPct}% elapsed</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-base-800)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isExpiringSoon
                          ? 'bg-gradient-to-r from-[oklch(65%_0.20_25)] to-[oklch(55%_0.22_25)]'
                          : isExpired
                          ? 'bg-[var(--color-base-700)]'
                          : `bg-gradient-to-r from-[oklch(58%_0.22_230)] to-[oklch(72%_0.20_230)]`
                      }`}
                      style={{ width: `${isExpired ? 100 : progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Benefits card */}
              <div className="stat-card p-6">
                <h3 className="text-sm font-bold text-[var(--color-base-200)] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[oklch(72%_0.17_150)]" />
                  Included Benefits & Coverage Items
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {cfg.benefits.map(benefit => (
                    <div key={benefit} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[oklch(72%_0.17_150)] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[var(--color-base-400)] leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions card */}
              <div className="stat-card p-6">
                <h3 className="text-sm font-bold text-[var(--color-base-200)] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-[oklch(65%_0.20_25)]" />
                  Coverage Exclusions & Limitations
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {cfg.exclusions.map(ex => (
                    <div key={ex} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(65%_0.20_25)] mt-2 flex-shrink-0" />
                      <span className="text-sm text-[var(--color-base-500)] leading-relaxed">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility card */}
              {policy.eligibility && policy.eligibility.length > 0 && (
                <div className="stat-card p-6">
                  <h3 className="text-sm font-bold text-[var(--color-base-200)] mb-4 flex items-center gap-2">
                    <Tag className="w-4.5 h-4.5 text-[var(--color-base-500)]" />
                    Eligibility Guidelines
                  </h3>
                  <div className="space-y-3">
                    {policy.eligibility.map((el, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[oklch(72%_0.20_230)] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[var(--color-base-400)] leading-relaxed">{el}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLAIMS */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              {claims.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 border border-[var(--color-base-800)] rounded-2xl bg-[var(--color-base-900)]">
                  <FileText className="w-12 h-12 text-[var(--color-base-650)] mb-4" />
                  <h4 className="text-base font-bold text-[var(--color-base-300)] mb-1">No claims filed yet</h4>
                  <p className="text-xs text-[var(--color-base-500)] text-center max-w-sm mb-6 leading-relaxed">
                    You haven&apos;t filed any claims under this policy. If you encountered an incident, submit a claim for assessment.
                  </p>
                  {purchasedPolicy.status === PolicyStatus.ACTIVE && (
                    <Link
                      href={`/dashboard/claims/file?policyId=${purchasedPolicy._id}`}
                      className="px-5 py-2.5 rounded-lg bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      File a Claim
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {claims.map(claim => {
                    const statusVal = CLAIM_STATUS_CONFIG[claim.status] ?? CLAIM_STATUS_CONFIG[ClaimStatus.PENDING];
                    const assessor = claim.assignedAssessorId as SerializedUser | null;
                    return (
                      <div key={claim._id} className="stat-card p-5 hover:border-[var(--color-brand-800)] transition-colors flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <span className="text-[10px] font-mono text-[var(--color-base-500)]">
                              CLM-{claim._id.slice(-8).toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${statusVal.badge}`}>
                              ● {statusCfg.label === 'Active' ? statusVal.label : 'Archived'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--color-base-100)] mb-1 leading-tight line-clamp-1">
                            {claim.title}
                          </h4>
                          <p className="text-xs text-[var(--color-base-500)] line-clamp-2 leading-relaxed mb-4">
                            {claim.description}
                          </p>
                        </div>
                        
                        <div className="mt-2 pt-3 border-t border-[var(--color-base-850)] flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[var(--color-base-500)]">Requested Amount</span>
                            <span className="font-semibold text-[var(--color-base-200)]">
                              {formatCurrency(claim.claimAmount)}
                            </span>
                          </div>
                          {(claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID) && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[var(--color-base-500)]">Approved Payout</span>
                              <span className="font-bold text-[oklch(72%_0.17_150)]">
                                {formatCurrency(claim.approvedAmount || claim.claimAmount)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] text-[var(--color-base-600)]">
                            <span>Incident Date: {formatDate(claim.incidentDate)}</span>
                            <span>Assessor: {assessor?.name || 'Under Assignment'}</span>
                          </div>

                          <Link
                            href={`/dashboard/claims/${claim._id}`}
                            className="mt-3 flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg bg-[var(--color-base-800)] hover:bg-[var(--color-base-750)] border border-[var(--color-base-700)] text-[var(--color-base-200)] text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Claim Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="stat-card p-6">
              <h3 className="text-sm font-bold text-[var(--color-base-200)] mb-6">Coverage & Claim Lifecycle Timeline</h3>
              
              <div className="relative pl-6 border-l border-[var(--color-base-800)] space-y-6">
                {timelineEvents.map((evt, idx) => {
                  const Icon = evt.icon;
                  return (
                    <div key={idx} className="relative">
                      {/* Floating Circle marker */}
                      <span className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${evt.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-[var(--color-base-500)] font-medium">
                            {formatDate(evt.date.toISOString())}
                          </span>
                          <span className="text-[var(--color-base-700)] text-[10px]">|</span>
                          <span className="text-xs font-bold text-[var(--color-base-200)]">
                            {evt.title}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                          {evt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 border border-[var(--color-base-800)] rounded-2xl bg-[var(--color-base-900)]">
                  <ListChecks className="w-12 h-12 text-[var(--color-base-650)] mb-4" />
                  <h4 className="text-base font-bold text-[var(--color-base-300)] mb-1">No claim documents uploaded</h4>
                  <p className="text-xs text-[var(--color-base-500)] text-center max-w-sm leading-relaxed">
                    Supporting documents are attached directly to claims. Submit a claim or edit an existing one to upload proofs (receipts, bills, certificates).
                  </p>
                </div>
              ) : (
                <div className="stat-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[var(--color-base-900)] border-b border-[var(--color-base-800)] text-[var(--color-base-500)]">
                          <th className="p-3.5 font-semibold">Document Name</th>
                          <th className="p-3.5 font-semibold">Associated Claim</th>
                          <th className="p-3.5 font-semibold">Upload Date</th>
                          <th className="p-3.5 font-semibold">Verification Status</th>
                          <th className="p-3.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-base-850)]">
                        {documents.map(doc => {
                          const docStatus = DOC_STATUS_CONFIG[doc.verificationStatus] ?? DOC_STATUS_CONFIG[DocumentStatus.UPLOADED];
                          return (
                            <tr key={doc._id} className="hover:bg-[var(--color-base-850)]/40 transition-colors">
                              <td className="p-3.5 font-medium text-[var(--color-base-200)] flex items-center gap-2">
                                <FileDigit className="w-4.5 h-4.5 text-[var(--color-base-550)]" />
                                {doc.documentName}
                              </td>
                              <td className="p-3.5 font-mono text-[var(--color-base-400)]">
                                <Link href={`/dashboard/claims/${doc.claimId}`} className="hover:text-[var(--color-brand-350)] underline transition-colors">
                                  CLM-{doc.claimId.slice(-8).toUpperCase()}
                                </Link>
                              </td>
                              <td className="p-3.5 text-[var(--color-base-450)]">
                                {formatDate(doc.createdAt)}
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${docStatus.badge}`}>
                                  ● {docStatus.label}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <a
                                  href={doc.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] font-semibold transition-colors"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)] flex items-start gap-3">
                <Info className="w-5 h-5 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
                  <p className="font-semibold mb-1">Important Note About Premium Payments</p>
                  The transactions shown here represent claim settlement payout checks issued to you. Premium payment billing history is administered through secure bank-mandate processors and is not displayed here.
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 border border-[var(--color-base-800)] rounded-2xl bg-[var(--color-base-900)]">
                  <Banknote className="w-12 h-12 text-[var(--color-base-650)] mb-4" />
                  <h4 className="text-base font-bold text-[var(--color-base-300)] mb-1">No claim payouts yet</h4>
                  <p className="text-xs text-[var(--color-base-500)] text-center max-w-sm leading-relaxed">
                    No claim settlement payouts have been processed under this policy. APPROVED claims will show settlement disbursements here once cleared.
                  </p>
                </div>
              ) : (
                <div className="stat-card overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--color-base-900)] border-b border-[var(--color-base-800)] text-[var(--color-base-500)]">
                        <th className="p-3.5 font-semibold">Transaction ID</th>
                        <th className="p-3.5 font-semibold">Amount Paid</th>
                        <th className="p-3.5 font-semibold">Payment Method</th>
                        <th className="p-3.5 font-semibold">Payout Date</th>
                        <th className="p-3.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-base-850)]">
                      {payments.map(payment => {
                        const payStatus = PAYMENT_STATUS_CONFIG[payment.status] ?? PAYMENT_STATUS_CONFIG[PaymentStatus.PENDING];
                        return (
                          <tr key={payment._id} className="hover:bg-[var(--color-base-850)]/40 transition-colors">
                            <td className="p-3.5 font-mono text-[var(--color-base-300)]">
                              TXN-{payment._id.slice(-10).toUpperCase()}
                            </td>
                            <td className="p-3.5 font-bold text-[oklch(72%_0.17_150)] text-sm">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="p-3.5 text-[var(--color-base-400)]">
                              {payment.paymentMethod}
                            </td>
                            <td className="p-3.5 text-[var(--color-base-450)]">
                              {payment.paymentDate ? formatDate(payment.paymentDate) : 'Processing'}
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${payStatus.badge}`}>
                                ● {payStatus.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════════ RIGHT SIDEBAR (1/3) ════════ */}
        <div className="space-y-5">
          
          {/* Quick Action card */}
          <div className="stat-card p-5">
            <h3 className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              {purchasedPolicy.status === PolicyStatus.ACTIVE ? (
                <Link
                  href={`/dashboard/claims/file?policyId=${purchasedPolicy._id}`}
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white text-sm font-semibold transition-colors shadow-[0_2px_12px_oklch(58%_0.22_230_/_0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  File a Claim
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-base-900)] text-[var(--color-base-600)] border border-[var(--color-base-800)] text-sm font-semibold cursor-not-allowed pointer-events-none"
                >
                  <Plus className="w-4 h-4" />
                  File Claim (Inactive Policy)
                </button>
              )}
              
              <button
                onClick={handleMockRenew}
                className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-base-800)] hover:bg-[var(--color-base-750)] border border-[var(--color-base-700)] text-[var(--color-base-200)] text-sm font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-[var(--color-base-500)]" />
                Renew Policy
              </button>
              <button
                onClick={handleMockDownload}
                className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl bg-[var(--color-base-800)] hover:bg-[var(--color-base-750)] border border-[var(--color-base-700)] text-[var(--color-base-200)] text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-[var(--color-base-500)]" />
                Certificate of Insurance
              </button>
            </div>
          </div>

          {/* Expiry Alert Card */}
          {isExpiringSoon && (
            <div className="p-4 rounded-xl bg-[oklch(18%_0.05_25)] border border-[oklch(28%_0.08_25)] animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[oklch(65%_0.20_25)]" />
                <p className="text-sm font-semibold text-[oklch(65%_0.20_25)]">Expiring Soon</p>
              </div>
              <p className="text-xs text-[oklch(55%_0.15_25)] leading-relaxed">
                This policy expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Renew now to prevent coverage interruptions.
              </p>
            </div>
          )}

          {/* Claims Assessors info section */}
          <div className="stat-card p-5">
            <h3 className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UserCheck className="w-4.5 h-4.5 text-[var(--color-base-500)]" />
              Claims Assessed By
            </h3>
            {assessors.length === 0 ? (
              <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                No claims have been assessed under this policy. Assessors are assigned individually per-claim upon filing.
              </p>
            ) : (
              <div className="space-y-4">
                {assessors.map(assessor => (
                  <div key={assessor.email} className="p-3 rounded-xl bg-[var(--color-base-950)]/60 border border-[var(--color-base-850)] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-base-800)] flex items-center justify-center font-bold text-xs text-[var(--color-base-350)]">
                      {assessor.name.split(' ').map(n => n.charAt(0)).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-base-200)]">
                        {assessor.name}
                      </h4>
                      <p className="text-[10px] text-[var(--color-base-500)]">
                        {assessor.specialization ? `${assessor.specialization} Assessor` : 'Claims Representative'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy Info metadata */}
          <div className="stat-card p-5">
            <h3 className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4">Policy Metadata</h3>
            <div className="space-y-3">
              {[
                { label: 'Reference No.',  value: policyRef },
                { label: 'Policy Template', value: policy.name },
                { label: 'Category',       value: `${policy.type} Insurance` },
                { label: 'Status',         value: purchasedPolicy.status },
                { label: 'Issue Date',     value: formatDate(purchasedPolicy.startDate) },
                { label: 'Valid Until',    value: formatDate(purchasedPolicy.endDate) },
              ].map(item => (
                <div key={item.label} className="border-b border-[var(--color-base-850)] last:border-b-0 pb-2.5 last:pb-0">
                  <p className="text-[10px] text-[var(--color-base-600)] uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-medium text-[var(--color-base-300)] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* General policy processing disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
            <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
              Standard claim turnaround processing is <strong>3–5 business days</strong>. Required supplementary claims proof documents can be uploaded at any time in the Documents tab.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
