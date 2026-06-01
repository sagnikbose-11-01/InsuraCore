'use server';
// ============================================================
// app/actions/notification.actions.ts
// Server Actions for marking notifications as read.
// ============================================================

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  markNotificationAsRead as readService,
  markAllNotificationsAsRead as readAllService,
} from '@/services/notification.service';
import { ActionResponse } from '@/types';

export async function markNotificationAsReadAction(notificationId: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    await readService(notificationId);
    revalidatePath('/dashboard/notifications');
    revalidatePath('/dashboard');
    return { success: true, message: 'Notification read' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    await readAllService(session.id);
    revalidatePath('/dashboard/notifications');
    revalidatePath('/dashboard');
    return { success: true, message: 'All notifications marked as read' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
