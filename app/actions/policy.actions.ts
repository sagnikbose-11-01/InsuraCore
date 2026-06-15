'use server';
// ============================================================
// app/actions/policy.actions.ts
// Server Actions for policy purchase and admin policy CRUD.
// ============================================================

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  purchasePolicy as purchasePolicyService,
  createPolicy as createPolicyService,
  updatePolicy as updatePolicyService,
  deletePolicy as deletePolicyService,
} from '@/services/policy.service';
import { CreatePolicySchema } from '@/lib/validators/policy.validators';
import { ActionResponse, SerializedPurchasedPolicy, SerializedPolicy } from '@/types';
import { UserRole } from '@/lib/constants/enums';

export async function purchasePolicyAction(policyId: string): Promise<ActionResponse<SerializedPurchasedPolicy>> {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const purchased = await purchasePolicyService(session.id, policyId);
    revalidatePath('/dashboard/policies');
    revalidatePath('/dashboard');
    return { success: true, message: 'Policy purchased successfully!', data: purchased };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function createPolicyAction(formData: FormData): Promise<ActionResponse<SerializedPolicy>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  const raw = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    description: formData.get('description') as string,
    premiumAmount: Number(formData.get('premiumAmount')),
    coverageAmount: Number(formData.get('coverageAmount')),
    validityPeriod: Number(formData.get('validityPeriod')),
    eligibility: formData.get('eligibility') ? (formData.get('eligibility') as string).split(',').map(s => s.trim()) : [],
  };

  const parsed = CreatePolicySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const policy = await createPolicyService(parsed.data);
    revalidatePath('/admin/policies');
    revalidatePath('/dashboard/policies');
    return { success: true, message: 'Policy created successfully!', data: policy };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function updatePolicyAction(policyId: string, formData: FormData): Promise<ActionResponse<SerializedPolicy>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  const raw = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    description: formData.get('description') as string,
    premiumAmount: Number(formData.get('premiumAmount')),
    coverageAmount: Number(formData.get('coverageAmount')),
    validityPeriod: Number(formData.get('validityPeriod')),
    eligibility: formData.get('eligibility') ? (formData.get('eligibility') as string).split(',').map(s => s.trim()) : [],
  };

  const parsed = CreatePolicySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const policy = await updatePolicyService(policyId, parsed.data);
    revalidatePath('/admin/policies');
    revalidatePath('/dashboard/policies');
    return { success: true, message: 'Policy updated successfully!', data: policy };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function deletePolicyAction(policyId: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await deletePolicyService(policyId);
    revalidatePath('/admin/policies');
    revalidatePath('/dashboard/policies');
    return { success: true, message: 'Policy deleted successfully!' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

import { adminApprovePolicy, adminRejectPolicy } from '@/services/admin.service';

export async function approvePolicyAction(policyId: string, comments?: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await adminApprovePolicy(policyId, session.id, comments);
    revalidatePath('/admin/policies');
    revalidatePath('/dashboard/policies');
    return { success: true, message: 'Policy approved successfully!' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function rejectPolicyAction(policyId: string, comments?: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await adminRejectPolicy(policyId, session.id, comments);
    revalidatePath('/admin/policies');
    return { success: true, message: 'Policy rejected.' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
