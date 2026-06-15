'use client';

// ============================================================
// components/admin/AdminActivityFeed.tsx
// Client component to show a detailed, filtered timeline of
// platform-wide activities (combining Claim audit and User action logs).
// ============================================================

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  Search,
  Filter,
  User,
  Shield,
  FileText,
  Clock,
  Settings,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface ActivityEvent {
  _id: string;
  source: 'CLAIM_AUDIT' | 'AUDIT_LOG';
  action: string;
  actorName: string;
  actorRole: string;
  entityRef: string;
  entityType: string;
  details: string;
  severity: 'success' | 'danger' | 'warning' | 'info' | 'default';
  createdAt: string;
}

interface Props {
  initialEvents: ActivityEvent[];
}

export function AdminActivityFeed({ initialEvents }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'CLAIM' | 'USER'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'ASSESSOR' | 'CUSTOMER'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'success' | 'danger' | 'warning' | 'info'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = events.filter((e) => {
    const matchesSource =
      sourceFilter === 'ALL' ||
      (sourceFilter === 'CLAIM' && e.source === 'CLAIM_AUDIT') ||
      (sourceFilter === 'USER' && e.source === 'AUDIT_LOG');

    const matchesRole = roleFilter === 'ALL' || e.actorRole === roleFilter;

    const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;

    const matchesSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actorName.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase()) ||
      e.entityRef.toLowerCase().includes(search.toLowerCase());

    return matchesSource && matchesRole && matchesSeverity && matchesSearch;
  });

  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = {
      success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      danger: 'text-red-400 bg-red-500/10 border-red-500/20',
      warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      default: 'text-[var(--color-base-400)] bg-[var(--color-base-800)] border-[var(--color-base-700)]',
    };
    return colors[sev] ?? colors.default;
  };

  const getSourceIcon = (src: string) => {
    return src === 'CLAIM_AUDIT' ? (
      <FileText className="w-4 h-4 text-indigo-400" />
    ) : (
      <User className="w-4 h-4 text-purple-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex flex-1 flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search actions, actors, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-[var(--color-base-500)] absolute left-3 top-2.5" />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Sources</option>
            <option value="CLAIM">Claims Audit Feed</option>
            <option value="USER">User Actions Ledger</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Actor Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ASSESSOR">ASSESSOR</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <Card>
        {filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-[var(--color-base-600)] mb-3" />
            <h3 className="font-bold text-white text-base">No activities recorded</h3>
            <p className="text-xs text-[var(--color-base-500)] mt-1">Activities matching your search will be displayed here.</p>
          </div>
        ) : (
          <div className="relative border-l border-[var(--color-base-800)] ml-6 pl-6 space-y-6 py-4">
            {filtered.map((event) => (
              <div key={event._id} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-[37px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-[var(--color-base-100)] ${
                  getSeverityColor(event.severity)
                }`}>
                  {getSourceIcon(event.source)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {event.action}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      event.actorRole === 'ADMIN'
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                        : event.actorRole === 'ASSESSOR'
                        ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                        : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }`}>
                      {event.actorRole}
                    </span>
                    <span className="text-[10px] text-[var(--color-base-650)] font-mono">
                      Ref: {event.entityRef}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-base-300)]">
                    Triggered by <span className="font-semibold text-white">{event.actorName}</span>
                    {event.details ? ` — ${event.details}` : ''}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-base-500)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
