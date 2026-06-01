'use client';

// ============================================================
// app/assessor/error.tsx
// Local error boundary for the assessor review queue.
// ============================================================

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AssessorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Assessor workspace error caught:', error);
  }, [error]);

  return (
    <div className="bg-[oklch(15%_0.02_230/0.75)] border border-[oklch(28%_0.08_230)] backdrop-blur-md rounded-2xl p-8 max-w-xl mx-auto text-center space-y-5 animate-fade-in my-8">
      <div className="w-12 h-12 rounded-xl bg-[oklch(15%_0.05_20)] border border-[oklch(28%_0.08_20)] flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[var(--color-base-100)]">Failed to load assessor workspace</h3>
        <p className="text-xs text-[var(--color-base-500)] leading-relaxed max-w-sm mx-auto">
          An error occurred in the claims review module. Try re-syncing or reloading.
        </p>
      </div>

      {error.message && (
        <p className="text-xs font-mono bg-[var(--color-base-900)] p-3 rounded-lg border border-[var(--color-base-800)] text-[var(--color-base-400)] max-h-24 overflow-y-auto select-all text-left">
          <span className="text-rose-400 font-bold">Details:</span> {error.message}
        </p>
      )}

      <div className="flex justify-center">
        <Button
          size="sm"
          onClick={() => reset()}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Workspace
        </Button>
      </div>
    </div>
  );
}
