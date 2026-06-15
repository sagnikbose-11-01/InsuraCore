'use server';
// ============================================================
// services/user.service.ts
// User business logic: registration, login, profile management.
// All DB interactions go through this layer, never from UI.
// ============================================================

import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import User, { IUser } from '@/models/User';
import { signToken } from '@/lib/auth/jwt';
import { RegisterInput, LoginInput } from '@/lib/validators/auth.validators';
import { UserRole, PolicyType } from '@/lib/constants/enums';
import { SerializedUser } from '@/types';
import Notification from '@/models/Notification';

const SALT_ROUNDS = 12;

export async function registerUser(
  input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
    address?: string;
    dob?: string;
    employeeId?: string;
    specialization?: PolicyType;
    yearsOfExperience?: number;
    adminAccessCode?: string;
  }
): Promise<{ token: string; user: SerializedUser }> {
  await connectDB();

  // Enforce server-side rules per role
  const role = input.role ?? UserRole.CUSTOMER;
  const localPart = input.email.split('@')[0];

  if (role === UserRole.ASSESSOR) {
    if (!localPart.startsWith('assessor')) {
      throw new Error('Invalid assessor registration information.');
    }
    if (!input.employeeId || !input.specialization || input.yearsOfExperience === undefined) {
      throw new Error('Invalid assessor registration information.');
    }
  } else if (role === UserRole.ADMIN) {
    if (!localPart.startsWith('admin')) {
      throw new Error('Admin email must start with "admin".');
    }
    const envCode = process.env.ADMIN_INVITE_CODE || 'INSURACORE_ADMIN_2026';
    if (!input.adminAccessCode || input.adminAccessCode !== envCode) {
      throw new Error('Invalid Admin Access Code.');
    }
  }

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    phone: input.phone || 'N/A', // fallback for admin
    role: role,
    address: input.address,
    dob: input.dob ? new Date(input.dob) : undefined,
    employeeId: input.employeeId,
    specialization: input.specialization,
    yearsOfExperience: input.yearsOfExperience,
  });

  // Welcome notification
  await Notification.create({
    userId: user._id,
    message: `Welcome to InsuraCore, ${user.name}! Your account has been created successfully.`,
  });

  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    specialization: user.specialization as PolicyType,
  });

  return { token, user: serializeUser(user) };
}

export async function loginUser(
  input: LoginInput
): Promise<{ token: string; user: SerializedUser }> {
  await connectDB();

  // Explicitly select password (it's excluded by default with select: false)
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    specialization: user.specialization as PolicyType,
  });

  return { token, user: serializeUser(user) };
}

export async function getUserById(id: string): Promise<SerializedUser | null> {
  await connectDB();
  const user = await User.findById(id);
  return user ? serializeUser(user) : null;
}

export async function getAllAssessors(): Promise<SerializedUser[]> {
  await connectDB();
  const assessors = await User.find({ role: UserRole.ASSESSOR });
  return assessors.map(serializeUser);
}

export async function getAllUsers(): Promise<SerializedUser[]> {
  await connectDB();
  const users = await User.find({}).sort({ createdAt: -1 });
  return users.map(serializeUser);
}

export async function updateUserProfile(
  id: string,
  data: { name?: string; phone?: string; avatar?: string }
): Promise<SerializedUser> {
  await connectDB();
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw new Error('User not found');
  return serializeUser(user);
}

export async function updateAssessorProfile(
  id: string,
  data: { name?: string; phone?: string; avatar?: string; yearsOfExperience?: number; bio?: string }
): Promise<SerializedUser> {
  await connectDB();
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw new Error('User not found');
  return serializeUser(user);
}

export async function changeAssessorPassword(
  id: string,
  currentPassword?: string,
  newPassword?: string
): Promise<void> {
  await connectDB();
  const user = await User.findById(id).select('+password');
  if (!user) throw new Error('User not found');

  if (currentPassword && newPassword) {
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordChangedAt = new Date();
    await user.save();
  } else {
    throw new Error('Invalid password change data');
  }
}

// Convert Mongoose document to a plain serializable object
function serializeUser(user: IUser): SerializedUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    address: user.address,
    dob: user.dob ? user.dob.toISOString() : undefined,
    employeeId: user.employeeId,
    specialization: user.specialization,
    yearsOfExperience: user.yearsOfExperience,
    bio: user.bio,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : undefined,
    passwordChangedAt: user.passwordChangedAt ? user.passwordChangedAt.toISOString() : undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
