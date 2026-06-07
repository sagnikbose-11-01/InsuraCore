// ============================================================
// components/auth/RoleBadge.tsx
// Role Badge displaying semantic color tags.
// CUSTOMER -> Blue, ASSESSOR -> Purple, ADMIN -> Emerald
// ============================================================

import React from 'react';
import { UserRole } from '@/lib/constants/enums';
import { cn } from '@/lib/utils';

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  let badgeColorClass = '';

  switch (role) {
    case UserRole.CUSTOMER:
      badgeColorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      break;
    case UserRole.ASSESSOR:
      badgeColorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      break;
    case UserRole.ADMIN:
      badgeColorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      break;
  }

  return (
    <span
      className={cn(
        'px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md border',
        badgeColorClass,
        className
      )}
    >
      {role}
    </span>
  );
}
