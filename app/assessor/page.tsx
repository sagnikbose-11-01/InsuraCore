import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getAssignedClaims } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserRole, ClaimStatus } from '@/lib/constants/enums';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';
import { FileText, ClipboardList, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { SerializedUser } from '@/types';

export const metadata: Metadata = { title: 'Assessor Dashboard' };

export default async function AssessorDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) redirect('/login');

  const claims = await getAssignedClaims(session.id);

  const underReview = claims.filter((c) => c.status === ClaimStatus.UNDER_REVIEW);
  const docVerification = claims.filter((c) => c.status === ClaimStatus.DOCUMENT_VERIFICATION);
  const completed = claims.filter((c) => c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.REJECTED || c.status === ClaimStatus.PAID);
  const pending = claims.filter((c) => c.status === ClaimStatus.PENDING || c.status === ClaimStatus.SUBMITTED);

  return (
    <DashboardShell>
      <PageHeader
        title={`Assessor Portal`}
        description="Review and process claims assigned to you."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Assigned Claims"
          value={claims.length}
          icon={<ClipboardList className="w-5 h-5 text-white" />}
          description="total pipeline"
          iconBg="bg-[oklch(38%_0.15_230)]"
        />
        <StatCard
          title="Under Review"
          value={underReview.length}
          icon={<Clock className="w-5 h-5 text-white" />}
          description="active investigation"
          iconBg="bg-[oklch(35%_0.12_25)]"
        />
        <StatCard
          title="Doc Verification"
          value={docVerification.length}
          icon={<FileText className="w-5 h-5 text-white" />}
          description="verifying uploads"
          iconBg="bg-[oklch(38%_0.12_75)]"
        />
        <StatCard
          title="Completed"
          value={completed.length}
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          description="decisions finalized"
          iconBg="bg-[oklch(38%_0.12_150)]"
        />
      </div>

      {/* Pipeline list */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Pipeline</CardTitle>
          <span className="text-xs text-[var(--color-base-500)]">{claims.length} total assigned</span>
        </CardHeader>

        {claims.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-[var(--color-base-700)] mb-3" />
            <p className="text-sm text-[var(--color-base-500)]">No claims assigned to you yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Customer</th>
                  <th>Claimed Amount</th>
                  <th>Date Filed</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => {
                  const customer = claim.customerId as SerializedUser;
                  return (
                    <tr key={claim._id} className="group">
                      <td>
                        <Link href={`/assessor/claims/${claim._id}`} className="text-sm font-semibold text-[var(--color-base-200)] hover:text-[var(--color-brand-400)] transition-colors">
                          {claim.title}
                        </Link>
                      </td>
                      <td>
                        <div className="min-w-0">
                          <p className="text-sm text-[var(--color-base-300)] font-medium">
                            {typeof customer === 'object' ? customer.name : '—'}
                          </p>
                          <p className="text-xs text-[var(--color-base-500)]">
                            {typeof customer === 'object' ? customer.email : '—'}
                          </p>
                        </div>
                      </td>
                      <td className="font-semibold text-sm">
                        {formatCurrency(claim.claimAmount)}
                      </td>
                      <td className="text-xs text-[var(--color-base-500)]">
                        {formatDate(claim.createdAt)}
                      </td>
                      <td>
                        <Badge variant={getClaimStatusVariant(claim.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                          {CLAIM_STATUS_LABEL[claim.status]}
                        </Badge>
                      </td>
                      <td>
                        <Link href={`/assessor/claims/${claim._id}`}>
                          <Button size="sm" variant="ghost" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
