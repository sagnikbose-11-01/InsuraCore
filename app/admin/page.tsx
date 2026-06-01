import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getClaimsAnalytics, getAllClaims } from '@/services/claim.service';
import { getAllUsers } from '@/services/user.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserRole, ClaimStatus } from '@/lib/constants/enums';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';
import {
  FileText, Users, DollarSign, TrendingUp,
  CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) redirect('/login');

  const [analytics, users, recentClaimsData] = await Promise.all([
    getClaimsAnalytics(),
    getAllUsers(),
    getAllClaims({ limit: 8 }),
  ]);

  const assessors = users.filter((u) => u.role === UserRole.ASSESSOR);
  const customers = users.filter((u) => u.role === UserRole.CUSTOMER);

  return (
    <DashboardShell>
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide overview and management."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Claims"
          value={analytics.total}
          icon={<FileText className="w-5 h-5 text-white" />}
          description="all time"
          iconBg="bg-[oklch(38%_0.15_230)]"
        />
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users className="w-5 h-5 text-white" />}
          description={`${customers.length} customers, ${assessors.length} assessors`}
          iconBg="bg-[oklch(38%_0.12_75)]"
        />
        <StatCard
          title="Total Payouts"
          value={formatCurrency(analytics.totalApprovedAmount)}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          description="approved settlements"
          iconBg="bg-[oklch(38%_0.12_150)]"
        />
        <StatCard
          title="Approval Rate"
          value={`${analytics.approvalRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          trend={analytics.approvalRate > 80 ? 5 : -3}
          description="vs last month"
          iconBg="bg-[oklch(38%_0.12_260)]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Claims */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <Link href="/admin/claims">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Manage all
                </Button>
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClaimsData.claims.map((claim) => (
                    <tr key={claim._id}>
                      <td>
                        <Link href={`/admin/claims/${claim._id}`} className="text-[var(--color-brand-400)] hover:underline font-medium">
                          {claim.title.slice(0, 30)}{claim.title.length > 30 ? '…' : ''}
                        </Link>
                      </td>
                      <td className="font-medium">{formatCurrency(claim.claimAmount)}</td>
                      <td>
                        <Badge variant={getClaimStatusVariant(claim.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                          {CLAIM_STATUS_LABEL[claim.status]}
                        </Badge>
                      </td>
                      <td className="text-[var(--color-base-500)]">{formatDate(claim.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Status Breakdown + Quick Links */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Claims by Status</CardTitle></CardHeader>
            <div className="space-y-2.5">
              {[
                { label: 'Pending', status: ClaimStatus.PENDING, icon: Clock, color: 'text-[var(--color-warning-400)]' },
                { label: 'Under Review', status: ClaimStatus.UNDER_REVIEW, icon: Clock, color: 'text-[var(--color-info-400)]' },
                { label: 'Approved', status: ClaimStatus.APPROVED, icon: CheckCircle2, color: 'text-[var(--color-success-400)]' },
                { label: 'Rejected', status: ClaimStatus.REJECTED, icon: XCircle, color: 'text-[var(--color-danger-400)]' },
                { label: 'Paid', status: ClaimStatus.PAID, icon: DollarSign, color: 'text-[oklch(72%_0.20_230)]' },
              ].map(({ label, status, icon: Icon, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-sm text-[var(--color-base-400)]">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-base-200)]">
                    {analytics.byStatus[status] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              <Link href="/admin/claims"><Button variant="secondary" size="sm" className="w-full justify-start">Manage Claims</Button></Link>
              <Link href="/admin/users"><Button variant="secondary" size="sm" className="w-full justify-start">Manage Users</Button></Link>
              <Link href="/admin/policies"><Button variant="secondary" size="sm" className="w-full justify-start">Manage Policies</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
