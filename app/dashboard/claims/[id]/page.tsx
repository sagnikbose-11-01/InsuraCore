// ============================================================
// app/dashboard/claims/[id]/page.tsx
// Premium claim detail page — vertical timeline, documents,
// assessor remarks, payment panel, and full metadata.
// ============================================================

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getClaimById, getClaimDocuments } from '@/services/claim.service';
import { getPaymentByClaim } from '@/services/payment.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { DocumentUploader } from './DocumentUploader';
import Link from 'next/link';
import {
  ChevronLeft, ShieldCheck, Calendar, DollarSign, CheckCircle2,
  AlertCircle, User, Hash, Clock, FileText, Banknote, MessageSquare,
  Send, FileSearch, Search, Info,
} from 'lucide-react';
import {
  formatCurrency, formatDate, formatDateTime,
  DOCUMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL,
} from '@/lib/utils/formatters';
import { ClaimStatus, DocumentStatus, PaymentStatus } from '@/lib/constants/enums';
import { SerializedUser, SerializedPurchasedPolicy, SerializedPolicy } from '@/types';

export const metadata: Metadata = { title: 'Claim Details | InsuraCore' };

// ── Timeline config ──────────────────────────────────────────

const TIMELINE_STEPS = [
  { status: ClaimStatus.SUBMITTED,             label: 'Claim Submitted',       icon: Send,        desc: 'Your claim has been filed and entered our system.' },
  { status: ClaimStatus.DOCUMENT_VERIFICATION, label: 'Documents Uploaded',    icon: FileSearch,  desc: 'Supporting documents are being reviewed.' },
  { status: ClaimStatus.UNDER_REVIEW,          label: 'Assessor Review',       icon: Search,      desc: 'An assessor has been assigned and is reviewing your claim.' },
  { status: ClaimStatus.APPROVED,              label: 'Decision Made',         icon: CheckCircle2,desc: 'The assessor has reached a decision on your claim.' },
  { status: ClaimStatus.PAID,                  label: 'Settlement Released',   icon: Banknote,    desc: 'Your settlement amount has been transferred.' },
];

const STATUS_ORDER: ClaimStatus[] = [
  ClaimStatus.PENDING,
  ClaimStatus.SUBMITTED,
  ClaimStatus.DOCUMENT_VERIFICATION,
  ClaimStatus.UNDER_REVIEW,
  ClaimStatus.APPROVED,
  ClaimStatus.PAID,
];

const DOC_STATUS_STYLE: Record<DocumentStatus, { text: string; bg: string; border: string; label: string }> = {
  [DocumentStatus.UPLOADED]: { text: 'text-[oklch(72%_0.20_230)]', bg: 'bg-[oklch(18%_0.05_230)]', border: 'border-[oklch(28%_0.10_230)]', label: 'Uploaded' },
  [DocumentStatus.VERIFIED]: { text: 'text-[oklch(72%_0.17_150)]', bg: 'bg-[oklch(20%_0.05_150)]', border: 'border-[oklch(30%_0.08_150)]', label: 'Verified' },
  [DocumentStatus.REJECTED]: { text: 'text-[oklch(65%_0.20_25)]',  bg: 'bg-[oklch(18%_0.05_25)]',  border: 'border-[oklch(28%_0.08_25)]',  label: 'Rejected' },
};

