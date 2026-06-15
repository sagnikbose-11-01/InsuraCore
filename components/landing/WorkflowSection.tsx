'use client';
// ============================================================
// components/landing/WorkflowSection.tsx
// Animated horizontal lifecycle timeline.
// Connects 5 stages with active scroll status and dynamic highlight paths.
// ============================================================

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Shield, Send, CheckSquare, Banknote } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Choose Policy',
    desc: 'Explore plans and choose coverage parameters.',
    icon: Sparkles,
    color: 'from-blue-400 to-indigo-600',
    iconColor: 'text-blue-400'
  },
  {
    step: 2,
    title: 'Instant Activation',
    desc: 'Complete premium payment to immediately activate.',
    icon: Shield,
    color: 'from-emerald-400 to-green-600',
    iconColor: 'text-emerald-400'
  },
  {
    step: 3,
    title: 'File a Claim',
    desc: 'Input loss info and upload diagnostic documents.',
    icon: Send,
    color: 'from-amber-400 to-orange-600',
    iconColor: 'text-amber-400'
  },
  {
    step: 4,
    title: 'Assessor Audit',
    desc: 'Specialist appraisers verify conditions and approve.',
    icon: CheckSquare,
    color: 'from-rose-400 to-red-600',
    iconColor: 'text-rose-400'
  },
  {
    step: 5,
    title: 'Direct Payout',
    desc: 'Administrators authorize direct bank settlement releases.',
    icon: Banknote,
    color: 'from-[var(--color-brand-400)] to-[var(--color-brand-600)]',
    iconColor: 'text-[var(--color-brand-400)]'
  },
];

export function WorkflowSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="workflow" ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-16 relative">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          How InsuraCore Works
        </h2>
        <p className="text-base text-[var(--color-base-400)] max-w-xl mx-auto">
          From policy registration to instant settlement disbursements—step by step.
        </p>
      </div>

      {/* Horizontal timeline cards container */}
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Animated electrical wire/line behind items */}
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-[var(--color-base-900)] -z-10 rounded-full overflow-hidden">
          <motion.div
            initial={{ left: '-100%' }}
            animate={isInView ? { left: '100%' } : {}}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          />
        </div>

        {STEPS.map((step, idx) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="relative p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#0A0A0A] shadow-[0_10px_30px_rgba(0,0,0,0.3)] group transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
            
            {/* Round Step counter */}
            <div className={`w-14 h-14 rounded-full bg-[var(--color-base-950)] border-4 border-[#0A0A0A] flex items-center justify-center text-lg font-black text-white shadow-xl transition-all duration-300 relative mb-6 shadow-${step.iconColor.split('-')[1]}-500/20 group-hover:shadow-${step.iconColor.split('-')[1]}-500/40`}>
              <span className="relative z-10">{step.step}</span>
              <div className={`absolute inset-0 rounded-full border border-current ${step.iconColor} opacity-0 group-hover:opacity-100 scale-110 transition-all duration-300 pointer-events-none`} />
            </div>

            <div className={`w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${step.iconColor}`}>
              <step.icon className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-white/70 transition-colors">{step.title}</h4>
              <p className="text-[11px] text-[var(--color-base-400)] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
