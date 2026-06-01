'use client';
// ============================================================
// components/landing/Testimonials.tsx
// Redesigned premium testimonial slider carousel with drag support,
// rating stars, and verified user badges.
// ============================================================

import React from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Rohan Sharma',
    role: 'Health Policyholder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'Filing my medical claim on InsuraCore was remarkably fast. The guided wizard walked me through it, and the payment was released in under 24 hours.',
    rating: 5,
  },
  {
    name: 'Dr. Anjali Mehta',
    role: 'Senior Assessor Partner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'The assessor workspace organizes claimant documents neatly. I can verify paperwork and approve settlements in one simple dual-pane layout.',
    rating: 5,
  },
  {
    name: 'Suresh Iyer',
    role: 'Operations Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'With InsuraCore, we minimized administrative overhead and improved processing accuracy. Real-time stats give us full visibility into pipeline delays.',
    rating: 5,
  },
];

export function Testimonials() {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section id="testimonials" ref={ref} className="relative z-10 py-24 sm:py-32 bg-[var(--color-base-950)] border-b border-[var(--color-base-900)] scroll-mt-16 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold">
            💬 Verified Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted Across the Nation
          </h2>
        </div>

        {/* Carousel Slider Panel */}
        <div className="relative min-h-[300px] sm:min-h-[250px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="p-6 sm:p-8 rounded-3xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] backdrop-blur-xl max-w-2xl relative w-full flex flex-col justify-between"
            >
              {/* Quote Icon underlay */}
              <Quote className="absolute top-4 left-4 w-12 h-12 text-[rgba(255,255,255,0.015)] pointer-events-none" />

              <div className="space-y-6">
                {/* Stars */}
                <div className="flex justify-center gap-1">
                  {[...Array(TESTIMONIALS[activeIdx].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm sm:text-base text-[var(--color-base-300)] italic leading-relaxed">
                  &ldquo;{TESTIMONIALS[activeIdx].quote}&ldquo;
                </p>

                {/* User Bio */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-11 h-11 rounded-full border border-[var(--color-base-800)] overflow-hidden bg-[var(--color-base-900)] flex-shrink-0">
                    <img 
                      src={TESTIMONIALS[activeIdx].avatar} 
                      alt={TESTIMONIALS[activeIdx].name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      {TESTIMONIALS[activeIdx].name}
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                    </h4>
                    <span className="text-[10px] text-[var(--color-base-500)] font-semibold">{TESTIMONIALS[activeIdx].role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-[var(--color-base-800)] bg-[var(--color-base-950)] hover:bg-[var(--color-base-900)] text-[var(--color-base-400)] hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeIdx === idx ? 'w-5 bg-[oklch(72%_0.20_230)]' : 'w-1.5 bg-[var(--color-base-800)]'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-[var(--color-base-800)] bg-[var(--color-base-950)] hover:bg-[var(--color-base-900)] text-[var(--color-base-400)] hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
