import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getPolicyById } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { ArrowLeft, ShieldCheck, Clock, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { PolicyListingStatus } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Policy Details | Assessor Console',
  description: 'View detailed information and performance of an insurance policy.',
};

interface Props {
  params: Promise<{ policyId: string }>;
}

export default async function AssessorPolicyDetailsPage({ params }: Props) {
  const { policyId } = await params;
  const session = await getSession();
  if (!session || session.role !== 'ASSESSOR') {
    redirect('/auth/login');
  }

  const policy = await getPolicyById(policyId);
  if (!policy || policy.createdByAssessorId?.toString() !== session.id) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PolicyListingStatus.ACTIVE:
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Active</span>;
      case PolicyListingStatus.PENDING_ADMIN_APPROVAL:
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-2"><Clock className="w-4 h-4" /> Pending Approval</span>;
      case PolicyListingStatus.REJECTED:
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-2"><XCircle className="w-4 h-4" /> Rejected</span>;
      default:
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-6">
          <Link href="/assessor/policies" className="inline-flex items-center gap-2 text-sm text-[var(--color-base-400)] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Policies
          </Link>
        </div>

        <div className="bg-[var(--color-base-900)] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-xl overflow-hidden">
          <div className="p-8 border-b border-[rgba(255,255,255,0.05)] bg-[var(--color-base-950)]/50">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  {getStatusBadge(policy.status || PolicyListingStatus.ACTIVE)}
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{policy.name}</h1>
                <p className="text-[var(--color-base-400)] mt-2 max-w-2xl text-lg">{policy.description}</p>
              </div>
              <div className="flex flex-col gap-2 text-right shrink-0">
                <div className="text-sm text-[var(--color-base-400)]">Created on {new Date(policy.createdAt).toLocaleDateString()}</div>
                <div className="text-sm font-medium px-3 py-1 rounded-lg bg-[var(--color-base-800)] text-[var(--color-base-300)] self-end">
                  Type: {policy.type}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Financials */}
              <section>
                <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Financial Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--color-base-950)] p-5 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="text-sm text-[var(--color-base-400)] mb-1">Premium Amount</div>
                    <div className="text-2xl font-bold text-white">₹{policy.premiumAmount.toLocaleString('en-IN')}<span className="text-sm font-normal text-[var(--color-base-500)]">/mo</span></div>
                  </div>
                  <div className="bg-[var(--color-base-950)] p-5 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="text-sm text-[var(--color-base-400)] mb-1">Coverage Amount</div>
                    <div className="text-2xl font-bold text-emerald-400">₹{policy.coverageAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </section>

              {/* Details */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Eligibility</h3>
                  <ul className="space-y-2">
                    {policy.eligibility && policy.eligibility.length > 0 ? policy.eligibility.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-base-300)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : <li className="text-sm text-[var(--color-base-500)]">No specific eligibility criteria.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Benefits</h3>
                  <ul className="space-y-2">
                    {policy.benefits && policy.benefits.length > 0 ? policy.benefits.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-base-300)]">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : <li className="text-sm text-[var(--color-base-500)]">Standard benefits apply.</li>}
                  </ul>
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Exclusions</h3>
                  <ul className="space-y-2">
                    {policy.exclusions && policy.exclusions.length > 0 ? policy.exclusions.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-base-300)]">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : <li className="text-sm text-[var(--color-base-500)]">Standard exclusions apply.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Parameters</h3>
                  <div className="space-y-3 bg-[var(--color-base-950)] p-5 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-base-400)]">Validity Period</span>
                      <span className="text-white font-medium">{policy.validityPeriod} Months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-base-400)]">Waiting Period</span>
                      <span className="text-white font-medium">{policy.waitingPeriod || 0} Days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-base-400)]">Max Claim</span>
                      <span className="text-white font-medium">₹{(policy.maximumClaimAmount || policy.coverageAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-base-400)]">Risk Category</span>
                      <span className="text-white font-medium">{policy.riskCategory || 'Standard'}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              {/* Approval History */}
              <section>
                <h3 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">Approval History</h3>
                <div className="relative pl-4 border-l border-[rgba(255,255,255,0.1)] space-y-6">
                  {policy.approvalHistory && policy.approvalHistory.length > 0 ? (
                    policy.approvalHistory.map((history: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-[var(--color-base-900)]" />
                        <div className="text-sm font-medium text-white">{history.status.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-[var(--color-base-400)] mt-0.5">{new Date(history.date).toLocaleString()}</div>
                        <div className="text-xs text-[var(--color-base-300)] mt-2 bg-[var(--color-base-950)] p-2.5 rounded-lg border border-[rgba(255,255,255,0.05)]">
                          {history.comments || 'No comments.'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[var(--color-base-500)]">No history available.</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
