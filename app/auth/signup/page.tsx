// ============================================================
// app/auth/signup/page.tsx
// Role Selection Screen: "Choose Your Workspace"
// Let's the user choose between CUSTOMER, ASSESSOR, and ADMIN.
// ============================================================

import { Metadata } from 'next';
import Link from 'next/link';
import { User, ClipboardCheck, Shield } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RoleCard } from '@/components/auth/RoleCard';

export const metadata: Metadata = {
  title: 'Choose Your Workspace | InsuraCore',
  description: 'Select how you will use InsuraCore to manage policies, claims, and platform operations.',
};

export default function SignupRolePage() {
  return (
    <AuthLayout
      title="Choose Your Workspace"
      subtitle="Select how you’ll use InsuraCore."
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
        <RoleCard
          title="CUSTOMER"
          description="Purchase insurance policies, file claims, upload documents, and track settlements."
          icon={<User className="w-6 h-6" />}
          href="/auth/signup/customer"
        />
        <RoleCard
          title="ASSESSOR"
          description="Review claims, verify documents, and approve or reject insurance settlements."
          icon={<ClipboardCheck className="w-6 h-6" />}
          href="/auth/signup/assessor"
          badge="Verification"
        />
        <RoleCard
          title="ADMIN"
          description="Manage policies, users, assessors, analytics, and platform operations."
          icon={<Shield className="w-6 h-6" />}
          href="/auth/signup/admin"
          badge="Access Code"
        />
      </div>

      <div className="mt-8 text-center text-sm text-[var(--color-base-400)]">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] font-semibold transition-colors underline decoration-2 underline-offset-4"
        >
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
