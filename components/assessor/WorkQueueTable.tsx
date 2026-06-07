'use client';

// ============================================================
// components/assessor/WorkQueueTable.tsx
// Operational task manager for the Assessor Workspace.
// ============================================================

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  startClaimReviewAction, 
  requestClaimDocumentsAction, 
  submitAssessmentAction 
} from '@/app/actions/claim.actions';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate, getClaimStatusVariant } from '@/lib/utils/formatters';
import { SerializedClaim, SerializedUser, SerializedPolicy, SerializedPurchasedPolicy } from '@/types';
import { 
  Play, RotateCcw, HelpCircle, CheckCircle, XCircle, Search, Filter, 
  AlertTriangle, Clock, Calendar, ShieldAlert, Sparkles, X, FileQuestion 
} from 'lucide-react';

interface Props {
  claims: SerializedClaim[];
  assessorId: string;
}

export function WorkQueueTable({ claims, assessorId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [activeModal, setActiveModal] = useState<'APPROVE' | 'REJECT' | 'REQUEST' | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<SerializedClaim | null>(null);

  // Form states
  const [remarks, setRemarks] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [docList, setDocList] = useState<string>('');

  // Priority badge styling helper
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Days open calculation helper
  const getDaysOpen = (dateStr: string) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day open' : `${diffDays} days open`;
  };

  // Start Review Action
  const handleStartReview = async (claimId: string) => {
    startTransition(async () => {
      const res = await startClaimReviewAction(claimId);
      if (res.success) {
        toast.success('Assigned and moved to Under Review');
        router.push(`/assessor/review/${claimId}`);
      } else {
        toast.error(res.message || 'Failed to start review');
      }
    });
  };

  // Submit Modal Action
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    startTransition(async () => {
      let res;
      if (activeModal === 'REQUEST') {
        const docs = docList.split(',').map(d => d.trim()).filter(Boolean);
        res = await requestClaimDocumentsAction(selectedClaim._id, docs, remarks);
      } else {
        const formData = new FormData();
        formData.append('claimId', selectedClaim._id);
        formData.append('remarks', remarks);
        formData.append('internalRemarks', internalRemarks);
        formData.append('decision', activeModal === 'APPROVE' ? 'APPROVED' : 'REJECTED');
        formData.append('approvedAmount', activeModal === 'APPROVE' ? approvedAmount : '0');
        res = await submitAssessmentAction(formData);
      }

      if (res.success) {
        toast.success(`Action successfully executed.`);
        closeModal();
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to process request');
      }
    });
  };

  const openModal = (type: 'APPROVE' | 'REJECT' | 'REQUEST', claim: SerializedClaim) => {
    setSelectedClaim(claim);
    setActiveModal(type);
    setRemarks('');
    setInternalRemarks('');
    setApprovedAmount(String(claim.claimAmount));
    setDocList('Medical Bills, Repair Estimates');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedClaim(null);
  };

  // Filter logic
  const filteredClaims = claims.filter(c => {
    const cust = c.customerId as SerializedUser;
    const policyType = c.policyType || 'UNKNOWN';
    const matchesSearch = 
      c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
          <input
            type="text"
            placeholder="Search by Claim ID, policy holder, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl py-2 pl-9 pr-4 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-500)] focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl py-2 pl-3 pr-8 text-sm text-[var(--color-base-300)] appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 transition-all"
            >
              <option value="all">All Queues</option>
              <option value="PENDING">Pending Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DOCUMENT_VERIFICATION">Doc Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Customer</th>
                <th>Policy Type</th>
                <th>Claim Amount</th>
                <th>Status</th>
                <th>Days Open</th>
                <th>Priority</th>
                <th>Assigned Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[var(--color-base-500)]">
                    No actionable claims found in your work queue.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const customer = claim.customerId as SerializedUser;
                  const isAssignedToMe = claim.assignedAssessorId === assessorId;
                  const isUnassigned = !claim.assignedAssessorId;

                  return (
                    <tr key={claim._id} className="group hover:bg-[var(--color-base-900)]/30">
                      <td className="font-mono text-xs font-semibold text-white">
                        INS-{claim._id.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <div className="font-medium text-white">{customer?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-[var(--color-base-500)]">{customer?.email}</div>
                      </td>
                      <td>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-base-300)] bg-[var(--color-base-800)] px-2 py-0.5 rounded border border-[var(--color-base-700)]">
                          {claim.policyType || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="font-mono text-xs font-semibold text-white">
                        {formatCurrency(claim.claimAmount)}
                      </td>
                      <td>
                        <Badge variant={getClaimStatusVariant(claim.status) as any}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="text-xs text-[var(--color-base-300)]">
                        {getDaysOpen(claim.createdAt)}
                      </td>
                      <td>
                        <span className={cn(
                          "px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md border",
                          getPriorityColor(claim.priority || 'MEDIUM')
                        )}>
                          {claim.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="text-xs text-[var(--color-base-400)]">
                        {formatDate(claim.createdAt)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isUnassigned ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartReview(claim._id)}
                              disabled={isPending}
                              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                              Start Review
                            </Button>
                          ) : isAssignedToMe ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/assessor/review/${claim._id}`)}
                                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                              >
                                Continue
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openModal('REQUEST', claim)}
                                className="text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                              >
                                Request Docs
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openModal('APPROVE', claim)}
                                className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openModal('REJECT', claim)}
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-[var(--color-base-500)] italic">
                              Assigned to another
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision/Request Modals */}
      {activeModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-base-950)]/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] shadow-2xl p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              {activeModal === 'APPROVE' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {activeModal === 'REJECT' && <XCircle className="w-5 h-5 text-red-400" />}
              {activeModal === 'REQUEST' && <FileQuestion className="w-5 h-5 text-yellow-400" />}
              {activeModal === 'APPROVE' && 'Approve Claim'}
              {activeModal === 'REJECT' && 'Reject Claim'}
              {activeModal === 'REQUEST' && 'Request Supporting Documents'}
            </h3>
            
            <p className="text-xs text-[var(--color-base-450)] mb-4">
              INS-{selectedClaim._id.slice(-8).toUpperCase()} • Claimed Amount: {formatCurrency(selectedClaim.claimAmount)}
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {activeModal === 'APPROVE' && (
                <Input
                  label="Approved Payout Amount (₹)"
                  type="number"
                  required
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  max={selectedClaim.claimAmount}
                  min={0}
                  helperText={`Policy limit maximum: ${formatCurrency(selectedClaim.claimAmount)}`}
                />
              )}

              {activeModal === 'REQUEST' && (
                <Input
                  label="Requested Documents (comma separated list)"
                  type="text"
                  required
                  value={docList}
                  onChange={(e) => setDocList(e.target.value)}
                  helperText="Example: Repair Estimate Report, Medical Certification, FIR Copy"
                />
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-base-400)] mb-1">
                  Customer-Facing remarks / remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                  placeholder={
                    activeModal === 'REQUEST' 
                      ? "Explain to the customer why these documents are required..." 
                      : "Rationalize your decision. These notes will be sent to the customer..."
                  }
                  rows={3}
                  className="w-full rounded-xl bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] p-3 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                />
              </div>

              {activeModal !== 'REQUEST' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-base-400)] mb-1">
                    Internal Notes (Assessor-Only timeline)
                  </label>
                  <textarea
                    value={internalRemarks}
                    onChange={(e) => setInternalRemarks(e.target.value)}
                    placeholder="Rationale for audit, risk score review details, and flags checked (not visible to customer)..."
                    rows={2}
                    className="w-full rounded-xl bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] p-3 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 resize-none transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={closeModal} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={isPending}
                  className={cn(
                    "flex-1 text-white font-bold",
                    activeModal === 'APPROVE' ? "bg-emerald-600 hover:bg-emerald-700" :
                    activeModal === 'REJECT' ? "bg-red-600 hover:bg-red-700" :
                    "bg-yellow-600 hover:bg-yellow-750"
                  )}
                >
                  Confirm Action
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
