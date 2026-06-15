'use client';
// ============================================================
// components/landing/FeaturesSection.tsx
// Grid of glass feature cards with glowing gradient borders and micro-interactions.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, FileSearch, Layers, Network, Lock, PieChart, Wallet } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Claim Assistance',
    desc: 'Automate initial claim reviews with our intelligent engine. Extract data from medical bills instantly.',
    color: 'from-[var(--color-brand-400)] to-[var(--color-brand-600)]',
    iconColor: 'text-[var(--color-brand-400)]'
  },
  {
    icon: Network,
    title: 'Real-Time Claim Tracking',
    desc: 'Full visibility for policyholders. Track every state transition from submission to final payout.',
    color: 'from-blue-400 to-indigo-600',
    iconColor: 'text-blue-400'
  },
  {
    icon: Layers,
    title: 'Role-Based Workspaces',
    desc: 'Dedicated interfaces optimized for Customers, Assessors, and Administrators to maximize efficiency.',
    color: 'from-purple-400 to-fuchsia-600',
    iconColor: 'text-purple-400'
  },
  {
    icon: ShieldAlert,
    title: 'Intelligent Fraud Detection',
    desc: 'Cross-reference documents against historical anomalies and flag suspicious claims before assessor review.',
    color: 'from-rose-400 to-red-600',
    iconColor: 'text-rose-400'
  },
  {
    icon: FileSearch,
    title: 'Document Verification',
    desc: 'Securely upload, parse, and verify invoices and diagnostic reports with our encrypted storage vault.',
    color: 'from-emerald-400 to-green-600',
    iconColor: 'text-emerald-400'
  },
  {
    icon: Wallet,
    title: 'Policy Marketplace',
    desc: 'Browse, compare, and instantly purchase comprehensive coverage tailored to your specific needs.',
    color: 'from-amber-400 to-orange-600',
    iconColor: 'text-amber-400'
  },
  {
    icon: Lock,
    title: 'Automated Settlements',
    desc: 'Once approved, trigger instantaneous bank transfers directly to the policyholder’s registered account.',
    color: 'from-sky-400 to-cyan-600',
    iconColor: 'text-sky-400'
  },
  {
    icon: PieChart,
    title: 'Analytics & Reporting',
    desc: 'Enterprise-grade dashboards tracking approval rates, assessor efficiency, and payout volumes.',
    color: 'from-pink-400 to-rose-600',
    iconColor: 'text-pink-400'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[var(--color-base-950)] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_60%)] blur-[80px]" />
      <div className="absolute bottom-0 left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,oklch(40%_0.15_270_/_0.03)_0%,transparent_60%)] blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6"
          >
            Enterprise-grade capabilities.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-base-400)] to-white">Zero technical debt.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--color-base-400)]"
          >
            Built on a modern tech stack to ensure reliability, security, and lightning-fast performance across every workflow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group relative p-[1px] rounded-2xl bg-white/[0.05] hover:bg-transparent transition-colors overflow-hidden"
            >
              {/* Animated gradient border on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative h-full bg-[#0A0A0A] p-6 rounded-[15px] border border-transparent group-hover:border-white/10 transition-colors z-10 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-white/70 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-base-400)] leading-relaxed flex-1">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
