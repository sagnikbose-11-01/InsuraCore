import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminSettingsPanel } from '@/components/admin/AdminSettingsPanel';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Console Configuration & Rules | Admin Console',
  description: 'Manage admin profile, MFA validation, session times, and automated risk scoring thresholds.',
};

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Session clean data mapping
  const cleanedSession = {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Console Configuration"
        description="View your system role, configure compliance dual sign-offs, establish auto-flag thresholds, and monitor login keys."
      />
      <AdminSettingsPanel session={cleanedSession} />
    </div>
  );
}
