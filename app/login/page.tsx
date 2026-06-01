import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { LoginForm } from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your InsuraCore account to manage your policies and claims.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[oklch(25%_0.12_230_/_0.15)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[oklch(20%_0.10_270_/_0.1)] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="glass-card p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-500)] flex items-center justify-center mb-4 glow-brand">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-base-100)] tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[var(--color-base-500)]">
              Sign in to your InsuraCore account
            </p>
          </div>

          <LoginForm />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-base-800)]" />
            <span className="text-xs text-[var(--color-base-600)]">OR</span>
            <div className="flex-1 h-px bg-[var(--color-base-800)]" />
          </div>

          <p className="text-center text-sm text-[var(--color-base-500)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--color-base-600)]">
          By signing in, you agree to our{' '}
          <span className="text-[var(--color-base-500)]">Terms of Service</span> and{' '}
          <span className="text-[var(--color-base-500)]">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
