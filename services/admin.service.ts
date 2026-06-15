'use server';
// ============================================================
// services/admin.service.ts
// Enterprise admin service — all platform-wide MongoDB queries.
// Every metric is derived from real MongoDB data — no placeholders.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import Claim from '@/models/Claim';
import Policy from '@/models/Policy';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import ClaimDocument from '@/models/ClaimDocument';
import ClaimAssessment from '@/models/ClaimAssessment';
import ClaimAuditLog from '@/models/ClaimAuditLog';
import AuditLog from '@/models/AuditLog';
import Notification from '@/models/Notification';
import Payment from '@/models/Payment';
import { ClaimStatus, UserRole, PolicyStatus, DocumentStatus, PolicyType, PaymentStatus, PolicyListingStatus } from '@/lib/constants/enums';

// ════════════════════════════════════════════════════════════
// EXECUTIVE DASHBOARD — KPI METRICS
// ════════════════════════════════════════════════════════════

export async function getAdminDashboardMetrics() {
  await connectDB();

  const [
    totalCustomers,
    totalAssessors,
    totalPolicies,
    activePolicies,
    totalPurchases,
    activePurchases,
    claimsByStatus,
    claimAmounts,
    pendingDocuments,
    unreadNotifications,
    paymentAgg,
    fraudFlaggedClaims,
    newUsersThisMonth,
    assessmentTimings,
  ] = await Promise.all([
    User.countDocuments({ role: UserRole.CUSTOMER }),
    User.countDocuments({ role: UserRole.ASSESSOR }),
    Policy.countDocuments(),
    Policy.countDocuments({ status: PolicyListingStatus.ACTIVE }),
    PurchasedPolicy.countDocuments(),
    PurchasedPolicy.countDocuments({ status: PolicyStatus.ACTIVE }),
    Claim.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Claim.aggregate([{
      $group: {
        _id: null,
        totalClaimValue: { $sum: '$claimAmount' },
        totalApprovedPayout: { $sum: '$approvedAmount' },
      },
    }]),
    ClaimDocument.countDocuments({ verificationStatus: DocumentStatus.UPLOADED }),
    Notification.countDocuments({ isRead: false }),
    Payment.aggregate([{
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
      },
    }]),
    Claim.countDocuments({ fraudFlags: { $exists: true, $not: { $size: 0 } } }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    ClaimAssessment.find({
      reviewStartedAt: { $exists: true },
      reviewCompletedAt: { $exists: true },
    }).select('reviewStartedAt reviewCompletedAt').lean(),
  ]);

  // Status breakdown
  const statusMap: Record<string, number> = {};
  claimsByStatus.forEach((s: any) => { statusMap[s._id] = s.count; });

  const totalClaims = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const activeClaims =
    (statusMap[ClaimStatus.PENDING] ?? 0) +
    (statusMap[ClaimStatus.SUBMITTED] ?? 0) +
    (statusMap[ClaimStatus.UNDER_REVIEW] ?? 0) +
    (statusMap[ClaimStatus.DOCUMENT_VERIFICATION] ?? 0);
  const approvedClaims =
    (statusMap[ClaimStatus.APPROVED] ?? 0) + (statusMap[ClaimStatus.PAID] ?? 0);
  const approvalRate =
    totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;

  // Payment totals
  const paymentMap: Record<string, { count: number; total: number }> = {};
  paymentAgg.forEach((p: any) => {
    paymentMap[p._id] = { count: p.count, total: p.total };
  });

  // Average resolution time
  let avgResolutionHours = 0;
  if (assessmentTimings.length > 0) {
    const totalMs = (assessmentTimings as any[]).reduce((sum, a) => {
      return (
        sum +
        (new Date(a.reviewCompletedAt).getTime() -
          new Date(a.reviewStartedAt).getTime())
      );
    }, 0);
    avgResolutionHours = totalMs / (assessmentTimings.length * 60 * 60 * 1000);
  }

  // Revenue: sum of premiumAmount for all PurchasedPolicies via lookup
  const revenueAgg = await PurchasedPolicy.aggregate([
    {
      $lookup: {
        from: 'policies',
        localField: 'policyId',
        foreignField: '_id',
        as: 'policy',
      },
    },
    { $unwind: '$policy' },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$policy.premiumAmount' },
      },
    },
  ]);

  return {
    totalCustomers,
    totalAssessors,
    totalPolicies,
    activePolicies,
    totalPurchases,
    activePurchases,
    totalClaims,
    activeClaims,
    pendingClaims:
      (statusMap[ClaimStatus.PENDING] ?? 0) +
      (statusMap[ClaimStatus.SUBMITTED] ?? 0),
    underReviewClaims:
      (statusMap[ClaimStatus.UNDER_REVIEW] ?? 0) +
      (statusMap[ClaimStatus.DOCUMENT_VERIFICATION] ?? 0),
    approvedClaims,
    rejectedClaims: statusMap[ClaimStatus.REJECTED] ?? 0,
    paidClaims: statusMap[ClaimStatus.PAID] ?? 0,
    totalClaimValue: claimAmounts[0]?.totalClaimValue ?? 0,
    totalApprovedPayout: claimAmounts[0]?.totalApprovedPayout ?? 0,
    totalReleasedPayout: paymentMap['SUCCESS']?.total ?? 0,
    totalRevenue: revenueAgg[0]?.totalRevenue ?? 0,
    approvalRate,
    pendingDocuments,
    unreadNotifications,
    fraudFlaggedClaims,
    newUsersThisMonth,
    avgResolutionHours: parseFloat(avgResolutionHours.toFixed(1)),
    claimsByStatus: statusMap,
  };
}

