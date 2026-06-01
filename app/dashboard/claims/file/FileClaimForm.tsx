'use client';
// ============================================================
// app/dashboard/claims/file/FileClaimForm.tsx
// Multi-step claim filing wizard.
// Step 1: Select policy
// Step 2: Claim details
// Step 3: Confirm & submit
// ============================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fileClaimAction } from '@/app/actions/claim.actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { SerializedPurchasedPolicy, SerializedPolicy } from '@/types';
import { CheckCircle2, ShieldCheck, FileText, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  policies: SerializedPurchasedPolicy[];
}

const STEPS = ['Select Policy', 'Claim Details', 'Review & Submit'];

export function FileClaimForm({ policies }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form values for step 2
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [claimAmount, setClaimAmount] = useState('');

  const selectedPolicy = policies.find((p) => p._id === selectedPolicyId);
  const policy = selectedPolicy?.policyId as SerializedPolicy | undefined;

  function handleNext() {
    if (step === 0 && !selectedPolicyId) {
      setError('Please select a policy to continue.');
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append('purchasedPolicyId', selectedPolicyId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('incidentDate', incidentDate);
    formData.append('claimAmount', claimAmount);

    startTransition(async () => {
      const result = await fileClaimAction(formData);
      if (result.success && result.data) {
        toast.success('Claim filed successfully! Please upload supporting documents.');
        router.push(`/dashboard/claims/${result.data._id}`);
      } else {
        setError(result.message);
        toast.error(result.message || 'Failed to submit the claim.');
        if (result.errors) {
          const flat: Record<string, string> = {};
          Object.entries(result.errors).forEach(([k, v]) => { flat[k] = v[0]; });
          setFieldErrors(flat);
          if (Object.keys(flat).length > 0) setStep(1);
        }
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300',
              i < step ? 'bg-[var(--color-success-500)] text-white' :
              i === step ? 'bg-[var(--color-brand-500)] text-white glow-brand' :
              'bg-[var(--color-base-800)] text-[var(--color-base-500)]'
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block',
              i === step ? 'text-[var(--color-base-100)]' : 'text-[var(--color-base-500)]'
            )}>{label}</span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-2 transition-colors',
                i < step ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-base-800)]'
              )} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-sm text-[var(--color-danger-400)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── STEP 0: SELECT POLICY ─────────────────────────── */}
      {step === 0 && (
        <Card>
          <h2 className="text-base font-semibold text-[var(--color-base-100)] mb-1">Select Policy</h2>
          <p className="text-sm text-[var(--color-base-500)] mb-5">Choose which active policy this claim is for.</p>

          {policies.length === 0 ? (
            <div className="py-10 text-center">
              <ShieldCheck className="w-10 h-10 mx-auto text-[var(--color-base-700)] mb-3" />
              <p className="text-sm text-[var(--color-base-500)]">You don&apos;t have any active policies.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/dashboard/policies')}>
                Browse Policies
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((p) => {
                const pol = p.policyId as SerializedPolicy;
                const isSelected = selectedPolicyId === p._id;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => { setSelectedPolicyId(p._id); setError(null); }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all duration-200',
                      isSelected
                        ? 'border-[oklch(42%_0.17_230)] bg-[oklch(15%_0.06_230)] shadow-[0_0_0_1px_oklch(42%_0.17_230)]'
                        : 'border-[var(--color-base-700)] bg-[var(--color-base-900)] hover:border-[var(--color-base-600)]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          isSelected ? 'bg-[oklch(28%_0.12_230)]' : 'bg-[var(--color-base-800)]'
                        )}>
                          <ShieldCheck className={cn('w-4 h-4', isSelected ? 'text-[oklch(72%_0.20_230)]' : 'text-[var(--color-base-500)]')} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-base-100)]">{pol.name}</p>
                          <p className="text-xs text-[var(--color-base-500)]">
                            Coverage: {formatCurrency(pol.coverageAmount)} · Expires {formatDate(p.endDate)}
                          </p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[oklch(72%_0.20_230)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} disabled={!selectedPolicyId} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 1: CLAIM DETAILS ─────────────────────────── */}
      {step === 1 && (
        <Card>
          <h2 className="text-base font-semibold text-[var(--color-base-100)] mb-1">Claim Details</h2>
          <p className="text-sm text-[var(--color-base-500)] mb-5">Provide complete and accurate information about your claim.</p>

          <div className="space-y-4">
            <Input
              label="Claim Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vehicle accident on highway"
              required
              error={fieldErrors.title}
            />
            <div>
              <label className="text-sm font-medium text-[var(--color-base-300)] block mb-1.5">
                Description <span className="text-[var(--color-danger-400)]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident in detail. Include location, time, damages, and any witnesses..."
                rows={5}
                className={cn(
                  'w-full rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)]',
                  'text-[var(--color-base-100)] placeholder:text-[var(--color-base-600)]',
                  'text-sm p-3 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent',
                  fieldErrors.description && 'border-[var(--color-danger-400)]'
                )}
              />
              {fieldErrors.description && (
                <p className="text-xs text-[var(--color-danger-400)] mt-1">{fieldErrors.description}</p>
              )}
            </div>
            <Input
              label="Date of Incident"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              error={fieldErrors.incidentDate}
            />
            <Input
              label="Claim Amount (₹)"
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="Enter amount in INR"
              min={1}
              required
              error={fieldErrors.claimAmount}
              helperText={policy ? `Maximum coverage: ${formatCurrency(policy.coverageAmount)}` : undefined}
            />

            <div className="flex items-start gap-2 p-3 rounded-lg bg-[oklch(18%_0.05_260)] border border-[oklch(28%_0.08_260)]">
              <Info className="w-4 h-4 text-[oklch(72%_0.15_260)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[oklch(64%_0.13_260)]">
                You can upload supporting documents (photos, receipts, medical reports) after submitting the claim.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
            <Button
              onClick={() => {
                if (!title || !description || !incidentDate || !claimAmount) {
                  setError('Please fill in all required fields.');
                  return;
                }
                setError(null);
                setStep(2);
              }}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Review Claim
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 2: REVIEW & SUBMIT ───────────────────────── */}
      {step === 2 && (
        <Card>
          <h2 className="text-base font-semibold text-[var(--color-base-100)] mb-1">Review Your Claim</h2>
          <p className="text-sm text-[var(--color-base-500)] mb-5">Please confirm all details before submitting.</p>

          <div className="space-y-3">
            {[
              { label: 'Policy', value: (selectedPolicy?.policyId as SerializedPolicy)?.name },
              { label: 'Claim Title', value: title },
              { label: 'Incident Date', value: incidentDate },
              { label: 'Claim Amount', value: formatCurrency(Number(claimAmount)) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2.5 border-b border-[var(--color-base-800)]">
                <span className="text-sm text-[var(--color-base-500)]">{item.label}</span>
                <span className="text-sm font-medium text-[var(--color-base-100)]">{item.value}</span>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-sm text-[var(--color-base-500)] mb-1">Description</p>
              <p className="text-sm text-[var(--color-base-300)] bg-[var(--color-base-900)] p-3 rounded-lg">{description}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>Edit</Button>
            <Button onClick={handleSubmit} isLoading={isPending} leftIcon={<FileText className="w-4 h-4" />}>
              {isPending ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
