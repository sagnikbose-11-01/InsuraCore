// ============================================================
// app/assessor/reports/page.tsx
// Executive Reporting Center for the Assessor Console.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorHistory, getAssessorDashboardMetrics } from '@/services/assessor.service';
import { FileSpreadsheet, Download, FileText, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

export const metadata: Metadata = {
  title: 'Operational Reports | Assessor Workspace',
};

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Fetch data
  const metrics = await getAssessorDashboardMetrics(session.id);
  const resolvedClaims = await getAssessorHistory(session.id);

  // Calculate stats
  const totalPayout = resolvedClaims.reduce((acc: number, val: any) => acc + (val.approvedAmount || 0), 0);
  const averagePayout = resolvedClaims.length > 0 ? totalPayout / resolvedClaims.length : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-400" /> Operational Reports
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Generate, filter, and export claim resolution summaries, payouts, and SLA reports.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all">
            <Download className="w-4 h-4" /> Export Executive PDF
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-base-400)] text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Total Capital Settled
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(totalPayout)}</p>
          <p className="text-[10px] text-[var(--color-base-500)]">From all approved claims in your specialization</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-base-400)] text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Average Settlement
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(averagePayout)}</p>
          <p className="text-[10px] text-[var(--color-base-500)]">Per approved request</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-base-400)] text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-blue-400" /> Accuracy Rate
          </div>
          <p className="text-2xl font-black text-white">99.4%</p>
          <p className="text-[10px] text-[var(--color-base-500)]">Auditor approval consensus rate</p>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h3 className="text-sm font-bold text-white">Settlement Report Log</h3>
            <p className="text-xs text-[var(--color-base-450)] mt-0.5">Audit trail of claims matching specialization.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Claimant</th>
                <th>Policy Name</th>
                <th>Request Date</th>
                <th>Resolution Date</th>
                <th>Claim Amount</th>
                <th>Payout Settled</th>
                <th>Decision Status</th>
              </tr>
            </thead>
            <tbody>
              {resolvedClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--color-base-500)]">
                    No claim records registered in database yet.
                  </td>
                </tr>
              ) : (
                resolvedClaims.map((c: any) => (
                  <tr key={c._id} className="text-xs">
                    <td className="font-mono font-bold text-white">INS-{c._id.slice(-8).toUpperCase()}</td>
                    <td className="font-semibold text-white">{c.customerId?.name}</td>
                    <td>{c.purchasedPolicyId?.policyId?.name || 'Standard Cover'}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>{formatDate(c.updatedAt)}</td>
                    <td className="font-mono">{formatCurrency(c.claimAmount)}</td>
                    <td className="font-mono text-white font-bold">
                      {c.approvedAmount > 0 ? formatCurrency(c.approvedAmount) : '₹0'}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        c.status === 'APPROVED' || c.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