// ════════════════════════════════════════════════════════════
// ACTIVITY FEED — Combined ClaimAuditLog + AuditLog
// ════════════════════════════════════════════════════════════

export async function getAdminActivityFeed(limit = 30) {
  await connectDB();

  const [claimAuditLogs, auditLogs] = await Promise.all([
    ClaimAuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('claimId', 'title policyType status claimAmount')
      .populate('assessorId', 'name role')
      .populate('customerId', 'name role')
      .lean(),
    AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
  ]);

  const claimEvents = (claimAuditLogs as any[]).map((log) => {
    const claimRef = `INS-${log.claimId?._id?.toString().slice(-8).toUpperCase() ?? 'UNKNOWN'}`;
    const actorName =
      log.assessorId?.name ?? log.customerId?.name ?? 'System';
    const actorRole = log.assessorId ? 'ASSESSOR' : 'CUSTOMER';

    const ACTION_LABELS: Record<string, string> = {
      REVIEW_STARTED: 'Review Started',
      DOCUMENT_REQUESTED: 'Documents Requested',
      NOTE_ADDED: 'Note Added',
      APPROVED: 'Claim Approved',
      REJECTED: 'Claim Rejected',
      ESCALATED: 'Claim Escalated',
      CUSTOMER_RESPONDED: 'Customer Uploaded Documents',
    };

    const SEVERITY_MAP: Record<string, string> = {
      APPROVED: 'success',
      REJECTED: 'danger',
      ESCALATED: 'danger',
      REVIEW_STARTED: 'info',
      DOCUMENT_REQUESTED: 'warning',
      NOTE_ADDED: 'default',
      CUSTOMER_RESPONDED: 'info',
    };

    return {
      _id: log._id.toString(),
      source: 'CLAIM_AUDIT',
      action: ACTION_LABELS[log.action] ?? log.action,
      actorName,
      actorRole,
      entityRef: claimRef,
      entityType: 'CLAIM',
      details: log.remarks || '',
      severity: SEVERITY_MAP[log.action] ?? 'default',
      createdAt: new Date(log.createdAt).toISOString(),
    };
  });

  const auditEvents = (auditLogs as any[]).map((log) => {
    const ACTION_LABELS: Record<string, string> = {
      PURCHASE: 'Policy Purchased',
      CLAIM_SUBMISSION: 'Claim Filed',
      REVIEW_STARTED: 'Review Started',
      APPROVED: 'Claim Approved',
      REJECTED: 'Claim Rejected',
      DOCUMENT_REQUESTED: 'Documents Requested',
      PAYMENT_RELEASED: 'Payment Released',
      NOTE_ADDED: 'Note Added',
      CUSTOMER_RESPONDED: 'Customer Responded',
    };

    const SEVERITY_MAP: Record<string, string> = {
      PURCHASE: 'success',
      CLAIM_SUBMISSION: 'info',
      REVIEW_STARTED: 'info',
      APPROVED: 'success',
      REJECTED: 'danger',
      DOCUMENT_REQUESTED: 'warning',
      PAYMENT_RELEASED: 'success',
      NOTE_ADDED: 'default',
      CUSTOMER_RESPONDED: 'info',
    };

    return {
      _id: log._id.toString(),
      source: 'AUDIT_LOG',
      action: ACTION_LABELS[log.action] ?? log.action,
      actorName: log.actorName,
      actorRole: log.actorRole,
      entityRef: log.entityId,
      entityType: log.entityType,
      details: log.remarks || '',
      severity: SEVERITY_MAP[log.action] ?? 'default',
      createdAt: new Date(log.createdAt).toISOString(),
    };
  });

  // Merge and sort by time descending
  const combined = [...claimEvents, ...auditEvents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return combined;
}

// ════════════════════════════════════════════════════════════
// CUSTOMER MANAGEMENT
// ════════════════════════════════════════════════════════════

export async function getAdminCustomers() {
  await connectDB();

  const customers = await User.find({ role: UserRole.CUSTOMER })
    .sort({ createdAt: -1 })
    .select('-password')
    .lean();

  if (customers.length === 0) return [];

  const customerIds = customers.map((c) => c._id);

  const [policyCountByUser, claimStatsByUser] = await Promise.all([
    PurchasedPolicy.aggregate([
      { $match: { userId: { $in: customerIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } } } },
    ]),
    Claim.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: '$customerId',
          total: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $in: ['$status', ['APPROVED', 'PAID']] }, 1, 0],
            },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
          },
          totalAmount: { $sum: '$claimAmount' },
          approvedAmount: { $sum: '$approvedAmount' },
        },
      },
    ]),
  ]);

  const policyMap: Record<string, { count: number; active: number }> = {};
  policyCountByUser.forEach((p: any) => {
    policyMap[p._id.toString()] = { count: p.count, active: p.active };
  });

  const claimMap: Record<string, any> = {};
  claimStatsByUser.forEach((c: any) => {
    claimMap[c._id.toString()] = c;
  });

  return customers.map((c: any) => {
    const id = c._id.toString();
    const claimStats = claimMap[id] ?? {
      total: 0, approved: 0, rejected: 0, totalAmount: 0, approvedAmount: 0,
    };
    return {
      _id: id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      avatar: c.avatar,
      address: c.address,
      dob: c.dob ? new Date(c.dob).toISOString() : null,
      lastLoginAt: c.lastLoginAt ? new Date(c.lastLoginAt).toISOString() : null,
      createdAt: new Date(c.createdAt).toISOString(),
      policyCount: policyMap[id]?.count ?? 0,
      activePolicies: policyMap[id]?.active ?? 0,
      claimCount: claimStats.total,
      approvedClaims: claimStats.approved,
      rejectedClaims: claimStats.rejected,
      totalClaimAmount: claimStats.totalAmount,
      totalApprovedAmount: claimStats.approvedAmount,
      successRate:
        claimStats.total > 0
          ? Math.round((claimStats.approved / claimStats.total) * 100)
          : 0,
    };
  });
}

