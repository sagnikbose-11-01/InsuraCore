// ============================================================
// components/admin/AdminNavbar.tsx
// Top navigation bar for the Admin Console.
// Server component — receives session + unread count from layout.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Bell, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UserNav } from '@/components/auth/UserNav';
import { JWTPayload } from '@/lib/auth/jwt';

interface AdminNavbarProps {
  session: JWTPayload;
  unreadCount?: number;
}

export function AdminNavbar({ session, unreadCount = 0 }: AdminNavbarProps) {
  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: breadcrumb / title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-400 tracking-wide uppercase">
            Admin
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--color-base-500)]">
          <span className="font-medium text-[var(--color-base-300)]">{session.name}</span>
          <span className="text-[var(--color-base-600)]">·</span>
          <span>Platform Administrator</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-full hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white border-2 border-[var(--color-base-950)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <ThemeToggle />

        <div className="w-px h-6 bg-[rgba(255,255,255,0.08)] mx-1" />

        <UserNav session={session} />
      </div>
    </header>
  );
}
