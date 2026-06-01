import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield, ArrowRight, CheckCircle2, FileText,
  ShieldCheck, BarChart3, TrendingUp, Users, Clock,
  Star, ChevronRight, Zap, Bot, HelpCircle, MessageSquare, Info, Sun, Sparkles, User, Check
} from 'lucide-react';
import { AIAssistantFAQ } from '@/components/shared/AIAssistantFAQ';

export const metadata: Metadata = {
  title: 'InsuraCore — Enterprise Insurance Claim Platform',
  description:
    'InsuraCore is a modern insurance claim management platform. Purchase policies, file claims instantly, and track settlements in real time.',
};

const FEATURES = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Smart Policy Management',
    description: 'Browse, compare, and purchase insurance plans tailored to your needs. All in one unified dashboard.',
    color: 'text-[oklch(72%_0.20_230)]',
    bg: 'bg-[oklch(18%_0.08_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Instant Claim Filing',
    description: 'File claims in minutes with our guided multi-step wizard. Upload documents and track status in real time.',
    color: 'text-[oklch(72%_0.20_230)]',
    bg: 'bg-[oklch(18%_0.08_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'AI-Driven Assessment',
    description: 'Claims are automatically routed to specialist assessors for thorough, bias-free review.',
    color: 'text-[oklch(72%_0.20_230)]',
    bg: 'bg-[oklch(18%_0.08_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Real-Time Analytics',
    description: 'Comprehensive dashboards with claim trends, payout analytics, and approval rate insights.',
    color: 'text-[oklch(72%_0.20_230)]',
    bg: 'bg-[oklch(18%_0.08_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Fast Settlements',
    description: 'Approved claims trigger automatic settlement generation. Track every rupee from approval to payout.',
    color: 'text-[oklch(72%_0.20_230)]',
    bg: 'bg-[oklch(18%_0.08_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Enterprise RBAC',
    description: 'Role-based access for Customers, Assessors, and Admins. Every user sees exactly what they need.',
    color: 'text-[oklch(72%_0.20_230)]',
    bg: 'bg-[oklch(18%_0.08_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
];

const STATS = [
  { value: '50K+', label: 'Claims Processed' },
  { value: '₹2.4B', label: 'Total Settlements' },
  { value: '94%', label: 'Approval Rate' },
  { value: '< 48h', label: 'Avg. Resolution' },
];

const FAQS = [
  {
    q: "How fast are claims settled on InsuraCore?",
    a: "Claims processed through InsuraCore average a resolution time of under 48 hours. Once an assessor reviews and approves the claim, payouts are initiated instantly by the administrator."
  },
  {
    q: "What guidelines are followed during claim verification?",
    a: "Assessors review all claims in strict alignment with IRDAI regulatory guidelines and the specific terms of the purchaser's policy to ensure fair and compliant outcomes."
  },
  {
    q: "Are the data and documents secure?",
    a: "Yes, all uploaded health records, invoices, and diagnostic documents are protected by bank-grade encryption at rest and in transit."
  },
  {
    q: "How can I check the status of my claim?",
    a: "Simply log in to your dashboard to track your claim status in real time. You will see whether it is under review, approved, or paid."
  }
];

