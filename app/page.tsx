import type { Metadata } from 'next';
// ============================================================
// app/page.tsx
// Complete homepage redesign incorporating premium custom components,
// high-fidelity visuals, Framer Motion, and cinematic typography.
// ============================================================

import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { AISecuritySection } from '@/components/landing/AISecuritySection';
import { Testimonials } from '@/components/landing/Testimonials';
import { AccordionFAQ } from '@/components/landing/AccordionFAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'InsuraCore — Enterprise Insurance Claim Platform',
  description:
    'InsuraCore is a modern insurance claim management platform. Purchase policies, file claims instantly, and track settlements in real time.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-base-950)] text-[var(--color-base-200)] scroll-smooth overflow-x-hidden selection:bg-[oklch(58%_0.22_230_/_0.3)] selection:text-white">
      {/* Premium sticky glassmorphic navigation bar */}
      <Navbar />

      {/* Hero section containing living dashboard mockup */}
      <HeroSection />

      {/* Metric showcase with animated number counters */}
      <StatsSection />

      {/* High-fidelity visual storytelling about block */}
      <AboutSection />

      {/* Interactive AI chatbot preview section */}
      <AISecuritySection />

      {/* Grid of glass feature cards with glowing gradient borders */}
      <FeaturesSection />

      {/* Horizontal horizontal process timeline */}
      <WorkflowSection />

      {/* Drag-supported verified rating carousel */}
      <Testimonials />

      {/* Smooth height FAQ accordion */}
      <AccordionFAQ />

      {/* Dramatic glow Final CTA banner */}
      <FinalCTA />

      {/* Sophisticated newsletter and link directory footer */}
      <Footer />
    </div>
  );
}
