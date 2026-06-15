import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminApprovalsQueue, getAdminAssessors } from '@/services/admin.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminApprovalsQueue } from '@/components/admin/AdminApprovalsQueue';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Platform Approvals Queue | Admin Console',
  description: 'Manage unassigned claims, verify customer documents, and perform work assignments.',
};

export default async function AdminApprovalsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  const [queueData, assessors] = await Promise.all([
    getAdminApprovalsQueue(),
    getAdminAssessors(),
  ]);

  // Clean assessors array for dropdown mapping
  const cleanedAssessors = assessors.map((a) => ({
    _id: a._id,
    name: a.name,
    specialization: a.specialization,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals Work Queues"
        description="Monitor outstanding files, assign newly submitted claims, override claims in review, and verify document submittals."
      />
      <AdminApprovalsQueue
        initialData={queueData}
        assessors={cleanedAssessors}
      />
    </div>
  );
}
