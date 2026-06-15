'use client';

// ============================================================
// components/admin/AdminSidebar.tsx
// Premium enterprise sidebar for the Admin Console.
// Indigo accent — distinguishes from assessor (purple) and customer (brand blue).
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  BadgeCheck,
  FileText,
  CheckSquare,
  Shield,
  Store,
  BarChart3,
  FileSpreadsheet,
  Bell,
  Activity,
  ScrollText,
  HeartPulse,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth.actions';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Users',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: UserCheck },
      { href: '/admin/assessors', label: 'Assessors', icon: BadgeCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/claims', label: 'Claims', icon: FileText },
      { href: '/admin/approvals', label: 'Approvals', icon: CheckSquare },
      { href: '/admin/policies', label: 'Policies', icon: Shield },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
      { href: '/admin/activity', label: 'Activity Center', icon: Activity },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
      { href: '/admin/system-health', label: 'System Health', icon: HeartPulse },
    ],
  },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold',
        'transition-all duration-200 group relative overflow-hidden',
        isActive
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.05)]'
          : 'text-[var(--color-base-400)] hover:bg-[var(--color-base-900)] hover:text-white border border-transparent'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive
            ? 'text-indigo-400'
            : 'text-[var(--color-base-500)] group-hover:text-indigo-400'
        )}
      />
      <span className="relative z-10 truncate">{item.label}</span>
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent z-0 pointer-events-none" />
      )}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400/60 flex-shrink-0" />
      )}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  }

  function toggleSection(label: string) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/80 backdrop-blur-xl h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/admin" className="flex items-center gap-3 group w-full">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            bg-gradient-to-br from-indigo-500 to-violet-600
            shadow-[0_0_20px_rgba(99,102,241,0.35)]
            group-hover:scale-105 transition-transform duration-200"
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-white text-sm tracking-tight block">
              InsuraCore
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map((section) => {
          const isSectionCollapsed = collapsed[section.label];
          return (
            <div key={section.label}>
              {section.label !== 'Overview' && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-3 mb-1 group"
                >
                  <span className="text-[10px] font-bold text-[var(--color-base-500)] uppercase tracking-widest group-hover:text-[var(--color-base-400)] transition-colors">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 text-[var(--color-base-600)] transition-transform duration-200',
                      isSectionCollapsed ? '-rotate-90' : ''
                    )}
                  />
                </button>
              )}
              {!isSectionCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={isActive(item.href)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer — Divider + Settings + Logout */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] space-y-1">
        <Link
          href="/admin/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold',
            'text-[var(--color-base-400)] hover:bg-[var(--color-base-900)] hover:text-white border border-transparent',
            'transition-all duration-200 group'
          )}
        >
          <Settings className="w-4 h-4 text-[var(--color-base-500)] group-hover:text-indigo-400 transition-colors" />
          Settings
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold
              text-[var(--color-danger-400)] hover:bg-[var(--color-danger-bg)]
              border border-transparent hover:border-[var(--color-danger-500)]/20
              transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 transition-colors" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
