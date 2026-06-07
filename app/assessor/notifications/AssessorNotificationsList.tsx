'use client';

// ============================================================
// app/assessor/notifications/AssessorNotificationsList.tsx
// Inbox list displaying assessor notifications.
// Notifications with a claimId are clickable and route to /assessor/review/[claimId].
// ============================================================

import { useState, useTransition } from 'react';
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/app/actions/notification.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SerializedNotification } from '@/types';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatters';
import { Bell, Check, CheckCheck, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  initialNotifications: SerializedNotification[];
}

export function AssessorNotificationsList({ initialNotifications }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationAsReadAction(id);
    router.refresh();
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      router.refresh();
    });
  }

  async function handleNotificationClick(n: SerializedNotification) {
    // Mark as read if unread
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === n._id ? { ...notif, isRead: true } : notif))
      );
      await markNotificationAsReadAction(n._id);
    }
    // Navigate to claim review if claimId is available
    if (n.claimId) {
      router.push(`/assessor/review/${n.claimId}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-between items-center bg-[var(--color-base-900)]/60 p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
          <span className="text-sm font-medium text-[var(--color-base-300)]">
            You have <strong className="text-purple-400">{unreadCount}</strong> unread notifications
          </span>
          <Button
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            leftIcon={isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            Mark all read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="py-16 text-center border-dashed border-[rgba(255,255,255,0.08)] bg-[var(--color-base-950)]/20">
          <Bell className="w-12 h-12 mx-auto text-[var(--color-base-750)] mb-4 animate-pulse" />
          <h3 className="text-base font-semibold text-[var(--color-base-300)] mb-1">Inbox Empty</h3>
          <p className="text-xs text-[var(--color-base-500)] max-w-sm mx-auto">
            You are fully caught up. We will alert you when new claims are assigned or documents are uploaded.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={cn(
                'p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5',
                n.claimId ? 'cursor-pointer' : 'cursor-default',
                n.isRead
                  ? 'bg-[var(--color-base-900)]/30 border-[rgba(255,255,255,0.03)] opacity-70 hover:opacity-100'
                  : 'bg-purple-500/5 border-purple-500/15 shadow-[0_0_10px_rgba(168,85,247,0.02)] hover:bg-purple-500/10'
              )}
            >
              <div className={cn(
                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                n.isRead ? 'bg-transparent' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              )} />

              <div className="flex-1 min-w-0">
                {n.title && (
                  <h4 className={cn('text-sm font-bold mb-1 flex items-center gap-1.5', n.isRead ? 'text-[var(--color-base-300)]' : 'text-white')}>
                    {n.title}
                    {n.claimId && (
                      <ExternalLink className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    )}
                  </h4>
                )}
                <p className={cn('text-xs leading-relaxed', n.isRead ? 'text-[var(--color-base-400)] font-normal' : 'text-[var(--color-base-200)] font-medium')}>
                  {n.message}
                </p>
                {n.claimId && (
                  <span className="text-[10px] text-purple-400/70 block mt-1">
                    Click to open claim review →
                  </span>
                )}
                <span className="text-[10px] text-[var(--color-base-600)] block mt-2">{formatDate(n.createdAt)}</span>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                  className="text-[var(--color-base-500)] hover:text-purple-400 p-1.5 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
