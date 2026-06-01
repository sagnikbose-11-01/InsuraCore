'use client';
// ============================================================
// components/landing/Navbar.tsx
// Premium, recruiter-worthy sticky glassmorphic navigation bar.
// Includes smooth transitions, active indicator, and theme sun toggle.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Policies', href: '/policies' },
  { label: 'About', href: '#about' },
  { label: 'AI Assistant', href: '#ai-assistant' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/75 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center shadow-[0_0_20px_oklch(58%_0.22_230_/_0.4)] group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-black text-xs tracking-tight">IC</span>
          </div>
          <span className="font-bold text-lg text-white tracking-tight group-hover:text-[var(--color-brand-300)] transition-colors">
            InsuraCore
          </span>
        </Link>

        {/* Centered Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item, idx) => (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 text-xs font-semibold text-[var(--color-base-400)] hover:text-white transition-colors duration-200"
            >
              {hoveredIndex === idx && (
                <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 bg-[var(--color-base-900)] rounded-lg -z-10 border border-[rgba(255,255,255,0.03)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Button & Theme selector */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-xs font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_0_24px_oklch(58%_0.22_230_/_0.55)] hover:-translate-y-0.5"
          >
            Access Portal
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-xl border border-[var(--color-base-800)] flex items-center justify-center text-[var(--color-base-400)] hover:text-white"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-900)]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full bg-[var(--color-brand-500)] text-white font-bold py-3 rounded-xl text-xs"
                >
                  Access Portal
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
