import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminAssessors } from '@/services/admin.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminAssessorsTable } from '@/components/admin/AdminAssessorsTable';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Assessor Management | Admin Console',
  description: 'Enterprise administration tool for platform claims assessor management.',
};

export default async function AdminAssessorsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  const assessors = await getAdminAssessors();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessor Management"
        description="Monitor staff workload distribution, audit claim resolution performance, and enforce administrative suspensions."
      />
      <AdminAssessorsTable initialAssessors={assessors} />
    </div>
  );
}
