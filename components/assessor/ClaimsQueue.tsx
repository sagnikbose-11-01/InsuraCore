// ============================================================
// components/assessor/ClaimsQueue.tsx
// Data table component displaying high priority claims.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration until API is hooked up
const MOCK_CLAIMS = [
  { id: 'CLM-9821', holder: 'Arjun Mehta', type: 'Health', amount: '₹12,50,000', risk: 85, priority: 'High', status: 'Pending Review' },
  { id: 'CLM-9815', holder: 'Sarah Connor', type: 'Auto', amount: '₹1,25,000', risk: 42, priority: 'Medium', status: 'Under Review' },
  { id: 'CLM-9804', holder: 'Rajesh Kumar', type: 'Property', amount: '₹45,00,000', risk: 92, priority: 'High', status: 'Fraud Flagged' },
  { id: 'CLM-9799', holder: 'Priya Sharma', type: 'Travel', amount: '₹35,000', risk: 15, priority: 'Low', status: 'Pending Review' },
];

export async function ClaimsQueue({ claimsPromise }: { claimsPromise?: Promise<any[]> }) {
  const claims = claimsPromise ? await claimsPromise : MOCK_CLAIMS;
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRiskIcon = (risk: number) => {
    if (risk >= 80) return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    if (risk >= 40) return <Clock className="w-3.5 h-3.5 text-orange-400" />;
    return <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />;
  };

  const calculatePriority = (claim: any) => {
    if (claim.priority) return claim.priority;
    const amount = claim.claimAmount || 0;
    const risk = claim.riskScore || 0;
    if (amount > 1000000 || risk >= 80) return 'High';
    if (amount > 100000 || risk >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Active Work Queue</h2>
          <p className="text-xs text-[var(--color-base-400)] mt-1">Claims requiring immediate assessor attention</p>
        </div>
        <Link href="/assessor/claims" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Policy Holder</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Risk Score</th>
              <th>Priority</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim: any) => {
              const priority = calculatePriority(claim);
              const policyType = claim.policyType || claim.purchasedPolicyId?.policyId?.type || claim.type || 'UNKNOWN';

              return (
              <tr key={claim._id || claim.id} className="group cursor-default">
                <td className="font-mono text-xs font-semibold text-white">{claim._id || claim.id}</td>
                <td className="font-medium text-white">{claim.customerId?.name || claim.holder}</td>
                <td>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-base-300)] bg-[var(--color-base-800)] px-2 py-0.5 rounded border border-[var(--color-base-700)]">
                    {policyType}
                  </span>
                </td>
                <td className="font-mono text-xs font-semibold">₹{claim.claimAmount?.toLocaleString('en-IN') || claim.amount}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {getRiskIcon(claim.riskScore || claim.risk)}
                    <span className={cn(
                      "font-bold",
                      (claim.riskScore || claim.risk) >= 80 ? "text-red-400" : (claim.riskScore || claim.risk) >= 40 ? "text-orange-400" : "text-blue-400"
                    )}>{claim.riskScore || claim.risk}%</span>
                  </div>
                </td>
                <td>
                  <span className={cn("px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md border", getPriorityColor(priority))}>
                    {priority}
                  </span>
                </td>
                <td className="text-[var(--color-base-300)]">{claim.status}</td>
                <td className="text-right">
                  <Link 
                    href={`/assessor/claims/${claim._id || claim.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                  >
                    Review
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
