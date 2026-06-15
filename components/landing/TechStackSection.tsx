'use client';
// ============================================================
// components/landing/TechStackSection.tsx
// Recruiter-focused section highlighting modern stack and architecture.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Database, Layout, Shield } from 'lucide-react';

const TECH_STACK = [
  {
    category: 'Frontend Architecture',
    icon: Layout,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    techs: ['Next.js 14 App Router', 'React Server Components', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
  },
  {
    category: 'Backend & Data',
    icon: Database,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    techs: ['MongoDB (Mongoose)', 'Next.js API Routes', 'Server Actions', 'Vercel Edge', 'GridFS Storage']
  },
  {
    category: 'Security & Auth',
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    techs: ['Custom JWT Middleware', 'HTTP-Only Cookies', 'Role-Based Access (RBAC)', 'AES-256 Encryption', 'Bcrypt Hashing']
  },
  {
    category: 'AI & Integrations',
    icon: Code2,
    color: 'text-[var(--color-brand-400)]',
    bg: 'bg-[var(--color-brand-500)]/10',
    border: 'border-[var(--color-brand-500)]/20',
    techs: ['NLP Intent Parsing', 'Fuzzy Keyword Matching', 'Automated Fraud Rules', 'Chart.js / Recharts', 'Lucide Icons']
  }
];

export function TechStackSection() {
  return (
    <section className="py-24 bg-[var(--color-base-950)] border-y border-white/5 relative overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">scale.</span>
          </h2>
          <p className="text-[var(--color-base-400)] text-lg">
            A production-ready monolithic architecture demonstrating full-stack proficiency, strict typings, and enterprise design patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TECH_STACK.map((stack, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-colors shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${stack.bg} ${stack.border} border`}>
                <stack.icon className={`w-6 h-6 ${stack.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{stack.category}</h3>
              <ul className="space-y-3">
                {stack.techs.map((tech, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-base-300)] font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${stack.color.replace('text-', 'bg-')}`} />
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
