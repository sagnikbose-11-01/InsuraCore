'use client';
// ============================================================
// app/admin/analytics/AnalyticsCharts.tsx
// Client component to display recharts diagrams and metrics.
// ============================================================

import { ClaimsAnalytics } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { FileText, DollarSign, TrendingUp, Percent } from 'lucide-react';

interface Props {
  analytics: ClaimsAnalytics;
}

const COLORS = [
  'oklch(72%_0.20_230)', // Cyan
  'oklch(78%_0.18_75)',  // Amber
  'oklch(72%_0.17_150)', // Emerald
  'oklch(65%_0.20_25)',  // Rose
  'oklch(72%_0.15_260)', // Indigo
];

export function AnalyticsCharts({ analytics }: Props) {
  // Format monthly data for Recharts
  const monthlyData = analytics.monthlyTrend.map((t) => ({
    name: new Date(t.month + '-02').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    claims: t.count,
    amount: t.amount,
  }));

  // Format status data for Pie chart
  const statusData = Object.entries(analytics.byStatus).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Claims File"
          value={analytics.total}
          icon={<FileText className="w-5 h-5 text-white" />}
          description="lifetime claims"
          iconBg="bg-[oklch(38%_0.15_230)]"
        />
        <StatCard
          title="Total Payouts"
          value={formatCurrency(analytics.totalApprovedAmount)}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          description="approved settlements"
          iconBg="bg-[oklch(38%_0.12_150)]"
        />
        <StatCard
          title="Total Claims Volume"
          value={formatCurrency(analytics.totalClaimAmount)}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          description="requested funds"
          iconBg="bg-[oklch(35%_0.12_25)]"
        />
        <StatCard
          title="Claims Approval Rate"
          value={`${analytics.approvalRate}%`}
          icon={<Percent className="w-5 h-5 text-white" />}
          description="average approval percentage"
          iconBg="bg-[oklch(38%_0.12_260)]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2">
          <Card className="h-[360px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-base-300)] mb-1">Monthly Claims Volume</h3>
              <p className="text-xs text-[var(--color-base-500)]">Trend of requested claim amounts over time</p>
            </div>
            <div className="flex-1 w-full mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(72%_0.20_230)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="oklch(72%_0.20_230)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-800)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-base-500)" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-base-900)',
                      borderColor: 'var(--color-base-800)',
                      borderRadius: '8px',
                      color: 'var(--color-base-200)',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="oklch(72%_0.20_230)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmt)" name="Requested Amount" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Status Distribution Pie Chart */}
        <div>
          <Card className="h-[360px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-base-300)] mb-1">Claims by Status</h3>
              <p className="text-xs text-[var(--color-base-500)]">Breakdown of claims distribution</p>
            </div>
            {statusData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-[var(--color-base-600)]">No claim data available</p>
              </div>
            ) : (
              <div className="flex-1 w-full mt-4 h-[240px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-base-900)',
                        borderColor: 'var(--color-base-800)',
                        borderRadius: '8px',
                        color: 'var(--color-base-200)',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3 text-[10px] text-[var(--color-base-400)] max-w-[240px]">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="capitalize">{d.name.toLowerCase()} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
