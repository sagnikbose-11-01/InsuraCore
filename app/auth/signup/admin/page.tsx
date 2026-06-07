// ============================================================
// app/auth/signup/admin/page.tsx
// Admin onboarding page.
// ============================================================

import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AdminRegisterForm } from '@/components/forms/AdminRegisterForm';

export const metadata: Metadata = {
  title: 'Admin Onboarding | InsuraCore',
  description: 'Create Admin Workspace.',
};

export default function AdminSignupPage() {
  return (
    <AuthLayout
      title="Create Admin Workspace"
      subtitle="Only authorized platform administrators may register."
    >
      <AdminRegisterForm />
    </AuthLayout>
  );
}
