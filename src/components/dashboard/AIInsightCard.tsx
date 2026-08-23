'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AIInsightCardProps {
  title?: string;
  insight: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  confidence?: number;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title = 'AI Collection Insight',
  insight,
  actionLabel = 'Draft Follow-up',
  actionHref = '/follow-up',
  onAction,
  confidence
}) => {
  return (
    <section className="bg-surface border-l-4 border-primary rounded-r-2xl border-y border-r border-outline-variant p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="absolute right-0 top-0 w-36 h-36 bg-primary/5 rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-4 items-start relative z-10">
        <div className="p-2.5 bg-primary-container text-on-primary-container rounded-xl shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-[24px] fill-icon">smart_toy</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-sm text-on-surface">{title}</h3>
            {confidence && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                {confidence}% Confidence
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mb-4 leading-relaxed">
            {insight}
          </p>

          <div className="flex items-center gap-3">
            {onAction ? (
              <button
                onClick={onAction}
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-xs"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-xs"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/copilot"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Copilot Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
