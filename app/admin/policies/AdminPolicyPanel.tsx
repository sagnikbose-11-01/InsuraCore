'use client';

import { useState, useTransition } from 'react';
import { createPolicyAction, updatePolicyAction, deletePolicyAction, approvePolicyAction, rejectPolicyAction } from '@/app/actions/policy.actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatters';
import { SerializedPolicy } from '@/types';
import { PolicyType, PolicyListingStatus } from '@/lib/constants/enums';
import { ShieldCheck, Plus, Trash2, Edit2, XCircle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  initialPolicies: SerializedPolicy[];
  pendingPolicies: SerializedPolicy[];
}

type TabType = 'active' | 'approvals';

export function AdminPolicyPanel({ initialPolicies, pendingPolicies }: Props) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [policies, setPolicies] = useState(initialPolicies);
  const [approvals, setApprovals] = useState(pendingPolicies);
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
    setEligibility(policy.eligibility ? policy.eligibility.join(', ') : '');
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
          Object.entries(res.errors).forEach(([k, v]: [string, any]) => { flat[k] = v[0]; });
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
        setPolicies((prev) => prev.map((p) => (p._id === policyId ? { ...p, status: PolicyListingStatus.INACTIVE } as any : p)));
        toast.success('Policy successfully disabled.');
      } else {
        toast.error(res.message || 'Failed to disable policy.');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Failed to disable policy.');
    }
  }

  async function handleApprove(policyId: string) {
    startTransition(async () => {
      const res = await approvePolicyAction(policyId);
      if (res.success) {
        toast.success(res.message);
        setApprovals(prev => prev.filter(p => p._id !== policyId));
        // Need a page refresh really, or just let next revalidate handle it, 
        // since revalidatePath was called.
      } else {
        toast.error(res.message);
      }
    });
  }

  async function handleReject(policyId: string) {
    const comments = prompt('Enter rejection reason (optional):');
    startTransition(async () => {
      const res = await rejectPolicyAction(policyId, comments || undefined);
      if (res.success) {
        toast.success(res.message);
        setApprovals(prev => prev.filter(p => p._id !== policyId));
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex space-x-1 bg-[var(--color-base-950)]/50 p-1 rounded-xl border border-[rgba(255,255,255,0.05)] w-full max-w-md">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'active'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-800)]'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Active Policies
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'approvals'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-800)]'
          )}
        >
          <Clock className="w-4 h-4" />
          Approvals Queue
          {approvals.length > 0 && (
            <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{approvals.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[var(--color-base-900)] p-4 rounded-xl border border-[var(--color-base-800)]">
            <span className="text-sm font-medium text-[var(--color-base-400)]">
              {policies.length} total policy plans
            </span>
            <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
              Create Policy
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
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
                    <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required error={fieldErrors.name} />
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">Type</label>
                      <select value={type} onChange={(e) => setType(e.target.value as PolicyType)} className="w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] p-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]">
                        {Object.values(PolicyType).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--color-base-400)] uppercase block mb-1.5">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required className={cn('w-full text-sm rounded-lg bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-100)] p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]', fieldErrors.description && 'border-[var(--color-danger-400)]')} />
                      {fieldErrors.description && <p className="text-xs text-[var(--color-danger-400)] mt-1">{fieldErrors.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Monthly Premium (₹)" type="number" value={premiumAmount} onChange={(e) => setPremiumAmount(e.target.value)} required error={fieldErrors.premiumAmount} />
                      <Input label="Coverage Amount (₹)" type="number" value={coverageAmount} onChange={(e) => setCoverageAmount(e.target.value)} required error={fieldErrors.coverageAmount} />
                    </div>
                    <Input label="Validity Period (months)" type="number" value={validityPeriod} onChange={(e) => setValidityPeriod(e.target.value)} required error={fieldErrors.validityPeriod} />
                    <Input label="Eligibility Rules (comma-separated)" value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="Age > 18, Indian Resident" helperText="Leave empty if none" error={fieldErrors.eligibility} />
                    <Button type="submit" isLoading={isPending} className="w-full mt-2">
                      {editingPolicy ? 'Update Policy' : 'Create Policy'}
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            <div className={cn('space-y-4', openForm ? 'lg:col-span-2' : 'lg:col-span-3')}>
              <div className="grid sm:grid-cols-2 gap-4">
                {policies.map((policy) => (
                  <Card key={policy._id} className={cn(policy.status !== PolicyListingStatus.ACTIVE && 'opacity-65 border-dashed')}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[oklch(72%_0.20_230)]" />
                        <div>
                          <h4 className="text-sm font-bold text-[var(--color-base-100)]">{policy.name}</h4>
                          <span className="text-[10px] text-[var(--color-base-500)] uppercase font-semibold">{policy.type}</span>
                        </div>
                      </div>
                      <Badge variant={policy.status === PolicyListingStatus.ACTIVE ? 'success' : 'danger'}>
                        {policy.status === PolicyListingStatus.ACTIVE ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-base-400)] line-clamp-3 mb-4 leading-relaxed">{policy.description}</p>
                    <div className="space-y-2 border-t border-[var(--color-base-800)] pt-3 mb-4 text-[11px]">
                      <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Premium:</span><span className="font-semibold text-[var(--color-base-200)]">{formatCurrency(policy.premiumAmount)}/mo</span></div>
                      <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Coverage:</span><span className="font-bold text-[oklch(72%_0.20_230)]">{formatCurrency(policy.coverageAmount)}</span></div>
                      <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Duration:</span><span className="font-semibold text-[var(--color-base-200)]">{policy.validityPeriod} mo</span></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="flex-1 h-8" onClick={() => handleOpenEdit(policy)} leftIcon={<Edit2 className="w-3 h-3" />}>Edit</Button>
                      {policy.status === PolicyListingStatus.ACTIVE && (
                        <Button size="sm" variant="ghost" className="h-8 text-[var(--color-danger-400)] hover:bg-[var(--color-danger-bg)]" onClick={() => handleDelete(policy._id)} leftIcon={<Trash2 className="w-3 h-3" />}>Disable</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="bg-[var(--color-base-900)] p-12 rounded-xl border border-[rgba(255,255,255,0.05)] text-center">
              <ShieldCheck className="w-12 h-12 text-[var(--color-base-600)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Approvals Pending</h3>
              <p className="text-[var(--color-base-400)]">All assessor-created policies have been reviewed.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {approvals.map((policy) => (
                <Card key={policy._id} className="border-orange-500/20 shadow-lg shadow-orange-500/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{policy.name}</h4>
                        <span className="text-[10px] text-orange-400 uppercase font-semibold">Assessor: {(policy as any).createdByAssessorId?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-base-400)] line-clamp-3 mb-4 leading-relaxed">{policy.description}</p>
                  
                  <div className="space-y-2 border-t border-[var(--color-base-800)] pt-3 mb-4 text-[11px] bg-[var(--color-base-950)]/50 p-3 rounded-lg">
                    <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Type:</span><span className="font-semibold text-white">{policy.type}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Premium:</span><span className="font-semibold text-white">{formatCurrency(policy.premiumAmount)}/mo</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Coverage:</span><span className="font-bold text-emerald-400">{formatCurrency(policy.coverageAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-base-500)]">Max Claim:</span><span className="font-semibold text-white">{formatCurrency(policy.maximumClaimAmount || policy.coverageAmount)}</span></div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" isLoading={isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleApprove(policy._id)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Approve</Button>
                    <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-400" onClick={() => handleReject(policy._id)} leftIcon={<XCircle className="w-4 h-4" />}>Reject</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
