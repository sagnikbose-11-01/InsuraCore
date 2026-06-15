// ============================================================
// models/Policy.ts
// Insurance policy template created by Admins or Assessors.
// Customers purchase from these available policies.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { PolicyType, PolicyListingStatus } from '@/lib/constants/enums';

export interface IPolicy extends Document {
  name: string;
  type: PolicyType;
  description: string;
  premiumAmount: number;       // Monthly or annual premium in INR
  coverageAmount: number;      // Maximum claimable amount in INR
  validityPeriod: number;      // Policy duration in months
  eligibility: string[];       // e.g., ["Age 18-65", "Indian Resident"]
  
  // New comprehensive fields
  benefits: string[];
  exclusions: string[];
  waitingPeriod: number;       // e.g., in days
  maximumClaimAmount: number;
  requiredDocuments: string[];
  riskCategory: string;
  termsAndConditions: string;

  status: PolicyListingStatus;
  
  // Assessor ownership — null for admin-created policies
  createdByAssessorId?: mongoose.Types.ObjectId;
  createdByName?: string;          // Denormalized for display
  createdBySpecialization?: PolicyType; // Denormalized
  
  approvalHistory: Array<{
    status: PolicyListingStatus;
    adminId?: mongoose.Types.ObjectId;
    adminName?: string;
    date: Date;
    comments?: string;
  }>;

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
    
    // New fields
    benefits: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    waitingPeriod: { type: Number, default: 0 }, // days
    maximumClaimAmount: { type: Number, default: 0 },
    requiredDocuments: { type: [String], default: [] },
    riskCategory: { type: String, default: 'Standard' },
    termsAndConditions: { type: String, default: '' },

    status: {
      type: String,
      enum: Object.values(PolicyListingStatus),
      default: PolicyListingStatus.ACTIVE, // default ACTIVE for backwards compatibility / Admin creation
      index: true,
    },

    // Assessor ownership (optional)
    createdByAssessorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdByName: { type: String, default: null },
    createdBySpecialization: { type: String, enum: Object.values(PolicyType), default: null },

    approvalHistory: {
      type: [{
        status: { type: String, enum: Object.values(PolicyListingStatus), required: true },
        adminId: { type: Schema.Types.ObjectId, ref: 'User' },
        adminName: { type: String },
        date: { type: Date, default: Date.now },
        comments: { type: String },
      }],
      default: [],
    }
  },
  { timestamps: true }
);

// We need an index on status for quick lookups in the marketplace
PolicySchema.index({ status: 1 });

const Policy: Model<IPolicy> = mongoose.models.Policy ?? mongoose.model<IPolicy>('Policy', PolicySchema);
export default Policy;
