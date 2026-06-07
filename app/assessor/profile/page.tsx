// ============================================================
// app/assessor/profile/page.tsx
// Profile Page for the Assessor Workspace.
// ============================================================

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Assessor Workspace',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Assessor Profile</h1>
        <p className="text-sm text-[var(--color-base-400)] mt-1">
          Manage your operational credentials and public information.
        </p>
      </div>

      <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 bg-purple-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl font-black text-purple-400">P</span>
        </div>
        <h2 className="text-lg font-bold text-white">Profile settings coming soon</h2>
        <p className="text-sm text-[var(--color-base-400)] max-w-md mt-2">
          This section is currently under construction. Employee ID, Specialization mapping, and performance badges will be available in the next release.
        </p>
      </div>
    </div>
  );
}
