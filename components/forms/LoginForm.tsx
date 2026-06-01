'use client';
// ============================================================
// components/forms/LoginForm.tsx
// Client form — calls loginAction Server Action, handles
// error display, and redirects by role on success.
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserRole } from '@/lib/constants/enums';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function getRoleRoute(role: UserRole): string {
    if (role === UserRole.ADMIN) return '/admin';
    if (role === UserRole.ASSESSOR) return '/assessor';
    return '/dashboard';
  }

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
        toast.error(result.message || 'Login failed. Please check your credentials.');
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-sm text-[var(--color-danger-400)]">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
        error={fieldErrors.email}
        leftAdornment={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        required
        autoComplete="current-password"
        error={fieldErrors.password}
        leftAdornment={<Lock className="w-4 h-4" />}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[var(--color-base-500)] hover:text-[var(--color-base-300)] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <Button type="submit" isLoading={isPending} className="w-full" size="lg">
        {isPending ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
}
