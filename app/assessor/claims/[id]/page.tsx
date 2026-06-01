import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getClaimById, getClaimDocuments } from '@/services/claim.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AssessorReviewPanel } from './AssessorReviewPanel';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = { title: 'Assessor Claim Review' };

export default async function AssessorClaimReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) redirect('/login');

  const { id } = await params;

  const [claim, documents] = await Promise.all([
    getClaimById(id),
    getClaimDocuments(id),
  ]);

  if (!claim) notFound();

  // Guard to ensure this claim is assigned to this assessor
  const assessorId = typeof claim.assignedAssessorId === 'object' && claim.assignedAssessorId
    ? claim.assignedAssessorId._id
    : claim.assignedAssessorId;

  if (assessorId !== session.id) {
    redirect('/assessor');
  }

  return (
    <DashboardShell>
      <div className="mb-6">
        <Link href="/assessor">
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Back to Pipeline
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Review: ${claim.title}`}
        description={`Filed on ${new Date(claim.createdAt).toLocaleDateString()}`}
      />

      <AssessorReviewPanel claim={claim} initialDocuments={documents} />
    </DashboardShell>
  );
}
