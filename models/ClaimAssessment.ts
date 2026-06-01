// ============================================================
// models/ClaimAssessment.ts
// Review record submitted by an Assessor for a claim.
// One claim may have multiple assessment revisions,
// but only the latest one is used for final decisions.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClaimAssessment extends Document {
  claimId: mongoose.Types.ObjectId;
  assessorId: mongoose.Types.ObjectId;
  remarks: string;
  approvedAmount: number;
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimAssessmentSchema = new Schema<IClaimAssessment>(
  {
    claimId: {
      type: Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      index: true,
    },
    assessorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    remarks: { type: String, required: true },
    approvedAmount: { type: Number, required: true, min: 0 },
    assessmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ClaimAssessment: Model<IClaimAssessment> =
  mongoose.models.ClaimAssessment ??
  mongoose.model<IClaimAssessment>('ClaimAssessment', ClaimAssessmentSchema);

export default ClaimAssessment;
