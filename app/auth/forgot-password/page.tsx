'use client';

// ============================================================
// app/auth/forgot-password/page.tsx
// Forgot Password reset request page.
// ============================================================

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);

    // Simple client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    startTransition(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailSubmitted(true);
      toast.success('Password reset link sent to your email.');
    });
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive recovery instructions."
    >
      {emailSubmitted ? (
        <div className="space-y-6 text-center animate-fade-in py-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-500)]/30 text-[var(--color-success-400)] flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <Send className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[var(--color-base-100)]">
              Check your inbox
            </h3>
            <p className="text-sm text-[var(--color-base-400)]">
              We sent a password recovery link to <strong className="text-[var(--color-base-200)]">{email}</strong>.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setEmailSubmitted(false)}
              className="text-xs text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] font-semibold transition-colors underline decoration-2 underline-offset-4"
            >
              Didn&apos;t receive it? Try another email
            </button>
          </div>

          <div className="pt-6 border-t border-[var(--color-base-800)] dark:border-[rgba(255,255,255,0.06)]">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-base-400)] hover:text-[var(--color-base-200)] transition-colors py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError || undefined}
            leftAdornment={<Mail className="w-4 h-4" />}
          />

          <Button type="submit" isLoading={isPending} className="w-full" size="lg">
            {isPending ? 'Sending Link...' : 'Send Reset Instructions'}
          </Button>

          <div className="flex justify-center pt-2">
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-xs text-[var(--color-base-400)] hover:text-[var(--color-base-200)] transition-colors py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
