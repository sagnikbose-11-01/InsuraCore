'use client';

// ============================================================
// components/admin/AdminReportsPanel.tsx
// Client component to generate, preview, and export enterprise reports
// to CSV formats. Supports Claims Audits, Customers, Assessors, and Revenue.
// ============================================================

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  FileSpreadsheet,
  Download,
  Eye,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface Props {
  claims: any[];
  policies: any[];
  customers: any[];
  assessors: any[];
}

export function AdminReportsPanel({ claims, policies, customers, assessors }: Props) {
  const [reportType, setReportType] = useState<'CLAIMS_AUDIT' | 'CUSTOMER_ROSTER' | 'ASSESSOR_AUDIT' | 'REVENUE_LEDGER'>('CLAIMS_AUDIT');
  const [previewData, setPreviewData] = useState<any[]>(claims);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle report generation/previewing
  const handleGenerate = (type: typeof reportType) => {
    setReportType(type);
    setSearchQuery('');
    if (type === 'CLAIMS_AUDIT') {
      setPreviewData(claims);
    } else if (type === 'CUSTOMER_ROSTER') {
      setPreviewData(customers);
    } else if (type === 'ASSESSOR_AUDIT') {
      setPreviewData(assessors);
    } else if (type === 'REVENUE_LEDGER') {
      setPreviewData(policies);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `insuracore_${reportType.toLowerCase()}_report.csv`;

    if (reportType === 'CLAIMS_AUDIT') {
      headers = ['Claim ID', 'Title', 'Customer Name', 'Assessor Assigned', 'Specialization', 'Claim Amount', 'Approved Amount', 'Status', 'Date Filed'];
      rows = previewData.map((c) => [
        c._id,
        c.title,
        c.customerId?.name || '—',
        c.assignedAssessorId?.name || 'Unassigned',
        c.policyType,
        c.claimAmount,
        c.approvedAmount || 0,
        c.status,
        c.createdAt,
      ]);
    } else if (reportType === 'CUSTOMER_ROSTER') {
      headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Created Date', 'Total Policies', 'Active Policies', 'Claims Filed', 'Approved Payout', 'Success Rate (%)'];
      rows = previewData.map((c) => [
        c._id,
        c.name,
        c.email,
        c.phone || '—',
        c.createdAt,
        c.policyCount,
        c.activePolicies,
        c.claimCount,
        c.totalApprovedAmount,
        c.successRate,
      ]);
    } else if (reportType === 'ASSESSOR_AUDIT') {
      headers = ['Assessor ID', 'Name', 'Email', 'Employee ID', 'Specialization', 'Experience (Years)', 'Claims Assigned', 'Claims Active', 'Approval Rate (%)', 'Performance Score (%)'];
      rows = previewData.map((a) => [
        a._id,
        a.name,
        a.email,
        a.employeeId || '—',
        a.specialization,
        a.yearsOfExperience || 0,
        a.assignedClaims,
        a.activeClaims,
        a.approvalRate,
        a.performanceScore,
      ]);
    } else if (reportType === 'REVENUE_LEDGER') {
      headers = ['Policy ID', 'Policy Name', 'Policy Type', 'Premium (₹)', 'Coverage (₹)', 'Total Sales', 'Active Sales', 'Gross Revenue (₹)', 'Claim Incidents', 'Total Claimed (₹)'];
      rows = previewData.map((p) => [
        p._id,
        p.name,
        p.type,
        p.premiumAmount,
        p.coverageAmount,
        p.totalPurchases,
        p.activePurchases,
        p.revenue,
        p.totalClaims,
        p.totalClaimAmount,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter preview data by search
  const filteredPreview = previewData.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (reportType === 'CLAIMS_AUDIT') {
      return (
        d.title.toLowerCase().includes(q) ||
        d._id.toLowerCase().includes(q) ||
        (d.customerId?.name && d.customerId.name.toLowerCase().includes(q))
      );
    } else if (reportType === 'CUSTOMER_ROSTER' || reportType === 'ASSESSOR_AUDIT') {
      return d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
    } else if (reportType === 'REVENUE_LEDGER') {
      return d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Reports selection bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { key: 'CLAIMS_AUDIT', label: 'Claims Audit Report', desc: 'Full claim ledgers, status logs, payouts', icon: FileSpreadsheet },
          { key: 'REVENUE_LEDGER', label: 'Revenue Ledger', desc: 'Policy sales premium logs, cashflow counts', icon: TrendingUp },
          { key: 'CUSTOMER_ROSTER', label: 'Customer Demographic', desc: 'Registered customers & policy bindings', icon: Shield },
          { key: 'ASSESSOR_AUDIT', label: 'Assessor Productivity', desc: 'Assessor workloads & performance logs', icon: Clock },
        ].map(({ key, label, desc, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleGenerate(key as any)}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${
              reportType === key
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                : 'bg-[var(--color-base-900)] border-[var(--color-base-800)] text-[var(--color-base-300)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-[11px] text-[var(--color-base-500)] leading-tight">{desc}</p>
          </button>
        ))}
      </div>

      {/* Export Options and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search report contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px]"
            leftAdornment={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Badge variant="info">
            {filteredPreview.length} records ready
          </Badge>
          <Button onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Preview */}
      <Card>
        <div className="flex items-center justify-between mb-4 border-b border-[var(--color-base-800)] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {reportType.replace(/_/g, ' ')} PREVIEW
            </h3>
            <p className="text-xs text-[var(--color-base-500)] mt-0.5">Top preview records, filtered by criteria</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'CLAIMS_AUDIT' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Assessor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreview.slice(0, 30).map((c) => (
                  <tr key={c._id}>
                    <td className="text-xs font-mono text-[var(--color-base-400)]">
                      {`INS-${c._id.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="text-xs font-semibold text-white truncate max-w-[200px]">{c.title}</td>
                    <td className="text-xs text-[var(--color-base-300)]">{c.customerId?.name || '—'}</td>
                    <td className="text-xs text-[var(--color-base-300)]">{c.assignedAssessorId?.name || 'Unassigned'}</td>
                    <td className="text-xs font-bold text-white">{formatCurrency(c.claimAmount)}</td>
                    <td>
                      <Badge variant={c.status === 'PAID' || c.status === 'APPROVED' ? 'success' : 'warning'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="text-xs text-[var(--color-base-500)]">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'REVENUE_LEDGER' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Policy Name</th>
                  <th>Type</th>
                  <th>Premium</th>
                  <th>Coverage</th>
                  <th>Purchases</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreview.slice(0, 30).map((p) => (
                  <tr key={p._id}>
                    <td className="text-xs font-semibold text-white">{p.name}</td>
                    <td>
                      <Badge variant="info">{p.type}</Badge>
                    </td>
                    <td className="text-xs text-[var(--color-base-300)]">{formatCurrency(p.premiumAmount)}/mo</td>
                    <td className="text-xs font-bold text-emerald-400">{formatCurrency(p.coverageAmount)}</td>
                    <td className="text-xs text-[var(--color-base-300)]">{p.totalPurchases} sales</td>
                    <td className="text-xs font-black text-white">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'CUSTOMER_ROSTER' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Policies</th>
                  <th>Claims Filed</th>
                  <th>Payouts Approved</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreview.slice(0, 30).map((c) => (
                  <tr key={c._id}>
                    <td className="text-xs font-semibold text-white">{c.name}</td>
                    <td className="text-xs text-[var(--color-base-300)]">{c.email}</td>
                    <td className="text-xs text-[var(--color-base-300)]">{c.policyCount} purchased</td>
                    <td className="text-xs text-[var(--color-base-300)]">{c.claimCount} filed</td>
                    <td className="text-xs font-bold text-emerald-400">{formatCurrency(c.totalApprovedAmount)}</td>
                    <td className="text-xs text-white font-bold">{c.successRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'ASSESSOR_AUDIT' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessor</th>
                  <th>Employee ID</th>
                  <th>Specialization</th>
                  <th>Assigned</th>
                  <th>Reviewed</th>
                  <th>Approval Rate</th>
                  <th>Performance Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreview.slice(0, 30).map((a) => (
                  <tr key={a._id}>
                    <td className="text-xs font-semibold text-white">{a.name}</td>
                    <td className="text-xs text-[var(--color-base-300)] font-mono">{a.employeeId || '—'}</td>
                    <td>
                      <Badge variant="info">{a.specialization}</Badge>
                    </td>
                    <td className="text-xs text-[var(--color-base-300)]">{a.assignedClaims} claims</td>
                    <td className="text-xs text-[var(--color-base-300)]">{a.totalReviewed}</td>
                    <td className="text-xs font-bold text-white">{a.approvalRate}%</td>
                    <td className="text-xs font-black text-indigo-400">{a.performanceScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
