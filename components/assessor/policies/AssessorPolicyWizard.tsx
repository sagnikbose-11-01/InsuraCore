'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PolicyType } from '@/lib/constants/enums';
import { createAssessorPolicyAction } from '@/app/actions/assessor-policy.actions';
import { AlertCircle, FilePlus, ShieldCheck } from 'lucide-react';

interface Props {
  specialization: string;
  assessorId: string;
  onSuccess: () => void;
}

export function AssessorPolicyWizard({ specialization, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    premiumAmount: '',
    coverageAmount: '',
    validityPeriod: '',
    eligibility: '',
    benefits: '',
    exclusions: '',
    waitingPeriod: '',
    maximumClaimAmount: '',
    requiredDocuments: '',
    riskCategory: 'Standard',
    termsAndConditions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const data = {
        name: formData.name,
        type: specialization as PolicyType,
        description: formData.description,
        premiumAmount: Number(formData.premiumAmount),
        coverageAmount: Number(formData.coverageAmount),
        validityPeriod: Number(formData.validityPeriod),
        eligibility: formData.eligibility.split('\\n').filter(x => x.trim()),
        benefits: formData.benefits.split('\\n').filter(x => x.trim()),
        exclusions: formData.exclusions.split('\\n').filter(x => x.trim()),
        waitingPeriod: Number(formData.waitingPeriod),
        maximumClaimAmount: Number(formData.maximumClaimAmount),
        requiredDocuments: formData.requiredDocuments.split('\\n').filter(x => x.trim()),
        riskCategory: formData.riskCategory,
        termsAndConditions: formData.termsAndConditions,
      };

      const result = await createAssessorPolicyAction(data);
      if (result.success) {
        toast(result.message, 'success');
        onSuccess();
      } else {
        toast(result.message, 'error');
      }
    });
  };

  return (
    <div className="bg-[var(--color-base-900)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl max-w-4xl mx-auto">
      <div className="mb-6 pb-6 border-b border-[rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-purple-400" />
          Create New Policy
        </h2>
        <p className="text-sm text-[var(--color-base-400)] mt-1">
          Define the parameters for a new policy offering. Policies require admin approval before becoming active.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Policy Name" 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Comprehensive Auto Protect"
          />
          <div className="space-y-1.5 relative">
            <label className="text-sm font-semibold text-[var(--color-base-300)] flex items-center gap-2">
              Policy Type (Specialization)
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </label>
            <div className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-base-500)] flex items-center cursor-not-allowed">
              {specialization} (Locked)
            </div>
            <p className="text-xs text-[var(--color-base-400)]">You can only create policies matching your specialization.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--color-base-300)]">Description</label>
          <textarea
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            placeholder="Detailed description of the policy offering..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input 
            label="Premium Amount (₹)" 
            name="premiumAmount" 
            type="number" 
            required 
            value={formData.premiumAmount} 
            onChange={handleChange} 
          />
          <Input 
            label="Coverage Amount (₹)" 
            name="coverageAmount" 
            type="number" 
            required 
            value={formData.coverageAmount} 
            onChange={handleChange} 
          />
          <Input 
            label="Validity Period (Months)" 
            name="validityPeriod" 
            type="number" 
            required 
            value={formData.validityPeriod} 
            onChange={handleChange} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input 
            label="Maximum Claim Amount (₹)" 
            name="maximumClaimAmount" 
            type="number" 
            required 
            value={formData.maximumClaimAmount} 
            onChange={handleChange} 
            helperText="Max per single claim"
          />
          <Input 
            label="Waiting Period (Days)" 
            name="waitingPeriod" 
            type="number" 
            required 
            value={formData.waitingPeriod} 
            onChange={handleChange} 
          />
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--color-base-300)]">Risk Category</label>
            <select
              name="riskCategory"
              value={formData.riskCategory}
              onChange={handleChange}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="Low">Low</option>
              <option value="Standard">Standard</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--color-base-300)]">Eligibility (One per line)</label>
            <textarea
              name="eligibility"
              rows={4}
              value={formData.eligibility}
              onChange={handleChange}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              placeholder="e.g. Age between 18 and 65\nResident of India"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--color-base-300)]">Benefits (One per line)</label>
            <textarea
              name="benefits"
              rows={4}
              value={formData.benefits}
              onChange={handleChange}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              placeholder="e.g. Zero depreciation\nFree roadside assistance"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--color-base-300)]">Exclusions (One per line)</label>
            <textarea
              name="exclusions"
              rows={4}
              value={formData.exclusions}
              onChange={handleChange}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              placeholder="e.g. Intentional damage\nActs of God"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--color-base-300)]">Required Documents (One per line)</label>
            <textarea
              name="requiredDocuments"
              rows={4}
              value={formData.requiredDocuments}
              onChange={handleChange}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              placeholder="e.g. Identity Proof\nOriginal Invoice"
            />
          </div>
        </div>

        <div className="bg-[var(--color-warning-bg)] border border-[oklch(28%_0.08_25)] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--color-warning-400)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[var(--color-warning-400)]">Approval Required</h4>
            <p className="text-xs text-[var(--color-warning-400)]/80 mt-1">
              Once submitted, this policy will be in a "Pending Admin Approval" state. It will not be visible to customers until approved by a platform administrator.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <Button type="submit" isLoading={isPending} className="bg-purple-500 hover:bg-purple-600 text-white min-w-[200px]">
            Submit for Approval
          </Button>
        </div>
      </form>
    </div>
  );
}
