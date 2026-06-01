// ============================================================
// components/shared/DashboardShell.tsx
// Server Component wrapper providing the 2-column layout
// (sidebar + main content area) for all protected pages.
// ============================================================

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getUserById } from '@/services/user.service';
import { DashboardLayoutWrapper } from './DashboardLayoutWrapper';
import { UserRole } from '@/lib/constants/enums';

interface DashboardShellProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export async function DashboardShell({ children, requiredRole }: DashboardShellProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  if (requiredRole && session.role !== requiredRole && session.role !== UserRole.ADMIN) {
    redirect('/login');
  }

  const user = await getUserById(session.id);
  if (!user) redirect('/login');

  return (
    <DashboardLayoutWrapper user={user}>
      {children}
    </DashboardLayoutWrapper>
  );
}
