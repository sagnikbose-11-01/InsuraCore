// ============================================================
// components/assessor/FraudScoreCard.tsx
// AI Fraud Detection Panel showing risk scores and reasons.
// ============================================================

import React from 'react';
import { ShieldAlert, AlertTriangle, Fingerprint, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FraudScoreCard({ score = 82 }: { score?: number }) {
  const isHighRisk = score >= 80;
  const isMediumRisk = score >= 40 && score < 80;
  
  const colorClass = isHighRisk 
    ? 'text-red-400 border-red-500/20 bg-red-500/5' 
    : isMediumRisk 
      ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' 
      : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';

  const progressColor = isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <div className={cn("glass-card overflow-hidden border", colorClass)}>
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" /> AI Fraud Analysis
        </h3>
        {isHighRisk && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 px-2 py-0.5 rounded text-red-400 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> High Risk Detected
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Score Ring Simulator */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full border-4 border-[rgba(255,255,255,0.05)]">
          {/* Simulated SVG progress circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[rgba(255,255,255,0.05)] stroke-current"
              strokeWidth="6"
              cx="50"
              cy="50"
              r="44"
              fill="transparent"
            />
            <circle
              className={cn("stroke-current transition-all duration-1000 ease-out", isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-orange-500' : 'text-emerald-500')}
              strokeWidth="6"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="44"
              fill="transparent"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * score) / 100}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">{score}%</span>
            <span className="text-[9px] uppercase tracking-wider opacity-70">Risk</span>
          </div>
        </div>

        {/* Reasons List */}
        <div className="flex-1 w-full space-y-3">
          <p className="text-xs font-semibold text-[var(--color-base-300)] mb-1">Detection Flags:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs text-[var(--color-base-200)] bg-[var(--color-base-900)]/50 p-2 rounded-lg border border-[rgba(255,255,255,0.03)]">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Unusually High Claim Amount:</strong> The requested amount is 3.5x higher than the historic average for this procedure code.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-[var(--color-base-200)] bg-[var(--color-base-900)]/50 p-2 rounded-lg border border-[rgba(255,255,255,0.03)]">
              <Fingerprint className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Suspicious Documentation Pattern:</strong> Invoice timestamps from "Apollo Hospital" appear digitally altered. OCR mismatch detected.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-[var(--color-base-200)] bg-[var(--color-base-900)]/50 p-2 rounded-lg border border-[rgba(255,255,255,0.03)]">
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Policy Timeline:</strong> Claim filed exactly 14 days after policy inception (waiting period borderline).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
