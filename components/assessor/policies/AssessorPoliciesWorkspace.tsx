'use client';

import { useState } from 'react';
import { FileText, Plus, BarChart3 } from 'lucide-react';
import { AssessorPoliciesTable } from './AssessorPoliciesTable';
import { AssessorPolicyWizard } from './AssessorPolicyWizard';
import { AssessorPoliciesAnalytics } from './AssessorPoliciesAnalytics';
import { SerializedPolicy } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  initialPolicies: SerializedPolicy[];
  analytics: any;
  specialization: string;
  assessorId: string;
}

type TabType = 'overview' | 'create' | 'analytics';

export function AssessorPoliciesWorkspace({ initialPolicies, analytics, specialization, assessorId }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'My Policies', icon: FileText },
    { id: 'create', label: 'Create New Policy', icon: Plus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-[var(--color-base-950)]/50 p-1 rounded-xl border border-[rgba(255,255,255,0.05)] w-full max-w-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-800)]'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <AssessorPoliciesTable policies={initialPolicies} />
        )}
        {activeTab === 'create' && (
          <AssessorPolicyWizard 
            specialization={specialization} 
            assessorId={assessorId}
            onSuccess={() => setActiveTab('overview')} 
          />
        )}
        {activeTab === 'analytics' && (
          <AssessorPoliciesAnalytics analytics={analytics} />
        )}
      </div>
    </div>
  );
}
