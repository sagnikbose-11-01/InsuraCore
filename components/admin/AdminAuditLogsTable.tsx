'use client';

// ============================================================
// components/admin/AdminAuditLogsTable.tsx
// Client component to show a list of general audit logs
// with advanced searching and filtering.
// ============================================================

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Search,
  User,
  Shield,
  FileText,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface AuditLog {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  entityId: string;
  entityType: string;
  action: string;
  remarks?: string;
  createdAt: string;
}

interface Props {
  initialLogs: AuditLog[];
}

export function AdminAuditLogsTable({ initialLogs }: Props) {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = logs.filter((log) => {
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.remarks && log.remarks.toLowerCase().includes(search.toLowerCase())) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 flex-wrap gap-3 w-full md:w-auto">
          <Input
            placeholder="Search actor name, action, remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
            leftAdornment={<Search className="w-4 h-4" />}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ASSESSOR">ASSESSOR</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Entities</option>
            <option value="CLAIM">CLAIM</option>
            <option value="POLICY">POLICY</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* Audit logs listing table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Role</th>
                <th>Entity Type</th>
                <th>Action Type</th>
                <th>Remarks / Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--color-base-500)]">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.01]">
                    {/* Actor Name */}
                    <td>
                      <p className="text-xs font-bold text-white">{log.actorName}</p>
                    </td>

                    {/* Actor Role */}
                    <td>
                      <Badge variant={log.actorRole === 'ADMIN' ? 'danger' : log.actorRole === 'ASSESSOR' ? 'info' : 'success'}>
                        {log.actorRole}
                      </Badge>
                    </td>

                    {/* Entity Type & Ref ID */}
                    <td>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{log.entityType}</span>
                        <p className="text-[10px] font-mono text-[var(--color-base-500)] truncate max-w-[150px]">{log.entityId}</p>
                      </div>
                    </td>

                    {/* Action Type */}
                    <td>
                      <span className="text-xs font-semibold text-[var(--color-base-200)]">{log.action.replace(/_/g, ' ')}</span>
                    </td>

                    {/* Remarks */}
                    <td className="max-w-[250px] truncate text-xs text-[var(--color-base-400)]" title={log.remarks}>
                      {log.remarks || '—'}
                    </td>

                    {/* Timestamp */}
                    <td className="text-[11px] text-[var(--color-base-500)]">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
