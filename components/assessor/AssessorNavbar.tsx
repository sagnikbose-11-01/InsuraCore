// ============================================================
// components/assessor/AssessorNavbar.tsx
// Top navigation for the Assessor Workspace.
// Contains search, notifications, theme toggle, and profile.
// ============================================================

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UserNav } from '@/components/auth/UserNav';
import { JWTPayload } from '@/lib/auth/jwt';

export function AssessorNavbar({ session }: { session: JWTPayload }) {
  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)] group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            placeholder="Search claims, policies, or users..."
            className="w-full bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--color-base-200)] placeholder:text-[var(--color-base-500)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-[var(--color-base-700)] bg-[var(--color-base-800)] text-[10px] font-medium text-[var(--color-base-500)]">
              ⌘
            </kbd>
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-[var(--color-base-700)] bg-[var(--color-base-800)] text-[10px] font-medium text-[var(--color-base-500)]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        <button className="relative p-2 rounded-full hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[var(--color-base-950)]" />
        </button>
        <ThemeToggle />
        <div className="w-px h-6 bg-[rgba(255,255,255,0.06)] mx-1" />
        <UserNav session={session} />
      </div>
    </header>
  );
}
