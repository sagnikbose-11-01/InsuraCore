'use client';

// ============================================================
// components/admin/AdminAnalyticsCharts.tsx
// Premium enterprise-grade client-side analytics dashboards.
// Renders financial growth, risk profiles, fraud metrics, and assessor audits.
// ============================================================

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShieldAlert,
  Users,
  Award,
  Zap,
  BarChart3,
  Calendar,
  AlertTriangle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface Props {
  data: {
    months: string[];
    claimTimeline: Array<{ month: string; filed: number; approved: number; rejected: number; amount: number }>;
    purchaseTimeline: Array<{ month: string; purchases: number }>;
    revenueTimeline: Array<{ month: string; revenue: number; purchases: number }>;
    registrationTimeline: Array<{ month: string; customers: number; assessors: number; total: number }>;
    fraudTimeline: Array<{ month: string; flagged: number }>;
    riskTimeline: Array<{ month: string; avgRisk: number }>;
    specDistribution: Array<{ name: string; value: number; amount: number; color: string }>;
    priorityDistribution: Array<{ name: string; value: number; color: string }>;
    topPolicies: Array<{ _id: string; name: string; type: string; purchases: number; activePurchases: number; revenue: number }>;
    assessorRankings: Array<{ _id: string; name: string; specialization: string; totalReviewed: number; approved: number; rejected: number; approvalRate: number }>;
  };
}

