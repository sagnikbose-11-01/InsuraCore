// ============================================================
// components/assessor/ActivityFeed.tsx
// Vertical timeline component showing history of a claim.
// ============================================================

import React from 'react';
import { Activity, CheckCircle, FileUp, AlertTriangle } from 'lucide-react';

const ACTIVITIES = [
  { id: 1, type: 'status', title: 'Claim Flagged for Fraud Review', time: 'Today, 10:15 AM', user: 'AI Copilot', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: 2, type: 'document', title: 'Documents Verified (2/3)', time: 'Yesterday, 04:30 PM', user: 'Assessor Raj', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 3, type: 'upload', title: 'Additional Documents Uploaded', time: 'Oct 15, 09:00 AM', user: 'Customer', icon: FileUp, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 4, type: 'creation', title: 'Claim Filed', time: 'Oct 14, 11:45 PM', user: 'Customer', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' },
];

export function ActivityFeed() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-900)]/50">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Activity Log
        </h3>
      </div>
      
      <div className="p-5">
        <div className="relative border-l border-[rgba(255,255,255,0.08)] ml-3 space-y-6 pb-2">
          {ACTIVITIES.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative pl-6">
                {/* Timeline Node */}
                <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-[var(--color-base-950)] ${activity.bg}`}>
                  <Icon className={`w-3 h-3 ${activity.color}`} />
                </div>
                
                {/* Content */}
                <div>
                  <p className="text-xs font-bold text-white">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[var(--color-base-500)]">{activity.time}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--color-base-700)]" />
                    <span className="text-[10px] font-medium text-[var(--color-base-400)]">by {activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
