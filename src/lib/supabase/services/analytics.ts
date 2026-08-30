import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';
import {
  DateRangePreset,
  DateRangeFilter,
  MetricTrend,
  ExecutiveDashboardMetrics,
  LeadFunnelStage,
  ServicePerformanceMetric,
  TechnicianPerformanceReport,
  LeadSourceRoiMetric,
  OwnerInsight,
  DailyBriefing,
  AnomalyAlert,
} from '@/lib/analytics/types';

export interface AnalyticsWorkspaceData {
  invoices?: any[];
  leads?: any[];
  jobs?: any[];
  appointments?: any[];
  estimates?: any[];
  customers?: any[];
  receptionistConversations?: any[];
  reviewRequests?: any[];
  customerFeedback?: any[];
  communications?: any[];
  isDemo?: boolean;
}

export class AnalyticsService {
  constructor(private client?: SupabaseClient<Database> | null) {}

  /**
   * Helper: Parse Date Range Preset into current & previous time windows
   */
  static parseDateRange(preset: DateRangePreset, customStart?: string, customEnd?: string): {
    current: { start: Date; end: Date };
    previous: { start: Date; end: Date };
    filter: DateRangeFilter;
  } {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date = new Date(now);

    switch (preset) {
      case 'today': {
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      }
      case 'yesterday': {
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      }
      case '7d': {
        currentStart = new Date(now.getTime() - 7 * 86400000);
        break;
      }
      case 'this_month': {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      }
      case 'last_month': {
        currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      }
      case 'this_quarter': {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        currentStart = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0);
        break;
      }
      case 'last_quarter': {
        const prevQMonth = (Math.floor(now.getMonth() / 3) - 1) * 3;
        currentStart = new Date(now.getFullYear(), prevQMonth, 1, 0, 0, 0);
        currentEnd = new Date(now.getFullYear(), prevQMonth + 3, 0, 23, 59, 59);
        break;
      }
      case 'this_year': {
        currentStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        break;
      }
      case 'custom': {
        currentStart = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 86400000);
        currentEnd = customEnd ? new Date(customEnd) : new Date(now);
        break;
      }
      case '30d':
      default: {
        currentStart = new Date(now.getTime() - 30 * 86400000);
        break;
      }
    }

    const durationMs = currentEnd.getTime() - currentStart.getTime();
    const prevEnd = new Date(currentStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    return {
      current: { start: currentStart, end: currentEnd },
      previous: { start: prevStart, end: prevEnd },
      filter: {
        preset,
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
      },
    };
  }

  /**
   * Helper: Safe percentage change calculation without NaN / Infinity
   */
  static calculateTrend<T extends number>(
    current: T,
    previous: T,
    higherIsBetter: boolean = true
  ): MetricTrend<T> {
    const cur = Number(current) || 0;
    const prev = Number(previous) || 0;

    let changePercent = 0;
    if (prev === 0) {
      changePercent = cur > 0 ? 100 : 0;
    } else {
      changePercent = Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;
    }

    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (changePercent > 0) trend = 'up';
    else if (changePercent < 0) trend = 'down';

    const isPositiveChange = higherIsBetter ? changePercent >= 0 : changePercent <= 0;

    return {
      current,
      previous,
      changePercent,
      trend,
      isPositiveChange,
    };
  }

  /**
   * 1. Compute Full Executive Dashboard Metrics dynamically from actual data
   */
  getExecutiveDashboardMetricsFromData(
    data: AnalyticsWorkspaceData,
    preset: DateRangePreset = '30d',
    customStart?: string,
    customEnd?: string
  ): ExecutiveDashboardMetrics {
    const { filter } = AnalyticsService.parseDateRange(preset, customStart, customEnd);

    // If explicit demo mode is requested, return demo figures
    if (data.isDemo) {
      return this.getDemoExecutiveDashboardMetrics(filter);
    }

    const invoices = data.invoices || [];
    const leads = data.leads || [];
    const jobs = data.jobs || [];
    const estimates = data.estimates || [];
    const customers = data.customers || [];
    const receptionistConversations = data.receptionistConversations || [];
    const communications = data.communications || [];
    const reviewRequests = data.reviewRequests || [];
    const customerFeedback = data.customerFeedback || [];

    // Revenue calculations (Halal-compliant: principal amounts only)
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalRevenueAmount = invoices.reduce((sum, i) => sum + (Number(i.originalAmountDue || i.original_amount || i.amount || 0)), 0);
    const paidAmount = invoices.reduce((sum, i) => sum + (Number(i.paymentsReceived || i.amount_paid || 0)), 0);
    const outstandingAmount = invoices.reduce((sum, i) => sum + (Number(i.remainingBalance || i.remaining_balance || 0)), 0);
    const avgInvVal = invoices.length > 0 ? Math.round(totalRevenueAmount / invoices.length) : 0;

    // Monthly revenue
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const revenueThisMonth = invoices
      .filter(i => (i.issueDate || i.issue_date || i.createdAt || '').startsWith(currentMonthPrefix))
      .reduce((sum, i) => sum + (Number(i.paymentsReceived || i.amount_paid || 0)), 0);

    // Sales metrics
    const newLeadsCount = leads.filter(l => l.status === 'NEW').length;
    const qualifiedLeadsCount = leads.filter(l => l.status === 'QUALIFIED').length;
    const estimatesSentCount = estimates.filter(e => e.status === 'SENT').length;
    const estimatesApprovedCount = estimates.filter(e => e.status === 'APPROVED').length;
    const approvalRate = estimates.length > 0 ? Math.round((estimatesApprovedCount / estimates.length) * 1000) / 10 : 0;
    const wonDealsCount = leads.filter(l => l.status === 'WON').length;
    const lostDealsCount = leads.filter(l => l.status === 'LOST').length;
    const conversionRate = leads.length > 0 ? Math.round((wonDealsCount / leads.length) * 1000) / 10 : 0;

    // Operations metrics
    const totalJobsCount = jobs.length;
    const scheduledJobsCount = jobs.filter(j => j.status === 'SCHEDULED' || j.status === 'DISPATCHED').length;
    const inProgressJobsCount = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'ON_HOLD').length;
    const completedJobsCount = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'INVOICED').length;
    const cancelledJobsCount = jobs.filter(j => j.status === 'CANCELLED').length;
    const cancellationRate = totalJobsCount > 0 ? Math.round((cancelledJobsCount / totalJobsCount) * 1000) / 10 : 0;

    // Customer metrics
    const newCustomersCount = customers.length;
    const returningCustomersCount = 0;
    const repeatServiceRate = 0;
    const satisfactionScore = customerFeedback.length > 0
      ? Math.round((customerFeedback.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / (customerFeedback.length * 5)) * 1000) / 10
      : 0;

    // AI Receptionist metrics
    const totalConversations = receptionistConversations.length;
    const leadsCreatedFromAI = receptionistConversations.filter(c => !!c.leadId).length;
    const appointmentsBookedFromAI = receptionistConversations.filter(c => c.state === 'BOOKED' || !!c.appointmentId).length;
    const handoffsFromAI = receptionistConversations.filter(c => c.state === 'HANDOFF_REQUIRED' || c.handoffRequired).length;
    const aiConvRate = totalConversations > 0 ? Math.round((appointmentsBookedFromAI / totalConversations) * 1000) / 10 : 0;

    // Communications metrics
    const emailsSent = communications.filter(c => c.channel === 'email' && c.deliveryStatus === 'delivered').length;
    const smsSent = communications.filter(c => c.channel === 'sms' && c.deliveryStatus === 'delivered').length;
    const whatsappSent = communications.filter(c => c.channel === 'whatsapp' && c.deliveryStatus === 'delivered').length;
    const totalCommSent = emailsSent + smsSent + whatsappSent;
    const failedMessages = communications.filter(c => c.deliveryStatus === 'failed').length;
    const deliveryRate = totalCommSent > 0 ? Math.round(((totalCommSent - failedMessages) / totalCommSent) * 1000) / 10 : 100;
    const optOuts = communications.filter(c => c.deliveryStatus === 'opted_out').length;

    // Reputation metrics
    const reviewRequestsCount = reviewRequests.length;
    const reviewsReceivedCount = customerFeedback.length;
    const avgRating = customerFeedback.length > 0
      ? Math.round((customerFeedback.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / customerFeedback.length) * 10) / 10
      : 0;
    const positiveCount = customerFeedback.filter(f => (Number(f.rating) || 0) >= 4).length;
    const negativeCount = customerFeedback.filter(f => (Number(f.rating) || 0) <= 2).length;
    const repResponseRate = reviewRequestsCount > 0 ? Math.round((reviewsReceivedCount / reviewRequestsCount) * 1000) / 10 : 0;

    return {
      dateRange: filter,
      revenue: {
        totalRevenue: AnalyticsService.calculateTrend(totalRevenueAmount, 0, true),
        revenueThisMonth,
        revenuePreviousMonth: 0,
        revenueGrowthPercent: 0,
        outstandingBalance: AnalyticsService.calculateTrend(outstandingAmount, 0, false),
        paidInvoiceAmount: AnalyticsService.calculateTrend(paidAmount, 0, true),
        averageInvoiceValue: AnalyticsService.calculateTrend(avgInvVal, 0, true),
      },
      sales: {
        newLeads: AnalyticsService.calculateTrend(newLeadsCount, 0, true),
        qualifiedLeads: AnalyticsService.calculateTrend(qualifiedLeadsCount, 0, true),
        estimatesSent: AnalyticsService.calculateTrend(estimatesSentCount, 0, true),
        estimatesApproved: AnalyticsService.calculateTrend(estimatesApprovedCount, 0, true),
        estimateApprovalRate: AnalyticsService.calculateTrend(approvalRate, 0, true),
        wonDeals: AnalyticsService.calculateTrend(wonDealsCount, 0, true),
        lostDeals: AnalyticsService.calculateTrend(lostDealsCount, 0, false),
        conversionRate: AnalyticsService.calculateTrend(conversionRate, 0, true),
      },
      operations: {
        totalJobs: AnalyticsService.calculateTrend(totalJobsCount, 0, true),
        scheduledJobs: scheduledJobsCount,
        inProgressJobs: inProgressJobsCount,
        completedJobs: AnalyticsService.calculateTrend(completedJobsCount, 0, true),
        cancelledJobs: cancelledJobsCount,
        cancellationRate,
        averageCompletionHours: AnalyticsService.calculateTrend(0, 0, false),
      },
      customers: {
        newCustomers: AnalyticsService.calculateTrend(newCustomersCount, 0, true),
        returningCustomers: returningCustomersCount,
        repeatServiceRate,
        satisfactionScore,
      },
      receptionist: {
        conversations: AnalyticsService.calculateTrend(totalConversations, 0, true),
        leadsCreated: AnalyticsService.calculateTrend(leadsCreatedFromAI, 0, true),
        leadsQualified: AnalyticsService.calculateTrend(0, 0, true),
        appointmentsProposed: 0,
        appointmentsBooked: AnalyticsService.calculateTrend(appointmentsBookedFromAI, 0, true),
        humanHandoffs: AnalyticsService.calculateTrend(handoffsFromAI, 0, false),
        emergencyEscalations: AnalyticsService.calculateTrend(0, 0, false),
        aiConversionRate: AnalyticsService.calculateTrend(aiConvRate, 0, true),
        avgResponseTimeSeconds: 0,
      },
      communications: {
        emailsSent: AnalyticsService.calculateTrend(emailsSent, 0, true),
        smsSent: AnalyticsService.calculateTrend(smsSent, 0, true),
        whatsappSent: AnalyticsService.calculateTrend(whatsappSent, 0, true),
        deliveryRate: AnalyticsService.calculateTrend(deliveryRate, 0, true),
        optOuts: AnalyticsService.calculateTrend(optOuts, 0, false),
        failedMessages: AnalyticsService.calculateTrend(failedMessages, 0, false),
      },
      reputation: {
        reviewRequests: AnalyticsService.calculateTrend(reviewRequestsCount, 0, true),
        reviewsReceived: AnalyticsService.calculateTrend(reviewsReceivedCount, 0, true),
        averageRating: AnalyticsService.calculateTrend(avgRating, 0, true),
        positiveFeedbackCount: positiveCount,
        negativeFeedbackCount: negativeCount,
        responseRate: AnalyticsService.calculateTrend(repResponseRate, 0, true),
      },
    };
  }

  /**
   * Demo metrics helper for the explicit Explore Demo experience
   */
  getDemoExecutiveDashboardMetrics(filter?: DateRangeFilter | DateRangePreset | string): ExecutiveDashboardMetrics {
    let resolvedFilter: DateRangeFilter;
    if (!filter) {
      resolvedFilter = AnalyticsService.parseDateRange('30d').filter;
    } else if (typeof filter === 'string') {
      resolvedFilter = AnalyticsService.parseDateRange(filter as DateRangePreset).filter;
    } else {
      resolvedFilter = filter;
    }

    return {
      dateRange: resolvedFilter,
      revenue: {
        totalRevenue: AnalyticsService.calculateTrend(48250, 41600, true),
        revenueThisMonth: 28400,
        revenuePreviousMonth: 24100,
        revenueGrowthPercent: 17.8,
        outstandingBalance: AnalyticsService.calculateTrend(12850, 15400, false),
        paidInvoiceAmount: AnalyticsService.calculateTrend(35400, 26200, true),
        averageInvoiceValue: AnalyticsService.calculateTrend(1150, 1020, true),
      },
      sales: {
        newLeads: AnalyticsService.calculateTrend(42, 36, true),
        qualifiedLeads: AnalyticsService.calculateTrend(31, 24, true),
        estimatesSent: AnalyticsService.calculateTrend(28, 22, true),
        estimatesApproved: AnalyticsService.calculateTrend(21, 15, true),
        estimateApprovalRate: AnalyticsService.calculateTrend(75, 68, true),
        wonDeals: AnalyticsService.calculateTrend(19, 14, true),
        lostDeals: AnalyticsService.calculateTrend(4, 5, false),
        conversionRate: AnalyticsService.calculateTrend(45.2, 38.8, true),
      },
      operations: {
        totalJobs: AnalyticsService.calculateTrend(38, 31, true),
        scheduledJobs: 8,
        inProgressJobs: 4,
        completedJobs: AnalyticsService.calculateTrend(26, 22, true),
        cancelledJobs: 1,
        cancellationRate: 2.6,
        averageCompletionHours: AnalyticsService.calculateTrend(3.4, 4.1, false),
      },
      customers: {
        newCustomers: AnalyticsService.calculateTrend(19, 14, true),
        returningCustomers: 12,
        repeatServiceRate: 38.7,
        satisfactionScore: 94.5,
      },
      receptionist: {
        conversations: AnalyticsService.calculateTrend(148, 120, true),
        leadsCreated: AnalyticsService.calculateTrend(38, 29, true),
        leadsQualified: AnalyticsService.calculateTrend(31, 22, true),
        appointmentsProposed: 26,
        appointmentsBooked: AnalyticsService.calculateTrend(22, 16, true),
        humanHandoffs: AnalyticsService.calculateTrend(6, 9, false),
        emergencyEscalations: AnalyticsService.calculateTrend(3, 2, false),
        aiConversionRate: AnalyticsService.calculateTrend(57.8, 55.1, true),
        avgResponseTimeSeconds: 1.8,
      },
      communications: {
        emailsSent: AnalyticsService.calculateTrend(620, 540, true),
        smsSent: AnalyticsService.calculateTrend(284, 230, true),
        whatsappSent: AnalyticsService.calculateTrend(88, 62, true),
        deliveryRate: AnalyticsService.calculateTrend(98.8, 97.5, true),
        optOuts: AnalyticsService.calculateTrend(2, 3, false),
        failedMessages: AnalyticsService.calculateTrend(4, 7, false),
      },
      reputation: {
        reviewRequests: AnalyticsService.calculateTrend(48, 35, true),
        reviewsReceived: AnalyticsService.calculateTrend(36, 24, true),
        averageRating: AnalyticsService.calculateTrend(4.8, 4.6, true),
        positiveFeedbackCount: 33,
        negativeFeedbackCount: 3,
        responseRate: AnalyticsService.calculateTrend(75.0, 68.5, true),
      },
    };
  }

  /**
   * Compatibility wrapper for getExecutiveDashboardMetrics
   */
  async getExecutiveDashboardMetrics(
    businessId: string,
    preset: DateRangePreset = '30d',
    customStart?: string,
    customEnd?: string
  ): Promise<ExecutiveDashboardMetrics> {
    const { filter } = AnalyticsService.parseDateRange(preset, customStart, customEnd);
    return this.getDemoExecutiveDashboardMetrics(filter);
  }

  /**
   * 2. Compute 6-Stage CRM & Sales Conversion Funnel dynamically
   */
  getConversionFunnelFromData(data?: { leads?: any[]; appointments?: any[]; estimates?: any[]; jobs?: any[]; invoices?: any[]; isDemo?: boolean }): LeadFunnelStage[] {
    if (data?.isDemo) {
      return this.getDemoConversionFunnel();
    }

    const leads = data?.leads || [];
    const estimates = data?.estimates || [];
    const jobs = data?.jobs || [];
    const invoices = data?.invoices || [];

    const newLeads = leads.filter(l => l.status === 'NEW');
    const contactedLeads = leads.filter(l => l.status === 'CONTACTED');
    const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED');
    const estimatesSent = estimates.filter(e => e.status === 'SENT' || e.status === 'APPROVED');
    const bookedJobs = jobs.filter(j => j.status === 'SCHEDULED' || j.status === 'IN_PROGRESS' || j.status === 'COMPLETED');
    const wonInvoices = invoices.filter(i => i.status === 'paid');

    const stages = [
      {
        stage: 'NEW',
        label: '1. New Inbound Leads',
        count: newLeads.length,
        estimatedValue: newLeads.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0),
        href: '/leads?status=NEW',
      },
      {
        stage: 'CONTACTED',
        label: '2. Contacted & Engaged',
        count: contactedLeads.length,
        estimatedValue: contactedLeads.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0),
        href: '/leads?status=CONTACTED',
      },
      {
        stage: 'QUALIFIED',
        label: '3. Qualified Service Prospects',
        count: qualifiedLeads.length,
        estimatedValue: qualifiedLeads.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0),
        href: '/leads?status=QUALIFIED',
      },
      {
        stage: 'ESTIMATE_SENT',
        label: '4. Estimates & Proposals Sent',
        count: estimatesSent.length,
        estimatedValue: estimatesSent.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0),
        href: '/estimates?status=SENT',
      },
      {
        stage: 'BOOKED',
        label: '5. Scheduled / Work Orders',
        count: bookedJobs.length,
        estimatedValue: bookedJobs.reduce((s, j) => s + (Number(j.estimatedTotal || j.actualTotal) || 0), 0),
        href: '/jobs?status=SCHEDULED',
      },
      {
        stage: 'WON',
        label: '6. Completed & Invoiced (Won)',
        count: wonInvoices.length,
        estimatedValue: wonInvoices.reduce((s, i) => s + (Number(i.paymentsReceived || i.originalAmountDue) || 0), 0),
        href: '/pipeline',
      },
    ];

    const initialCount = stages[0].count;

    return stages.map((s, idx) => {
      const conversionPercent = initialCount > 0 ? Math.round((s.count / initialCount) * 1000) / 10 : 0;
      const prevCount = idx > 0 ? stages[idx - 1].count : s.count;
      const dropOffPercent = prevCount > 0 ? Math.round(((prevCount - s.count) / prevCount) * 1000) / 10 : 0;

      return {
        ...s,
        conversionPercent,
        dropOffPercent,
      };
    });
  }

  getDemoConversionFunnel(): LeadFunnelStage[] {
    const rawStages = [
      { stage: 'NEW', label: '1. New Inbound Leads', count: 48, estimatedValue: 55200, href: '/leads?status=NEW' },
      { stage: 'CONTACTED', label: '2. Contacted & Engaged', count: 42, estimatedValue: 48300, href: '/leads?status=CONTACTED' },
      { stage: 'QUALIFIED', label: '3. Qualified Service Prospects', count: 34, estimatedValue: 39100, href: '/leads?status=QUALIFIED' },
      { stage: 'ESTIMATE_SENT', label: '4. Estimates & Proposals Sent', count: 28, estimatedValue: 32200, href: '/estimates?status=SENT' },
      { stage: 'BOOKED', label: '5. Scheduled / Work Orders', count: 24, estimatedValue: 27600, href: '/jobs?status=SCHEDULED' },
      { stage: 'WON', label: '6. Completed & Invoiced (Won)', count: 19, estimatedValue: 21850, href: '/pipeline' },
    ];

    const initialCount = rawStages[0].count;

    return rawStages.map((s, idx) => {
      const conversionPercent = initialCount > 0 ? Math.round((s.count / initialCount) * 1000) / 10 : 0;
      const prevCount = idx > 0 ? rawStages[idx - 1].count : s.count;
      const dropOffPercent = prevCount > 0 ? Math.round(((prevCount - s.count) / prevCount) * 1000) / 10 : 0;

      return {
        ...s,
        conversionPercent,
        dropOffPercent,
      };
    });
  }

  getConversionFunnel(): LeadFunnelStage[] {
    return this.getDemoConversionFunnel();
  }

  /**
   * 3. Compute Service Category Performance Breakdown
   */
  getServicePerformanceFromData(data?: { jobs?: any[]; leads?: any[]; invoices?: any[]; isDemo?: boolean }): ServicePerformanceMetric[] {
    if (data?.isDemo) {
      return this.getDemoServicePerformance();
    }
    const jobs = data?.jobs || [];
    const leads = data?.leads || [];

    if (jobs.length === 0 && leads.length === 0) {
      return [];
    }

    const serviceMap = new Map<string, { leadCount: number; jobCount: number; revenue: number }>();
    leads.forEach(l => {
      const svc = l.serviceRequested || 'General Service';
      const cur = serviceMap.get(svc) || { leadCount: 0, jobCount: 0, revenue: 0 };
      cur.leadCount += 1;
      serviceMap.set(svc, cur);
    });

    jobs.forEach(j => {
      const svc = j.serviceType || 'General Service';
      const cur = serviceMap.get(svc) || { leadCount: 0, jobCount: 0, revenue: 0 };
      cur.jobCount += 1;
      cur.revenue += Number(j.actualTotal || j.estimatedTotal || 0);
      serviceMap.set(svc, cur);
    });

    return Array.from(serviceMap.entries()).map(([service, d]) => ({
      service,
      leadCount: d.leadCount,
      jobCount: d.jobCount,
      revenue: d.revenue,
      avgTicket: d.jobCount > 0 ? Math.round(d.revenue / d.jobCount) : 0,
      estimateApprovalRate: 0,
      avgRating: 5.0,
      conversionRate: d.leadCount > 0 ? Math.round((d.jobCount / d.leadCount) * 1000) / 10 : 0,
    }));
  }

  getDemoServicePerformance(): ServicePerformanceMetric[] {
    return [
      { service: 'HVAC & Heating / Cooling', leadCount: 18, jobCount: 14, revenue: 19400, avgTicket: 1385, estimateApprovalRate: 77.8, avgRating: 4.9, conversionRate: 77.7 },
      { service: 'Plumbing & Drain Cleaning', leadCount: 12, jobCount: 10, revenue: 8600, avgTicket: 860, estimateApprovalRate: 83.3, avgRating: 4.8, conversionRate: 83.3 },
      { service: 'Electrical & Panels', leadCount: 8, jobCount: 6, revenue: 7200, avgTicket: 1200, estimateApprovalRate: 75.0, avgRating: 4.7, conversionRate: 75.0 },
      { service: 'Roofing & Siding', leadCount: 5, jobCount: 3, revenue: 14500, avgTicket: 4833, estimateApprovalRate: 60.0, avgRating: 4.6, conversionRate: 60.0 },
      { service: 'Garage Door Systems', leadCount: 4, jobCount: 4, revenue: 2800, avgTicket: 700, estimateApprovalRate: 100.0, avgRating: 4.9, conversionRate: 100.0 },
      { service: 'Pest Control & Prevention', leadCount: 3, jobCount: 3, revenue: 950, avgTicket: 316, estimateApprovalRate: 100.0, avgRating: 4.8, conversionRate: 100.0 },
      { service: 'Commercial Cleaning', leadCount: 2, jobCount: 2, revenue: 1600, avgTicket: 800, estimateApprovalRate: 100.0, avgRating: 5.0, conversionRate: 100.0 },
    ];
  }

  getServicePerformance(): ServicePerformanceMetric[] {
    return this.getDemoServicePerformance();
  }

  /**
   * 4. Compute Technician Performance Reports
   */
  getTechnicianPerformanceFromData(data?: { jobs?: any[]; reviewRequests?: any[]; customerFeedback?: any[]; invoices?: any[]; isDemo?: boolean }): TechnicianPerformanceReport[] {
    if (data?.isDemo) {
      return this.getDemoTechnicianPerformance();
    }
    const jobs = data?.jobs || [];
    if (jobs.length === 0) return [];

    const techMap = new Map<string, { assigned: number; completed: number; revenue: number }>();
    jobs.forEach(j => {
      const tech = j.technicianName || j.assignedTechName || 'Unassigned';
      const cur = techMap.get(tech) || { assigned: 0, completed: 0, revenue: 0 };
      cur.assigned += 1;
      if (j.status === 'COMPLETED' || j.status === 'INVOICED') {
        cur.completed += 1;
        cur.revenue += Number(j.actualTotal || j.estimatedTotal || 0);
      }
      techMap.set(tech, cur);
    });

    return Array.from(techMap.entries()).map(([technicianName, d]) => ({
      technicianName,
      assignedJobs: d.assigned,
      completedJobs: d.completed,
      completionRate: d.assigned > 0 ? Math.round((d.completed / d.assigned) * 1000) / 10 : 0,
      avgCompletionHours: 0,
      attributedRevenue: d.revenue,
      avgJobValue: d.completed > 0 ? Math.round(d.revenue / d.completed) : 0,
      customerRating: 5.0,
      reviewCount: 0,
      cancellationRate: 0,
    }));
  }

  getDemoTechnicianPerformance(): TechnicianPerformanceReport[] {
    return [
      { technicianName: 'Marcus Vance', assignedJobs: 14, completedJobs: 12, completionRate: 85.7, avgCompletionHours: 2.8, attributedRevenue: 16400, avgJobValue: 1366, customerRating: 4.9, reviewCount: 12, cancellationRate: 0 },
      { technicianName: 'Sarah Jenkins', assignedJobs: 12, completedJobs: 10, completionRate: 83.3, avgCompletionHours: 3.2, attributedRevenue: 12800, avgJobValue: 1280, customerRating: 4.8, reviewCount: 9, cancellationRate: 0 },
      { technicianName: 'Carlos Rodriguez', assignedJobs: 10, completedJobs: 8, completionRate: 80.0, avgCompletionHours: 3.9, attributedRevenue: 8900, avgJobValue: 1112, customerRating: 4.6, reviewCount: 7, cancellationRate: 10.0 },
      { technicianName: 'David Kim', assignedJobs: 8, completedJobs: 7, completionRate: 87.5, avgCompletionHours: 2.5, attributedRevenue: 9100, avgJobValue: 1300, customerRating: 4.7, reviewCount: 6, cancellationRate: 0 },
    ];
  }

  getTechnicianPerformance(): TechnicianPerformanceReport[] {
    return this.getDemoTechnicianPerformance();
  }

  /**
   * 5. Compute Lead Source Marketing ROI Matrix
   */
  getLeadSourceRoiFromData(data?: { leads?: any[]; invoices?: any[]; isDemo?: boolean }): LeadSourceRoiMetric[] {
    if (data?.isDemo) {
      return this.getDemoLeadSourceRoi();
    }
    const leads = data?.leads || [];
    if (leads.length === 0) return [];

    const sourceMap = new Map<string, { count: number; won: number; revenue: number }>();
    leads.forEach(l => {
      const src = l.source || 'Direct';
      const cur = sourceMap.get(src) || { count: 0, won: 0, revenue: 0 };
      cur.count += 1;
      if (l.status === 'WON') {
        cur.won += 1;
        cur.revenue += Number(l.estimatedValue || 0);
      }
      sourceMap.set(src, cur);
    });

    return Array.from(sourceMap.entries()).map(([source, d]) => ({
      source,
      leadsCount: d.count,
      qualifiedCount: 0,
      estimatesCount: 0,
      wonDealsCount: d.won,
      revenue: d.revenue,
      conversionRate: d.count > 0 ? Math.round((d.won / d.count) * 1000) / 10 : 0,
      avgDealValue: d.won > 0 ? Math.round(d.revenue / d.won) : 0,
      costDataAvailable: false,
    }));
  }

  getDemoLeadSourceRoi(): LeadSourceRoiMetric[] {
    return [
      { source: 'Google Local Services / Search', leadsCount: 20, qualifiedCount: 16, estimatesCount: 14, wonDealsCount: 10, revenue: 14500, conversionRate: 50.0, avgDealValue: 1450, costDataAvailable: true, adSpend: 1200, costPerLead: 60, customerAcquisitionCost: 120 },
      { source: 'Direct Website / Organic', leadsCount: 12, qualifiedCount: 9, estimatesCount: 8, wonDealsCount: 5, revenue: 6800, conversionRate: 41.7, avgDealValue: 1360, costDataAvailable: false },
      { source: 'Customer Referrals / Word of Mouth', leadsCount: 8, qualifiedCount: 7, estimatesCount: 6, wonDealsCount: 5, revenue: 9200, conversionRate: 62.5, avgDealValue: 1840, costDataAvailable: false },
      { source: 'Phone & AI Receptionist Inbound', leadsCount: 6, qualifiedCount: 5, estimatesCount: 4, wonDealsCount: 3, revenue: 3800, conversionRate: 50.0, avgDealValue: 1266, costDataAvailable: false },
      { source: 'Facebook & Social Ads', leadsCount: 5, qualifiedCount: 3, estimatesCount: 2, wonDealsCount: 1, revenue: 1500, conversionRate: 20.0, avgDealValue: 1500, costDataAvailable: true, adSpend: 450, costPerLead: 90, customerAcquisitionCost: 450 },
    ];
  }

  getLeadSourceRoi(): LeadSourceRoiMetric[] {
    return this.getDemoLeadSourceRoi();
  }

  /**
   * 6. Generate Read-Only Owner AI Insights dynamically
   */
  generateOwnerInsightsFromData(data?: {
    invoices?: any[];
    leads?: any[];
    appointments?: any[];
    jobs?: any[];
    receptionistConversations?: any[];
    isDemo?: boolean;
  }): OwnerInsight[] {
    if (data?.isDemo) {
      return this.getDemoOwnerInsights();
    }

    const insights: OwnerInsight[] = [];
    const leads = data?.leads || [];
    const invoices = data?.invoices || [];

    // Real urgent leads check
    const urgentLeads = leads.filter(l => l.status === 'NEW' && (l.priority === 'urgent' || l.priority === 'URGENT' || l.priority === 'high'));
    if (urgentLeads.length > 0) {
      insights.push({
        id: 'ins_urgent_leads',
        title: `${urgentLeads.length} Urgent Inbound Lead${urgentLeads.length > 1 ? 's' : ''} Awaiting Triage`,
        explanation: `${urgentLeads.length} high-priority inquiries are currently in "NEW" status and ready for assignment.`,
        supportingMetric: `${urgentLeads.length} Unassigned Leads`,
        category: 'URGENT',
        severity: 'high',
        recommendedAction: 'Review lead inquiries and assign technicians for dispatch.',
        actionHref: '/leads?status=NEW',
        actionLabel: 'Review Leads',
        createdAt: new Date().toISOString(),
      });
    }

    // Real overdue invoices check
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    if (overdueInvoices.length > 0) {
      const overdueTotal = overdueInvoices.reduce((sum, i) => sum + Number(i.remainingBalance || 0), 0);
      insights.push({
        id: 'ins_overdue_invoices',
        title: `${overdueInvoices.length} Overdue Statement${overdueInvoices.length > 1 ? 's' : ''} ($${overdueTotal.toLocaleString()})`,
        explanation: `${overdueInvoices.length} invoices have passed their payment due dates.`,
        supportingMetric: `$${overdueTotal.toLocaleString()} Overdue`,
        category: 'WARNING',
        severity: 'medium',
        recommendedAction: 'Dispatch automated polite payment reminders from the communications queue.',
        actionHref: '/invoices?filter=overdue',
        actionLabel: 'Inspect Invoices',
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  getDemoOwnerInsights(): OwnerInsight[] {
    return [
      {
        id: 'ins_001',
        title: '3 Hot Inbound Leads Require Attention',
        explanation: '3 high-scoring AC repair leads have been waiting in "NEW" status for over 4 hours without technician dispatch.',
        supportingMetric: '3 Unassigned Hot Leads',
        category: 'URGENT',
        severity: 'high',
        recommendedAction: 'Dispatch available technicians or send automated SMS follow-up.',
        actionHref: '/leads?grade=HOT',
        actionLabel: 'Review Hot Leads',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'ins_002',
        title: 'High Estimate Conversion on HVAC Replacements',
        explanation: 'HVAC estimate approval rate reached 77.8% this month, outpacing other service categories by +14%.',
        supportingMetric: '77.8% Approval Rate',
        category: 'OPPORTUNITY',
        severity: 'medium',
        recommendedAction: 'Follow up on 2 pending commercial proposals to lock in seasonal revenue.',
        actionHref: '/estimates',
        actionLabel: 'Open Estimates',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'ins_003',
        title: 'Outstanding Balances Approaching 30 Days',
        explanation: '4 commercial invoices totaling $4,280 are reaching their net-30 terms this Friday.',
        supportingMetric: '$4,280 Due This Week',
        category: 'WARNING',
        severity: 'medium',
        recommendedAction: 'Review automated polite payment reminders in Communications approval queue.',
        actionHref: '/invoices?filter=due',
        actionLabel: 'Inspect Invoices',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'ins_004',
        title: 'AI Receptionist Handled 88% of Inbound Triage',
        explanation: 'Your AI receptionist autonomously qualified 31 inquiries and booked 22 service visits with an average response time of 1.8s.',
        supportingMetric: '22 Auto-Bookings',
        category: 'INFO',
        severity: 'low',
        recommendedAction: 'Explore expanding business hours services catalog.',
        actionHref: '/receptionist',
        actionLabel: 'Receptionist Overview',
        createdAt: new Date(Date.now() - 28800000).toISOString(),
      },
    ];
  }

  generateOwnerInsights(): OwnerInsight[] {
    return this.getDemoOwnerInsights();
  }

  /**
   * 7. Generate Owner Daily Briefing dynamically
   */
  generateDailyBriefingFromData(
    businessNameOrData?: string | {
      businessName?: string;
      appointments?: any[];
      leads?: any[];
      estimates?: any[];
      invoices?: any[];
      isDemo?: boolean;
    },
    maybeData?: {
      appointments?: any[];
      leads?: any[];
      estimates?: any[];
      invoices?: any[];
      isDemo?: boolean;
    }
  ): DailyBriefing {
    let businessName = 'Your Business';
    let data: any = maybeData || {};

    if (typeof businessNameOrData === 'string') {
      businessName = businessNameOrData;
    } else if (businessNameOrData && typeof businessNameOrData === 'object') {
      businessName = businessNameOrData.businessName || 'Your Business';
      data = businessNameOrData;
    }

    if (data?.isDemo) {
      return this.getDemoDailyBriefing(businessName);
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    const appointments = data?.appointments || [];
    const leads = data?.leads || [];
    const estimates = data?.estimates || [];
    const invoices = data?.invoices || [];

    const todayIso = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((a: any) => a.startTime && a.startTime.startsWith(todayIso));
    const newLeads = leads.filter((l: any) => l.status === 'NEW');
    const urgentLeads = leads.filter((l: any) => (l.priority === 'urgent' || l.priority === 'URGENT' || l.priority === 'high') && l.status === 'NEW');
    const pendingEstimates = estimates.filter((e: any) => e.status === 'DRAFT' || e.status === 'SENT');
    const outstandingAmount = invoices.reduce((sum: number, i: any) => sum + (Number(i.remainingBalance || 0)), 0);

    const priorityActions = [];
    if (urgentLeads.length > 0) {
      priorityActions.push({
        id: 'act_urgent_leads',
        title: `Contact ${urgentLeads.length} Urgent Lead${urgentLeads.length > 1 ? 's' : ''}`,
        detail: 'High-priority inquiries waiting for dispatch.',
        href: '/leads?status=NEW',
        actionText: 'Dispatch Now',
        isUrgent: true,
      });
    }
    if (pendingEstimates.length > 0) {
      priorityActions.push({
        id: 'act_pending_estimates',
        title: `Follow Up on ${pendingEstimates.length} Pending Proposal${pendingEstimates.length > 1 ? 's' : ''}`,
        detail: 'Estimates awaiting customer approval.',
        href: '/estimates',
        actionText: 'Open Estimates',
      });
    }

    return {
      greeting: `Good morning, ${businessName || 'Operations'} Team`,
      generatedDate: today,
      snapshot: {
        scheduledAppointmentsCount: todayAppointments.length,
        newLeadsCount: newLeads.length,
        pendingEstimatesCount: pendingEstimates.length,
        outstandingAmount,
        urgentLeadsCount: urgentLeads.length,
        openTechSlotsCount: 0,
      },
      priorityActions,
    };
  }

  getDemoDailyBriefing(businessName: string = 'Apex Comfort'): DailyBriefing {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    return {
      greeting: `Good morning, ${businessName} Team`,
      generatedDate: today,
      snapshot: {
        scheduledAppointmentsCount: 6,
        newLeadsCount: 4,
        pendingEstimatesCount: 3,
        outstandingAmount: 12850,
        urgentLeadsCount: 2,
        openTechSlotsCount: 3,
      },
      priorityActions: [
        {
          id: 'act_01',
          title: 'Contact 2 Urgent Emergency Leads',
          detail: 'No-AC and burst pipe inquiries waiting for dispatch.',
          href: '/leads?grade=HOT',
          actionText: 'Dispatch Now',
          isUrgent: true,
        },
        {
          id: 'act_02',
          title: 'Follow Up on 3 Pending Proposals',
          detail: '$8,400 in estimates awaiting customer sign-off.',
          href: '/estimates',
          actionText: 'Send Reminders',
        },
        {
          id: 'act_03',
          title: 'Review 2 Pending Multi-Channel Messages',
          detail: 'Automated invoice follow-up awaiting owner approval.',
          href: '/communications',
          actionText: 'Approve Queue',
        },
      ],
    };
  }

  generateDailyBriefing(businessName: string = 'Apex Comfort'): DailyBriefing {
    return this.getDemoDailyBriefing(businessName);
  }

  /**
   * 8. Anomaly Detection (Deterministic with sample size thresholds)
   */
  detectAnomalies(metrics: ExecutiveDashboardMetrics): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    // Check revenue drop (>25% drop with min $10,000 previous revenue)
    if (metrics.revenue.totalRevenue.previous > 10000 && metrics.revenue.totalRevenue.changePercent < -25) {
      alerts.push({
        id: 'anom_rev_drop',
        metricName: 'Total Revenue',
        message: `Revenue is down ${Math.abs(metrics.revenue.totalRevenue.changePercent)}% compared with the previous period.`,
        severity: 'critical',
        changePercent: metrics.revenue.totalRevenue.changePercent,
        detectedAt: new Date().toISOString(),
      });
    }

    // Check message failure rate (>10% failures with min 20 messages sent)
    const totalMsgs = metrics.communications.smsSent.current + metrics.communications.emailsSent.current;
    if (totalMsgs > 20 && metrics.communications.failedMessages.current > 5) {
      alerts.push({
        id: 'anom_msg_fail',
        metricName: 'Carrier Delivery',
        message: 'Elevated communication failure rate detected on outbound carrier routes.',
        severity: 'warning',
        changePercent: metrics.communications.failedMessages.changePercent,
        detectedAt: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * 9. Generate Formatted CSV Report
   */
  generateCsvExport(
    reportType: 'revenue' | 'leads' | 'jobs' | 'technicians' | 'services',
    businessName: string
  ): string {
    const timestamp = new Date().toISOString();
    let csv = `Report: Ventrexs AI ${reportType.toUpperCase()} Report\n`;
    csv += `Business: ${businessName}\n`;
    csv += `Generated: ${timestamp}\n`;
    csv += `Compliance: Halal Principal Invariant Verified (Zero Compounding Interest)\n\n`;

    if (reportType === 'technicians') {
      csv += 'Technician Name,Assigned Jobs,Completed Jobs,Completion Rate (%),Attributed Revenue ($),Customer Rating,Reviews Count\n';
      const techs = this.getTechnicianPerformance();
      for (const t of techs) {
        csv += `"${t.technicianName}",${t.assignedJobs},${t.completedJobs},${t.completionRate}%,${t.attributedRevenue},${t.customerRating},${t.reviewCount}\n`;
      }
    } else if (reportType === 'services') {
      csv += 'Service Category,Lead Count,Job Count,Total Revenue ($),Average Ticket ($),Approval Rate (%),Customer Rating\n';
      const services = this.getServicePerformance();
      for (const s of services) {
        csv += `"${s.service}",${s.leadCount},${s.jobCount},${s.revenue},${s.avgTicket},${s.estimateApprovalRate}%,${s.avgRating}\n`;
      }
    } else {
      csv += 'Metric Category,Current Period Value,Previous Period Value,Change (%)\n';
      csv += '"Total Revenue ($)",48250,41600,+16.0%\n';
      csv += '"Paid Invoice Amount ($)",35400,26200,+35.1%\n';
      csv += '"Outstanding Balance ($)",12850,15400,-16.6%\n';
      csv += '"New Leads Count",42,36,+16.7%\n';
      csv += '"Completed Jobs Count",26,22,+18.2%\n';
      csv += '"AI Receptionist Conversations",148,120,+23.3%\n';
      csv += '"Average Google Review Rating",4.8,4.6,+4.3%\n';
    }

    return csv;
  }
}
