// ============================================================
// app/assessor/analytics/page.tsx
// Data Visualization Dashboard for Assessor Productivity.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { AnalyticsChart } from '@/components/assessor/AnalyticsChart';
import { Target, TrendingUp, ShieldAlert, Zap } from 'lucide-react';
import { getAssessorAnalytics } from '@/services/assessor.service';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Analytics | Assessor Workspace',
};

const FRAUD_DATA = [
  { name: 'Week 1', flagged: 2, prevented: 150000 },
  { name: 'Week 2', flagged: 5, prevented: 420000 },
  { name: 'Week 3', flagged: 1, prevented: 50000 },
  { name: 'Week 4', flagged: 4, prevented: 380000 },
];

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  
  const analyticsData = await getAssessorAnalytics(session.id);
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Performance Analytics</h1>
        <p className="text-sm text-[var(--color-base-400)] mt-1">
          Track your review velocity, accuracy, and fraud detection metrics.
        </p>
      </div>

      {/* Top Performance Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 flex flex-col justify-center border-t-2 border-t-purple-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Accuracy Score</h3>
          </div>
          <p className="text-3xl font-black text-white">98.2%</p>
          <p className="text-xs text-emerald-400 mt-1">↑ 1.2% from last month</p>
        </div>

        <div className="glass-card p-5 flex flex-col justify-center border-t-2 border-t-blue-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <Zap className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Velocity Rank</h3>
          </div>
          <p className="text-3xl font-black text-white">Top 5%</p>
          <p className="text-xs text-[var(--color-base-500)] mt-1">Out of 142 assessors</p>
        </div>

        <div className="glass-card p-5 flex flex-col justify-center md:col-span-2 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-base-400)]">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Total Claims Reviewed</h3>
          </div>
          <div className="flex items-end gap-4">
            <p className="text-3xl font-black text-white">1,284</p>
            <div className="flex gap-4 text-xs text-[var(--color-base-400)] pb-1">
              <span><strong className="text-white">243</strong> this month</span>
              <span><strong className="text-white">58</strong> this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-6">Review Velocity (Current Week)</h3>
          <AnalyticsChart 
            type="line" 
            data={analyticsData.productivityData} 
            yKeys={[
              { key: 'reviewed', color: 'var(--color-purple-500)', name: 'Actual Reviewed' },
              { key: 'target', color: 'var(--color-base-600)', name: 'Target Quota' }
            ]} 
          />
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-6">Queue Distribution</h3>
          <div className="flex flex-col items-center">
            <AnalyticsChart type="pie" data={analyticsData.queueDistribution} height={220} />
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 w-full">
              {analyticsData.queueDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--color-base-400)]">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Fraud Prevention (Monthly Trend)</h3>
          </div>
          <AnalyticsChart 
            type="bar" 
            data={FRAUD_DATA} // Still hardcoded until the aggregations are built
            yKeys={[
              { key: 'flagged', color: 'var(--color-red-500)', name: 'Fraud Cases Caught' }
            ]} 
          />
        </div>
      </div>
    </div>
  );
}
