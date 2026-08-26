'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { useApp } from '@/context/AppContext';
import { Invoice } from '@/types';
import {
  DateRangePreset,
  ExecutiveDashboardMetrics,
  LeadFunnelStage,
  OwnerInsight,
  DailyBriefing,
} from '@/lib/analytics/types';
import { AnalyticsService } from '@/lib/supabase/services/analytics';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { ComparisonBadge } from '@/components/analytics/ComparisonBadge';
import { FunnelChart } from '@/components/analytics/FunnelChart';
import { OwnerAIInsights } from '@/components/analytics/OwnerAIInsights';
import { DailyBriefCard } from '@/components/analytics/DailyBriefCard';
import {
  Plus,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Users,
  Wrench,
  Bot,
  MessageSquare,
  Star,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    invoices,
    leads,
    appointments,
    jobs,
    businessProfile,
    profile,
    businessId,
  } = useApp();

  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [metrics, setMetrics] = useState<ExecutiveDashboardMetrics | null>(null);
  const [funnel, setFunnel] = useState<LeadFunnelStage[]>([]);
  const [insights, setInsights] = useState<OwnerInsight[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const analyticsService = new AnalyticsService();

  useEffect(() => {
    // Load deterministic business intelligence metrics for the selected range
    const execMetrics = analyticsService.getExecutiveDashboardMetrics(businessId || 'biz_demo', dateRange);
    const funnelStages = analyticsService.getConversionFunnel();
    const ownerInsights = analyticsService.generateOwnerInsights();
    const dailyBrief = analyticsService.generateDailyBriefing(businessProfile?.name || profile.businessName);

    Promise.resolve(execMetrics).then(setMetrics);
    setFunnel(funnelStages);
    setInsights(ownerInsights);
    setBriefing(dailyBrief);
  }, [dateRange, businessId, businessProfile, profile]);

  const currentBusinessName = businessProfile?.name || profile.businessName;
  const currentIndustry = businessProfile?.industry || 'HVAC & Field Service';

  // Active work orders
  const activeJobs = jobs.slice(0, 3);
  // High priority overdue invoices
  const attentionInvoices = invoices
    .filter((i) => i.status === 'overdue' || (i.status === 'due' && i.priority === 'high'))
    .slice(0, 3);

  return (
    <AppShell title="Executive Business Intelligence">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Cockpit Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                {currentBusinessName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container/20 text-primary">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentIndustry} OS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-2">
              <span>Owner Command Center & Executive Telemetry</span>
              <span className="text-outline">•</span>
              <span className="flex items-center gap-1 text-tertiary font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                Real-Time Data
              </span>
            </p>
          </div>

          {/* Date Range Preset Selector */}
          <div className="flex items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={(preset) => setDateRange(preset)}
            />
          </div>
        </div>

        {/* 1. Daily Owner Morning Briefing */}
        {briefing && <DailyBriefCard briefing={briefing} />}

        {/* 2. Owner AI Insights & Opportunity Radar */}
        <OwnerAIInsights insights={insights} />

        {/* 3. Executive KPI Clusters */}
        {metrics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface tracking-tight">
                Core Performance Clusters
              </h2>
              <span className="text-xs text-on-surface-variant font-mono">
                Compared vs. prior {dateRange.toUpperCase()} period
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cluster A: Revenue */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary" /> Total Revenue
                  </span>
                  <ComparisonBadge trend={metrics.revenue.totalRevenue} />
                </div>
                <div>
                  <span className="text-3xl font-extrabold font-mono text-on-surface">
                    ${metrics.revenue.totalRevenue.current.toLocaleString()}
                  </span>
                  <div className="mt-1 text-xs text-on-surface-variant flex items-center justify-between">
                    <span>MTD: ${metrics.revenue.revenueThisMonth.toLocaleString()}</span>
                    <span>Paid: ${metrics.revenue.paidInvoiceAmount.current.toLocaleString()}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-medium">Outstanding Balances:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    ${metrics.revenue.outstandingBalance.current.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Cluster B: Sales & Conversion */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" /> New Leads
                  </span>
                  <ComparisonBadge trend={metrics.sales.newLeads} />
                </div>
                <div>
                  <span className="text-3xl font-extrabold font-mono text-on-surface">
                    {metrics.sales.newLeads.current}
                  </span>
                  <div className="mt-1 text-xs text-on-surface-variant flex items-center justify-between">
                    <span>Qualified: {metrics.sales.qualifiedLeads.current}</span>
                    <span>Won Deals: {metrics.sales.wonDeals.current}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-medium">Lead Conversion Rate:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {metrics.sales.conversionRate.current}%
                  </span>
                </div>
              </div>

              {/* Cluster C: Operations & Jobs */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-sky-600" /> Completed Jobs
                  </span>
                  <ComparisonBadge trend={metrics.operations.completedJobs} />
                </div>
                <div>
                  <span className="text-3xl font-extrabold font-mono text-on-surface">
                    {metrics.operations.completedJobs.current}
                  </span>
                  <div className="mt-1 text-xs text-on-surface-variant flex items-center justify-between">
                    <span>In-Progress: {metrics.operations.inProgressJobs}</span>
                    <span>Scheduled: {metrics.operations.scheduledJobs}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-medium">Avg Completion Time:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {metrics.operations.averageCompletionHours.current} hrs
                  </span>
                </div>
              </div>

              {/* Cluster D: AI Receptionist */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-600" /> AI Conversations
                  </span>
                  <ComparisonBadge trend={metrics.receptionist.conversations} />
                </div>
                <div>
                  <span className="text-3xl font-extrabold font-mono text-on-surface">
                    {metrics.receptionist.conversations.current}
                  </span>
                  <div className="mt-1 text-xs text-on-surface-variant flex items-center justify-between">
                    <span>Auto-Booked: {metrics.receptionist.appointmentsBooked.current}</span>
                    <span>Response: {metrics.receptionist.avgResponseTimeSeconds}s</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-medium">AI Triage Conversion:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {metrics.receptionist.aiConversionRate.current}%
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Estimates */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Estimate Approval Rate
                  </span>
                  <div className="text-xl font-bold font-mono text-on-surface">
                    {metrics.sales.estimateApprovalRate.current}%
                  </div>
                </div>
                <ComparisonBadge trend={metrics.sales.estimateApprovalRate} label="" />
              </div>

              {/* Reputation */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Google Review Rating
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {metrics.reputation.averageRating.current.toFixed(1)} / 5.0
                  </div>
                </div>
                <ComparisonBadge trend={metrics.reputation.averageRating} label="" />
              </div>

              {/* Communications */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Carrier Delivery Rate
                  </span>
                  <div className="text-xl font-bold font-mono text-on-surface">
                    {metrics.communications.deliveryRate.current}%
                  </div>
                </div>
                <ComparisonBadge trend={metrics.communications.deliveryRate} label="" />
              </div>

              {/* Customer Retention */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Repeat Customer Rate
                  </span>
                  <div className="text-xl font-bold font-mono text-on-surface">
                    {metrics.customers.repeatServiceRate}%
                  </div>
                </div>
                <span className="text-[11px] font-bold text-tertiary">
                  {metrics.customers.returningCustomers} returning
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. CRM & Sales Conversion Funnel */}
        <FunnelChart stages={funnel} />

        {/* 5. Live Operations Dispatch & Receivables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Work Orders */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-on-surface tracking-tight">
                  Active Field Dispatches
                </h3>
                <p className="text-xs text-on-surface-variant">Scheduled and in-progress jobs</p>
              </div>
              <Link href="/jobs">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <span>View All Jobs</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {activeJobs.length === 0 ? (
                <div className="text-xs text-on-surface-variant py-4 text-center">
                  No active jobs scheduled today.
                </div>
              ) : (
                activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">{job.title}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Tech: {job.assignedTechName || 'Unassigned'} • Customer: {job.customerName}
                      </p>
                    </div>
                    <Badge jobStatus={job.status} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Priority Invoices Requiring Follow-Up */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-on-surface tracking-tight">
                  Receivables Requiring Follow-up
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Invoices reaching net terms or overdue
                </p>
              </div>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <span>View Ledger</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {attentionInvoices.length === 0 ? (
                <div className="text-xs text-on-surface-variant py-4 text-center">
                  All active receivables are up to date.
                </div>
              ) : (
                attentionInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">
                        Invoice #{inv.number}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Due: {inv.dueDate} • Balance: ${inv.remainingBalance.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoiceForPayment(inv)}
                      className="text-xs h-7 px-2.5"
                    >
                      Record Payment
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          invoice={selectedInvoiceForPayment}
          isOpen={Boolean(selectedInvoiceForPayment)}
          onClose={() => setSelectedInvoiceForPayment(null)}
        />
      )}
    </AppShell>
  );
}
