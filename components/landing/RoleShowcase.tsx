'use client';
// ============================================================
// components/landing/RoleShowcase.tsx
// Deep dive into workspaces for Customers, Assessors, and Admins.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Settings, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const ROLES = [
  {
    id: 'customer',
    title: 'For Policyholders',
    icon: User,
    color: 'from-blue-500/20 to-blue-500/0',
    iconColor: 'text-blue-400',
    borderColor: 'group-hover:border-blue-500/50',
    features: ['Instant Policy Purchase', '1-Click Claim Filing', 'Real-time Tracking'],
    desc: 'A seamless, consumer-grade portal to manage your coverage and file claims in minutes without navigating confusing paperwork.'
  },
  {
    id: 'assessor',
    title: 'For Assessors',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-emerald-500/0',
    iconColor: 'text-emerald-400',
    borderColor: 'group-hover:border-emerald-500/50',
    features: ['Document Verification Hub', 'AI Fraud Flags', '1-Click Approvals'],
    desc: 'An optimized auditing console designed to help independent assessors review, verify, and approve claims with maximum efficiency.'
  },
  {
    id: 'admin',
    title: 'For Administrators',
    icon: Settings,
    color: 'from-rose-500/20 to-rose-500/0',
    iconColor: 'text-rose-400',
    borderColor: 'group-hover:border-rose-500/50',
    features: ['System Configuration', 'User Management', 'Payout Execution'],
    desc: 'The mission-control center. Manage the entire platform ecosystem, oversee metrics, and release claim settlements securely.'
  }
];

export function RoleShowcase() {
  return (
    <section className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-base-400)] to-white">everyone.</span>
          </h2>
          <p className="text-[var(--color-base-400)]">
            InsuraCore provides tailored, role-based workspaces that surface exactly what you need, when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 ${role.borderColor} transition-colors duration-500 flex flex-col`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`} />
              
              <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 ${role.iconColor} group-hover:scale-110 transition-transform`}>
                <role.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{role.title}</h3>
              <p className="text-sm text-[var(--color-base-400)] mb-6 leading-relaxed relative z-10 flex-1">
                {role.desc}
              </p>

              <ul className="space-y-3 mb-8 relative z-10">
                {role.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-semibold text-[var(--color-base-300)]">
                    <CheckCircle2 className={`w-4 h-4 ${role.iconColor}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link 
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-white relative z-10 mt-auto group/btn"
              >
                Access Workspace 
                <ArrowRight className={`w-4 h-4 ${role.iconColor} group-hover/btn:translate-x-1 transition-transform`} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
