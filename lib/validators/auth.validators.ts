// ============================================================
// lib/validators/auth.validators.ts
// Zod schemas for all authentication-related forms.
// ============================================================

import { z } from 'zod';
import { UserRole } from '@/lib/constants/enums';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  phone: z
    .string()
    .min(10, 'Phone must be 10 digits')
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
