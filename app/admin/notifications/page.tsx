import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminNotifications } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminNotificationsList } from '@/components/admin/AdminNotificationsList';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Notifications Center | Admin Console',
  description: 'Enterprise administration tool for platform-wide alerts and notification tracking.',
};

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch recent notifications from all users
  const notifications = await getAdminNotifications({ limit: 150 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert & Notification Center"
        description="Monitor system-wide announcements, task notifications, audit approvals, and manage inbox reading statuses."
      />
      <AdminNotificationsList initialNotifications={notifications} />
    </div>
  );
}
