import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getPolicyById } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PurchaseConfirmation } from './PurchaseConfirmation';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'Purchase Policy' };

export default async function PurchasePolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  // In Next.js 16, route params are a Promise — must be awaited
  const { id } = await params;

  let policy = null;
  try {
    policy = await getPolicyById(id);
  } catch {
    notFound();
  }

  if (!policy || !policy.isActive) notFound();

  return (
    <DashboardShell>
      {/* Back nav */}
      <div className="mb-8">
        <Link
          href="/dashboard/policies"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-base-500)] hover:text-[var(--color-base-200)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to My Policies
        </Link>
      </div>

      {/* Page heading */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[oklch(72%_0.20_230)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-base-100)]">Purchase Policy</h1>
          <p className="text-sm text-[var(--color-base-500)]">
            Review all details, accept the terms, and confirm your purchase.
          </p>
        </div>
      </div>

      <PurchaseConfirmation policy={policy} />
    </DashboardShell>
  );
}
