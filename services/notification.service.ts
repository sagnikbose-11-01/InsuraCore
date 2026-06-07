'use server';
// ============================================================
// services/notification.service.ts
// Notification service: fetch and mark notifications.
// ============================================================

import { connectDB } from '@/lib/db/mongoose';
import Notification, { INotification } from '@/models/Notification';
import { SerializedNotification } from '@/types';

export async function getMyNotifications(userId: string): Promise<SerializedNotification[]> {
  await connectDB();
  const list = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
  return list.map(serializeNotification);
}

export async function markNotificationAsRead(notificationId: string): Promise<SerializedNotification> {
  await connectDB();
  const notif = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  if (!notif) throw new Error('Notification not found');
  return serializeNotification(notif);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await connectDB();
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  await connectDB();
  return Notification.countDocuments({ userId, isRead: false });
}

function serializeNotification(notif: INotification): SerializedNotification {
  return {
    _id: notif._id.toString(),
    userId: notif.userId.toString(),
    message: notif.message,
    isRead: notif.isRead,
    title: notif.title,
    claimId: notif.claimId?.toString(),
    metadata: notif.metadata ? {
      type: notif.metadata.type,
      approvedAmount: notif.metadata.approvedAmount,
      rejectionReason: notif.metadata.rejectionReason,
      requestedDocuments: notif.metadata.requestedDocuments,
      assessorRemarks: notif.metadata.assessorRemarks,
      assessorName: notif.metadata.assessorName,
    } : undefined,
    createdAt: notif.createdAt.toISOString(),
  };
}
