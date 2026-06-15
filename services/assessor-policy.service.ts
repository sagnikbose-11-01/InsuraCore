'use server';

import { connectDB } from '@/lib/db/mongoose';
import Policy from '@/models/Policy';
import User from '@/models/User';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import Claim from '@/models/Claim';
import Notification from '@/models/Notification';
import AuditLog from '@/models/AuditLog';
import { AssessorCreatePolicyInput, AssessorCreatePolicySchema } from '@/lib/validators/policy.validators';
import { PolicyListingStatus, PolicyType, UserRole, ClaimStatus } from '@/lib/constants/enums';
import { SerializedPolicy } from '@/types';
import { serializePolicy } from '@/lib/utils/policy.serializers';

// Helper to verify assessor and get specialization
async function getAssessorContext(assessorId: string) {
  await connectDB();
  const assessor = await User.findById(assessorId).select('role name specialization');
  if (!assessor || assessor.role !== UserRole.ASSESSOR) {
    throw new Error('User is not a valid assessor.');
  }
  if (!assessor.specialization) {
    throw new Error('Assessor has no specialization assigned.');
  }
  return assessor;
}

export async function assessorCreatePolicy(
  input: AssessorCreatePolicyInput,
  assessorId: string
): Promise<SerializedPolicy> {
  const assessor = await getAssessorContext(assessorId);
  
  // 1. Strict Server-Side Specialization Check
  if (input.type !== assessor.specialization) {
    throw new Error(`You can only create policies of your specialization type (${assessor.specialization}).`);
  }

  // 2. Validate input
  const parsed = AssessorCreatePolicySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Validation failed for policy creation.');
  }

  const policyData = {
    ...parsed.data,
    status: PolicyListingStatus.PENDING_ADMIN_APPROVAL,
    createdByAssessorId: assessor._id,
    createdByName: assessor.name,
    createdBySpecialization: assessor.specialization as PolicyType,
    approvalHistory: [
      {
        status: PolicyListingStatus.PENDING_ADMIN_APPROVAL,
        date: new Date(),
        comments: 'Submitted for review by assessor.',
      }
    ]
  };

  const policy = await Policy.create(policyData);

  // Notify Admins
  const admins = await User.find({ role: UserRole.ADMIN }).select('_id');
  if (admins.length > 0) {
    const notifications = admins.map(admin => ({
      userId: admin._id,
      title: 'New Policy Pending Approval',
      message: `Assessor ${assessor.name} has submitted a new ${assessor.specialization} policy "${policy.name}" for review.`,
    }));
    await Notification.insertMany(notifications);
  }

  // Log action
  await AuditLog.create({
    actorId: assessorId,
    actorName: assessor.name,
    actorRole: 'ASSESSOR',
    entityId: policy._id.toString(),
    entityType: 'POLICY',
    action: 'CREATE_POLICY',
    remarks: `Created policy "${policy.name}" pending admin approval.`,
  });

  return serializePolicy(policy);
}

export async function getAssessorPolicies(assessorId: string): Promise<SerializedPolicy[]> {
  const assessor = await getAssessorContext(assessorId);
  
  // Fetch only policies created by this specific assessor
  const policies = await Policy.find({ createdByAssessorId: assessorId }).sort({ createdAt: -1 });
  return policies.map(serializePolicy);
}

export async function getAssessorPolicyAnalytics(assessorId: string) {
  const assessor = await getAssessorContext(assessorId);
  
  // 1. Find policies created by this assessor
  const policies = await Policy.find({ createdByAssessorId: assessorId }).lean();
  const policyIds = policies.map(p => p._id);

  // 2. Find purchases of these policies
  const purchases = await PurchasedPolicy.find({ policyId: { $in: policyIds } }).lean();
  const purchasedPolicyIds = purchases.map(p => p._id);

  // 3. Find claims filed against these purchased policies
  const claims = await Claim.find({ purchasedPolicyId: { $in: purchasedPolicyIds } }).select('status claimAmount approvedAmount').lean();

  let totalRevenue = 0;
  let activePurchases = 0;
  let totalPurchases = purchases.length;

  // We need to calculate revenue based on premium amount * validity duration or something similar.
  // For simplicity, let's just sum up the premiumAmount of the purchased policies.
  // We can join the premium amount from the policy.
  const policyMap = new Map();
  policies.forEach(p => policyMap.set(p._id.toString(), p));

  purchases.forEach(p => {
    if (p.status === 'ACTIVE') activePurchases++;
    const policy = policyMap.get(p.policyId.toString());
    if (policy) {
       // Just adding premiumAmount as revenue
       totalRevenue += policy.premiumAmount;
    }
  });

  let claimsApproved = 0;
  let claimsRejected = 0;
  let totalClaimedAmount = 0;
  let totalApprovedAmount = 0;

  claims.forEach(c => {
    totalClaimedAmount += c.claimAmount || 0;
    if (c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.PAID) {
      claimsApproved++;
      totalApprovedAmount += c.approvedAmount || 0;
    } else if (c.status === ClaimStatus.REJECTED) {
      claimsRejected++;
    }
  });

  const totalPoliciesCreated = policies.length;
  const activePolicies = policies.filter(p => p.status === PolicyListingStatus.ACTIVE).length;
  const pendingPolicies = policies.filter(p => p.status === PolicyListingStatus.PENDING_ADMIN_APPROVAL).length;
  const claimRatio = totalPurchases > 0 ? ((claims.length / totalPurchases) * 100).toFixed(1) : 0;

  // Identify most popular policy
  let mostPopularPolicy = null;
  let maxPurchases = 0;
  
  const purchaseCounts = new Map();
  purchases.forEach(p => {
    const pid = p.policyId.toString();
    purchaseCounts.set(pid, (purchaseCounts.get(pid) || 0) + 1);
  });

  for (const [pid, count] of purchaseCounts.entries()) {
    if (count > maxPurchases) {
      maxPurchases = count;
      const pol = policyMap.get(pid);
      if (pol) mostPopularPolicy = { name: pol.name, purchases: count, revenue: pol.premiumAmount * count };
    }
  }

  return {
    totalPoliciesCreated,
    activePolicies,
    pendingPolicies,
    totalPurchases,
    activePurchases,
    totalRevenue,
    totalClaimsFiled: claims.length,
    claimsApproved,
    claimsRejected,
    claimRatio,
    totalClaimedAmount,
    totalApprovedAmount,
    mostPopularPolicy
  };
}
