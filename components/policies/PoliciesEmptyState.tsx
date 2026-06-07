'use client';
// ============================================================
// components/policies/PoliciesEmptyState.tsx
// Premium empty state with insurance benefit highlights and
// a clear CTA to explore available plans.
// ============================================================

import Link from 'next/link';
import { Shield, ArrowRight, Heart, Car, Home, Plane } from 'lucide-react';

const BENEFITS = [
  {
    icon: Heart,
    emoji: '🏥',
    title: 'Health Protection',
    desc: 'Cover hospitalization, surgeries & critical illness for you and your family.',
    color: 'oklch(20%_0.05_150)',
    border: 'oklch(30%_0.08_150)',
    text: 'oklch(72%_0.17_150)',
  },
  {
    icon: Car,
    emoji: '🚗',
    title: 'Auto Coverage',
    desc: 'Protect your vehicle against accidents, theft and third-party liability.',
    color: 'oklch(20%_0.05_75)',
    border: 'oklch(30%_0.08_75)',
    text: 'oklch(78%_0.18_75)',
  },
  {
    icon: Home,
    emoji: '🏠',
    title: 'Property Shield',
    desc: 'Safeguard your home against fire, flood, burglary and natural disasters.',
    color: 'oklch(18%_0.08_230)',
    border: 'oklch(28%_0.10_230)',
    text: 'oklch(72%_0.20_230)',
  },
  {
    icon: Plane,
    emoji: '✈️',
    title: 'Travel Assurance',
    desc: 'Fly worry-free with cover for delays, medical emergencies and lost baggage.',
    color: 'oklch(18%_0.05_260)',
    border: 'oklch(28%_0.08_260)',
    text: 'oklch(72%_0.15_260)',
  },
];

export function PoliciesEmptyState() {
  return (
    <div className="flex flex-col items-center py-16 px-6 animate-fade-in">
      {/* Illustration */}
      <div className="relative mb-10">
        <div className="w-32 h-32 rounded-3xl bg-[oklch(18%_0.08_230_/_0.15)] border border-[oklch(28%_0.10_230_/_0.25)] flex items-center justify-center">
          <Shield className="w-14 h-14 text-[oklch(72%_0.20_230_/_0.3)]" />
        </div>
        {/* Floating type icons */}
        <div className="absolute -top-3 -right-3 w-9 h-9 rounded-2xl bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] flex items-center justify-center text-base shadow-lg animate-float">🏥</div>
        <div className="absolute -bottom-3 -left-3 w-9 h-9 rounded-2xl bg-[oklch(20%_0.05_75)] border border-[oklch(30%_0.08_75)] flex items-center justify-center text-base shadow-lg animate-float-delayed">🚗</div>
        <div className="absolute top-1/2 -right-6 w-8 h-8 rounded-xl bg-[oklch(18%_0.05_25)] border border-[oklch(28%_0.08_25)] flex items-center justify-center text-sm shadow-lg animate-float-slow">❤️</div>
      </div>

      <h3 className="text-2xl font-bold text-[var(--color-base-100)] mb-2 text-center">
        You&apos;re not protected yet
      </h3>
      <p className="text-sm text-[var(--color-base-500)] max-w-md mb-10 leading-relaxed text-center">
        Start building your safety net today. Choose from 9+ curated insurance plans and get instant coverage.
      </p>

      {/* Benefit cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-3xl mb-10">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="stat-card p-4 flex flex-col items-center text-center gap-2.5 hover:scale-[1.02] transition-transform duration-200"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl border"
              style={{ background: `oklch(${b.color})`, borderColor: `oklch(${b.border})` }}
            >
              {b.emoji}
            </div>
            <p className="text-xs font-semibold text-[var(--color-base-200)]">{b.title}</p>
            <p className="text-[10px] text-[var(--color-base-500)] leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-semibold transition-all duration-200 shadow-[0_4px_20px_oklch(58%_0.22_230_/_0.35)] hover:shadow-[0_6px_28px_oklch(58%_0.22_230_/_0.5)] hover:-translate-y-0.5"
      >
        Explore Insurance Marketplace
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="mt-4 text-[11px] text-[var(--color-base-600)]">
        No commitment required · Cancel anytime
      </p>
    </div>
  );
}
