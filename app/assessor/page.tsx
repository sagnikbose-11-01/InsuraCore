// ============================================================
// app/assessor/page.tsx
// Main Operational Dashboard for the Assessor Workspace.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { UserRole } from '@/lib/constants/enums';
import { KpiCard } from '@/components/assessor/KpiCard';
import { ClaimsQueue } from '@/components/assessor/ClaimsQueue';
import { FileText, Clock, CheckCircle2, ShieldAlert, Timer, Ban } from 'lucide-react';
import { getAssessorDashboardMetrics, getAssessorWorkQueue } from '@/services/assessor.service';

export const metadata: Metadata = {
  title: 'Assessor Dashboard | InsuraCore',
};

export default async function AssessorDashboard() {
  const session = await getSession();
  
  // Safe fallback (middleware handles actual routing block)
  if (!session || session.role !== UserRole.ASSESSOR) {
    return null;
  }

  const firstName = session.name.split(' ')[0];
  
  // Fetch REAL metrics scoped to their specialization
  const metrics = await getAssessorDashboardMetrics(session.id);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Welcome back, Assessor {firstName} 👋
        </h1>
        <p className="text-sm text-[var(--color-base-400)] mt-1">
          Here is your operational overview for the {session.specialization} specialization today.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          title="Assigned Claims"
          value={metrics.assignedClaims}
          icon={FileText}
          iconClassName="text-blue-400"
        />
        <KpiCard
          title="Under Review"
          value={metrics.underReview}
          icon={Clock}
          iconClassName="text-orange-400"
        />
        <KpiCard
          title="Approved Today"
          value={metrics.approvedToday}
          icon={CheckCircle2}
          iconClassName="text-emerald-400"
        />
        <KpiCard
          title="Avg Review Time"
          value={metrics.avgReviewTime}
          icon={Timer}
          iconClassName="text-purple-400"
        />
        <KpiCard
          title="Fraud Alerts"
          value={metrics.fraudAlerts}
          icon={ShieldAlert}
          iconClassName="text-red-400"
        />
        <KpiCard
          title="Rejected Today"
          value={metrics.rejectedToday}
          icon={Ban}
          iconClassName="text-gray-400"
        />
      </div>

      {/* Main Work Queue */}
      <div>
        <ClaimsQueue claimsPromise={getAssessorWorkQueue(session.id, 5)} />
      </div>
    </div>
  );
}
