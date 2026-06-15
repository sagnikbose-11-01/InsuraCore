// ============================================================
// lib/validators/policy.validators.ts
// Zod schemas for policy creation/editing by Admins.
// ============================================================

import { z } from 'zod';
import { PolicyType } from '@/lib/constants/enums';

export const CreatePolicySchema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters').max(200),
  type: z.nativeEnum(PolicyType),
  description: z.string().min(20, 'Please write a detailed description').max(2000),
  premiumAmount: z.number().positive('Premium must be positive'),
  coverageAmount: z.number().positive('Coverage amount must be positive'),
  validityPeriod: z.number().int().positive('Validity period must be a positive whole number'),
  eligibility: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  waitingPeriod: z.coerce.number().min(0).default(0),
  maximumClaimAmount: z.coerce.number().min(0).default(0),
  requiredDocuments: z.array(z.string()).default([]),
  riskCategory: z.string().default('Standard'),
  termsAndConditions: z.string().default(''),
});

export const AssessorCreatePolicySchema = CreatePolicySchema.extend({
  type: z.nativeEnum(PolicyType, {
    errorMap: () => ({ message: 'Assessor policy type must exactly match assessor specialization.' })
  }),
});

export type CreatePolicyInput = z.infer<typeof CreatePolicySchema>;
export type AssessorCreatePolicyInput = z.infer<typeof AssessorCreatePolicySchema>;
