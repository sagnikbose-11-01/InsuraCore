import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getMyClaimsWithDetails } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';
import { FileText, PlusCircle, ChevronRight, Calendar } from 'lucide-react';
import { ClaimStatus } from '@/lib/constants/enums';

export const metadata: Metadata = { title: 'My Claims' };

export default async function ClaimsListPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const claims = await getMyClaimsWithDetails(session.id);

  const statusOrder = [
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.DOCUMENT_VERIFICATION,
    ClaimStatus.SUBMITTED,
    ClaimStatus.PENDING,
    ClaimStatus.APPROVED,
    ClaimStatus.PAID,
    ClaimStatus.REJECTED,
  ];

  const sortedClaims = [...claims].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );

  return (
    <DashboardShell>
      <PageHeader
        title="My Claims"
        description="Track all your insurance claims and their current status."
        action={
          <Link href="/dashboard/claims/file">
            <Button leftIcon={<PlusCircle className="w-4 h-4" />}>
              File New Claim
            </Button>
          </Link>
        }
      />

      {claims.length === 0 ? (
        <Card className="py-20 text-center">
          <FileText className="w-12 h-12 mx-auto text-[var(--color-base-700)] mb-4" />
          <h3 className="text-base font-semibold text-[var(--color-base-300)] mb-2">No claims yet</h3>
          <p className="text-sm text-[var(--color-base-500)] mb-6">
            File your first claim to get started.
          </p>
          <Link href="/dashboard/claims/file">
            <Button leftIcon={<PlusCircle className="w-4 h-4" />}>File a Claim</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedClaims.map((claim) => (
            <Link key={claim._id} href={`/dashboard/claims/${claim._id}`}>
              <div className="stat-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(18%_0.08_230)] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[oklch(72%_0.20_230)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-base-100)] truncate">{claim.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[var(--color-base-500)]">
                        <Calendar className="w-3 h-3" />
                        {formatDate(claim.incidentDate)}
                      </span>
                      <span className="text-xs text-[var(--color-base-600)]">·</span>
                      <span className="text-xs font-medium text-[var(--color-base-400)]">
                        Filed {formatDate(claim.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-base-500)]">Claimed</p>
                    <p className="text-sm font-bold text-[var(--color-base-200)]">{formatCurrency(claim.claimAmount)}</p>
                  </div>
                  {claim.approvedAmount > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-base-500)]">Approved</p>
                      <p className="text-sm font-bold text-[oklch(72%_0.17_150)]">{formatCurrency(claim.approvedAmount)}</p>
                    </div>
                  )}
                  <Badge variant={getClaimStatusVariant(claim.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                    {CLAIM_STATUS_LABEL[claim.status]}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-[var(--color-base-600)] group-hover:text-[var(--color-base-400)] transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
