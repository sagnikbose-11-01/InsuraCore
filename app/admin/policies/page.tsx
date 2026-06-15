import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAllPolicies } from '@/services/policy.service';
import { getAdminPendingPolicies } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminPolicyPanel } from './AdminPolicyPanel';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = { title: 'Manage Policies' };

export default async function AdminPoliciesPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) redirect('/login');

  const policies = await getAllPolicies(false); // fetch all policies including inactive ones
  const pendingPolicies = await getAdminPendingPolicies();

  return (
    <>
      <PageHeader
        title="Policy Management"
        description="Create, update, and manage insurance policy plans."
      />
      <AdminPolicyPanel initialPolicies={policies} pendingPolicies={pendingPolicies} />
    </>
  );
}
