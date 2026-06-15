import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminAllClaims, getAdminPolicies, getAdminCustomers, getAdminAssessors } from '@/services/admin.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Platform Reports Ledger | Admin Console',
  description: 'Generate, inspect, and export system-wide customer demographics, claims audit ledgers, and revenue records.',
};

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch full data pools in parallel
  const [claimsResult, policies, customers, assessors] = await Promise.all([
    getAdminAllClaims({ limit: 1000 }), // Fetch a large sample for reporting
    getAdminPolicies(),
    getAdminCustomers(),
    getAdminAssessors(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligence Reports Center"
        description="Filter and export transactional claims registers, policy sales premiums, customer cohorts, and assessor work history."
      />
      <AdminReportsPanel
        claims={claimsResult.claims}
        policies={policies}
        customers={customers}
        assessors={assessors}
      />
    </div>
  );
}
