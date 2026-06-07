'use client';
// ============================================================
// components/landing/HeroSection.tsx
// High-fidelity premium SaaS Hero Section.
// Left Side: Striking copy, glowing pill, premium CTAs, trust badges.
// Right Side: Beautiful living interactive glassmorphic dashboard preview.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, ChevronRight, Star, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { JWTPayload } from '@/lib/auth/jwt';
import { AuthAwareCTA } from '@/components/auth/AuthAwareCTA';
import { UserRole } from '@/lib/constants/enums';

export function HeroSection({ session }: { session: JWTPayload | null }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:py-32">
      {/* Animated gradient mesh & glowing orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(40%_0.15_230_/_0.25)_0%,transparent_70%)] blur-[80px] animate-mesh" />
        <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,oklch(35%_0.10_150_/_0.15)_0%,transparent_60%)] blur-[60px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(38%_0.12_270_/_0.12)_0%,transparent_60%)] blur-[70px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT: Copy & Badges */}
          <div className="lg:col-span-6 text-left space-y-6">
            {/* Glowing Pill Badge */}
            {session ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[oklch(72%_0.20_230)] text-[oklch(72%_0.20_230)]" />
                Welcome back, {session.role === UserRole.ADMIN ? `Admin ${session.name.split(' ')[0]}` : session.name.split(' ')[0]} 👋
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold"
              >
                <Star className="w-3.5 h-3.5 fill-[oklch(72%_0.20_230)]" />
                Claims Management for the AI Era
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              Modern Insurance Claims.{' '}
              <span className="bg-gradient-to-r from-[oklch(72%_0.20_230)] to-[oklch(72%_0.17_150)] bg-clip-text text-transparent">
                Zero Friction.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-[var(--color-base-400)] leading-relaxed max-w-xl"
            >
              InsuraCore digitizes the complete insurance lifecycle—from policy purchase to instant settlement payouts. Built on next-gen architecture for modern enterprises.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <AuthAwareCTA session={session} className="px-7 py-3.5 text-sm" />
              
              {!session ? (
                <Link
                  href="/policies"
                  className="inline-flex items-center gap-2 bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] text-[var(--color-base-200)] font-semibold px-7 py-3.5 rounded-xl text-sm border border-[var(--color-base-800)] hover:border-[var(--color-base-700)] transition-all hover:-translate-y-0.5"
                >
                  Browse Policies <ChevronRight className="w-4 h-4" />
                </Link>
              ) : session.role === UserRole.CUSTOMER ? (
                <Link
                  href="/policies"
                  className="inline-flex items-center gap-2 bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] text-[var(--color-base-200)] font-semibold px-7 py-3.5 rounded-xl text-sm border border-[var(--color-base-800)] hover:border-[var(--color-base-700)] transition-all hover:-translate-y-0.5"
                >
                  View My Policies <ChevronRight className="w-4 h-4" />
                </Link>
              ) : session.role === UserRole.ASSESSOR ? (
                <Link
                  href="/assessor/claims"
                  className="inline-flex items-center gap-2 bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] text-[var(--color-base-200)] font-semibold px-7 py-3.5 rounded-xl text-sm border border-[var(--color-base-800)] hover:border-[var(--color-base-700)] transition-all hover:-translate-y-0.5"
                >
                  Review Claims <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/admin/analytics"
                  className="inline-flex items-center gap-2 bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] text-[var(--color-base-200)] font-semibold px-7 py-3.5 rounded-xl text-sm border border-[var(--color-base-800)] hover:border-[var(--color-base-700)] transition-all hover:-translate-y-0.5"
                >
                  View Analytics <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-5 text-xs text-[var(--color-base-500)] pt-6 border-t border-[var(--color-base-900)]"
            >
              {['Bank-level Encryption', 'IRDAI Compliant', 'ISO 27001 Certified', '99.9% Uptime SLA'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[oklch(72%_0.17_150)]" />
                  {t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: High-Fidelity Product Mockup Frame */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto max-w-[500px] lg:max-w-none"
            >
              {/* Backglow element behind frame */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.12)_0%,transparent_60%)] blur-[40px] pointer-events-none" />

              {/* Main premium dashboard console frame */}
              <div className="relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/60 backdrop-blur-2xl shadow-2xl p-6 overflow-hidden">
                {/* Header bar simulator */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(255,255,255,0.04)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-base-600)]">insuracore.app/dashboard</span>
                </div>

                {/* Dashboard grid inner simulator */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Left block - active policy card */}
                  <div className="col-span-7 space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--color-base-900)]/70 border border-[rgba(255,255,255,0.04)]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold tracking-wider text-[oklch(72%_0.20_230)] bg-[oklch(18%_0.08_230)] px-2 py-0.5 rounded-md border border-[oklch(28%_0.10_230)]">
                          HEALTH
                        </span>
                        <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">● Active</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">MaxiHealth Secure</h4>
                      <p className="text-[10px] text-[var(--color-base-500)] mb-3">Coverage Limit: ₹25,00,000</p>
                      {/* Premium progress bar simulator */}
                      <div className="w-full h-1 bg-[var(--color-base-800)] rounded-full overflow-hidden">
                        <div className="w-[68%] h-full bg-[oklch(72%_0.20_230)] rounded-full" />
                      </div>
                      <div className="flex justify-between text-[9px] text-[var(--color-base-500)] mt-1.5">
                        <span>Used: ₹0</span>
                        <span>Available: 100%</span>
                      </div>
                    </div>

                    {/* Chart simulator */}
                    <div className="p-4 rounded-xl bg-[var(--color-base-900)]/70 border border-[rgba(255,255,255,0.04)]">
                      <p className="text-[10px] font-bold text-[var(--color-base-400)] uppercase tracking-wider mb-3">Payout Frequency</p>
                      <div className="flex items-end justify-between h-14 pt-2">
                        {[40, 65, 30, 85, 45, 95, 60].map((h, i) => (
                          <div key={i} className="w-[10%] bg-[rgba(255,255,255,0.03)] rounded-t-sm h-full flex flex-col justify-end">
                            <div 
                              className="w-full bg-gradient-to-t from-[oklch(58%_0.22_230_/_0.8)] to-[oklch(72%_0.20_230)] rounded-t-sm"
                              style={{ height: `${h}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block - summary tracker */}
                  <div className="col-span-5 space-y-4">
                    <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] flex flex-col justify-center h-full">
                      <p className="text-[9px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">Total Payouts</p>
                      <p className="text-xl font-bold text-white leading-none mb-1">₹4,28,450</p>
                      <p className="text-[9px] text-green-400 font-semibold flex items-center gap-0.5">↑ 18.5% YoY</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1: Stepper Tracker (Floating effect) */}
              <div className="absolute top-[20%] right-[-6%] sm:right-[-4%] w-[210px] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[oklch(15%_0.05_230_/_0.85)] backdrop-blur-xl p-3.5 shadow-2xl animate-float pointer-events-none">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[oklch(72%_0.17_150)]" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white leading-none mb-0.5">Claim #7240 Approved</h5>
                    <p className="text-[9px] text-[var(--color-base-500)] mb-2">Amount approved: ₹4,50,000</p>
                    {/* Tiny visual progress indicators */}
                    <div className="flex gap-1 items-center">
                      <div className="w-2.5 h-1 rounded-full bg-[oklch(72%_0.17_150)]" />
                      <div className="w-2.5 h-1 rounded-full bg-[oklch(72%_0.17_150)]" />
                      <div className="w-2.5 h-1 rounded-full bg-[oklch(72%_0.17_150)]" />
                      <span className="text-[8px] text-[oklch(72%_0.17_150)] font-bold ml-1">Paid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 2: AI Copilot typing widget */}
              <div className="absolute bottom-[10%] left-[-8%] sm:left-[-6%] w-[230px] rounded-xl border border-[oklch(28%_0.08_25_/_0.5)] bg-[oklch(12%_0.04_25_/_0.85)] backdrop-blur-xl p-3.5 shadow-2xl animate-float-delayed pointer-events-none">
                <div className="flex gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-[oklch(20%_0.05_75)] border border-[oklch(30%_0.08_75)] flex items-center justify-center text-xs flex-shrink-0">
                    🤖
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-base-300)] leading-relaxed">
                      Assessor audit complete. Initiating direct settlement payout...<span className="inline-block w-1.5 h-3 bg-[oklch(78%_0.18_75)] animate-blink ml-0.5" />
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
