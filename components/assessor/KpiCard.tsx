// ============================================================
// components/assessor/KpiCard.tsx
// Displays a single Key Performance Indicator with trend tracking.
// Features hover animations and glassmorphic premium design.
// ============================================================

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function KpiCard({ title, value, trend, icon: Icon, iconClassName, className }: KpiCardProps) {
  return (
    <div className={cn(
      "glass-card p-5 group transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-base-400)] group-hover:text-[var(--color-base-300)] transition-colors">
          {title}
        </h3>
        <div className={cn("p-2 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.06)] group-hover:scale-110 transition-transform duration-300", iconClassName)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex items-end gap-3">
        <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        
        {trend && (
          <span className={cn(
            "text-xs font-semibold mb-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
            trend.isPositive 
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
              : "text-red-400 bg-red-500/10 border border-red-500/20"
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
