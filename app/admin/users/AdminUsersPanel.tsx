'use client';
// ============================================================
// app/admin/users/AdminUsersPanel.tsx
// Client component to list users, filter by role, and create users.
// ============================================================

import { useState, useTransition } from 'react';
import { adminCreateUserAction } from '@/app/actions/admin.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatters';
import { SerializedUser } from '@/types';
import { UserRole } from '@/lib/constants/enums';
import { Plus, XCircle, Search, Mail, Phone, Lock, Shield, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  initialUsers: SerializedUser[];
}

const ROLE_BADGES = {
  [UserRole.ADMIN]: 'danger',
  [UserRole.ASSESSOR]: 'info',
  [UserRole.CUSTOMER]: 'success',
} as const;

export function AdminUsersPanel({ initialUsers }: Props) {
  const toast = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [openForm, setOpenForm] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ASSESSOR);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('role', role);

    startTransition(async () => {
      const res = await adminCreateUserAction(formData);
      if (res.success && res.data) {
        setUsers((prev) => [res.data!, ...prev]);
        toast.success(`User ${res.data.name} created successfully!`);
        setOpenForm(false);
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setRole(UserRole.ASSESSOR);
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to create new user.');
        if (res.errors) {
          const flat: Record<string, string> = {};
          Object.entries(res.errors).forEach(([k, v]) => { flat[k] = v[0]; });
          setFieldErrors(flat);
        }
      }
    });
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px]"
            leftAdornment={<Search className="w-4 h-4" />}
          />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
          >
            <option value="ALL">All Roles</option>
            <option value={UserRole.CUSTOMER}>Customers</option>
            <option value={UserRole.ASSESSOR}>Assessors</option>
            <option value={UserRole.ADMIN}>Admins</option>
          </select>
        </div>

        <Button onClick={() => setOpenForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add User
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Form Panel */}
        {openForm && (
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <Card>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-[var(--color-base-100)]">
                  Add New User / Staff
                </h3>
                <button
                  onClick={() => setOpenForm(false)}
                  className="text-[var(--color-base-500)] hover:text-[var(--color-base-300)]"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 text-xs rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-[var(--color-danger-400)] mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Assessor"
                  required
                  error={fieldErrors.name}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@insuracore.com"
                  required
                  error={fieldErrors.email}
                  leftAdornment={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543211"
                  required
                  error={fieldErrors.phone}
                  leftAdornment={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Temporary Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 num"
                  required
                  error={fieldErrors.password}
                  leftAdornment={<Lock className="w-4 h-4" />}
                />

                <div>
                  <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] p-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
                  >
                    <option value={UserRole.CUSTOMER}>Customer</option>
                    <option value={UserRole.ASSESSOR}>Assessor</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>

                <Button type="submit" isLoading={isPending} className="w-full mt-2" leftIcon={<UserPlus className="w-4 h-4" />}>
                  Create User Account
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Users Table / List */}
        <div className={cn(openForm ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <Card>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Date Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-700)] flex items-center justify-center text-xs font-bold text-[var(--color-brand-200)] flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-base-200)]">{u.name}</p>
                            <p className="text-xs text-[var(--color-base-500)]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-xs text-[var(--color-base-300)] font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[var(--color-base-500)]" /> {u.email}</p>
                        <p className="text-xs text-[var(--color-base-300)] font-medium flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5 text-[var(--color-base-500)]" /> {u.phone}</p>
                      </td>
                      <td>
                        <Badge variant={ROLE_BADGES[u.role as UserRole]}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="text-xs text-[var(--color-base-500)]">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
