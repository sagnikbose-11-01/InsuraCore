// ============================================================
// app/assessor/layout.tsx
// Shell layout for the Assessor Workspace.
// Integrates Sidebar, Navbar, and server-side session passing.
// ============================================================

import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AssessorSidebar } from '@/components/assessor/AssessorSidebar';
import { AssessorNavbar } from '@/components/assessor/AssessorNavbar';
import { UserRole } from '@/lib/constants/enums';

export default async function AssessorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Edge middleware already handles RBAC, but we add a secondary
  // server-side check here for defense-in-depth security.
  if (!session || session.role !== UserRole.ASSESSOR) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base-950)] selection:bg-purple-500/30 selection:text-white">
      <AssessorSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AssessorNavbar session={session} />
        
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
