import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAssessorPolicies, getAssessorPolicyAnalytics } from '@/services/assessor-policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { AssessorPoliciesWorkspace } from '@/components/assessor/policies/AssessorPoliciesWorkspace';

export const metadata: Metadata = {
  title: 'Policy Management | Assessor Console',
  description: 'Manage and create insurance policies in your specialization.',
};

export default async function AssessorPoliciesPage() {
  const session = await getSession();
  if (!session || session.role !== 'ASSESSOR') {
    redirect('/auth/login');
  }

  // Fetch initial data for the workspace
  const policies = await getAssessorPolicies(session.id);
  const analytics = await getAssessorPolicyAnalytics(session.id);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <span className="text-purple-400 font-bold text-lg">P</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Policy Management</h1>
        </div>
        <p className="text-[var(--color-base-400)] text-sm">
          Create and manage {session.specialization} insurance policies, monitor their performance, and track purchases.
        </p>
      </header>

      <AssessorPoliciesWorkspace
        initialPolicies={policies}
        analytics={analytics}
        specialization={session.specialization}
        assessorId={session.id}
      />
    </div>
  );
}
