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

  const parsed = AssessmentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const claim = await submitAssessment(session.id, parsed.data);
    revalidatePath('/assessor/claims');
    return { success: true, message: `Claim ${raw.decision.toLowerCase()} successfully!`, data: claim };
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
