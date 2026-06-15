'use client';

import { BarChart3, TrendingUp, Users, ShieldAlert, CreditCard, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  analytics: {
    totalPoliciesCreated: number;
    activePolicies: number;
    pendingPolicies: number;
    totalPurchases: number;
    activePurchases: number;
    totalRevenue: number;
    totalClaimsFiled: number;
    claimsApproved: number;
    claimsRejected: number;
    claimRatio: number | string;
    totalClaimedAmount: number;
    totalApprovedAmount: number;
    mostPopularPolicy: { name: string; purchases: number; revenue: number } | null;
  };
}

export function AssessorPoliciesAnalytics({ analytics }: Props) {
  const chartData = [
    { name: 'Created', value: analytics.totalPoliciesCreated },
    { name: 'Active', value: analytics.activePolicies },
    { name: 'Pending', value: analytics.pendingPolicies },
    { name: 'Purchases', value: analytics.totalPurchases },
    { name: 'Claims', value: analytics.totalClaimsFiled },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Purchases" 
          value={analytics.totalPurchases} 
          subtitle={`${analytics.activePurchases} currently active`}
          icon={<Users className="w-5 h-5 text-purple-400" />}
          trend="+12% this month"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`} 
          subtitle="From policy premiums"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          trend="+5% this month"
        />
        <StatCard 
          title="Active Policies" 
          value={analytics.activePolicies} 
          subtitle={`${analytics.pendingPolicies} pending approval`}
          icon={<Activity className="w-5 h-5 text-blue-400" />}
        />
        <StatCard 
          title="Claim Ratio" 
          value={`${analytics.claimRatio}%`} 
          subtitle={`${analytics.totalClaimsFiled} claims on ${analytics.totalPurchases} policies`}
          icon={<ShieldAlert className="w-5 h-5 text-orange-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Overview Metrics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: 'var(--color-base-900)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl">
            <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Most Popular Policy</h3>
            {analytics.mostPopularPolicy ? (
              <div>
                <p className="text-lg font-bold text-white leading-tight">{analytics.mostPopularPolicy.name}</p>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-[var(--color-base-400)]">Purchases</span>
                  <span className="text-white font-medium">{analytics.mostPopularPolicy.purchases}</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-[var(--color-base-400)]">Revenue Generated</span>
                  <span className="text-emerald-400 font-medium">₹{analytics.mostPopularPolicy.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-base-500)]">No purchases recorded yet.</p>
            )}
          </div>

          <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl">
            <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Claims Handling</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-base-300)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Approved
                </div>
                <span className="text-white font-medium">{analytics.claimsApproved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-base-300)]">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Rejected
                </div>
                <span className="text-white font-medium">{analytics.claimsRejected}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-base-300)]">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  Total Approved Amount
                </div>
                <span className="text-emerald-400 font-medium">₹{analytics.totalApprovedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend }: any) {
  return (
    <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-lg relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-[var(--color-base-400)]">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[var(--color-base-950)] flex items-center justify-center border border-[rgba(255,255,255,0.05)] shadow-inner">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs relative z-10">
        <span className="text-[var(--color-base-500)]">{subtitle}</span>
        {trend && <span className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-md">{trend}</span>}
      </div>
    </div>
  );
}
