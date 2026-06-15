'use client';

// ============================================================
// components/admin/AdminCustomersTable.tsx
// Premium enterprise-grade table for managing customer accounts.
// Renders comprehensive metric highlights and advanced filters.
// ============================================================

import React, { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { adminSuspendUserAction, adminActivateUserAction } from '@/app/actions/admin.actions';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Ban,
  CheckCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface CustomerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  dob: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  policyCount: number;
  activePolicies: number;
  claimCount: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  successRate: number;
  bio?: string;
}

interface Props {
  initialCustomers: CustomerData[];
}

export function AdminCustomersTable({ initialCustomers }: Props) {
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [isPending, startTransition] = useTransition();

  // Handle suspend/activate actions
  const handleToggleStatus = async (customer: CustomerData) => {
    const isSuspended = customer.bio?.includes('[SUSPENDED]');
    const action = isSuspended ? adminActivateUserAction : adminSuspendUserAction;
    
    startTransition(async () => {
      const res = await action(customer._id);
      if (res.success) {
        toast.success(res.message || 'Operation successful');
        setCustomers((prev) =>
          prev.map((c) => {
            if (c._id === customer._id) {
              return {
                ...c,
                bio: isSuspended ? '' : '[SUSPENDED] Account suspended by admin.',
              };
            }
            return c;
          })
        );
      } else {
        toast.error(res.message || 'Operation failed');
      }
    });
  };

  // Filter customers
  const filtered = customers.filter((c) => {
    const isSuspended = c.bio?.includes('[SUSPENDED]');
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUSPENDED' && isSuspended) ||
      (statusFilter === 'ACTIVE' && !isSuspended);

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Calculate totals for metrics cards
  const totalClaimedVal = customers.reduce((sum, c) => sum + c.totalClaimAmount, 0);
  const totalApprovedVal = customers.reduce((sum, c) => sum + c.totalApprovedAmount, 0);
  const totalPoliciesCount = customers.reduce((sum, c) => sum + c.policyCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Total Customers</p>
            <p className="text-2xl font-black text-white">{customers.length}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Active Policies</p>
            <p className="text-2xl font-black text-white">{totalPoliciesCount}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Total Claim Volume</p>
            <p className="text-xl font-black text-white">{formatCurrency(totalClaimedVal)}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Approved Payouts</p>
            <p className="text-xl font-black text-white">{formatCurrency(totalApprovedVal)}</p>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search name, email, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[250px]"
            leftAdornment={<Search className="w-4 h-4" />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Account</option>
            <option value="SUSPENDED">Suspended Account</option>
          </select>
        </div>
      </div>

      {/* Customers List Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact & Address</th>
                <th>Policy Holdings</th>
                <th>Claim Activity</th>
                <th>Account Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--color-base-500)]">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const isSuspended = customer.bio?.includes('[SUSPENDED]');
                  return (
                    <tr key={customer._id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Customer Info */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{customer.name}</p>
                            <p className="text-xs text-[var(--color-base-500)]">Registered {formatDate(customer.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-[var(--color-base-300)] flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[var(--color-base-500)]" /> {customer.email}
                          </p>
                          <p className="text-xs font-medium text-[var(--color-base-300)] flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[var(--color-base-500)]" /> {customer.phone || '—'}
                          </p>
                          {customer.address && (
                            <p className="text-[11px] text-[var(--color-base-500)] flex items-center gap-1.5 max-w-[200px] truncate">
                              <MapPin className="w-3.5 h-3.5 text-[var(--color-base-600)] flex-shrink-0" /> {customer.address}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Policies */}
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{customer.policyCount}</span>
                            <span className="text-xs text-[var(--color-base-500)]">Purchased</span>
                          </div>
                          <Badge variant={customer.activePolicies > 0 ? 'success' : 'default'}>
                            {customer.activePolicies} Active
                          </Badge>
                        </div>
                      </td>

                      {/* Claim Activity */}
                      <td>
                        {customer.claimCount > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-[var(--color-base-200)]">
                              <span className="font-bold text-white">{customer.claimCount}</span> claims filed
                            </p>
                            <p className="text-[11px] text-[var(--color-base-400)]">
                              Approved: <span className="text-emerald-400 font-bold">{formatCurrency(customer.totalApprovedAmount)}</span>
                            </p>
                            <p className="text-[10px] text-[var(--color-base-500)]">
                              Success Rate: <span className="font-bold text-[var(--color-base-300)]">{customer.successRate}%</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-base-600)]">No claims filed</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td>
                        <Badge variant={isSuspended ? 'danger' : 'success'}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <Button
                          variant={isSuspended ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleStatus(customer)}
                          disabled={isPending}
                          leftIcon={isSuspended ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        >
                          {isSuspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
