// ============================================================
// components/assessor/ClaimDetailsCard.tsx
// Displays comprehensive overview of the claim details.
// ============================================================

import React from 'react';
import { User, FileText, Calendar, MapPin, Activity, Phone } from 'lucide-react';

export function ClaimDetailsCard({ claimId }: { claimId: string }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-base-900)]/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" /> Claim Overview: {claimId}
        </h2>
        <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider">
          Under Review
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[var(--color-base-500)] uppercase tracking-wider mb-2">Policy Holder</h3>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Arjun Mehta</p>
              <p className="text-xs text-[var(--color-base-400)] flex items-center gap-1">
                <Phone className="w-3 h-3" /> +91 98765 43210
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-[10px] text-[var(--color-base-500)] mb-0.5">Policy Number</p>
              <p className="text-xs font-semibold text-[var(--color-base-200)]">POL-2025-8832</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-base-500)] mb-0.5">Policy Type</p>
              <p className="text-xs font-semibold text-blue-400">Comprehensive Health</p>
            </div>
          </div>
        </div>

        {/* Incident Info */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[var(--color-base-500)] uppercase tracking-wider mb-2">Incident Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[var(--color-base-500)] mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date of Incident
              </p>
              <p className="text-xs font-semibold text-[var(--color-base-200)]">Oct 14, 2025</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-base-500)] mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </p>
              <p className="text-xs font-semibold text-[var(--color-base-200)]">Apollo Hospital, Mumbai</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-[var(--color-base-500)] mb-0.5 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Description
              </p>
              <p className="text-xs text-[var(--color-base-300)] leading-relaxed p-2.5 rounded-lg bg-[var(--color-base-900)] border border-[rgba(255,255,255,0.03)] mt-1">
                Emergency appendectomy surgery. Admitted through casualty ward experiencing severe abdominal pain. Surgery conducted on the same day.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Overview Bottom Bar */}
      <div className="bg-[var(--color-base-900)]/80 border-t border-[rgba(255,255,255,0.06)] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">Claimed Amount</p>
          <p className="text-xl font-black text-white">₹1,45,000</p>
        </div>
        <div className="w-px h-8 bg-[rgba(255,255,255,0.1)] hidden sm:block" />
        <div>
          <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">Available Coverage</p>
          <p className="text-xl font-black text-emerald-400">₹25,00,000</p>
        </div>
        <div className="w-px h-8 bg-[rgba(255,255,255,0.1)] hidden sm:block" />
        <div className="text-right">
          <p className="text-[10px] text-[var(--color-base-500)] uppercase tracking-wider mb-1">Assessor Estimated Approval</p>
          <p className="text-xl font-black text-[var(--color-base-300)]">₹1,32,000 <span className="text-[10px] font-normal text-red-400">(Deductibles apply)</span></p>
        </div>
      </div>
    </div>
  );
}
