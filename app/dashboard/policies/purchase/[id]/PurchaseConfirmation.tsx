'use client';
// ============================================================
// app/dashboard/policies/purchase/[id]/PurchaseConfirmation.tsx
// Full-detail purchase confirmation page with T&C checkbox.
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { purchasePolicyAction } from '@/app/actions/policy.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck, Info, CreditCard, CheckCircle2,
  Clock, Banknote, Calendar, ListChecks, AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { SerializedPolicy } from '@/types';
import { PolicyType } from '@/lib/constants/enums';
import { useToast } from '@/hooks/use-toast';

const TYPE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  HEALTH:   { text: 'text-[oklch(72%_0.17_150)]', bg: 'bg-[oklch(20%_0.05_150)]', border: 'border-[oklch(30%_0.08_150)]' },
  AUTO:     { text: 'text-[oklch(78%_0.18_75)]',  bg: 'bg-[oklch(20%_0.05_75)]',  border: 'border-[oklch(30%_0.08_75)]' },
  PROPERTY: { text: 'text-[oklch(72%_0.20_230)]', bg: 'bg-[oklch(18%_0.08_230)]', border: 'border-[oklch(28%_0.10_230)]' },
  LIFE:     { text: 'text-[oklch(65%_0.20_25)]',  bg: 'bg-[oklch(18%_0.05_25)]',  border: 'border-[oklch(28%_0.08_25)]' },
  TRAVEL:   { text: 'text-[oklch(72%_0.15_260)]', bg: 'bg-[oklch(18%_0.05_260)]', border: 'border-[oklch(28%_0.08_260)]' },
};

interface Props {
  policy: SerializedPolicy;
}

export function PurchaseConfirmation({ policy }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const tc = TYPE_COLORS[policy.type] ?? TYPE_COLORS.HEALTH;

  function handleConfirm() {
    if (!termsAccepted) return;
    setError(null);
    startTransition(async () => {
      const res = await purchasePolicyAction(policy._id);
      if (res.success) {
        toast.success(`Successfully purchased: ${policy.name}!`);
        router.push('/dashboard/policies');
        router.refresh();
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to complete policy purchase.');
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* ── Policy Identity ───────────────────────── */}
      <Card>
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${tc.bg} ${tc.border}`}>
            <ShieldCheck className={`w-7 h-7 ${tc.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-2 ${tc.bg} ${tc.border} ${tc.text}`}>
              {policy.type} Insurance
            </div>
            <h2 className="text-xl font-bold text-[var(--color-base-100)] leading-tight">{policy.name}</h2>
          </div>
        </div>

        <p className="text-sm text-[var(--color-base-300)] leading-relaxed mb-6 border-t border-[var(--color-base-800)] pt-5">
          {policy.description}
        </p>

        {/* Key Figures */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--color-base-950)] border border-[var(--color-base-800)] rounded-xl p-4 text-center">
            <Banknote className="w-4 h-4 text-[var(--color-base-500)] mx-auto mb-2" />
            <p className="text-[10px] uppercase font-semibold text-[var(--color-base-500)] tracking-wider mb-1">Monthly Premium</p>
            <p className="text-base font-bold text-[var(--color-base-100)]">{formatCurrency(policy.premiumAmount)}</p>
          </div>
          <div className={`border rounded-xl p-4 text-center ${tc.bg} ${tc.border}`}>
            <CheckCircle2 className={`w-4 h-4 mx-auto mb-2 ${tc.text}`} />
            <p className="text-[10px] uppercase font-semibold text-[var(--color-base-500)] tracking-wider mb-1">Max Coverage</p>
            <p className={`text-base font-bold ${tc.text}`}>{formatCurrency(policy.coverageAmount)}</p>
          </div>
          <div className="bg-[var(--color-base-950)] border border-[var(--color-base-800)] rounded-xl p-4 text-center">
            <Clock className="w-4 h-4 text-[var(--color-base-500)] mx-auto mb-2" />
            <p className="text-[10px] uppercase font-semibold text-[var(--color-base-500)] tracking-wider mb-1">Validity</p>
            <p className="text-base font-bold text-[var(--color-base-100)]">{policy.validityPeriod} mo.</p>
          </div>
        </div>

        {/* Eligibility */}
        {policy.eligibility && policy.eligibility.length > 0 && (
          <div className="border-t border-[var(--color-base-800)] pt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-base-300)] mb-3">
              <ListChecks className="w-4 h-4 text-[var(--color-base-500)]" />
              Eligibility Criteria
            </h3>
            <ul className="space-y-2">
              {policy.eligibility.map((criterion: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--color-base-400)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success-400)] mt-0.5 flex-shrink-0" />
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* ── Sandbox Notice ────────────────────────── */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
        <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[oklch(64%_0.13_260)] leading-relaxed">
          <strong>Demo Sandbox Mode:</strong> No real payment will be charged. Confirming will instantly activate the policy and set its status to <em>Active</em>.
        </p>
      </div>

      {/* ── Error ─────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)]">
          <AlertCircle className="w-4 h-4 text-[var(--color-danger-400)] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-danger-400)]">{error}</p>
        </div>
      )}

      {/* ── Terms & Conditions ────────────────────── */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--color-base-200)] mb-3">Terms &amp; Conditions</h3>
        <div className="bg-[var(--color-base-950)] border border-[var(--color-base-800)] rounded-xl p-4 text-xs text-[var(--color-base-500)] leading-relaxed space-y-2 max-h-36 overflow-y-auto mb-5 custom-scrollbar">
          <p>By purchasing this policy, you agree to the InsuraCore Policyholder Agreement. Premiums are due monthly and non-refundable after the 15-day free-look period has elapsed.</p>
          <p>Claim payouts are subject to assessor review and may not exceed the stated maximum coverage limit. InsuraCore reserves the right to revise premium rates annually with 30-day advance notice.</p>
          <p>Coverage begins immediately upon successful policy activation and expires after the stated validity period. Policy renewal must be initiated by the policyholder before the expiry date.</p>
          <p>False or fraudulent claim information will result in immediate policy cancellation and potential legal liability. All disputes are subject to arbitration under applicable IRDAI guidelines.</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center
              ${termsAccepted
                ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)]'
                : 'bg-transparent border-[var(--color-base-700)] group-hover:border-[var(--color-base-500)]'
              }`}
            >
              {termsAccepted && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[var(--color-base-400)] leading-relaxed group-hover:text-[var(--color-base-200)] transition-colors">
            I have read, understood, and agree to the{' '}
            <span className="text-[var(--color-brand-400)] font-medium">Terms &amp; Conditions</span>{' '}
            and InsuraCore Policyholder Agreement.
          </span>
        </label>
      </Card>

      {/* ── Action Buttons ────────────────────────── */}
      <div className="flex gap-4 pb-8">
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
          disabled={!termsAccepted || isPending}
        >
          {isPending ? 'Processing...' : 'Confirm & Purchase'}
        </Button>
      </div>
    </div>
  );
}
