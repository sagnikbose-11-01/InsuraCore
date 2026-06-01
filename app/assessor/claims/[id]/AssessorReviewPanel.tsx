'use client';
// ============================================================
// app/assessor/claims/[id]/AssessorReviewPanel.tsx
// Dual-pane layout for assessors to verify documents
// and submit final decision.
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { verifyDocumentAction, submitAssessmentAction } from '@/app/actions/claim.actions';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import { DocumentStatus, ClaimStatus } from '@/lib/constants/enums';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';
import { SerializedClaim, SerializedClaimDocument, SerializedPurchasedPolicy, SerializedPolicy, SerializedUser } from '@/types';
import { ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  claim: SerializedClaim;
  initialDocuments: SerializedClaimDocument[];
}

export function AssessorReviewPanel({ claim, initialDocuments }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [documents, setDocuments] = useState(initialDocuments);
  const [isPending, startTransition] = useTransition();
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form values
  const [remarks, setRemarks] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(String(claim.claimAmount));
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  const customer = claim.customerId as SerializedUser;
  const purchasedPolicy = claim.purchasedPolicyId as SerializedPurchasedPolicy;
  const policy = purchasedPolicy?.policyId as SerializedPolicy;

  async function handleVerifyDoc(docId: string, status: DocumentStatus) {
    setDocLoadingId(docId);
    setError(null);
    try {
      const res = await verifyDocumentAction(docId, status);
      if (res.success) {
        setDocuments((prev) =>
          prev.map((d) => (d._id === docId ? { ...d, verificationStatus: status } : d))
        );
        toast.success(`Document marked as ${status.toLowerCase()} successfully.`);
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to update document verification status.');
      }
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message || 'Failed to update document verification status.');
    } finally {
      setDocLoadingId(null);
    }
  }

  async function handleSubmitDecision(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('claimId', claim._id);
    formData.append('remarks', remarks);
    formData.append('approvedAmount', approvedAmount);
    formData.append('decision', decision);

    startTransition(async () => {
      const res = await submitAssessmentAction(formData);
      if (res.success) {
        toast.success(`Claim assessment submitted: ${decision.toLowerCase()}!`);
        router.push('/assessor');
        router.refresh();
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to submit claim decision.');
      }
    });
  }

  const isCompleted = claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.REJECTED || claim.status === ClaimStatus.PAID;

  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
      {/* ── LEFT PANE: CLAIM INFO & DOCUMENTS ───────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Claim Information */}
        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-base-100)]">Details</h2>
              <p className="text-xs text-[var(--color-base-500)] mt-0.5">Filed by {customer?.name} ({customer?.email})</p>
            </div>
            <Badge variant={getClaimStatusVariant(claim.status) as any}>
              {CLAIM_STATUS_LABEL[claim.status]}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--color-base-500)] mb-1">Incident description</p>
              <p className="text-sm text-[var(--color-base-300)] leading-relaxed bg-[var(--color-base-900)] p-3 rounded-lg border border-[var(--color-base-800)]">
                {claim.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-base-500)] mb-1">Claim Amount</p>
                <p className="text-base font-bold text-[var(--color-base-100)]">{formatCurrency(claim.claimAmount)}</p>
              </div>
              <div>
                <p className="text-xs text(--color-base-500) mb-1">Incident Date</p>
                <p className="text-sm text-[var(--color-base-300)] font-medium">{formatDate(claim.incidentDate)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Documents Verification List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents Checklist</CardTitle>
            <span className="text-xs text-[var(--color-base-500)]">{documents.length} uploaded</span>
          </CardHeader>

          {documents.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-10 h-10 mx-auto text-[var(--color-base-700)] mb-2" />
              <p className="text-xs text-[var(--color-base-500)]">No supporting documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const docId = doc._id;
                const isDocLoading = docLoadingId === docId;
                return (
                  <div key={docId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[var(--color-base-900)] border border-[var(--color-base-800)] gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-base-800)] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[var(--color-base-400)]" />
                      </div>
                      <div>
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] block truncate max-w-[220px]"
                        >
                          {doc.documentName}
                        </a>
                        <p className="text-[10px] text-[var(--color-base-500)] mt-0.5">Uploaded {formatDate(doc.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={doc.verificationStatus === DocumentStatus.VERIFIED ? 'success' : doc.verificationStatus === DocumentStatus.REJECTED ? 'danger' : 'info'}>
                        {doc.verificationStatus}
                      </Badge>
                      {!isCompleted && (
                        <div className="flex gap-1.5 ml-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleVerifyDoc(docId, DocumentStatus.VERIFIED)}
                            disabled={isDocLoading || doc.verificationStatus === DocumentStatus.VERIFIED}
                            className="h-7 text-xs px-2"
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerifyDoc(docId, DocumentStatus.REJECTED)}
                            disabled={isDocLoading || doc.verificationStatus === DocumentStatus.REJECTED}
                            className="h-7 text-xs px-2 text-[var(--color-danger-400)] hover:bg-[var(--color-danger-bg)]"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── RIGHT PANE: DECISION & POLICY INFO ───────────────── */}
      <div className="space-y-6">
        {/* Decision Submission Panel */}
        <Card className={cn(isCompleted && 'opacity-75')}>
          <CardHeader>
            <CardTitle>Submit Decision</CardTitle>
          </CardHeader>

          {isCompleted ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[var(--color-success-400)]" />
              <p className="text-sm font-semibold text-[var(--color-base-200)]">Decision Submitted</p>
              <p className="text-xs text-[var(--color-base-500)] leading-relaxed">
                This claim has been processed and is no longer editable.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitDecision} className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-[var(--color-danger-400)] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Selector */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-all duration-200',
                      decision === 'APPROVED'
                        ? 'border-[var(--color-success-500)] bg-[var(--color-success-bg)] text-[var(--color-success-400)]'
                        : 'border-[var(--color-base-700)] text-[var(--color-base-500)] bg-[var(--color-base-900)]'
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-all duration-200',
                      decision === 'REJECTED'
                        ? 'border-[var(--color-danger-500)] bg-[var(--color-danger-bg)] text-[var(--color-danger-400)]'
                        : 'border-[var(--color-base-700)] text-[var(--color-base-500)] bg-[var(--color-base-900)]'
                    )}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              {decision === 'APPROVED' && (
                <Input
                  label="Approved Payout (₹)"
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  max={claim.claimAmount}
                  min={0}
                  required
                  helperText={`Maximum limit: ${formatCurrency(claim.claimAmount)}`}
                />
              )}

              <div>
                <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">Remarks / Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Explain your decision and notes here..."
                  rows={4}
                  required
                  className={cn(
                    'w-full rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)]',
                    'text-[var(--color-base-100)] placeholder:text-[var(--color-base-600)] text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]'
                  )}
                />
              </div>

              <Button type="submit" isLoading={isPending} className="w-full mt-2">
                Submit Decision
              </Button>
            </form>
          )}
        </Card>

          {/* Policy limits */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-[var(--color-base-500)] uppercase tracking-wider mb-3">Policy Limits</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-base-500)]">Policy Name</span>
                <span className="font-semibold text-[var(--color-base-200)]">{policy?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-base-500)]">Policy Coverage</span>
                <span className="font-semibold text-[oklch(72%_0.20_230)]">{policy ? formatCurrency(policy.coverageAmount) : '—'}</span>
              </div>
            </div>
          </Card>
      </div>
    </div>
  );
}
