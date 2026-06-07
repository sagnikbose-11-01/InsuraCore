'use client';

// ============================================================
// components/auth/UserNav.tsx
// Profile section displayed in the navbar for authenticated users.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { JWTPayload } from '@/lib/auth/jwt';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { UserDropdown } from './UserDropdown';

interface UserNavProps {
  session: JWTPayload;
}

export function UserNav({ session }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-[var(--color-base-600)] bg-[var(--color-base-800)]/80 hover:bg-[var(--color-base-700)] transition-all duration-200 cursor-pointer shadow-sm focus:outline-none"
      >
        <UserAvatar name={session.name} role={session.role} />
        
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-xs font-bold text-white leading-tight">
            {session.name}
          </span>
          <RoleBadge role={session.role} className="mt-0.5" />
        </div>
      </button>

      <UserDropdown isOpen={isOpen} session={session} onClose={() => setIsOpen(false)} />
    </div>
  );
}
