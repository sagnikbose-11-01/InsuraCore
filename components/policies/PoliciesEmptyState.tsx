'use client';
// ============================================================
// components/policies/PoliciesEmptyState.tsx
// Premium empty state when user has no policies at all.
// ============================================================

import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export function PoliciesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      {/* Layered icon art */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-[oklch(18%_0.08_230_/_0.2)] border border-[oklch(28%_0.10_230_/_0.3)] flex items-center justify-center">
          <Shield className="w-12 h-12 text-[oklch(72%_0.20_230_/_0.3)]" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] flex items-center justify-center text-sm">❤️</div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-[oklch(20%_0.05_75)] border border-[oklch(30%_0.08_75)] flex items-center justify-center text-sm">🚗</div>
      </div>

      <h3 className="text-2xl font-bold text-[var(--color-base-100)] mb-2">
        You&apos;re not protected yet
      </h3>
      <p className="text-sm text-[var(--color-base-500)] max-w-md mb-8 leading-relaxed">
        Insurance protects you and your family from unexpected financial losses. Browse our plans and start building your safety net today.
      </p>

      <Link
        href="/policies"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-semibold transition-all duration-200 shadow-[0_4px_20px_oklch(58%_0.22_230_/_0.35)] hover:shadow-[0_6px_28px_oklch(58%_0.22_230_/_0.5)]"
      >
        Explore Insurance Plans
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
