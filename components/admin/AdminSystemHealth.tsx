'use client';

// ============================================================
// components/admin/AdminSystemHealth.tsx
// Client component to show MongoDB connection response, server uptime,
// database collections size, and active alert warnings.
// ============================================================

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  HeartPulse,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';

interface Props {
  initialHealth: {
    database: {
      status: string;
      responseTime: number;
      collections: {
        users: number;
        policies: number;
        claims: number;
        documents: number;
        notifications: number;
        auditLogs: number;
        payments: number;
      };
    };
    operations: {
      pendingPayments: number;
      unassignedClaims: number;
      escalatedLast24h: number;
    };
    uptime: number;
    nodeEnv: string;
    checkedAt: string;
  };
}

export function AdminSystemHealth({ initialHealth }: Props) {
  const [health, setHealth] = useState(initialHealth);
  const [refreshing, setRefreshing] = useState(false);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // In next.js we can trigger a hard reload of router to update page server props
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action bar */}
      <div className="flex justify-between items-center bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="h-5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            All Systems Operational
          </Badge>
          <span className="text-[11px] text-[var(--color-base-500)]">
            Checked at {new Date(health.checkedAt).toLocaleTimeString()}
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DB Connection Health */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">MongoDB Replica Set</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-0.5">Database storage clusters connection</p>
            </div>
            <div className="space-y-2 border-t border-[var(--color-base-800)] pt-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-base-500)]">Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {health.database.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-base-500)]">Ping Latency</span>
                <span className={`font-semibold ${health.database.responseTime < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {health.database.responseTime} ms
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Server Process Environment */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <Badge variant="info">{health.nodeEnv.toUpperCase()}</Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">NextJS Server Instance</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-0.5">NodeJS server framework parameters</p>
            </div>
            <div className="space-y-2 border-t border-[var(--color-base-800)] pt-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-base-500)]">Uptime</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {formatUptime(health.uptime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-base-500)]">Engine</span>
                <span className="font-semibold text-[var(--color-base-300)]">Node.js {process.version || 'v18.17.0'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Operational Alerts */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              {health.operations.unassignedClaims > 0 || health.operations.pendingPayments > 0 ? (
                <Badge variant="warning">Alerts</Badge>
              ) : (
                <Badge variant="success">Nominal</Badge>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Operations Backlog</h4>
              <p className="text-xs text-[var(--color-base-500)] mt-0.5">Platform issues requiring human decisions</p>
            </div>
            <div className="space-y-2 border-t border-[var(--color-base-800)] pt-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-base-500)]">Unassigned Claims</span>
                <span className={`font-bold ${health.operations.unassignedClaims > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {health.operations.unassignedClaims} pending
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-base-500)]">Pending Payouts</span>
                <span className="font-semibold text-white">
                  {health.operations.pendingPayments} payments
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Database size collections */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Collection Registries</h4>
            <p className="text-xs text-[var(--color-base-500)]">Total documents count indexed inside MongoDB schemas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Users', count: health.database.collections.users },
            { label: 'Policies', count: health.database.collections.policies },
            { label: 'Claims', count: health.database.collections.claims },
            { label: 'Documents', count: health.database.collections.documents },
            { label: 'Notifications', count: health.database.collections.notifications },
            { label: 'Audit Logs', count: health.database.collections.auditLogs },
            { label: 'Payments', count: health.database.collections.payments },
          ].map((c) => (
            <div key={c.label} className="bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)] text-center">
              <span className="text-[10px] text-[var(--color-base-500)] uppercase font-semibold block mb-1">
                {c.label}
              </span>
              <span className="text-xl font-black text-white">{c.count}</span>
              <p className="text-[9px] text-[var(--color-base-650)] mt-0.5">documents</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
