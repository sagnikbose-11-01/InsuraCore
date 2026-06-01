import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyNotifications } from '@/services/notification.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { NotificationsList } from './NotificationsList';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const notifications = await getMyNotifications(session.id);

  return (
    <DashboardShell>
      <PageHeader
        title="Notifications"
        description="Stay up to date with updates on your policies and claim reviews."
      />
      <NotificationsList initialNotifications={notifications} />
    </DashboardShell>
  );
}
