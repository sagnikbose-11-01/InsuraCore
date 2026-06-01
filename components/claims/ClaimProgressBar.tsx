'use client';
// ============================================================
// components/claims/ClaimProgressBar.tsx
// Compact horizontal step tracker shown inside each claim card.
// Shows which stages are complete, active, or pending.
// ============================================================

import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';
import { ClaimStatus } from '@/lib/constants/enums';

// Canonical order of non-terminal steps
const PROGRESS_STEPS: { status: ClaimStatus; label: string }[] = [
  { status: ClaimStatus.SUBMITTED,             label: 'Filed'    },
  { status: ClaimStatus.DOCUMENT_VERIFICATION, label: 'Docs'     },
  { status: ClaimStatus.UNDER_REVIEW,          label: 'Review'   },
  { status: ClaimStatus.APPROVED,              label: 'Approved' },
  { status: ClaimStatus.PAID,                  label: 'Paid'     },
];

const STATUS_ORDER: ClaimStatus[] = [
  ClaimStatus.PENDING,
  ClaimStatus.SUBMITTED,
  ClaimStatus.DOCUMENT_VERIFICATION,
  ClaimStatus.UNDER_REVIEW,
  ClaimStatus.APPROVED,
  ClaimStatus.PAID,
];

interface ClaimProgressBarProps {
  status: ClaimStatus;
}

export function ClaimProgressBar({ status }: ClaimProgressBarProps) {
  const isRejected = status === ClaimStatus.REJECTED;
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-1 mt-4">
      {PROGRESS_STEPS.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.status);
        const isDone   = !isRejected && currentIdx > stepIdx;
        const isActive = !isRejected && currentIdx === stepIdx;

        return (
          <div key={step.status} className="flex items-center flex-1 min-w-0">
            {/* Circle node */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ring-offset-[var(--color-base-800)]',
                  isDone
                    ? 'bg-[var(--color-success-500)] text-white'
                    : isActive
                    ? 'bg-[var(--color-brand-500)] text-white ring-2 ring-[var(--color-brand-300)] ring-offset-2'
                    : isRejected && i === 0
                    ? 'bg-[oklch(18%_0.05_25)] border border-[oklch(28%_0.08_25)]'
                    : 'bg-[var(--color-base-700)] border border-[var(--color-base-600)]'
                )}
              >
                {isDone ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                ) : null}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium mt-1 leading-none text-center',
                  isDone   ? 'text-[var(--color-success-400)]' :
                  isActive ? 'text-[var(--color-brand-300)]'   :
                             'text-[var(--color-base-600)]'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (skip after last) */}
            {i < PROGRESS_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mb-3 mx-0.5 transition-colors duration-500',
                  isDone
                    ? 'bg-[var(--color-success-500)]'
                    : 'bg-[var(--color-base-700)]'
                )}
              />
            )}
          </div>
        );
      })}

      {/* Rejected override */}
      {isRejected && (
        <span className="text-[9px] text-[oklch(65%_0.20_25)] font-semibold ml-2 whitespace-nowrap">
          Rejected
        </span>
      )}
    </div>
  );
}
