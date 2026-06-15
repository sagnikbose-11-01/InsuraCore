'use server';
// ============================================================
// services/claim.service.ts
// Claim business logic: filing, document management,
// assessor assignment, assessment submission, status progression.
// ============================================================

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import Claim, { IClaim } from '@/models/Claim';
import ClaimDocument from '@/models/ClaimDocument';
import ClaimAssessment from '@/models/ClaimAssessment';
import Notification from '@/models/Notification';
import Policy from '@/models/Policy';
import PurchasedPolicy from '@/models/PurchasedPolicy';
import Payment, { IPayment } from '@/models/Payment';
import ClaimAuditLog from '@/models/ClaimAuditLog';
import AuditLog from '@/models/AuditLog';
import { CreateClaimInput, AssessmentInput, AssignAssessorInput } from '@/lib/validators/claim.validators';
import { ClaimStatus, DocumentStatus, PolicyType, PaymentStatus, UserRole } from '@/lib/constants/enums';
import { SerializedClaim, SerializedClaimDocument, SerializedClaimAssessment, ClaimsAnalytics, SerializedPayment, SerializedNotification } from '@/types';

// ---- Customer Actions ----

export async function createClaim(
  customerId: string,
  input: CreateClaimInput
): Promise<SerializedClaim> {
  await connectDB();

  const purchasedPolicy = await PurchasedPolicy.findById(input.purchasedPolicyId).populate('policyId');
  if (!purchasedPolicy) {
    throw new Error('Purchased policy not found');
  }
  const policy = purchasedPolicy.policyId as any;
  if (!policy || !policy.type) {
    throw new Error('Policy type not found on policy template');
  }
  const policyType = policy.type as PolicyType;

  // ---- Least-Workload Auto-Assignment Engine ----
  // Find all assessors with matching specialization
  const matchingAssessors = await User.find({ 
    role: UserRole.ASSESSOR, 
    specialization: policyType 
  }).select('_id name').lean() as { _id: mongoose.Types.ObjectId; name: string }[];

  let assignedAssessorId: mongoose.Types.ObjectId | null = null;
  let assignedAssessorName: string | null = null;

  if (matchingAssessors.length > 0) {
    // Count active claims per assessor (not APPROVED, REJECTED, or PAID)
    const activeCounts = await Promise.all(
      matchingAssessors.map(async (a) => ({
        assessorId: a._id,
        assessorName: a.name,
        count: await Claim.countDocuments({
          assignedAssessorId: a._id,
          status: { $nin: [ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.PAID] },
        }),
      }))
    );

    // Pick assessor with fewest active claims
    activeCounts.sort((a, b) => a.count - b.count);
    const selected = activeCounts[0];
    assignedAssessorId = selected.assessorId;
    assignedAssessorName = selected.assessorName;
  }

  const claim = await Claim.create({
    customerId,
    purchasedPolicyId: input.purchasedPolicyId,
    title: input.title,
    description: input.description,
    incidentDate: new Date(input.incidentDate),
    claimAmount: input.claimAmount,
    status: assignedAssessorId ? ClaimStatus.UNDER_REVIEW : ClaimStatus.SUBMITTED,
    policyType,
    assignedAssessorId,
  });

  // Notify customer
  await Notification.create({
    userId: customerId,
    title: 'Claim Submitted',
    message: assignedAssessorId
      ? `Your claim "${input.title}" has been submitted and automatically assigned to Assessor ${assignedAssessorName} for review.`
      : `Your claim "${input.title}" has been submitted and is pending assignment to an assessor.`,
    claimId: claim._id,
    metadata: {
      type: 'CLAIM_SUBMISSION',
      claimTitle: input.title,
      assessorName: assignedAssessorName || undefined,
      timestamp: new Date().toISOString(),
    },
  });

  // Notify auto-assigned assessor
  if (assignedAssessorId) {
    await Notification.create({
      userId: assignedAssessorId,
      title: 'New Claim Assigned',
      message: `A new ${policyType} claim "${input.title}" has been auto-assigned to you for review.`,
      claimId: claim._id,
      metadata: {
        type: 'CLAIM_ASSIGNED',
        claimTitle: input.title,
        timestamp: new Date().toISOString(),
      },
    });

    // Audit log for auto-assignment
    await ClaimAuditLog.create({
      claimId: claim._id,
      assessorId: assignedAssessorId,
      customerId: new mongoose.Types.ObjectId(customerId),
      action: 'REVIEW_STARTED',
      remarks: `Claim auto-assigned to Assessor ${assignedAssessorName} via least-workload engine.`,
      previousStatus: ClaimStatus.SUBMITTED,
      newStatus: ClaimStatus.UNDER_REVIEW,
    });
  }

  // Enterprise AuditLog: claim submission
  const customer = await User.findById(customerId).select('name').lean() as { name: string } | null;
  await AuditLog.create({
    actorId: customerId,
    actorName: customer?.name ?? 'Customer',
    actorRole: 'CUSTOMER',
    entityId: claim._id.toString(),
    entityType: 'CLAIM',
    action: 'CLAIM_SUBMISSION',
    remarks: `Filed ${policyType} claim "${input.title}" for ₹${input.claimAmount.toLocaleString('en-IN')}.`,
  });

  return serializeClaim(claim);
}



