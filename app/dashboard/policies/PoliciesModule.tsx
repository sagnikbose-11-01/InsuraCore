'use client';
// ============================================================
// app/dashboard/policies/PoliciesModule.tsx
// Client-side shell for the My Policies page.
// Owns the Active / Available tab state.
// All data is pre-fetched by the Server Component.
// ============================================================

import { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { PolicyPortfolioStats } from '@/components/policies/PolicyPortfolioStats';
import { ActivePolicyCard } from '@/components/policies/ActivePolicyCard';
import { AvailablePlanCard } from '@/components/policies/AvailablePlanCard';
import { PolicyInsights } from '@/components/policies/PolicyInsights';
import { PoliciesEmptyState } from '@/components/policies/PoliciesEmptyState';
import { SerializedPurchasedPolicy, SerializedPolicy } from '@/types';
import { PolicyStatus, PolicyType } from '@/lib/constants/enums';

interface PortfolioStats {
  activePolicies: number;
  totalCoverage: number;
  monthlyPremium: number;
  totalClaims: number;
  expiringSoon: number;
}

interface PoliciesModuleProps {
  myPolicies:        SerializedPurchasedPolicy[];
  availablePolicies: SerializedPolicy[];
  stats:             PortfolioStats;
  userName:          string;
}

type Tab = 'active' | 'available';

export function PoliciesModule({
  myPolicies,
  availablePolicies,
  stats,
  userName,
}: PoliciesModuleProps) {
  const [tab, setTab] = useState<Tab>('active');

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
          Your Active Protection
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border border-[oklch(28%_0.10_230)]">
            {activePolicies.length}
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
          {activePolicies.length === 0 ? (
            <PoliciesEmptyState />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                {activePolicies.map(p => (
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
              <p className="text-sm text-[var(--color-base-500)]">No plans available at the moment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
