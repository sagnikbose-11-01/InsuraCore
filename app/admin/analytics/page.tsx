import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminAnalyticsData } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminAnalyticsCharts } from '@/components/admin/AdminAnalyticsCharts';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Business Intelligence Dashboard | Admin Console',
  description: 'Enterprise business intelligence reports, operational audits, and risk profiles.',
};

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  // Fetch full enterprise analytics datasets
  const analyticsData = await getAdminAnalyticsData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence Dashboard"
        description="Auditing financial growth trends, risk profiles, fraud metrics, and assessor productivity ledger."
      />
      <AdminAnalyticsCharts data={analyticsData} />
    </div>
  );
}
