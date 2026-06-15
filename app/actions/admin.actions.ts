'use server';
// ============================================================
// app/actions/admin.actions.ts
// Server Actions for admin user management.
// ============================================================

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { registerUser } from '@/services/user.service';
import { RegisterSchema } from '@/lib/validators/auth.validators';
import { ActionResponse, SerializedUser } from '@/types';
import { UserRole } from '@/lib/constants/enums';

export async function adminCreateUserAction(formData: FormData): Promise<ActionResponse<SerializedUser>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { user } = await registerUser(parsed.data);
    revalidatePath('/admin/users');
    revalidatePath('/admin/customers');
    revalidatePath('/admin/assessors');
    return { success: true, message: 'User created successfully!', data: user };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function adminSuspendUserAction(userId: string): Promise<ActionResponse<void>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { adminSuspendUser } = await import('@/services/admin.service');
    await adminSuspendUser(userId);
    revalidatePath('/admin/customers');
    revalidatePath('/admin/assessors');
    return { success: true, message: 'User suspended successfully' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function adminActivateUserAction(userId: string): Promise<ActionResponse<void>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { adminActivateUser } = await import('@/services/admin.service');
    await adminActivateUser(userId);
    revalidatePath('/admin/customers');
    revalidatePath('/admin/assessors');
    return { success: true, message: 'User activated successfully' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function adminReassignClaimAction(claimId: string, assessorId: string): Promise<ActionResponse<void>> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { adminReassignClaim } = await import('@/services/admin.service');
    await adminReassignClaim(claimId, assessorId);
    revalidatePath('/admin/claims');
    revalidatePath('/admin/approvals');
    revalidatePath('/admin');
    return { success: true, message: 'Claim reassigned successfully' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
