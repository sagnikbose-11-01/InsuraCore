'use client';
// ============================================================
// components/landing/AnalyticsShowcase.tsx
// Demonstrates KPI charts and admin analytics capabilities.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';

export function AnalyticsShowcase() {
  return (
    <section className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <BarChart3 className="w-3.5 h-3.5" />
            Real-Time Analytics
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            See the big picture. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Instantly.</span>
          </h2>
          <p className="text-[var(--color-base-400)]">
            Enterprise-grade reporting dashboards give administrators complete visibility into claims velocity, payout volumes, and platform health.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Large Main Chart Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Monthly Payout Volume</h3>
                <p className="text-xs text-[var(--color-base-500)]">Total claims settled in the last 6 months</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">₹14.2M</p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" /> +12.5%</p>
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4].map((i) => <div key={i} className="w-full border-t border-white/5" />)}
              </div>
              
              {/* Bars */}
              {[45, 60, 30, 80, 55, 100].map((h, i) => (
                <div key={i} className="w-full bg-white/5 rounded-t-lg relative group h-full flex items-end">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:opacity-80 relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{(h * 0.14).toFixed(1)}M
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-[var(--color-base-500)] font-semibold uppercase px-2">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </motion.div>

          {/* Small side metrics */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold">Claim Distribution</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Health', val: 65, color: 'bg-emerald-400' },
                  { label: 'Auto', val: 25, color: 'bg-blue-400' },
                  { label: 'Property', val: 10, color: 'bg-amber-400' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-base-300)]">{item.label}</span>
                      <span className="text-white font-bold">{item.val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold">System Health</h3>
              </div>
              
              <div className="flex items-center justify-center h-20">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">99.99<span className="text-lg text-[var(--color-base-500)]">%</span></p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">All services operational</p>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
