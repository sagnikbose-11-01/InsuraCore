'use client';
// ============================================================
// components/claims/ClaimCard.tsx
// Premium claim card — shown in the list view.
// Contains: policy, amounts, status badge, progress bar,
//           assessor preview, and View Details link.
// ============================================================

import Link from 'next/link';
import {
  Calendar, DollarSign, ShieldCheck, ArrowRight,
  CheckCircle2, Hash, User,
} from 'lucide-react';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ClaimProgressBar } from './ClaimProgressBar';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { SerializedClaim, SerializedPurchasedPolicy, SerializedPolicy, SerializedUser } from '@/types';
import { ClaimStatus } from '@/lib/constants/enums';

interface ClaimCardProps {
  claim: SerializedClaim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const purchasedPolicy = claim.purchasedPolicyId as SerializedPurchasedPolicy | null;
  const policy          = purchasedPolicy?.policyId as SerializedPolicy | null;
  const assessor        = claim.assignedAssessorId as SerializedUser | null;
  const isApproved      = [ClaimStatus.APPROVED, ClaimStatus.PAID].includes(claim.status);
  const isRejected      = claim.status === ClaimStatus.REJECTED;

  return (
    <div className="stat-card p-5 group hover:border-[var(--color-brand-700)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300">
      {/* ── Top row: Policy + Status ── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-[oklch(72%_0.20_230)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-base-500)] font-medium">
              {policy?.name ?? 'Policy'}
            </p>
            <p className="text-[10px] text-[var(--color-base-600)]">
              {policy?.type ?? ''} Insurance
            </p>
          </div>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      {/* ── Claim title ── */}
      <h3 className="text-base font-bold text-[var(--color-base-100)] mb-1 leading-snug group-hover:text-white transition-colors">
        {claim.title}
      </h3>

      {/* ── Ref + dates ── */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-base-500)] mb-4">
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {claim._id.slice(-8).toUpperCase()}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Filed {formatDate(claim.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Incident {formatDate(claim.incidentDate)}
        </span>
      </div>

      {/* ── Amounts row ── */}
      <div className="flex items-center gap-6 p-3 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)] mb-4">
        <div className="flex-1">
          <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-0.5">Claimed</p>
          <p className="text-sm font-bold text-[var(--color-base-200)] flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[var(--color-base-500)]" />
            {formatCurrency(claim.claimAmount)}
          </p>
        </div>
        {isApproved && claim.approvedAmount > 0 && (
          <>
            <div className="w-px h-8 bg-[var(--color-base-700)]" />
            <div className="flex-1">
              <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-0.5">Approved</p>
              <p className="text-sm font-bold text-[oklch(72%_0.17_150)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {formatCurrency(claim.approvedAmount)}
              </p>
            </div>
          </>
        )}
        {isRejected && (
          <>
            <div className="w-px h-8 bg-[var(--color-base-700)]" />
            <div className="flex-1">
              <p className="text-[10px] text-[oklch(65%_0.20_25)] uppercase tracking-wider mb-0.5">Rejected</p>
              <p className="text-sm font-semibold text-[oklch(65%_0.20_25)]">Not Payable</p>
            </div>
          </>
        )}
      </div>

      {/* ── Assessor preview ── */}
      {assessor && (
        <div className="flex items-center gap-2 mb-4 text-xs text-[var(--color-base-500)]">
          <User className="w-3.5 h-3.5" />
          <span>Assessor:</span>
          <span className="text-[var(--color-base-300)] font-medium">{assessor.name}</span>
        </div>
      )}

      {/* ── Progress stepper ── */}
      <ClaimProgressBar status={claim.status} />

      {/* ── View Details ── */}
      <div className="mt-4 pt-4 border-t border-[var(--color-base-800)] flex justify-end">
        <Link
          href={`/dashboard/claims/${claim._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors group/btn"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
