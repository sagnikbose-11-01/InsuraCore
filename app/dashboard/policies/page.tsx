// ============================================================
// app/dashboard/policies/page.tsx
// Server Component — fetches all data needed for the My Policies
// page, computes portfolio stats, then passes everything to
// the interactive PoliciesModule client component.
// ============================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/services/user.service';
import { getMyPolicies, getAllPolicies } from '@/services/policy.service';
import { getMyClaimsWithDetails } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PoliciesModule } from './PoliciesModule';
import { PolicyStatus } from '@/lib/constants/enums';
import { SerializedPolicy } from '@/types';
import { differenceInDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'My Policies | InsuraCore',
  description: 'Manage, monitor, and expand your insurance portfolio.',
};

export default async function PoliciesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Parallel fetch: user profile + policies + claims
  const [user, myPolicies, availablePolicies, claims] = await Promise.all([
    getUserById(session.id),
    getMyPolicies(session.id),
    getAllPolicies(true),
    getMyClaimsWithDetails(session.id),
  ]);

  if (!user) redirect('/login');

  // Compute portfolio stats server-side (no bundle cost)
  const activePolicies = myPolicies.filter(p => p.status === PolicyStatus.ACTIVE);

  const totalCoverage = activePolicies.reduce((sum, p) => {
    const policy = p.policyId as SerializedPolicy;
    return sum + (policy?.coverageAmount ?? 0);
  }, 0);

  const monthlyPremium = activePolicies.reduce((sum, p) => {
    const policy = p.policyId as SerializedPolicy;
    return sum + (policy?.premiumAmount ?? 0);
  }, 0);

  const expiringSoon = activePolicies.filter(p => {
    const daysLeft = differenceInDays(new Date(p.endDate), new Date());
    return daysLeft >= 0 && daysLeft <= 90;
  }).length;

  const stats = {
    activePolicies: activePolicies.length,
    totalCoverage,
    monthlyPremium,
    totalClaims: claims.length,
    expiringSoon,
  };

  return (
    <DashboardShell>
      <PoliciesModule
        myPolicies={myPolicies}
        availablePolicies={availablePolicies}
        stats={stats}
        userName={user.name}
      />
    </DashboardShell>
  );
}
