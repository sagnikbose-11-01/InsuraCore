'use client';

// ============================================================
// components/admin/AdminClaimsTable.tsx
// Premium enterprise-grade claims table for Admin Console.
// Renders rich filters (status, type, search), risk indicators,
// and quick actions for assessor reassignment & payment release.
// ============================================================

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { adminReassignClaimAction } from '@/app/actions/admin.actions';
import { releasePaymentAction } from '@/app/actions/claim.actions';
import { ClaimStatus } from '@/lib/constants/enums';
import {
  Search,
  User,
  Shield,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate, getClaimStatusVariant, CLAIM_STATUS_LABEL } from '@/lib/utils/formatters';

interface ClaimData {
  _id: string;
  title: string;
  claimAmount: number;
  approvedAmount: number;
  status: string;
  policyType: string;
  riskScore?: number;
  fraudFlags?: string[];
  createdAt: string;
  customerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedAssessorId?: {
    _id: string;
    name: string;
    email: string;
    specialization: string;
  };
}

interface Props {
  initialClaims: ClaimData[];
  assessors: Array<{ _id: string; name: string; specialization: string }>;
}

export function AdminClaimsTable({ initialClaims, assessors }: Props) {
  const toast = useToast();
  const [claims, setClaims] = useState<ClaimData[]>(initialClaims);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [reassigningClaimId, setReassigningClaimId] = useState<string | null>(null);
  const [selectedAssessorId, setSelectedAssessorId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const handleReassign = async (claimId: string) => {
    if (!selectedAssessorId) {
      toast.error('Please select an assessor');
      return;
    }

    startTransition(async () => {
      const res = await adminReassignClaimAction(claimId, selectedAssessorId);
      if (res.success) {
        toast.success(res.message || 'Claim reassigned successfully');
        const assessorObj = assessors.find((a) => a._id === selectedAssessorId);
        setClaims((prev) =>
          prev.map((c) => {
            if (c._id === claimId) {
              return {
                ...c,
                status: 'UNDER_REVIEW',
                assignedAssessorId: assessorObj
                  ? {
                      _id: assessorObj._id,
                      name: assessorObj.name,
                      email: '',
                      specialization: assessorObj.specialization,
                    }
                  : undefined,
              };
            }
            return c;
          })
        );
        setReassigningClaimId(null);
        setSelectedAssessorId('');
      } else {
        toast.error(res.message || 'Failed to reassign claim');
      }
    });
  };

  const handleReleasePayment = async (claimId: string) => {
    startTransition(async () => {
      const res = await releasePaymentAction(claimId);
      if (res.success) {
        toast.success(res.message || 'Payment released successfully');
        setClaims((prev) =>
          prev.map((c) => {
            if (c._id === claimId) {
              return { ...c, status: 'PAID' };
            }
            return c;
          })
        );
      } else {
        toast.error(res.message || 'Failed to release payment');
      }
    });
  };

  // Filters
  const filtered = claims.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.policyType === typeFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c._id.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId?.email.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 flex-wrap gap-3 w-full md:w-auto">
          <Input
            placeholder="Search claim, ID, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
            leftAdornment={<Search className="w-4 h-4" />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="DOCUMENT_VERIFICATION">DOCUMENT VERIFICATION</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PAID">PAID</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Specializations</option>
            <option value="HEALTH">HEALTH</option>
            <option value="AUTO">AUTO</option>
            <option value="PROPERTY">PROPERTY</option>
            <option value="LIFE">LIFE</option>
            <option value="TRAVEL">TRAVEL</option>
          </select>
        </div>
      </div>

      {/* Claims list */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID & Title</th>
                <th>Customer</th>
                <th>Claim Amount</th>
                <th>Assessor Assigned</th>
                <th>Risk Metrics</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[var(--color-base-500)]">
                    No claims found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => {
                  const riskScore = claim.riskScore ?? 0;
                  const hasFraud = claim.fraudFlags && claim.fraudFlags.length > 0;
                  const refId = `INS-${claim._id.slice(-8).toUpperCase()}`;

                  return (
                    <tr key={claim._id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Claim Title */}
                      <td>
                        <div className="space-y-1">
                          <Link
                            href={`/admin/claims/${claim._id}`}
                            className="text-sm font-semibold text-white hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                          >
                            {claim.title} <ExternalLink className="w-3 h-3 text-[var(--color-base-500)]" />
                          </Link>
                          <span className="text-[10px] bg-[var(--color-base-800)] px-1.5 py-0.5 rounded text-[var(--color-base-400)] font-mono">
                            {refId}
                          </span>
                        </div>
                      </td>

                      {/* Customer info */}
                      <td>
                        {claim.customerId ? (
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-base-200)]">
                              {claim.customerId.name}
                            </p>
                            <p className="text-[10px] text-[var(--color-base-500)]">
                              {claim.customerId.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-base-600)]">—</span>
                        )}
                      </td>

                      {/* Claim Amount */}
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-white">
                            {formatCurrency(claim.claimAmount)}
                          </p>
                          {claim.approvedAmount > 0 && (
                            <p className="text-[10px] text-emerald-400 font-semibold">
                              Approved: {formatCurrency(claim.approvedAmount)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Assessor assigned */}
                      <td>
                        {reassigningClaimId === claim._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedAssessorId}
                              onChange={(e) => setSelectedAssessorId(e.target.value)}
                              className="text-xs rounded bg-[var(--color-base-850)] border border-[var(--color-base-700)] text-white p-1 focus:outline-none"
                            >
                              <option value="">Select...</option>
                              {assessors.map((a) => (
                                <option key={a._id} value={a._id}>
                                  {a.name} ({a.specialization})
                                </option>
                              ))}
                            </select>
                            <Button size="sm" onClick={() => handleReassign(claim._id)} disabled={isPending}>
                              Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setReassigningClaimId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[var(--color-base-500)]" />
                              <span className="text-xs text-[var(--color-base-300)]">
                                {claim.assignedAssessorId?.name || 'Unassigned'}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setReassigningClaimId(claim._id);
                                setSelectedAssessorId(claim.assignedAssessorId?._id || '');
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                            >
                              Reassign
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Risk Indicators */}
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[var(--color-base-500)] uppercase font-semibold">Risk Score</span>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-black ${
                                riskScore >= 70 ? 'text-red-400' : riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {riskScore}/100
                              </span>
                            </div>
                          </div>

                          {hasFraud && (
                            <div className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400" title={`${claim.fraudFlags?.length} fraud indicators triggered`}>
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge variant={getClaimStatusVariant(claim.status as ClaimStatus) as any}>
                          {CLAIM_STATUS_LABEL[claim.status as ClaimStatus] || claim.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {claim.status === 'APPROVED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReleasePayment(claim._id)}
                              disabled={isPending}
                              leftIcon={<DollarSign className="w-3 h-3" />}
                            >
                              Pay
                            </Button>
                          )}
                          <Link href={`/admin/claims/${claim._id}`}>
                            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3 h-3" />}>
                              Details
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
