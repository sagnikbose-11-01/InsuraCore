'use client';

// ============================================================
// components/admin/AdminAssessorsTable.tsx
// Premium enterprise-grade table for monitoring assessor performance.
// Renders workload balances, resolution benchmarks, and suspension actions.
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
  Briefcase,
  Zap,
  Activity,
  Award,
  Ban,
  CheckCircle,
  Clock,
  ThumbsUp,
  Percent,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface AssessorData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  employeeId?: string;
  specialization: string;
  yearsOfExperience?: number;
  lastLoginAt: string | null;
  createdAt: string;
  assignedClaims: number;
  activeClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalApprovedAmount: number;
  totalReviewed: number;
  approvalRate: number;
  avgResolutionTime: string;
  performanceScore: number;
  bio?: string;
}

interface Props {
  initialAssessors: AssessorData[];
}

const SPEC_BADGES: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  HEALTH: 'success',
  AUTO: 'info',
  PROPERTY: 'warning',
  LIFE: 'danger',
  TRAVEL: 'default',
};

export function AdminAssessorsTable({ initialAssessors }: Props) {
  const toast = useToast();
  const [assessors, setAssessors] = useState<AssessorData[]>(initialAssessors);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = async (assessor: AssessorData) => {
    const isSuspended = assessor.bio?.includes('[SUSPENDED]');
    const action = isSuspended ? adminActivateUserAction : adminSuspendUserAction;

    startTransition(async () => {
      const res = await action(assessor._id);
      if (res.success) {
        toast.success(res.message || 'Operation successful');
        setAssessors((prev) =>
          prev.map((a) => {
            if (a._id === assessor._id) {
              return {
                ...a,
                bio: isSuspended ? '' : '[SUSPENDED] Account suspended by admin.',
              };
            }
            return a;
          })
        );
      } else {
        toast.error(res.message || 'Operation failed');
      }
    });
  };

  const filtered = assessors.filter((a) => {
    const isSuspended = a.bio?.includes('[SUSPENDED]');
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUSPENDED' && isSuspended) ||
      (statusFilter === 'ACTIVE' && !isSuspended);

    const matchesSpec = specFilter === 'ALL' || a.specialization === specFilter;

    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.employeeId && a.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      (a.phone && a.phone.includes(search));

    return matchesStatus && matchesSpec && matchesSearch;
  });

  // KPI Calculations
  const avgWorkload = assessors.length > 0
    ? Math.round(assessors.reduce((sum, a) => sum + a.activeClaims, 0) / assessors.length)
    : 0;

  const highestScore = assessors.length > 0
    ? Math.max(...assessors.map((a) => a.performanceScore))
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Total Assessors</p>
            <p className="text-2xl font-black text-white">{assessors.length}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Avg Workload</p>
            <p className="text-2xl font-black text-white">{avgWorkload} claims</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Top Score</p>
            <p className="text-2xl font-black text-white">{highestScore}%</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-base-500)] uppercase font-semibold">Active Reviewers</p>
            <p className="text-2xl font-black text-white">
              {assessors.filter((a) => !a.bio?.includes('[SUSPENDED]')).length}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search name, email, employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[250px]"
            leftAdornment={<Search className="w-4 h-4" />}
          />

          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Specializations</option>
            <option value="HEALTH">HEALTH</option>
            <option value="AUTO">AUTO</option>
            <option value="PROPERTY">PROPERTY</option>
            <option value="LIFE">LIFE</option>
            <option value="TRAVEL">TRAVEL</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="SUSPENDED">Suspended Staff</option>
          </select>
        </div>
      </div>

      {/* Assessors Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assessor / ID</th>
                <th>Specialization</th>
                <th>Workload Balance</th>
                <th>Performance Metrics</th>
                <th>Account Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--color-base-500)]">
                    No assessors found.
                  </td>
                </tr>
              ) : (
                filtered.map((assessor) => {
                  const isSuspended = assessor.bio?.includes('[SUSPENDED]');
                  return (
                    <tr key={assessor._id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Assessor Name + ID */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                            {assessor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{assessor.name}</p>
                            <p className="text-[11px] text-[var(--color-base-500)]">ID: <span className="text-[var(--color-base-400)] font-semibold">{assessor.employeeId || '—'}</span></p>
                          </div>
                        </div>
                      </td>

                      {/* Specialization */}
                      <td>
                        <div className="space-y-1">
                          <Badge variant={SPEC_BADGES[assessor.specialization] || 'default'}>
                            {assessor.specialization}
                          </Badge>
                          {assessor.yearsOfExperience !== undefined && (
                            <p className="text-[10px] text-[var(--color-base-500)]">Exp: {assessor.yearsOfExperience} years</p>
                          )}
                        </div>
                      </td>

                      {/* Workload */}
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{assessor.activeClaims}</span>
                            <span className="text-xs text-[var(--color-base-500)]">claims active</span>
                          </div>
                          <p className="text-[10px] text-[var(--color-base-500)]">Total reviewed: {assessor.totalReviewed}</p>
                        </div>
                      </td>

                      {/* Performance */}
                      <td>
                        <div className="space-y-1.5 max-w-[200px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-base-400)] flex items-center gap-1"><Clock className="w-3 h-3 text-[var(--color-base-500)]" /> Avg time:</span>
                            <span className="font-semibold text-white">{assessor.avgResolutionTime}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-base-400)] flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-[var(--color-base-500)]" /> Approval Rate:</span>
                            <span className="font-semibold text-white">{assessor.approvalRate}%</span>
                          </div>
                          <div className="w-full bg-[var(--color-base-800)] rounded-full h-1">
                            <div
                              className="bg-indigo-500 h-1 rounded-full"
                              style={{ width: `${assessor.performanceScore}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-[var(--color-base-500)] uppercase font-semibold">
                            <span>Score</span>
                            <span>{assessor.performanceScore}%</span>
                          </div>
                        </div>
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
                          onClick={() => handleToggleStatus(assessor)}
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
