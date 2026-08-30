'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { BarChartCollected } from '@/components/charts/BarChartCollected';
import { LineChartTrends } from '@/components/charts/LineChartTrends';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { ComparisonBadge } from '@/components/analytics/ComparisonBadge';
import { FunnelChart } from '@/components/analytics/FunnelChart';
import { ServicePerformanceTable } from '@/components/analytics/ServicePerformanceTable';
import {
  DateRangePreset,
  ExecutiveDashboardMetrics,
  LeadFunnelStage,
  ServicePerformanceMetric,
} from '@/lib/analytics/types';
import { AnalyticsService } from '@/lib/supabase/services/analytics';
import { exportReportCsvAction } from '@/app/actions/analytics';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  Users,
  Wrench,
  Bot,
  MessageSquare,
  Star,
  Layers,
  ChevronRight,
  Printer,
} from 'lucide-react';

export default function ReportsPage() {
  const {
    user,
    isDemoMode,
    invoices,
    leads,
    appointments,
    jobs,
    receptionistConversations,
    showToast,
    businessId,
    businessProfile,
    profile,
  } = useApp();
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'services' | 'funnel' | 'receptionist' | 'reputation'
  >('overview');

  const [metrics, setMetrics] = useState<ExecutiveDashboardMetrics | null>(null);
  const [funnel, setFunnel] = useState<LeadFunnelStage[]>([]);
  const [services, setServices] = useState<ServicePerformanceMetric[]>([]);

  const analyticsService = new AnalyticsService();

  useEffect(() => {
    const isDemo = isDemoMode || (!user && !businessId);

    if (isDemo) {
      const execMetrics = analyticsService.getDemoExecutiveDashboardMetrics(dateRange);
      const funnelStages = analyticsService.getDemoConversionFunnel();
      const serviceList = analyticsService.getDemoServicePerformance();

      Promise.resolve(execMetrics).then(setMetrics);
      setFunnel(funnelStages);
      setServices(serviceList);
    } else {
      const execMetrics = analyticsService.getExecutiveDashboardMetricsFromData(
        {
          invoices,
          leads,
          appointments,
          jobs,
          receptionistConversations,
        },
        dateRange
      );
      const funnelStages = analyticsService.getConversionFunnelFromData({
        leads,
        appointments,
        jobs,
        invoices,
      });
      const serviceList = analyticsService.getServicePerformanceFromData({
        jobs,
        invoices,
      });

      Promise.resolve(execMetrics).then(setMetrics);
      setFunnel(funnelStages);
      setServices(serviceList);
    }
  }, [
    dateRange,
    businessId,
    user,
    isDemoMode,
    invoices,
    leads,
    appointments,
    jobs,
    receptionistConversations,
  ]);

  const handleExportCsv = async () => {
    const isDemo = isDemoMode || !user;
    if (isDemo) {
      const csv = analyticsService.generateCsvExport(
        activeTab === 'services' ? 'services' : 'revenue',
        businessProfile?.name || profile.businessName
      );
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Ventrexs_${activeTab.toUpperCase()}_Report_${dateRange}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'CSV Report Downloaded',
        description: `Exported ${activeTab.toUpperCase()} dataset successfully.`,
        type: 'success',
      });
      return;
    }

    if (!businessId) return;

    try {
      const res = await exportReportCsvAction(
        businessId,
        activeTab === 'services' ? 'services' : 'revenue'
      );
      if (!res.success || !res.csvContent) {
        showToast({ title: 'Export Failed', description: res.error, type: 'error' });
        return;
      }

      const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename || 'ventrexs_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        title: 'CSV Report Generated',
        description: `Saved as ${res.filename}`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({ title: 'Export Error', description: err.message, type: 'error' });
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'overview', label: 'Financial & DSO' },
    { id: 'services', label: 'Service Yield' },
    { id: 'funnel', label: 'Pipeline Funnel' },
    { id: 'receptionist', label: 'AI Receptionist' },
    { id: 'reputation', label: 'Reputation & Reviews' },
  ];

  return (
    <AppShell
      title="Analytics & Business Intelligence"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPdf}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex text-xs"
          >
            Print / PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Analytics & Reporting Center
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container/20 text-primary">
                <ShieldCheck className="w-3.5 h-3.5" />
                Audited
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Track revenue velocity, pipeline throughput, service profitability, and operational telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={(preset) => setDateRange(preset)}
            />
          </div>
        </div>

        {/* Sub-Views Quick Links */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">
            Specialized Reports:
          </span>
          <Link href="/reports/technicians">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Wrench className="w-3.5 h-3.5 text-primary" />
              <span>Technician Performance</span>
              <ChevronRight className="w-3 h-3 text-outline" />
            </Button>
          </Link>
          <Link href="/reports/sources">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lead Source ROI</span>
              <ChevronRight className="w-3 h-3 text-outline" />
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-outline-variant/60 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Financial & DSO Overview */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Top Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChartCollected />
              <LineChartTrends />
            </div>

            {/* Financial KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-surface-container-low rounded-xl text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Avg. Days to Pay (DSO)
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
                    14.2
                  </span>
                  <span className="text-xs text-on-surface-variant"> days</span>
                </div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>-1.5 days recovery velocity</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-surface-container-low rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Collection Efficiency
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
                    94.8%
                  </span>
                </div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+3.2% vs previous period</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-surface-container-low rounded-xl text-amber-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Average Invoice Value
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
                    ${metrics.revenue.averageInvoiceValue.current.toLocaleString()}
                  </span>
                </div>
                <ComparisonBadge trend={metrics.revenue.averageInvoiceValue} />
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-surface-container-low rounded-xl text-purple-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Total Invoiced Volume
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
                    ${metrics.revenue.totalRevenue.current.toLocaleString()}
                  </span>
                </div>
                <ComparisonBadge trend={metrics.revenue.totalRevenue} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Service Profitability */}
        {activeTab === 'services' && (
          <ServicePerformanceTable services={services} />
        )}

        {/* Tab 3: Sales & Pipeline Funnel */}
        {activeTab === 'funnel' && (
          <FunnelChart stages={funnel} />
        )}

        {/* Tab 4: AI Receptionist */}
        {activeTab === 'receptionist' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-primary" /> Total AI Inquiries
                </span>
                <span className="text-3xl font-extrabold font-mono text-on-surface">
                  {metrics.receptionist.conversations.current}
                </span>
                <ComparisonBadge trend={metrics.receptionist.conversations} />
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated Appointments
                </span>
                <span className="text-3xl font-extrabold font-mono text-on-surface">
                  {metrics.receptionist.appointmentsBooked.current}
                </span>
                <ComparisonBadge trend={metrics.receptionist.appointmentsBooked} />
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" /> Avg Response Speed
                </span>
                <span className="text-3xl font-extrabold font-mono text-on-surface">
                  {metrics.receptionist.avgResponseTimeSeconds}s
                </span>
                <span className="text-xs text-emerald-600 font-bold">Sub-second streaming triage</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-on-surface">AI Triage Intent Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <div className="text-on-surface-variant">Emergency Triage</div>
                  <div className="text-lg font-bold font-mono text-rose-600 mt-1">12%</div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <div className="text-on-surface-variant">Booking Requests</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 mt-1">58%</div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <div className="text-on-surface-variant">Pricing Questions</div>
                  <div className="text-lg font-bold font-mono text-sky-600 mt-1">22%</div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <div className="text-on-surface-variant">Human Escalations</div>
                  <div className="text-lg font-bold font-mono text-amber-600 mt-1">8%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Reputation & Reviews */}
        {activeTab === 'reputation' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Google Star Rating
                </span>
                <span className="text-3xl font-extrabold font-mono text-on-surface">
                  {metrics.reputation.averageRating.current.toFixed(1)} / 5.0
                </span>
                <ComparisonBadge trend={metrics.reputation.averageRating} />
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" /> Review Requests Sent
                </span>
                <span className="text-3xl font-extrabold font-mono text-on-surface">
                  {metrics.reputation.reviewRequests.current}
                </span>
                <ComparisonBadge trend={metrics.reputation.reviewRequests} />
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Customer Response Rate
                </span>
                <span className="text-3xl font-extrabold font-mono text-on-surface">
                  {metrics.reputation.responseRate.current}%
                </span>
                <ComparisonBadge trend={metrics.reputation.responseRate} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
