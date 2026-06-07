// ============================================================
// app/assessor/settings/page.tsx
// Settings Page for the Assessor Workspace.
// ============================================================

import React from 'react';
import { Metadata } from 'next';
import { Settings, Bell, Lock, Key } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | Assessor Workspace',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-[var(--color-base-400)] mt-1">
          Configure notifications, account security, and dashboard preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar (internal) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-semibold text-left">
            <Settings className="w-4 h-4" /> Preferences
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-base-900)] text-[var(--color-base-400)] hover:text-white border border-transparent text-sm font-semibold text-left transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-base-900)] text-[var(--color-base-400)] hover:text-white border border-transparent text-sm font-semibold text-left transition-colors">
            <Lock className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-base-900)] text-[var(--color-base-400)] hover:text-white border border-transparent text-sm font-semibold text-left transition-colors">
            <Key className="w-4 h-4" /> Passwords
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 glass-card p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
           <Settings className="w-12 h-12 text-[var(--color-base-700)] mb-4 animate-[spin_10s_linear_infinite]" />
           <h2 className="text-lg font-bold text-white">General Preferences</h2>
           <p className="text-sm text-[var(--color-base-400)] max-w-sm mt-2">
             Detailed settings modules are being integrated. Check back later to manage your MFA and notification routing rules.
           </p>
        </div>
      </div>
    </div>
  );
}