// ── Page ─────────────────────────────────────────────────────

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const [claim, documents, payment] = await Promise.all([
    getClaimById(id),
    getClaimDocuments(id),
    getPaymentByClaim(id),
  ]);

  if (!claim) notFound();

  const purchasedPolicy = claim.purchasedPolicyId as SerializedPurchasedPolicy | null;
  const policy          = purchasedPolicy?.policyId as SerializedPolicy | null;
  const assessor        = claim.assignedAssessorId as SerializedUser | null;
  const isRejected      = claim.status === ClaimStatus.REJECTED;
  const currentIdx      = STATUS_ORDER.indexOf(claim.status);
  const claimRef        = `INS-${claim._id.slice(-8).toUpperCase()}`;

  return (
    <DashboardShell>
      {/* ── Back link ─────────────────────────────────── */}
      <Link
        href="/dashboard/claims"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-base-500)] hover:text-[var(--color-base-200)] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to My Claims
      </Link>

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-[oklch(72%_0.20_230)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] font-mono font-semibold mb-1">{claimRef}</p>
            <h1 className="text-xl font-bold text-[var(--color-base-100)] leading-tight">{claim.title}</h1>
            <p className="text-sm text-[var(--color-base-500)] mt-1">Filed {formatDate(claim.createdAt)}</p>
          </div>
        </div>
        <ClaimStatusBadge status={claim.status} size="md" />
      </div>

      {/* ── Rejected banner ───────────────────────────── */}
      {isRejected && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)]">
          <AlertCircle className="w-5 h-5 text-[var(--color-danger-400)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-danger-400)]">Claim Rejected</p>
            <p className="text-xs text-[oklch(55%_0.15_25)] mt-0.5">
              This claim was not approved. Please review the assessor remarks below or contact support.
            </p>
          </div>
        </div>
      )}

      {/* ── Main layout: 3-col left + 1-col right ─────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ════════ LEFT COLUMN (2/3) ════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── A. Claim Overview ── */}
          <Card>
            <CardHeader><CardTitle>Claim Overview</CardTitle></CardHeader>

            <div className="mb-5">
              <p className="text-xs text-[var(--color-base-500)] mb-1">Description</p>
              <p className="text-sm text-[var(--color-base-300)] leading-relaxed">{claim.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Incident Date',    icon: Calendar,    value: formatDate(claim.incidentDate) },
                { label: 'Filed Date',       icon: Clock,       value: formatDate(claim.createdAt) },
                { label: 'Last Updated',     icon: Clock,       value: formatDate(claim.updatedAt) },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-[var(--color-base-500)] flex items-center gap-1 mb-1">
                    <item.icon className="w-3 h-3" /> {item.label}
                  </p>
                  <p className="text-sm font-medium text-[var(--color-base-200)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-base-800)]">
              <div className="p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
                <p className="text-xs text-[var(--color-base-500)] flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3" /> Claimed Amount
                </p>
                <p className="text-lg font-bold text-[var(--color-base-100)]">{formatCurrency(claim.claimAmount)}</p>
              </div>
              {claim.approvedAmount > 0 && (
                <div className="p-3 rounded-xl bg-[oklch(20%_0.05_150)] border border-[oklch(30%_0.08_150)]">
                  <p className="text-xs text-[oklch(72%_0.17_150)] flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3 h-3" /> Approved Amount
                  </p>
                  <p className="text-lg font-bold text-[oklch(72%_0.17_150)]">{formatCurrency(claim.approvedAmount)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* ── B. Claim Timeline ── */}
          <Card>
            <CardHeader><CardTitle>Claim Timeline</CardTitle></CardHeader>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => {
                const stepIdx  = STATUS_ORDER.indexOf(step.status);
                const isDone   = !isRejected && currentIdx > stepIdx;
                const isActive = !isRejected && currentIdx === stepIdx;
                const isPending = !isDone && !isActive;
                const Icon = step.icon;
                const isLast = i === TIMELINE_STEPS.length - 1;

                return (
                  <div key={step.status} className="flex gap-4">
                    {/* Timeline rail */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isDone
                          ? 'bg-[var(--color-success-500)] text-white'
                          : isActive
                          ? 'bg-[var(--color-brand-500)] text-white ring-4 ring-[oklch(28%_0.10_230)]'
                          : 'bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-600)]'
                      }`}>
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4" />
                          : <Icon className="w-3.5 h-3.5" />
                        }
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-[2rem] my-1 rounded-full transition-colors duration-500 ${
                          isDone ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-base-800)]'
                        }`} />
                      )}
                    </div>

                    {/* Step content */}
                    <div className={`pb-5 ${isLast ? '' : ''}`}>
                      <p className={`text-sm font-semibold leading-none mb-1 ${
                        isActive ? 'text-[var(--color-brand-300)]' :
                        isDone   ? 'text-[var(--color-success-400)]' :
                                   'text-[var(--color-base-600)]'
                      }`}>
                        {step.label}
                        {isActive && (
                          <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-brand-400)] bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] px-1.5 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className={`text-xs mt-0.5 ${isPending ? 'text-[var(--color-base-700)]' : 'text-[var(--color-base-500)]'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── C. Uploaded Documents ── */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <span className="text-xs text-[var(--color-base-500)]">{documents.length} file(s)</span>
            </CardHeader>
            <DocumentUploader claimId={claim._id} initialDocuments={documents} />
          </Card>

          {/* ── D. Assessor Remarks ── */}
          {assessor && (
            <Card>
              <CardHeader>
                <CardTitle>Assessor Remarks</CardTitle>
              </CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-700)] flex items-center justify-center text-sm font-bold text-[var(--color-brand-200)] flex-shrink-0">
                  {assessor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--color-base-200)]">{assessor.name}</p>
                  <p className="text-xs text-[var(--color-base-500)] mb-3">{assessor.email} · Assigned Assessor</p>
                  <div className="p-4 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
                    <MessageSquare className="w-4 h-4 text-[var(--color-base-600)] mb-2" />
                    <p className="text-sm text-[var(--color-base-300)] leading-relaxed italic">
                      {isRejected
                        ? 'This claim has been reviewed and rejected. Please contact support for further information regarding the decision.'
                        : claim.status === ClaimStatus.APPROVED
                        ? 'Documents verified successfully. The approved amount has been adjusted based on your policy coverage terms.'
                        : 'Claim is currently under active review. Our assessor will update you shortly.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── E. Payment Information ── */}
          {payment && (
            <Card>
              <CardHeader><CardTitle>Settlement Payment</CardTitle></CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Settlement Amount',
                    value: formatCurrency(payment.amount),
                    valueClass: 'text-xl font-bold text-[var(--color-base-100)]',
                  },
                  {
                    label: 'Status',
                    value: PAYMENT_STATUS_LABEL[payment.status as PaymentStatus],
                    valueClass: payment.status === PaymentStatus.SUCCESS
                      ? 'text-sm font-semibold text-[oklch(72%_0.17_150)]'
                      : payment.status === PaymentStatus.FAILED
                      ? 'text-sm font-semibold text-[oklch(65%_0.20_25)]'
                      : 'text-sm font-semibold text-[oklch(78%_0.18_75)]',
                  },
                  {
                    label: 'Payment Method',
                    value: payment.paymentMethod.replace('_', ' '),
                    valueClass: 'text-sm font-medium text-[var(--color-base-200)]',
                  },
                  {
                    label: 'Payment Date',
                    value: payment.paymentDate ? formatDate(payment.paymentDate) : 'Pending',
                    valueClass: 'text-sm font-medium text-[var(--color-base-200)]',
                  },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
                    <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={item.valueClass}>{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ════════ RIGHT COLUMN (1/3) ════════ */}
        <div className="space-y-5">

          {/* Policy card */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Policy</p>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[oklch(72%_0.20_230)]" />
              <p className="text-sm font-semibold text-[var(--color-base-100)]">{policy?.name ?? '—'}</p>
            </div>
            <p className="text-xs text-[var(--color-base-500)] mb-1">
              Type: <span className="text-[var(--color-base-300)] font-medium">{policy?.type ?? '—'} Insurance</span>
            </p>
            <p className="text-xs text-[var(--color-base-500)]">
              Coverage:{' '}
              <span className="text-[oklch(72%_0.20_230)] font-medium">
                {policy ? formatCurrency(policy.coverageAmount) : '—'}
              </span>
            </p>
          </Card>

          {/* Assessor card */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Assigned Assessor</p>
            {assessor ? (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[var(--color-brand-700)] flex items-center justify-center text-xs font-bold text-[var(--color-brand-200)] flex-shrink-0">
                  {assessor.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-base-200)] truncate">{assessor.name}</p>
                  <p className="text-xs text-[var(--color-base-500)] truncate">{assessor.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--color-base-500)]">
                <User className="w-4 h-4" />
                Awaiting assignment
              </div>
            )}
          </Card>

          {/* Claim metadata */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Claim Metadata</p>
            <div className="space-y-2.5">
              {[
                { label: 'Reference No.', value: claimRef,                              icon: Hash },
                { label: 'Filed At',      value: formatDateTime(claim.createdAt),       icon: Calendar },
                { label: 'Last Updated',  value: formatDateTime(claim.updatedAt),       icon: Clock },
                { label: 'Claim ID',      value: claim._id.slice(-12).toUpperCase(),    icon: Hash },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <item.icon className="w-3.5 h-3.5 text-[var(--color-base-600)] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--color-base-600)] uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs text-[var(--color-base-300)] font-mono break-all">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Info notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
            <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
              Claims are typically reviewed within <strong>3–5 business days</strong>. Upload all relevant documents to avoid delays.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
