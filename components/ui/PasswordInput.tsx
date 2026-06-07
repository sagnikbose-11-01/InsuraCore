// ============================================================
// components/ui/PasswordInput.tsx
// Password input with label, validation errors, and show/hide toggle.
// ============================================================

import { forwardRef, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends Omit<React.ComponentPropsWithRef<typeof Input>, 'type' | 'leftAdornment' | 'rightAdornment'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        label={label}
        error={error}
        helperText={helperText}
        leftAdornment={<Lock className="w-4 h-4" />}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[var(--color-base-500)] hover:text-[var(--color-base-300)] transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
