'use client';
// ============================================================
// app/admin/policies/AdminPolicyPanel.tsx
// Client component with policy CRUD panel + modal form.
// ============================================================

import { useState, useTransition } from 'react';
import { createPolicyAction, updatePolicyAction, deletePolicyAction } from '@/app/actions/policy.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatters';
import { SerializedPolicy } from '@/types';
import { PolicyType } from '@/lib/constants/enums';
import { ShieldCheck, Plus, Trash2, Edit2, XCircle, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  initialPolicies: SerializedPolicy[];
}

export function AdminPolicyPanel({ initialPolicies }: Props) {
  const toast = useToast();
  const [policies, setPolicies] = useState(initialPolicies);
  const [isPending, startTransition] = useTransition();
  const [openForm, setOpenForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SerializedPolicy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form values
  const [name, setName] = useState('');
  const [type, setType] = useState<PolicyType>(PolicyType.HEALTH);
  const [description, setDescription] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('');
  const [eligibility, setEligibility] = useState('');

  function handleOpenCreate() {
    setError(null);
    setFieldErrors({});
    setEditingPolicy(null);
    setName('');
    setType(PolicyType.HEALTH);
    setDescription('');
    setPremiumAmount('');
    setCoverageAmount('');
    setValidityPeriod('');
    setEligibility('');
    setOpenForm(true);
  }

  function handleOpenEdit(policy: SerializedPolicy) {
    setError(null);
    setFieldErrors({});
    setEditingPolicy(policy);
    setName(policy.name);
    setType(policy.type as PolicyType);
    setDescription(policy.description);
    setPremiumAmount(String(policy.premiumAmount));
    setCoverageAmount(String(policy.coverageAmount));
    setValidityPeriod(String(policy.validityPeriod));
    setEligibility(policy.eligibility.join(', '));
    setOpenForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('premiumAmount', premiumAmount);
    formData.append('coverageAmount', coverageAmount);
    formData.append('validityPeriod', validityPeriod);
    formData.append('eligibility', eligibility);

    startTransition(async () => {
      let res;
      if (editingPolicy) {
        res = await updatePolicyAction(editingPolicy._id, formData);
      } else {
        res = await createPolicyAction(formData);
      }

      if (res.success && res.data) {
        const saved = res.data;
        if (editingPolicy) {
          setPolicies((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
          toast.success(`Successfully updated policy: ${saved.name}`);
        } else {
          setPolicies((prev) => [saved, ...prev]);
          toast.success(`Successfully created policy: ${saved.name}`);
        }
        setOpenForm(false);
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to save policy.');
        if (res.errors) {
          const flat: Record<string, string> = {};
          Object.entries(res.errors).forEach(([k, v]) => { flat[k] = v[0]; });
          setFieldErrors(flat);
        }
      }
    });
  }

  async function handleDelete(policyId: string) {
    if (!confirm('Are you sure you want to disable this policy? it will hide it from new customer purchases.')) return;
    try {
      const res = await deletePolicyAction(policyId);
      if (res.success) {
        setPolicies((prev) => prev.map((p) => (p._id === policyId ? { ...p, isActive: false } : p)));
        toast.success('Policy successfully disabled.');
      } else {
        toast.error(res.message || 'Failed to disable policy.');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Failed to disable policy.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex justify-between items-center bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
        <span className="text-sm font-medium text-[var(--color-base-400)]">
          {policies.length} total policy plans
        </span>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create Policy
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Form Panel */}
        {openForm && (
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <Card>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-[var(--color-base-100)]">
                  {editingPolicy ? 'Edit Policy' : 'Create Policy'}
                </h3>
                <button
                  onClick={() => setOpenForm(false)}
                  className="text-[var(--color-base-500)] hover:text-[var(--color-base-300)]"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 text-xs rounded-lg bg-[var(--color-danger-bg)] border border-[oklch(28%_0.08_25)] text-[var(--color-danger-400)] flex items-center gap-1.5 mb-4">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Health Premium Gold"
                  required
                  error={fieldErrors.name}
                />

                <div>
                  <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PolicyType)}
                    className="w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] p-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
                  >
                    {Object.values(PolicyType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about premium terms and coverage scope..."
                    rows={4}
                    required
                    className={cn(
                      'w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]',
                      fieldErrors.description && 'border-[var(--color-danger-400)]'
                    )}
                  />
                  {fieldErrors.description && <p className="text-xs text-[var(--color-danger-400)] mt-1">{fieldErrors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Monthly Premium (₹)"
                    type="number"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value)}
                    required
                    error={fieldErrors.premiumAmount}
                  />
                  <Input
                    label="Coverage Amount (₹)"
                    type="number"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(e.target.value)}
                    required
                    error={fieldErrors.coverageAmount}
                  />
                </div>

                <Input
                  label="Validity Period (months)"
                  type="number"
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(e.target.value)}
                  required
                  error={fieldErrors.validityPeriod}
                />

                <Input
                  label="Eligibility Rules (comma-separated)"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="Age > 18, Indian Resident"
                  helperText="Leave empty if none"
                  error={fieldErrors.eligibility}
                />

                <Button type="submit" isLoading={isPending} className="w-full mt-2">
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Policies Grid */}
        <div className={cn('space-y-4', openForm ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className="grid sm:grid-cols-2 gap-4">
            {policies.map((policy) => (
              <Card key={policy._id} className={cn(!policy.isActive && 'opacity-65 border-dashed')}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[oklch(72%_0.20_230)]" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-base-100)]">{policy.name}</h4>
                      <span className="text-[10px] text-[var(--color-base-500)] uppercase font-semibold">{policy.type}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Badge variant={policy.isActive ? 'success' : 'danger'}>
                      {policy.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-base-400)] line-clamp-3 mb-4 leading-relaxed">
                  {policy.description}
                </p>

                <div className="space-y-2 border-t border-[var(--color-base-800)] pt-3 mb-4 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-base-500)]">Premium:</span>
                    <span className="font-semibold text-[var(--color-base-200)]">{formatCurrency(policy.premiumAmount)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-base-500)]">Coverage:</span>
                    <span className="font-bold text-[oklch(72%_0.20_230)]">{formatCurrency(policy.coverageAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-base-500)]">Duration:</span>
                    <span className="font-semibold text-[var(--color-base-200)]">{policy.validityPeriod} mo</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 h-8"
                    onClick={() => handleOpenEdit(policy)}
                    leftIcon={<Edit2 className="w-3 h-3" />}
                  >
                    Edit
                  </Button>
                  {policy.isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-[var(--color-danger-400)] hover:bg-[var(--color-danger-bg)]"
                      onClick={() => handleDelete(policy._id)}
                      leftIcon={<Trash2 className="w-3 h-3" />}
                    >
                      Disable
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
