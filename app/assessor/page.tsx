// ============================================================
// app/assessor/page.tsx
// Main Operational Dashboard for the Assessor Workspace.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { UserRole } from '@/lib/constants/enums';
import { KpiCard } from '@/components/assessor/KpiCard';
import { SerializedClaim, SerializedUser } from '@/types';
import { 
  FileText, Clock, CheckCircle2, ShieldAlert, Timer, Ban, 
  AlertTriangle, Users, FileCheck, ArrowRight, Play, Eye, 
  BarChart2, FileDown, Activity, FileSpreadsheet
} from 'lucide-react';
import { 
  getAssessorDashboardMetrics, 
  getAssessorWorkQueue, 
  getAssessorRecentActivity 
} from '@/services/assessor.service';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

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
  const activeClaims = await getAssessorWorkQueue(session.id) as SerializedClaim[];
  const recentActivity = await getAssessorRecentActivity(session.id);

  // Filter priority alerts
  const highValueClaims = activeClaims.filter(c => c.claimAmount >= 100000);
  const awaitingDocs = activeClaims.filter(c => c.status === 'DOCUMENT_VERIFICATION');
  const urgentReviews = activeClaims.filter(c => c.priority === 'HIGH' || c.riskScore >= 80);
  
  const now = new Date();
  const slaDeadlineClaims = activeClaims.filter(c => {
    const openTimeMs = now.getTime() - new Date(c.createdAt).getTime();
    const openDays = openTimeMs / (1000 * 60 * 60 * 24);
    return openDays >= 2; // Nearing SLA (> 48 hours)
  });

  // Calculate first claim for Quick Action
  const nextClaim = activeClaims.find(c => 
    c.assignedAssessorId === session.id && 
    ['UNDER_REVIEW', 'DOCUMENT_VERIFICATION'].includes(c.status)
  ) || activeClaims[0];

  const nextClaimLink = nextClaim 
    ? `/assessor/reviews?claimId=${nextClaim._id}` 
    : '/assessor/reviews';

  // Workload Message
  const workloadMessage = metrics.workloadCountToday === 0 
    ? "No Claims Require Review Today"
    : metrics.workloadCountToday === 1
    ? "1 Claim Requires Review Today"
    : `${metrics.workloadCountToday} Claims Require Review Today`;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-[var(--color-base-900)]/80 to-[var(--color-base-950)] border border-purple-500/15 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              Specialization: {session.specialization || 'Generalist'}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back, Assessor {firstName} 👋
            </h1>
            <p className="text-sm text-[var(--color-base-400)] mt-1.5 max-w-2xl">
              You are assigned to the <strong className="text-purple-300 font-semibold">{session.specialization}</strong> department. Reviewing claims with high risk indicators and checking supporting evidence.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end justify-center px-6 py-4 rounded-xl bg-[var(--color-base-950)]/80 border border-[rgba(255,255,255,0.06)] min-w-[220px]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-base-500)]">Today's Workload</span>
            <span className="text-xl font-black text-white mt-1">{workloadMessage}</span>
            <span className="text-[10px] text-[var(--color-base-400)] mt-0.5">Assigned & Unassigned In Specialty</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Assigned Claims"
          value={metrics.assignedClaims}
          icon={FileText}
          iconClassName="text-blue-400"
          trend={{ value: 'Active', isPositive: true }}
        />
        <KpiCard
          title="Under Review"
          value={metrics.underReview}
          icon={Clock}
          iconClassName="text-orange-400"
        />
        <KpiCard
          title="Approved (Week)"
          value={metrics.approvedThisWeek}
          icon={CheckCircle2}
          iconClassName="text-emerald-400"
          trend={{ value: 'Settling', isPositive: true }}
        />
        <KpiCard
          title="Rejected (Week)"
          value={metrics.rejectedThisWeek}
          icon={Ban}
          iconClassName="text-red-400"
        />
        <KpiCard
          title="Avg Review Time"
          value={metrics.avgReviewTime}
          icon={Timer}
          iconClassName="text-purple-400"
        />
        <KpiCard
          title="Customers Served"
          value={metrics.customersServed}
          icon={Users}
          iconClassName="text-sky-400"
        />
        <KpiCard
          title="Docs Awaiting Verification"
          value={metrics.documentsAwaitingVerification}
          icon={FileCheck}
          iconClassName="text-yellow-400"
        />
        <KpiCard
          title="High-Risk Claims"
          value={metrics.highRiskClaims}
          icon={ShieldAlert}
          iconClassName="text-rose-400"
        />
      </div>

      {/* Split section: Priority Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Priority Alerts (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Priority Alerts</h2>
                <p className="text-xs text-[var(--color-base-400)] mt-0.5">Critical items requiring immediate intervention</p>
              </div>
              <span className="text-xs px-2 py-0.5 font-bold rounded bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-wider">
                {highValueClaims.length + awaitingDocs.length + urgentReviews.length + slaDeadlineClaims.length} Alerts
              </span>
            </div>

            {activeClaims.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">All Clear!</p>
                <p className="text-xs text-[var(--color-base-450)] mt-1">There are no active alerts in your specialization queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* High Value Alert */}
                {highValueClaims.map(c => (
                  <div key={`high-val-${c._id}`} className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-400 block">High-Value Claim Limit Exceeded</span>
                        <span className="text-sm font-semibold text-white">{c.title} ({formatCurrency(c.claimAmount)})</span>
                      </div>
                    </div>
                    <Link href={`/assessor/reviews?claimId=${c._id}`} className="p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-white text-xs font-bold transition-all">
                      Investigate
                    </Link>
                  </div>
                ))}

                {/* SLA Warnings */}
                {slaDeadlineClaims.map(c => (
                  <div key={`sla-${c._id}`} className="flex items-center justify-between p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/15 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Timer className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-orange-400 block">SLA Warning: Nearing Deadline</span>
                        <span className="text-sm font-semibold text-white">{c.title} • Open {( (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60) ).toFixed(0)}h</span>
                      </div>
                    </div>
                    <Link href={`/assessor/reviews?claimId=${c._id}`} className="p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-white text-xs font-bold transition-all">
                      Review
                    </Link>
                  </div>
                ))}

                {/* Awaiting Documents */}
                {awaitingDocs.map(c => (
                  <div key={`await-docs-${c._id}`} className="flex items-center justify-between p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/15 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-yellow-400 block">Documents Awaiting Verification</span>
                        <span className="text-sm font-semibold text-white">{c.title} ({(c.customerId as SerializedUser)?.name || 'Customer'})</span>
                      </div>
                    </div>
                    <Link href={`/assessor/reviews?claimId=${c._id}`} className="p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-white text-xs font-bold transition-all">
                      Verify Docs
                    </Link>
                  </div>
                ))}

                {/* Urgent review */}
                {urgentReviews.filter(c => !highValueClaims.includes(c) && !slaDeadlineClaims.includes(c)).map(c => (
                  <div key={`urgent-${c._id}`} className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/15 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-purple-400 block">High Fraud Risk Score ({c.riskScore}%)</span>
                        <span className="text-sm font-semibold text-white">{c.title} • {c.priority} Priority</span>
                      </div>
                    </div>
                    <Link href={`/assessor/reviews?claimId=${c._id}`} className="p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-white text-xs font-bold transition-all">
                      Analyze
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                href={nextClaimLink}
                className="flex items-center gap-3 p-4 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm">Review Next Claim</span>
                  <span className="block text-[10px] text-purple-100 font-normal">
                    {nextClaim ? `Starts CLM-${nextClaim._id.slice(-6).toUpperCase()}` : 'No claims in queue'}
                  </span>
                </div>
              </Link>

              <Link 
                href="/assessor/claims"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] text-white hover:bg-[var(--color-base-800)] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-base-800)] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-semibold">Open Work Queue</span>
                  <span className="block text-[10px] text-[var(--color-base-450)]">Browse all actionable reviews</span>
                </div>
              </Link>

              <Link 
                href="/assessor/performance"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] text-white hover:bg-[var(--color-base-800)] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-base-800)] flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-semibold">View Analytics</span>
                  <span className="block text-[10px] text-[var(--color-base-450)]">Check performance dashboard</span>
                </div>
              </Link>

              <Link 
                href="/assessor/performance"
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] text-white hover:bg-[var(--color-base-800)] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-base-800)] flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-semibold">Export Report</span>
                  <span className="block text-[10px] text-[var(--color-base-450)]">Generate and download report</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Activity Feed */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" /> Recent Activity Feed
        </h2>
        {recentActivity.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--color-base-500)]">
            No recent claim decisions or events recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentActivity.map((act: any) => (
              <div key={act._id} className="flex items-start gap-3.5 p-3 rounded-xl bg-[var(--color-base-900)]/60 border border-[rgba(255,255,255,0.05)]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  act.type === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                  act.type === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">{act.title}</span>
                  <p className="text-xs text-[var(--color-base-400)] mt-0.5 leading-relaxed truncate">{act.message}</p>
                  <span className="text-[10px] text-[var(--color-base-500)] mt-1.5 block">{formatDate(act.time)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
