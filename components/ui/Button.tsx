// ============================================================
// components/ui/Button.tsx
// Reusable button with variant, size, and loading state support.
// ============================================================

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] shadow-[0_0_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_0_24px_oklch(58%_0.22_230_/_0.45)]',
  secondary:
    'bg-[var(--color-base-800)] text-[var(--color-base-200)] hover:bg-[var(--color-base-700)] border border-[var(--color-base-700)]',
  ghost:
    'bg-transparent text-[var(--color-base-400)] hover:bg-[var(--color-base-800)] hover:text-[var(--color-base-200)]',
  danger:
    'bg-[var(--color-danger-bg)] text-[var(--color-danger-400)] hover:bg-[oklch(22%_0.06_25)] border border-[oklch(28%_0.08_25)]',
  outline:
    'bg-transparent text-[var(--color-brand-400)] border border-[var(--color-brand-500)] hover:bg-[oklch(18%_0.08_230)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-[var(--radius-button)]',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-base-950)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
