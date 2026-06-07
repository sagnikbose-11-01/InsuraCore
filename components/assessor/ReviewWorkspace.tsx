'use client';

// ============================================================
// components/assessor/ReviewWorkspace.tsx
// ServiceNow/Salesforce style claims console for deep investigation.
// ============================================================

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  verifyDocumentAction, 
  submitAssessmentAction, 
  requestClaimDocumentsAction, 
  addClaimNoteAction 
} from '@/app/actions/claim.actions';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate, getClaimStatusVariant } from '@/lib/utils/formatters';
import { 
  SerializedClaim, SerializedClaimDocument, SerializedUser, 
  SerializedPolicy, SerializedPurchasedPolicy, SerializedClaimAssessment 
} from '@/types';
import { 
  User, Shield, Clipboard, FileText, CheckCircle, XCircle, 
  Clock, AlertTriangle, AlertCircle, Plus, Send, Lock, Eye, 
  Check, FileQuestion, ChevronRight, HelpCircle, Activity, X, ShieldAlert 
} from 'lucide-react';

interface Props {
  claim: SerializedClaim;
  documents: SerializedClaimDocument[];
  previousClaims: SerializedClaim[];
  assessments: SerializedClaimAssessment[];
}

export function ReviewWorkspace({ claim, documents: initialDocs, previousClaims, assessments = [] }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'notes' | 'history'>('overview');
  
  // Document state
  const [docs, setDocs] = useState<SerializedClaimDocument[]>(initialDocs);
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);

  // Decision state
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT' | 'REQUEST' | null>(null);
  
  // Decision Form state
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(String(claim.claimAmount));
  const [requestedDocsList, setRequestedDocsList] = useState('Medical Certification, Discharge Summary');

  // Simple note timeline state
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteIsInternal, setNewNoteIsInternal] = useState(true);

  const customer = claim.customerId as SerializedUser;
  const purchasedPolicy = claim.purchasedPolicyId as SerializedPurchasedPolicy;
  const policy = purchasedPolicy?.policyId as SerializedPolicy;
  
  const isResolved = ['APPROVED', 'REJECTED', 'PAID'].includes(claim.status);

  // Document Verification
  async function handleVerifyDoc(docId: string, status: 'VERIFIED' | 'REJECTED') {
    setDocLoadingId(docId);
    try {
      const res = await verifyDocumentAction(docId, status);
      if (res.success) {
        setDocs(prev => prev.map(d => d._id === docId ? { ...d, verificationStatus: status } : d));
        toast.success(`Document marked as ${status.toLowerCase()}!`);
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to update document.');
      }
    } catch (err) {
      toast.error('Error verifying document.');
    } finally {
      setDocLoadingId(null);
    }
  }

  // Decision Submission
  async function handleDecisionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isResolved) return;

    startTransition(async () => {
      let res;
      if (decisionMode === 'REQUEST') {
        const list = requestedDocsList.split(',').map(d => d.trim()).filter(Boolean);
        res = await requestClaimDocumentsAction(claim._id, list, customerRemarks);
      } else {
        const formData = new FormData();
        formData.append('claimId', claim._id);
        formData.append('remarks', customerRemarks);
        formData.append('internalRemarks', internalRemarks);
        formData.append('decision', decisionMode === 'APPROVE' ? 'APPROVED' : 'REJECTED');
        formData.append('approvedAmount', decisionMode === 'APPROVE' ? approvedAmount : '0');
        res = await submitAssessmentAction(formData);
      }

      if (res.success) {
        toast.success('Claim decision submitted successfully.');
        setDecisionMode(null);
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to submit decision.');
      }
    });
  }

  // Add Standalone Note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    startTransition(async () => {
      const res = await addClaimNoteAction(claim._id, newNoteText, newNoteIsInternal);
      if (res.success) {
        toast.success('Note added successfully.');
        setNewNoteText('');
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to add note.');
      }
    });
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden shadow-2xl">
      {/* Workspace Header */}
      <div className="p-6 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-900)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--color-base-500)]">INS-{claim._id.slice(-8).toUpperCase()}</span>
            <span className={cn(
              "px-2 py-0.5 text-[9px] font-bold rounded-md border",
              getPriorityColor(claim.priority || 'MEDIUM')
            )}>{claim.priority || 'MEDIUM'} PRIORITY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 leading-tight">{claim.title}</h2>
          <p className="text-xs text-[var(--color-base-450)] mt-0.5">Assigned to: {claim.assignedAssessorId ? 'You' : 'Unassigned'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getClaimStatusVariant(claim.status) as any}>
            {claim.status.replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" /> AI Risk: {claim.riskScore || 0}%
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-900)]/20 px-4">
        {[
          { id: 'overview', label: 'Overview', icon: Clipboard },
          { id: 'documents', label: `Documents Checklist (${docs.length})`, icon: FileText },
          { id: 'notes', label: `Audit Notes Timeline (${(claim.notes || []).length})`, icon: Lock },
          { id: 'history', label: `Previous Claims (${previousClaims.length})`, icon: Clock },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 text-xs font-bold tracking-wide transition-all border-b-2",
                isActive 
                  ? "border-purple-500 text-white bg-purple-500/5" 
                  : "border-transparent text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-900)]/30"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Profile Widget */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                <User className="w-4 h-4 text-purple-400" /> Customer Profile
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-base">
                  {customer?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{customer?.name || 'Unknown Holder'}</h4>
                  <p className="text-xs text-[var(--color-base-450)]">{customer?.email}</p>
                  <p className="text-[10px] text-[var(--color-base-500)] mt-0.5">Phone: {customer?.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--color-base-900)]/40 p-3 rounded-xl border border-[rgba(255,255,255,0.04)]">
                <div>
                  <span className="text-[var(--color-base-500)] block">Joined Date</span>
                  <span className="font-semibold text-white mt-0.5 block">{customer?.createdAt ? formatDate(customer.createdAt) : '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-base-500)] block">Date of Birth</span>
                  <span className="font-semibold text-white mt-0.5 block">{customer?.dob ? formatDate(customer.dob) : '—'}</span>
                </div>
              </div>
            </div>

            {/* Policy Limits Widget */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                <Shield className="w-4 h-4 text-purple-400" /> Policy Details
              </h3>
              <div>
                <h4 className="text-sm font-bold text-white">{policy?.name || '—'}</h4>
                <p className="text-[10px] text-purple-400 font-mono mt-0.5">
                  No: POL-{purchasedPolicy?._id?.toUpperCase() || '—'} • Category: {policy?.type || claim.policyType || '—'}
                </p>
                <p className="text-xs text-[var(--color-base-450)] mt-1.5">{policy?.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold tracking-wider">
                <div className="p-2.5 rounded-lg bg-[var(--color-base-900)]/60 text-center border border-[rgba(255,255,255,0.05)]">
                  <span className="text-[var(--color-base-550)] block mb-0.5">Coverage</span>
                  <span className="text-purple-400 text-xs font-black">{policy ? formatCurrency(policy.coverageAmount) : '—'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--color-base-900)]/60 text-center border border-[rgba(255,255,255,0.05)]">
                  <span className="text-[var(--color-base-550)] block mb-0.5">Premium</span>
                  <span className="text-white text-xs font-black">{policy ? formatCurrency(policy.premiumAmount) : '—'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--color-base-900)]/60 text-center border border-[rgba(255,255,255,0.05)]">
                  <span className="text-[var(--color-base-550)] block mb-0.5">Validity</span>
                  <span className="text-white text-xs font-black">{policy?.validityPeriod} M</span>
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div className="glass-card p-5 space-y-4 lg:col-span-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                <Clipboard className="w-4 h-4 text-purple-400" /> Incident Description
              </h3>
              <p className="text-sm text-[var(--color-base-300)] leading-relaxed bg-[var(--color-base-900)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] italic">
                "{claim.description}"
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[var(--color-base-500)]">Incident Date</span>
                  <p className="font-semibold text-white mt-0.5">{formatDate(claim.incidentDate)}</p>
                </div>
                <div>
                  <span className="text-[var(--color-base-500)]">Filed Date</span>
                  <p className="font-semibold text-white mt-0.5">{formatDate(claim.createdAt)}</p>
                </div>
                <div>
                  <span className="text-[var(--color-base-500)]">Claim Amount</span>
                  <p className="font-bold text-purple-300 text-sm mt-0.5">{formatCurrency(claim.claimAmount)}</p>
                </div>
                <div>
                  <span className="text-[var(--color-base-500)]">Approved Payout</span>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">
                    {claim.approvedAmount > 0 ? formatCurrency(claim.approvedAmount) : 'Pending Settlement'}
                  </p>
                </div>
              </div>

              {/* AI Risk Score Analysis */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4" /> AI Fraud & Risk Analysis
                  </div>
                  <span className="text-xs font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{claim.riskScore}% RISK</span>
                </div>
                <div className="w-full bg-[var(--color-base-900)] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${claim.riskScore || 0}%` }} />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(claim.fraudFlags || []).length === 0 ? (
                    <span className="text-[10px] text-[var(--color-base-500)]">No automated flags tripped.</span>
                  ) : (
                    (claim.fraudFlags || []).map((flag, idx) => (
                      <span key={idx} className="text-[9px] font-bold bg-red-950/40 text-red-400 border border-red-900/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        ⚠️ {flag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Assessment Progress Timeline */}
              <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-base-400)] block">Workflow Progression</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-emerald-500 rounded-full" />
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <div className={cn("flex-1 h-1 rounded-full", ['UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "bg-emerald-500" : "bg-[var(--color-base-800)]")} />
                  <ChevronRight className={cn("w-3 h-3", ['UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "text-emerald-400" : "text-[var(--color-base-700)]")} />
                  <div className={cn("flex-1 h-1 rounded-full", ['DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "bg-emerald-500" : "bg-[var(--color-base-800)]")} />
                  <ChevronRight className={cn("w-3 h-3", ['DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "text-emerald-400" : "text-[var(--color-base-700)]")} />
                  <div className={cn("flex-1 h-1 rounded-full", ['APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "bg-emerald-500" : "bg-[var(--color-base-800)]")} />
                </div>
                <div className="grid grid-cols-4 gap-1 text-[9px] uppercase font-bold text-center text-[var(--color-base-500)] tracking-wider">
                  <span className="text-emerald-400">1. Filed</span>
                  <span className={['UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "text-emerald-400" : ""}>2. Assigned</span>
                  <span className={['DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "text-emerald-400" : ""}>3. Verification</span>
                  <span className={['APPROVED', 'REJECTED', 'PAID'].includes(claim.status) ? "text-emerald-400" : ""}>4. Decision</span>
                </div>
              </div>

              {/* Assessment History Timeline */}
              <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Auditor Assessment History
                </span>
                {assessments.length === 0 ? (
                  <p className="text-xs text-[var(--color-base-500)] italic">No assessment cycles recorded yet.</p>
                ) : (
                  <div className="space-y-3 mt-2">
                    {assessments.map((asm) => (
                      <div key={asm._id} className="p-3.5 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)] text-xs flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {typeof asm.assessorId === 'object' ? asm.assessorId.name : 'Auditor'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--color-base-600)]" />
                            <span className="text-[10px] text-[var(--color-base-500)]">{formatDate(asm.createdAt)}</span>
                          </div>
                          <p className="text-xs text-[var(--color-base-350)] italic">"{asm.remarks}"</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 block">
                            {asm.approvedAmount > 0 ? formatCurrency(asm.approvedAmount) : 'No Payout'}
                          </span>
                          {asm.reviewStartedAt && (
                            <span className="text-[9px] text-[var(--color-base-500)] block mt-0.5">
                              Duration: {Math.max(1, Math.round((new Date(asm.reviewCompletedAt || Date.now()).getTime() - new Date(asm.reviewStartedAt).getTime()) / (1000 * 60)))} min(s)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Checklist */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <h3 className="text-sm font-bold text-white">Supporting Evidence Check</h3>
                <p className="text-xs text-[var(--color-base-450)] mt-0.5">Verify uploaded invoices, reports and deeds.</p>
              </div>
              <span className="text-xs font-bold text-purple-400">{docs.length} Uploaded Files</span>
            </div>

            {docs.length === 0 ? (
              <div className="py-12 text-center bg-[var(--color-base-900)]/20 border border-dashed border-[rgba(255,255,255,0.06)] rounded-xl">
                <FileText className="w-10 h-10 text-[var(--color-base-600)] mx-auto mb-2" />
                <p className="text-xs text-[var(--color-base-500)]">No documents uploaded by policy holder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {docs.map((doc) => {
                  const isDocLoading = docLoadingId === doc._id;
                  return (
                    <div key={doc._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[var(--color-base-900)]/55 border border-[rgba(255,255,255,0.05)] gap-4 transition-all hover:bg-[var(--color-base-900)]/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <a 
                            href={doc.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1.5"
                          >
                            {doc.documentName}
                          </a>
                          <span className="text-[10px] text-[var(--color-base-500)] block mt-0.5">Uploaded on {formatDate(doc.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={doc.verificationStatus === 'VERIFIED' ? 'success' : doc.verificationStatus === 'REJECTED' ? 'danger' : 'info'}>
                          {doc.verificationStatus}
                        </Badge>
                        
                        {!isResolved && (
                          <div className="flex items-center gap-1.5 border-l border-[rgba(255,255,255,0.08)] pl-3">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleVerifyDoc(doc._id, 'VERIFIED')}
                              disabled={isDocLoading || doc.verificationStatus === 'VERIFIED'}
                              leftIcon={isDocLoading && docLoadingId === doc._id ? <Clock className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              className="h-8 text-xs font-semibold px-3"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerifyDoc(doc._id, 'REJECTED')}
                              disabled={isDocLoading || doc.verificationStatus === 'REJECTED'}
                              className="h-8 text-xs font-semibold px-3 text-red-400 hover:bg-red-500/10"
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
          </div>
        )}

        {/* Audit Notes Timeline */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="border-b border-[rgba(255,255,255,0.06)] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" /> Assessor Notes System
              </h3>
              <p className="text-xs text-[var(--color-base-450)] mt-0.5">Internal notes remain assessor-only. Customer-facing notes alert the policy holder.</p>
            </div>

            {/* Note Timeline List */}
            <div className="space-y-4">
              {(claim.notes || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--color-base-500)] italic">
                  No audit notes logged on this claim yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {(claim.notes || []).map((note, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-xl border relative transition-all",
                        note.isInternal 
                          ? "bg-amber-500/5 border-amber-500/15" 
                          : "bg-blue-500/5 border-blue-500/15"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{note.authorName}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--color-base-700)]" />
                          <span className="text-[10px] text-[var(--color-base-500)]">{formatDate(note.createdAt)}</span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded-md border flex items-center gap-1",
                          note.isInternal 
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                            : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        )}>
                          {note.isInternal ? <Lock className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                          {note.isInternal ? 'Internal' : 'Customer-Facing'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-base-300)] leading-relaxed italic whitespace-pre-line">
                        "{note.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Note Submission Form */}
            {!isResolved && (
              <form onSubmit={handleAddNote} className="bg-[var(--color-base-900)]/40 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] space-y-3.5">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Type notes, analysis findings, or updates here..."
                  rows={2}
                  className="w-full rounded-lg bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] p-3 text-xs text-[var(--color-base-200)] placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[rgba(255,255,255,0.04)]">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-base-300)]">
                      <input 
                        type="radio" 
                        name="noteType" 
                        checked={newNoteIsInternal}
                        onChange={() => setNewNoteIsInternal(true)}
                        className="rounded border-[rgba(255,255,255,0.08)] bg-[var(--color-base-950)] text-purple-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-amber-400" /> Internal Notes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-base-300)]">
                      <input 
                        type="radio" 
                        name="noteType" 
                        checked={!newNoteIsInternal}
                        onChange={() => setNewNoteIsInternal(false)}
                        className="rounded border-[rgba(255,255,255,0.08)] bg-[var(--color-base-950)] text-purple-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-400" /> Customer-Facing</span>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={isPending || !newNoteText.trim()}
                    leftIcon={<Send className="w-3 h-3" />}
                    className="bg-purple-600 text-white font-bold h-8 text-xs"
                  >
                    Add Timeline Note
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Claim History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="border-b border-[rgba(255,255,255,0.06)] pb-3">
              <h3 className="text-sm font-bold text-white">Previous Customer Claims</h3>
              <p className="text-xs text-[var(--color-base-450)] mt-0.5">History of claims filed by {customer?.name} under this and other policies.</p>
            </div>

            {previousClaims.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-base-500)] italic">
                No previous claims registered for this customer.
              </div>
            ) : (
              <div className="space-y-3">
                {previousClaims.map(c => (
                  <div key={c._id} className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)] text-xs gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">INS-{c._id.slice(-8).toUpperCase()}</span>
                        <span className="text-[10px] uppercase font-bold text-[var(--color-base-400)]">{(c.purchasedPolicyId as any)?.policyId?.name || 'Policy'}</span>
                      </div>
                      <span className="text-[10px] text-[var(--color-base-550)] block mt-0.5">Filed {formatDate(c.createdAt)} • Title: {c.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white block">{formatCurrency(c.claimAmount)}</span>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <Badge variant={getClaimStatusVariant(c.status) as any}>
                          {c.status}
                        </Badge>
                        {c.approvedAmount > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Approved: {formatCurrency(c.approvedAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decision Submission Panel */}
      {!isResolved && (
        <div className="p-6 border-t border-[rgba(255,255,255,0.06)] bg-[var(--color-base-900)]/50">
          {!decisionMode ? (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-base-400)] block">Submit Claim Decision</span>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setDecisionMode('APPROVE')}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.01] transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Claim
                </button>
                <button 
                  onClick={() => setDecisionMode('REQUEST')}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] hover:bg-[var(--color-base-800)] text-white text-xs font-bold transition-all"
                >
                  <FileQuestion className="w-4 h-4 text-purple-400" /> Request Docs
                </button>
                <button 
                  onClick={() => setDecisionMode('REJECT')}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-650/15 border border-red-500/20 hover:bg-red-650 hover:text-white text-red-400 text-xs font-black transition-all"
                >
                  <XCircle className="w-4 h-4" /> Reject Claim
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  {decisionMode === 'APPROVE' && 'Confirming Claim Approval'}
                  {decisionMode === 'REJECT' && 'Confirming Claim Rejection'}
                  {decisionMode === 'REQUEST' && 'Confirming Document Verification Request'}
                </span>
                <button 
                  type="button" 
                  onClick={() => setDecisionMode(null)}
                  className="text-xs font-bold text-[var(--color-base-450)] hover:text-white flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {decisionMode === 'APPROVE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Approved Amount (₹)"
                    type="number"
                    required
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    max={claim.claimAmount}
                    min={0}
                    helperText={`Maximum cover amount limit: ${formatCurrency(claim.claimAmount)}`}
                  />
                  <div className="text-xs text-[var(--color-base-450)] flex items-center">
                    Approved payout will trigger a Payment Settlement schedule.
                  </div>
                </div>
              )}

              {decisionMode === 'REQUEST' && (
                <Input
                  label="Documents Required (Comma Separated)"
                  type="text"
                  required
                  value={requestedDocsList}
                  onChange={(e) => setRequestedDocsList(e.target.value)}
                  helperText="List specific missing bills, FIR, or diagnostic records"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-base-400)] mb-1">
                    Customer-Facing Remarks (Notification Message)
                  </label>
                  <textarea
                    value={customerRemarks}
                    onChange={(e) => setCustomerRemarks(e.target.value)}
                    required
                    placeholder="This text appears inside the customer notification alert..."
                    rows={2.5}
                    className="w-full rounded-xl bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] p-3 text-xs text-[var(--color-base-200)] placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-base-400)] mb-1">
                    Internal Notes (Auditor Timeline History)
                  </label>
                  <textarea
                    value={internalRemarks}
                    onChange={(e) => setInternalRemarks(e.target.value)}
                    placeholder="Audit findings, risk analysis results, verification notes (assessor-only)..."
                    rows={2.5}
                    disabled={decisionMode === 'REQUEST'}
                    className="w-full rounded-xl bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] p-3 text-xs text-[var(--color-base-200)] placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 resize-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setDecisionMode(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isPending}
                  className={cn(
                    "flex-1 text-white font-bold",
                    decisionMode === 'APPROVE' ? "bg-emerald-600 hover:bg-emerald-700" :
                    decisionMode === 'REJECT' ? "bg-red-600 hover:bg-red-700" :
                    "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  Confirm and Complete
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {isResolved && (
        <div className="p-6 border-t border-[rgba(255,255,255,0.06)] bg-emerald-500/5 text-center flex flex-col items-center justify-center gap-1">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <span className="text-xs font-bold text-white">Assessment Decision Completed</span>
          <p className="text-[10px] text-[var(--color-base-500)]">
            This claim has been processed and is locked for edit. Settlement payout has been queued.
          </p>
        </div>
      )}
    </div>
  );
}
