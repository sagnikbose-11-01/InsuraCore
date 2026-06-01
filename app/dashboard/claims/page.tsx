// ============================================================
// app/dashboard/claims/page.tsx
// Server Component — fetches all claims for the logged-in user
// then passes them to the interactive ClaimsModule client shell.
// ============================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyClaimsWithDetails } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { ClaimsModule } from './ClaimsModule';

export const metadata: Metadata = {
  title: 'My Claims | InsuraCore',
  description: 'Track, monitor, and manage all your insurance claims in one place.',
};

export default async function ClaimsListPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch all claims with populated policy + assessor data
  const claims = await getMyClaimsWithDetails(session.id);

  return (
    <DashboardShell>
      <ClaimsModule claims={claims} />
    </DashboardShell>
  );
}
