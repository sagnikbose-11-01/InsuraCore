'use server';

// ============================================================
// app/actions/profile.actions.ts
// Next.js Server Actions for assessor profile updates.
// ============================================================

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { updateAssessorProfile, changeAssessorPassword } from '@/services/user.service';
import { ActionResponse, SerializedUser } from '@/types';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  yearsOfExperience: z.coerce.number().min(0, 'Experience must be a non-negative number'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword']
});

export async function updateAssessorProfileAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<SerializedUser>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Unauthorized session' };
  }

  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    yearsOfExperience: formData.get('yearsOfExperience') as string,
    bio: (formData.get('bio') as string) || '',
  };

  const parsed = UpdateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const updatedUser = await updateAssessorProfile(session.id, parsed.data);
    revalidatePath('/assessor/profile');
    return {
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function changePasswordAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Unauthorized session' };
  }

  const rawData = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = ChangePasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await changeAssessorPassword(
      session.id,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    revalidatePath('/assessor/profile');
    return {
      success: true,
      message: 'Password updated successfully!',
    };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
