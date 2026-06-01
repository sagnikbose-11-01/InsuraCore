'use client';
// ============================================================
// app/dashboard/policies/purchase/[id]/PurchaseConfirmation.tsx
// Client component confirming policy purchase and simulating payment.
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { purchasePolicyAction } from '@/app/actions/policy.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Info, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { SerializedPolicy } from '@/types';

import { useToast } from '@/hooks/use-toast';

interface Props {
  policy: SerializedPolicy;
}

export function PurchaseConfirmation({ policy }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await purchasePolicyAction(policy._id);
      if (res.success) {
        toast.success(`Successfully purchased policy: ${policy.name}!`);
        router.push('/dashboard/policies');
        router.refresh();
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to complete policy purchase.');
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center glow-brand flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-[oklch(72%_0.20_230)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-base-100)]">{policy.name}</h2>
            <p className="text-xs text-[var(--color-base-500)]">{policy.type} Insurance Plan</p>
          </div>
        </div>

        <p className="text-sm text-[var(--color-base-300)] leading-relaxed mb-6">
          {policy.description}
        </p>

        <div className="space-y-3.5 border-t border-[var(--color-base-800)] pt-5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-base-500)]">Monthly Premium</span>
            <span className="font-semibold text-[var(--color-base-100)]">
              {formatCurrency(policy.premiumAmount)}
              <span className="text-xs text-[var(--color-base-500)] font-normal"> / month</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-base-500)]">Maximum Coverage Limit</span>
            <span className="font-bold text-[oklch(72%_0.20_230)]">
              {formatCurrency(policy.coverageAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-base-500)]">Validity Duration</span>
            <span className="font-semibold text-[var(--color-base-200)]">
              {policy.validityPeriod} Months
            </span>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-[var(--color-danger-400)]">
          {error}
        </div>
      )}

      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
        <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
          <strong>Demo Sandbox Mode:</strong> No real payment card will be charged. Clicking confirm will instantly issue the policy and set the status to <em>Active</em>.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          leftIcon={<CreditCard className="w-4 h-4" />}
          onClick={handleConfirm}
          isLoading={isPending}
        >
          {isPending ? 'Processing...' : 'Confirm & Purchase'}
        </Button>
      </div>
    </div>
  );
}
