// ============================================================
// lib/constants/navigation.ts
// Navigation config for all role-based sidebars.
// ============================================================

import { UserRole } from './enums';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const CUSTOMER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Policies', href: '/dashboard/policies', icon: 'ShieldCheck' },
  { label: 'My Claims', href: '/dashboard/claims', icon: 'FileText' },
  { label: 'File a Claim', href: '/dashboard/claims/file', icon: 'PlusCircle' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'User' },
];

export const ASSESSOR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/assessor', icon: 'LayoutDashboard' },
  { label: 'Assigned Claims', href: '/assessor/claims', icon: 'ClipboardList' },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Policies', href: '/admin/policies', icon: 'ShieldCheck' },
  { label: 'Claims', href: '/admin/claims', icon: 'FileText' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
];

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  [UserRole.CUSTOMER]: CUSTOMER_NAV,
  [UserRole.ASSESSOR]: ASSESSOR_NAV,
  [UserRole.ADMIN]: ADMIN_NAV,
};
