'use client';

// ============================================================
// components/assessor/AssessorSidebar.tsx
// Premium vertical navigation for the Assessor Workspace.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CheckSquare, BarChart3, User, Settings, LogOut, Bell, Users, History, FileSpreadsheet, Award } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth.actions';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/assessor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assessor/claims', label: 'Work Queue', icon: FileText },
  { href: '/assessor/reviews', label: 'Review Center', icon: CheckSquare },
  { href: '/assessor/customers', label: 'Customer Directory', icon: Users },
  { href: '/assessor/history', label: 'Claim History', icon: History },
  { href: '/assessor/notifications', label: 'Notifications', icon: Bell },
  { href: '/assessor/performance', label: 'My Performance', icon: Award },
  { href: '/assessor/reports', label: 'Reports', icon: FileSpreadsheet },
  { href: '/assessor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/assessor/profile', label: 'Profile', icon: User },
  { href: '/assessor/settings', label: 'Settings', icon: Settings },
];

export function AssessorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/60 backdrop-blur-xl h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/assessor" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xs">IC</span>
          </div>
          <span className="font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
            Assessor Console
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const isActive = link.href === '/assessor'
            ? pathname === '/assessor'
            : pathname === link.href || 
              pathname.startsWith(link.href + '/') ||
              (link.href === '/assessor/reviews' && pathname.startsWith('/assessor/review'));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden',
                isActive 
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.05)]' 
                  : 'text-[var(--color-base-400)] hover:bg-[var(--color-base-900)] hover:text-white border border-transparent'
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-purple-400" : "text-[var(--color-base-500)] group-hover:text-purple-400 transition-colors")} />
              <span className="relative z-10">{link.label}</span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent z-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-danger-400)] hover:bg-[var(--color-danger-500)]/10 hover:text-[var(--color-danger-400)] border border-transparent hover:border-[var(--color-danger-500)]/20 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 text-[var(--color-danger-400)] group-hover:text-[var(--color-danger-400)] transition-colors" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