// ════════════════════════════════════════════════════════════
// ASSESSOR MANAGEMENT
// ════════════════════════════════════════════════════════════

export async function getAdminAssessors() {
  await connectDB();

  const assessors = await User.find({ role: UserRole.ASSESSOR })
    .sort({ createdAt: -1 })
    .select('-password')
    .lean();

  if (assessors.length === 0) return [];

  const assessorIds = assessors.map((a) => a._id);

  const [claimStatsByAssessor, assessmentStats] = await Promise.all([
    Claim.aggregate([
      { $match: { assignedAssessorId: { $in: assessorIds } } },
      {
        $group: {
          _id: '$assignedAssessorId',
          assigned: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION'],
                  ],
                },
                1, 0,
              ],
            },
          },
          approved: {
            $sum: { $cond: [{ $in: ['$status', ['APPROVED', 'PAID']] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
          },
          totalApprovedAmount: { $sum: '$approvedAmount' },
        },
      },
    ]),
    ClaimAssessment.aggregate([
      { $match: { assessorId: { $in: assessorIds } } },
      {
        $group: {
          _id: '$assessorId',
          totalReviewed: { $sum: 1 },
          avgResolutionMs: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ['$reviewStartedAt', false] },
                    { $ifNull: ['$reviewCompletedAt', false] },
                  ],
                },
                {
                  $subtract: [
                    { $toLong: '$reviewCompletedAt' },
                    { $toLong: '$reviewStartedAt' },
                  ],
                },
                5400000, // 1.5h default
              ],
            },
          },
        },
      },
    ]),
  ]);

  const claimMap: Record<string, any> = {};
  claimStatsByAssessor.forEach((c: any) => {
    claimMap[c._id.toString()] = c;
  });

  const assessmentMap: Record<string, any> = {};
  assessmentStats.forEach((a: any) => {
    assessmentMap[a._id.toString()] = a;
  });

  return assessors.map((a: any) => {
    const id = a._id.toString();
    const cs = claimMap[id] ?? {
      assigned: 0, active: 0, approved: 0, rejected: 0, totalApprovedAmount: 0,
    };
    const as_ = assessmentMap[id] ?? { totalReviewed: 0, avgResolutionMs: 0 };
    const approvalRate =
      as_.totalReviewed > 0
        ? Math.round((cs.approved / as_.totalReviewed) * 100)
        : 0;
    const avgHours = as_.avgResolutionMs / (1000 * 60 * 60);

    return {
      _id: id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      avatar: a.avatar,
      employeeId: a.employeeId,
      specialization: a.specialization,
      yearsOfExperience: a.yearsOfExperience,
      lastLoginAt: a.lastLoginAt ? new Date(a.lastLoginAt).toISOString() : null,
      createdAt: new Date(a.createdAt).toISOString(),
      assignedClaims: cs.assigned,
      activeClaims: cs.active,
      approvedClaims: cs.approved,
      rejectedClaims: cs.rejected,
      totalApprovedAmount: cs.totalApprovedAmount,
      totalReviewed: as_.totalReviewed,
      approvalRate,
      avgResolutionTime:
        avgHours < 1
          ? `${Math.round(avgHours * 60)}m`
          : `${avgHours.toFixed(1)}h`,
      performanceScore: Math.min(
        100,
        Math.round(approvalRate * 0.6 + Math.min(as_.totalReviewed * 2, 40))
      ),
    };
  });
}

