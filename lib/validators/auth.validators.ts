// ============================================================
// lib/validators/auth.validators.ts
// Zod schemas for all authentication-related forms.
// ============================================================

import { z } from 'zod';
import { UserRole, PolicyType } from '@/lib/constants/enums';

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
    .min(10, 'Phone must be at least 10 digits')
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
});

export const CustomerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Confirm Password is required'),
  address: z.string().optional(),
  dob: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const AssessorRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .refine(
      (val) => val.split('@')[0].startsWith('assessor'),
      { message: "Assessor email must begin with 'assessor'." }
    ),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number'),
  employeeId: z.string().min(2, 'Employee ID must be at least 2 characters'),
  specialization: z.nativeEnum(PolicyType, { message: 'Invalid specialization' }),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be 0 or more'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const AdminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .refine(
      (val) => val.split('@')[0].startsWith('admin'),
      { message: "Admin email must begin with 'admin'." }
    ),
  employeeId: z.string().min(2, 'Employee ID must be at least 2 characters'),
  adminAccessCode: z.string().min(1, 'Admin Access Code is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CustomerRegisterInput = z.infer<typeof CustomerRegisterSchema>;
export type AssessorRegisterInput = z.infer<typeof AssessorRegisterSchema>;
export type AdminRegisterInput = z.infer<typeof AdminRegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
