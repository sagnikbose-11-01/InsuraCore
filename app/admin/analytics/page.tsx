import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getClaimsAnalytics } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AnalyticsCharts } from './AnalyticsCharts';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = { title: 'Analytics Dashboard' };

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) redirect('/login');

  const analytics = await getClaimsAnalytics();

  return (
    <DashboardShell>
      <PageHeader
        title="System Analytics"
        description="Comprehensive analysis of claim trends, payout distributions, and approval rates."
      />
      <AnalyticsCharts analytics={analytics} />
    </DashboardShell>
  );
}
