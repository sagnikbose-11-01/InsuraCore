'use client';
// ============================================================
// components/landing/WorkflowSection.tsx
// Animated horizontal lifecycle timeline.
// Connects 5 stages with active scroll status and dynamic highlight paths.
// ============================================================

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Shield, Send, CheckSquare, Banknote } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Choose Policy',
    desc: 'Explore plans (Health, Auto, Property, Life, Travel) and choose coverage parameters.',
    icon: <Sparkles className="w-5 h-5 text-[oklch(72%_0.20_230)]" />,
  },
  {
    step: 2,
    title: 'Instant Activation',
    desc: 'Complete premium payment to immediately activate and verify your policy instance.',
    icon: <Shield className="w-5 h-5 text-[oklch(72%_0.17_150)]" />,
  },
  {
    step: 3,
    title: 'File a Claim',
    desc: 'Input loss info and upload hospital bills, invoices, or repair diagnostics directly.',
    icon: <Send className="w-5 h-5 text-[oklch(78%_0.18_75)]" />,
  },
  {
    step: 4,
    title: 'Assessor Audit',
    desc: 'Specialist appraisers examine documents, verify conditions, and set approved amounts.',
    icon: <CheckSquare className="w-5 h-5 text-[oklch(65%_0.20_25)]" />,
  },
  {
    step: 5,
    title: 'Direct Payout',
    desc: 'Administrators authorize direct settlement releases to your registered bank account.',
    icon: <Banknote className="w-5 h-5 text-[oklch(72%_0.15_260)]" />,
  },
];

export function WorkflowSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="workflow" ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-16 relative">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold">
          ⚡ Process Lifecycle
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How InsuraCore Works
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-base-500)] max-w-xl mx-auto">
          From policy registration to instant settlement disbursements—step by step.
        </p>
      </div>

      {/* Horizontal timeline cards container */}
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Animated electrical electrical wire/line behind items */}
        <div className="hidden md:block absolute top-[52px] left-[8%] right-[8%] h-0.5 bg-[var(--color-base-900)] -z-10 overflow-hidden">
          <motion.div
            initial={{ left: '-100%' }}
            animate={isInView ? { left: '100%' } : {}}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[oklch(72%_0.20_230)] to-transparent"
          />
        </div>

        {STEPS.map((step, idx) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.12 }}
            whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.08)' }}
            className="relative p-5 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] backdrop-blur-xl group transition-all duration-300 flex flex-col items-center text-center space-y-4"
          >
            {/* Round Step counter with pulse glow */}
            <div className="w-12 h-12 rounded-full bg-[var(--color-base-950)] border-2 border-[var(--color-base-800)] group-hover:border-[oklch(72%_0.20_230)] flex items-center justify-center text-sm font-black text-white shadow-lg transition-all duration-300 relative">
              <span className="relative z-10">{step.step}</span>
              <div className="absolute inset-0 rounded-full border border-[oklch(72%_0.20_230)] opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 pointer-events-none" />
            </div>

            <div className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:bg-[rgba(255,255,255,0.04)] transition-all">
              {step.icon}
            </div>

            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">{step.title}</h4>
              <p className="text-[10px] text-[var(--color-base-500)] mt-2 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
