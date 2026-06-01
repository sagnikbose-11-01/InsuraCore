'use client';
// ============================================================
// components/landing/FinalCTA.tsx
// Redesigned premium dramatic Final CTA banner.
// Radial glow backdrop with high-impact modern typography.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTA() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/50 backdrop-blur-2xl p-12 text-center overflow-hidden shadow-2xl"
      >
        {/* Extreme glowing mesh background underlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(58%_0.22_230_/_0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[oklch(72%_0.20_230_/_0.4)] to-transparent" />

        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-[oklch(72%_0.20_230)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Join 50,000+ Policyholders
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to Modernize Your Insurance Claims?
          </h2>
          
          <p className="text-xs sm:text-sm text-[var(--color-base-400)] leading-relaxed max-w-md mx-auto">
            Experience next-generation speed, total transparency, and compliance. Access the InsuraCore portal in seconds.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-[0_0_24px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_0_36px_oklch(58%_0.22_230_/_0.55)] hover:-translate-y-0.5"
            >
              Access Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
