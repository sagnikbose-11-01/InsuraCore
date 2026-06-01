'use client';
// ============================================================
// components/landing/StatsSection.tsx
// Glass metric showcase with smooth counting numbers and trend charts.
// ============================================================

import React from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 50000, suffix: '+', label: 'Claims Processed', trend: '↑ 18.5% YoY', desc: 'Accelerated through automated verification' },
  { value: 2.4, prefix: '₹', suffix: 'B', label: 'Total Settlements', trend: '↑ 24% YoY', desc: 'Securely dispatched direct to bank' },
  { value: 94, suffix: '%', label: 'Approval Rate', trend: '↑ 2.1% MoM', desc: 'IRDAI-compliant transparent decisions' },
  { value: 48, prefix: '< ', suffix: 'h', label: 'Avg. Resolution', trend: '↓ 40% vs Ind.', desc: 'Industry-leading swift payouts' },
];

export function StatsSection() {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="relative z-10 border-y border-[var(--color-base-900)] bg-[var(--color-base-950)] py-16 sm:py-20">
      {/* Dynamic background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(58%_0.22_230_/_0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.12)' }}
              className="relative p-6 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Outer hover border glow */}
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,oklch(58%_0.22_230_/_0.06)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Trend indicator Pill */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-[var(--color-base-550)] font-mono uppercase tracking-wider">Metrics</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-[oklch(20%_0.05_150)] text-green-400 border border-[oklch(30%_0.08_150)]">
                    {stat.trend}
                  </span>
                </div>

                {/* Animated Stat Value */}
                <h3 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline">
                  {stat.prefix && <span className="text-xl text-[var(--color-base-400)] mr-1">{stat.prefix}</span>}
                  <Counter value={stat.value} isDecimal={stat.value === 2.4} startTrigger={isInView} />
                  {stat.suffix && <span className="text-xl text-[var(--color-base-300)] ml-0.5">{stat.suffix}</span>}
                </h3>

                <p className="mt-1 text-xs font-bold text-[var(--color-base-200)] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>

              <p className="mt-4 text-[11px] text-[var(--color-base-500)] leading-relaxed">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Micro Counter Component
function Counter({ value, isDecimal, startTrigger }: { value: number; isDecimal?: boolean; startTrigger: boolean }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!startTrigger) return;

    let start = 0;
    const end = value;
    const duration = 1200; // ms
    const increment = end / (duration / 16); // ~60fps

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
