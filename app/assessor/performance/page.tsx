// ============================================================
// app/assessor/performance/page.tsx
// Recruiter-worthy Assessor Performance dashboard.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorPerformanceMetrics } from '@/services/assessor.service';
import { AnalyticsChart } from '@/components/assessor/AnalyticsChart';
import { Award, CheckCircle2, Clock, ShieldCheck, BarChart3, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Performance | Assessor Workspace',
};

export default async function PerformancePage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Query performance metrics from database
  const metrics = await getAssessorPerformanceMetrics(session.id);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" /> My Performance
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Analyze your claims processing efficiency, decision distribution, and service quality.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 flex flex-col justify-center border-t-2 border-t-purple-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Claims Reviewed</h3>
          </div>
          <p className="text-3xl font-black text-white">{metrics.totalReviewed}</p>
          <p className="text-xs text-[var(--color-base-500)] mt-1">Total lifetime audits</p>
        </div>

        <div className="glass-card p-5 flex flex-col justify-center border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Approval Rate</h3>
          </div>
          <p className="text-3xl font-black text-white">{metrics.approvalRate}%</p>
          <p className="text-xs text-emerald-400 mt-1">Within department target</p>
        </div>

        <div className="glass-card p-5 flex flex-col justify-center border-t-2 border-t-blue-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Avg Resolution Time</h3>
          </div>
          <p className="text-3xl font-black text-white">{metrics.avgResolutionTime}</p>
          <p className="text-xs text-[var(--color-base-500)] mt-1">Assigned to decision transition</p>
        </div>

        <div className="glass-card p-5 flex flex-col justify-center border-t-2 border-t-yellow-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Documents Verified</h3>
          </div>
          <p className="text-3xl font-black text-white">{metrics.documentsVerified}</p>
          <p className="text-xs text-[var(--color-base-500)] mt-1">Supporting invoices/deeds</p>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Performance Bar Chart */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Productivity trend</h3>
            <p className="text-xs text-[var(--color-base-450)] mt-0.5">Resolved reviews, split by approved and rejected payouts.</p>
          </div>
          <AnalyticsChart 
            type="bar" 
            data={metrics.monthlyPerformance} 
            yKeys={[
              { key: 'reviewed', color: 'var(--color-purple-500)', name: 'Reviewed' },
              { key: 'approved', color: 'var(--color-emerald-500)', name: 'Approved' },
              { key: 'rejected', color: 'var(--color-danger-500)', name: 'Rejected' },
            ]} 
          />
        </div>

        {/* Specialization Pie Chart */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Specialization Metrics</h3>
            <p className="text-xs text-[var(--color-base-450)] mt-0.5">Your workload share vs peer department average.</p>
          </div>
          <div className="flex flex-col items-center justify-center pt-6">
            <AnalyticsChart 
              type="pie" 
              data={metrics.specializationMetrics} 
              height={180} 
            />
            <div className="grid grid-cols-1 gap-2 mt-6 w-full text-xs">
              {metrics.specializationMetrics.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--color-base-400)]">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value} Claims</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
