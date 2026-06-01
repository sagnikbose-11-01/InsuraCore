import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/services/user.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = { title: 'My Profile' };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await getUserById(session.id);
  if (!user) redirect('/login');

  return (
    <DashboardShell>
      <PageHeader
        title="Account Profile"
        description="Update your personal details and contact information."
      />
      <ProfileForm user={user} />
    </DashboardShell>
  );
}
