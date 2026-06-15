// ============================================================
// app/admin/page.tsx
// Executive Admin Dashboard — real-time KPIs from MongoDB.
// No mock data. No static values.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users, UserCheck, BadgeCheck, Shield, FileText,
  Clock, CheckCircle2, XCircle, DollarSign, TrendingUp,
  AlertTriangle, Bell, FileSearch, Activity, ArrowRight,
  IndentDecrease, Zap, BarChart3, HeartPulse,
} from 'lucide-react';
import { getAdminDashboardMetrics, getAdminActivityFeed, getAdminAnalyticsData } from '@/services/admin.service';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  ClaimTimelineChart,
  RevenueChart,
  SpecializationPieChart,
  RegistrationChart,
} from '@/components/admin/AdminDashboardCharts';

export const metadata: Metadata = {
  title: 'Admin Dashboard | InsuraCore',
  description: 'Enterprise admin console — platform-wide metrics and management.',
};

// ── Severity badge ─────────────────────────────────────────
function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    success: 'bg-emerald-400',
    danger: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    default: 'bg-[var(--color-base-600)]',
  };
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[severity] ?? colors.default}`}
    />
  );
}

// ── KPI Card ───────────────────────────────────────────────
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  href,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`glass-card p-5 group transition-all duration-200 hover:scale-[1.02] ${
        highlight
          ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.08)]'
          : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {href && (
          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-base-600)] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 duration-200" />
        )}
      </div>
      <p className="text-[11px] font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-2xl font-black text-[var(--color-base-100)] leading-none mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--color-base-500)] leading-tight">{subtitle}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const [metrics, activityFeed, analyticsData] = await Promise.all([
    getAdminDashboardMetrics(),
    getAdminActivityFeed(20),
    getAdminAnalyticsData(),
  ]);

  const activityColors: Record<string, string> = {
    success: 'text-emerald-400 bg-emerald-500/10',
    danger: 'text-red-400 bg-red-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    info: 'text-blue-400 bg-blue-500/10',
    default: 'text-[var(--color-base-400)] bg-[var(--color-base-800)]',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-400" />
            Executive Dashboard
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Platform-wide metrics from live MongoDB data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Full Analytics
          </Link>
          <Link
            href="/admin/system-health"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-300)] text-sm font-semibold hover:bg-[var(--color-base-700)] transition-colors"
          >
            <HeartPulse className="w-4 h-4" />
            System Health
          </Link>
        </div>
      </div>

      {/* ── Tier 1: Primary KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          subtitle={`+${metrics.newUsersThisMonth} this month`}
          icon={UserCheck}
          iconColor="bg-blue-600"
          href="/admin/customers"
        />
        <KpiCard
          title="Total Assessors"
          value={metrics.totalAssessors.toLocaleString()}
          subtitle="active reviewers"
          icon={BadgeCheck}
          iconColor="bg-violet-600"
          href="/admin/assessors"
        />
        <KpiCard
          title="Policies Listed"
          value={metrics.totalPolicies.toLocaleString()}
          subtitle={`${metrics.activePolicies} active`}
          icon={Shield}
          iconColor="bg-teal-600"
          href="/admin/policies"
        />
        <KpiCard
          title="Policies Sold"
          value={metrics.totalPurchases.toLocaleString()}
          subtitle={`${metrics.activePurchases} currently active`}
          icon={IndentDecrease}
          iconColor="bg-emerald-600"
          href="/admin/policies"
        />
        <KpiCard
          title="Platform Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="total premium income"
          icon={TrendingUp}
          iconColor="bg-indigo-600"
          highlight
        />
      </div>

      {/* ── Tier 2: Claims KPIs ── */}
      <div>
        <p className="text-xs font-bold text-[var(--color-base-500)] uppercase tracking-widest mb-3">
          Claims Overview
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {[
            { label: 'Total', value: metrics.totalClaims, icon: FileText, color: 'bg-slate-700', href: '/admin/claims' },
            { label: 'Active', value: metrics.activeClaims, icon: Activity, color: 'bg-blue-700', href: '/admin/claims' },
            { label: 'Pending', value: metrics.pendingClaims, icon: Clock, color: 'bg-amber-700', href: '/admin/approvals' },
            { label: 'In Review', value: metrics.underReviewClaims, icon: FileSearch, color: 'bg-orange-700', href: '/admin/approvals' },
            { label: 'Approved', value: metrics.approvedClaims, icon: CheckCircle2, color: 'bg-emerald-700', href: '/admin/claims' },
            { label: 'Rejected', value: metrics.rejectedClaims, icon: XCircle, color: 'bg-red-800', href: '/admin/claims' },
            { label: 'Fraud Flagged', value: metrics.fraudFlaggedClaims, icon: AlertTriangle, color: 'bg-rose-900', href: '/admin/claims' },
          ].map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href}>
              <div className="glass-card p-4 group hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mb-2`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[10px] font-semibold text-[var(--color-base-500)] uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-xl font-black text-[var(--color-base-100)]">
                  {value.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Tier 3: Financial KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Claim Value"
          value={formatCurrency(metrics.totalClaimValue)}
          subtitle="all filed claims"
          icon={DollarSign}
          iconColor="bg-slate-700"
        />
        <KpiCard
          title="Total Approved Payout"
          value={formatCurrency(metrics.totalApprovedPayout)}
          subtitle="approved amount"
          icon={CheckCircle2}
          iconColor="bg-emerald-700"
        />
        <KpiCard
          title="Approval Rate"
          value={`${metrics.approvalRate}%`}
          subtitle="approved vs total claims"
          icon={TrendingUp}
          iconColor="bg-indigo-700"
          highlight
        />
        <KpiCard
          title="Avg Resolution"
          value={`${metrics.avgResolutionHours}h`}
          subtitle="average review time"
          icon={Clock}
          iconColor="bg-teal-700"
        />
      </div>

      {/* ── Tier 4: Alerts ── */}
      {(metrics.pendingDocuments > 0 || metrics.unreadNotifications > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.pendingDocuments > 0 && (
            <Link href="/admin/claims">
              <div className="glass-card p-4 border-amber-500/25 bg-amber-500/5 flex items-center gap-4 hover:scale-[1.01] transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                  <FileSearch className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-amber-300 text-sm">{metrics.pendingDocuments} Documents Pending Verification</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">Documents uploaded but not yet verified by assessors</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 ml-auto flex-shrink-0" />
              </div>
            </Link>
          )}
          {metrics.unreadNotifications > 0 && (
            <Link href="/admin/notifications">
              <div className="glass-card p-4 border-indigo-500/25 bg-indigo-500/5 flex items-center gap-4 hover:scale-[1.01] transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-bold text-indigo-300 text-sm">{metrics.unreadNotifications} Unread Notifications</p>
                  <p className="text-xs text-indigo-400/70 mt-0.5">System-wide unread notification count</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Claim Timeline */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[var(--color-base-100)] text-sm">Claims Timeline</h2>
              <p className="text-xs text-[var(--color-base-500)]">Filed vs approved vs rejected (12 months)</p>
            </div>
            <Link href="/admin/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Full Analytics →
            </Link>
          </div>
          <ClaimTimelineChart data={analyticsData.claimTimeline} />
        </div>

        {/* Specialization Pie */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h2 className="font-bold text-[var(--color-base-100)] text-sm">Claims by Specialization</h2>
            <p className="text-xs text-[var(--color-base-500)]">Distribution across policy types</p>
          </div>
          {analyticsData.specDistribution.length > 0 ? (
            <SpecializationPieChart data={analyticsData.specDistribution} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-[var(--color-base-500)]">
              No claims data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue + Registrations Row ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[var(--color-base-100)] text-sm">Revenue Trend</h2>
              <p className="text-xs text-[var(--color-base-500)]">Premium income by month</p>
            </div>
          </div>
          <RevenueChart data={analyticsData.revenueTimeline} />
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[var(--color-base-100)] text-sm">User Growth</h2>
              <p className="text-xs text-[var(--color-base-500)]">New customers & assessors by month</p>
            </div>
          </div>
          <RegistrationChart data={analyticsData.registrationTimeline} />
        </div>
      </div>

      {/* ── Bottom: Activity Feed + Top Policies ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[var(--color-base-100)] text-sm">Live Activity Feed</h2>
              <p className="text-xs text-[var(--color-base-500)]">Recent platform events</p>
            </div>
            <Link href="/admin/activity" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {activityFeed.length === 0 && (
              <p className="text-sm text-[var(--color-base-500)] py-4 text-center">No recent activity.</p>
            )}
            {activityFeed.slice(0, 10).map((event) => (
              <div
                key={event._id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--color-base-900)] transition-colors group"
              >
                <SeverityDot severity={event.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--color-base-100)]">
                      {event.action}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      event.actorRole === 'ADMIN'
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : event.actorRole === 'ASSESSOR'
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-blue-400 bg-blue-500/10'
                    }`}>
                      {event.actorRole}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-base-400)] mt-0.5 truncate">
                    <span className="font-medium text-[var(--color-base-300)]">{event.actorName}</span>
                    {event.details ? ` — ${event.details.slice(0, 80)}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-[var(--color-base-600)] flex-shrink-0 mt-0.5">
                  {new Date(event.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Policies + Quick Links */}
        <div className="space-y-4">
          {/* Top Policies */}
          <div className="glass-card p-5">
            <h2 className="font-bold text-[var(--color-base-100)] text-sm mb-3">Top Policies</h2>
            {analyticsData.topPolicies.length === 0 ? (
              <p className="text-sm text-[var(--color-base-500)]">No purchases yet.</p>
            ) : (
              <div className="space-y-2">
                {analyticsData.topPolicies.map((p: any, i: number) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[var(--color-base-600)] w-4 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-base-200)] truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--color-base-500)]">{p.purchases} purchases</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5">
            <h2 className="font-bold text-[var(--color-base-100)] text-sm mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Pending Approvals', href: '/admin/approvals', count: metrics.pendingClaims },
                { label: 'Manage Customers', href: '/admin/customers', count: metrics.totalCustomers },
                { label: 'Manage Assessors', href: '/admin/assessors', count: metrics.totalAssessors },
                { label: 'All Audit Logs', href: '/admin/audit-logs', count: null },
              ].map(({ label, href, count }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)] transition-colors group"
                >
                  <span className="text-sm text-[var(--color-base-300)] group-hover:text-white transition-colors font-medium">
                    {label}
                  </span>
                  {count !== null && (
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
