'use client';
// ============================================================
// components/landing/FAQSection.tsx
// Interactive accordion FAQ section.
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "How long does the claim settlement process usually take?",
    answer: "Our AI-driven engine automates initial document verification, meaning many straightforward claims are processed and settled within 24 hours. Complex claims that require manual assessor review typically take 3-5 business days."
  },
  {
    question: "Is my medical data and personal information secure?",
    answer: "Absolutely. InsuraCore employs military-grade encryption, strict Role-Based Access Control (RBAC), and complies with global data protection regulations to ensure your sensitive medical and personal data is never compromised."
  },
  {
    question: "Can I manage multiple policies under one account?",
    answer: "Yes, our unified dashboard allows you to purchase, track, and manage all your policies—Health, Auto, Home, and more—from a single intuitive interface."
  },
  {
    question: "How does the AI fraud detection work?",
    answer: "Our system cross-references uploaded invoices, diagnostic reports, and historical claim data against known anomaly patterns. If discrepancies are found, the claim is instantly flagged for human review before any payout is authorized."
  },
  {
    question: "Do I need to download an app to use InsuraCore?",
    answer: "No. InsuraCore is a fully responsive web platform built on modern architecture. You can access all features seamlessly from any desktop, tablet, or mobile browser without downloading a dedicated app."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-[#050505] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,oklch(58%_0.22_230_/_0.03)_0%,transparent_60%)] blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[radial-gradient(circle,oklch(40%_0.15_270_/_0.03)_0%,transparent_60%)] blur-[80px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-400)] to-blue-400">Questions</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--color-base-400)] max-w-2xl mx-auto"
          >
            Everything you need to know about the product and billing. For further questions, please contact our support team.
          </motion.p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-white/[0.05] border-white/10' : 'bg-transparent border-white/5 hover:border-white/10'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-lg font-bold text-white pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${isOpen ? 'bg-[var(--color-brand-500)] border-transparent text-white' : 'bg-white/5 border-white/10 text-[var(--color-base-400)] hover:bg-white/10'}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-[var(--color-base-400)] leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
