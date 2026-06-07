// ============================================================
// models/ClaimAuditLog.ts
// Audit logs for all assessor and customer claim interactions.
// Used to power the activity feeds and track operational audits.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClaimAuditLog extends Document {
  claimId: mongoose.Types.ObjectId;
  assessorId: mongoose.Types.ObjectId | null;
  customerId: mongoose.Types.ObjectId;
  action: 'REVIEW_STARTED' | 'DOCUMENT_REQUESTED' | 'NOTE_ADDED' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CUSTOMER_RESPONDED';
  remarks: string;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
}

const ClaimAuditLogSchema = new Schema<IClaimAuditLog>(
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
      default: null,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['REVIEW_STARTED', 'DOCUMENT_REQUESTED', 'NOTE_ADDED', 'APPROVED', 'REJECTED', 'ESCALATED', 'CUSTOMER_RESPONDED'],
      required: true,
      index: true,
    },
    remarks: { type: String, default: '' },
    previousStatus: { type: String, default: '' },
    newStatus: { type: String, default: '' },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

// Prevent model re-registration during Next.js hot reload
const ClaimAuditLog: Model<IClaimAuditLog> =
  mongoose.models.ClaimAuditLog ??
  mongoose.model<IClaimAuditLog>('ClaimAuditLog', ClaimAuditLogSchema);

export default ClaimAuditLog;
