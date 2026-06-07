// ============================================================
// app/auth/login/page.tsx
// Unified Login Screen.
// ============================================================

import { Metadata } from 'next';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | InsuraCore',
  description: 'Sign in to your InsuraCore workspace to manage claims and policies.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your InsuraCore account to access your workspace."
    >
      <LoginForm />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--color-base-800)] dark:bg-[rgba(255,255,255,0.06)]" />
        <span className="text-xs text-[var(--color-base-500)]">OR</span>
        <div className="flex-1 h-px bg-[var(--color-base-800)] dark:bg-[rgba(255,255,255,0.06)]" />
      </div>

      <p className="text-center text-sm text-[var(--color-base-400)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] font-semibold transition-colors underline decoration-2 underline-offset-4"
        >
          Create Workspace
        </Link>
      </p>
    </AuthLayout>
  );
}
