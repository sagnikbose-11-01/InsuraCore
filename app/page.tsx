import type { Metadata } from 'next';
// ============================================================
// app/page.tsx
// Complete homepage redesign incorporating premium custom components,
// high-fidelity visuals, Framer Motion, and cinematic typography.
// Features a monolithic architecture with dynamic role workspaces.
// ============================================================

import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { StatsSection } from '@/components/landing/StatsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { RoleShowcase } from '@/components/landing/RoleShowcase';
import { AISecuritySection } from '@/components/landing/AISecuritySection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { AnalyticsShowcase } from '@/components/landing/AnalyticsShowcase';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'InsuraCore — Enterprise Insurance Claim Platform',
  description:
    'InsuraCore is a modern AI-powered insurance claim management platform. Purchase policies, file claims instantly, and track settlements in real time.',
};

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-base-200)] scroll-smooth overflow-x-hidden selection:bg-[oklch(58%_0.22_230_/_0.3)] selection:text-white font-sans">
      
      {/* 1. Premium sticky glassmorphic navigation bar */}
      <Navbar session={session} />

      {/* 2. Enterprise Hero section containing living dashboard mockup */}
      <HeroSection session={session} />

      {/* 3. Interactive Platform Preview for all 4 roles */}
      <ProductShowcase />

      {/* 4. Metric showcase with animated number counters */}
      <StatsSection />

      {/* 5. Grid of glass feature cards with glowing gradient borders */}
      <FeaturesSection />

      {/* 6. Horizontal process timeline connecting workflows */}
      <WorkflowSection />

      {/* 7. Dedicated deep-dives into specific workspaces */}
      <RoleShowcase />

      {/* 8. Interactive AI Copilot workspace */}
      <AISecuritySection />

      {/* 9. Cybersecurity-inspired enterprise auth & RBAC section */}
      <SecuritySection />

      {/* 10. Admin analytics and KPI charts */}
      <AnalyticsShowcase />

      {/* 11. Recruiter-focused section highlighting tech stack */}
      <TechStackSection />

      {/* 12. Verified rating carousel */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />

      {/* 13. Dramatic glow Final CTA banner */}
      <FinalCTA />

      {/* 14. Sophisticated newsletter and link directory footer */}
      <Footer />

    </div>
  );
}
