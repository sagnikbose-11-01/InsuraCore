// ============================================================
// app/assessor/reviews/page.tsx
// Redesigned Review Center: split-pane deep investigation workspace.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorReviewQueue } from '@/services/assessor.service';
import { ReviewCenterConsole } from '@/components/assessor/ReviewCenterConsole';
import { CheckSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Review Center | Assessor Workspace',
};

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Fetch claims in their specialization
  const claims = await getAssessorReviewQueue(session.id);
  
  if (claims.length > 0) {
    redirect(`/assessor/review/${claims[0]._id}`);
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

      {/* Split Console with empty selected state */}
      <ReviewCenterConsole 
        claims={claims} 
        selectedClaim={null} 
        documents={[]} 
        previousClaims={[]} 
        assessments={[]}
      />
    </div>
  );
}
