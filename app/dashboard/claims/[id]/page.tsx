import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getClaimById, getClaimDocuments } from '@/services/claim.service';
import { getPaymentByClaim } from '@/services/payment.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DocumentUploader } from './DocumentUploader';
import Link from 'next/link';
import {
  Calendar, FileText, CheckCircle2, Clock, DollarSign,
  User, AlertCircle, ChevronLeft, Upload, ShieldCheck,
} from 'lucide-react';
import {
  formatCurrency, formatDate, formatDateTime,
  getClaimStatusVariant, CLAIM_STATUS_LABEL,
} from '@/lib/utils/formatters';
import { ClaimStatus, DocumentStatus, PaymentStatus } from '@/lib/constants/enums';
import { SerializedUser, SerializedPurchasedPolicy, SerializedPolicy } from '@/types';

export const metadata: Metadata = { title: 'Claim Details' };

const TIMELINE_STEPS = [
  { status: ClaimStatus.SUBMITTED, label: 'Submitted', icon: FileText },
  { status: ClaimStatus.UNDER_REVIEW, label: 'Under Review', icon: Clock },
  { status: ClaimStatus.DOCUMENT_VERIFICATION, label: 'Doc Verification', icon: CheckCircle2 },
  { status: ClaimStatus.APPROVED, label: 'Approved', icon: CheckCircle2 },
  { status: ClaimStatus.PAID, label: 'Paid', icon: DollarSign },
];

const STATUS_ORDER = [
  ClaimStatus.PENDING,
  ClaimStatus.SUBMITTED,
  ClaimStatus.UNDER_REVIEW,
  ClaimStatus.DOCUMENT_VERIFICATION,
  ClaimStatus.APPROVED,
  ClaimStatus.PAID,
];

export default async function ClaimDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const [claim, documents, payment] = await Promise.all([
    getClaimById(params.id),
    getClaimDocuments(params.id),
    getPaymentByClaim(params.id),
  ]);

  if (!claim) notFound();

  const purchasedPolicy = claim.purchasedPolicyId as SerializedPurchasedPolicy;
  const policy = purchasedPolicy?.policyId as SerializedPolicy;
  const assessor = claim.assignedAssessorId as SerializedUser | null;
  const isRejected = claim.status === ClaimStatus.REJECTED;
  const currentStepIndex = STATUS_ORDER.indexOf(claim.status);

  return (
    <DashboardShell>
      <div className="mb-6">
        <Link href="/dashboard/claims">
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Back to Claims
          </Button>
        </Link>
      </div>

      <PageHeader
        title={claim.title}
        description={`Filed on ${formatDate(claim.createdAt)}`}
        action={
          <Badge variant={getClaimStatusVariant(claim.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'} className="text-sm px-3 py-1">
            {CLAIM_STATUS_LABEL[claim.status]}
          </Badge>
        }
      />

      {/* ── TIMELINE ─────────────────────────────────────── */}
      {!isRejected ? (
        <Card className="mb-6">
          <div className="flex items-center justify-between relative">
            {TIMELINE_STEPS.map((step, i) => {
              const stepIndex = STATUS_ORDER.indexOf(step.status);
              const isDone = currentStepIndex > stepIndex;
              const isActive = currentStepIndex === stepIndex;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1 relative z-10">
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 z-0 transition-colors duration-500 ${isDone ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-base-700)]'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                    isDone ? 'bg-[var(--color-success-500)] text-white' :
                    isActive ? 'bg-[var(--color-brand-500)] text-white ring-4 ring-[oklch(28%_0.10_230)]' :
                    'bg-[var(--color-base-800)] text-[var(--color-base-600)]'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className={`text-xs mt-2 font-medium text-center ${isActive ? 'text-[var(--color-brand-300)]' : isDone ? 'text-[var(--color-success-400)]' : 'text-[var(--color-base-600)]'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)]">
          <AlertCircle className="w-5 h-5 text-[var(--color-danger-400)] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-danger-400)]">Claim Rejected</p>
            <p className="text-xs text-[oklch(55%_0.15_25)]">This claim was not approved. Please contact support for more information.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Info */}
          <Card>
            <CardHeader><CardTitle>Claim Information</CardTitle></CardHeader>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--color-base-500)] mb-1">Description</p>
                <p className="text-sm text-[var(--color-base-300)] leading-relaxed">{claim.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-base-500)] flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Incident Date</p>
                  <p className="text-sm font-medium text-[var(--color-base-200)]">{formatDate(claim.incidentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-base-500)] flex items-center gap-1 mb-1"><DollarSign className="w-3 h-3" /> Claimed Amount</p>
                  <p className="text-sm font-bold text-[var(--color-base-100)]">{formatCurrency(claim.claimAmount)}</p>
                </div>
                {claim.approvedAmount > 0 && (
                  <div>
                    <p className="text-xs text-[var(--color-base-500)] flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3" /> Approved Amount</p>
                    <p className="text-sm font-bold text-[oklch(72%_0.17_150)]">{formatCurrency(claim.approvedAmount)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <span className="text-xs text-[var(--color-base-500)]">{documents.length} file(s)</span>
            </CardHeader>

            <DocumentUploader claimId={claim._id} initialDocuments={documents} />
          </Card>

          {/* Payment */}
          {payment && (
            <Card>
              <CardHeader><CardTitle>Settlement Payment</CardTitle></CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[var(--color-base-100)]">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-[var(--color-base-500)] mt-1">
                    via {payment.paymentMethod.replace('_', ' ')}
                    {payment.paymentDate && ` · ${formatDate(payment.paymentDate)}`}
                  </p>
                </div>
                <Badge variant={payment.status === PaymentStatus.SUCCESS ? 'success' : payment.status === PaymentStatus.FAILED ? 'danger' : 'warning'}>
                  {payment.status}
                </Badge>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Policy Details */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Policy</p>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[oklch(72%_0.20_230)]" />
              <p className="text-sm font-semibold text-[var(--color-base-100)]">{policy?.name ?? '—'}</p>
            </div>
            <p className="text-xs text-[var(--color-base-500)]">
              Coverage: <span className="text-[oklch(72%_0.20_230)] font-medium">{policy ? formatCurrency(policy.coverageAmount) : '—'}</span>
            </p>
          </Card>

          {/* Assessor */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Assigned Assessor</p>
            {assessor ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-700)] flex items-center justify-center text-xs font-bold text-[var(--color-brand-200)]">
                  {assessor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-base-200)]">{assessor.name}</p>
                  <p className="text-xs text-[var(--color-base-500)]">{assessor.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--color-base-500)]">
                <User className="w-4 h-4" />
                Awaiting assignment
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
