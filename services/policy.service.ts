'use server';
// ============================================================
// services/policy.service.ts
// Policy business logic: CRUD for admins, purchasing for customers.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import Policy, { IPolicy } from '@/models/Policy';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import Claim from '@/models/Claim';
import Notification from '@/models/Notification';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { CreatePolicyInput } from '@/lib/validators/policy.validators';
import { PolicyStatus, ClaimStatus, PolicyListingStatus } from '@/lib/constants/enums';
import { SerializedPolicy, SerializedPurchasedPolicy, SerializedPurchasedPolicyWithStats, PolicyClaimStats } from '@/types';
import { addMonths } from 'date-fns';
import { serializePolicy, serializePurchasedPolicy } from '@/lib/utils/policy.serializers';

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
  await Policy.findByIdAndUpdate(id, { status: PolicyListingStatus.INACTIVE });
}

export async function getAllPolicies(activeOnly = false): Promise<SerializedPolicy[]> {
  await connectDB();
  const filter = activeOnly ? { status: PolicyListingStatus.ACTIVE } : {};
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
  if (!policy || policy.status !== PolicyListingStatus.ACTIVE) throw new Error('Policy not found or inactive');

  const startDate = new Date();
  const endDate = addMonths(startDate, policy.validityPeriod);

  const purchased = await PurchasedPolicy.create({
    userId,
    policyId,
    startDate,
    endDate,
    status: PolicyStatus.ACTIVE,
  });

  // Notify customer about successful purchase
  await Notification.create({
    userId,
    title: 'Policy Purchased',
    message: `Your "${policy.name}" policy has been activated. You are now covered until ${endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.`,
  });

  // Notify assessor if they created this product
  if (policy.createdByAssessorId) {
    const buyer = await User.findById(userId).select('name').lean();
    await Notification.create({
      userId: policy.createdByAssessorId,
      title: 'Policy Purchased',
      message: `A customer (${buyer?.name ?? 'Unknown'}) has purchased your "${policy.name}" policy product.`,
    });
  }

  // Write enterprise audit log entry
  const buyer = await User.findById(userId).select('name').lean() as { name: string } | null;
  await AuditLog.create({
    actorId: userId,
    actorName: buyer?.name ?? 'Customer',
    actorRole: 'CUSTOMER',
    entityId: purchased._id.toString(),
    entityType: 'PURCHASED_POLICY',
    action: 'PURCHASE',
    remarks: `Purchased policy "${policy.name}" (${policy.type}). Coverage: ₹${policy.coverageAmount?.toLocaleString('en-IN') ?? 0}. Valid until ${endDate.toLocaleDateString('en-IN')}.`,
  });

  return serializePurchasedPolicy(purchased, policy);
}

export async function getMyPolicies(userId: string): Promise<SerializedPurchasedPolicy[]> {
  await connectDB();
  const purchased = await PurchasedPolicy.find({ userId })
    .populate('policyId')
    .sort({ createdAt: -1 });

  return purchased
    .filter((p) => p.policyId != null)
    .map((p) => serializePurchasedPolicy(p, p.policyId as unknown as IPolicy));
}

// Returns all purchased policies enriched with per-policy claim counts
export async function getMyPoliciesWithClaimStats(
  userId: string
): Promise<SerializedPurchasedPolicyWithStats[]> {
  await connectDB();

  const purchased = await PurchasedPolicy.find({ userId })
    .populate('policyId')
    .sort({ createdAt: -1 });

  const valid = purchased.filter((p) => p.policyId != null);
  if (valid.length === 0) return [];

  // Fetch all claims for this user in a single query
  const purchasedIds = valid.map((p) => p._id);
  const claims = await Claim.find({ purchasedPolicyId: { $in: purchasedIds } }).select(
    'purchasedPolicyId status'
  );

  // Group claim counts by purchasedPolicyId
  const claimMap = new Map<string, PolicyClaimStats>();
  for (const c of claims) {
    const key = c.purchasedPolicyId.toString();
    if (!claimMap.has(key)) {
      claimMap.set(key, { total: 0, approved: 0, rejected: 0, underReview: 0, pending: 0 });
    }
    const stats = claimMap.get(key)!;
    stats.total++;
    if (c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.PAID) stats.approved++;
    else if (c.status === ClaimStatus.REJECTED) stats.rejected++;
    else if (c.status === ClaimStatus.UNDER_REVIEW || c.status === ClaimStatus.DOCUMENT_VERIFICATION) stats.underReview++;
    else stats.pending++;
  }

  return valid.map((p) => ({
    ...serializePurchasedPolicy(p, p.policyId as unknown as IPolicy),
    claimStats: claimMap.get(p._id.toString()) ?? {
      total: 0, approved: 0, rejected: 0, underReview: 0, pending: 0,
    },
  }));
}

// ---- Marketplace Stats ----

export async function getMarketplaceStats(): Promise<{
  availablePlans: number;
  activeCustomers: number;
  claimsProcessed: number;
  totalCoverageOffered: number;
}> {
  await connectDB();

  const [availablePlans, activeCustomers, claimsProcessed, coverageAgg] = await Promise.all([
    Policy.countDocuments({ status: PolicyListingStatus.ACTIVE }),
    PurchasedPolicy.countDocuments({ status: PolicyStatus.ACTIVE }),
    Claim.countDocuments({}),
    Policy.aggregate([
      { $match: { status: PolicyListingStatus.ACTIVE } },
      { $group: { _id: null, total: { $sum: '$coverageAmount' } } },
    ]),
  ]);

  return {
    availablePlans,
    activeCustomers,
    claimsProcessed,
    totalCoverageOffered: coverageAgg[0]?.total ?? 0,
  };
}

// Serializers are in lib/utils/policy.serializers.ts (no 'use server').
// They are imported above and used internally by the async service functions.
