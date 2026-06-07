import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AssessorSidebar } from '@/components/assessor/AssessorSidebar';
import { AssessorNavbar } from '@/components/assessor/AssessorNavbar';
import { UserRole } from '@/lib/constants/enums';
import { getUnreadNotificationCount } from '@/services/notification.service';

export default async function AssessorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Edge middleware already handles RBAC, but we add a secondary
  // server-side check here for defense-in-depth security.
  if (!session || session.role !== UserRole.ASSESSOR) {
    redirect('/auth/login');
  }

  const unreadCount = await getUnreadNotificationCount(session.id);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base-950)] selection:bg-purple-500/30 selection:text-white">
      <AssessorSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AssessorNavbar session={session} unreadCount={unreadCount} />
        
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
