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
import { CreateClaimInput, AssessmentInput, AssignAssessorInput } from '@/lib/validators/claim.validators';
import { ClaimStatus, DocumentStatus, PolicyType } from '@/lib/constants/enums';
import { SerializedClaim, SerializedClaimDocument, SerializedClaimAssessment, ClaimsAnalytics } from '@/types';

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
  const policyType = policy.type;

  const claim = await Claim.create({
    customerId,
    purchasedPolicyId: input.purchasedPolicyId,
    title: input.title,
    description: input.description,
    incidentDate: new Date(input.incidentDate),
    claimAmount: input.claimAmount,
    status: ClaimStatus.SUBMITTED,
    policyType,
  });

  await Notification.create({
    userId: customerId,
    message: `Your claim "${input.title}" has been submitted and is under review.`,
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

export async function startClaimReview(claimId: string, assessorId: string): Promise<SerializedClaim> {
  await connectDB();
  const assessor = await User.findById(assessorId).select('name');
  if (!assessor) throw new Error('Assessor not found');

  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');

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
  });

  const policyName = (claim.purchasedPolicyId as any)?.policyId?.name || 'your policy';
  const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;

  await Notification.create({
    userId: claim.customerId,
    title: 'Additional Documents Required',
    message: `Your claim ${claimRef} under ${policyName} requires additional documents: ${requestedDocs.join(', ')}.`,
    claimId: claim._id,
    metadata: {
      type: 'REQUEST_DOCUMENTS',
      requestedDocuments: requestedDocs,
      assessorRemarks: remarks
    }
  });

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
    await Notification.create({
      userId: claim.customerId,
      title: 'New Assessor Note',
      message: `Assessor ${assessor.name} added a note to your claim ${claimRef}.`,
      claimId: claim._id,
      metadata: {
        type: 'ADD_NOTES',
        assessorRemarks: text
      }
    });
  }

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
    await latestAssessment.save();
  } else {
    await ClaimAssessment.create({
      claimId: claim._id,
      assessorId: new mongoose.Types.ObjectId(assessorId),
      remarks: customerRemarks || 'Assessment completed',
      approvedAmount: claim.approvedAmount,
      reviewStartedAt: new Date(Date.now() - 30 * 60 * 1000),
      reviewCompletedAt: new Date()
    });
  }

  const policyName = (claim.purchasedPolicyId as any)?.policyId?.name || 'your policy';
  const claimRef = `INS-${claim._id.toString().slice(-8).toUpperCase()}`;

  if (decision === 'APPROVED') {
    await Notification.create({
      userId: claim.customerId,
      title: 'Claim Approved',
      message: `Your claim for ₹${approvedAmount.toLocaleString('en-IN')} under ${policyName} has been approved.`,
      claimId: claim._id,
      metadata: {
        type: 'APPROVE',
        approvedAmount: approvedAmount,
        assessorRemarks: customerRemarks
      }
    });
  } else {
    await Notification.create({
      userId: claim.customerId,
      title: 'Claim Rejected',
      message: `Your claim ${claimRef} under ${policyName} has been rejected.`,
      claimId: claim._id,
      metadata: {
        type: 'REJECT',
        rejectionReason: customerRemarks,
        assessorRemarks: customerRemarks
      }
    });
  }

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
    createdAt: a.createdAt.toISOString()
  }));
}
