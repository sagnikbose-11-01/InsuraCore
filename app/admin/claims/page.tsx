import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminAllClaims, getAdminAssessors } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminClaimsTable } from '@/components/admin/AdminClaimsTable';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Claims Control Center | Admin Console',
  description: 'Enterprise administration tool for platform-wide claims monitoring, risk control, and payment release.',
};

export default async function AdminClaimsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch all claims (limit 100 for admin overview) + assessors for reassignments
  const [claimsResult, assessors] = await Promise.all([
    getAdminAllClaims({ limit: 100 }),
    getAdminAssessors(),
  ]);

  // Map assessors for select fields in reassignment
  const formattedAssessors = assessors.map((a) => ({
    _id: a._id,
    name: a.name,
    specialization: a.specialization,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims Control Center"
        description="Monitor claims lifecycles, risk scores, assess compliance, override assessor workloads, and release payments."
      />
      <AdminClaimsTable
        initialClaims={claimsResult.claims}
        assessors={formattedAssessors}
      />
    </div>
  );
}
