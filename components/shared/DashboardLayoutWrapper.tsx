'use client';

// ============================================================
// components/shared/DashboardLayoutWrapper.tsx
// Responsive client wrapper managing mobile drawer state and header.
// ============================================================

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, Shield } from 'lucide-react';
import { SerializedUser } from '@/types';

interface Props {
  user: SerializedUser;
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({ user, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base-950)] relative">
      {/* Desktop Sidebar (hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex lg:flex-shrink-0 h-full">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer (visible on mobile/tablet when open) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-[var(--color-base-900)] border-r border-[var(--color-base-800)] shadow-2xl animate-fade-in">
            {/* Close button inside drawer */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-400)] hover:text-[var(--color-base-200)] focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <Sidebar user={user} onLinkClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[var(--color-base-900)] border-b border-[var(--color-base-800)] lg:hidden flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center glow-brand">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-[var(--color-base-100)] tracking-tight">
              InsuraCore
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-[var(--color-base-800)] text-[var(--color-base-300)] hover:text-[var(--color-base-100)] border border-[var(--color-base-700)] focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable container for dashboard child views */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
