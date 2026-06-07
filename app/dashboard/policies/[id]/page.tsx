// ============================================================
// app/dashboard/policies/[id]/page.tsx
// Server Component — fetches detailed policy details and claim data,
// then renders the PolicyDetailModule client component.
// Route: /dashboard/policies/[purchasedPolicyId]
// ============================================================

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { connectDB } from '@/lib/db/mongoose';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import { serializePurchasedPolicy } from '@/lib/utils/policy.serializers';
import { getPolicyDetailData } from '@/services/claim.service';
import { PolicyDetailModule } from './PolicyDetailModule';
import { IPolicy } from '@/models/Policy';

export const metadata: Metadata = { title: 'Policy Details | InsuraCore' };

async function getPurchasedPolicyById(purchasedId: string, userId: string) {
  await connectDB();
  try {
    const pp = await PurchasedPolicy.findOne({ _id: purchasedId, userId }).populate('policyId');
    return pp;
  } catch {
    return null;
  }
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const purchasedPolicy = await getPurchasedPolicyById(id, session.id);
  if (!purchasedPolicy) notFound();

  // Fetch claims, claim documents, settlement payments, and notifications parallelly
  const detailData = await getPolicyDetailData(id, session.id);

  const serializedPolicy = serializePurchasedPolicy(
    purchasedPolicy,
    purchasedPolicy.policyId as unknown as IPolicy
  );

  return (
    <DashboardShell>
      <PolicyDetailModule
        purchasedPolicy={serializedPolicy}
        claims={detailData.claims}
        documents={detailData.documents}
        payments={detailData.payments}
        notifications={detailData.notifications}
      />
    </DashboardShell>
  );
}