const TESTIMONIALS = [
  {
    name: "Rohan Sharma",
    role: "Health Policyholder",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    quote: "Filing my medical claim on InsuraCore was remarkably fast. The guided wizard walked me through it, and the payment was released in under 24 hours."
  },
  {
    name: "Dr. Anjali Mehta",
    role: "Senior Assessor Partner",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    quote: "The assessor workspace organizes claimant documents neatly. I can verify paperwork and approve settlements in one simple dual-pane layout."
  },
  {
    name: "Suresh Iyer",
    role: "Operations Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    quote: "With InsuraCore, we minimized administrative overhead and improved processing accuracy. Real-time stats give us full visibility into pipeline delays."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-base-950)] text-[var(--color-base-200)] scroll-smooth">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-base-800)] bg-[var(--color-base-950)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center shadow-[0_0_14px_oklch(58%_0.22_230_/_0.4)]">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--color-base-100)] tracking-tight">
              InsuraCore
            </span>
          </Link>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/policies" className="text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors">
              Policies
            </Link>
            <Link href="#about" className="text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors">
              About
            </Link>
            <Link href="#ai-assistant" className="text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors">
              AI Assistant
            </Link>
            <Link href="#features" className="text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors">
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle placeholder inside rounded border (matches image spec) */}
            <button className="w-9 h-9 rounded-full border border-[var(--color-base-700)] flex items-center justify-center bg-[var(--color-base-900)] text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] hover:bg-[var(--color-base-800)] transition-all">
              <Sun className="w-4 h-4" />
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-sm font-semibold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-5.5 py-2 rounded-xl transition-all shadow-[0_0_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_0_24px_oklch(58%_0.22_230_/_0.45)] hover:-translate-y-0.5"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[oklch(72%_0.20_230)] text-xs font-semibold mb-8">
            <Star className="w-3.5 h-3.5 text-[var(--color-brand-400)] fill-[var(--color-brand-400)]" />
            Enterprise-grade claims management system
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[var(--color-base-100)] max-w-4xl mx-auto">
            Insurance Claims,{' '}
            <span className="bg-gradient-to-r from-[var(--color-brand-300)] to-[var(--color-brand-500)] bg-clip-text text-transparent">Reinvented</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[var(--color-base-400)] max-w-2xl mx-auto leading-relaxed">
            InsuraCore digitizes the complete insurance lifecycle — from policy purchase to settlement payout.
            Built for modern enterprises, trusted by thousands.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-[0_0_24px_oklch(58%_0.22_230_/_0.4)] hover:shadow-[0_0_36px_oklch(58%_0.22_230_/_0.6)] hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[var(--color-base-800)] hover:bg-[var(--color-base-700)] text-[var(--color-base-200)] font-semibold px-8 py-4 rounded-xl text-base border border-[var(--color-base-700)] transition-all hover:-translate-y-0.5"
            >
              Browse Policies <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-base-500)]">
            {['Bank-level encryption', 'IRDAI compliant', 'ISO 27001 certified', '99.9% uptime SLA'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success-400)]" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────── */}
      <section className="border-y border-[var(--color-base-800)] bg-[var(--color-base-900)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3.5xl sm:text-4xl font-extrabold bg-gradient-to-r from-[var(--color-brand-300)] to-[var(--color-brand-500)] bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-[var(--color-base-500)] uppercase tracking-wider font-semibold">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ──────────────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[var(--color-brand-400)] text-xs font-semibold">
              <Info className="w-3.5 h-3.5" />
              About InsuraCore
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight leading-tight">
              Empowering Policyholders With Transparent Digital Claims
            </h2>

            <p className="text-sm sm:text-base text-[var(--color-base-400)] leading-relaxed">
              InsuraCore was founded to eliminate the traditional bottlenecks, opacity, and delays in insurance claim processing. Our system leverages role-based workspaces and strict validation guidelines to connect customers, verification assessors, and administrators in a single source of truth.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-[var(--color-brand-950)] border border-[var(--color-brand-800)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[var(--color-brand-400)]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-base-200)]">Compliant Design</h4>
                  <p className="text-xs text-[var(--color-base-500)] mt-0.5">Aligned with latest IRDAI processing mandates.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-[var(--color-brand-950)] border border-[var(--color-brand-800)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[var(--color-brand-400)]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-base-200)]">Auditable Settlements</h4>
                  <p className="text-xs text-[var(--color-base-500)] mt-0.5">Transparent payment releases with audit logs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid gap-4">
            <div className="glass-card p-5 space-y-2">
              <span className="text-xs font-bold text-[var(--color-brand-400)]">SECURE PLATFORM</span>
              <h3 className="text-base font-semibold text-[var(--color-base-200)]">End-to-End Cryptography</h3>
              <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                All document uploads are processed through TLS encrypt pipelines and encrypted at rest with AES-256 variables.
              </p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <span className="text-xs font-bold text-[var(--color-brand-400)]">EXPERT DRIVEN</span>
              <h3 className="text-base font-semibold text-[var(--color-base-200)]">Verification Assessor Pipeline</h3>
              <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                Dedicated workspaces enable independent claim appraisers to review documentation fairly, eliminating settlement delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT SECTION ───────────────────────────────── */}
      <section id="ai-assistant" className="bg-[var(--color-base-900)] border-y border-[var(--color-base-800)] py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[var(--color-brand-400)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              AI Copilot
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight">
              Interactive AI Assistant FAQ
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-base-400)] max-w-xl mx-auto">
              Have questions? Select any of our 25 frequently asked questions below to receive an instant detailed answer from the AI.
            </p>
          </div>

          {/* Mount interactive FAQ chat workspace */}
          <AIAssistantFAQ />
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight">
            Everything you need to manage claims
          </h2>
          <p className="mt-4 text-base text-[var(--color-base-500)] max-w-xl mx-auto">
            A complete platform for customers, assessors, and administrators.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.bg} border ${f.border} ${f.color} group-hover:scale-110 transition-transform duration-200`}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-[var(--color-base-100)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-base-500)] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKFLOW SECTION ───────────────────────────────────── */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-16 border-t border-[var(--color-base-800)]">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[var(--color-brand-400)] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Process Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight">
            How InsuraCore Works
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-base-500)] max-w-xl mx-auto">
            From policy registration to instant settlement releases — step by step.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[var(--color-brand-500)]/40 via-[var(--color-brand-400)]/30 to-[var(--color-base-800)] -z-10" />

          {/* Step 1 */}
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 relative group">
            <div className="w-14 h-14 rounded-full bg-[var(--color-base-950)] border-2 border-[var(--color-brand-500)] flex items-center justify-center text-lg font-extrabold text-[var(--color-brand-400)] shadow-lg shadow-[oklch(58%_0.22_230_/_0.15)] group-hover:scale-110 transition-transform">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-base-100)]">Choose Policy</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-2 leading-relaxed">
                Explore plans (Health, Auto, Property, Life, Travel) and choose the coverage that matches your needs.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 relative group">
            <div className="w-14 h-14 rounded-full bg-[var(--color-base-950)] border-2 border-[var(--color-brand-500)]/70 flex items-center justify-center text-lg font-extrabold text-[var(--color-brand-400)] group-hover:scale-110 transition-transform">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-base-100)]">Instant Activation</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-2 leading-relaxed">
                Complete the digital payment workflow to instantly generate your active policy certificate.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 relative group">
            <div className="w-14 h-14 rounded-full bg-[var(--color-base-950)] border-2 border-[var(--color-brand-500)]/50 flex items-center justify-center text-lg font-extrabold text-[var(--color-brand-400)] group-hover:scale-110 transition-transform">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-base-100)]">File a Claim</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-2 leading-relaxed">
                Upload medical, accidental, or property loss receipt documents directly inside the customer dashboard.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 relative group">
            <div className="w-14 h-14 rounded-full bg-[var(--color-base-950)] border-2 border-[var(--color-base-800)]/70 flex items-center justify-center text-lg font-extrabold text-[var(--color-brand-400)] group-hover:scale-110 transition-transform">
              4
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-base-100)]">Assessor Audit</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-2 leading-relaxed">
                Specialist independent appraisers examine the documentation to approve the eligible settlement payout.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 relative group">
            <div className="w-14 h-14 rounded-full bg-[var(--color-base-950)] border-2 border-[var(--color-base-800)] flex items-center justify-center text-lg font-extrabold text-[var(--color-brand-400)] group-hover:scale-110 transition-transform">
              5
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-base-100)]">Direct Payout</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-2 leading-relaxed">
                Administrators dispatch the approved fund amount directly to your registered bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ───────────────────────────────── */}
      <section id="testimonials" className="bg-[var(--color-base-900)] border-y border-[var(--color-base-800)] py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[var(--color-brand-400)] text-xs font-semibold mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              Customer Reviews
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight">
              Trusted by users across the nation
            </h2>
            <p className="mt-4 text-base text-[var(--color-base-500)] max-w-xl mx-auto">
              Hear what our claimants, assessors, and enterprise partners have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="glass-card p-6 flex flex-col justify-between space-y-6">
                <p className="text-sm text-[var(--color-base-300)] italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-base-700)] bg-[var(--color-base-800)]">
                    <img 
                      src={t.avatar} 
                      alt={t.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-base-200)]">{t.name}</h4>
                    <span className="text-[10px] text-[var(--color-base-500)]">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ────────────────────────────────────────── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-24 scroll-mt-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] text-[var(--color-brand-400)] text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight">
            Have questions? We have answers.
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <details 
              key={idx} 
              className="group border border-[var(--color-base-800)] bg-[var(--color-base-900)] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer text-sm sm:text-base font-semibold text-[var(--color-base-200)] hover:bg-[var(--color-base-800)] transition-all">
                <span>{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-[var(--color-base-500)] group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--color-base-400)] leading-relaxed border-t border-[var(--color-base-850)]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(20%_0.10_230_/_0.3)] to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-base-100)] tracking-tight">
              Ready to modernize your insurance?
            </h2>
            <p className="mt-4 text-base text-[var(--color-base-400)] max-w-lg mx-auto">
              Join thousands of policyholders who trust InsuraCore for fast, transparent, and fair claim processing.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 mt-8 bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-[0_0_24px_oklch(58%_0.22_230_/_0.4)] hover:shadow-[0_0_36px_oklch(58%_0.22_230_/_0.6)] hover:-translate-y-0.5"
            >
              Get started — it&apos;s free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-base-800)] bg-[var(--color-base-900)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[var(--color-base-800)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base text-[var(--color-base-100)] tracking-tight">InsuraCore</span>
              </div>
              <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                Empowering policyholders with secure, transparent, and modern claim lifecycle tools. Built on next-gen architecture.
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-bold text-[var(--color-base-300)] uppercase tracking-wider mb-4">Navigation</h5>
              <ul className="space-y-2 text-xs text-[var(--color-base-500)]">
                <li><Link href="#about" className="hover:text-[var(--color-brand-400)] transition-colors">About</Link></li>
                <li><Link href="#ai-assistant" className="hover:text-[var(--color-brand-400)] transition-colors">AI Assistant</Link></li>
                <li><Link href="#features" className="hover:text-[var(--color-brand-400)] transition-colors">Features</Link></li>
                <li><Link href="#testimonials" className="hover:text-[var(--color-brand-400)] transition-colors">Testimonials</Link></li>
                <li><Link href="#faq" className="hover:text-[var(--color-brand-400)] transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-[var(--color-base-300)] uppercase tracking-wider mb-4">Platform Roles</h5>
              <ul className="space-y-2 text-xs text-[var(--color-base-500)]">
                <li><Link href="/login" className="hover:text-[var(--color-brand-400)] transition-colors">Customer Portal</Link></li>
                <li><Link href="/login" className="hover:text-[var(--color-brand-400)] transition-colors">Assessor Workspace</Link></li>
                <li><Link href="/login" className="hover:text-[var(--color-brand-400)] transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-[var(--color-base-300)] uppercase tracking-wider mb-4">Legal & Support</h5>
              <ul className="space-y-2 text-xs text-[var(--color-base-500)]">
                <li><span className="cursor-not-allowed hover:text-[var(--color-brand-400)]">Terms of Service</span></li>
                <li><span className="cursor-not-allowed hover:text-[var(--color-brand-400)]">Privacy Policy</span></li>
                <li><span className="cursor-not-allowed hover:text-[var(--color-brand-400)]">IRDAI Disclosure</span></li>
                <li><span className="cursor-not-allowed hover:text-[var(--color-brand-400)]">Support Center</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-base-600)]">
              <span>© 2026 InsuraCore. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--color-base-600)] font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--color-success-400)] animate-pulse" />
                <span>99.9% Platform Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