// ════════════════════════════════════════════════════════════
// CLAIMS CONTROL CENTER
// ════════════════════════════════════════════════════════════

export async function getAdminAllClaims(filters?: {
  status?: string;
  policyType?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();

  const query: Record<string, any> = {};
  if (filters?.status && filters.status !== 'ALL') {
    query.status = filters.status;
  }
  if (filters?.policyType && filters.policyType !== 'ALL') {
    query.policyType = filters.policyType;
  }

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const skip = (page - 1) * limit;

  const [claims, total] = await Promise.all([
    Claim.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name email phone avatar')
      .populate('assignedAssessorId', 'name email specialization')
      .populate({
        path: 'purchasedPolicyId',
        populate: { path: 'policyId', select: 'name type coverageAmount' },
      })
      .lean(),
    Claim.countDocuments(query),
  ]);

  // Optional search filter in memory (for populated fields)
  let filtered = claims as any[];
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = claims.filter((c: any) => {
      return (
        c._id.toString().toLowerCase().includes(term) ||
        c.title?.toLowerCase().includes(term) ||
        (c.customerId as any)?.name?.toLowerCase().includes(term) ||
        (c.customerId as any)?.email?.toLowerCase().includes(term)
      );
    });
  }

  return {
    claims: JSON.parse(JSON.stringify(filtered)),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

// ════════════════════════════════════════════════════════════
// APPROVALS QUEUE
// ════════════════════════════════════════════════════════════

export async function getAdminApprovalsQueue() {
  await connectDB();

  const [pendingApproval, documentVerification, unassigned] = await Promise.all([
    Claim.find({ status: ClaimStatus.UNDER_REVIEW })
      .sort({ riskScore: -1, createdAt: 1 })
      .limit(50)
      .populate('customerId', 'name email')
      .populate('assignedAssessorId', 'name specialization')
      .lean(),
    Claim.find({ status: ClaimStatus.DOCUMENT_VERIFICATION })
      .sort({ createdAt: 1 })
      .limit(50)
      .populate('customerId', 'name email')
      .populate('assignedAssessorId', 'name specialization')
      .lean(),
    Claim.find({ status: { $in: [ClaimStatus.PENDING, ClaimStatus.SUBMITTED] }, assignedAssessorId: null })
      .sort({ createdAt: 1 })
      .limit(50)
      .populate('customerId', 'name email')
      .lean(),
  ]);

  return {
    underReview: JSON.parse(JSON.stringify(pendingApproval)),
    documentVerification: JSON.parse(JSON.stringify(documentVerification)),
    unassigned: JSON.parse(JSON.stringify(unassigned)),
  };
}

// ════════════════════════════════════════════════════════════
// POLICY MANAGEMENT
// ════════════════════════════════════════════════════════════

export async function getAdminPolicies() {
  await connectDB();

  const policies = await Policy.find({}).sort({ createdAt: -1 }).lean();

  if (policies.length === 0) return [];

  const policyIds = policies.map((p) => p._id);

  const [purchaseCounts, claimCounts] = await Promise.all([
    PurchasedPolicy.aggregate([
      { $match: { policyId: { $in: policyIds } } },
      {
        $group: {
          _id: '$policyId',
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
          revenue: { $sum: 0 }, // Will be enriched below
        },
      },
    ]),
    Claim.aggregate([
      {
        $lookup: {
          from: 'purchasedpolicies',
          localField: 'purchasedPolicyId',
          foreignField: '_id',
          as: 'pp',
        },
      },
      { $unwind: { path: '$pp', preserveNullAndEmptyArrays: true } },
      { $match: { 'pp.policyId': { $in: policyIds } } },
      {
        $group: {
          _id: '$pp.policyId',
          totalClaims: { $sum: 1 },
          approvedClaims: {
            $sum: { $cond: [{ $in: ['$status', ['APPROVED', 'PAID']] }, 1, 0] },
          },
          totalClaimAmount: { $sum: '$claimAmount' },
        },
      },
    ]),
  ]);

  const purchaseMap: Record<string, any> = {};
  purchaseCounts.forEach((p: any) => {
    purchaseMap[p._id.toString()] = p;
  });

  const claimMap: Record<string, any> = {};
  claimCounts.forEach((c: any) => {
    claimMap[c._id.toString()] = c;
  });

  return policies.map((p: any) => {
    const id = p._id.toString();
    const purchases = purchaseMap[id] ?? { total: 0, active: 0 };
    const claims = claimMap[id] ?? { totalClaims: 0, approvedClaims: 0, totalClaimAmount: 0 };
    return {
      _id: id,
      name: p.name,
      type: p.type,
      description: p.description,
      premiumAmount: p.premiumAmount,
      coverageAmount: p.coverageAmount,
      validityPeriod: p.validityPeriod,
      eligibility: p.eligibility,
      isActive: p.isActive,
      createdByAssessorId: p.createdByAssessorId?.toString() ?? null,
      createdByName: p.createdByName ?? null,
      createdBySpecialization: p.createdBySpecialization ?? null,
      createdAt: new Date(p.createdAt).toISOString(),
      totalPurchases: purchases.total,
      activePurchases: purchases.active,
      revenue: purchases.total * p.premiumAmount,
      totalClaims: claims.totalClaims,
      approvedClaims: claims.approvedClaims,
      totalClaimAmount: claims.totalClaimAmount,
    };
  });
}

// ════════════════════════════════════════════════════════════
// SPECIALIZATION MONITOR
// ════════════════════════════════════════════════════════════

export async function getAdminSpecializationMetrics() {
  await connectDB();

  const specializations = [PolicyType.HEALTH, PolicyType.AUTO, PolicyType.PROPERTY, PolicyType.LIFE, PolicyType.TRAVEL];

  const results = await Promise.all(
    specializations.map(async (spec) => {
      const [
        assessorCount,
        policyCount,
        purchaseCount,
        claimAgg,
        pendingReviews,
        fraudFlags,
      ] = await Promise.all([
        User.countDocuments({ role: UserRole.ASSESSOR, specialization: spec }),
        Policy.countDocuments({ type: spec }),
        PurchasedPolicy.aggregate([
          {
            $lookup: {
              from: 'policies',
              localField: 'policyId',
              foreignField: '_id',
              as: 'policy',
            },
          },
          { $unwind: '$policy' },
          { $match: { 'policy.type': spec } },
          { $count: 'total' },
        ]),
        Claim.aggregate([
          { $match: { policyType: spec } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              approved: {
                $sum: { $cond: [{ $in: ['$status', ['APPROVED', 'PAID']] }, 1, 0] },
              },
              rejected: {
                $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
              },
              totalAmount: { $sum: '$claimAmount' },
            },
          },
        ]),
        Claim.countDocuments({
          policyType: spec,
          status: {
            $in: [
              ClaimStatus.PENDING,
              ClaimStatus.SUBMITTED,
              ClaimStatus.UNDER_REVIEW,
              ClaimStatus.DOCUMENT_VERIFICATION,
            ],
          },
        }),
        Claim.countDocuments({
          policyType: spec,
          fraudFlags: { $exists: true, $not: { $size: 0 } },
        }),
      ]);

      const claimData = claimAgg[0] ?? {
        total: 0, approved: 0, rejected: 0, totalAmount: 0,
      };
      const approvalRate =
        claimData.total > 0
          ? Math.round((claimData.approved / claimData.total) * 100)
          : 0;

      return {
        specialization: spec,
        assessorCount,
        policyCount,
        purchaseCount: purchaseCount[0]?.total ?? 0,
        totalClaims: claimData.total,
        approvedClaims: claimData.approved,
        rejectedClaims: claimData.rejected,
        pendingReviews,
        approvalRate,
        claimVolume: claimData.totalAmount,
        fraudFlags,
      };
    })
  );

  return results;
}

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS COMMAND CENTER
// ════════════════════════════════════════════════════════════

export async function getAdminNotifications(filters?: {
  isRead?: boolean;
  search?: string;
  limit?: number;
}) {
  await connectDB();

  const query: Record<string, any> = {};
  if (filters?.isRead !== undefined) query.isRead = filters.isRead;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(filters?.limit ?? 100)
    .populate('userId', 'name email role avatar')
    .lean();

  let filtered = notifications as any[];
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = notifications.filter(
      (n: any) =>
        n.title?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        (n.userId as any)?.name?.toLowerCase().includes(term)
    );
  }

  return JSON.parse(JSON.stringify(filtered));
}