export async function getMyClaimsWithDetails(customerId: string): Promise<SerializedClaim[]> {
  await connectDB();
  const claims = await Claim.find({ customerId })
    .populate('purchasedPolicyId')
    .populate('assignedAssessorId', 'name email')
    .sort({ createdAt: -1 });

  return claims.map(serializeClaim);
}

export async function getClaimById(claimId: string): Promise<SerializedClaim | null> {
  await connectDB();
  const claim = await Claim.findById(claimId)
    .populate({ path: 'purchasedPolicyId', populate: { path: 'policyId' } })
    .populate('customerId', 'name email phone')
    .populate('assignedAssessorId', 'name email');

  return claim ? serializeClaim(claim) : null;
}

export async function getClaimDocuments(claimId: string): Promise<SerializedClaimDocument[]> {
  await connectDB();
  const docs = await ClaimDocument.find({ claimId }).sort({ createdAt: -1 });
  return docs.map(serializeDocument);
}

export async function addClaimDocument(
  claimId: string,
  documentName: string,
  documentUrl: string
): Promise<SerializedClaimDocument> {
  await connectDB();
  const doc = await ClaimDocument.create({ claimId, documentName, documentUrl });
  
  const claim = await Claim.findById(claimId).select('customerId status assignedAssessorId title policyType');
  if (claim) {
    await logClaimAudit(
      claimId,
      null,
      claim.customerId.toString(),
      'CUSTOMER_RESPONDED',
      `Uploaded document: ${documentName}`,
      claim.status,
      claim.status
    );

    // Notify assigned assessor about new evidence upload
    if (claim.assignedAssessorId) {
      const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;
      await Notification.create({
        userId: claim.assignedAssessorId,
        title: 'New Evidence Uploaded',
        message: `The customer has uploaded "${documentName}" for ${claim.policyType || 'insurance'} claim ${claimRef} ("${claim.title || 'Claim'}"). Please review the new evidence.`,
        claimId: claim._id,
        metadata: {
          type: 'DOCUMENT_UPLOADED',
          claimTitle: claim.title,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
  
  return serializeDocument(doc);
}


// ---- Admin Actions ----

export async function getAllClaims(filters?: {
  status?: ClaimStatus;
  page?: number;
  limit?: number;
}): Promise<{ claims: SerializedClaim[]; total: number }> {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const skip = (page - 1) * limit;

  const [claims, total] = await Promise.all([
    Claim.find(query)
      .populate('customerId', 'name email')
      .populate('assignedAssessorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Claim.countDocuments(query),
  ]);

  return { claims: claims.map(serializeClaim), total };
}

export async function assignAssessor(input: AssignAssessorInput): Promise<SerializedClaim> {
  await connectDB();

  const claim = await Claim.findByIdAndUpdate(
    input.claimId,
    {
      assignedAssessorId: input.assessorId,
      status: ClaimStatus.UNDER_REVIEW,
    },
    { new: true }
  );

  if (!claim) throw new Error('Claim not found');

  // Notify the assessor
  await Notification.create({
    userId: input.assessorId,
    message: `You have been assigned to review claim: "${claim.title}"`,
  });

  return serializeClaim(claim);
}

// ---- Assessor Actions ----

export async function getAssignedClaims(assessorId: string): Promise<SerializedClaim[]> {
  await connectDB();
  const claims = await Claim.find({ assignedAssessorId: assessorId })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 });
  return claims.map(serializeClaim);
}

export async function submitAssessment(
  assessorId: string,
  input: AssessmentInput
): Promise<SerializedClaim> {
  return submitClaimDecision(
    input.claimId,
    assessorId,
    input.decision,
    input.approvedAmount,
    input.remarks,
    'Submitted claim decision.'
  );
}

async function ensureClaimPolicyType(claim: IClaim) {
  if (!claim.policyType) {
    const pp = claim.purchasedPolicyId as any;
    if (pp && pp.policyId && typeof pp.policyId === 'object' && pp.policyId.type) {
      claim.policyType = pp.policyId.type;
    } else {
      const purchasedPolicy = await PurchasedPolicy.findById(claim.purchasedPolicyId).populate('policyId');
      const policy = purchasedPolicy?.policyId as any;
      if (policy && policy.type) {
        claim.policyType = policy.type;
      } else {
        claim.policyType = PolicyType.PROPERTY; // fallback
      }
    }
  }
}

async function logClaimAudit(
  claimId: string,
  assessorId: string | null,
  customerId: string,
  action: 'REVIEW_STARTED' | 'DOCUMENT_REQUESTED' | 'NOTE_ADDED' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CUSTOMER_RESPONDED',
  remarks = '',
  previousStatus = '',
  newStatus = ''
) {
  await connectDB();
  await ClaimAuditLog.create({
    claimId: new mongoose.Types.ObjectId(claimId),
    assessorId: assessorId ? new mongoose.Types.ObjectId(assessorId) : null,
    customerId: new mongoose.Types.ObjectId(customerId),
    action,
    remarks,
    previousStatus,
    newStatus,
  });
}

export async function startClaimReview(claimId: string, assessorId: string): Promise<SerializedClaim> {
  await connectDB();
  const assessor = await User.findById(assessorId).select('name');
  if (!assessor) throw new Error('Assessor not found');

  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');

  const previousStatus = claim.status;
  claim.assignedAssessorId = new mongoose.Types.ObjectId(assessorId);
  claim.status = ClaimStatus.UNDER_REVIEW;
  
  claim.notes.push({
    authorId: new mongoose.Types.ObjectId(assessorId),
    authorName: assessor.name,
    text: 'Claim review started. Status set to Under Review.',
    isInternal: true,
    createdAt: new Date()
  });

  await ensureClaimPolicyType(claim);

  await claim.save();

  // Create assessment with reviewStartedAt
  await ClaimAssessment.create({
    claimId: claim._id,
    assessorId: new mongoose.Types.ObjectId(assessorId),
    remarks: 'Review started',
    approvedAmount: 0,
    reviewStartedAt: new Date(),
  });

  await logClaimAudit(
    claimId,
    assessorId,
    claim.customerId.toString(),
    'REVIEW_STARTED',
    'Claim review started. Status set to Under Review.',
    previousStatus,
    ClaimStatus.UNDER_REVIEW
  );

  // Notify customer: review has officially started
  const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;
  const policyType = claim.policyType || 'insurance';
  await Notification.create({
    userId: claim.customerId,
    title: 'Claim Review Started',
    message: `Assessor ${assessor.name} has started reviewing your ${policyType} claim ${claimRef} ("${claim.title}"). You will be notified once a decision is made.`,
    claimId: claim._id,
    metadata: {
      type: 'REVIEW_STARTED',
      assessorName: assessor.name,
      claimTitle: claim.title,
      timestamp: new Date().toISOString(),
    },
  });

  return serializeClaim(claim);
}

export async function requestClaimDocuments(
  claimId: string,
  assessorId: string,
  requestedDocs: string[],
  remarks: string
): Promise<SerializedClaim> {
  await connectDB();
  const assessor = await User.findById(assessorId).select('name');
  if (!assessor) throw new Error('Assessor not found');

  const claim = await Claim.findById(claimId).populate({
    path: 'purchasedPolicyId',
    populate: { path: 'policyId' }
  });
  if (!claim) throw new Error('Claim not found');

  const previousStatus = claim.status;
  claim.status = ClaimStatus.DOCUMENT_VERIFICATION;
  
  const text = `Requested additional documents: ${requestedDocs.join(', ')}. Remarks: ${remarks}`;
  
  claim.notes.push({
    authorId: new mongoose.Types.ObjectId(assessorId),
    authorName: assessor.name,
    text: text,
    isInternal: false,
    createdAt: new Date()
  });

  await ensureClaimPolicyType(claim);

  await claim.save();

  await ClaimAssessment.create({
    claimId: claim._id,
    assessorId: new mongoose.Types.ObjectId(assessorId),
    remarks: `Requested documents: ${requestedDocs.join(', ')}`,
    approvedAmount: 0,
    assessorRemarks: remarks,
    decisionReason: remarks,
    decisionType: 'DOCUMENT_REQUESTED',
    assessorName: assessor.name,
    decisionTimestamp: new Date(),
  });

  const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;
  const policyType = claim.policyType || 'General';
  const notificationMsg = `Your ${policyType} claim ${claimRef} ("${claim.title}") requires additional documents: ${requestedDocs.join(', ')}. Requested by Assessor ${assessor.name}.`;

  await Notification.create({
    userId: claim.customerId,
    title: 'Additional Documents Required',
    message: notificationMsg,
    claimId: claim._id,
    metadata: {
      type: 'REQUEST_DOCUMENTS',
      requestedDocuments: requestedDocs,
      assessorRemarks: remarks,
      claimId: claim._id.toString(),
      claimTitle: claim.title,
      assessorName: assessor.name,
      timestamp: new Date().toISOString()
    }
  });

  await logClaimAudit(
    claimId,
    assessorId,
    claim.customerId.toString(),
    'DOCUMENT_REQUESTED',
    text,
    previousStatus,
    ClaimStatus.DOCUMENT_VERIFICATION
  );

  return serializeClaim(claim);
}

export async function addClaimNote(
  claimId: string,
  assessorId: string,
  text: string,
  isInternal: boolean
): Promise<SerializedClaim> {
  await connectDB();
  const assessor = await User.findById(assessorId).select('name');
  if (!assessor) throw new Error('Assessor not found');

  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');

  claim.notes.push({
    authorId: new mongoose.Types.ObjectId(assessorId),
    authorName: assessor.name,
    text,
    isInternal,
    createdAt: new Date()
  });

  await ensureClaimPolicyType(claim);

  await claim.save();

  if (!isInternal) {
    const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;
    const policyType = claim.policyType || 'General';
    const notificationMsg = `New assessor note added to your ${policyType} claim ${claimRef} ("${claim.title}") by Assessor ${assessor.name}.`;
    await Notification.create({
      userId: claim.customerId,
      title: 'New Assessor Note',
      message: notificationMsg,
      claimId: claim._id,
      metadata: {
        type: 'ADD_NOTES',
        assessorRemarks: text,
        claimId: claim._id.toString(),
        claimTitle: claim.title,
        assessorName: assessor.name,
        timestamp: new Date().toISOString()
      }
    });
  }

  await logClaimAudit(
    claimId,
    assessorId,
    claim.customerId.toString(),
    'NOTE_ADDED',
    isInternal ? `Internal note added: ${text}` : `Customer-facing note added: ${text}`,
    claim.status,
    claim.status
  );

  return serializeClaim(claim);
}

export async function submitClaimDecision(
  claimId: string,
  assessorId: string,
  decision: 'APPROVED' | 'REJECTED',
  approvedAmount: number,
  customerRemarks: string,
  internalRemarks?: string
): Promise<SerializedClaim> {
  await connectDB();
  const assessor = await User.findById(assessorId).select('name');
  if (!assessor) throw new Error('Assessor not found');

  const claim = await Claim.findById(claimId).populate({
    path: 'purchasedPolicyId',
    populate: { path: 'policyId' }
  });
  if (!claim) throw new Error('Claim not found');

  const previousStatus = claim.status;
  const newStatus = decision === 'APPROVED' ? ClaimStatus.APPROVED : ClaimStatus.REJECTED;
  claim.status = newStatus;
  claim.approvedAmount = decision === 'APPROVED' ? approvedAmount : 0;

  if (customerRemarks) {
    claim.notes.push({
      authorId: new mongoose.Types.ObjectId(assessorId),
      authorName: assessor.name,
      text: `Customer-Facing Remarks: ${customerRemarks}`,
      isInternal: false,
      createdAt: new Date()
    });
  }
  if (internalRemarks) {
    claim.notes.push({
      authorId: new mongoose.Types.ObjectId(assessorId),
      authorName: assessor.name,
      text: `Internal Notes: ${internalRemarks}`,
      isInternal: true,
      createdAt: new Date()
    });
  }

  await ensureClaimPolicyType(claim);

  await claim.save();

  const latestAssessment = await ClaimAssessment.findOne({ claimId: claim._id, assessorId }).sort({ createdAt: -1 });
  if (latestAssessment && !latestAssessment.reviewCompletedAt) {
    latestAssessment.remarks = customerRemarks || 'Assessment completed';
    latestAssessment.approvedAmount = claim.approvedAmount;
    latestAssessment.reviewCompletedAt = new Date();
    latestAssessment.assessorRemarks = customerRemarks;
    latestAssessment.decisionReason = customerRemarks;
    latestAssessment.decisionType = decision;
    latestAssessment.assessorName = assessor.name;
    latestAssessment.decisionTimestamp = new Date();
    await latestAssessment.save();
  } else {
    await ClaimAssessment.create({
      claimId: claim._id,
      assessorId: new mongoose.Types.ObjectId(assessorId),
      remarks: customerRemarks || 'Assessment completed',
      approvedAmount: claim.approvedAmount,
      reviewStartedAt: new Date(Date.now() - 30 * 60 * 1000),
      reviewCompletedAt: new Date(),
      assessorRemarks: customerRemarks,
      decisionReason: customerRemarks,
      decisionType: decision,
      assessorName: assessor.name,
      decisionTimestamp: new Date(),
    });
  }

  const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;
  const policyType = claim.policyType || 'General';

  if (decision === 'APPROVED') {
    const notificationMsg = `Your ${policyType} claim ${claimRef} ("${claim.title}") has been approved by Assessor ${assessor.name}.`;
    await Notification.create({
      userId: claim.customerId,
      title: 'Claim Approved',
      message: notificationMsg,
      claimId: claim._id,
      metadata: {
        type: 'APPROVE',
        approvedAmount: approvedAmount,
        assessorRemarks: customerRemarks,
        claimId: claim._id.toString(),
        claimTitle: claim.title,
        assessorName: assessor.name,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    const notificationMsg = `Your ${policyType} claim ${claimRef} ("${claim.title}") has been rejected by Assessor ${assessor.name}.`;
    await Notification.create({
      userId: claim.customerId,
      title: 'Claim Rejected',
      message: notificationMsg,
      claimId: claim._id,
      metadata: {
        type: 'REJECT',
        rejectionReason: customerRemarks,
        assessorRemarks: customerRemarks,
        claimId: claim._id.toString(),
        claimTitle: claim.title,
        assessorName: assessor.name,
        timestamp: new Date().toISOString()
      }
    });
  }

  await logClaimAudit(
    claimId,
    assessorId,
    claim.customerId.toString(),
    decision,
    `Remarks: ${customerRemarks}`,
    previousStatus,
    newStatus
  );

  return serializeClaim(claim);
}

export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus
): Promise<SerializedClaimDocument> {
  await connectDB();
  const doc = await ClaimDocument.findByIdAndUpdate(
    documentId,
    { verificationStatus: status },
    { new: true }
  );
  if (!doc) throw new Error('Document not found');
  return serializeDocument(doc);
}

// ---- Analytics ----

export async function getClaimsAnalytics(): Promise<ClaimsAnalytics> {
  await connectDB();

  const [total, byStatus, amounts, monthly] = await Promise.all([
    Claim.countDocuments(),
    Claim.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Claim.aggregate([
      {
        $group: {
          _id: null,
          totalClaim: { $sum: '$claimAmount' },
          totalApproved: { $sum: '$approvedAmount' },
        },
      },
    ]),
    Claim.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          amount: { $sum: '$claimAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const statusMap = Object.fromEntries(
    byStatus.map((s: { _id: ClaimStatus; count: number }) => [s._id, s.count])
  ) as Record<ClaimStatus, number>;

  const totalClaimAmount = amounts[0]?.totalClaim ?? 0;
  const totalApprovedAmount = amounts[0]?.totalApproved ?? 0;

  const approvedCount = statusMap[ClaimStatus.APPROVED] ?? 0;
  const paidCount = statusMap[ClaimStatus.PAID] ?? 0;
  const approvalRate = total > 0 ? Math.round(((approvedCount + paidCount) / total) * 100) : 0;

  return {
    total,
    byStatus: statusMap,
    totalClaimAmount,
    totalApprovedAmount,
    approvalRate,
    monthlyTrend: monthly.map((m: { _id: { year: number; month: number }; count: number; amount: number }) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      count: m.count,
      amount: m.amount,
    })),
  };
}

// ---- Serializers ----

function serializeClaim(claim: IClaim): SerializedClaim {
  return JSON.parse(JSON.stringify({
    _id: claim._id.toString(),
    purchasedPolicyId: claim.purchasedPolicyId,
    customerId: claim.customerId,
    title: claim.title,
    description: claim.description,
    incidentDate: claim.incidentDate,
    claimAmount: claim.claimAmount,
    approvedAmount: claim.approvedAmount,
    assignedAssessorId: claim.assignedAssessorId,
    status: claim.status,
    policyType: claim.policyType,
    priority: claim.priority,
    riskScore: claim.riskScore,
    fraudFlags: claim.fraudFlags || [],
    notes: claim.notes || [],
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  }));
}

function serializeDocument(doc: InstanceType<typeof ClaimDocument>): SerializedClaimDocument {
  return {
    _id: doc._id.toString(),
    claimId: doc.claimId.toString(),
    documentName: doc.documentName,
    documentUrl: doc.documentUrl,
    verificationStatus: doc.verificationStatus,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function getClaimAssessments(claimId: string): Promise<SerializedClaimAssessment[]> {
  await connectDB();
  const assessments = await ClaimAssessment.find({ claimId })
    .populate('assessorId', 'name email')
    .sort({ createdAt: 1 })
    .lean();
  
  return assessments.map((a: any) => ({
    _id: a._id.toString(),
    claimId: a.claimId.toString(),
    assessorId: a.assessorId ? {
      _id: a.assessorId._id.toString(),
      name: a.assessorId.name
    } : { _id: '', name: 'System' },
    remarks: a.remarks,
    approvedAmount: a.approvedAmount,
    assessmentDate: a.assessmentDate.toISOString(),
    reviewStartedAt: a.reviewStartedAt?.toISOString(),
    reviewCompletedAt: a.reviewCompletedAt?.toISOString(),
    createdAt: a.createdAt.toISOString(),
    assessorRemarks: a.assessorRemarks,
    decisionReason: a.decisionReason,
    decisionType: a.decisionType,
    assessorName: a.assessorName,
    decisionTimestamp: a.decisionTimestamp ? a.decisionTimestamp.toISOString() : undefined,
  }));
}

// ---- Policy Detail Data Aggregator ----
// Fetches all data needed for the /dashboard/policies/[id] detail page:
// claims, claim documents, settlement payments, and notifications.
export async function getPolicyDetailData(
  purchasedPolicyId: string,
  userId: string
): Promise<{
  claims: SerializedClaim[];
  documents: SerializedClaimDocument[];
  payments: SerializedPayment[];
  notifications: SerializedNotification[];
}> {
  await connectDB();

  // 1. Fetch all claims for this purchased policy (with assessor info)
  const claims = await Claim.find({ purchasedPolicyId })
    .populate('assignedAssessorId', 'name email specialization')
    .sort({ createdAt: -1 });

  const claimIds = claims.map((c) => c._id);

  // 2. Fetch related data in parallel
  const [docs, payments, notifications] = await Promise.all([
    claimIds.length > 0
      ? ClaimDocument.find({ claimId: { $in: claimIds } }).sort({ createdAt: -1 })
      : Promise.resolve([]),
    claimIds.length > 0
      ? Payment.find({ claimId: { $in: claimIds } }).sort({ createdAt: -1 })
      : Promise.resolve([]),
    claimIds.length > 0
      ? Notification.find({ userId, claimId: { $in: claimIds } })
          .sort({ createdAt: -1 })
          .limit(10)
      : Promise.resolve([]),
  ]);

  return {
    claims: claims.map(serializeClaim),
    documents: docs.map(serializeDocument),
    payments: payments.map(serializePayment),
    notifications: notifications.map(serializeNotification),
  };
}

function serializePayment(payment: IPayment): SerializedPayment {
  return {
    _id: payment._id.toString(),
    claimId: payment.claimId.toString(),
    customerId: payment.customerId.toString(),
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    status: payment.status as PaymentStatus,
    paymentDate: payment.paymentDate ? payment.paymentDate.toISOString() : null,
    createdAt: payment.createdAt.toISOString(),
  };
}

function serializeNotification(n: InstanceType<typeof Notification>): SerializedNotification {
  return {
    _id: n._id.toString(),
    userId: n.userId.toString(),
    message: n.message,
    isRead: n.isRead,
    title: n.title,
    claimId: n.claimId?.toString(),
    metadata: n.metadata
      ? {
          type: n.metadata.type,
          approvedAmount: n.metadata.approvedAmount,
          rejectionReason: n.metadata.rejectionReason,
          requestedDocuments: n.metadata.requestedDocuments,
          assessorRemarks: n.metadata.assessorRemarks,
          assessorName: n.metadata.assessorName,
        }
      : undefined,
    createdAt: n.createdAt.toISOString(),
  };
}
