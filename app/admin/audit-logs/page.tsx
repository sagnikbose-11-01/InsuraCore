import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminAuditLogs } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminAuditLogsTable } from '@/components/admin/AdminAuditLogsTable';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Compliance Audit Logs | Admin Console',
  description: 'Enterprise administration tool for security logs and action compliance auditing.',
};

export default async function AdminAuditLogsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch recent platform audits (limit 250)
  const auditLogs = await getAdminAuditLogs({ limit: 250 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Security Audits"
        description="Monitor admin reassignments, assessor decisions, customer actions, and security access logs in chronological detail."
      />
      <AdminAuditLogsTable initialLogs={auditLogs} />
    </div>
  );
}
