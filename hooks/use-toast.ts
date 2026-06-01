'use client';

// ============================================================
// hooks/use-toast.ts
// Reusable hook to access the toast notification system.
// ============================================================

import { useToastContext } from '@/components/ui/Toast';

export function useToast() {
  return useToastContext();
}
