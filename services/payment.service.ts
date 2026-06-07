'use server';
// ============================================================
// services/payment.service.ts
// Payment processing: creates settlement records, releases payouts.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import Payment from '@/models/Payment';
import Claim from '@/models/Claim';
import Notification from '@/models/Notification';
import AuditLog from '@/models/AuditLog';
import User from '@/models/User';
import { PaymentStatus, ClaimStatus } from '@/lib/constants/enums';
import { SerializedPayment } from '@/types';

export async function createPaymentForClaim(claimId: string): Promise<SerializedPayment> {
  await connectDB();

  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== ClaimStatus.APPROVED) {
    throw new Error('Payment can only be created for approved claims');
  }

  // Prevent duplicate payments
  const existing = await Payment.findOne({ claimId });
  if (existing) return serializePayment(existing);

  const payment = await Payment.create({
    claimId,
    customerId: claim.customerId,
    amount: claim.approvedAmount,
    paymentMethod: 'BANK_TRANSFER',
    status: PaymentStatus.PENDING,
  });

  return serializePayment(payment);
}

export async function releasePayment(paymentId: string): Promise<SerializedPayment> {
  await connectDB();

  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    {
      status: PaymentStatus.SUCCESS,
      paymentDate: new Date(),
    },
    { new: true }
  );

  if (!payment) throw new Error('Payment not found');

  // Update claim to PAID
  await Claim.findByIdAndUpdate(payment.claimId, { status: ClaimStatus.PAID });

  // Notify customer
  await Notification.create({
    userId: payment.customerId,
    title: 'Settlement Released',
    message: `Your settlement of ₹${payment.amount.toLocaleString('en-IN')} has been released successfully.`,
  });

  // Write enterprise audit log entry
  const customer = await User.findById(payment.customerId).select('name').lean() as { name: string } | null;
  await AuditLog.create({
    actorId: payment.customerId,
    actorName: customer?.name ?? 'Customer',
    actorRole: 'SYSTEM',
    entityId: payment._id.toString(),
    entityType: 'PAYMENT',
    action: 'PAYMENT_RELEASED',
    remarks: `Settlement of ₹${payment.amount.toLocaleString('en-IN')} released via ${payment.paymentMethod} for claim ${payment.claimId.toString().slice(-8).toUpperCase()}.`,
  });

  return serializePayment(payment);
}

export async function getPaymentByClaim(claimId: string): Promise<SerializedPayment | null> {
  await connectDB();
  const payment = await Payment.findOne({ claimId });
  return payment ? serializePayment(payment) : null;
}

export async function getMyPayments(customerId: string): Promise<SerializedPayment[]> {
  await connectDB();
  const payments = await Payment.find({ customerId }).sort({ createdAt: -1 });
  return payments.map(serializePayment);
}

function serializePayment(payment: InstanceType<typeof Payment>): SerializedPayment {
  return {
    _id: payment._id.toString(),
    claimId: payment.claimId.toString(),
    customerId: payment.customerId.toString(),
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    paymentDate: payment.paymentDate ? payment.paymentDate.toISOString() : null,
    createdAt: payment.createdAt.toISOString(),
  };
}
