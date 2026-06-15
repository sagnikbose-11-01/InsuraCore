'use client';

// ============================================================
// components/admin/AdminApprovalsQueue.tsx
// Client component to show three queues: Unassigned, Under Review,
// and Document Verification. Provides administrative overrides.
// ============================================================

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { adminReassignClaimAction } from '@/app/actions/admin.actions';
import {
  FileText,
  User,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Inbox,
  UserPlus,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface Assessor {
  _id: string;
  name: string;
  specialization: string;
}

interface Claim {
  _id: string;
  title: string;
  claimAmount: number;
  status: string;
  policyType: string;
  riskScore: number;
  createdAt: string;
  customerId: Customer;
  assignedAssessorId?: Assessor;
}

interface Props {
  initialData: {
    underReview: Claim[];
    documentVerification: Claim[];
    unassigned: Claim[];
  };
  assessors: Assessor[];
}

export function AdminApprovalsQueue({ initialData, assessors }: Props) {
  const toast = useToast();
  const [queues, setQueues] = useState(initialData);
  const [activeTab, setActiveTab] = useState<'UNASSIGNED' | 'UNDER_REVIEW' | 'DOC_VERIFICATION'>('UNASSIGNED');
  const [selectedAssessorMap, setSelectedAssessorMap] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleAssign = async (claimId: string) => {
    const assessorId = selectedAssessorMap[claimId];
    if (!assessorId) {
      toast.error('Select an assessor first.');
      return;
    }

    startTransition(async () => {
      const res = await adminReassignClaimAction(claimId, assessorId);
      if (res.success) {
        toast.success(res.message || 'Assessor assigned successfully');
        
        // Remove from unassigned queue, optionally place in underReview
        const assignedClaim = queues.unassigned.find((c) => c._id === claimId);
        const assessorObj = assessors.find((a) => a._id === assessorId);
        
        if (assignedClaim && assessorObj) {
          const updatedClaim: Claim = {
            ...assignedClaim,
            status: 'UNDER_REVIEW',
            assignedAssessorId: assessorObj,
          };
          setQueues((prev) => ({
            ...prev,
            unassigned: prev.unassigned.filter((c) => c._id !== claimId),
            underReview: [updatedClaim, ...prev.underReview],
          }));
        }
      } else {
        toast.error(res.message || 'Assignment failed');
      }
    });
  };

  const currentList =
    activeTab === 'UNASSIGNED'
      ? queues.unassigned
      : activeTab === 'UNDER_REVIEW'
      ? queues.underReview
      : queues.documentVerification;

  return (
    <div className="space-y-6">
      {/* Queue Tabs */}
      <div className="flex gap-2 border-b border-[var(--color-base-800)] pb-px">
        <button
          onClick={() => setActiveTab('UNASSIGNED')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'UNASSIGNED'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-[var(--color-base-400)] hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Unassigned Queue
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-base-850)] text-indigo-400 font-bold border border-indigo-500/20">
            {queues.unassigned.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('UNDER_REVIEW')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'UNDER_REVIEW'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-[var(--color-base-400)] hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Under Review
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-base-850)] text-indigo-400 font-bold border border-indigo-500/20">
            {queues.underReview.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DOC_VERIFICATION')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'DOC_VERIFICATION'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-[var(--color-base-400)] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Verification
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-base-850)] text-indigo-400 font-bold border border-indigo-500/20">
            {queues.documentVerification.length}
          </span>
        </button>
      </div>

      {/* Queue Listing */}
      <Card>
        {currentList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white text-base">Queue is completely clear!</h3>
            <p className="text-xs text-[var(--color-base-500)] mt-1">Outstanding tasks have been successfully processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim Details</th>
                  <th>Customer Info</th>
                  <th>Claim Amount</th>
                  <th>Risk Level</th>
                  {activeTab !== 'UNASSIGNED' && <th>Assigned Reviewer</th>}
                  <th>Filed Date</th>
                  <th className="text-right">Action Override</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((claim) => {
                  const isHighRisk = claim.riskScore >= 70;
                  const refId = `INS-${claim._id.slice(-8).toUpperCase()}`;

                  return (
                    <tr key={claim._id} className="hover:bg-white/[0.01]">
                      {/* Title & Type */}
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                            {claim.title}
                          </p>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] text-[var(--color-base-500)] font-mono">{refId}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-base-700)]" />
                            <span className="text-[10px] text-indigo-400 font-bold uppercase">{claim.policyType}</span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="text-xs">
                          <p className="font-medium text-white">{claim.customerId.name}</p>
                          <p className="text-[10px] text-[var(--color-base-500)]">{claim.customerId.email}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="font-bold text-sm text-white">
                        {formatCurrency(claim.claimAmount)}
                      </td>

                      {/* Risk */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          {isHighRisk ? (
                            <div className="flex items-center gap-1 text-red-400 font-bold text-xs bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              High Risk ({claim.riskScore})
                            </div>
                          ) : (
                            <div className="text-xs font-semibold text-[var(--color-base-300)]">
                              Score: {claim.riskScore}/100
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned Assessor */}
                      {activeTab !== 'UNASSIGNED' && (
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-base-300)]">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                            <span>{claim.assignedAssessorId?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                      )}

                      {/* Date */}
                      <td className="text-xs text-[var(--color-base-500)]">
                        {formatDate(claim.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        {activeTab === 'UNASSIGNED' ? (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={selectedAssessorMap[claim._id] || ''}
                              onChange={(e) =>
                                setSelectedAssessorMap((prev) => ({
                                  ...prev,
                                  [claim._id]: e.target.value,
                                }))
                              }
                              className="text-xs rounded bg-[var(--color-base-850)] border border-[var(--color-base-700)] text-white px-2 py-1.5 focus:outline-none"
                            >
                              <option value="">Choose reviewer...</option>
                              {assessors
                                .filter((a) => a.specialization === claim.policyType)
                                .map((a) => (
                                  <option key={a._id} value={a._id}>
                                    {a.name} ({a.specialization})
                                  </option>
                                ))}
                            </select>
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleAssign(claim._id)}
                              leftIcon={<UserPlus className="w-3 h-3" />}
                            >
                              Assign
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/claims/${claim._id}`}>
                              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3 h-3" />}>
                                Review
                              </Button>
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
