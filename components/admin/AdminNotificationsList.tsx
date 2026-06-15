'use client';

// ============================================================
// components/admin/AdminNotificationsList.tsx
// Client component to show system notifications and mark them as read.
// Includes beautiful styling with Indigo theme.
// ============================================================

import React, { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/app/actions/notification.actions';
import {
  Bell,
  CheckCheck,
  Search,
  CheckCircle,
  Inbox,
  User,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface NotificationData {
  _id: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  initialNotifications: NotificationData[];
}

export function AdminNotificationsList({ initialNotifications }: Props) {
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [isReadFilter, setIsReadFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = async (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsReadAction(id);
      if (res.success) {
        toast.success('Notification marked as read');
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      } else {
        toast.error(res.message || 'Failed to update notification');
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        toast.success('All notifications marked as read');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } else {
        toast.error(res.message || 'Failed to update notifications');
      }
    });
  };

  const filtered = notifications.filter((n) => {
    const matchesRead =
      isReadFilter === 'ALL' ||
      (isReadFilter === 'UNREAD' && !n.isRead) ||
      (isReadFilter === 'READ' && n.isRead);

    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      n.userId?.name.toLowerCase().includes(search.toLowerCase());

    return matchesRead && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Search and action controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-[var(--color-base-500)] absolute left-3 top-2.5" />
          </div>

          <select
            value={isReadFilter}
            onChange={(e) => setIsReadFilter(e.target.value as any)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              variant="secondary"
              leftIcon={<CheckCheck className="w-4 h-4" />}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <Card>
        {filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Inbox className="w-12 h-12 text-[var(--color-base-600)] mb-3" />
            <h3 className="font-bold text-white text-base">Inbox is empty</h3>
            <p className="text-xs text-[var(--color-base-500)] mt-1">No notifications match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-base-800)]">
            {filtered.map((notification) => (
              <div
                key={notification._id}
                className={`flex gap-4 p-4 hover:bg-white/[0.01] transition-colors relative group ${
                  !notification.isRead ? 'bg-indigo-500/[0.02]' : ''
                }`}
              >
                {/* Unread indicator bar */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l" />
                )}

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !notification.isRead
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-[var(--color-base-800)] text-[var(--color-base-500)]'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm font-semibold text-white ${!notification.isRead ? 'font-bold text-indigo-100' : ''}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-[var(--color-base-400)] mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    <span className="text-[10px] text-[var(--color-base-500)] flex-shrink-0">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2.5">
                    {notification.userId && (
                      <div className="flex items-center gap-1 text-[10px] text-[var(--color-base-500)] uppercase font-semibold">
                        <User className="w-3.5 h-3.5" />
                        <span>{notification.userId.name} ({notification.userId.role})</span>
                      </div>
                    )}

                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={isPending}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
