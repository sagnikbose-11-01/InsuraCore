'use client';

// ============================================================
// components/admin/AdminSettingsPanel.tsx
// Client component for admin console settings and configurations.
// Supports profile inspection, risk thresholds, and notification toggles.
// ============================================================

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Shield,
  Settings,
  Bell,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Eye,
  Lock,
} from 'lucide-react';

interface Props {
  session: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function AdminSettingsPanel({ session }: Props) {
  const toast = useToast();
  
  // Compliance configs
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [autoReassign, setAutoReassign] = useState(true);
  const [requireDualSignoff, setRequireDualSignoff] = useState(false);
  
  // Notifications
  const [notifyOnFlags, setNotifyOnFlags] = useState(true);
  const [notifyOnEscalations, setNotifyOnEscalations] = useState(true);
  
  // Security
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Configuration rules saved successfully.');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xl text-indigo-400">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{session.name}</h4>
                <p className="text-xs text-[var(--color-base-500)] mt-0.5">{session.email}</p>
              </div>
              <Badge variant="danger" className="text-[10px] font-black uppercase">
                {session.role}
              </Badge>
            </div>
            
            <div className="border-t border-[var(--color-base-800)] pt-4 mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-base-500)]">User ID</span>
                <span className="font-mono text-white select-all">{session.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-base-500)]">Console Theme</span>
                <span className="font-semibold text-white">Indigo Dark</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-base-500)]">Account Status</span>
                <span className="font-bold text-emerald-400">Active</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Security Checklist</h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-base-500)]">MFA Protection</span>
                <Badge variant={mfaEnforced ? 'success' : 'warning'}>{mfaEnforced ? 'Enforced' : 'Disabled'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-base-500)]">IP Whitelist</span>
                <span className="text-[var(--color-base-400)]">Not Enforced</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Configurations Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compliance Configuration */}
          <Card>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-base-800)] pb-3">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Compliance & Risk Thresholds</h4>
                <p className="text-xs text-[var(--color-base-500)] mt-0.5">Parameters that control auto-flagging and workload queues</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Risk Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-base-300)] font-semibold">High-Risk Claim Threshold</span>
                  <span className="font-bold text-indigo-400">{riskThreshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-[var(--color-base-800)] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-[var(--color-base-500)]">Claims scoring above this threshold trigger automatic high-risk fraud reviews.</p>
              </div>

              {/* Toggle 1 */}
              <div className="flex items-start justify-between gap-4 pt-3 border-t border-[var(--color-base-850)]">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white">Auto-Assign Assessors</span>
                  <p className="text-[11px] text-[var(--color-base-500)]">Newly submitted claims are automatically routed to available matching assessors.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoReassign}
                  onChange={(e) => setAutoReassign(e.target.checked)}
                  className="w-8 h-4 bg-[var(--color-base-800)] rounded-full cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-start justify-between gap-4 pt-3 border-t border-[var(--color-base-850)]">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white">Dual Sign-Off Compliance</span>
                  <p className="text-[11px] text-[var(--color-base-500)]">Require secondary admin review for claim approvals exceeding ₹5,00,000.</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireDualSignoff}
                  onChange={(e) => setRequireDualSignoff(e.target.checked)}
                  className="w-8 h-4 bg-[var(--color-base-800)] rounded-full cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </Card>

          {/* Notifications config */}
          <Card>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-base-800)] pb-3">
              <Bell className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Notification Preferences</h4>
                <p className="text-xs text-[var(--color-base-500)] mt-0.5">Manage which administrative notifications trigger real-time alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-base-300)]">Alert on fraud-flagged submissions</span>
                <input
                  type="checkbox"
                  checked={notifyOnFlags}
                  onChange={(e) => setNotifyOnFlags(e.target.checked)}
                  className="w-8 h-4 accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-base-300)]">Alert on assessor claim escalations</span>
                <input
                  type="checkbox"
                  checked={notifyOnEscalations}
                  onChange={(e) => setNotifyOnEscalations(e.target.checked)}
                  className="w-8 h-4 accent-indigo-500"
                />
              </div>
            </div>
          </Card>

          {/* Security policy */}
          <Card>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-base-800)] pb-3">
              <Shield className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Security & Access Audits</h4>
                <p className="text-xs text-[var(--color-base-500)] mt-0.5">Enforce system login security and timeout parameters</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-base-300)] font-semibold">Enforce MFA for admins & assessors</span>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={(e) => setMfaEnforced(e.target.checked)}
                  className="w-8 h-4 accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-base-300)] font-semibold font-medium">Session Idle Invalidation</span>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="rounded bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-white p-1 focus:outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Action button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
