// ============================================================
// lib/utils/policy.serializers.ts
// Pure serializer utilities — NO 'use server' directive.
// These transform Mongoose documents into plain serializable objects.
// ============================================================

import PurchasedPolicy from '@/models/PurchasedPolicy';
import { IPolicy } from '@/models/Policy';
import { SerializedPolicy, SerializedPurchasedPolicy } from '@/types';

export function serializePolicy(policy: IPolicy): SerializedPolicy {
  return {
    _id: policy._id.toString(),
    name: policy.name,
    type: policy.type,
    description: policy.description,
    premiumAmount: policy.premiumAmount,
    coverageAmount: policy.coverageAmount,
    validityPeriod: policy.validityPeriod,
    eligibility: policy.eligibility,
    isActive: policy.isActive,
    createdAt: policy.createdAt.toISOString(),
    // Optional assessor ownership
    createdByAssessorId: policy.createdByAssessorId?.toString() ?? null,
    createdByName: policy.createdByName ?? null,
    createdBySpecialization: policy.createdBySpecialization ?? null,
  };
}


export function serializePurchasedPolicy(
  purchased: InstanceType<typeof PurchasedPolicy>,
  policy: IPolicy | null
): SerializedPurchasedPolicy {
  if (!policy) {
    throw new Error(`PurchasedPolicy ${purchased._id} references a deleted or missing policy.`);
  }
  return {
    _id: purchased._id.toString(),
    userId: purchased.userId.toString(),
    policyId: serializePolicy(policy),
    startDate: purchased.startDate.toISOString(),
    endDate: purchased.endDate.toISOString(),
    status: purchased.status,
    createdAt: purchased.createdAt.toISOString(),
  };
}
