// ============================================================
// app/auth/signup/assessor/page.tsx
// Assessor onboarding page.
// ============================================================

import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AssessorRegisterForm } from '@/components/forms/AssessorRegisterForm';

export const metadata: Metadata = {
  title: 'Assessor Onboarding | InsuraCore',
  description: 'Join InsuraCore’s claim verification network.',
};

export default function AssessorSignupPage() {
  return (
    <AuthLayout
      title="Create Assessor Workspace"
      subtitle="Join InsuraCore’s claim verification network."
    >
      <AssessorRegisterForm />
    </AuthLayout>
  );
}
