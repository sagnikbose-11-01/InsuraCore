'use client';
// ============================================================
// components/landing/HeroSection.tsx
// High-fidelity premium SaaS Hero Section.
// Left Side: Striking copy, glowing pill, premium CTAs, trust badges.
// Right Side: Beautiful living interactive glassmorphic dashboard preview.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Play, Star, Sparkles, Server, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { JWTPayload } from '@/lib/auth/jwt';
import { AuthAwareCTA } from '@/components/auth/AuthAwareCTA';
import { UserRole } from '@/lib/constants/enums';
import { AnimatePresence } from 'framer-motion';

const CYCLING_WORDS = ['Friction.', 'Paperwork.', 'Delays.', 'Hassle.'];

export function HeroSection({ session }: { session: JWTPayload | null }) {
  const [wordIdx, setWordIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % CYCLING_WORDS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
      {/* Animated gradient mesh & glowing orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-[var(--color-base-950)]">
        <div className="absolute top-[-10%] left-[40%] w-[1000px] h-[600px] rounded-full bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.15)_0%,transparent_60%)] blur-[100px] animate-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,oklch(40%_0.15_270_/_0.10)_0%,transparent_60%)] blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT: Copy & Badges */}
          <div className="lg:col-span-6 text-left space-y-8 relative z-10">
            {/* Glowing Pill Badge */}
            {session ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white text-xs font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-400)]" />
                Welcome back, {session.role === UserRole.ADMIN ? `Admin ${session.name.split(' ')[0]}` : session.name.split(' ')[0]} 👋
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white text-xs font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
                InsuraCore Platform 2.0
              </motion.div>
            )}

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
                Modern Insurance Claims.<br />
                <span className="bg-gradient-to-r from-white via-white to-[var(--color-base-500)] bg-clip-text text-transparent">
                  Zero{' '}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={CYCLING_WORDS[wordIdx]}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-[var(--color-brand-400)] to-[var(--color-brand-600)] bg-clip-text text-transparent inline-block min-w-[200px]"
                  >
                    {CYCLING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[var(--color-base-400)] leading-relaxed max-w-[90%] lg:max-w-[460px] font-medium"
            >
              Transform the complete insurance lifecycle. From seamless policy purchases to lightning-fast, automated settlements, InsuraCore provides the next-generation infrastructure that modern enterprises demand.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <AuthAwareCTA session={session} className="px-8 py-3.5 text-sm rounded-xl font-bold bg-white text-black hover:bg-[var(--color-base-200)] shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105" />

              <Link
                href="/policies"
                className="inline-flex items-center gap-2 bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] text-white font-semibold px-8 py-3.5 rounded-xl text-sm border border-[var(--color-base-800)] hover:border-[var(--color-base-700)] transition-all hover:scale-105"
              >
                Browse Policies <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-[var(--color-base-500)] pt-8 font-semibold uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                IRDAI Compliant
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                SOC2 Type II
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                99.99% Uptime
              </div>
            </motion.div>
          </div>

          {/* RIGHT: High-Fidelity Product Mockup Frame */}
          <div className="lg:col-span-6 relative perspective-1000">
            <motion.div
              initial={{ opacity: 0, rotateY: -15, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, type: 'spring', bounce: 0.4 }}
              className="relative mx-auto max-w-[600px] lg:max-w-none transform-style-3d shadow-2xl rounded-2xl"
            >
              {/* Main premium dashboard console frame */}
              <div className="relative rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#0A0A0A]/80 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 overflow-hidden">
                {/* Header bar simulator */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-md px-24 py-1.5">
                    <ShieldCheck className="w-3 h-3 text-[var(--color-base-500)]" />
                    <span className="text-[10px] font-mono text-[var(--color-base-400)]">insuracore.app/dashboard</span>
                  </div>
                  <div className="w-4 h-4" />
                </div>

                {/* Dashboard grid inner simulator */}
                <div className="grid grid-cols-12 gap-3 h-[300px]">
                  {/* Left Sidebar */}
                  <div className="col-span-3 border-r border-white/5 pr-3 space-y-2">
                    <div className="h-6 w-3/4 bg-white/10 rounded-md mb-6" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-6 w-full rounded-md ${i === 2 ? 'bg-[var(--color-brand-500)]/20 border border-[var(--color-brand-500)]/30' : 'bg-white/5 hover:bg-white/10'} transition-colors`} />
                    ))}
                  </div>

                  {/* Main Content Area */}
                  <div className="col-span-9 pl-1 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-6 w-1/3 bg-white/10 rounded-md" />
                      <div className="h-6 w-1/4 bg-[var(--color-brand-500)] rounded-md" />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 p-2 flex flex-col justify-between">
                          <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                          <div className="h-4 w-3/4 bg-white/20 rounded-sm" />
                        </div>
                      ))}
                    </div>

                    {/* Table simulator */}
                    <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                        <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                        <div className="h-2 w-1/6 bg-white/10 rounded-full" />
                      </div>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center py-1">
                          <div className="h-3 w-1/3 bg-white/10 rounded-sm" />
                          <div className="h-3 w-1/4 bg-white/5 rounded-sm" />
                          <div className={`h-4 w-12 rounded-full ${i === 1 ? 'bg-emerald-500/20 border border-emerald-500/30' : i === 2 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1: Stepper Tracker (Floating effect) */}
              <div className="absolute top-[10%] right-[-8%] sm:right-[-6%] w-[220px] rounded-xl border border-white/10 bg-[#111111]/90 backdrop-blur-xl p-3.5 shadow-2xl animate-float pointer-events-none z-20">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none mb-1">Settlement Paid</h5>
                    <p className="text-[10px] text-[var(--color-base-400)] mb-1">Claim #7240 • ₹4,50,000</p>
                    <p className="text-[9px] text-emerald-400 font-semibold">Transferred instantly</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 2: AI Copilot typing widget */}
              <div className="absolute bottom-[20%] left-[-12%] sm:left-[-10%] w-[240px] rounded-xl border border-[var(--color-brand-500)]/30 bg-[#111111]/90 backdrop-blur-xl p-3 shadow-2xl animate-float-delayed pointer-events-none z-20">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-500)]/20 border border-[var(--color-brand-500)]/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-400)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-base-200)] leading-relaxed font-medium">
                      Fraud analysis complete. Zero anomalies detected in medical reports.<span className="inline-block w-1.5 h-3 bg-[var(--color-brand-400)] animate-blink ml-1" />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
