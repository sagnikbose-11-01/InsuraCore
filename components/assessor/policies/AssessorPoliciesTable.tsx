'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ShieldCheck, Clock, XCircle, MoreVertical, FileText } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { SerializedPolicy } from '@/types';
import { PolicyListingStatus } from '@/lib/constants/enums';

interface Props {
  policies: SerializedPolicy[];
}

export function AssessorPoliciesTable({ policies }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = policies.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PolicyListingStatus.ACTIVE:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max"><ShieldCheck className="w-3.5 h-3.5" /> Active</span>;
      case PolicyListingStatus.PENDING_ADMIN_APPROVAL:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5 w-max"><Clock className="w-3.5 h-3.5" /> Pending Approval</span>;
      case PolicyListingStatus.REJECTED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-max"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 w-max">Inactive</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-base-900)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-lg shadow-[rgba(0,0,0,0.2)]">
        <div className="relative w-full sm:max-w-xs">
          <Input 
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftAdornment={<Search className="w-4 h-4 text-[var(--color-base-400)]" />}
            className="w-full bg-[var(--color-base-950)] border-none"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--color-base-400)] hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.1)] text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value={PolicyListingStatus.ACTIVE}>Active</option>
            <option value={PolicyListingStatus.PENDING_ADMIN_APPROVAL}>Pending Approval</option>
            <option value={PolicyListingStatus.REJECTED}>Rejected</option>
            <option value={PolicyListingStatus.INACTIVE}>Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-base-900)] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-base-300)]">
            <thead className="text-xs uppercase bg-[var(--color-base-950)]/50 text-[var(--color-base-400)]">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Policy Info</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Coverage & Premium</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-base-400)]">
                    No policies found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((policy) => (
                  <tr key={policy._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">{policy.name}</span>
                        <span className="text-xs text-[var(--color-base-400)]">{policy.type} • {policy.validityPeriod} months</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">₹{policy.coverageAmount.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-[var(--color-base-400)]">₹{policy.premiumAmount.toLocaleString('en-IN')}/m premium</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(policy.status || PolicyListingStatus.ACTIVE)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/assessor/policies/${policy._id}`}
                        className="p-2 inline-flex items-center justify-center rounded-lg hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
