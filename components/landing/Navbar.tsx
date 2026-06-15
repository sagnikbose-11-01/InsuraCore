'use client';
// ============================================================
// components/landing/Navbar.tsx
// Premium, recruiter-worthy sticky glassmorphic navigation bar.
// Includes smooth transitions, active indicator, and theme sun toggle.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { JWTPayload } from '@/lib/auth/jwt';
import { AuthAwareCTA } from '@/components/auth/AuthAwareCTA';
import { UserNav } from '@/components/auth/UserNav';

const NAV_ITEMS = [
  { label: 'Policies', href: '/policies' },
  { label: 'About', href: '#about' },
  { label: 'AI Assistant', href: '#ai-assistant' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar({ session }: { session: JWTPayload | null }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-[var(--color-base-950)]/80 backdrop-blur-xl border-[rgba(255,255,255,0.08)] shadow-lg' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center shadow-[0_0_20px_oklch(58%_0.22_230_/_0.5)] group-hover:shadow-[0_0_30px_oklch(58%_0.22_230_/_0.8)] group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="text-white font-black text-xs tracking-tight relative z-10">IC</span>
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--color-brand-300)] transition-all">
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
              className="relative px-4 py-2 text-sm font-semibold text-[var(--color-base-300)] hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              {hoveredIndex === idx && (
                <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 bg-[var(--color-base-800)]/50 rounded-lg -z-10 border border-[rgba(255,255,255,0.05)] shadow-inner"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Button & Theme selector */}
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <UserNav session={session} />
          ) : (
            <AuthAwareCTA session={session} icon={false} />
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)] flex items-center justify-center text-[var(--color-base-300)] hover:text-white transition-colors"
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
            className="lg:hidden border-t border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)] overflow-hidden shadow-2xl absolute w-full top-16"
          >
            <div className="px-4 py-6 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-[var(--color-base-300)] hover:text-white hover:bg-[var(--color-base-900)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-6 mt-4 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-3 items-center">
                {session ? (
                  <UserNav session={session} />
                ) : (
                  <AuthAwareCTA session={session} icon={false} className="w-full py-3.5 text-center justify-center bg-[var(--color-brand-600)]" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
