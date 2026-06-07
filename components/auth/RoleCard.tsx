// ============================================================
// components/auth/RoleCard.tsx
// RoleCard component for selection during the signup onboarding.
// Features hover effects, glowing borders, and clean alignment.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  className?: string;
}

export function RoleCard({ title, description, icon, href, badge, className }: RoleCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-between p-6 rounded-[var(--radius-card)]',
        'bg-[var(--color-base-800)]/60 dark:bg-[rgba(255,255,255,0.02)]',
        'border border-[var(--color-base-700)] dark:border-[rgba(255,255,255,0.06)]',
        'hover:border-[var(--color-brand-500)] dark:hover:border-[var(--color-brand-400)]',
        'shadow-md hover:shadow-[0_0_25px_oklch(58%_0.22_230_/_0.15)] dark:hover:shadow-[0_0_30px_oklch(58%_0.22_230_/_0.25)]',
        'transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer overflow-hidden',
        className
      )}
    >
      {/* Decorative Glow Element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-brand-500)]/5 rounded-full blur-2xl group-hover:bg-[var(--color-brand-500)]/15 transition-all duration-300 pointer-events-none" />

      <div>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-500)]/10 dark:bg-[var(--color-brand-500)]/20 text-[var(--color-brand-400)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--color-brand-500)] group-hover:text-white">
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)] dark:bg-[var(--color-brand-500)]/20">
              {badge}
            </span>
          )}
        </div>

        {/* Content Section */}
        <h3 className="text-lg font-bold text-[var(--color-base-100)] tracking-tight group-hover:text-[var(--color-brand-400)] transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[var(--color-base-400)] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action footer */}
      <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-400)] group-hover:text-[var(--color-brand-300)] transition-colors duration-200">
        <span>Get Started</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
