import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAllUsers } from '@/services/user.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminUsersPanel } from './AdminUsersPanel';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = { title: 'Manage Users' };

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) redirect('/login');

  const users = await getAllUsers();

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage system access, roles, and profiles."
      />
      <AdminUsersPanel initialUsers={users} />
    </>
  );
}
