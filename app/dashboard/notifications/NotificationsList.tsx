'use client';
// ============================================================
// app/dashboard/notifications/NotificationsList.tsx
// Client component to display list of notifications,
// with click-to-read and mark-all-as-read actions.
// ============================================================

import { useState, useTransition } from 'react';
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/app/actions/notification.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SerializedNotification } from '@/types';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatters';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';

interface Props {
  initialNotifications: SerializedNotification[];
}

export function NotificationsList({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkRead(id: string) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationAsReadAction(id);
  }

  async function handleMarkAllRead() {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-between items-center bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
          <span className="text-sm font-medium text-[var(--color-base-300)]">
            You have <strong className="text-[var(--color-brand-400)]">{unreadCount}</strong> unread notifications
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={isPending}
            leftIcon={isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark all read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <Bell className="w-12 h-12 mx-auto text-[var(--color-base-700)] mb-4 animate-pulse" />
          <h3 className="text-base font-semibold text-[var(--color-base-300)] mb-1">All quiet here</h3>
          <p className="text-sm text-[var(--color-base-500)]">
            We will let you know when something requires your attention.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={cn(
                'p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer',
                n.isRead
                  ? 'bg-[var(--color-base-900)] border-[var(--color-base-850)] opacity-75'
                  : 'bg-[oklch(15%_0.04_230)] border-[oklch(28%_0.08_230)] shadow-[0_0_8px_oklch(58%_0.22_230_/_0.05)] hover:bg-[oklch(18%_0.06_230)]'
              )}
            >
              <div className={cn(
                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                n.isRead ? 'bg-transparent' : 'bg-[oklch(72%_0.20_230)]'
              )} />

              <div className="flex-1 min-w-0">
                <p className={cn('text-sm leading-relaxed', n.isRead ? 'text-[var(--color-base-400)] font-normal' : 'text-[var(--color-base-200)] font-medium')}>
                  {n.message}
                </p>
                <span className="text-[10px] text-[var(--color-base-600)] block mt-1.5">{formatDate(n.createdAt)}</span>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                  className="text-[var(--color-base-500)] hover:text-[oklch(72%_0.20_230)] p-1 transition-colors"
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
