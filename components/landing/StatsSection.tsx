'use client';
// ============================================================
// components/landing/StatsSection.tsx
// Glass metric showcase with smooth counting numbers and trend charts.
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Users, FileText, CheckCircle } from 'lucide-react';

const STATS = [
  { value: 125000, suffix: '+', label: 'Policies Managed', icon: FileText, color: 'text-blue-400' },
  { value: 45000, suffix: '+', label: 'Claims Processed', icon: CheckCircle, color: 'text-emerald-400' },
  { value: 320, suffix: '+', label: 'Assessors Active', icon: Users, color: 'text-amber-400' },
  { value: 1.2, suffix: 'M+', label: 'AI Queries Handled', icon: TrendingUp, color: 'text-[var(--color-brand-400)]' },
];

export function StatsSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="relative z-10 border-y border-[var(--color-base-900)] bg-[var(--color-base-950)] py-16 sm:py-20 overflow-hidden">
      <div className="absolute top-0 right-[20%] w-[500px] h-[300px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_70%)] blur-[50px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              className="relative p-5 sm:p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#0A0A0A] shadow-[0_10px_30px_rgba(0,0,0,0.5)] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <stat.icon className={`w-12 h-12 ${stat.color}`} />
              </div>

              <div className="relative z-10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 border bg-white/[0.02] border-white/5 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline mb-1">
                  <Counter value={stat.value} isDecimal={stat.value === 1.2} startTrigger={isInView} />
                  <span className="text-xl sm:text-2xl ml-0.5">{stat.suffix}</span>
                </h3>
                <p className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ value, isDecimal, startTrigger }: { value: number; isDecimal?: boolean; startTrigger: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startTrigger) return;

    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, startTrigger]);

  if (isDecimal) {
    return <span>{count.toFixed(1)}</span>;
  }
  return <span>{Math.floor(count).toLocaleString()}</span>;
}
