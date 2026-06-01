'use client';
// ============================================================
// components/forms/RegisterForm.tsx
// Client form for new customer registration.
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { registerAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result.success) {
        toast.success('Account created successfully! Welcome to InsuraCore.');
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.message);
        toast.error(result.message || 'Registration failed. Please check the inputs.');
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
        <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-sm text-[var(--color-danger-400)]">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        name="name"
        type="text"
        placeholder="John Doe"
        required
        autoComplete="name"
        error={fieldErrors.name}
        leftAdornment={<User className="w-4 h-4" />}
      />

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
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="+91 9876543210"
        required
        autoComplete="tel"
        error={fieldErrors.phone}
        leftAdornment={<Phone className="w-4 h-4" />}
      />

      <Input
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        required
        autoComplete="new-password"
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

      <Button type="submit" isLoading={isPending} className="w-full mt-2" size="lg">
        {isPending ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
