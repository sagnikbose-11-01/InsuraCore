// ============================================================
// lib/utils/cn.ts
// Utility: merge Tailwind CSS class names safely.
// Uses clsx for conditionals + tailwind-merge to de-duplicate.
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
