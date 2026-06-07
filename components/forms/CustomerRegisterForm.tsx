'use client';

// ============================================================
// components/forms/CustomerRegisterForm.tsx
// Onboarding form for Customers. Supports optional address and dob.
// ============================================================

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, User, Phone, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { registerCustomerAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/hooks/use-toast';

export function CustomerRegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Real-time email validation states
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!email) {
      setEmailValid(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerCustomerAction(formData);
      if (result.success) {
        toast.success('Customer account created successfully! Welcome.');
        router.push('/dashboard');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          error={fieldErrors.name}
          leftAdornment={<User className="w-4 h-4" />}
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+91 9876543210"
          required
          error={fieldErrors.phone}
          leftAdornment={<Phone className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-1">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@gmail.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          leftAdornment={<Mail className="w-4 h-4" />}
        />
        {emailValid !== null && (
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {emailValid ? (
              <span className="text-[var(--color-success-400)] flex items-center gap-1">
                ✓ Email format valid
              </span>
            ) : (
              <span className="text-[var(--color-danger-400)] flex items-center gap-1">
                ✗ Invalid email format
              </span>
            )}
          </div>
        )}
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

      <div className="border-t border-[var(--color-base-700)] dark:border-[rgba(255,255,255,0.06)] pt-4 mt-2">
        <p className="text-xs font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-3">
          Optional Details
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Address"
            name="address"
            type="text"
            placeholder="123 Main St, New York"
            error={fieldErrors.address}
            leftAdornment={<MapPin className="w-4 h-4" />}
          />

          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            error={fieldErrors.dob}
            leftAdornment={<Calendar className="w-4 h-4" />}
          />
        </div>
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
          Create Customer Account
        </Button>
      </div>
    </form>
  );
}
