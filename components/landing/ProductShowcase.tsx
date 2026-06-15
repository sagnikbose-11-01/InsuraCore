'use client';
// ============================================================
// components/landing/ProductShowcase.tsx
// Interactive tabbed preview showing different platform roles.
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Settings, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TABS = [
  { id: 'customer', label: 'Customer Portal', icon: User, color: 'text-blue-400' },
  { id: 'assessor', label: 'Assessor Console', icon: ShieldCheck, color: 'text-emerald-400' },
  { id: 'admin', label: 'Admin Workspace', icon: Settings, color: 'text-rose-400' },
  { id: 'ai', label: 'AI Copilot', icon: Sparkles, color: 'text-[var(--color-brand-400)]' },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('customer');

  return (
    <section id="product" className="relative py-24 bg-[var(--color-base-950)] overflow-hidden border-t border-[var(--color-base-900)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            One platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-base-400)] to-white">Every workflow.</span>
          </h2>
          <p className="text-[var(--color-base-400)] text-base sm:text-lg">
            Purpose-built interfaces designed for speed and clarity, no matter your role.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive ? 'text-white' : 'text-[var(--color-base-500)] hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-full shadow-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`w-4 h-4 relative z-10 ${isActive ? tab.color : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="relative mx-auto max-w-5xl h-[450px] sm:h-[500px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] shadow-2xl overflow-hidden perspective-1000">
          <AnimatePresence mode="wait">
            {activeTab === 'customer' && (
              <motion.div
                key="customer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 p-6 flex flex-col"
              >
                {/* Customer View Mockup */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">My Policies</h3>
                      <p className="text-xs text-[var(--color-base-500)]">Manage your active coverage</p>
                    </div>
                  </div>
                  <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">
                    File Claim
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Health</span>
                      <span className="text-emerald-400 text-xs font-semibold">Active</span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 truncate">Comprehensive Family Health</h4>
                    <p className="text-[11px] text-[var(--color-base-400)] mb-3">Coverage: ₹10,00,000</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[15%] h-full bg-blue-400 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Auto</span>
                      <span className="text-emerald-400 text-xs font-semibold">Active</span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 truncate">Sedan Premium Cover</h4>
                    <p className="text-[11px] text-[var(--color-base-400)] mb-3">Coverage: ₹5,00,000</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[0%] h-full bg-amber-400 rounded-full" />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Property</span>
                      <span className="text-[var(--color-base-500)] text-xs font-semibold">Pending</span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 truncate">Urban Villa Protection</h4>
                    <p className="text-[11px] text-[var(--color-base-400)] mb-3">Coverage: ₹50,00,000</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[0%] h-full bg-purple-400 rounded-full" />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Life</span>
                      <span className="text-emerald-400 text-xs font-semibold">Active</span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 truncate">Term Insurance 99</h4>
                    <p className="text-[11px] text-[var(--color-base-400)] mb-3">Coverage: ₹1,00,00,000</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[5%] h-full bg-rose-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assessor' && (
              <motion.div
                key="assessor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 p-6 flex flex-col"
              >
                {/* Assessor View Mockup */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Assessor Console</h3>
                      <p className="text-xs text-[var(--color-base-500)]">12 pending claims for review</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-5 gap-4 p-3 border-b border-white/10 bg-white/5 text-xs font-semibold text-[var(--color-base-400)]">
                    <div className="col-span-1">Claim ID</div>
                    <div className="col-span-2">Policyholder</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  {[
                    { id: 'CLM-8821', user: 'Rahul Sharma', amt: '₹45,000', status: 'Under Review', color: 'text-amber-400' },
                    { id: 'CLM-8822', user: 'Priya Patel', amt: '₹1,20,000', status: 'Requires Documents', color: 'text-rose-400' },
                    { id: 'CLM-8823', user: 'Amit Singh', amt: '₹15,500', status: 'Pending Verification', color: 'text-blue-400' },
                    { id: 'CLM-8824', user: 'Sneha Gupta', amt: '₹75,000', status: 'Approved', color: 'text-emerald-400' },
                    { id: 'CLM-8825', user: 'Karan Malhotra', amt: '₹2,50,000', status: 'Under Review', color: 'text-amber-400' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 hover:bg-white/[0.03] text-sm text-[var(--color-base-300)] items-center transition-colors">
                      <div className="col-span-1 font-mono text-xs">{row.id}</div>
                      <div className="col-span-2 font-medium text-white">{row.user}</div>
                      <div className="col-span-1">{row.amt}</div>
                      <div className={`col-span-1 text-xs font-semibold ${row.color}`}>{row.status}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 p-6 flex flex-col"
              >
                {/* Admin View Mockup */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Admin Workspace</h3>
                      <p className="text-xs text-[var(--color-base-500)]">System overview & metrics</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['Total Users', 'Active Assessors', 'Monthly Payouts'].map((metric, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-[var(--color-base-400)] mb-1 uppercase tracking-wider font-semibold">{metric}</p>
                      <p className="text-2xl font-bold text-white">{i === 0 ? '1,245' : i === 1 ? '34' : '₹4.2M'}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-end gap-2">
                  {[40, 60, 45, 80, 55, 90, 75, 100, 65, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-rose-500/20 to-rose-400/80 rounded-t-sm transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 p-6 flex flex-col bg-gradient-to-br from-[#0A0A0A] to-[var(--color-brand-950)]/20"
              >
                {/* AI Copilot Mockup */}
                <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-4 pb-4">
                  <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">U</div>
                    <div className="p-3 bg-white/10 border border-white/20 rounded-2xl rounded-tr-sm text-sm text-white backdrop-blur-sm">
                      Does my travel policy cover emergency evacuation in Japan?
                    </div>
                  </div>
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)]/20 border border-[var(--color-brand-500)]/40 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[var(--color-brand-400)]" />
                    </div>
                    <div className="p-4 bg-black/40 border border-[var(--color-brand-500)]/20 rounded-2xl rounded-tl-sm text-sm text-[var(--color-base-200)] backdrop-blur-md">
                      <p className="mb-2">Yes! Your <strong>Global Nomad Travel Policy (POL-9921)</strong> includes comprehensive coverage for emergency evacuation in Japan.</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--color-base-400)]">
                        <li>Medical Evacuation: Up to $100,000</li>
                        <li>Repatriation: Fully covered</li>
                        <li>24/7 Helpline: +1-800-INSURA-HELP</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center gap-3 mt-auto backdrop-blur-xl">
                  <input type="text" placeholder="Ask the Copilot..." className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[var(--color-base-500)] px-2" disabled />
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
