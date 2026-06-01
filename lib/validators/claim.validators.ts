// ============================================================
// lib/validators/claim.validators.ts
// Zod schemas for claim filing and assessment submission.
// ============================================================

import { z } from 'zod';

export const CreateClaimSchema = z.object({
  purchasedPolicyId: z.string().min(1, 'Please select a policy'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Please provide a detailed description').max(2000),
  incidentDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  claimAmount: z
    .number()
    .positive('Claim amount must be positive')
    .max(10_000_000, 'Claim amount too large'),
});

export const AssessmentSchema = z.object({
  claimId: z.string().min(1, 'Claim ID required'),
  remarks: z.string().min(10, 'Please provide detailed remarks').max(2000),
  approvedAmount: z
    .number()
    .min(0, 'Approved amount cannot be negative'),
  decision: z.enum(['APPROVED', 'REJECTED']),
});

export const AssignAssessorSchema = z.object({
  claimId: z.string().min(1),
  assessorId: z.string().min(1, 'Please select an assessor'),
});

export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;
export type AssessmentInput = z.infer<typeof AssessmentSchema>;
export type AssignAssessorInput = z.infer<typeof AssignAssessorSchema>;
