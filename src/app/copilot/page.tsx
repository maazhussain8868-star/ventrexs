'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { Sparkles, Check, X, ArrowRight, Eye, Send, Info, ShieldCheck } from 'lucide-react';

export default function CopilotPage() {
  const router = useRouter();
  const { recommendations, approveRecommendation, dismissRecommendation, showToast } = useApp();

  const pendingRecs = recommendations.filter(r => r.status === 'pending');
  const resolvedRecs = recommendations.filter(r => r.status !== 'sent');

  return (
    <AppShell
      title="AI Collection Copilot"
      actions={
        <Link
          href="/follow-up"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-xs hover:bg-on-primary-fixed-variant transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Template Generator
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              AI Smart Collection Recommendations
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Truthful & Professional
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">info</span>
            AI generates ethical, customized payment reminders based on client payout timing. Your approval is required before delivery.
          </p>
        </div>

        {/* Bento Grid / AI Cards matching Stitch specification */}
        {pendingRecs.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-primary" />}
            title="All Recommendations Reviewed!"
            description="You're all caught up! Ventrexs AI is continuously monitoring your invoice aging and will surface new ethical collection insights automatically."
            actionLabel="View Invoices"
            onAction={() => router.push('/invoices')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRecs.map((rec) => (
              <article
                key={rec.id}
                className="ai-gradient-border ai-glow p-5 sm:p-6 flex flex-col gap-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary fill-icon text-[24px]">
                      smart_toy
                    </span>
                    <h2 className="text-lg font-bold text-on-surface">{rec.customerName}</h2>
                  </div>
                  <Badge priority={rec.priority} size="sm" />
                </div>

                {/* Amount & Days Overdue Grid */}
                <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Original Amount Due
                    </p>
                    <p className="text-xl font-bold text-on-surface mt-0.5 font-mono">
                      ${rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-error uppercase tracking-wider">
                      Days Overdue
                    </p>
                    <p className="text-xl font-bold text-error mt-0.5 font-mono">
                      {rec.daysOverdue} Days
                    </p>
                  </div>
                </div>

                {/* AI Insight Box matching Stitch */}
                <div className="bg-surface-container p-4 rounded-xl border border-primary/20">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">psychology</span>
                    AI Payout Timing Analysis
                  </p>
                  <p className="text-xs text-on-surface italic leading-relaxed">
                    &ldquo;{rec.aiInsight}&rdquo;
                  </p>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">Confidence Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="font-bold text-primary font-mono">{rec.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
                  <button
                    onClick={() => approveRecommendation(rec.id)}
                    className="flex-1 bg-primary text-on-primary font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Approve & Send
                  </button>

                  <Link
                    href={`/follow-up?invoiceId=${rec.invoiceId}&tone=${rec.tone}`}
                    className="flex-1 bg-surface-container-lowest text-on-surface border border-outline-variant font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl hover:bg-surface-container-low transition-colors flex items-center justify-center gap-1.5 text-center"
                  >
                    Customize Draft
                  </Link>

                  <button
                    onClick={() => dismissRecommendation(rec.id)}
                    className="p-2.5 rounded-xl border border-outline-variant text-outline-variant hover:text-error hover:bg-error/10 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
