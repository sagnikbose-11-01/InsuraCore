'use client';
// ============================================================
// components/landing/AboutSection.tsx
// Redesigned modern, visual storytelling layout for the About section.
// Split layout: Content details + visual interactive glass cards.
// ============================================================

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Info, Check, ShieldCheck, HeartHandshake, Eye } from 'lucide-react';

export function AboutSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 scroll-mt-16 relative">
      {/* Background orb lighting */}
      <div className="absolute right-[-10%] top-1/4 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* LEFT: Text & Core highlights */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold"
          >
            <Info className="w-3.5 h-3.5" />
            Transparent Ecosystem
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]"
          >
            Empowering Policyholders With Instant Digital Claims
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[var(--color-base-400)] leading-relaxed"
          >
            InsuraCore was built to fully eliminate structural delays, hidden rules, and administrative bottlenecks in modern insurance claiming. By orchestrating customers, expert assessors, and administrative payouts in a single real-time ledger, we make security immediate.
          </motion.p>

          {/* Bullet highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-5 pt-4"
          >
            {[
              {
                title: 'Compliant Design',
                desc: 'Strictly aligned with latest IRDAI claim processing frameworks.',
                icon: <ShieldCheck className="w-4 h-4 text-[oklch(72%_0.17_150)]" />,
              },
              {
                title: 'Auditable Outcomes',
                desc: 'Transparent payout generation with clear, immutable audit logs.',
                icon: <Eye className="w-4 h-4 text-[oklch(72%_0.20_230)]" />,
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1">{item.title}</h4>
                  <p className="text-xs text-[var(--color-base-500)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT: High-fidelity Layered Showcase cards */}
        <div className="lg:col-span-5 relative mt-6 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Card 1: End-to-End Cryptography */}
            <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl relative overflow-hidden group hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,oklch(72%_0.20_230_/_0.04)_0%,transparent_60%)] pointer-events-none" />
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center text-[oklch(72%_0.20_230)] flex-shrink-0">
                  🔒
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[oklch(72%_0.20_230)] uppercase tracking-wider">Secure Platform</span>
                  <h3 className="text-sm font-bold text-white mt-0.5 mb-1.5">End-to-End Encryption</h3>
                  <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                    All policy files and health/invoice receipt documents are protected in transit using TLS 1.3 and encrypted at rest with industry-standard AES-256 blocks.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Assessor network */}
            <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl relative overflow-hidden group hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,oklch(72%_0.17_150_/_0.04)_0%,transparent_60%)] pointer-events-none" />
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)] flex items-center justify-center text-[oklch(72%_0.17_150)] flex-shrink-0">
                  👥
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[oklch(72%_0.17_150)] uppercase tracking-wider">Independent Audit</span>
                  <h3 className="text-sm font-bold text-white mt-0.5 mb-1.5">Expert Verification Network</h3>
                  <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                    Dedicated workspaces enable independent, certified medical and loss appraisers to review claim documents neutrally, ensuring fair, fast outcomes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
