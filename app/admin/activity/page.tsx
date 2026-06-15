import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminActivityFeed } from '@/services/admin.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Activity Center | Admin Console',
  description: 'Track operations and system auditing events in real-time.',
};

export default async function AdminActivityPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch recent platform audits (limit 150)
  const activityEvents = await getAdminActivityFeed(150);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Audit Center"
        description="Audit platform events, claim assessment transitions, user login profiles, and security ledgers."
      />
      <AdminActivityFeed initialEvents={activityEvents as any} />
    </div>
  );
}
