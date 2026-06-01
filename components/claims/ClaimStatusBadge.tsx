'use client';
// ============================================================
// components/claims/ClaimStatusBadge.tsx
// Rich 7-variant status badge with icon + colour per ClaimStatus.
// Used on cards, detail pages, and filter chips.
// ============================================================

import { cn } from '@/lib/utils/cn';
import {
  Clock, Send, Search, FileSearch, CheckCircle2,
  XCircle, Banknote,
} from 'lucide-react';
import { ClaimStatus } from '@/lib/constants/enums';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; icon: React.ElementType; bg: string; text: string; border: string }
> = {
  [ClaimStatus.PENDING]: {
    label: 'Pending',
    icon: Clock,
    bg: 'bg-[var(--color-base-800)]',
    text: 'text-[var(--color-base-400)]',
    border: 'border-[var(--color-base-700)]',
  },
  [ClaimStatus.SUBMITTED]: {
    label: 'Submitted',
    icon: Send,
    bg: 'bg-[oklch(18%_0.05_230)]',
    text: 'text-[oklch(72%_0.20_230)]',
    border: 'border-[oklch(28%_0.10_230)]',
  },
  [ClaimStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    icon: Search,
    bg: 'bg-[oklch(20%_0.05_75)]',
    text: 'text-[oklch(78%_0.18_75)]',
    border: 'border-[oklch(30%_0.08_75)]',
  },
  [ClaimStatus.DOCUMENT_VERIFICATION]: {
    label: 'Doc Verification',
    icon: FileSearch,
    bg: 'bg-[oklch(18%_0.05_285)]',
    text: 'text-[oklch(72%_0.18_285)]',
    border: 'border-[oklch(28%_0.10_285)]',
  },
  [ClaimStatus.APPROVED]: {
    label: 'Approved',
    icon: CheckCircle2,
    bg: 'bg-[oklch(20%_0.05_150)]',
    text: 'text-[oklch(72%_0.17_150)]',
    border: 'border-[oklch(30%_0.08_150)]',
  },
  [ClaimStatus.REJECTED]: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-[oklch(18%_0.05_25)]',
    text: 'text-[oklch(65%_0.20_25)]',
    border: 'border-[oklch(28%_0.08_25)]',
  },
  [ClaimStatus.PAID]: {
    label: 'Paid',
    icon: Banknote,
    bg: 'bg-[oklch(18%_0.08_155)]',
    text: 'text-[oklch(75%_0.20_155)]',
    border: 'border-[oklch(28%_0.12_155)]',
  },
};

export function ClaimStatusBadge({ status, size = 'sm', className }: ClaimStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[ClaimStatus.PENDING];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border rounded-full whitespace-nowrap',
        cfg.bg, cfg.text, cfg.border,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {cfg.label}
    </span>
  );
}
