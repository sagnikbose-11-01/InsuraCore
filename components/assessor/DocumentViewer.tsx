// ============================================================
// components/assessor/DocumentViewer.tsx
// Component for viewing and verifying uploaded claim documents.
// ============================================================

import React from 'react';
import { FileText, Download, CheckCircle, XCircle, Eye } from 'lucide-react';

const MOCK_DOCS = [
  { id: 1, name: 'Discharge_Summary.pdf', type: 'Medical Report', status: 'Verified', date: 'Oct 15, 2025' },
  { id: 2, name: 'Hospital_Invoice_Final.pdf', type: 'Invoice', status: 'Pending', date: 'Oct 15, 2025' },
  { id: 3, name: 'Pharmacy_Receipts.jpg', type: 'Receipt', status: 'Rejected', date: 'Oct 16, 2025' },
];

export function DocumentViewer() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-900)]/50">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" /> Uploaded Documents
        </h3>
      </div>
      
      <div className="divide-y divide-[rgba(255,255,255,0.04)]">
        {MOCK_DOCS.map((doc) => (
          <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-[var(--color-base-800)] border border-[rgba(255,255,255,0.06)]">
                <FileText className="w-5 h-5 text-[var(--color-base-400)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[var(--color-base-500)]">{doc.type}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-base-700)]" />
                  <span className="text-[10px] text-[var(--color-base-500)]">{doc.date}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.03)]">
                {doc.status === 'Verified' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                {doc.status === 'Pending' && <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-1 mr-0.5" />}
                {doc.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-base-300)]">
                  {doc.status}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors" title="Preview">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
