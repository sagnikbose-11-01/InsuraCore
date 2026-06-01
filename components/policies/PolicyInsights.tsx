'use client';
// ============================================================
// components/policies/PolicyInsights.tsx
// AI-style smart insurance insights based on which types
// of policies the user owns vs what gaps they have.
// ============================================================

import {
  Lightbulb, Heart, Car, Home, Globe, Shield,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { PolicyType } from '@/lib/constants/enums';

interface PolicyInsightsProps {
  ownedTypes: PolicyType[];
}

type InsightType = 'owned' | 'gap';

interface Insight {
  type: InsightType;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
}

const ALL_TYPE_INSIGHTS: Record<PolicyType, { icon: React.ElementType; ownedText: string; gapText: string; iconColor: string; iconBg: string }> = {
  [PolicyType.HEALTH]:   { icon: Heart,  iconColor: 'text-[oklch(72%_0.17_150)]', iconBg: 'bg-[oklch(20%_0.05_150)] border-[oklch(30%_0.08_150)]', ownedText: 'Your health insurance is active and covers medical expenses, hospitalisation, and critical illness treatment.', gapText: 'You have no health insurance. Medical emergencies can cost ₹5L+ — health cover is your first line of defense.' },
  [PolicyType.AUTO]:     { icon: Car,    iconColor: 'text-[oklch(78%_0.18_75)]',  iconBg: 'bg-[oklch(20%_0.05_75)] border-[oklch(30%_0.08_75)]',   ownedText: 'Your vehicle insurance is active and protects against accident damages, theft, and third-party liability.',    gapText: 'No vehicle insurance detected. If you own a vehicle, third-party insurance is legally mandatory in India.'       },
  [PolicyType.PROPERTY]: { icon: Home,   iconColor: 'text-[oklch(72%_0.20_230)]', iconBg: 'bg-[oklch(18%_0.08_230)] border-[oklch(28%_0.10_230)]', ownedText: 'Your property insurance is active and fully protects your residence against structural damage and natural disasters.', gapText: 'Consider adding property insurance to protect your home against floods, fires, earthquakes, and theft.'               },
  [PolicyType.LIFE]:     { icon: Shield, iconColor: 'text-[oklch(65%_0.20_25)]',  iconBg: 'bg-[oklch(18%_0.05_25)] border-[oklch(28%_0.08_25)]',   ownedText: 'Your life insurance is active and ensures your family\'s financial security in the event of an unforeseen circumstance.', gapText: 'Recommended: Add life insurance to ensure your family\'s financial security and cover debts/loans.'               },
  [PolicyType.TRAVEL]:   { icon: Globe,  iconColor: 'text-[oklch(72%_0.15_260)]', iconBg: 'bg-[oklch(18%_0.05_260)] border-[oklch(28%_0.08_260)]', ownedText: 'Your travel insurance is active and covers trip cancellations, medical emergencies abroad, and lost baggage.', gapText: 'If you travel internationally, travel insurance protects you from trip cancellations and overseas medical costs.'         },
};

export function PolicyInsights({ ownedTypes }: PolicyInsightsProps) {
  const insights: Insight[] = Object.entries(ALL_TYPE_INSIGHTS).map(([type, cfg]) => {
    const isOwned = ownedTypes.includes(type as PolicyType);
    return {
      type:      isOwned ? 'owned' : 'gap',
      icon:      cfg.icon,
      iconColor: cfg.iconColor,
      iconBg:    cfg.iconBg,
      title:     `${type.charAt(0)}${type.slice(1).toLowerCase()} Insurance`,
      body:      isOwned ? cfg.ownedText : cfg.gapText,
    };
  });

  const owned = insights.filter(i => i.type === 'owned');
  const gaps  = insights.filter(i => i.type === 'gap');

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[oklch(20%_0.05_75)] border border-[oklch(30%_0.08_75)] flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-[oklch(78%_0.18_75)]" />
        </div>
        <h2 className="text-sm font-semibold text-[var(--color-base-300)] uppercase tracking-wider">
          Protection Insights
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Owned — green check */}
        {owned.map(insight => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className="glass-card p-4 flex gap-3 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${insight.iconBg}`}>
                <Icon className={`w-4 h-4 ${insight.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-[oklch(72%_0.17_150)]" />
                  <p className="text-xs font-semibold text-[var(--color-base-200)]">{insight.title}</p>
                </div>
                <p className="text-[11px] text-[var(--color-base-500)] leading-relaxed">{insight.body}</p>
              </div>
            </div>
          );
        })}

        {/* Gaps — amber alert */}
        {gaps.map(insight => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className="glass-card p-4 flex gap-3 hover:-translate-y-0.5 transition-transform duration-200 border-[oklch(28%_0.08_75_/_0.5)]"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 bg-[oklch(20%_0.05_75)] border-[oklch(30%_0.08_75)]`}>
                <Icon className="w-4 h-4 text-[oklch(78%_0.18_75)]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3 h-3 text-[oklch(78%_0.18_75)]" />
                  <p className="text-xs font-semibold text-[oklch(78%_0.18_75)]">Gap: {insight.title}</p>
                </div>
                <p className="text-[11px] text-[var(--color-base-500)] leading-relaxed">{insight.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
