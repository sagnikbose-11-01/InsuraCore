'use client';
// ============================================================
// components/shared/Sidebar.tsx
// Role-aware sidebar navigation with brand identity,
// active link highlighting, and logout action.
// ============================================================

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShieldCheck, FileText, PlusCircle, Bell, User,
  ClipboardList, Users, BarChart3, LogOut, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { logoutAction } from '@/app/actions/auth.actions';
import { SerializedUser } from '@/types';
import { UserRole } from '@/lib/constants/enums';
import { NAV_BY_ROLE } from '@/lib/constants/navigation';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  PlusCircle: <PlusCircle className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
};

interface SidebarProps {
  user: SerializedUser;
  onLinkClick?: () => void;
}

export function Sidebar({ user, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[user.role as UserRole] ?? [];

  return (
    <aside className="flex flex-col h-full w-64 bg-[var(--color-base-900)] border-r border-[var(--color-base-800)]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-base-800)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center glow-brand">
          <span className="text-white font-black text-xs tracking-tight">IC</span>
        </div>
        <div>
          <span className="font-bold text-base text-[var(--color-base-100)] tracking-tight">
            InsuraCore
          </span>
          <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-widest font-medium">
            {user.role}
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {/* Back to Homepage */}
        <Link
          href="/"
          onClick={onLinkClick}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-[var(--color-base-500)] hover:text-[var(--color-base-200)] hover:bg-[var(--color-base-800)] mb-2 border-b border-[var(--color-base-800)] pb-3"
        >
          <span className="flex-shrink-0 text-[var(--color-base-600)] group-hover:text-[var(--color-base-400)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          Back to Homepage
        </Link>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-all duration-150',
                isActive
                  ? 'bg-[oklch(18%_0.08_230)] text-[var(--color-brand-300)] border border-[oklch(28%_0.10_230)]'
                  : 'text-[var(--color-base-400)] hover:text-[var(--color-base-200)] hover:bg-[var(--color-base-800)]'
              )}
            >
              <span className={cn(
                'flex-shrink-0 transition-colors',
                isActive ? 'text-[var(--color-brand-400)]' : 'text-[var(--color-base-500)] group-hover:text-[var(--color-base-300)]'
              )}>
                {ICON_MAP[item.icon]}
              </span>
              {item.label}
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[var(--color-brand-400)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="px-3 py-4 border-t border-[var(--color-base-800)] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-base-800)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-700)] flex items-center justify-center text-xs font-bold text-[var(--color-brand-200)] flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--color-base-200)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--color-base-500)] truncate">{user.email}</p>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-[var(--color-base-500)] font-semibold">Appearance</span>
          <ThemeToggle />
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-base-500)] hover:text-[var(--color-danger-400)] hover:bg-[var(--color-danger-bg)] transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
