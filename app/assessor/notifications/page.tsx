// ============================================================
// app/assessor/notifications/page.tsx
// Assessor notifications page.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyNotifications } from '@/services/notification.service';
import { AssessorNotificationsList } from './AssessorNotificationsList';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications | Assessor Workspace',
};

export default async function AssessorNotificationsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const notifications = await getMyNotifications(session.id);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-400" /> Notifications Inbox
          </h1>
          <p className="text-sm text-[var(--color-base-400)] mt-1">
            Stay updated with claims assigned to you, document verification tasks, and system updates.
          </p>
        </div>
      </div>

      <AssessorNotificationsList initialNotifications={notifications} />
    </div>
  );
}
