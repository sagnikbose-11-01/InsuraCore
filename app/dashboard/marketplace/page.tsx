// ============================================================
// app/dashboard/marketplace/page.tsx
// Server Component — fetches all active policies + marketplace
// stats, then renders the interactive MarketplaceModule.
// Route: /dashboard/marketplace
// ============================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAllPolicies, getMarketplaceStats, getMyPolicies } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { MarketplaceModule } from './MarketplaceModule';
import { SerializedPolicy } from '@/types';
import { PolicyStatus } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Insurance Marketplace | InsuraCore',
  description: 'Browse and purchase insurance plans tailored for you. Health, Auto, Property, Life, and Travel coverage available.',
};

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Parallel fetch: all active policies + hero stats + customer's owned policies
  const [policies, stats, myPolicies] = await Promise.all([
    getAllPolicies(true), // activeOnly = true
    getMarketplaceStats(),
    getMyPolicies(session.id),
  ]);

  // IDs of policy templates the customer already owns (active only)
  const ownedPolicyIds = new Set(
    myPolicies
      .filter(p => p.status === PolicyStatus.ACTIVE)
      .map(p => (p.policyId as SerializedPolicy)._id)
  );

  return (
    <DashboardShell>
      <MarketplaceModule
        policies={policies}
        stats={stats}
        ownedPolicyIds={Array.from(ownedPolicyIds)}
      />
    </DashboardShell>
  );
}
