// ============================================================
// models/ClaimDocument.ts
// Supporting documents uploaded for a claim.
// Each document has an independent verification status
// that Assessors update during the review workflow.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { DocumentStatus } from '@/lib/constants/enums';

export interface IClaimDocument extends Document {
  claimId: mongoose.Types.ObjectId;
  documentName: string;
  documentUrl: string;
  verificationStatus: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimDocumentSchema = new Schema<IClaimDocument>(
  {
    claimId: {
      type: Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      index: true,
    },
    documentName: { type: String, required: true, trim: true },
    documentUrl: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.UPLOADED,
    },
  },
  { timestamps: true }
);

const ClaimDocument: Model<IClaimDocument> =
  mongoose.models.ClaimDocument ??
  mongoose.model<IClaimDocument>('ClaimDocument', ClaimDocumentSchema);

export default ClaimDocument;
