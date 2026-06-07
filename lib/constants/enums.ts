// ============================================================
// lib/constants/enums.ts
// Central source of truth for all enum values across the app.
// ============================================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ASSESSOR = 'ASSESSOR',
  ADMIN = 'ADMIN',
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PolicyType {
  HEALTH = 'HEALTH',
  AUTO = 'AUTO',
  PROPERTY = 'PROPERTY',
  LIFE = 'LIFE',
  TRAVEL = 'TRAVEL',
}

export enum PriorityLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}
