import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getPolicyById } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { PurchaseConfirmation } from './PurchaseConfirmation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Purchase Policy' };

export default async function PurchasePolicyPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const policy = await getPolicyById(params.id);
  if (!policy || !policy.isActive) notFound();

  return (
    <DashboardShell>
      <div className="mb-6">
        <Link href="/dashboard/policies">
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Back to Policies
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Confirm Purchase"
        description="Review the terms of your insurance policy plan."
      />

      <PurchaseConfirmation policy={policy} />
    </DashboardShell>
  );
}
