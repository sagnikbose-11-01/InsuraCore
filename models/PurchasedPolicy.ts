// ============================================================
// models/PurchasedPolicy.ts
// A policy "instance" owned by a specific Customer.
// References User and Policy using ObjectId (normalized design).
// Indexed on userId and status for efficient dashboard queries.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { PolicyStatus } from '@/lib/constants/enums';

export interface IPurchasedPolicy extends Document {
  userId: mongoose.Types.ObjectId;
  policyId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: PolicyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PurchasedPolicySchema = new Schema<IPurchasedPolicy>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    policyId: {
      type: Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(PolicyStatus),
      default: PolicyStatus.ACTIVE,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index: all active policies for a user
PurchasedPolicySchema.index({ userId: 1, status: 1 });

const PurchasedPolicy: Model<IPurchasedPolicy> =
  mongoose.models.PurchasedPolicy ??
  mongoose.model<IPurchasedPolicy>('PurchasedPolicy', PurchasedPolicySchema);

export default PurchasedPolicy;
