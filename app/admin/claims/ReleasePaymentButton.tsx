'use client';
import { useTransition } from 'react';
import { releasePaymentAction } from '@/app/actions/claim.actions';
import { Button } from '@/components/ui/Button';
import { DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReleasePaymentButton({ claimId }: { claimId: string }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  function handleRelease() {
    startTransition(async () => {
      try {
        const res = await releasePaymentAction(claimId);
        if (res.success) {
          toast.success(res.message || 'Payment released successfully.');
        } else {
          toast.error(res.message || 'Failed to release payment.');
        }
      } catch (err) {
        toast.error((err as Error).message || 'Failed to release payment.');
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleRelease}
      isLoading={isPending}
      leftIcon={<DollarSign className="w-3 h-3" />}
      className="text-[var(--color-success-400)] hover:bg-[var(--color-success-bg)]"
    >
      Release
    </Button>
  );
}
