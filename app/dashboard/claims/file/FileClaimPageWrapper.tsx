// ============================================================
// app/dashboard/claims/file/FileClaimPageWrapper.tsx
// Server Component: fetches policies then renders the client form.
// ============================================================

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyPolicies } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileClaimForm } from './FileClaimForm';

export default async function FileClaimPageWrapper() {
  const session = await getSession();
  if (!session) redirect('/login');

  const policies = await getMyPolicies(session.id);
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE');

  return (
    <DashboardShell>
      <PageHeader
        title="File a Claim"
        description="Submit your insurance claim with supporting details."
      />
      <FileClaimForm policies={activePolicies} />
    </DashboardShell>
  );
}
