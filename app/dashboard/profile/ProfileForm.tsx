'use client';
// ============================================================
// app/dashboard/profile/ProfileForm.tsx
// Client component to update user profile details.
// ============================================================

import { useState, useTransition } from 'react';
import { updateProfileAction } from '@/app/actions/auth.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SerializedUser } from '@/types';
import { User, Phone, Mail, ShieldAlert, CheckCircle } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

interface Props {
  user: SerializedUser;
}

export function ProfileForm({ user }: Props) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);

    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.success) {
        setSuccess('Profile updated successfully!');
        toast.success('Your profile details have been updated.');
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to update profile details.');
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[var(--color-brand-700)] flex items-center justify-center text-xl font-bold text-[var(--color-brand-200)] flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-base-100)]">{name}</h3>
            <p className="text-xs text-[var(--color-base-500)] capitalize">{user.role.toLowerCase()} Member</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-[var(--color-danger-400)] flex items-center gap-1.5 mb-4">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-xs rounded-lg bg-[var(--color-success-bg)] border border-[oklch(28%_0.08_150)] text-[var(--color-success-400)] flex items-center gap-1.5 mb-4">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            leftAdornment={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            value={user.email}
            disabled
            helperText="Contact support to update your registered email."
            leftAdornment={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            leftAdornment={<Phone className="w-4 h-4" />}
          />

          <Button type="submit" isLoading={isPending} className="w-full mt-2">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
