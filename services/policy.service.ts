'use server';
// ============================================================
// services/policy.service.ts
// Policy business logic: CRUD for admins, purchasing for customers.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import Policy, { IPolicy } from '@/models/Policy';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import { CreatePolicyInput } from '@/lib/validators/policy.validators';
import { PolicyStatus } from '@/lib/constants/enums';
import { SerializedPolicy, SerializedPurchasedPolicy } from '@/types';
import { addMonths } from 'date-fns';

// ---- Admin: Manage Policies ----

export async function createPolicy(input: CreatePolicyInput): Promise<SerializedPolicy> {
  await connectDB();
  const policy = await Policy.create(input);
  return serializePolicy(policy);
}

export async function updatePolicy(
  id: string,
  input: Partial<CreatePolicyInput>
): Promise<SerializedPolicy> {
  await connectDB();
  const policy = await Policy.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!policy) throw new Error('Policy not found');
  return serializePolicy(policy);
}

export async function deletePolicy(id: string): Promise<void> {
  await connectDB();
  await Policy.findByIdAndUpdate(id, { isActive: false });
}

export async function getAllPolicies(activeOnly = false): Promise<SerializedPolicy[]> {
  await connectDB();
  const filter = activeOnly ? { isActive: true } : {};
  const policies = await Policy.find(filter).sort({ createdAt: -1 });
  return policies.map(serializePolicy);
}

export async function getPolicyById(id: string): Promise<SerializedPolicy | null> {
  await connectDB();
  try {
    const policy = await Policy.findById(id);
    return policy ? serializePolicy(policy) : null;
  } catch {
    // Invalid ObjectId format or other lookup error
    return null;
  }
}

// ---- Customer: Purchase Policies ----

export async function purchasePolicy(
  userId: string,
  policyId: string
): Promise<SerializedPurchasedPolicy> {
  await connectDB();

  const policy = await Policy.findById(policyId);
  if (!policy || !policy.isActive) throw new Error('Policy not found or inactive');

  const startDate = new Date();
  const endDate = addMonths(startDate, policy.validityPeriod);

  const purchased = await PurchasedPolicy.create({
    userId,
    policyId,
    startDate,
    endDate,
    status: PolicyStatus.ACTIVE,
  });

  return serializePurchasedPolicy(purchased, policy);
}

export async function getMyPolicies(userId: string): Promise<SerializedPurchasedPolicy[]> {
  await connectDB();
  const purchased = await PurchasedPolicy.find({ userId })
    .populate('policyId')
    .sort({ createdAt: -1 });

  return purchased.map((p) =>
    serializePurchasedPolicy(p, p.policyId as unknown as IPolicy)
  );
}

// ---- Serializers ----

function serializePolicy(policy: IPolicy): SerializedPolicy {
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
  };
}

function serializePurchasedPolicy(
  purchased: InstanceType<typeof PurchasedPolicy>,
  policy: IPolicy
): SerializedPurchasedPolicy {
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
