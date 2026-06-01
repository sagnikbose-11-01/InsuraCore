'use client';
// ============================================================
// components/landing/AccordionFAQ.tsx
// Redesigned FAQ section using clean smooth height animated accordions.
// ============================================================

import React from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How fast are claims settled on InsuraCore?',
    a: 'Claims processed through InsuraCore average a resolution audit time of under 48 hours. Once an assessor reviews and approves the claim parameters, payouts are dispatched instantly by the system administrator.',
  },
  {
    q: 'What verification guidelines are followed during audits?',
    a: 'Assessors perform independent reviews of all submitted claims in strict compliance with current IRDAI regulatory guidelines and the specific coverage conditions of the policyholder\'s purchased insurance plan.',
  },
  {
    q: 'Are the uploaded files and data secure?',
    a: 'Yes, all uploaded health records, invoices, diagnostic receipts, and personal data are protected by bank-grade AES-256 encryption at rest and TLS 1.3 in transit.',
  },
  {
    q: 'How can I check the live status of my claim?',
    a: 'Simply access the customer dashboard to monitor claim statuses in real time. The timeline shows exactly whether your claim is SUBMITTED, UNDER REVIEW, APPROVED, or PAID.',
  },
];

export function AccordionFAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" ref={ref} className="max-w-4xl mx-auto px-4 py-24 sm:py-32 scroll-mt-16 relative">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          Common Questions
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[rgba(255,255,255,0.08)]"
            >
              <button
                onClick={() => toggle(idx)}
                className="flex items-center justify-between w-full p-5 text-left text-sm sm:text-base font-semibold text-[var(--color-base-200)] hover:bg-[rgba(255,255,255,0.02)] transition-all"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  className={`w-4 h-4 text-[var(--color-base-500)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[oklch(72%_0.20_230)]' : ''}`} 
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--color-base-400)] leading-relaxed border-t border-[rgba(255,255,255,0.03)] mt-1 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
