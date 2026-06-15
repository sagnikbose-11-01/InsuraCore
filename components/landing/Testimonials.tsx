'use client';
// ============================================================
// components/landing/Testimonials.tsx
// Redesigned premium testimonial slider carousel with drag support,
// rating stars, and verified user badges.
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Jenkins',
    role: 'VP Operations, GlobalCare',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'InsuraCore fundamentally transformed how we handle claims. The AI Copilot alone reduced our initial triaging time by 85%. It feels like software from the future.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Independent Assessor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'The assessor workspace is a masterclass in UX. Everything from document verification to the one-click settlement authorization is flawlessly executed.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Policyholder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'I filed a medical claim from my phone while leaving the hospital. The money was in my account the next morning. Absolutely incredible experience.',
    rating: 5,
  },
];

export function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  const handlePrev = () => setActiveIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,oklch(40%_0.15_270_/_0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Trusted by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">best.</span>
          </h2>
          <p className="text-[var(--color-base-400)] text-lg">
            Hear from policyholders, independent assessors, and enterprise administrators who rely on InsuraCore daily.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          
          <div className="absolute top-1/2 -left-4 sm:-left-12 -translate-y-1/2 z-20">
            <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg">
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 sm:-right-12 -translate-y-1/2 z-20">
            <button onClick={handleNext} className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg">
              <ChevronRight className="w-5 h-5 pl-0.5" />
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl relative">
            <Quote className="absolute top-6 left-6 w-16 h-16 text-white/[0.03] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="p-8 sm:p-12 text-center flex flex-col items-center"
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(TESTIMONIALS[activeIdx].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-xl sm:text-2xl text-[var(--color-base-200)] font-medium leading-relaxed mb-10 max-w-2xl">
                  &ldquo;{TESTIMONIALS[activeIdx].quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-white/10 overflow-hidden bg-[var(--color-base-900)]">
                    <img 
                      src={TESTIMONIALS[activeIdx].avatar} 
                      alt={TESTIMONIALS[activeIdx].name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-bold text-base flex items-center gap-1.5">
                      {TESTIMONIALS[activeIdx].name}
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-400)]" />
                    </h4>
                    <span className="text-sm text-[var(--color-base-500)]">{TESTIMONIALS[activeIdx].role}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activeIdx ? 'w-6 bg-white' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
