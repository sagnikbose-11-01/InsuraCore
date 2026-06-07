// ============================================================
// components/auth/AuthLayout.tsx
// Premium SaaS authentication page layout wrapper.
// Features theme switcher, animated backdrop mesh gradients, and glassmorphic cards.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackToHome?: boolean;
  maxWidth?: string; // e.g. max-w-lg, max-w-5xl
}

export function AuthLayout({ children, title, subtitle, showBackToHome = true, maxWidth = 'max-w-lg' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen hero-bg flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Decorative premium floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[oklch(25%_0.12_230_/_0.12)] dark:bg-[oklch(25%_0.12_230_/_0.2)] blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[oklch(20%_0.10_270_/_0.1)] dark:bg-[oklch(20%_0.10_270_/_0.15)] blur-[100px] animate-mesh [animation-delay:-4s]" />
      </div>

      {/* Header / Theme Toggle */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-4 px-2">
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center glow-brand transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-black text-xs tracking-tight">IC</span>
          </div>
          <span className="text-lg font-bold text-[var(--color-base-100)] tracking-tight">
            Insura<span className="text-[var(--color-brand-400)]">Core</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Card Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full my-8">
        <div className={cn("w-full animate-fade-in px-2", maxWidth)}>
          <div className="glass-card p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-[var(--color-base-600)] dark:border-[rgba(255,255,255,0.08)] bg-[var(--color-base-800)]/70 dark:bg-[rgba(15,23,42,0.6)]">
            
            {/* Header Content */}
            <div className="flex flex-col items-center text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-base-100)] tracking-tight">
                {title}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-base-400)] max-w-sm">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </main>

      {/* Footer Area */}
      <footer className="relative z-10 w-full py-4 text-center">
        <p className="text-xs text-[var(--color-base-500)]">
          &copy; {new Date().getFullYear()} InsuraCore Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
