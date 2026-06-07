'use server';
// ============================================================
// app/actions/auth.actions.ts
// Next.js Server Actions for authentication.
// These are called directly from Client Component forms.
// ============================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { registerUser, loginUser } from '@/services/user.service';
import { RegisterSchema, LoginSchema, CustomerRegisterSchema, AssessorRegisterSchema, AdminRegisterSchema } from '@/lib/validators/auth.validators';
import { COOKIE_NAME, COOKIE_OPTIONS, getSession } from '@/lib/auth/session';
import { ActionResponse, SerializedUser } from '@/types';
import { UserRole } from '@/lib/constants/enums';

type AuthPayload = { user: SerializedUser; role: UserRole };

export async function registerAction(
  formData: FormData
): Promise<ActionResponse<AuthPayload>> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
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
    const { token, user } = await registerUser(parsed.data);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true, message: 'Account created successfully!', data: { user, role: user.role } };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function registerCustomerAction(
  formData: FormData
): Promise<ActionResponse<AuthPayload>> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    address: (formData.get('address') as string) || undefined,
    dob: (formData.get('dob') as string) || undefined,
  };

  const parsed = CustomerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { token, user } = await registerUser({
      ...parsed.data,
      role: UserRole.CUSTOMER,
    });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true, message: 'Customer account created successfully!', data: { user, role: user.role } };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function registerAssessorAction(
  formData: FormData
): Promise<ActionResponse<AuthPayload>> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    employeeId: formData.get('employeeId') as string,
    specialization: formData.get('specialization') as string,
    yearsOfExperience: formData.get('yearsOfExperience') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = AssessorRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { token, user } = await registerUser({
      ...parsed.data,
      role: UserRole.ASSESSOR,
    });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true, message: 'Assessor workspace created successfully!', data: { user, role: user.role } };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function registerAdminAction(
  formData: FormData
): Promise<ActionResponse<AuthPayload>> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    employeeId: formData.get('employeeId') as string,
    adminAccessCode: formData.get('adminAccessCode') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = AdminRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { token, user } = await registerUser({
      ...parsed.data,
      role: UserRole.ADMIN,
    });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true, message: 'Admin workspace created successfully!', data: { user, role: user.role } };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function loginAction(
  formData: FormData
): Promise<ActionResponse<AuthPayload>> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { token, user } = await loginUser(parsed.data);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return { success: true, message: 'Logged in successfully!', data: { user, role: user.role } };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/auth/login');
}

export async function updateProfileAction(formData: FormData): Promise<ActionResponse<SerializedUser>> {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  if (!name || name.length < 2) {
    return { success: false, message: 'Name must be at least 2 characters' };
  }
  if (!phone || phone.length < 10) {
    return { success: false, message: 'Phone must be at least 10 characters' };
  }

  try {
    const { updateUserProfile } = await import('@/services/user.service');
    const updated = await updateUserProfile(session.id, { name, phone });
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true, message: 'Profile updated successfully!', data: updated };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

