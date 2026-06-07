// ============================================================
// components/auth/UserAvatar.tsx
// Displays a user's initials with a premium glowing background.
// Color maps to the user's role.
// ============================================================

import React from 'react';
import { UserRole } from '@/lib/constants/enums';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  role: UserRole;
  className?: string;
}

export function UserAvatar({ name, role, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  let glowClass = '';

  switch (role) {
    case UserRole.CUSTOMER:
      glowClass = 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border-blue-400/50';
      break;
    case UserRole.ASSESSOR:
      glowClass = 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border-purple-400/50';
      break;
    case UserRole.ADMIN:
      glowClass = 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] border-emerald-400/50';
      break;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full font-bold text-xs border border-transparent transition-shadow duration-300',
        glowClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
