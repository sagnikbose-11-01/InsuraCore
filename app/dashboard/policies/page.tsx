import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getMyPolicies } from '@/services/policy.service';
import { getAllPolicies } from '@/services/policy.service';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ShieldCheck, Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PolicyStatus, PolicyType } from '@/lib/constants/enums';
import { SerializedPolicy } from '@/types';

export const metadata: Metadata = { title: 'My Policies' };

const TYPE_COLORS: Record<PolicyType, string> = {
  HEALTH:   'text-[oklch(72%_0.17_150)] bg-[oklch(20%_0.05_150)] border-[oklch(30%_0.08_150)]',
  AUTO:     'text-[oklch(78%_0.18_75)] bg-[oklch(20%_0.05_75)] border-[oklch(30%_0.08_75)]',
  PROPERTY: 'text-[oklch(72%_0.20_230)] bg-[oklch(18%_0.08_230)] border-[oklch(28%_0.10_230)]',
  LIFE:     'text-[oklch(65%_0.20_25)] bg-[oklch(18%_0.05_25)] border-[oklch(28%_0.08_25)]',
  TRAVEL:   'text-[oklch(72%_0.15_260)] bg-[oklch(18%_0.05_260)] border-[oklch(28%_0.08_260)]',
};

export default async function PoliciesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [myPolicies, availablePolicies] = await Promise.all([
    getMyPolicies(session.id),
    getAllPolicies(true),
  ]);

  const activePolicies = myPolicies.filter((p) => p.status === PolicyStatus.ACTIVE);

  return (
    <DashboardShell>
      <PageHeader
        title="My Policies"
        description="Manage your active insurance policies and browse new plans."
      />

      {/* My Active Policies */}
      {activePolicies.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">
            Your Active Policies
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePolicies.map((p) => {
              const policy = p.policyId as SerializedPolicy;
              const typeClass = TYPE_COLORS[policy.type as PolicyType] ?? '';
              return (
                <Card key={p._id} className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[oklch(18%_0.08_230_/_0.4)] to-transparent rounded-bl-full" />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${typeClass}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {policy.type}
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-base-100)] mb-1">{policy.name}</h3>
                  <p className="text-xs text-[var(--color-base-500)] line-clamp-2 mb-4">{policy.description}</p>

                  <div className="space-y-2 border-t border-[var(--color-base-800)] pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-base-500)] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Coverage</span>
                      <span className="font-semibold text-[oklch(72%_0.20_230)]">{formatCurrency(policy.coverageAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-base-500)] flex items-center gap-1"><Calendar className="w-3 h-3" /> Started</span>
                      <span className="text-[var(--color-base-300)]">{formatDate(p.startDate)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-base-500)] flex items-center gap-1"><Clock className="w-3 h-3" /> Expires</span>
                      <span className="text-[var(--color-base-300)]">{formatDate(p.endDate)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Available Policies */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-base-400)] uppercase tracking-wider mb-4">
          Available Plans
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {availablePolicies.map((policy) => {
            const typeClass = TYPE_COLORS[policy.type as PolicyType] ?? '';
            const alreadyOwned = myPolicies.some(
              (p) => (p.policyId as SerializedPolicy)._id === policy._id && p.status === PolicyStatus.ACTIVE
            );
            return (
              <Card key={policy._id} glass className="group hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-4 ${typeClass}`}>
                  <ShieldCheck className="w-3 h-3" />
                  {policy.type}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-base-100)] mb-1">{policy.name}</h3>
                <p className="text-xs text-[var(--color-base-500)] line-clamp-3 mb-4">{policy.description}</p>

                <div className="space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-4 mb-5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-base-500)]">Premium</span>
                    <span className="font-bold text-[var(--color-base-100)]">{formatCurrency(policy.premiumAmount)}<span className="text-[var(--color-base-500)] font-normal">/mo</span></span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-base-500)]">Coverage up to</span>
                    <span className="font-semibold text-[oklch(72%_0.20_230)]">{formatCurrency(policy.coverageAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-base-500)]">Validity</span>
                    <span className="text-[var(--color-base-300)]">{policy.validityPeriod} months</span>
                  </div>
                </div>

                {alreadyOwned ? (
                  <Button variant="secondary" size="sm" className="w-full" disabled>
                    Already Owned
                  </Button>
                ) : (
                  <Link href={`/dashboard/policies/purchase/${policy._id}`}>
                    <Button size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Purchase Plan
                    </Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
