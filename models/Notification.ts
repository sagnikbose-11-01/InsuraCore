// ============================================================
// models/Notification.ts
// In-app notification for users (claim status changes, payouts).
// Indexed on userId + isRead for fast unread count queries.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  title?: string;
  claimId?: mongoose.Types.ObjectId;
  metadata?: {
    type?: string; // APPROVE, REJECT, REQUEST_DOCUMENTS, ADD_NOTES
    approvedAmount?: number;
    rejectionReason?: string;
    requestedDocuments?: string[];
    assessorRemarks?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    title: { type: String },
    claimId: {
      type: Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
    metadata: {
      type: { type: String },
      approvedAmount: { type: Number },
      rejectionReason: { type: String },
      requestedDocuments: { type: [String] },
      assessorRemarks: { type: String },
    },
  },
  { timestamps: true }
);

// Fast queries: "get unread notifications for user"
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
