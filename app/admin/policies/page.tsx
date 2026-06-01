import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAllPolicies } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminPolicyPanel } from './AdminPolicyPanel';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = { title: 'Manage Policies' };

export default async function AdminPoliciesPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) redirect('/login');

  const policies = await getAllPolicies(false); // fetch all policies including inactive ones

  return (
    <DashboardShell>
      <PageHeader
        title="Policy Management"
        description="Create, update, and manage insurance policy plans."
      />
      <AdminPolicyPanel initialPolicies={policies} />
    </DashboardShell>
  );
}
