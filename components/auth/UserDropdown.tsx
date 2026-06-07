'use client';

// ============================================================
// components/auth/UserDropdown.tsx
// Animated dropdown menu for authenticated users.
// Renders role-specific navigation links.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Activity, Bell, Settings, LogOut, Users, ShieldAlert, CheckSquare } from 'lucide-react';
import { JWTPayload } from '@/lib/auth/jwt';
import { UserRole } from '@/lib/constants/enums';
import { logoutAction } from '@/app/actions/auth.actions';

interface UserDropdownProps {
  isOpen: boolean;
  session: JWTPayload;
  onClose: () => void;
}

export function UserDropdown({ isOpen, session, onClose }: UserDropdownProps) {
  let links: { label: string; href: string; icon: React.ReactNode }[] = [];

  if (session.role === UserRole.CUSTOMER) {
    links = [
      { label: 'My Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'My Policies', href: '/policies', icon: <FileText className="w-4 h-4" /> },
      { label: 'My Claims', href: '/claims', icon: <Activity className="w-4 h-4" /> },
      { label: 'Notifications', href: '/notifications', icon: <Bell className="w-4 h-4" /> },
      { label: 'Profile Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ];
  } else if (session.role === UserRole.ASSESSOR) {
    links = [
      { label: 'Assessor Workspace', href: '/assessor', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Assigned Claims', href: '/assessor/claims', icon: <FileText className="w-4 h-4" /> },
      { label: 'Review Queue', href: '/assessor/queue', icon: <CheckSquare className="w-4 h-4" /> },
      { label: 'Profile Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ];
  } else if (session.role === UserRole.ADMIN) {
    links = [
      { label: 'Admin Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'User Management', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Policy Management', href: '/admin/policies', icon: <ShieldAlert className="w-4 h-4" /> },
      { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="w-4 h-4" /> },
      { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
    ];
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-base-600)] bg-[var(--color-base-800)]/90 backdrop-blur-xl shadow-2xl p-1.5 overflow-hidden z-50 origin-top-right"
        >
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-[var(--color-base-300)] hover:text-white hover:bg-[var(--color-base-700)] transition-all duration-150"
              >
                <span className="text-[var(--color-base-500)]">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            <div className="my-1 border-t border-[var(--color-base-600)]" />
            
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-[var(--color-danger-400)] hover:text-white hover:bg-[var(--color-danger-500)] transition-all duration-150 group"
              >
                <LogOut className="w-4 h-4 text-[var(--color-danger-400)] group-hover:text-white transition-colors" />
                Sign Out
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
