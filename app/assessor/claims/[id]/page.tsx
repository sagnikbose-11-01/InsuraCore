// ============================================================
// app/assessor/claims/[id]/page.tsx
// The Claim Command Center. Comprehensive dashboard for reviewing
// a single claim, verifying documents, and making decisions.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, FileQuestion, MessageSquare } from 'lucide-react';
import { ClaimDetailsCard } from '@/components/assessor/ClaimDetailsCard';
import { FraudScoreCard } from '@/components/assessor/FraudScoreCard';
import { DocumentViewer } from '@/components/assessor/DocumentViewer';
import { ActivityFeed } from '@/components/assessor/ActivityFeed';
import { getSession } from '@/lib/auth/session';
import { getAssessorClaimDetail } from '@/services/assessor.service';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Claim Review | Assessor Workspace',
};

export default async function ClaimReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const resolvedParams = await params;
  const id = resolvedParams.id;

  let claim;
  try {
    claim = await getAssessorClaimDetail(session.id, id);
  } catch (error) {
    // If claim not found or unauthorized, redirect back to reviews
    redirect('/assessor/reviews');
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link 
          href="/assessor"
          className="p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Reviewing {id}</h1>
          <p className="text-xs text-[var(--color-base-400)] mt-0.5">Assigned to you • Due in 48 hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-6">
          <ClaimDetailsCard claim={claim} />
          
          {/* Assessor Actions Box */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-4">Assessor Decision</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-base-300)] mb-2">Internal Notes / Remarks</label>
                <textarea 
                  className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 transition-all min-h-[100px]"
                  placeholder="Add your rationale for approval, rejection, or request for more documents..."
                />
              </div>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                  <CheckCircle className="w-4 h-4" /> Approve Claim
                </button>
                <button className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-white text-sm font-bold transition-all">
                  <FileQuestion className="w-4 h-4" /> Request Docs
                </button>
                <button className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 text-sm font-bold transition-all">
                  <XCircle className="w-4 h-4" /> Reject Claim
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar widgets) */}
        <div className="lg:col-span-4 space-y-6">
          <FraudScoreCard score={claim.riskScore || 0} />
          <DocumentViewer />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
