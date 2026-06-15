// ============================================================
// app/admin/layout.tsx
// Admin workspace layout — RBAC-enforced shell wrapping all /admin/* routes.
// Mirrors the assessor pattern: sidebar + navbar + scrollable content area.
// ============================================================

import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { UserRole } from '@/lib/constants/enums';
import { getUnreadNotificationCount } from '@/services/notification.service';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Defense-in-depth RBAC — middleware already handles edge cases
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  const unreadCount = await getUnreadNotificationCount(session.id);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base-950)] selection:bg-indigo-500/30 selection:text-white">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar session={session} unreadCount={unreadCount} />

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
