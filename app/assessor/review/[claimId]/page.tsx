// ============================================================
// app/assessor/review/[claimId]/page.tsx
// Unified review console page for a single claim.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorReviewQueue, getAssessorClaimDetail } from '@/services/assessor.service';
import { getClaimDocuments, getMyClaimsWithDetails, getClaimAssessments } from '@/services/claim.service';
import { ReviewCenterConsole } from '@/components/assessor/ReviewCenterConsole';
import { CheckSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Review Workspace | Assessor Console',
};

interface Params {
  claimId: string;
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const resolvedParams = await params;
  const claimId = resolvedParams.claimId;

  // 1. Fetch claims matching filters under their specialization
  const claims = await getAssessorReviewQueue(session.id);

  // 2. Fetch specific claim data
  let selectedClaim = null;
  let documents: any[] = [];
  let previousClaims: any[] = [];
  let assessments: any[] = [];

  try {
    selectedClaim = await getAssessorClaimDetail(session.id, claimId);
    if (selectedClaim) {
      // Fetch documents
      documents = await getClaimDocuments(claimId);
      
      // Fetch assessments history
      assessments = await getClaimAssessments(claimId);
      
      // Fetch previous claims for the same customer
      const customerId = selectedClaim.customerId?._id?.toString() || selectedClaim.customerId?.toString();
      if (customerId) {
        const customerClaims = await getMyClaimsWithDetails(customerId);
        previousClaims = customerClaims.filter(c => c._id !== claimId);
      }
    }
  } catch (error) {
    console.error('Error loading selected claim:', error);
    redirect('/assessor/reviews');
  }

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" /> Review Center
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Conduct comprehensive audits, review AI fraud risk markers, and finalize approval/rejection decisions.
          </p>
        </div>
      </div>

      {/* Split Console */}
      <ReviewCenterConsole 
        claims={claims} 
        selectedClaim={selectedClaim} 
        documents={documents} 
        previousClaims={previousClaims} 
        assessments={assessments}
      />
    </div>
  );
}
