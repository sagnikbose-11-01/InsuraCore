'use client';
// ============================================================
// components/landing/SecuritySection.tsx
// Highlights JWT Authentication, RBAC, and Secure APIs.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, Server, FileDigit, Database } from 'lucide-react';

export function SecuritySection() {
  return (
    <section id="security" className="py-24 bg-[var(--color-base-950)] border-y border-[var(--color-base-900)] relative overflow-hidden">
      {/* Cybersecurity background visual */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[500px] opacity-10 pointer-events-none">
        <div className="w-full h-full border-[1px] border-[var(--color-brand-500)] rounded-full animate-[spin_60s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
        <div className="absolute inset-4 border-[1px] border-emerald-500 rounded-full animate-[spin_40s_linear_infinite_reverse]" style={{ borderStyle: 'dashed' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <Lock className="w-3.5 h-3.5" />
              Enterprise Security
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Bank-grade security. <br className="hidden sm:block" />
              <span className="text-emerald-400">By default.</span>
            </h2>
            <p className="text-lg text-[var(--color-base-400)] mb-8 leading-relaxed">
              InsuraCore is built on a zero-trust architecture. From document encryption at rest to robust JWT session management, your data is protected at every layer.
            </p>

            <ul className="space-y-6">
              {[
                { icon: Key, title: 'JWT Authentication', desc: 'Stateless, secure HTTP-only cookie sessions preventing XSS attacks.' },
                { icon: FileDigit, title: 'Role-Based Access Control', desc: 'Strict API middleware ensuring users only access authorized resources.' },
                { icon: Database, title: 'Encrypted Storage', desc: 'All PII and uploaded medical documents are securely encrypted at rest.' }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">{item.title}</h4>
                    <p className="text-sm text-[var(--color-base-400)]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Side: Security Terminal Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden font-mono text-xs">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[var(--color-base-500)]">server_logs ~ root</span>
              </div>
              <div className="p-6 space-y-3 text-[var(--color-base-300)]">
                <p><span className="text-emerald-400">[auth]</span> Generating JWT token for user ID: 5f9a3b...</p>
                <p><span className="text-emerald-400">[auth]</span> Setting secure HttpOnly cookie...</p>
                <p><span className="text-blue-400">[middleware]</span> Verifying Role-Based Access: ASSESSOR</p>
                <p><span className="text-emerald-400">[auth]</span> Access GRANTED to /api/claims/review</p>
                <p><span className="text-amber-400">[crypto]</span> Encrypting payload with AES-256-GCM...</p>
                <p><span className="text-amber-400">[crypto]</span> Storing claim #8821 in database...</p>
                <p><span className="text-rose-400">[firewall]</span> Blocked unauthorized access attempt from 192.168.1.100</p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
