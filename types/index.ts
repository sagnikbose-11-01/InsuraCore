// ============================================================
// types/index.ts
// Shared TypeScript types for API responses, serialized models,
// and UI props used across the entire application.
// ============================================================

import { ClaimStatus, DocumentStatus, PaymentStatus, PolicyStatus, PolicyType, UserRole, PriorityLevel } from '@/lib/constants/enums';

// ---- Server Action Response Shape ----
export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ---- Serialized (plain object) types for client components ----
// These are needed because Mongoose Documents can't be passed
// directly to Client Components in Next.js App Router.

export interface SerializedUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  address?: string;
  dob?: string;
  employeeId?: string;
  specialization?: string;
  yearsOfExperience?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPolicy {
  _id: string;
  name: string;
  type: PolicyType;
  description: string;
  premiumAmount: number;
  coverageAmount: number;
  validityPeriod: number;
  eligibility: string[];
  isActive: boolean;
  createdAt: string;
}

export interface SerializedPurchasedPolicy {
  _id: string;
  userId: string;
  policyId: SerializedPolicy | string;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  createdAt: string;
}

export interface SerializedClaimNote {
  authorId: string;
  authorName: string;
  text: string;
  isInternal: boolean;
  createdAt: string;
}

export interface SerializedClaim {
  _id: string;
  purchasedPolicyId: string | SerializedPurchasedPolicy;
  customerId: string | SerializedUser;
  title: string;
  description: string;
  incidentDate: string;
  claimAmount: number;
  approvedAmount: number;
  assignedAssessorId: string | SerializedUser | null;
  status: ClaimStatus;
  policyType: PolicyType;
  priority: PriorityLevel;
  riskScore: number;
  fraudFlags: string[];
  notes?: SerializedClaimNote[];
  createdAt: string;
  updatedAt: string;
}

export interface SerializedClaimDocument {
  _id: string;
  claimId: string;
  documentName: string;
  documentUrl: string;
  verificationStatus: DocumentStatus;
  createdAt: string;
}

export interface SerializedClaimAssessment {
  _id: string;
  claimId: string;
  assessorId: string | { _id: string; name: string };
  remarks: string;
  approvedAmount: number;
  assessmentDate: string;
  reviewStartedAt?: string;
  reviewCompletedAt?: string;
  createdAt: string;
}

export interface SerializedPayment {
  _id: string;
  claimId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  paymentDate: string | null;
  createdAt: string;
}

export interface SerializedNotification {
  _id: string;
  userId: string;
  message: string;
  isRead: boolean;
  title?: string;
  claimId?: string;
  metadata?: {
    type?: string;
    approvedAmount?: number;
    rejectionReason?: string;
    requestedDocuments?: string[];
    assessorRemarks?: string;
  };
  createdAt: string;
}

// ---- Admin analytics types ----
export interface ClaimsAnalytics {
  total: number;
  byStatus: Record<ClaimStatus, number>;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  approvalRate: number;
  monthlyTrend: { month: string; count: number; amount: number }[];
}
