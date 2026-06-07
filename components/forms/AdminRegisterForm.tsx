'use client';

// ============================================================
// components/forms/AdminRegisterForm.tsx
// Onboarding form for Admins. Requires secure Invite Code and admin prefix.
// ============================================================

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, User, ShieldCheck, Hash, Key, ArrowLeft } from 'lucide-react';
import { registerAdminAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/hooks/use-toast';

export function AdminRegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Real-time email validation states
  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<{ formatValid: boolean; prefixValid: boolean } | null>(null);

  useEffect(() => {
    if (!email) {
      setEmailState(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const formatValid = emailRegex.test(email);
    const localPart = email.split('@')[0];
    const prefixValid = localPart.toLowerCase().startsWith('admin');
    setEmailState({ formatValid, prefixValid });
  }, [email]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAdminAction(formData);
      if (result.success) {
        toast.success('Admin workspace created successfully! Redirecting...');
        router.push('/admin');
        router.refresh();
      } else {
        setError(result.message);
        toast.error(result.message || 'Registration failed.');
        if (result.errors) {
          const flat: Record<string, string> = {};
          Object.entries(result.errors).forEach(([k, v]) => {
            flat[k] = v[0];
          });
          setFieldErrors(flat);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-sm text-[var(--color-danger-400)] animate-fade-in">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        name="name"
        type="text"
        placeholder="Ronit Bose"
        required
        error={fieldErrors.name}
        leftAdornment={<User className="w-4 h-4" />}
      />

      <div className="space-y-1">
        <Input
          label="Company Email"
          name="email"
          type="email"
          placeholder="admin.ronit@insuracore.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          leftAdornment={<Mail className="w-4 h-4" />}
          helperText="Admin emails must begin with the word 'admin'."
        />
        {emailState !== null && (
          <div className="flex flex-col gap-1 mt-1 text-xs">
            {emailState.formatValid ? (
              <span className="text-[var(--color-success-400)] flex items-center gap-1">
                ✓ Email format valid
              </span>
            ) : (
              <span className="text-[var(--color-danger-400)] flex items-center gap-1">
                ✗ Invalid email format
              </span>
            )}
            {emailState.prefixValid ? (
              <span className="text-[var(--color-success-400)] flex items-center gap-1">
                ✓ Admin email convention verified (starts with &apos;admin&apos;)
              </span>
            ) : (
              <span className="text-[var(--color-danger-400)] flex items-center gap-1">
                ✗ Admin email must begin with &apos;admin&apos;
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Employee ID"
          name="employeeId"
          type="text"
          placeholder="ADM-009"
          required
          error={fieldErrors.employeeId}
          leftAdornment={<Hash className="w-4 h-4" />}
        />

        <Input
          label="Admin Access Code"
          name="adminAccessCode"
          type="password"
          placeholder="••••••••••••"
          required
          error={fieldErrors.adminAccessCode}
          leftAdornment={<Key className="w-4 h-4" />}
          helperText="Requires a secure platform register token."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordInput
          label="Password"
          name="password"
          placeholder="Min 8 chars, 1 upper, 1 num"
          required
          error={fieldErrors.password}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter password"
          required
          error={fieldErrors.confirmPassword}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/auth/signup"
          className="flex items-center gap-1.5 text-xs text-[var(--color-base-400)] hover:text-[var(--color-base-200)] transition-colors self-start sm:self-auto py-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to roles
        </Link>

        <Button type="submit" isLoading={isPending} className="w-full sm:w-auto min-w-[200px]" size="lg">
          Create Admin Workspace
        </Button>
      </div>
    </form>
  );
}
