// ============================================================
// components/ui/Input.tsx
// Enterprise-grade form input with label, error, and helper text.
// ============================================================

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftAdornment, rightAdornment, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-base-300)] select-none"
          >
            {label}
            {props.required && <span className="text-[var(--color-danger-400)] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAdornment && (
            <div className="absolute left-3 text-[var(--color-base-500)] pointer-events-none">
              {leftAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-[var(--radius-button)]',
              'bg-[var(--color-base-800)] border border-[var(--color-base-700)]',
              'text-[var(--color-base-100)] placeholder:text-[var(--color-base-600)]',
              'text-sm px-3',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--color-danger-400)] focus:ring-[var(--color-danger-400)]',
              leftAdornment && 'pl-9',
              rightAdornment && 'pr-9',
              className
            )}
            {...props}
          />

          {rightAdornment && (
            <div className="absolute right-3 text-[var(--color-base-500)]">
              {rightAdornment}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--color-danger-400)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[var(--color-base-500)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
