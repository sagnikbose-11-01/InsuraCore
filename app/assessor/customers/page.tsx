// ============================================================
// app/assessor/customers/page.tsx
// Specialization-scoped Customer Directory.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorCustomerDirectory } from '@/services/assessor.service';
import { Users, Mail, Phone, ShieldCheck, FileText, CheckCircle2, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Customer Directory | Assessor Workspace',
};

export default async function CustomerDirectoryPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Fetch customers matching assessor specialization
  const customers = await getAssessorCustomerDirectory(session.id);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" /> Customer Directory
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Browse customers holding active policies and filed claims matching the <strong className="text-purple-300">{session.specialization}</strong> department.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
          {customers.length} Accounts Scoped
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Info</th>
                <th>Active Specialty Policies</th>
                <th>Total Claims Filed</th>
                <th>Claims Status Summary</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--color-base-500)]">
                    No customers found holding policies matching your specialization.
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c._id} className="group hover:bg-[var(--color-base-900)]/30">
                    <td className="font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{c.name}</div>
                          <span className="text-[10px] text-[var(--color-base-550)] font-mono">ID: {c._id.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-base-300)]">
                        <Mail className="w-3.5 h-3.5 text-[var(--color-base-550)]" /> {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-base-500)] mt-1">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-base-600)]" /> {c.phone || 'No phone'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-sm text-white">{c.activePolicies}</span>
                        <span className="text-[10px] text-[var(--color-base-500)] uppercase font-semibold">Active</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm text-white">{c.totalClaims}</span>
                        <span className="text-[10px] text-[var(--color-base-500)] uppercase font-semibold">Total</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {c.claimsSummary.approved > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                            <CheckCircle2 className="w-3 h-3" /> {c.claimsSummary.approved} Approved
                          </span>
                        )}
                        {c.claimsSummary.pending > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                            <Clock className="w-3 h-3 animate-pulse" /> {c.claimsSummary.pending} Reviewing
                          </span>
                        )}
                        {c.claimsSummary.rejected > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                            <Users className="w-3 h-3" /> {c.claimsSummary.rejected} Rejected
                          </span>
                        )}
                        {c.claimsSummary.approved === 0 && c.claimsSummary.pending === 0 && c.claimsSummary.rejected === 0 && (
                          <span className="text-[10px] text-[var(--color-base-500)] italic">No Claims History</span>
                        )}
                      </div>
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
