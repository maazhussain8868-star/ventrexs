'use client';

import React from 'react';
import Link from 'next/link';
import { DailyBriefing } from '@/lib/analytics/types';
import {
  Sun,
  Calendar,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DailyBriefCardProps {
  briefing: DailyBriefing;
}

export function DailyBriefCard({ briefing }: DailyBriefCardProps) {
  const { snapshot, priorityActions } = briefing;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-container/30 via-surface-container-lowest to-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary text-on-primary shadow-xs">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-on-surface tracking-tight">
                {briefing.greeting}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                Owner Brief
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{briefing.generatedDate} • Daily Snapshot</p>
          </div>
        </div>
      </div>

      {/* Snapshot Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Appointments
          </span>
          <span className="text-xl font-bold font-mono text-on-surface mt-1">
            {snapshot.scheduledAppointmentsCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" /> New Leads
          </span>
          <span className="text-xl font-bold font-mono text-on-surface mt-1">
            {snapshot.newLeadsCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-sky-600" /> Estimates Pending
          </span>
          <span className="text-xl font-bold font-mono text-on-surface mt-1">
            {snapshot.pendingEstimatesCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Outstanding
          </span>
          <span className="text-xl font-bold font-mono text-on-surface mt-1">
            ${snapshot.outstandingAmount.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Urgent Follow-up
          </span>
          <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {snapshot.urgentLeadsCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-tertiary" /> Open Tech Slots
          </span>
          <span className="text-xl font-bold font-mono text-on-surface mt-1">
            {snapshot.openTechSlotsCount}
          </span>
        </div>
      </div>

      {/* Priority Action Items */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Priority Actions for Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {priorityActions.map((action, idx) => (
            <div
              key={action.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                action.isUrgent
                  ? 'bg-rose-500/5 border-rose-500/20'
                  : 'bg-surface-container-low border-outline-variant/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                  <span className="w-4 h-4 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{action.title}</span>
                </div>
                <p className="text-xs text-on-surface-variant pl-5.5">{action.detail}</p>
              </div>

              <div className="pl-5.5">
                <Link href={action.href}>
                  <Button
                    variant={action.isUrgent ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full text-xs h-7 gap-1"
                  >
                    <span>{action.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
