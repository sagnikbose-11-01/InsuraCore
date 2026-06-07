// ============================================================
// components/auth/AuthAwareCTA.tsx
// Dynamic Call-To-Action button that adapts to the user's role.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JWTPayload } from '@/lib/auth/jwt';
import { UserRole } from '@/lib/constants/enums';
import { cn } from '@/lib/utils';

interface AuthAwareCTAProps {
  session: JWTPayload | null;
  className?: string;
  icon?: boolean;
}

export function AuthAwareCTA({ session, className, icon = true }: AuthAwareCTAProps) {
  if (!session) {
    return (
      <Link
        href="/auth/login"
        className={cn(
          "inline-flex items-center justify-center text-xs font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_0_24px_oklch(58%_0.22_230_/_0.55)] hover:-translate-y-0.5",
          className
        )}
      >
        Access Portal {icon && <ArrowRight className="w-4 h-4 ml-2" />}
      </Link>
    );
  }

  let ctaLabel = 'Go to Dashboard';
  let ctaHref = '/dashboard';

  if (session.role === UserRole.ASSESSOR) {
    ctaLabel = 'Open Workspace';
    ctaHref = '/assessor';
  } else if (session.role === UserRole.ADMIN) {
    ctaLabel = 'Open Admin Console';
    ctaHref = '/admin';
  }

  return (
    <Link
      href={ctaHref}
      className={cn(
        "inline-flex items-center justify-center text-xs font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_16px_oklch(58%_0.22_230_/_0.3)] hover:shadow-[0_0_24px_oklch(58%_0.22_230_/_0.55)] hover:-translate-y-0.5",
        className
      )}
    >
      {ctaLabel} {icon && <ArrowRight className="w-4 h-4 ml-2" />}
    </Link>
  );
}
