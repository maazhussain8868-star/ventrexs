export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}

export interface MetricTrend<T = number> {
  current: T;
  previous: T;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  isPositiveChange: boolean;
}

export interface ExecutiveDashboardMetrics {
  dateRange: DateRangeFilter;
  revenue: {
    totalRevenue: MetricTrend<number>;
    revenueThisMonth: number;
    revenuePreviousMonth: number;
    revenueGrowthPercent: number;
    outstandingBalance: MetricTrend<number>;
    paidInvoiceAmount: MetricTrend<number>;
    averageInvoiceValue: MetricTrend<number>;
  };
  sales: {
    newLeads: MetricTrend<number>;
    qualifiedLeads: MetricTrend<number>;
    estimatesSent: MetricTrend<number>;
    estimatesApproved: MetricTrend<number>;
    estimateApprovalRate: MetricTrend<number>;
    wonDeals: MetricTrend<number>;
    lostDeals: MetricTrend<number>;
    conversionRate: MetricTrend<number>;
  };
  operations: {
    totalJobs: MetricTrend<number>;
    scheduledJobs: number;
    inProgressJobs: number;
    completedJobs: MetricTrend<number>;
    cancelledJobs: number;
    cancellationRate: number;
    averageCompletionHours: MetricTrend<number>;
  };
  customers: {
    newCustomers: MetricTrend<number>;
    returningCustomers: number;
    repeatServiceRate: number;
    satisfactionScore: number;
  };
  receptionist: {
    conversations: MetricTrend<number>;
    leadsCreated: MetricTrend<number>;
    leadsQualified: MetricTrend<number>;
    appointmentsProposed: number;
    appointmentsBooked: MetricTrend<number>;
    humanHandoffs: MetricTrend<number>;
    emergencyEscalations: MetricTrend<number>;
    aiConversionRate: MetricTrend<number>;
    avgResponseTimeSeconds: number;
  };
  communications: {
    emailsSent: MetricTrend<number>;
    smsSent: MetricTrend<number>;
    whatsappSent: MetricTrend<number>;
    deliveryRate: MetricTrend<number>;
    optOuts: MetricTrend<number>;
    failedMessages: MetricTrend<number>;
  };
  reputation: {
    reviewRequests: MetricTrend<number>;
    reviewsReceived: MetricTrend<number>;
    averageRating: MetricTrend<number>;
    positiveFeedbackCount: number;
    negativeFeedbackCount: number;
    responseRate: MetricTrend<number>;
  };
}

export interface LeadFunnelStage {
  stage: string;
  label: string;
  count: number;
  conversionPercent: number;
  dropOffPercent: number;
  estimatedValue: number;
  href?: string;
}

export interface ServicePerformanceMetric {
  service: string;
  leadCount: number;
  jobCount: number;
  revenue: number;
  avgTicket: number;
  estimateApprovalRate: number;
  avgRating: number;
  conversionRate: number;
}

export interface TechnicianPerformanceReport {
  technicianName: string;
  assignedJobs: number;
  completedJobs: number;
  completionRate: number;
  avgCompletionHours: number;
  attributedRevenue: number;
  avgJobValue: number;
  customerRating: number;
  reviewCount: number;
  cancellationRate: number;
}

export interface LeadSourceRoiMetric {
  source: string;
  leadsCount: number;
  qualifiedCount: number;
  estimatesCount: number;
  wonDealsCount: number;
  revenue: number;
  conversionRate: number;
  avgDealValue: number;
  costDataAvailable: boolean;
  adSpend?: number;
  costPerLead?: number;
  customerAcquisitionCost?: number;
}

export type InsightCategory = 'OPPORTUNITY' | 'WARNING' | 'INFO' | 'URGENT';
export type InsightSeverity = 'low' | 'medium' | 'high';

export interface OwnerInsight {
  id: string;
  title: string;
  explanation: string;
  supportingMetric: string;
  category: InsightCategory;
  severity: InsightSeverity;
  recommendedAction: string;
  actionHref?: string;
  actionLabel?: string;
  createdAt: string;
}

export interface DailyBriefing {
  greeting: string;
  generatedDate: string;
  snapshot: {
    scheduledAppointmentsCount: number;
    newLeadsCount: number;
    pendingEstimatesCount: number;
    outstandingAmount: number;
    urgentLeadsCount: number;
    openTechSlotsCount: number;
  };
  priorityActions: {
    id: string;
    title: string;
    detail: string;
    href: string;
    actionText: string;
    isUrgent?: boolean;
  }[];
}

export interface AnomalyAlert {
  id: string;
  metricName: string;
  message: string;
  severity: 'warning' | 'critical';
  changePercent: number;
  detectedAt: string;
}
