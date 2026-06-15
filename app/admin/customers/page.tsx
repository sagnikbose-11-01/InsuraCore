import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminCustomers } from '@/services/admin.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminCustomersTable } from '@/components/admin/AdminCustomersTable';
import { UserRole } from '@/lib/constants/enums';

export const metadata: Metadata = {
  title: 'Customer Management | Admin Console',
  description: 'Enterprise administration tool for platform customer database management.',
};

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/auth/login');
  }

  const customers = await getAdminCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        description="View customer demographics, policy holdings, claiming success rates, and enforce account suspensions."
      />
      <AdminCustomersTable initialCustomers={customers} />
    </div>
  );
}
