// ============================================================
// app/auth/signup/customer/page.tsx
// Customer onboarding page.
// ============================================================

import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { CustomerRegisterForm } from '@/components/forms/CustomerRegisterForm';

export const metadata: Metadata = {
  title: 'Customer Onboarding | InsuraCore',
  description: 'Create a customer account to purchase policies, file claims, and track settlements.',
};

export default function CustomerSignupPage() {
  return (
    <AuthLayout
      title="Create Customer Account"
      subtitle="Purchase insurance policies, file claims, upload documents, and track settlements."
    >
      <CustomerRegisterForm />
    </AuthLayout>
  );
}
