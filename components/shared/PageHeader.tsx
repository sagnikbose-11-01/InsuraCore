// ============================================================
// components/shared/PageHeader.tsx
// Consistent top-of-page header for dashboard sections.
// ============================================================

import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8', className)}>
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-base-100)] tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-base-500)]">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
