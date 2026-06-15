import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminSystemHealth } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminSystemHealth } from '@/components/admin/AdminSystemHealth';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'System Health Diagnostics | Admin Console',
  description: 'Enterprise administration tool for platform uptime and database latencies monitoring.',
};

export default async function AdminSystemHealthPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch full system health stats
  const healthData = await getAdminSystemHealth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Diagnostics & Telemetry"
        description="Monitor database connection latency, collection volumes, node environment runtimes, and process uptime."
      />
      <AdminSystemHealth initialHealth={healthData} />
    </div>
  );
}
