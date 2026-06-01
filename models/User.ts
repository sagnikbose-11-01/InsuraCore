// ============================================================
// models/User.ts
// User model — supports CUSTOMER, ASSESSOR, and ADMIN roles.
// Email is indexed for fast lookups during login/auth.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/lib/constants/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Fast login lookups
    },
    password: { type: String, required: true, minlength: 8, select: false }, // Never returned by default
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
      index: true,
    },
    avatar: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      // Remove password from JSON output
      transform(_, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Prevent model re-registration during Next.js hot reload
const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);
export default User;
