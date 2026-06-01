'use client';
// ============================================================
// components/landing/AISecuritySection.tsx
// Redesigned futuristic AI Copilot section.
// Integrates the pre-built interactive AIAssistantFAQ inside a premium frame.
// ============================================================

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Bot, Clock } from 'lucide-react';
import { AIAssistantFAQ } from '@/components/shared/AIAssistantFAQ';

export function AISecuritySection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="ai-assistant" ref={ref} className="relative bg-[var(--color-base-950)] border-y border-[var(--color-base-900)] py-24 sm:py-32 scroll-mt-16 overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,oklch(65%_0.15_75_/_0.03)_0%,transparent_60%)] blur-[40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Copilot Support
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Interactive AI Copilot Workspace
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[var(--color-base-400)] max-w-xl mx-auto"
          >
            Have immediate questions regarding coverage limits, assessor audits, or settlement procedures? Interact directly with our pre-loaded AI Agent below.
          </motion.p>
        </div>

        {/* Render pre-built interactive chat console */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AIAssistantFAQ />
        </motion.div>
      </div>
    </section>
  );
}
