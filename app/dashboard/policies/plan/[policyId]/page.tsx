// ============================================================
// app/dashboard/policies/plan/[policyId]/page.tsx
// Pre-purchase policy details page.
// Fetches a Policy TEMPLATE (not a PurchasedPolicy) so any
// logged-in customer can review a plan before buying.
// Route: /dashboard/policies/plan/[policyId]
// ============================================================

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getPolicyById, getMyPolicies } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import Link from 'next/link';
import {
  ChevronLeft, ShieldCheck, DollarSign, Clock, CheckCircle2,
  AlertTriangle, ArrowRight, Sparkles, Info, ListChecks, Tag,
  Star, Users, TrendingUp, ShieldAlert
} from 'lucide-react';
import { PolicyStatus, PolicyType } from '@/lib/constants/enums';
import { SerializedPolicy } from '@/types';

export const metadata: Metadata = { title: 'Plan Details | InsuraCore' };

// ── Per-type config ──────────────────────────────────────────

const TYPE_CONFIG: Record<PolicyType, {
  gradient: string; heroBg: string;
  badgeBg: string; badgeText: string; badgeBorder: string;
  icon: string; tagline: string; recommendation: string;
  benefits: { title: string; desc: string }[];
  exclusions: string[];
}> = {
  HEALTH: {
    gradient: 'from-[oklch(20%_0.06_150_/_0.7)] via-[oklch(12%_0.03_150_/_0.3)]',
    heroBg: 'bg-[oklch(15%_0.05_150_/_0.2)]',
    badgeBg: 'bg-[oklch(20%_0.05_150)]', badgeText: 'text-[oklch(72%_0.17_150)]', badgeBorder: 'border-[oklch(30%_0.08_150)]',
    icon: '🏥', tagline: 'Comprehensive medical protection for you and your family.',
    recommendation: 'Recommended for individuals aged 18–55 seeking broad medical coverage without high out-of-pocket expenses.',
    benefits: [
      { title: 'Hospitalisation Cover', desc: 'Covers in-patient treatment, surgery, and ICU charges up to the policy limit.' },
      { title: 'Pre & Post Hospitalisation', desc: '30 days pre and 60 days post hospitalisation expenses covered.' },
      { title: 'Day-Care Procedures', desc: 'Over 500 day-care treatments covered without 24-hour admission requirement.' },
      { title: 'Ambulance Charges', desc: 'Emergency ambulance charges up to ₹2,000 per hospitalisation.' },
      { title: 'Mental Health Cover', desc: 'In-patient mental health treatment covered as per IRDAI guidelines.' },
      { title: 'Organ Donor Expenses', desc: 'Medical expenses of organ donor covered during harvesting procedure.' },
    ],
    exclusions: ['Pre-existing conditions (first 2 years)', 'Cosmetic or aesthetic surgery', 'Self-inflicted injuries', 'Dental treatment unless accidental', 'Experimental or unproven treatments', 'Non-allopathic treatments'],
  },
  AUTO: {
    gradient: 'from-[oklch(20%_0.06_75_/_0.7)] via-[oklch(12%_0.03_75_/_0.3)]',
    heroBg: 'bg-[oklch(15%_0.05_75_/_0.2)]',
    badgeBg: 'bg-[oklch(20%_0.05_75)]', badgeText: 'text-[oklch(78%_0.18_75)]', badgeBorder: 'border-[oklch(30%_0.08_75)]',
    icon: '🚗', tagline: 'Full-spectrum vehicle protection on and off the road.',
    recommendation: 'Recommended for vehicle owners who want comprehensive cover beyond the legally mandatory third-party liability.',
    benefits: [
      { title: 'Own Damage Protection', desc: 'Covers repair costs for damage to your vehicle from accidents or calamities.' },
      { title: 'Third-Party Liability', desc: 'Legally mandatory cover for injury or property damage to third parties.' },
      { title: 'Theft Cover', desc: 'Full IDV reimbursement in case of vehicle theft or total loss.' },
      { title: 'Natural Calamities', desc: 'Damage from floods, earthquakes, cyclones, and other acts of god.' },
      { title: 'Personal Accident', desc: '₹15 lakh personal accident cover for the owner-driver.' },
      { title: 'Zero Depreciation Add-on', desc: 'Eligible for zero-dep add-on — claim full repair cost without depreciation cuts.' },
    ],
    exclusions: ['Driving under influence of alcohol or drugs', 'Driving without valid licence', 'Mechanical or electrical breakdown', 'Tyre and tube damage unless accident', 'War or nuclear hazard damage'],
  },
  PROPERTY: {
    gradient: 'from-[oklch(18%_0.08_230_/_0.7)] via-[oklch(12%_0.04_230_/_0.3)]',
    heroBg: 'bg-[oklch(13%_0.05_230_/_0.2)]',
    badgeBg: 'bg-[oklch(18%_0.08_230)]', badgeText: 'text-[oklch(72%_0.20_230)]', badgeBorder: 'border-[oklch(28%_0.10_230)]',
    icon: '🏠', tagline: 'Protect your home and its contents against life\'s uncertainties.',
    recommendation: 'Best suited for homeowners and tenants seeking protection against structural damage, fire, and burglary.',
    benefits: [
      { title: 'Fire & Allied Perils', desc: 'Covers fire, lightning, explosion, and allied perils up to the sum insured.' },
      { title: 'Flood & Inundation', desc: 'Damage caused by flooding, rain, and water overflow from drains.' },
      { title: 'Earthquake Damage', desc: 'Structural damage from earthquakes and volcanic activity.' },
      { title: 'Theft & Burglary', desc: 'Loss of contents due to theft or attempted burglary.' },
      { title: 'Structural Damage', desc: 'Collapse of walls, roofing, or foundations due to covered perils.' },
      { title: 'Temporary Accommodation', desc: 'Up to ₹50,000 for alternative accommodation while repairs are done.' },
    ],
    exclusions: ['Wear and tear or gradual deterioration', 'Wilful destruction or negligence', 'War, invasion, or nuclear risks', 'Properties unoccupied for 60+ consecutive days', 'Pre-existing structural defects'],
  },
  LIFE: {
    gradient: 'from-[oklch(18%_0.06_25_/_0.7)] via-[oklch(12%_0.03_25_/_0.3)]',
    heroBg: 'bg-[oklch(13%_0.04_25_/_0.2)]',
    badgeBg: 'bg-[oklch(18%_0.05_25)]', badgeText: 'text-[oklch(65%_0.20_25)]', badgeBorder: 'border-[oklch(28%_0.08_25)]',
    icon: '❤️', tagline: 'Secure your family\'s financial future, no matter what.',
    recommendation: 'Recommended for earning members with financial dependants seeking long-term family protection and tax savings.',
    benefits: [
      { title: 'Death Benefit', desc: 'Lump-sum payment of sum assured to nominees upon policyholder\'s death.' },
      { title: 'Terminal Illness Benefit', desc: '100% of sum assured paid on diagnosis of specified terminal illness.' },
      { title: 'Accidental Death Rider', desc: 'Additional payout equal to sum assured on accidental death.' },
      { title: 'Premium Waiver on Disability', desc: 'All future premiums waived if policyholder becomes permanently disabled.' },
      { title: 'Loan Against Policy', desc: 'Borrow up to 90% of surrender value after 3 policy years.' },
      { title: 'Tax Benefits', desc: 'Premium deduction under Section 80C and maturity amount exempt under 10(10D).' },
    ],
    exclusions: ['Suicide within the first policy year', 'Death due to intoxication or substance abuse', 'Participation in hazardous activities', 'Material non-disclosure or fraud', 'Death during war or civil disturbance'],
  },
  TRAVEL: {
    gradient: 'from-[oklch(18%_0.06_260_/_0.7)] via-[oklch(12%_0.03_260_/_0.3)]',
    heroBg: 'bg-[oklch(13%_0.04_260_/_0.2)]',
    badgeBg: 'bg-[oklch(18%_0.05_260)]', badgeText: 'text-[oklch(72%_0.15_260)]', badgeBorder: 'border-[oklch(28%_0.08_260)]',
    icon: '✈️', tagline: 'Travel without worry — covered from takeoff to touchdown.',
    recommendation: 'Recommended for frequent international travellers or anyone planning an overseas trip lasting more than 5 days.',
    benefits: [
      { title: 'Emergency Medical Abroad', desc: 'Covers hospitalisation, surgery, and emergency care outside India.' },
      { title: 'Trip Cancellation', desc: 'Reimbursement for non-refundable bookings if trip is cancelled due to covered reasons.' },
      { title: 'Baggage Loss & Delay', desc: 'Compensation for lost, stolen, or delayed baggage beyond 12 hours.' },
      { title: 'Passport Loss', desc: 'Emergency assistance and expenses related to passport loss abroad.' },
      { title: 'Personal Accident', desc: 'Accidental death and permanent disability cover during the trip.' },
      { title: 'Flight Delay Compensation', desc: 'Cash compensation for flight delays exceeding 6 hours.' },
    ],
    exclusions: ['Pre-existing medical conditions (unless declared)', 'Adventure or extreme sports without add-on', 'Travel to FCDO-advised high-risk countries', 'Pregnancy-related claims after 32 weeks', 'Self-inflicted illness or injuries'],
  },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { policyId } = await params;

  // Fetch the policy TEMPLATE, not a purchased policy
  const [policy, myPolicies] = await Promise.all([
    getPolicyById(policyId),
    getMyPolicies(session.id),
  ]);

  if (!policy) notFound();

  const cfg = TYPE_CONFIG[policy.type as PolicyType] ?? TYPE_CONFIG.HEALTH;

  // Check if the user already owns this policy template
  const isOwned = myPolicies.some(
    p => (p.policyId as SerializedPolicy)._id === policy._id && p.status === PolicyStatus.ACTIVE
  );

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

      {/* ── HERO ─────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} to-[var(--color-base-950)] border border-[var(--color-base-800)] p-8 mb-8`}>
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-32 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />

        <div className="relative z-10">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeBorder}`}>
              {cfg.icon}
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-1.5 ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
                <ShieldCheck className="w-3 h-3" />
                {policy.type} Insurance
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-base-100)] leading-tight">{policy.name}</h1>
            </div>
            {isOwned ? (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] text-xs font-semibold text-[oklch(72%_0.17_150)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Already Owned
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[oklch(20%_0.05_75)] border border-[oklch(30%_0.08_75)] text-xs font-semibold text-[oklch(78%_0.18_75)]">
                <Sparkles className="w-3.5 h-3.5" />
                Available
              </span>
            )}
          </div>

          {/* Tagline */}
          <p className="text-base text-[var(--color-base-300)] mb-6 max-w-xl leading-relaxed">{cfg.tagline}</p>

          {/* 3 key metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { label: 'Coverage', value: formatCurrency(policy.coverageAmount), icon: ShieldCheck, color: cfg.badgeText },
              { label: 'Premium', value: `${formatCurrency(policy.premiumAmount)}/mo`, icon: DollarSign, color: 'text-[var(--color-base-100)]' },
              { label: 'Validity', value: `${policy.validityPeriod} months`, icon: Clock, color: 'text-[var(--color-base-200)]' },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.07)]">
                <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <m.icon className="w-2.5 h-2.5" /> {m.label}
                </p>
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-7">
            {!isOwned && (
              <Link
                href={`/dashboard/policies/purchase/${policy._id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-semibold text-sm transition-all shadow-[0_4px_20px_oklch(58%_0.22_230_/_0.4)] hover:shadow-[0_6px_28px_oklch(58%_0.22_230_/_0.55)]"
              >
                Purchase This Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/dashboard/policies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-base-600)] text-[var(--color-base-300)] hover:border-[var(--color-base-500)] hover:text-[var(--color-base-100)] font-semibold text-sm transition-all"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ════ MAIN (2/3) ════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div className="stat-card p-6">
            <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-3">About This Plan</h2>
            <p className="text-sm text-[var(--color-base-400)] leading-relaxed">{policy.description}</p>
          </div>

          {/* Benefits */}
          <div className="stat-card p-6">
            <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-5 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[oklch(72%_0.17_150)]" />
              What&apos;s Covered
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {cfg.benefits.map(b => (
                <div key={b.title} className="flex gap-3 p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
                  <CheckCircle2 className="w-4 h-4 text-[oklch(72%_0.17_150)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-base-200)] mb-0.5">{b.title}</p>
                    <p className="text-[11px] text-[var(--color-base-500)] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="stat-card p-6">
            <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[oklch(65%_0.20_25)]" />
              What&apos;s Not Covered
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {policy.eligibility && policy.eligibility.length > 0 && (
                <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl relative overflow-hidden group hover:border-[oklch(72%_0.20_230)]/30 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[oklch(72%_0.20_230)]/50 group-hover:bg-[oklch(72%_0.20_230)] transition-colors" />
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[oklch(72%_0.20_230)]" />
                    Eligibility & Rules
                  </h3>
                  <ul className="space-y-3">
                    {policy.eligibility.map((e: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-base-300)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(72%_0.20_230)] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {policy.benefits && policy.benefits.length > 0 && (
                <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors" />
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-3">
                    {policy.benefits.map((e: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-base-300)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {policy.exclusions && policy.exclusions.length > 0 && (
                <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-500 transition-colors" />
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    Exclusions
                  </h3>
                  <ul className="space-y-3">
                    {policy.exclusions.map((e: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-base-300)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
              <div className="grid sm:grid-cols-2 gap-2.5">
                {policy.eligibility.map(e => (
                  <div key={e} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(72%_0.20_230)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-base-400)]">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* T&C accordion */}
          <details className="stat-card group" open={false}>
            <summary className="px-6 py-4 flex items-center justify-between cursor-pointer list-none select-none">
              <span className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider">
                Terms &amp; Conditions
              </span>
              <span className="text-[var(--color-base-500)] text-xs group-open:hidden">▼ Expand</span>
              <span className="text-[var(--color-base-500)] text-xs hidden group-open:inline">▲ Collapse</span>
            </summary>
            <div className="px-6 pb-6 pt-2 border-t border-[var(--color-base-800)] space-y-3 text-xs text-[var(--color-base-500)] leading-relaxed">
              <p>1. This policy is subject to the terms, conditions, and exclusions stated in the policy document.</p>
              <p>2. The policyholder must disclose all material facts truthfully at the time of proposal. Concealment may result in claim denial.</p>
              <p>3. Claims must be intimated within the stipulated time period as per the policy schedule.</p>
              <p>4. InsuraCore reserves the right to investigate claims and request additional documentation.</p>
              <p>5. This policy is governed by the laws of India and any disputes shall be subject to the jurisdiction of Indian courts.</p>
              <p>6. Premiums paid are inclusive of applicable taxes as per current regulations.</p>
              <p>7. Policy renewal is not guaranteed and is subject to the company&apos;s underwriting guidelines at the time of renewal.</p>
            </div>
          </details>

          {/* Purchase CTA bottom */}
          {!isOwned && (
            <div className="stat-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[var(--color-base-100)] mb-1">Ready to get covered?</p>
                <p className="text-xs text-[var(--color-base-500)]">Complete your purchase in under 2 minutes.</p>
              </div>
              <Link
                href={`/dashboard/policies/purchase/${policy._id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-semibold text-sm transition-all shadow-[0_4px_20px_oklch(58%_0.22_230_/_0.35)] hover:shadow-[0_6px_28px_oklch(58%_0.22_230_/_0.5)] flex-shrink-0"
              >
                Purchase This Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* ════ SIDEBAR (1/3) ════ */}
        <div className="space-y-5">

          {/* Smart recommendation */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[oklch(78%_0.18_75)]" />
              <p className="text-xs font-semibold text-[oklch(78%_0.18_75)] uppercase tracking-wider">Smart Match</p>
            </div>
            <p className="text-xs text-[var(--color-base-400)] leading-relaxed">{cfg.recommendation}</p>
          </div>

          {/* Premium breakdown */}
          <div className="stat-card p-5">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4">Premium Details</p>
            <div className="space-y-3">
              {[
                { label: 'Monthly Premium',    value: `${formatCurrency(policy.premiumAmount)}/mo` },
                { label: 'Annual Premium',     value: formatCurrency(policy.premiumAmount * 12) },
                { label: 'Coverage Amount',    value: formatCurrency(policy.coverageAmount) },
                { label: 'Plan Validity',      value: `${policy.validityPeriod} months` },
                { label: 'Renewal',            value: 'Annual, guaranteed' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-base-500)]">{item.label}</span>
                  <span className="font-semibold text-[var(--color-base-200)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div className="stat-card p-5">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-4">Why InsuraCore?</p>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, text: '98.2% claim settlement ratio' },
                { icon: Users,      text: '2M+ policyholders trust us' },
                { icon: CheckCircle2, text: 'IRDAI regulated & compliant' },
                { icon: Clock,      text: '24/7 claim support' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2.5 text-xs text-[var(--color-base-400)]">
                  <item.icon className="w-3.5 h-3.5 text-[oklch(72%_0.20_230)] flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
            <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
              This is a demo environment. No real payment will be processed.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
