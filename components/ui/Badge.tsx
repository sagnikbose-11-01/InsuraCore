// ============================================================
// components/ui/Badge.tsx
// Status badge / pill component used throughout claim tables.
// ============================================================

import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[oklch(20%_0.05_150)] text-[oklch(72%_0.17_150)] border border-[oklch(30%_0.08_150)]',
  warning: 'bg-[oklch(20%_0.05_75)] text-[oklch(78%_0.18_75)] border border-[oklch(30%_0.08_75)]',
  danger:  'bg-[oklch(18%_0.05_25)] text-[oklch(65%_0.20_25)] border border-[oklch(28%_0.08_25)]',
  info:    'bg-[oklch(18%_0.05_260)] text-[oklch(72%_0.15_260)] border border-[oklch(28%_0.08_260)]',
  brand:   'bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border border-[oklch(28%_0.10_230)]',
  default: 'bg-[var(--color-base-800)] text-[var(--color-base-400)] border border-[var(--color-base-700)]',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
