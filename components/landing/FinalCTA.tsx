'use client';
// ============================================================
// components/landing/FinalCTA.tsx
// Redesigned premium dramatic Final CTA banner.
// Radial glow backdrop with high-impact modern typography.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

export function FinalCTA() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-[#050505] py-24 sm:py-32 relative overflow-hidden">
      {/* Intense animated gradient backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,oklch(58%_0.22_230_/_0.15)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
        <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,oklch(40%_0.15_270_/_0.10)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mask-image-radial" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-400)]" />
            Join 1,200+ Enterprise Teams
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
            Ready to experience the <br />
            <span className="bg-gradient-to-r from-[var(--color-brand-400)] via-white to-white bg-clip-text text-transparent">future of insurance?</span>
          </h2>
          
          <p className="text-base sm:text-lg text-[var(--color-base-400)] leading-relaxed max-w-2xl mx-auto font-medium">
            Deploy InsuraCore today. Digitize your claims processing, empower your assessors with AI, and unlock real-time settlement tracking in minutes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-white text-black hover:bg-[var(--color-base-200)] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 w-full sm:w-auto text-sm"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-white/5 text-white font-semibold px-8 py-4 rounded-xl text-sm border border-white/10 transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Play className="w-4 h-4" /> Launch Interactive Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
