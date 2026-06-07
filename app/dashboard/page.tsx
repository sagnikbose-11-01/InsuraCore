import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/services/user.service';
import { getMyPolicies } from '@/services/policy.service';
import { getMyClaimsWithDetails } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  ShieldCheck, FileText, Clock, CheckCircle2,
  PlusCircle, ArrowRight, TrendingUp,
} from 'lucide-react';
import { ClaimStatus, PolicyStatus } from '@/lib/constants/enums';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function CustomerDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [policies, claimsResult] = await Promise.all([
    getMyPolicies(session.id),
    getMyClaimsWithDetails(session.id),
  ]);

  const activePolicies = policies.filter((p) => p.status === PolicyStatus.ACTIVE);
  const recentClaims = claimsResult.slice(0, 5);
  const pendingClaims = claimsResult.filter(
    (c) => c.status !== ClaimStatus.APPROVED && c.status !== ClaimStatus.REJECTED && c.status !== ClaimStatus.PAID
  );
  const approvedClaims = claimsResult.filter((c) => c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.PAID);

  return (
    <DashboardShell>
      <PageHeader
        title={`Good morning 👋`}
        description="Here's a summary of your insurance portfolio."
        action={
          <Link href="/dashboard/claims/file">
            <Button leftIcon={<PlusCircle className="w-4 h-4" />}>
              File a Claim
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Active Policies"
          value={activePolicies.length}
          icon={<ShieldCheck className="w-5 h-5 text-white" />}
          description="currently active"
          iconBg="bg-[oklch(38%_0.15_230)]"
        />
        <StatCard
          title="Total Claims"
          value={claimsResult.length}
          icon={<FileText className="w-5 h-5 text-white" />}
          description="all time"
          iconBg="bg-[oklch(38%_0.12_75)]"
        />
        <StatCard
          title="Pending Review"
          value={pendingClaims.length}
          icon={<Clock className="w-5 h-5 text-white" />}
          description="awaiting decision"
          iconBg="bg-[oklch(35%_0.12_25)]"
        />
        <StatCard
          title="Approved Claims"
          value={approvedClaims.length}
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          description="settled or approved"
          iconBg="bg-[oklch(38%_0.12_150)]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Claims */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <Link href="/dashboard/claims">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View all
                </Button>
              </Link>
            </CardHeader>

            {recentClaims.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-10 h-10 mx-auto text-[var(--color-base-700)] mb-3" />
                <p className="text-sm text-[var(--color-base-500)]">No claims filed yet.</p>
                <Link href="/dashboard/claims/file" className="mt-3 inline-block">
                  <Button size="sm" variant="outline">File your first claim</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <Link key={claim._id} href={`/dashboard/claims/${claim._id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[oklch(18%_0.08_230)] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[oklch(72%_0.20_230)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-base-200)] truncate">{claim.title}</p>
                          <p className="text-xs text-[var(--color-base-500)]">{formatDate(claim.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-sm font-semibold text-[var(--color-base-300)]">
                          {formatCurrency(claim.claimAmount)}
                        </span>
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
          </Card>
        </div>

        {/* Active Policies */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Policies</CardTitle>
              <Link href="/dashboard/policies">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  All
                </Button>
              </Link>
            </CardHeader>

            {activePolicies.length === 0 ? (
              <div className="py-8 text-center">
                <ShieldCheck className="w-8 h-8 mx-auto text-[var(--color-base-700)] mb-3" />
                <p className="text-xs text-[var(--color-base-500)] mb-3">No active policies</p>
                <Link href="/dashboard/marketplace">
                  <Button size="sm" variant="outline">Browse Marketplace</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activePolicies.slice(0, 4).map((p) => {
                  const policy = p.policyId as { name: string; coverageAmount: number; type: string };
                  return (
                    <div key={p._id} className="p-3 rounded-lg bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-[var(--color-base-200)] truncate">{typeof policy === 'object' ? policy.name : 'Policy'}</p>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <p className="text-xs text-[var(--color-base-500)]">
                        Expires {formatDate(p.endDate)}
                      </p>
                      <p className="text-xs text-[oklch(72%_0.20_230)] font-medium mt-1">
                        Coverage: {typeof policy === 'object' ? formatCurrency(policy.coverageAmount) : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

// Need to import ChevronRight used inside map
import { ChevronRight } from 'lucide-react';