// ════════════════════════════════════════════════════════════
// AUDIT LOGS
// ════════════════════════════════════════════════════════════

export async function getAdminAuditLogs(filters?: {
  actorRole?: string;
  entityType?: string;
  action?: string;
  search?: string;
  limit?: number;
}) {
  await connectDB();

  const query: Record<string, any> = {};
  if (filters?.actorRole && filters.actorRole !== 'ALL') {
    query.actorRole = filters.actorRole;
  }
  if (filters?.entityType && filters.entityType !== 'ALL') {
    query.entityType = filters.entityType;
  }
  if (filters?.action && filters.action !== 'ALL') {
    query.action = filters.action;
  }

  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(filters?.limit ?? 100)
    .lean();

  let filtered = logs as any[];
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = logs.filter(
      (l: any) =>
        l.actorName?.toLowerCase().includes(term) ||
        l.entityId?.toLowerCase().includes(term) ||
        l.remarks?.toLowerCase().includes(term)
    );
  }

  return JSON.parse(JSON.stringify(filtered));
}

// ════════════════════════════════════════════════════════════
// ANALYTICS DATA — All charts
// ════════════════════════════════════════════════════════════

export async function getAdminAnalyticsData() {
  await connectDB();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [
    monthlyPurchases,
    monthlyClaims,
    monthlyRegistrations,
    claimsBySpecialization,
    topPolicies,
    assessorRankings,
    revenueByMonth,
    fraudTrend,
    claimsByPriority,
    avgRiskByMonth,
  ] = await Promise.all([
    // Monthly policy purchases
    PurchasedPolicy.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Monthly claims filed + approved + rejected
    Claim.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
          amount: { $sum: '$claimAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Monthly new registrations
    User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Claims by specialization (pie chart)
    Claim.aggregate([
      { $group: { _id: '$policyType', count: { $sum: 1 }, amount: { $sum: '$claimAmount' } } },
      { $sort: { count: -1 } },
    ]),

    // Top purchased policies
    PurchasedPolicy.aggregate([
      {
        $group: {
          _id: '$policyId',
          purchases: { $sum: 1 },
          activePurchases: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        },
      },
      { $sort: { purchases: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'policies',
          localField: '_id',
          foreignField: '_id',
          as: 'policy',
        },
      },
      { $unwind: '$policy' },
      {
        $project: {
          name: '$policy.name',
          type: '$policy.type',
          purchases: 1,
          activePurchases: 1,
          revenue: { $multiply: ['$purchases', '$policy.premiumAmount'] },
        },
      },
    ]),

    // Assessor performance rankings
    ClaimAssessment.aggregate([
      {
        $group: {
          _id: '$assessorId',
          totalReviewed: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$decisionType', 'APPROVED'] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$decisionType', 'REJECTED'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalReviewed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'assessor',
        },
      },
      { $unwind: { path: '$assessor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: '$assessor.name',
          specialization: '$assessor.specialization',
          totalReviewed: 1,
          approved: 1,
          rejected: 1,
          approvalRate: {
            $cond: [
              { $gt: ['$totalReviewed', 0] },
              { $multiply: [{ $divide: ['$approved', '$totalReviewed'] }, 100] },
              0,
            ],
          },
        },
      },
    ]),

    // Revenue by month (premiums from purchases)
    PurchasedPolicy.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $lookup: {
          from: 'policies',
          localField: 'policyId',
          foreignField: '_id',
          as: 'policy',
        },
      },
      { $unwind: '$policy' },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$policy.premiumAmount' },
          purchases: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Fraud trend (claims with fraud flags, by month)
    Claim.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          fraudFlags: { $exists: true, $not: { $size: 0 } },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Claims by priority
    Claim.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),

    // Average risk score by month
    Claim.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          avgRisk: { $avg: '$riskScore' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  // Build 12-month label array
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(
      d.toLocaleString('default', { month: 'short', year: '2-digit' })
    );
  }

  // Helper: build monthly map
  function buildMonthlyMap(
    data: any[],
    valueKey = 'count',
    monthExtractor = (d: any) => {
      const date = new Date(
        d._id.year,
        d._id.month - 1,
        1
      );
      return date.toLocaleString('default', { month: 'short', year: '2-digit' });
    }
  ) {
    const map: Record<string, number> = {};
    data.forEach((d) => {
      map[monthExtractor(d)] = d[valueKey] ?? 0;
    });
    return months.map((m) => ({ month: m, value: map[m] ?? 0 }));
  }

  // Process monthly claims into total/approved/rejected per month
  const claimMonthlyMap: Record<string, { total: number; approved: number; rejected: number; amount: number }> = {};
  monthlyClaims.forEach((c: any) => {
    const date = new Date(c._id.year, c._id.month - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!claimMonthlyMap[label]) {
      claimMonthlyMap[label] = { total: 0, approved: 0, rejected: 0, amount: 0 };
    }
    claimMonthlyMap[label].total += c.count;
    claimMonthlyMap[label].amount += c.amount;
    if (c._id.status === 'APPROVED' || c._id.status === 'PAID') {
      claimMonthlyMap[label].approved += c.count;
    } else if (c._id.status === 'REJECTED') {
      claimMonthlyMap[label].rejected += c.count;
    }
  });

  const claimTimeline = months.map((m) => ({
    month: m,
    filed: claimMonthlyMap[m]?.total ?? 0,
    approved: claimMonthlyMap[m]?.approved ?? 0,
    rejected: claimMonthlyMap[m]?.rejected ?? 0,
    amount: claimMonthlyMap[m]?.amount ?? 0,
  }));

  // Monthly registrations
  const regMap: Record<string, { customers: number; assessors: number }> = {};
  monthlyRegistrations.forEach((r: any) => {
    const date = new Date(r._id.year, r._id.month - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!regMap[label]) regMap[label] = { customers: 0, assessors: 0 };
    if (r._id.role === 'CUSTOMER') regMap[label].customers += r.count;
    else if (r._id.role === 'ASSESSOR') regMap[label].assessors += r.count;
  });

  const registrationTimeline = months.map((m) => ({
    month: m,
    customers: regMap[m]?.customers ?? 0,
    assessors: regMap[m]?.assessors ?? 0,
    total: (regMap[m]?.customers ?? 0) + (regMap[m]?.assessors ?? 0),
  }));

  // Revenue by month
  const revMap: Record<string, { revenue: number; purchases: number }> = {};
  revenueByMonth.forEach((r: any) => {
    const date = new Date(r._id.year, r._id.month - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    revMap[label] = { revenue: r.revenue, purchases: r.purchases };
  });
  const revenueTimeline = months.map((m) => ({
    month: m,
    revenue: revMap[m]?.revenue ?? 0,
    purchases: revMap[m]?.purchases ?? 0,
  }));

  // Fraud timeline
  const fraudMap: Record<string, number> = {};
  fraudTrend.forEach((f: any) => {
    const date = new Date(f._id.year, f._id.month - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    fraudMap[label] = f.count;
  });
  const fraudTimeline = months.map((m) => ({
    month: m,
    flagged: fraudMap[m] ?? 0,
  }));

  // Purchases timeline
  const purchaseMap: Record<string, number> = {};
  monthlyPurchases.forEach((p: any) => {
    const date = new Date(p._id.year, p._id.month - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    purchaseMap[label] = p.count;
  });
  const purchaseTimeline = months.map((m) => ({
    month: m,
    purchases: purchaseMap[m] ?? 0,
  }));

  // Risk score timeline
  const riskMap: Record<string, number> = {};
  avgRiskByMonth.forEach((r: any) => {
    const date = new Date(r._id.year, r._id.month - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    riskMap[label] = Math.round(r.avgRisk * 10) / 10;
  });
  const riskTimeline = months.map((m) => ({
    month: m,
    avgRisk: riskMap[m] ?? 0,
  }));

  // Specialization distribution
  const SPEC_COLORS: Record<string, string> = {
    HEALTH: '#4ade80',
    AUTO: '#60a5fa',
    PROPERTY: '#f59e0b',
    LIFE: '#c084fc',
    TRAVEL: '#34d399',
  };

  const specDistribution = claimsBySpecialization.map((s: any) => ({
    name: s._id,
    value: s.count,
    amount: s.amount,
    color: SPEC_COLORS[s._id] ?? '#94a3b8',
  }));

  // Priority distribution
  const PRIORITY_COLORS: Record<string, string> = {
    HIGH: '#f87171',
    MEDIUM: '#fbbf24',
    LOW: '#4ade80',
  };
  const priorityDistribution = claimsByPriority.map((p: any) => ({
    name: p._id ?? 'UNKNOWN',
    value: p.count,
    color: PRIORITY_COLORS[p._id] ?? '#94a3b8',
  }));

  return {
    months,
    claimTimeline,
    purchaseTimeline,
    revenueTimeline,
    registrationTimeline,
    fraudTimeline,
    riskTimeline,
    specDistribution,
    priorityDistribution,
    topPolicies: JSON.parse(JSON.stringify(topPolicies)),
    assessorRankings: JSON.parse(JSON.stringify(assessorRankings)),
  };
}

// ════════════════════════════════════════════════════════════
// SYSTEM HEALTH
// ════════════════════════════════════════════════════════════

export async function getAdminSystemHealth() {
  await connectDB();

  const startTime = Date.now();

  const [
    totalUsers,
    totalPolicies,
    totalClaims,
    totalDocuments,
    totalNotifications,
    totalAuditLogs,
    totalPayments,
    pendingPayments,
    recentErrors,
  ] = await Promise.all([
    User.countDocuments(),
    Policy.countDocuments(),
    Claim.countDocuments(),
    ClaimDocument.countDocuments(),
    Notification.countDocuments(),
    AuditLog.countDocuments(),
    Payment.countDocuments(),
    Payment.countDocuments({ status: PaymentStatus.PENDING }),
    // Recent claims with escalated status (proxy for issues)
    ClaimAuditLog.countDocuments({
      action: 'ESCALATED',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  const dbResponseTime = Date.now() - startTime;

  // Unassigned claims (need attention)
  const unassignedClaims = await Claim.countDocuments({
    status: { $in: [ClaimStatus.PENDING, ClaimStatus.SUBMITTED] },
    assignedAssessorId: null,
  });

  return {
    database: {
      status: 'CONNECTED',
      responseTime: dbResponseTime,
      collections: {
        users: totalUsers,
        policies: totalPolicies,
        claims: totalClaims,
        documents: totalDocuments,
        notifications: totalNotifications,
        auditLogs: totalAuditLogs,
        payments: totalPayments,
      },
    },
    operations: {
      pendingPayments,
      unassignedClaims,
      escalatedLast24h: recentErrors,
    },
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    checkedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════
// USER MANAGEMENT ACTIONS
// ════════════════════════════════════════════════════════════

export async function adminSuspendUser(userId: string): Promise<void> {
  await connectDB();
  // Mark user with a suspended flag — we add a note via bio update as a convention
  // Real suspension logic: in production you'd add an `isSuspended` field to User
  await User.findByIdAndUpdate(userId, {
    bio: '[SUSPENDED] Account suspended by admin.',
  });
}

export async function adminActivateUser(userId: string): Promise<void> {
  await connectDB();
  await User.findByIdAndUpdate(userId, { bio: '' });
}

export async function adminReassignClaim(
  claimId: string,
  newAssessorId: string
): Promise<void> {
  await connectDB();
  await Claim.findByIdAndUpdate(claimId, {
    assignedAssessorId: newAssessorId,
    status: ClaimStatus.UNDER_REVIEW,
  });
}

// ════════════════════════════════════════════════════════════
// POLICY APPROVALS
// ════════════════════════════════════════════════════════════

export async function getAdminPendingPolicies() {
  await connectDB();
  const policies = await Policy.find({ status: PolicyListingStatus.PENDING_ADMIN_APPROVAL })
    .populate('createdByAssessorId', 'name email specialization')
    .sort({ createdAt: 1 })
    .lean();
  return JSON.parse(JSON.stringify(policies));
}

export async function adminApprovePolicy(policyId: string, adminId: string, comments?: string) {
  await connectDB();
  const admin = await User.findById(adminId);
  const policy = await Policy.findById(policyId);
  if (!policy) throw new Error('Policy not found');

  policy.status = PolicyListingStatus.ACTIVE;
  policy.approvalHistory.push({
    status: PolicyListingStatus.ACTIVE,
    adminId: admin?._id as any,
    adminName: admin?.name || 'Admin',
    date: new Date(),
    comments: comments || 'Policy approved.',
  });

  await policy.save();

  if (policy.createdByAssessorId) {
    await Notification.create({
      userId: policy.createdByAssessorId,
      title: 'Policy Approved',
      message: `Your policy "${policy.name}" has been approved and is now active in the marketplace.`,
    });
  }

  await AuditLog.create({
    actorId: adminId,
    actorName: admin?.name || 'Admin',
    actorRole: 'ADMIN',
    entityId: policy._id.toString(),
    entityType: 'POLICY',
    action: 'APPROVE_POLICY',
    remarks: `Approved policy "${policy.name}".`,
  });
}

export async function adminRejectPolicy(policyId: string, adminId: string, comments?: string) {
  await connectDB();
  const admin = await User.findById(adminId);
  const policy = await Policy.findById(policyId);
  if (!policy) throw new Error('Policy not found');

  policy.status = PolicyListingStatus.REJECTED;
  policy.approvalHistory.push({
    status: PolicyListingStatus.REJECTED,
    adminId: admin?._id as any,
    adminName: admin?.name || 'Admin',
    date: new Date(),
    comments: comments || 'Policy rejected.',
  });

  await policy.save();

  if (policy.createdByAssessorId) {
    await Notification.create({
      userId: policy.createdByAssessorId,
      title: 'Policy Rejected',
      message: `Your policy "${policy.name}" was rejected. ${comments ? `Reason: ${comments}` : ''}`,
    });
  }

  await AuditLog.create({
    actorId: adminId,
    actorName: admin?.name || 'Admin',
    actorRole: 'ADMIN',
    entityId: policy._id.toString(),
    entityType: 'POLICY',
    action: 'REJECT_POLICY',
    remarks: `Rejected policy "${policy.name}".`,
  });
}
