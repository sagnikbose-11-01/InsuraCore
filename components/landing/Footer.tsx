'use client';
// ============================================================
// components/landing/Footer.tsx
// Redesigned high-fidelity premium footer with integrated
// email newsletter CTA, social icons, and hover transition lists.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Clock, Send, Sparkles } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <footer className="border-t border-[var(--color-base-900)] bg-[var(--color-base-950)] text-xs text-[var(--color-base-500)] relative overflow-hidden">
      {/* Decorative background visual glow */}
      <div className="absolute left-[10%] bottom-[-10%] w-[300px] h-[300px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[var(--color-base-900)]">
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center shadow-[0_0_12px_oklch(58%_0.22_230_/_0.3)]">
                <span className="text-white font-black text-xs tracking-tight">IC</span>
              </div>
              <span className="font-bold text-base text-white tracking-tight">InsuraCore</span>
            </div>
            
            <p className="text-xs text-[var(--color-base-400)] leading-relaxed max-w-sm">
              Empowering policyholders with secure, transparent, and next-generation claims processing systems. Built on regulatory-compliant IRDAI frameworks.
            </p>

            {/* Newsletter form */}
            <div className="space-y-2 pt-2">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-base-300)]">Subscribe to Updates</h5>
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-[var(--color-base-900)] border border-[var(--color-base-800)] focus:border-[var(--color-brand-500)] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-[var(--color-base-600)] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] text-white font-semibold rounded-xl px-4 py-2 transition-all flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              {isSubmitted && (
                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Navigation</h5>
            <ul className="space-y-2.5">
              {['About', 'AI Assistant', 'Features', 'Workflow', 'Testimonials', 'FAQ'].map((link) => (
                <li key={link}>
                  <Link 
                    href={`#${link.toLowerCase().replace(' ', '-')}`} 
                    className="hover:text-[var(--color-brand-300)] transition-colors block duration-150"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Roles */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Platform Roles</h5>
            <ul className="space-y-2.5">
              {['Customer Portal', 'Assessor Workspace', 'Admin Dashboard'].map((role) => (
                <li key={role}>
                  <Link 
                    href="/login" 
                    className="hover:text-[var(--color-brand-300)] transition-colors block duration-150"
                  >
                    {role}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="md:col-span-3 space-y-4">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Legal & Compliance</h5>
            <ul className="space-y-2.5">
              {['Terms of Service', 'Privacy Policy', 'IRDAI Disclosures', 'Uptime SLA Statement'].map((legal) => (
                <li key={legal}>
                  <span className="cursor-not-allowed hover:text-[var(--color-brand-300)] block duration-150">
                    {legal}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[var(--color-base-650)]">
            © 2026 InsuraCore Claims System. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[var(--color-base-550)] font-semibold">
            <Clock className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span>99.9% Uptime SLA Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
