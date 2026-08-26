'use client';

import React from 'react';
import Link from 'next/link';
import { LeadFunnelStage } from '@/lib/analytics/types';
import { ChevronRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface FunnelChartProps {
  stages: LeadFunnelStage[];
  title?: string;
  subtitle?: string;
}

export function FunnelChart({
  stages,
  title = 'Service Sales & Pipeline Funnel',
  subtitle = 'Progression velocity from inbound inquiry to completed and invoiced work.',
}: FunnelChartProps) {
  const maxCount = stages.length > 0 ? Math.max(...stages.map((s) => s.count)) : 1;

  return (
    <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-base text-on-surface tracking-tight">{title}</h3>
          <p className="text-xs text-on-surface-variant">{subtitle}</p>
        </div>
        <span className="text-[11px] font-mono text-outline font-semibold">6 Lifecycle Stages</span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const widthPercent = maxCount > 0 ? Math.max(15, Math.round((stage.count / maxCount) * 100)) : 100;

          return (
            <div key={stage.stage} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                    {stage.label}
                  </span>
                  {stage.href && (
                    <Link
                      href={stage.href}
                      className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                    >
                      View CRM <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-bold font-mono text-on-surface">
                    {stage.count.toLocaleString()} prospects
                  </span>
                  <span className="text-tertiary font-bold text-[11px]">
                    {stage.conversionPercent}%
                  </span>
                  {stage.estimatedValue > 0 && (
                    <span className="text-on-surface-variant font-mono text-[11px] hidden sm:inline">
                      ${stage.estimatedValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div className="h-7 w-full bg-surface-container-high rounded-xl overflow-hidden p-1 flex items-center">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 flex items-center justify-between px-3 text-[11px] font-bold text-on-primary"
                  style={{ width: `${widthPercent}%` }}
                >
                  <span>{stage.count}</span>
                  {idx > 0 && stage.dropOffPercent > 0 && (
                    <span className="text-[10px] opacity-80 flex items-center gap-0.5">
                      <ArrowDownRight className="w-3 h-3" />
                      -{stage.dropOffPercent}% drop
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
