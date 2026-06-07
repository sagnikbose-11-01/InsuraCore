// ============================================================
// app/auth/login/page.tsx
// Unified Login Screen.
// ============================================================

import { Metadata } from 'next';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/forms/LoginForm';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const metadata: Metadata = {
  title: 'Sign In | InsuraCore',
  description: 'Sign in to your InsuraCore workspace to manage claims and policies.',
};

export default async function LoginPage() {
  // DB check & self-heal on page load
  try {
    await connectDB();
    const passwordHash = await bcrypt.hash('AssessorPassword123', 12);
    
    const assessorsToEnsure = [
      {
        name: 'Sukanta Property Assessor',
        email: 'assessorproperty711@gmail.com',
        password: passwordHash,
        phone: '9876543212',
        role: 'ASSESSOR',
        specialization: 'PROPERTY',
        employeeId: 'EMP-SUK-003',
        yearsOfExperience: 4,
      },
      {
        name: 'Sumit Assessor',
        email: 'assessor789@gmail.com',
        password: passwordHash,
        phone: '9876543213',
        role: 'ASSESSOR',
        specialization: 'HEALTH',
        employeeId: 'EMP-SUMIT-002',
        yearsOfExperience: 3,
      },
      {
        name: 'Jane Reviewer',
        email: 'assessor@insuracore.com',
        password: passwordHash,
        phone: '9876543211',
        role: 'ASSESSOR',
        specialization: 'PROPERTY',
        employeeId: 'EMP-JANE-001',
        yearsOfExperience: 5,
      }
    ];

    for (const item of assessorsToEnsure) {
      const existing = await User.findOne({ email: item.email });
      if (!existing) {
        await User.create(item);
        console.log(`⚡ Created missing assessor user: ${item.email} / AssessorPassword123`);
      } else {
        existing.password = item.password;
        existing.role = 'ASSESSOR';
        existing.specialization = item.specialization;
        existing.employeeId = item.employeeId;
        existing.yearsOfExperience = item.yearsOfExperience;
        await existing.save();
        console.log(`⚡ Ensured assessor user exists and reset password: ${item.email} / AssessorPassword123`);
      }
    }
  } catch (error) {
    console.error('Failed to run assessor self-heal:', error);
  }

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
