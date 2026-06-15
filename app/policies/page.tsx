import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPolicies } from '@/services/policy.service';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';
import { PolicyType } from '@/lib/constants/enums';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Insurance Plans & Policies | InsuraCore',
  description: 'Explore our catalog of premium health, property, life, auto, and travel insurance plans.',
};

const TYPE_COLORS: Record<PolicyType, string> = {
  HEALTH:   'text-[oklch(72%_0.17_150)] bg-[oklch(20%_0.05_150)] border-[oklch(30%_0.08_150)]',
  AUTO:     'text-[oklch(78%_0.18_75)] bg-[oklch(20%_0.05_75)] border-[oklch(30%_0.08_75)]',
  PROPERTY: 'text-[oklch(72%_0.20_230)] bg-[oklch(18%_0.08_230)] border-[oklch(28%_0.10_230)]',
  LIFE:     'text-[oklch(65%_0.20_25)] bg-[oklch(18%_0.05_25)] border-[oklch(28%_0.08_25)]',
  TRAVEL:   'text-[oklch(72%_0.15_260)] bg-[oklch(18%_0.05_260)] border-[oklch(28%_0.08_260)]',
};

export default async function PublicPoliciesPage() {
  const policies = await getAllPolicies(true); // only active policies

  return (
    <div className="min-h-screen bg-[var(--color-base-950)] text-[var(--color-base-200)] pb-20">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-base-800)] bg-[var(--color-base-950)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center glow-brand">
              <span className="text-white font-black text-xs tracking-tight">IC</span>
            </div>
            <span className="font-bold text-lg text-[var(--color-base-100)] tracking-tight">
              InsuraCore
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-base-400)] hover:text-[var(--color-base-200)] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_16px_oklch(58%_0.22_230_/_0.3)]"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-base-100)] leading-tight">
          Insurance Plans Tailored to <span className="gradient-text">Your Needs</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[var(--color-base-400)] max-w-xl mx-auto leading-relaxed">
          Compare our industry-leading policies and purchase coverage instantly. Sign in to start protecting your assets.
        </p>
      </header>

      {/* ── POLICY GRID ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => {
            const typeClass = TYPE_COLORS[policy.type as PolicyType] ?? '';
            return (
              <div key={policy._id} className="glass-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-4 ${typeClass}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {policy.type}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-base-100)] mb-2">{policy.name}</h3>
                  <p className="text-sm text-[var(--color-base-500)] leading-relaxed mb-6 line-clamp-3">
                    {policy.description}
                  </p>
                </div>

                <div>
                  <div className="space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-4 mb-5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-base-500)]">Monthly Premium</span>
                      <span className="font-bold text-[var(--color-base-100)]">{formatCurrency(policy.premiumAmount)}<span className="text-[var(--color-base-500)] font-normal">/mo</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-base-500)]">Coverage limit up to</span>
                      <span className="font-semibold text-[oklch(72%_0.20_230)]">{formatCurrency(policy.coverageAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-base-500)]">Validity Period</span>
                      <span className="text-[var(--color-base-300)]">{policy.validityPeriod} months</span>
                    </div>
                  </div>

                  <Link href="/register" className="block w-full">
                    <Button className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Get Covered
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
