'use client';
import { useState, useTransition } from 'react';
import { assignAssessorAction } from '@/app/actions/claim.actions';
import { Button } from '@/components/ui/Button';
import { SerializedUser } from '@/types';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  claimId: string;
  assessors: SerializedUser[];
}

export function AssignAssessorButton({ claimId, assessors }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function handleAssign() {
    if (!selected) return;
    const fd = new FormData();
    fd.append('claimId', claimId);
    fd.append('assessorId', selected);
    startTransition(async () => {
      const result = await assignAssessorAction(fd);
      setMessage(result.message);
      if (result.success) {
        toast.success(result.message || 'Assessor assigned successfully.');
        setOpen(false);
        setMessage('');
      } else {
        toast.error(result.message || 'Failed to assign assessor.');
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} leftIcon={<UserPlus className="w-3 h-3" />}>
        Assign
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="text-xs bg-[var(--color-base-800)] border border-[var(--color-base-700)] text-[var(--color-base-200)] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
      >
        <option value="">Select assessor…</option>
        {assessors.map((a) => (
          <option key={a._id} value={a._id}>{a.name}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleAssign} isLoading={isPending}>Go</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>×</Button>
      {message && <span className="text-xs text-[var(--color-danger-400)]">{message}</span>}
    </div>
  );
}