export function AdminAnalyticsCharts({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'RISK' | 'OPERATIONAL'>('FINANCIAL');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category selector */}
      <div className="flex gap-2 border-b border-[var(--color-base-800)] pb-px">
        <button
          onClick={() => setActiveTab('FINANCIAL')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'FINANCIAL'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-[var(--color-base-400)] hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Financial Intelligence
        </button>

        <button
          onClick={() => setActiveTab('RISK')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'RISK'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-[var(--color-base-400)] hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Risk & Compliance
        </button>

        <button
          onClick={() => setActiveTab('OPERATIONAL')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'OPERATIONAL'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-[var(--color-base-400)] hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Operational Audits
        </button>
      </div>

      {/* Financial Intelligence Tab */}
      {activeTab === 'FINANCIAL' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Trend Area Chart */}
            <Card className="lg:col-span-2 h-[380px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Premium Revenue Growth</h3>
                <p className="text-xs text-[var(--color-base-500)]">Total premium revenue collected monthly from purchased policies</p>
              </div>
              <div className="flex-1 w-full mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-800)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--color-base-500)" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'var(--color-base-900)',
                        borderColor: 'var(--color-base-800)',
                        borderRadius: '8px',
                        color: 'var(--color-base-200)',
                        fontSize: '11px',
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Policies List */}
            <Card className="h-[380px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Top Policy Plans</h3>
                <p className="text-xs text-[var(--color-base-500)]">Highest revenue-generating policy programs</p>
              </div>
              <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
                {data.topPolicies.length === 0 ? (
                  <p className="text-xs text-[var(--color-base-600)] text-center py-12">No purchases recorded.</p>
                ) : (
                  data.topPolicies.map((p, i) => (
                    <div key={p._id} className="p-3 bg-[var(--color-base-900)] rounded-xl border border-[var(--color-base-800)] flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{p.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-white">{formatCurrency(p.revenue)}</p>
                        <p className="text-[9px] text-[var(--color-base-500)]">{p.purchases} sales</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Claims Settlement Value bar chart */}
          <Card className="h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Claims Payout Volume</h3>
              <p className="text-xs text-[var(--color-base-500)]">Total claimed assets versus settled/approved payouts by month</p>
            </div>
            <div className="flex-1 w-full mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.claimTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-800)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-base-500)" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'var(--color-base-900)',
                      borderColor: 'var(--color-base-800)',
                      borderRadius: '8px',
                      color: 'var(--color-base-200)',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Requested Claim Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Risk & Compliance Tab */}
      {activeTab === 'RISK' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Risk profile line chart */}
            <Card className="h-[380px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Average Claims Risk Trend</h3>
                <p className="text-xs text-[var(--color-base-500)]">Fluctuations in monthly average claim risk metrics</p>
              </div>
              <div className="flex-1 w-full mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.riskTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-800)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--color-base-500)" fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-base-900)',
                        borderColor: 'var(--color-base-800)',
                        borderRadius: '8px',
                        color: 'var(--color-base-200)',
                        fontSize: '11px',
                      }}
                    />
                    <Line type="monotone" dataKey="avgRisk" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Risk Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Fraud triggers line chart */}
            <Card className="h-[380px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Fraud Flag Incidents</h3>
                <p className="text-xs text-[var(--color-base-500)]">Claims flagged by compliance system for investigation</p>
              </div>
              <div className="flex-1 w-full mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.fraudTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-800)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-base-900)',
                        borderColor: 'var(--color-base-800)',
                        borderRadius: '8px',
                        color: 'var(--color-base-200)',
                        fontSize: '11px',
                      }}
                    />
                    <Area type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" name="Fraud Flags" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Priority breakdown pie chart */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 h-[340px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Claims by Priority</h3>
                <p className="text-xs text-[var(--color-base-500)]">Priority levels breakdown</p>
              </div>
              <div className="flex-1 w-full mt-4 h-[200px] flex flex-col items-center justify-center">
                {data.priorityDistribution.length === 0 ? (
                  <p className="text-xs text-[var(--color-base-600)]">No data.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={data.priorityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.priorityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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

                    <div className="flex gap-4 mt-3 text-[10px] text-[var(--color-base-400)]">
                      {data.priorityDistribution.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Specialization distributions */}
            <Card className="lg:col-span-2 h-[340px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Specialization Payout Shares</h3>
                <p className="text-xs text-[var(--color-base-500)]">Percentage distribution of payout volumes across lines of business</p>
              </div>
              <div className="flex-1 w-full mt-4 h-[200px] flex flex-col items-center justify-center">
                {data.specDistribution.length === 0 ? (
                  <p className="text-xs text-[var(--color-base-600)]">No data.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={data.specDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="amount"
                        >
                          {data.specDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Payouts']}
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

                    <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[var(--color-base-400)] justify-center">
                      {data.specDistribution.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}: {formatCurrency(d.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Operational Audits Tab */}
      {activeTab === 'OPERATIONAL' && (
        <div className="space-y-6">
          {/* Assessor rankings / leaderboard */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Claims Review Performance Ledger</h3>
                <p className="text-xs text-[var(--color-base-500)]">Audited metrics of assessors based on decision history and volume</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Assessor</th>
                    <th>Specialization</th>
                    <th>Total Reviewed</th>
                    <th>Approvals</th>
                    <th>Rejections</th>
                    <th>Approval Override Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assessorRankings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-xs text-[var(--color-base-500)]">
                        No assessor rankings available.
                      </td>
                    </tr>
                  ) : (
                    data.assessorRankings.map((assessor) => (
                      <tr key={assessor._id} className="hover:bg-white/[0.01]">
                        <td>
                          <p className="text-xs font-bold text-white">{assessor.name || 'System Auto-Processor'}</p>
                        </td>
                        <td>
                          <span className="text-[10px] font-mono text-[var(--color-base-400)] uppercase">
                            {assessor.specialization || 'GENERAL'}
                          </span>
                        </td>
                        <td className="font-semibold text-xs text-white">{assessor.totalReviewed}</td>
                        <td className="text-emerald-400 font-semibold text-xs">{assessor.approved}</td>
                        <td className="text-red-400 font-semibold text-xs">{assessor.rejected}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{Math.round(assessor.approvalRate)}%</span>
                            <div className="w-16 bg-[var(--color-base-800)] rounded-full h-1">
                              <div
                                className="bg-indigo-500 h-1 rounded-full"
                                style={{ width: `${assessor.approvalRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* User registration timeline */}
          <Card className="h-[360px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">User Growth Trajectory</h3>
              <p className="text-xs text-[var(--color-base-500)]">Growth curve of registered customers and assessors</p>
            </div>
            <div className="flex-1 w-full mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.registrationTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-800)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-base-500)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-base-900)',
                      borderColor: 'var(--color-base-800)',
                      borderRadius: '8px',
                      color: 'var(--color-base-200)',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="customers" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCustomers)" name="New Customers" />
                  <Line type="monotone" dataKey="assessors" stroke="#9333ea" strokeWidth={2} name="New Assessors" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
