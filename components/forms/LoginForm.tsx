'use client';

// ============================================================
// components/forms/LoginForm.tsx
// Client login form with role-based tabs and auto role detection redirect.
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { loginAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { UserRole } from '@/lib/constants/enums';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);

  function getRoleRoute(role: UserRole): string {
    if (role === UserRole.ADMIN) return '/admin';
    if (role === UserRole.ASSESSOR) return '/assessor';
    return '/dashboard';
  }

  // Interactive role guidelines
  const roleGuidelines: Record<UserRole, { placeholder: string; helper: string }> = {
    [UserRole.CUSTOMER]: {
      placeholder: 'customer@gmail.com',
      helper: 'Access your policy portfolio, submit new claims, and view payments.',
    },
    [UserRole.ASSESSOR]: {
      placeholder: 'assessor.raj@insuracore.com',
      helper: 'Verify submitted claim documents, write audits, and issue payouts.',
    },
    [UserRole.ADMIN]: {
      placeholder: 'admin@insuracore.com',
      helper: 'Manage products, register assessors, review operations, and platform configs.',
    },
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success && result.data) {
        toast.success(`Welcome back, ${result.data.user.name}!`);
        router.push(getRoleRoute(result.data.role));
        router.refresh();
      } else {
        setError(result.message);
        toast.error(result.message || 'Login failed.');
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
    <div className="space-y-6">
      {/* Role Selection Tabs */}
      <div className="flex p-1 rounded-lg bg-[var(--color-base-900)] dark:bg-[rgba(255,255,255,0.03)] border border-[var(--color-base-700)] dark:border-[rgba(255,255,255,0.06)]">
        {(Object.values(UserRole) as UserRole[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => {
              setSelectedRole(role);
              setError(null);
            }}
            className={cn(
              'flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 uppercase tracking-wider',
              selectedRole === role
                ? 'bg-[var(--color-brand-500)] text-white shadow-md'
                : 'text-[var(--color-base-400)] hover:text-[var(--color-base-200)]'
            )}
          >
            {role.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Role Info Helper Card */}
      <div className="p-3 rounded-lg bg-[var(--color-base-900)]/50 border border-[var(--color-base-800)] text-xs text-[var(--color-base-400)] transition-all duration-300">
        <p className="font-semibold text-[var(--color-base-300)] mb-1 uppercase tracking-wider text-[10px]">
          {selectedRole} Workspace
        </p>
        <p>{roleGuidelines[selectedRole].helper}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-sm text-[var(--color-danger-400)] animate-fade-in">
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder={roleGuidelines[selectedRole].placeholder}
          required
          autoComplete="email"
          error={fieldErrors.email}
          leftAdornment={<Mail className="w-4 h-4" />}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            {/* Password input handles its own label internally, so we don't need a label here, but let's let the input draw the label. */}
          </div>
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error={fieldErrors.password}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button type="submit" isLoading={isPending} className="w-full mt-2" size="lg">
          {isPending ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
