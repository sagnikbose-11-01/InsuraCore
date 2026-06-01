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
import { UserRole } from '@/lib/constants/enums';
import { SerializedUser } from '@/types';
import Notification from '@/models/Notification';

const SALT_ROUNDS = 12;

export async function registerUser(
  input: RegisterInput
): Promise<{ token: string; user: SerializedUser }> {
  await connectDB();

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    phone: input.phone,
    role: input.role ?? UserRole.CUSTOMER,
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

  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
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

// Convert Mongoose document to a plain serializable object
function serializeUser(user: IUser): SerializedUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
