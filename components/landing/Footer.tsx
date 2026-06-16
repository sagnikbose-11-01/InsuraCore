'use client';
// ============================================================
// components/landing/Footer.tsx
// Redesigned high-fidelity premium footer with integrated
// email newsletter CTA, social icons, and hover transition lists.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Send, Sparkles, Globe, MessageSquare, Mail } from 'lucide-react';

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
      <div className="absolute left-[10%] bottom-[-10%] w-[400px] h-[400px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[var(--color-base-900)]">
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center shadow-[0_0_12px_oklch(58%_0.22_230_/_0.3)]">
                <span className="text-white font-black text-xs tracking-tight">IC</span>
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">InsuraCore</span>
            </div>
            
            <p className="text-xs text-[var(--color-base-400)] leading-relaxed max-w-sm">
              The next-generation insurance operating system. Manage policies, automate claims, and orchestrate secure settlements through a world-class AI-powered ecosystem.
            </p>

            {/* Newsletter form */}
            <div className="space-y-3 pt-2">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-base-300)]">Subscribe to Engineering Updates</h5>
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-[var(--color-base-900)] border border-[var(--color-base-800)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[var(--color-base-600)] transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] border border-[var(--color-base-800)] hover:border-[var(--color-brand-500)] text-white font-semibold rounded-xl px-4 py-2 transition-all flex items-center justify-center shadow-md group"
                >
                  <Send className="w-4 h-4 text-[var(--color-base-400)] group-hover:text-[var(--color-brand-400)] transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </form>
              {isSubmitted && (
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                  <Sparkles className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-5">
            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Platform</h5>
            <ul className="space-y-3">
              {[
                { name: 'Customer Workspace', href: '/login' },
                { name: 'Assessor Console', href: '/login' },
                { name: 'Admin Dashboard', href: '/login' },
                { name: 'AI Copilot', href: '#ai-assistant' },
                { name: 'Policy Marketplace', href: '/policies' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-brand-500)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="md:col-span-2 space-y-5">
            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Solutions</h5>
            <ul className="space-y-3">
              {['Claims Automation', 'Fraud Detection', 'Document Verification', 'Real-time Analytics', 'Secure Settlements'].map((link) => (
                <li key={link}>
                  <Link href="#" className="hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-brand-500)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security & Tech */}
          <div className="md:col-span-2 space-y-5">
            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Security & Tech</h5>
            <ul className="space-y-3">
              {['JWT Authentication', 'Role-Based Access', 'MongoDB Integration', 'Next.js Architecture', 'API Security'].map((link) => (
                <li key={link}>
                  <Link href="#" className="hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-brand-500)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2 space-y-5">
            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Company</h5>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <Link href="#" className="hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-brand-500)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1 text-[11px]">
            &copy; 2026 InsuraCore. All Rights Reserved By Sagnik Bose.
          </p>

          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] flex items-center justify-center hover:bg-[var(--color-base-800)] hover:text-white transition-all">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] flex items-center justify-center hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white transition-all">
              <MessageSquare className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
