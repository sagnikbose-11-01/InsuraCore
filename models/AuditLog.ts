// ============================================================
// models/AuditLog.ts
// Enterprise-grade general audit trail for all system events.
// Captures actor, entity, action, and metadata for compliance.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditActorRole = 'CUSTOMER' | 'ASSESSOR' | 'ADMIN' | 'SYSTEM';
export type AuditEntityType = 'CLAIM' | 'POLICY' | 'PURCHASED_POLICY' | 'PAYMENT';
export type AuditAction =
  | 'PURCHASE'
  | 'CLAIM_SUBMISSION'
  | 'REVIEW_STARTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DOCUMENT_REQUESTED'
  | 'PAYMENT_RELEASED'
  | 'NOTE_ADDED'
  | 'CUSTOMER_RESPONDED'
  | 'CREATE_POLICY'
  | 'UPDATE_POLICY'
  | 'APPROVE_POLICY'
  | 'REJECT_POLICY';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: AuditActorRole;
  entityId: string;
  entityType: AuditEntityType;
  action: AuditAction;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorName: { type: String, required: true, trim: true },
    actorRole: {
      type: String,
      enum: ['CUSTOMER', 'ASSESSOR', 'ADMIN', 'SYSTEM'],
      required: true,
    },
    entityId: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['CLAIM', 'POLICY', 'PURCHASED_POLICY', 'PAYMENT'],
      required: true,
    },
    action: {
      type: String,
      enum: [
        'PURCHASE',
        'CLAIM_SUBMISSION',
        'REVIEW_STARTED',
        'APPROVED',
        'REJECTED',
        'DOCUMENT_REQUESTED',
        'PAYMENT_RELEASED',
        'NOTE_ADDED',
        'CUSTOMER_RESPONDED',
        'CREATE_POLICY',
        'UPDATE_POLICY',
        'APPROVE_POLICY',
        'REJECT_POLICY',
      ],
      required: true,
      index: true,
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// Composite index for querying audit trail by actor and entity
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ entityId: 1, entityType: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
