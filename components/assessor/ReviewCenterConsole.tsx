'use client';

// ============================================================
// components/assessor/ReviewCenterConsole.tsx
// Master-detail split console wrapper for the Review Center.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SerializedClaim, SerializedClaimDocument, SerializedUser, SerializedClaimAssessment } from '@/types';
import { ReviewWorkspace } from './ReviewWorkspace';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { 
  Search, SlidersHorizontal, AlertTriangle, Clock, ShieldAlert, 
  ChevronRight, Inbox, Eye 
} from 'lucide-react';

interface Props {
  claims: SerializedClaim[];
  selectedClaim: SerializedClaim | null;
  documents: SerializedClaimDocument[];
  previousClaims: SerializedClaim[];
  assessments: SerializedClaimAssessment[];
}

export function ReviewCenterConsole({ claims, selectedClaim, documents, previousClaims, assessments }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-orange-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Filter local claims list
  const filteredClaims = claims.filter(c => {
    const customer = c.customerId as SerializedUser;
    const matchesSearch = 
      c._id.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* ── LEFT PANE: MASTER SEARCH & CLAIMS LIST (4 Columns) ──── */}
      <div className="lg:col-span-4 flex flex-col bg-[var(--color-base-950)]/40 border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden h-full">
        {/* Search Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] space-y-3 bg-[var(--color-base-900)]/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
            <input
              type="text"
              placeholder="Search claims or holders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--color-base-200)] placeholder:text-[var(--color-base-500)] focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl py-1.5 px-3 text-[10px] font-bold text-[var(--color-base-300)] cursor-pointer focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DOCUMENT_VERIFICATION">Doc Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Claims List Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredClaims.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-base-500)] text-xs flex flex-col items-center justify-center gap-1">
              <Inbox className="w-8 h-8 text-[var(--color-base-700)] mb-1" />
              No claims match current filters.
            </div>
          ) : (
            filteredClaims.map((c) => {
              const customer = c.customerId as SerializedUser;
              const isSelected = selectedClaim?._id === c._id;
              
              return (
                <div
                  key={c._id}
                  onClick={() => router.push(`/assessor/review/${c._id}`)}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 text-left relative",
                    isSelected 
                      ? "bg-purple-500/10 border-purple-500/35 shadow-[0_0_15px_rgba(168,85,247,0.06)]"
                      : "bg-[var(--color-base-900)]/30 border-[rgba(255,255,255,0.04)] hover:bg-[var(--color-base-900)]/60"
                  )}
                >
                  {/* Active Indicator bar */}
                  <div className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-r-md",
                    isSelected ? "bg-purple-500" : "bg-transparent"
                  )} />

                  <div className="flex-1 min-w-0 space-y-1.5 pl-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-purple-400">
                        INS-{c._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[9px] text-[var(--color-base-500)]">{formatDate(c.createdAt)}</span>
                    </div>

                    <div className="font-bold text-xs text-white truncate">{c.title}</div>
                    
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-base-450)]">
                      <span>{customer?.name || 'Unknown Holder'}</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(c.claimAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.04)]">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-base-400)]">
                        {c.policyType || 'UNKNOWN'}
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-black text-white",
                        c.status === 'APPROVED' ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/20" :
                        c.status === 'REJECTED' ? "bg-red-650/30 text-red-400 border border-red-500/20" :
                        c.status === 'UNDER_REVIEW' ? "bg-orange-500/20 text-orange-400 border border-orange-500/10" :
                        "bg-[var(--color-base-800)] text-[var(--color-base-300)]"
                      )}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center text-[var(--color-base-600)]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANE: DETAIL CONSOLE (8 Columns) ─────────────── */}
      <div className="lg:col-span-8 h-full">
        {selectedClaim ? (
          <ReviewWorkspace 
            claim={selectedClaim} 
            documents={documents} 
            previousClaims={previousClaims} 
            assessments={assessments}
          />
        ) : (
          <div className="h-full rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)] bg-[var(--color-base-950)]/20 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 animate-pulse">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select a Claim to Investigate</h3>
              <p className="text-xs text-[var(--color-base-500)] max-w-sm mt-1 leading-relaxed">
                Click on any claim from the side listing panel to load its complete policyholder details, fraud indicators, timelines, and action panel.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
