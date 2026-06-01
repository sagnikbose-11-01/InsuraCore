import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getAllClaims } from '@/services/claim.service';
import { getAllAssessors } from '@/services/user.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AssignAssessorButton } from './AssignAssessorButton';
import { ReleasePaymentButton } from './ReleasePaymentButton';
import { UserRole, ClaimStatus } from '@/lib/constants/enums';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';
import { FileText, User, ChevronRight } from 'lucide-react';
import { SerializedUser } from '@/types';

export const metadata: Metadata = { title: 'Manage Claims' };

export default async function AdminClaimsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) redirect('/login');

  const [{ claims }, assessors] = await Promise.all([
    getAllClaims({ limit: 50 }),
    getAllAssessors(),
  ]);

  return (
    <DashboardShell>
      <PageHeader
        title="Claim Management"
        description={`${claims.length} total claims`}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Assessor</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => {
                const customer = claim.customerId as SerializedUser;
                const assessor = claim.assignedAssessorId as SerializedUser | null;
                return (
                  <tr key={claim._id}>
                    <td>
                      <Link href={`/admin/claims/${claim._id}`} className="text-[var(--color-brand-400)] hover:underline font-medium block max-w-[180px] truncate">
                        {claim.title}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-base-700)] flex items-center justify-center text-[10px] font-bold text-[var(--color-base-400)]">
                          {typeof customer === 'object' ? customer.name?.charAt(0) : '?'}
                        </div>
                        <span className="text-sm text-[var(--color-base-300)]">
                          {typeof customer === 'object' ? customer.name : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="font-semibold">{formatCurrency(claim.claimAmount)}</td>
                    <td>
                      {assessor ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[var(--color-base-500)]" />
                          <span className="text-sm text-[var(--color-base-300)]">
                            {typeof assessor === 'object' ? assessor.name : '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-base-600)]">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={getClaimStatusVariant(claim.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                        {CLAIM_STATUS_LABEL[claim.status]}
                      </Badge>
                    </td>
                    <td className="text-[var(--color-base-500)]">{formatDate(claim.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {!assessor && claim.status === ClaimStatus.SUBMITTED && (
                          <AssignAssessorButton claimId={claim._id} assessors={assessors} />
                        )}
                        {claim.status === ClaimStatus.APPROVED && (
                          <ReleasePaymentButton claimId={claim._id} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
