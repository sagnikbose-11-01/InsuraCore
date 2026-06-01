// ============================================================
// models/Policy.ts
// Insurance policy template created by Admins.
// Customers purchase from these available policies.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { PolicyType } from '@/lib/constants/enums';

export interface IPolicy extends Document {
  name: string;
  type: PolicyType;
  description: string;
  premiumAmount: number;       // Monthly or annual premium in INR
  coverageAmount: number;      // Maximum claimable amount in INR
  validityPeriod: number;      // Policy duration in months
  eligibility: string[];       // e.g., ["Age 18-65", "Indian Resident"]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(PolicyType),
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    premiumAmount: { type: Number, required: true, min: 0 },
    coverageAmount: { type: Number, required: true, min: 0 },
    validityPeriod: { type: Number, required: true, min: 1 }, // months
    eligibility: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const Policy: Model<IPolicy> = mongoose.models.Policy ?? mongoose.model<IPolicy>('Policy', PolicySchema);
export default Policy;
