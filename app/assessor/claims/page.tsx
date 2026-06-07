// ============================================================
// app/assessor/claims/page.tsx
// Complete list of all claims across the entire workspace.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { ClaimsQueue } from '@/components/assessor/ClaimsQueue';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAssessorReviewQueue } from '@/services/assessor.service';

export const metadata: Metadata = {
  title: 'All Claims | Assessor Workspace',
};

export default async function ClaimsListPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  
  const claimsPromise = getAssessorReviewQueue(session.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">All Claims</h1>
        <p className="text-sm text-[var(--color-base-400)] mt-1">
          Complete repository of claims in the system.
        </p>
      </div>

      <ClaimsQueue claimsPromise={claimsPromise} />
    </div>
  );
}
