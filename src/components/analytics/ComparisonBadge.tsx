'use client';

import React from 'react';
import { MetricTrend } from '@/lib/analytics/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonBadgeProps {
  trend: MetricTrend<any>;
  label?: string;
  size?: 'sm' | 'md';
}

export function ComparisonBadge({
  trend,
  label = 'vs prior period',
  size = 'sm',
}: ComparisonBadgeProps) {
  const isZero = trend.changePercent === 0;
  const isPositive = trend.isPositiveChange;

  const getColorClasses = () => {
    if (isZero) {
      return 'text-on-surface-variant bg-surface-container-high border-outline-variant';
    }
    if (isPositive) {
      return 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    }
    return 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20';
  };

  const getIcon = () => {
    if (isZero) {
      return <Minus className="w-3 h-3" />;
    }
    if (trend.changePercent > 0) {
      return <TrendingUp className="w-3 h-3" />;
    }
    return <TrendingDown className="w-3 h-3" />;
  };

  const formattedPercent = isZero
    ? '0.0%'
    : `${trend.changePercent > 0 ? '+' : ''}${trend.changePercent}%`;

  return (
    <div className="inline-flex items-center gap-1.5 text-[11px]">
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-md px-1.5 py-0.5 border ${getColorClasses()}`}
      >
        {getIcon()}
        <span>{formattedPercent}</span>
      </span>
      {label && <span className="text-on-surface-variant font-medium">{label}</span>}
    </div>
  );
}
