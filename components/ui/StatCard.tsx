// ============================================================
// components/ui/StatCard.tsx
// Dashboard metric card with icon, trend, and value display.
// ============================================================

import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;         // positive = up, negative = down, 0/undefined = neutral
  description?: string;
  iconBg?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, description, iconBg = 'bg-[var(--color-brand-500)]', className }: StatCardProps) {
  const TrendIcon = trend === undefined || trend === 0
    ? Minus
    : trend > 0 ? TrendingUp : TrendingDown;

  const trendColor = trend === undefined || trend === 0
    ? 'text-[var(--color-base-500)]'
    : trend > 0 ? 'text-[var(--color-success-400)]' : 'text-[var(--color-danger-400)]';

  return (
    <div
      className={cn(
        'stat-card p-5 flex flex-col gap-4 group animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-base-500)]">
            {title}
          </p>
          <p className="mt-1.5 text-3xl font-bold text-[var(--color-base-100)] tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
            'transition-transform duration-200 group-hover:scale-110',
            iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {(trend !== undefined || description) && (
        <div className="flex items-center gap-1.5">
          {trend !== undefined && (
            <>
              <TrendIcon className={cn('w-3.5 h-3.5', trendColor)} />
              <span className={cn('text-xs font-medium', trendColor)}>
                {Math.abs(trend)}%
              </span>
            </>
          )}
          {description && (
            <span className="text-xs text-[var(--color-base-500)]">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
