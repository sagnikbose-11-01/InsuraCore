'use client';
// ============================================================
// components/landing/FeaturesSection.tsx
// Redesigned premium features grid.
// Glass cards with glowing border gradients and staggered entrance motion.
// ============================================================

import React from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { ShieldCheck, FileText, BarChart3, TrendingUp, Zap, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-[oklch(72%_0.20_230)]" />,
    title: 'Smart Policy Portfolio',
    description: 'Browse, compare, and purchase tailored insurance coverage items with a unified, real-time portfolio management dashboard.',
    glow: 'from-[oklch(58%_0.22_230_/_0.15)] to-transparent',
  },
  {
    icon: <FileText className="w-5 h-5 text-[oklch(72%_0.17_150)]" />,
    title: 'Instant Guided Claims',
    description: 'File complete claims within minutes using our interactive multi-step guided wizard. Track document audits in real time.',
    glow: 'from-[oklch(60%_0.15_150_/_0.15)] to-transparent',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-[oklch(78%_0.18_75)]" />,
    title: 'Expert Appraiser Audits',
    description: 'All claims are routed to specialized independent assessors, ensuring bias-free review and regulatory compliance.',
    glow: 'from-[oklch(65%_0.15_75_/_0.15)] to-transparent',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-[oklch(65%_0.20_25)]" />,
    title: 'Real-time Pipeline Analytics',
    description: 'Track claim volume, approval rates, average payout amounts, and settlement times with professional dashboards.',
    glow: 'from-[oklch(55%_0.18_25_/_0.15)] to-transparent',
  },
  {
    icon: <Zap className="w-5 h-5 text-[oklch(72%_0.15_260)]" />,
    title: 'Electrical Direct Settlements',
    description: 'Approved audits trigger automated payout vouchers. Track funds transparently from assessor verification to bank credit.',
    glow: 'from-[oklch(58%_0.15_260_/_0.15)] to-transparent',
  },
  {
    icon: <Users className="w-5 h-5 text-[oklch(72%_0.20_230)]" />,
    title: 'Granular Workspace RBAC',
    description: 'Role-based security dashboards tailored specifically for claimants, verification appraisers, and platform admins.',
    glow: 'from-[oklch(58%_0.22_230_/_0.15)] to-transparent',
  },
];

export function FeaturesSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  return (
    <section id="features" ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-16 relative">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Everything You Need to Manage Claims
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-base-500)] max-w-xl mx-auto">
          A premium unified workspace engineered for customers, assessors, and administrators.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(255, 255, 255, 0.12)' }}
            className="group relative rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl p-6 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Radial glow background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-b ${f.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

            <div>
              {/* Icon Container with hover zoom */}
              <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300">
                {f.icon}
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-white mb-2.5 tracking-tight group-hover:text-[var(--color-brand-300)] transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                {f.description}
              </p>
            </div>

            {/* Tiny stylized accent dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] group-hover:bg-[var(--color-brand-400)] transition-colors duration-300 mt-6" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
