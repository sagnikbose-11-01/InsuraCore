'use server';
// ============================================================
// services/claim.service.ts
// Claim business logic: filing, document management,
// assessor assignment, assessment submission, status progression.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import Claim, { IClaim } from '@/models/Claim';
import ClaimDocument from '@/models/ClaimDocument';
import ClaimAssessment from '@/models/ClaimAssessment';
import Notification from '@/models/Notification';
import { CreateClaimInput, AssessmentInput, AssignAssessorInput } from '@/lib/validators/claim.validators';
import { ClaimStatus, DocumentStatus } from '@/lib/constants/enums';
import { SerializedClaim, SerializedClaimDocument, ClaimsAnalytics } from '@/types';

// ---- Customer Actions ----

export async function createClaim(
  customerId: string,
  input: CreateClaimInput
): Promise<SerializedClaim> {
  await connectDB();

  const claim = await Claim.create({
    customerId,
    purchasedPolicyId: input.purchasedPolicyId,
    title: input.title,
    description: input.description,
    incidentDate: new Date(input.incidentDate),
    claimAmount: input.claimAmount,
    status: ClaimStatus.SUBMITTED,
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
  await connectDB();

  const newStatus = input.decision === 'APPROVED' ? ClaimStatus.APPROVED : ClaimStatus.REJECTED;

  // Create assessment record
  await ClaimAssessment.create({
    claimId: input.claimId,
    assessorId,
    remarks: input.remarks,
    approvedAmount: input.approvedAmount,
  });

  // Update claim status and approved amount
  const claim = await Claim.findByIdAndUpdate(
    input.claimId,
    {
      status: newStatus,
      approvedAmount: input.decision === 'APPROVED' ? input.approvedAmount : 0,
    },
    { new: true }
  );

  if (!claim) throw new Error('Claim not found');

  // Notify customer
  const statusMsg = input.decision === 'APPROVED'
    ? `approved! Approved amount: ₹${input.approvedAmount.toLocaleString()}`
    : 'rejected. Please contact support for more information.';

  await Notification.create({
    userId: claim.customerId,
    message: `Your claim "${claim.title}" has been ${statusMsg}`,
  });

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
