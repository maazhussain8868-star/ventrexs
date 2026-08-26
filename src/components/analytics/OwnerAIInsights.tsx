'use client';

import React from 'react';
import Link from 'next/link';
import { OwnerInsight, InsightCategory } from '@/lib/analytics/types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OwnerAIInsightsProps {
  insights: OwnerInsight[];
  title?: string;
  subtitle?: string;
}

export function OwnerAIInsights({
  insights,
  title = 'Owner AI Insights & Opportunity Radar',
  subtitle = 'Continuous business telemetry synthesis with proactive field operational recommendations.',
}: OwnerAIInsightsProps) {
  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'URGENT':
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'OPPORTUNITY':
        return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
  };

  const getCategoryBadgeClass = (category: InsightCategory) => {
    switch (category) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'OPPORTUNITY':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'INFO':
      default:
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-container/20 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface tracking-tight">{title}</h3>
            <p className="text-xs text-on-surface-variant">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-tertiary font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Read-Only Advisory</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col justify-between gap-3 hover:border-outline-variant transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                    insight.category
                  )}`}
                >
                  {getCategoryIcon(insight.category)}
                  {insight.category}
                </span>
                <span className="text-[11px] font-mono text-outline font-medium">
                  {insight.supportingMetric}
                </span>
              </div>

              <h4 className="text-sm font-bold text-on-surface leading-snug">
                {insight.title}
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {insight.explanation}
              </p>
            </div>

            <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-on-surface font-medium italic">
                {insight.recommendedAction}
              </span>
              {insight.actionHref && (
                <Link href={insight.actionHref}>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2.5 gap-1">
                    <span>{insight.actionLabel || 'Act'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
