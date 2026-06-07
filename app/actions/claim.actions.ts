'use server';
// ============================================================
// app/actions/claim.actions.ts
// Server Actions for all claim-related user interactions.
// ============================================================

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  createClaim,
  assignAssessor,
  submitAssessment,
  updateDocumentStatus,
  startClaimReview,
  requestClaimDocuments,
  addClaimNote,
  submitClaimDecision,
} from '@/services/claim.service';
import { releasePayment, createPaymentForClaim as createPaymentService } from '@/services/payment.service';
import { CreateClaimSchema, AssessmentSchema, AssignAssessorSchema } from '@/lib/validators/claim.validators';
import { ActionResponse, SerializedClaim } from '@/types';
import { DocumentStatus, UserRole } from '@/lib/constants/enums';

export async function fileClaimAction(formData: FormData): Promise<ActionResponse<SerializedClaim>> {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  const raw = {
    purchasedPolicyId: formData.get('purchasedPolicyId') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    incidentDate: formData.get('incidentDate') as string,
    claimAmount: Number(formData.get('claimAmount')),
  };

  const parsed = CreateClaimSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const claim = await createClaim(session.id, parsed.data);
    revalidatePath('/dashboard/claims');
    return { success: true, message: 'Claim filed successfully!', data: claim };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function assignAssessorAction(formData: FormData): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  const raw = {
    claimId: formData.get('claimId') as string,
    assessorId: formData.get('assessorId') as string,
  };

  const parsed = AssignAssessorSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: 'Validation failed' };
  }

  try {
    await assignAssessor(parsed.data);
    revalidatePath('/admin/claims');
    return { success: true, message: 'Assessor assigned successfully!' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function submitAssessmentAction(formData: FormData): Promise<ActionResponse<SerializedClaim>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) {
    return { success: false, message: 'Unauthorized' };
  }

  const raw = {
    claimId: formData.get('claimId') as string,
    remarks: formData.get('remarks') as string,
    approvedAmount: Number(formData.get('approvedAmount')),
    decision: formData.get('decision') as 'APPROVED' | 'REJECTED',
  };

  const internalRemarks = (formData.get('internalRemarks') as string) || '';

  const parsed = AssessmentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Server-side boundary check: approvedAmount must not exceed the filed claimAmount
  if (parsed.data.decision === 'APPROVED' && parsed.data.approvedAmount > 0) {
    const { connectDB } = await import('@/lib/db/mongoose');
    const ClaimModel = (await import('@/models/Claim')).default;
    await connectDB();
    const existingClaim = await ClaimModel.findById(parsed.data.claimId).select('claimAmount').lean() as { claimAmount: number } | null;
    if (existingClaim && parsed.data.approvedAmount > existingClaim.claimAmount) {
      return {
        success: false,
        message: `Approved amount (₹${parsed.data.approvedAmount.toLocaleString('en-IN')}) cannot exceed the filed claim amount (₹${existingClaim.claimAmount.toLocaleString('en-IN')}).`,
      };
    }
  }

  try {
    const claim = await submitClaimDecision(
      parsed.data.claimId,
      session.id,
      parsed.data.decision,
      parsed.data.approvedAmount,
      parsed.data.remarks,
      internalRemarks
    );
    revalidatePath('/assessor/claims');
    revalidatePath('/assessor/reviews');
    revalidatePath(`/assessor/review/${parsed.data.claimId}`);
    return { success: true, message: `Claim ${raw.decision.toLowerCase()} successfully!`, data: claim };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function startClaimReviewAction(claimId: string): Promise<ActionResponse<SerializedClaim>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const claim = await startClaimReview(claimId, session.id);
    revalidatePath('/assessor/claims');
    revalidatePath('/assessor/reviews');
    revalidatePath(`/assessor/review/${claimId}`);
    return { success: true, message: 'Review started successfully!', data: claim };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function requestClaimDocumentsAction(
  claimId: string,
  requestedDocs: string[],
  remarks: string
): Promise<ActionResponse<SerializedClaim>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) {
    return { success: false, message: 'Unauthorized' };
  }

  if (requestedDocs.length === 0) {
    return { success: false, message: 'Please select at least one document to request.' };
  }

  try {
    const claim = await requestClaimDocuments(claimId, session.id, requestedDocs, remarks);
    revalidatePath('/assessor/claims');
    revalidatePath('/assessor/reviews');
    revalidatePath(`/assessor/review/${claimId}`);
    return { success: true, message: 'Documents requested successfully!', data: claim };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function addClaimNoteAction(
  claimId: string,
  text: string,
  isInternal: boolean
): Promise<ActionResponse<SerializedClaim>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!text || text.trim().length < 5) {
    return { success: false, message: 'Note must be at least 5 characters long.' };
  }

  try {
    const claim = await addClaimNote(claimId, session.id, text, isInternal);
    revalidatePath(`/assessor/review/${claimId}`);
    revalidatePath('/assessor/reviews');
    return { success: true, message: 'Note added successfully!', data: claim };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function verifyDocumentAction(
  documentId: string,
  status: DocumentStatus
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ASSESSOR) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await updateDocumentStatus(documentId, status);
    return { success: true, message: `Document marked as ${status.toLowerCase()}` };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function releasePaymentAction(claimId: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await createPaymentService(claimId);
    const claim = await import('@/models/Claim').then(m => m.default.findById(claimId));
    if (!claim) throw new Error('Claim not found');
    const payment = await import('@/models/Payment').then(m => m.default.findOne({ claimId }));
    if (!payment) throw new Error('Payment not found');
    await releasePayment(payment._id.toString());
    revalidatePath('/admin/claims');
    return { success: true, message: 'Payment released successfully!' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
