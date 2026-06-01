'use client';
// ============================================================
// app/dashboard/claims/[id]/DocumentUploader.tsx
// Client component for uploading and listing claim documents.
// Uses the /api/upload route handler to handle file uploads.
// ============================================================

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { SerializedClaimDocument } from '@/types';
import { DocumentStatus } from '@/lib/constants/enums';
import { formatDate } from '@/lib/utils/formatters';
import { useToast } from '@/hooks/use-toast';

interface Props {
  claimId: string;
  initialDocuments: SerializedClaimDocument[];
}

const DOC_STATUS_VARIANT = {
  [DocumentStatus.UPLOADED]: 'info',
  [DocumentStatus.VERIFIED]: 'success',
  [DocumentStatus.REJECTED]: 'danger',
} as const;

export function DocumentUploader({ claimId, initialDocuments }: Props) {
  const toast = useToast();
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('claimId', claimId);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setDocuments((prev) => [data.document, ...prev]);
      toast.success(`Successfully uploaded document: ${data.document.documentName}`);
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
          dragOver
            ? 'border-[var(--color-brand-500)] bg-[oklch(15%_0.06_230)]'
            : 'border-[var(--color-base-700)] hover:border-[var(--color-base-600)] bg-[var(--color-base-900)]'
        )}
      >
        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-[var(--color-brand-400)] animate-spin" />
            <p className="text-sm text-[var(--color-base-400)]">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-[var(--color-base-600)]" />
            <p className="text-sm font-medium text-[var(--color-base-400)]">
              Drop a file here, or <span className="text-[var(--color-brand-400)]">click to browse</span>
            </p>
            <p className="text-xs text-[var(--color-base-600)]">PDF, Images, Word documents (max 10MB)</p>
          </>
        )}
      </label>

      {error && (
        <p className="text-xs text-[var(--color-danger-400)] flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-sm text-center py-6 text-[var(--color-base-600)]">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc._id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-base-900)] border border-[var(--color-base-800)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-base-800)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[var(--color-base-500)]" />
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] truncate block"
                >
                  {doc.documentName}
                </a>
                <p className="text-xs text-[var(--color-base-500)]">{formatDate(doc.createdAt)}</p>
              </div>
              <Badge variant={DOC_STATUS_VARIANT[doc.verificationStatus as DocumentStatus]}>
                {doc.verificationStatus}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
