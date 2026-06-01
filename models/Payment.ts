// ============================================================
// models/Payment.ts
// Settlement record generated when a claim is approved.
// customerId is denormalized for fast payout queries.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentStatus } from '@/lib/constants/enums';

export interface IPayment extends Document {
  claimId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  paymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    claimId: {
      type: Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'BANK_TRANSFER' },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
