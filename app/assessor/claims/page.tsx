// ============================================================
// app/assessor/claims/page.tsx
// Operational task manager displaying active actionable claims.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorWorkQueue } from '@/services/assessor.service';
import { WorkQueueTable } from '@/components/assessor/WorkQueueTable';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Work Queue | Assessor Workspace',
};

export default async function ClaimsListPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  // Fetch only active actionable claims scoped to their specialization
  const claims = await getAssessorWorkQueue(session.id);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" /> Work Queue
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Browse and process claim requests requiring document verification or decision assessments.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
          {claims.length} Actionable Claims
        </div>
      </div>

      {/* Table */}
      <WorkQueueTable claims={claims} assessorId={session.id} />
    </div>
  );
}
