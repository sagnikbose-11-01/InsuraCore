'use client';

// ============================================================
// app/error.tsx
// Global error boundary page for handling unexpected runtime errors.
// ============================================================

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root Error Boundary caught an exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--color-base-950)] text-[var(--color-base-100)] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[oklch(15%_0.02_230/0.75)] border border-[oklch(28%_0.08_230)] backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[oklch(15%_0.05_20)] border border-[oklch(28%_0.08_20)] flex items-center justify-center mx-auto shadow-lg shadow-rose-950/20">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-base-100)]">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--color-base-500)] leading-relaxed">
            An unexpected error occurred during processing. Our engineering team has been notified.
          </p>
        </div>

        {error.message && (
          <div className="bg-[var(--color-base-900)] border border-[var(--color-base-800)] text-left p-3.5 rounded-xl font-mono text-xs text-[var(--color-base-400)] overflow-x-auto select-all max-h-24">
            <span className="text-rose-400 font-bold">Error:</span> {error.message}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => reset()}
            className="flex-1"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          
          <Link href="/" className="flex-1">
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
