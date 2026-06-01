// ============================================================
// lib/utils/formatters.ts
// Utilities for formatting currency, dates, and status labels.
// ============================================================

import { format } from 'date-fns';
import { ClaimStatus, PaymentStatus, DocumentStatus, PolicyStatus } from '@/lib/constants/enums';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
}

// Map enum values to human-readable display labels
export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  [ClaimStatus.PENDING]: 'Pending',
  [ClaimStatus.SUBMITTED]: 'Submitted',
  [ClaimStatus.UNDER_REVIEW]: 'Under Review',
  [ClaimStatus.DOCUMENT_VERIFICATION]: 'Document Verification',
  [ClaimStatus.APPROVED]: 'Approved',
  [ClaimStatus.REJECTED]: 'Rejected',
  [ClaimStatus.PAID]: 'Paid',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.SUCCESS]: 'Paid',
  [PaymentStatus.FAILED]: 'Failed',
};

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  [DocumentStatus.UPLOADED]: 'Uploaded',
  [DocumentStatus.VERIFIED]: 'Verified',
  [DocumentStatus.REJECTED]: 'Rejected',
};

export const POLICY_STATUS_LABEL: Record<PolicyStatus, string> = {
  [PolicyStatus.ACTIVE]: 'Active',
  [PolicyStatus.EXPIRED]: 'Expired',
  [PolicyStatus.CANCELLED]: 'Cancelled',
};

// Badge color variant mapping for status pills
export function getClaimStatusVariant(status: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = {
    [ClaimStatus.PENDING]: 'warning',
    [ClaimStatus.SUBMITTED]: 'info',
    [ClaimStatus.UNDER_REVIEW]: 'info',
    [ClaimStatus.DOCUMENT_VERIFICATION]: 'info',
    [ClaimStatus.APPROVED]: 'success',
    [ClaimStatus.REJECTED]: 'danger',
    [ClaimStatus.PAID]: 'success',
  };
  return map[status] ?? 'default';
}
