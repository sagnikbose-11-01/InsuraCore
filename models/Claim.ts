// ============================================================
// models/Claim.ts
// Core claim entity linking a customer's purchased policy to
// a filed claim. customerId is denormalized (cached) here for
// fast filtering without a double-lookup via purchasedPolicy.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { ClaimStatus, PolicyType, PriorityLevel } from '@/lib/constants/enums';

export interface IClaim extends Document {
  purchasedPolicyId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;        // Denormalized for performance
  title: string;
  description: string;
  incidentDate: Date;
  claimAmount: number;
  approvedAmount: number;
  assignedAssessorId: mongoose.Types.ObjectId | null;
  status: ClaimStatus;
  
  // New enterprise workflow fields
  policyType: PolicyType;
  priority: PriorityLevel;
  riskScore: number;
  fraudFlags: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    purchasedPolicyId: {
      type: Schema.Types.ObjectId,
      ref: 'PurchasedPolicy',
      required: true,
      index: true,
    },
    // Denormalized: stored here to avoid joining PurchasedPolicy → User on every list query
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    claimAmount: { type: Number, required: true, min: 0 },
    approvedAmount: { type: Number, default: 0, min: 0 },
    assignedAssessorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ClaimStatus),
      default: ClaimStatus.PENDING,
      index: true,
    },
    policyType: {
      type: String,
      enum: Object.values(PolicyType),
      required: true,
      index: true, // Crucial for filtering by assessor specialization
    },
    priority: {
      type: String,
      enum: Object.values(PriorityLevel),
      default: PriorityLevel.MEDIUM,
      index: true,
    },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    fraudFlags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
ClaimSchema.index({ customerId: 1, status: 1 });
ClaimSchema.index({ assignedAssessorId: 1, status: 1 });
ClaimSchema.index({ policyType: 1, status: 1 }); // For Assessor unassigned queues

const Claim: Model<IClaim> = mongoose.models.Claim ?? mongoose.model<IClaim>('Claim', ClaimSchema);
export default Claim;
