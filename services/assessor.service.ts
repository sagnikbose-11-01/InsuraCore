// ============================================================
// services/assessor.service.ts
// Specialization-aware backend service for Assessor data retrieval.
// Enforces the rule that an assessor can only access data
// related to their assigned PolicyType.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import Claim from '@/models/Claim';
import ClaimAssessment from '@/models/ClaimAssessment';
import Policy from '@/models/Policy';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import { ClaimStatus, PolicyType, UserRole } from '@/lib/constants/enums';

/**
 * Helper to get the assessor and enforce they exist and have a specialization.
 */
async function getAssessorContext(assessorId: string) {
  await connectDB();
  const assessor = await User.findById(assessorId).select('role specialization name');
  if (!assessor || assessor.role !== UserRole.ASSESSOR) {
    throw new Error('User is not a valid assessor.');
  }
  if (!assessor.specialization) {
    throw new Error('Assessor has no specialization assigned.');
  }
  return assessor;
}

/**
 * Helper to fetch all purchasedPolicy IDs that fall under a specific specialization.
 * This guarantees we find legacy claims that don't have denormalized policyType fields.
 */
async function getSpecializationPurchasedPolicyIds(specialization: PolicyType) {
  // 1. Find all Policy IDs matching the specialization
  const policies = await Policy.find({ type: specialization }).select('_id').lean();
  const policyIds = policies.map(p => p._id);

  // 2. Find all PurchasedPolicy IDs that reference those Policies
  const purchasedPolicies = await PurchasedPolicy.find({ policyId: { $in: policyIds } }).select('_id').lean();
  return purchasedPolicies.map(pp => pp._id);
}

/**
 * Retrieves the high-level KPI metrics for the Assessor Dashboard.
 * Strictly scoped to the assessor's specialization.
 */
export async function getAssessorDashboardMetrics(assessorId: string) {
  const assessor = await getAssessorContext(assessorId);
  const specialization = assessor.specialization as PolicyType;

  // Real relational lookup to guarantee finding legacy data
  const purchasedPolicyIds = await getSpecializationPurchasedPolicyIds(specialization);

  const baseQuery = { purchasedPolicyId: { $in: purchasedPolicyIds } };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    assignedClaims,
    underReview,
    approvedToday,
    rejectedToday,
    fraudAlerts
  ] = await Promise.all([
    // Claims assigned specifically to them
    Claim.countDocuments({ ...baseQuery, assignedAssessorId: assessorId, status: { $ne: ClaimStatus.APPROVED } }),
    // Claims currently being reviewed by them
    Claim.countDocuments({ ...baseQuery, assignedAssessorId: assessorId, status: ClaimStatus.UNDER_REVIEW }),
    // Approved today
    ClaimAssessment.countDocuments({ 
      assessorId, 
      createdAt: { $gte: startOfDay }, 
      approvedAmount: { $gt: 0 } 
    }),
    // Rejected today (assessed but 0 amount)
    ClaimAssessment.countDocuments({ 
      assessorId, 
      createdAt: { $gte: startOfDay }, 
      approvedAmount: 0 
    }),
    // Fraud alerts within their specialization
    Claim.countDocuments({ ...baseQuery, riskScore: { $gte: 80 }, status: { $ne: ClaimStatus.APPROVED } })
  ]);

  return {
    assignedClaims,
    underReview,
    approvedToday,
    rejectedToday,
    fraudAlerts,
    // Mocking average review time until we build the full historic dataset
    avgReviewTime: '2.1h' 
  };
}

/**
 * Retrieves the high priority work queue for the assessor.
 * Claims that are unassigned or assigned to them, within their specialization.
 */
export async function getAssessorWorkQueue(assessorId: string, limit = 5) {
  const assessor = await getAssessorContext(assessorId);
  
  const purchasedPolicyIds = await getSpecializationPurchasedPolicyIds(assessor.specialization as PolicyType);

  const claims = await Claim.find({
    purchasedPolicyId: { $in: purchasedPolicyIds },
    status: { $in: [ClaimStatus.PENDING, ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.DOCUMENT_VERIFICATION] },
    $or: [
      { assignedAssessorId: assessorId },
      { assignedAssessorId: null }
    ]
  })
    .sort({ riskScore: -1, priority: 1, createdAt: 1 }) // Highest risk and priority first
    .limit(limit)
    .populate('customerId', 'name email phone')
    .populate({
      path: 'purchasedPolicyId',
      populate: { path: 'policyId', select: 'name type coverageAmount' }
    })
    .lean();

  return claims;
}

/**
 * Retrieves the full paginated and filtered list of claims for the Review Center.
 */
export async function getAssessorReviewQueue(assessorId: string, filters: any = {}) {
  const assessor = await getAssessorContext(assessorId);
  const purchasedPolicyIds = await getSpecializationPurchasedPolicyIds(assessor.specialization as PolicyType);

  const query: any = { purchasedPolicyId: { $in: purchasedPolicyIds } };
  
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  
  if (filters.search) {
    query.$or = [
      { _id: filters.search }, // Exact match if it's an ID (requires robust regex/casting in prod)
      { title: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const claims = await Claim.find(query)
    .sort({ createdAt: -1 })
    .populate('customerId', 'name email phone')
    .populate({
      path: 'purchasedPolicyId',
      populate: { path: 'policyId', select: 'name type coverageAmount' }
    })
    .lean();

  return claims;
}

/**
 * Retrieves a single claim fully populated for the Review Page.
 * Verifies that the claim falls within the assessor's specialization.
 */
export async function getAssessorClaimDetail(assessorId: string, claimId: string) {
  const assessor = await getAssessorContext(assessorId);
  const purchasedPolicyIds = await getSpecializationPurchasedPolicyIds(assessor.specialization as PolicyType);

  const claim = await Claim.findOne({
    _id: claimId,
    purchasedPolicyId: { $in: purchasedPolicyIds }
  })
    .populate('customerId', 'name email phone avatar address dob')
    .populate({
      path: 'purchasedPolicyId',
      populate: { path: 'policyId', select: 'name type coverageAmount description validityPeriod' }
    })
    .lean();

  if (!claim) {
    throw new Error('Claim not found or you do not have permission to view it.');
  }

  // TODO: Populate documents and assessment history if we had those collections fully defined
  return claim;
}

/**
 * Retrieves data for the Analytics chart (Review Velocity).
 */
export async function getAssessorAnalytics(assessorId: string) {
  // In a real enterprise system, this uses MongoDB Aggregation Pipelines
  // to group ClaimAssessments by day over the last 7 days.
  // For safety and immediate demo of the architecture, we return a structured aggregate map.
  
  await getAssessorContext(assessorId);
  
  // Real implementation would aggregate over `ClaimAssessment` where `assessorId` matches.
  // Returning the structured layout expected by our Recharts component.
  return {
    productivityData: [
      { name: 'Mon', reviewed: 12, target: 15 },
      { name: 'Tue', reviewed: 19, target: 15 },
      { name: 'Wed', reviewed: 15, target: 15 },
      { name: 'Thu', reviewed: 22, target: 15 },
      { name: 'Fri', reviewed: 28, target: 15 },
    ],
    queueDistribution: [
      { name: 'High Risk', value: 15, color: 'var(--color-red-500)' },
      { name: 'Medium Risk', value: 35, color: 'var(--color-orange-500)' },
      { name: 'Low Risk', value: 50, color: 'var(--color-blue-500)' },
    ]
  };
}
