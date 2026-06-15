'use client';
// ============================================================
// components/landing/AISecuritySection.tsx
// Redesigned futuristic AI Copilot section.
// Integrates the pre-built interactive AIAssistantFAQ inside a premium frame.
// ============================================================

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Bot, ShieldCheck, FileText, Activity, Layers, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { AIAssistantFAQ } from '@/components/shared/AIAssistantFAQ';
import Link from 'next/link';

export function AISecuritySection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="ai-assistant" ref={ref} className="relative bg-[var(--color-base-950)] border-y border-[var(--color-base-900)] py-24 sm:py-32 scroll-mt-16 overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle,oklch(65%_0.15_75_/_0.04)_0%,transparent_60%)] blur-[60px] pointer-events-none" />
      <div className="absolute top-20 right-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_60%)] blur-[50px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* PREMIUM SECTION HEADER */}
        <div className="text-center mb-16 space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-bold shadow-[0_0_20px_oklch(58%_0.22_230_/_0.15)] relative overflow-hidden group cursor-default"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI-Powered Support
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight"
          >
            Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(78%_0.18_75)] via-[oklch(72%_0.20_230)] to-[oklch(65%_0.20_25)]">AI Copilot</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[var(--color-base-400)] max-w-2xl mx-auto leading-relaxed"
          >
            Get instant answers about policies, claims, settlements, and platform workflows. Experience enterprise-grade intelligence designed to accelerate your insurance journey.
          </motion.p>
        </div>

        {/* INTERACTIVE CHAT & WORKSPACE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <AIAssistantFAQ />
        </motion.div>

        {/* AI INSIGHTS & RECOMMENDATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[oklch(78%_0.18_75)]" />
            AI Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Travel Policies", desc: "Your active travel policy fully covers emergency medical treatment abroad.", color: "text-[oklch(72%_0.20_230)]", bg: "bg-[oklch(72%_0.20_230)]/10", border: "border-[oklch(72%_0.20_230)]/20" },
              { icon: FileText, title: "Property Claims", desc: "Property claims above ₹50,000 require strict ownership verification.", color: "text-[oklch(65%_0.20_25)]", bg: "bg-[oklch(65%_0.20_25)]/10", border: "border-[oklch(65%_0.20_25)]/20" },
              { icon: Activity, title: "Health Documentation", desc: "Health claims may require hospital discharge summaries.", color: "text-[oklch(78%_0.18_75)]", bg: "bg-[oklch(78%_0.18_75)]/10", border: "border-[oklch(78%_0.18_75)]/20" },
              { icon: CheckCircle2, title: "Policy Renewals", desc: "You have no pending policy renewals for the next 90 days.", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
            ].map((insight, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[var(--color-base-900)] border border-[var(--color-base-800)] hover:border-[var(--color-base-700)] transition-all group hover:-translate-y-1 shadow-lg shadow-black/20">
                <div className={`w-10 h-10 rounded-xl ${insight.bg} ${insight.border} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{insight.title}</h4>
                <p className="text-xs text-[var(--color-base-400)] leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SMART QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[var(--color-base-400)] mr-2">Smart Quick Links:</span>
            {[
              { label: "Check Coverage", href: "/policies" },
              { label: "Track Claims", href: "/login" },
              { label: "Upload Documents", href: "/login" },
              { label: "Contact Assessor", href: "/login" }
            ].map((action, idx) => (
              <Link 
                key={idx} 
                href={action.href}
                className="px-4 py-2 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)] hover:bg-[var(--color-base-850)] hover:border-[var(--color-brand-500)/50] text-xs font-semibold text-white transition-all flex items-center gap-1.5 group"
              >
                {action.label}
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-base-500)] group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
