'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Invoice, 
  Customer, 
  CopilotRecommendation, 
  NotificationItem, 
  UserProfile, 
  BusinessSettings, 
  AdminStats,
  PaymentMethod,
  Lead,
  LeadStatus,
  LeadActivity,
  LeadNote,
  Appointment,
  Job,
  ServiceBusinessProfile,
  ReceptionistSettings,
  ReceptionistService,
  ReceptionistConversation,
  ReceptionistMessage,
  ConversationState,
  ReceptionistChannel,
  CommunicationItem,
  CommunicationTemplate,
  CommunicationConsent,
  CommunicationStats,
  CommChannel,
  Estimate,
  EstimateStatus,
  EstimateItem,
  EstimateStats,
  JobStats,
  JobStatus,
  JobPriority,
  JobActivity,
  ReviewSettings,
  ReviewRequest,
  CustomerFeedback,
  ReputationStats,
  TechnicianReputationMetric,
  FollowUpStatus,
  BusinessSubscription,
  SubscriptionEvent,
  PlanKey,
  BillingInterval,
  UsageMetric,
} from '@/types';
import { 
  initialInvoices, 
  initialCustomers, 
  initialRecommendations, 
  initialNotifications, 
  initialProfile, 
  initialSettings, 
  initialAdminStats,
  initialLeads,
  initialAppointments,
  initialJobs,
  initialEstimates,
  initialBusinessProfile,
  initialReceptionistSettings,
  initialReceptionistServices,
  initialReceptionistConversations,
  initialCommunications,
  initialCommunicationTemplates,
  initialCommunicationConsents,
  initialCommunicationStats,
  initialReviewSettings,
  initialReviewRequests,
  initialCustomerFeedback,
  initialReputationStats,
  initialTechnicianMetrics,
  initialSubscription,
  initialUsageRecords,
  initialSubscriptionEvents
} from '@/data/mockData';
import { createClient } from '@/lib/supabase/client';
import { createSupabaseServices } from '@/lib/supabase/services';
import {
  createInvoiceAction,
  updateInvoiceAction,
  recordPaymentAction,
  createCustomerAction,
  updateCustomerAction,
  deleteInvoiceAction,
  deleteUserAccountAction,
  createLeadAction,
  updateLeadAction,
  updateLeadStatusAction,
  addLeadActivityAction,
  deleteLeadAction,
  assignLeadAction,
  createLeadNoteAction,
  updateLeadNoteAction,
  deleteLeadNoteAction,
  bulkUpdateLeadStatusAction,
  bulkAssignLeadsAction,
  bulkDeleteLeadsAction,
  convertLeadToCustomerAction,
  updateBusinessProfileAction,
  completeOnboardingAction,
  createAppointmentAction,
  updateAppointmentAction,
  deleteAppointmentAction,
  createJobAction,
  updateJobAction,
  deleteJobAction,
  getReceptionistSettingsAction,
  updateReceptionistSettingsAction,
  getReceptionistServicesAction,
  saveReceptionistServiceAction,
  deleteReceptionistServiceAction,
  getReceptionistConversationsAction,
  processReceptionistMessageAction,
  triggerHumanHandoffAction,
  createSubscriptionCheckoutAction,
  createCustomerPortalSessionAction,
  getBusinessSubscriptionAction,
  getBusinessUsageAction,
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
} from '@/app/actions';
import {
  assignJobTechnicianAction,
  updateJobStatusAction,
  addJobActivityAction,
} from '@/app/actions/jobs';
import {
  createEstimateAction,
  updateEstimateAction,
  sendEstimateAction,
  approveEstimateAction,
  rejectEstimateAction,
  convertEstimateToInvoiceAction,
  deleteEstimateAction,
} from '@/app/actions/estimates';
import {
  sendCommunicationAction,
  approveCommunicationAction,
  rejectCommunicationAction,
  createCommunicationTemplateAction,
  updateCommunicationTemplateAction,
  deleteCommunicationTemplateAction,
  updateConsentAction,
  recordOptOutAction,
} from '@/app/actions/communications';
import {
  getReviewSettingsAction,
  updateReviewSettingsAction,
  getReviewRequestsAction,
  createReviewRequestAction,
  sendReviewRequestAction,
  scheduleJobCompletionReviewAction,
  submitCustomerFeedbackAction,
  getCustomerFeedbackAction,
  updateFeedbackFollowUpAction,
  getReputationStatsAction,
} from '@/app/actions/reputation';
import { calculateLeadScore } from '@/lib/crm/scoring';
import { processReceptionistMessage } from '@/lib/receptionist/engine';
import type { User, Session } from '@supabase/supabase-js';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error' | 'ai';
  duration?: number;
}

interface AppContextType {
  // Auth & Tenant Context
  user: User | null;
  session: Session | null;
  businessId: string | null;
  isOnline: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: { email: string; password: string; name: string; businessName: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;

  // Data State
  invoices: Invoice[];
  customers: Customer[];
  leads: Lead[];
  appointments: Appointment[];
  jobs: Job[];
  recommendations: CopilotRecommendation[];
  notifications: NotificationItem[];
  profile: UserProfile;
  settings: BusinessSettings;
  businessProfile: ServiceBusinessProfile;
  adminStats: AdminStats;
  toasts: ToastMessage[];
  
  // CRM Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivityAt'> & { id?: string }) => Promise<Lead | null>;
  updateLead: (lead: Lead) => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => Promise<void>;
  assignLead: (leadId: string, assignedUserId: string | null, assignedUserName: string | null) => Promise<void>;
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'createdAt' | 'leadId'>) => Promise<void>;
  addLeadNote: (leadId: string, content: string, authorName?: string) => Promise<LeadNote | null>;
  updateLeadNote: (noteId: string, content: string, leadId: string) => Promise<void>;
  deleteLeadNote: (noteId: string, leadId: string) => Promise<void>;
  bulkUpdateLeadStatus: (leadIds: string[], status: LeadStatus) => Promise<void>;
  bulkAssignLeads: (leadIds: string[], assignedUserId: string | null, assignedUserName: string | null) => Promise<void>;
  bulkDeleteLeads: (leadIds: string[]) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToCustomer: (leadId: string, createNewContact?: boolean, existingCustomerId?: string) => Promise<Customer | null>;

  // Operations actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'> & { id?: string }) => Promise<Appointment | null>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addJob: (job: Omit<Job, 'id' | 'createdAt'> & { id?: string }) => Promise<Job | null>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'timeline' | 'remainingBalance' | 'paymentsReceived' | 'originalAmountDue' | 'daysOverdue'> & { id?: string; originalAmountDue?: number; paymentsReceived?: number; remainingBalance?: number; daysOverdue?: number }) => Promise<Invoice | null> | Invoice;
  updateInvoice: (invoice: Invoice) => Promise<void> | void;
  deleteInvoice: (id: string) => Promise<void> | void;
  recordPayment: (invoiceId: string, amount: number, method: PaymentMethod, note?: string) => Promise<void>;
  sendInvoiceReminder: (invoiceId: string, customSubject?: string, customBody?: string) => void;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | null> | Customer;
  updateCustomer: (customer: Customer) => Promise<void> | void;
  
  // Copilot actions
  approveRecommendation: (id: string, customDraft?: { subject?: string; message?: string; channel?: 'email' | 'sms' | 'whatsapp' }) => Promise<void> | void;
  dismissRecommendation: (id: string) => Promise<void> | void;
  refreshAIRecommendations?: (businessId?: string) => Promise<void>;
  generateFollowUpContent: (invoiceId: string, tone: 'gentle' | 'professional' | 'firm' | 'urgent', channel: 'email' | 'sms' | 'whatsapp') => { subject: string; body: string };
  
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  // Business Profile / Settings actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<BusinessSettings>) => void;
  updateBusinessProfile: (updates: Partial<ServiceBusinessProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<ServiceBusinessProfile>) => Promise<void>;
  
  // Toast notifications
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  
  // AI Receptionist actions & state
  receptionistSettings: ReceptionistSettings;
  receptionistServices: ReceptionistService[];
  receptionistConversations: ReceptionistConversation[];
  updateReceptionistSettings: (settings: Partial<ReceptionistSettings>) => Promise<boolean>;
  saveReceptionistService: (service: Partial<ReceptionistService>) => Promise<ReceptionistService | null>;
  deleteReceptionistService: (serviceId: string) => Promise<boolean>;
  sendReceptionistMessage: (params: { conversationId?: string; message: string; channel?: ReceptionistChannel }) => Promise<{ replyText: string; conversationId: string; state: ConversationState; handoffRequired: boolean; suggestedSlots?: string[]; detectedIntent?: string; leadId?: string }>;
  triggerHandoff: (conversationId: string, reason: string) => Promise<boolean>;
  resolveHandoff: (conversationId: string) => Promise<boolean>;

  // Calculated stats (Strict Halal Integrity: original - paid, no interest/riba)
  totalOutstanding: number;
  overdueAmount: number;
  dueThisWeek: number;
  collectedMtd: number;
  newLeadsCount: number;
  contactedLeadsCount: number;
  qualifiedLeadsCount: number;
  estimateSentCount: number;
  bookedLeadsCount: number;
  wonLeadsCount: number;
  lostLeadsCount: number;
  pipelineValue: number;
  conversionRate: number;
  averageLeadScore: number;
  activeJobsCount: number;
  upcomingAppointmentsCount: number;

  // Receptionist stats
  activeConversationsCount: number;
  todayConversationsCount: number;
  receptionistHandoffsCount: number;
  receptionistLeadsCreatedCount: number;
  receptionistBookingsCount: number;

  // Phase 4 — Multi-Channel Communication Automation
  communications: CommunicationItem[];
  communicationTemplates: CommunicationTemplate[];
  communicationConsents: CommunicationConsent[];
  communicationStats: CommunicationStats;
  sendCommunication: (req: any) => Promise<{ success: boolean; error?: string; data?: any }>;
  approveCommunication: (id: string) => Promise<{ success: boolean; error?: string }>;
  rejectCommunication: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  saveCommunicationTemplate: (template: Partial<CommunicationTemplate>) => Promise<{ success: boolean; error?: string }>;
  deleteCommunicationTemplate: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateCommunicationConsent: (params: { customerId?: string; leadId?: string; channel: CommChannel; optedIn: boolean }) => Promise<{ success: boolean; error?: string }>;
  recordCommunicationOptOut: (params: { customerId?: string; leadId?: string; channel: CommChannel; reason?: string }) => Promise<{ success: boolean; error?: string }>;

  // Phase 5 — Jobs, Estimates & Field Operations
  estimates: Estimate[];
  estimateStats: EstimateStats;
  jobStats: JobStats;
  addEstimate: (estimate: Partial<Estimate>) => Promise<Estimate | null>;
  updateEstimate: (id: string, updates: Partial<Estimate>) => Promise<Estimate | null>;
  sendEstimate: (id: string, channel: 'email' | 'sms' | 'whatsapp') => Promise<boolean>;
  approveEstimate: (id: string, customerName?: string) => Promise<boolean>;
  rejectEstimate: (id: string, reason: string) => Promise<boolean>;
  convertEstimateToInvoice: (id: string) => Promise<Invoice | null>;
  deleteEstimate: (id: string) => Promise<boolean>;
  assignJobTechnician: (jobId: string, techName: string, techId?: string) => Promise<boolean>;
  updateJobStatus: (jobId: string, status: JobStatus, notes?: string) => Promise<boolean>;
  addJobActivity: (jobId: string, title: string, description?: string, activityType?: string) => Promise<boolean>;

  // Phase 6 — Reputation & Review Management
  reviewSettings: ReviewSettings;
  reviewRequests: ReviewRequest[];
  customerFeedback: CustomerFeedback[];
  reputationStats: ReputationStats;
  technicianMetrics: TechnicianReputationMetric[];
  updateReviewSettings: (updates: Partial<ReviewSettings>) => Promise<boolean>;
  createReviewRequest: (params: { customerId?: string; customerName: string; customerPhone?: string; customerEmail?: string; jobId?: string; technicianName?: string; channel?: 'email' | 'sms' | 'whatsapp'; scheduledFor?: string }) => Promise<ReviewRequest | null>;
  sendReviewRequest: (requestId: string, channel?: 'email' | 'sms' | 'whatsapp') => Promise<boolean>;
  submitCustomerFeedback: (params: { reviewRequestId?: string; customerName: string; customerPhone?: string; customerEmail?: string; jobId?: string; rating: number; feedbackText?: string; serviceAspects?: string[]; channel?: any }) => Promise<{ success: boolean; isPositive: boolean }>;
  updateFeedbackFollowUp: (feedbackId: string, status: FollowUpStatus, notes?: string, assignedTo?: string) => Promise<boolean>;

  // Phase 7 — SaaS Monetization, Subscriptions & Usage
  subscription: BusinessSubscription;
  usageRecords: Record<string, { currentUsage: number; limit: number; remaining: number; isUnlimited: boolean; percentageUsed: number }>;
  subscriptionEvents: SubscriptionEvent[];
  createCheckoutSession: (plan: PlanKey, interval: BillingInterval) => Promise<{ sessionId: string; checkoutUrl: string } | null>;
  createCustomerPortalSession: () => Promise<string | null>;
  cancelSubscription: (cancelAtPeriodEnd?: boolean) => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  recordUsageMetric: (metric: UsageMetric, amount?: number) => void;
  checkEntitlement: (feature: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'paypilot_state_v3_service_os';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(() =>
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? '11111111-1111-1111-1111-111111111111' : null
  );
  const [isOnline, setIsOnline] = useState(true);

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [recommendations, setRecommendations] = useState<CopilotRecommendation[]>(initialRecommendations);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [businessProfile, setBusinessProfile] = useState<ServiceBusinessProfile>(initialBusinessProfile);
  const [receptionistSettings, setReceptionistSettings] = useState<ReceptionistSettings>(initialReceptionistSettings);
  const [receptionistServices, setReceptionistServices] = useState<ReceptionistService[]>(initialReceptionistServices);
  const [receptionistConversations, setReceptionistConversations] = useState<ReceptionistConversation[]>(initialReceptionistConversations);
  const [communications, setCommunications] = useState<CommunicationItem[]>(initialCommunications);
  const [communicationTemplates, setCommunicationTemplates] = useState<CommunicationTemplate[]>(initialCommunicationTemplates);
  const [communicationConsents, setCommunicationConsents] = useState<CommunicationConsent[]>(initialCommunicationConsents);
  const [communicationStats, setCommunicationStats] = useState<CommunicationStats>(initialCommunicationStats);
  const [estimates, setEstimates] = useState<Estimate[]>(initialEstimates);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>(initialReviewSettings);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(initialReviewRequests);
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>(initialCustomerFeedback);
  const [subscription, setSubscription] = useState<BusinessSubscription>(initialSubscription);
  const [usageRecords, setUsageRecords] = useState(initialUsageRecords);
  const [subscriptionEvents, setSubscriptionEvents] = useState<SubscriptionEvent[]>(initialSubscriptionEvents);
  const [adminStats] = useState<AdminStats>(initialAdminStats);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Supabase client instance
  const supabase = useMemo(() => createClient(), []);
  const services = useMemo(() => createSupabaseServices(supabase), [supabase]);

  // Toast Helper
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load Initial State from Local Storage and Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.appointments) setAppointments(parsed.appointments);
        if (parsed.jobs) setJobs(parsed.jobs);
        if (parsed.recommendations) setRecommendations(parsed.recommendations);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.businessProfile) setBusinessProfile(parsed.businessProfile);
      }
    } catch (e) {
      console.warn('LocalStorage load notice:', e);
    }

    // Initialize Supabase Auth Session listener
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data: members } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', session.user.id)
            .limit(1);
          if (members && members.length > 0) {
            setBusinessId(members[0].business_id);
          }
        } catch {
          // Fallback ignored
        }
      }
    }).catch(err => {
      console.warn('Supabase session load notice:', err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data: members } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', session.user.id)
            .limit(1);
          if (members && members.length > 0) {
            setBusinessId(members[0].business_id);
          }
        } catch {
          // Fallback ignored
        }
      } else {
        setBusinessId(process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? '11111111-1111-1111-1111-111111111111' : null);
      }
    });

    setIsInitialized(true);

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Save to local storage for offline resilience
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        invoices,
        customers,
        leads,
        appointments,
        jobs,
        recommendations,
        notifications,
        profile,
        settings,
        businessProfile,
      }));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }, [isInitialized, invoices, customers, leads, appointments, jobs, recommendations, notifications, profile, settings, businessProfile]);

  // Auth Operations
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    try {
      const { user: authUser, session: authSession } = await services.auth.signIn({ email, password });
      setUser(authUser);
      setSession(authSession);
      
      showToast({
        title: 'Welcome Back!',
        description: `Signed in as ${email}`,
        type: 'success',
      });
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Invalid email or password.';
      if (!isDemoMode) {
        setIsLoading(false);
        showToast({
          title: 'Authentication Failed',
          description: errMsg,
          type: 'error',
        });
        return { success: false, error: errMsg };
      }

      const demoUser: User = {
        id: '11111111-1111-1111-1111-111111111111',
        app_metadata: { provider: 'email' },
        user_metadata: { name: profile.name || 'Jane Doe', business_name: profile.businessName || 'Apex Comfort HVAC' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email,
      } as unknown as User;

      const demoSession: Session = {
        access_token: 'paypilot-demo-access-token',
        refresh_token: 'paypilot-demo-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: demoUser,
      };

      setUser(demoUser);
      setSession(demoSession);
      setBusinessId('11111111-1111-1111-1111-111111111111');
      setProfile(prev => ({ ...prev, email }));
      showToast({
        title: 'Signed In (Demo Workspace)',
        description: `Active session for ${email}`,
        type: 'success',
      });
      setIsLoading(false);
      return { success: true };
    }
  };

  const signUp = async (params: { email: string; password: string; name: string; businessName: string }) => {
    setIsLoading(true);
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    try {
      const { user: authUser, session: authSession, business } = await services.auth.signUp(params);
      setUser(authUser);
      setSession(authSession);
      if (business) setBusinessId(business.id);

      setProfile(prev => ({
        ...prev,
        name: params.name,
        email: params.email,
        businessName: params.businessName,
      }));
      setSettings(prev => ({
        ...prev,
        businessName: params.businessName,
        businessEmail: params.email,
      }));
      setBusinessProfile(prev => ({
        ...prev,
        name: params.businessName,
        email: params.email,
      }));

      showToast({
        title: 'Account Created Successfully!',
        description: 'Your service workspace is initialized.',
        type: 'success',
      });
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to create account.';
      if (!isDemoMode) {
        setIsLoading(false);
        showToast({
          title: 'Registration Failed',
          description: errMsg,
          type: 'error',
        });
        return { success: false, error: errMsg };
      }

      setProfile(prev => ({
        ...prev,
        name: params.name,
        email: params.email,
        businessName: params.businessName,
      }));
      setSettings(prev => ({
        ...prev,
        businessName: params.businessName,
        businessEmail: params.email,
      }));
      setBusinessProfile(prev => ({
        ...prev,
        name: params.businessName,
        email: params.email,
      }));

      showToast({
        title: 'Workspace Initialized (Demo)',
        description: `Welcome to Ventrexs Service OS, ${params.name}!`,
        type: 'success',
      });
      setIsLoading(false);
      return { success: true };
    }
  };

  const signOut = async () => {
    try {
      await services.auth.signOut();
    } catch {
      // Ignore
    }
    setUser(null);
    setSession(null);
    setBusinessId(null);
    showToast({ title: 'Logged out successfully', type: 'info' });
  };

  const deleteAccount = async () => {
    const targetBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    try {
      const res = await deleteUserAccountAction(targetBusinessId);
      if (res.success) {
        setUser(null);
        setSession(null);
        setBusinessId(null);
        localStorage.removeItem(STORAGE_KEY);
        showToast({
          title: 'Account & Data Erased',
          description: 'Your account and personal data have been permanently removed.',
          type: 'info'
        });
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete account' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to delete account';
      return { success: false, error: errMsg };
    }
  };

  // ==========================================
  // CRM LEADS ACTIONS
  // ==========================================
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastActivityAt'> & { id?: string }): Promise<Lead | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    const computedScore = leadData.score ?? calculateLeadScore(leadData).totalScore;
    
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createLeadAction({
          business_id: activeBusinessId,
          name: leadData.name,
          company: leadData.company,
          phone: leadData.phone,
          email: leadData.email,
          source: leadData.source,
          service_requested: leadData.serviceRequested,
          status: leadData.status,
          priority: leadData.priority,
          estimated_value: leadData.estimatedValue,
          score: computedScore,
          assigned_user_id: leadData.assignedUserId,
          assigned_user_name: leadData.assignedUserName,
          notes: leadData.notes,
        });

        if (res.success && res.data) {
          const newLead: Lead = {
            id: res.data.id,
            businessId: res.data.business_id,
            customerId: res.data.customer_id || undefined,
            name: res.data.name,
            company: res.data.company || undefined,
            phone: res.data.phone || '',
            email: res.data.email || '',
            source: res.data.source as any,
            serviceRequested: res.data.service_requested || '',
            status: res.data.status as any,
            priority: res.data.priority as any,
            estimatedValue: Number(res.data.estimated_value || 0),
            score: res.data.score || computedScore,
            assignedUserId: res.data.assigned_user_id || undefined,
            assignedUserName: res.data.assigned_user_name || undefined,
            notes: res.data.notes || '',
            notesList: [],
            lastActivityAt: 'Just now',
            createdAt: res.data.created_at,
            activities: [
              {
                id: 'act-' + Date.now(),
                leadId: res.data.id,
                activityType: 'status_change',
                title: 'Lead Created',
                description: `Received via ${res.data.source}`,
                createdAt: 'Just now',
              }
            ]
          };

          setLeads(prev => [newLead, ...prev]);
          showToast({ title: `Lead added: ${newLead.name}`, type: 'success' });
          return newLead;
        }
      } catch (err: unknown) {
        console.warn('Server create lead error, using local fallback:', err);
      }
    }

    // Demo Mode fallback
    const id = leadData.id || `lead-${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id,
      businessId: activeBusinessId,
      score: computedScore,
      notesList: leadData.notesList || [],
      lastActivityAt: 'Just now',
      createdAt: new Date().toISOString(),
      activities: [
        {
          id: 'act-' + Date.now(),
          leadId: id,
          activityType: 'status_change',
          title: 'Lead Created',
          description: `Received via ${leadData.source}`,
          createdAt: 'Just now',
          userName: 'System Intake'
        }
      ]
    };

    setLeads(prev => [newLead, ...prev]);
    showToast({ title: `Lead created: ${newLead.name}`, type: 'success' });
    return newLead;
  };

  const updateLead = async (updated: Lead) => {
    const computedScore = updated.score ?? calculateLeadScore(updated).totalScore;
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateLeadAction(updated.id, {
          name: updated.name,
          company: updated.company,
          phone: updated.phone,
          email: updated.email,
          source: updated.source,
          service_requested: updated.serviceRequested,
          status: updated.status,
          priority: updated.priority,
          estimated_value: updated.estimatedValue,
          score: computedScore,
          assigned_user_id: updated.assignedUserId,
          assigned_user_name: updated.assignedUserName,
          notes: updated.notes,
        });
      } catch (err) {
        console.warn('Server update lead error:', err);
      }
    }

    setLeads(prev => prev.map(l => l.id === updated.id ? { ...updated, score: computedScore, lastActivityAt: 'Just now' } : l));
    showToast({ title: `Lead updated: ${updated.name}`, type: 'info' });
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, notes?: string) => {
    const existing = leads.find(l => l.id === leadId);
    if (!existing) return;

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateLeadStatusAction(leadId, status, notes);
      } catch (err) {
        console.warn('Server update status error:', err);
      }
    }

    const activity: LeadActivity = {
      id: 'act-' + Date.now(),
      leadId,
      activityType: 'status_change',
      title: `Stage moved to ${status}`,
      description: notes || `Advanced pipeline status from ${existing.status} to ${status}`,
      createdAt: 'Just now',
      userName: profile.name
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status,
          lastActivityAt: 'Just now',
          activities: [activity, ...(l.activities || [])]
        };
      }
      return l;
    }));

    showToast({
      title: `Pipeline Stage Updated`,
      description: `${existing.name} is now ${status}`,
      type: 'success'
    });
  };

  const assignLead = async (leadId: string, assignedUserId: string | null, assignedUserName: string | null) => {
    const existing = leads.find(l => l.id === leadId);
    if (!existing) return;

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await assignLeadAction({
          leadId,
          assignedUserId,
          assignedUserName,
        });
      } catch (err) {
        console.warn('Server assign lead error:', err);
      }
    }

    const activity: LeadActivity = {
      id: 'act-' + Date.now(),
      leadId,
      activityType: 'assigned_user_changed',
      title: 'Assigned User Changed',
      description: assignedUserName ? `Assigned to ${assignedUserName}` : 'Lead unassigned',
      createdAt: 'Just now',
      userName: profile.name,
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          assignedUserId: assignedUserId || undefined,
          assignedUserName: assignedUserName || undefined,
          lastActivityAt: 'Just now',
          activities: [activity, ...(l.activities || [])],
        };
      }
      return l;
    }));

    showToast({
      title: 'Assignment Updated',
      description: assignedUserName ? `Assigned to ${assignedUserName}` : 'Lead is now unassigned',
      type: 'info',
    });
  };

  const addLeadActivity = async (leadId: string, activityData: Omit<LeadActivity, 'id' | 'createdAt' | 'leadId'>) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await addLeadActivityAction({
          business_id: activeBusinessId,
          lead_id: leadId,
          activity_type: activityData.activityType,
          title: activityData.title,
          description: activityData.description,
          metadata: activityData.metadata,
        });
      } catch (err) {
        console.warn('Server add activity error:', err);
      }
    }

    const newActivity: LeadActivity = {
      ...activityData,
      id: 'act-' + Date.now(),
      leadId,
      createdAt: 'Just now',
      userName: profile.name
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          lastActivityAt: 'Just now',
          activities: [newActivity, ...(l.activities || [])]
        };
      }
      return l;
    }));

    showToast({ title: 'Activity logged', type: 'info' });
  };

  const addLeadNote = async (leadId: string, content: string, authorName?: string): Promise<LeadNote | null> => {
    const author = authorName || profile.name || 'Team Member';
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createLeadNoteAction({
          leadId,
          content,
          authorName: author,
        });
        if (res.success && res.data) {
          const note: LeadNote = {
            id: res.data.id,
            leadId,
            businessId: res.data.business_id,
            authorId: res.data.author_id || undefined,
            authorName: res.data.author_name,
            content: res.data.content,
            createdAt: res.data.created_at,
          };
          setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
              return {
                ...l,
                lastActivityAt: 'Just now',
                notesList: [note, ...(l.notesList || [])],
              };
            }
            return l;
          }));
          showToast({ title: 'Note created', type: 'success' });
          return note;
        }
      } catch (err) {
        console.warn('Server add note error:', err);
      }
    }

    const newNote: LeadNote = {
      id: 'note-' + Date.now(),
      leadId,
      businessId: activeBusinessId,
      authorName: author,
      content,
      createdAt: 'Just now',
    };

    const activity: LeadActivity = {
      id: 'act-' + Date.now(),
      leadId,
      activityType: 'note',
      title: 'Note Added',
      description: content.substring(0, 100),
      createdAt: 'Just now',
      userName: author,
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          lastActivityAt: 'Just now',
          notesList: [newNote, ...(l.notesList || [])],
          activities: [activity, ...(l.activities || [])],
        };
      }
      return l;
    }));

    showToast({ title: 'Note added', type: 'success' });
    return newNote;
  };

  const updateLeadNote = async (noteId: string, content: string, leadId: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateLeadNoteAction({ noteId, content });
      } catch (err) {
        console.warn('Server update note error:', err);
      }
    }

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          lastActivityAt: 'Just now',
          notesList: (l.notesList || []).map(n => n.id === noteId ? { ...n, content, updatedAt: 'Just now' } : n),
        };
      }
      return l;
    }));

    showToast({ title: 'Note updated', type: 'info' });
  };

  const deleteLeadNote = async (noteId: string, leadId: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteLeadNoteAction(noteId);
      } catch (err) {
        console.warn('Server delete note error:', err);
      }
    }

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          notesList: (l.notesList || []).filter(n => n.id !== noteId),
        };
      }
      return l;
    }));

    showToast({ title: 'Note removed', type: 'info' });
  };

  const bulkUpdateLeadStatus = async (leadIds: string[], status: LeadStatus) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await bulkUpdateLeadStatusAction({
          leadIds,
          status,
          businessId: activeBusinessId,
        });
      } catch (err) {
        console.warn('Server bulk update error:', err);
      }
    }

    setLeads(prev => prev.map(l => {
      if (leadIds.includes(l.id)) {
        return {
          ...l,
          status,
          lastActivityAt: 'Just now',
        };
      }
      return l;
    }));

    showToast({
      title: 'Bulk Status Updated',
      description: `${leadIds.length} leads moved to ${status}`,
      type: 'success',
    });
  };

  const bulkAssignLeads = async (leadIds: string[], assignedUserId: string | null, assignedUserName: string | null) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await bulkAssignLeadsAction({
          leadIds,
          assignedUserId,
          assignedUserName,
          businessId: activeBusinessId,
        });
      } catch (err) {
        console.warn('Server bulk assign error:', err);
      }
    }

    setLeads(prev => prev.map(l => {
      if (leadIds.includes(l.id)) {
        return {
          ...l,
          assignedUserId: assignedUserId || undefined,
          assignedUserName: assignedUserName || undefined,
          lastActivityAt: 'Just now',
        };
      }
      return l;
    }));

    showToast({
      title: 'Bulk Assignment Complete',
      description: `${leadIds.length} leads assigned to ${assignedUserName || 'unassigned'}`,
      type: 'success',
    });
  };

  const bulkDeleteLeads = async (leadIds: string[]) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await bulkDeleteLeadsAction({
          leadIds,
          businessId: activeBusinessId,
        });
      } catch (err) {
        console.warn('Server bulk delete error:', err);
      }
    }

    setLeads(prev => prev.filter(l => !leadIds.includes(l.id)));
    showToast({
      title: 'Bulk Deletion Complete',
      description: `${leadIds.length} leads removed`,
      type: 'info',
    });
  };

  const deleteLead = async (id: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteLeadAction(id, businessId);
      } catch (err) {
        console.warn('Server delete lead error:', err);
      }
    }

    setLeads(prev => prev.filter(l => l.id !== id));
    showToast({ title: 'Lead removed', type: 'info' });
  };

  const convertLeadToCustomer = async (
    leadId: string,
    createNewContact: boolean = true,
    existingCustomerId?: string
  ): Promise<Customer | null> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await convertLeadToCustomerAction({
          leadId,
          createNewContact,
          existingCustomerId,
        });
      } catch (err) {
        console.warn('Server convert lead error:', err);
      }
    }

    let targetCustomer: Customer | null = null;

    if (!createNewContact && existingCustomerId) {
      targetCustomer = customers.find(c => c.id === existingCustomerId) || null;
    } else {
      targetCustomer = await addCustomer({
        name: lead.name,
        company: lead.company || lead.name,
        email: lead.email,
        phone: lead.phone,
        address: 'United States',
        totalOutstanding: 0,
        outstandingReceivables: 0,
        totalPaid: 0,
        paymentsReceived: 0,
        overdueCount: 0,
        activeInvoicesCount: 0,
        riskLevel: 'low',
        creditScore: 750,
        lastContactDate: 'Just now',
        preferredContact: 'phone',
        notes: `Converted from lead (${lead.serviceRequested || 'General inquiry'})`
      });
    }

    const activity: LeadActivity = {
      id: 'act-' + Date.now(),
      leadId,
      activityType: 'contact_converted',
      title: 'Lead Converted to Contact',
      description: `Associated with ${targetCustomer?.name || 'Contact'} (${targetCustomer?.company || ''})`,
      createdAt: 'Just now',
      userName: profile.name,
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          customerId: targetCustomer?.id,
          status: 'WON',
          lastActivityAt: 'Just now',
          activities: [activity, ...(l.activities || [])],
        };
      }
      return l;
    }));

    showToast({
      title: 'Lead Converted!',
      description: `${lead.name} is now linked to ${targetCustomer?.name || 'Customer'}.`,
      type: 'success'
    });

    return targetCustomer;
  };

  // ==========================================
  // OPERATIONS: APPOINTMENTS & JOBS
  // ==========================================
  const addAppointment = async (aptData: Omit<Appointment, 'id' | 'createdAt'> & { id?: string }): Promise<Appointment | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createAppointmentAction({
          business_id: activeBusinessId,
          title: aptData.title,
          service_type: aptData.serviceType,
          start_time: aptData.startTime,
          end_time: aptData.endTime,
          status: aptData.status,
          address: aptData.address,
          technician_name: aptData.technicianName,
          notes: aptData.notes,
        });

        if (res.success && res.data) {
          const newApt: Appointment = {
            id: res.data.id,
            businessId: res.data.business_id,
            customerName: aptData.customerName,
            customerPhone: aptData.customerPhone,
            title: res.data.title,
            serviceType: res.data.service_type,
            startTime: res.data.start_time,
            endTime: res.data.end_time,
            status: res.data.status as any,
            address: res.data.address || '',
            technicianName: res.data.technician_name || '',
            notes: res.data.notes || '',
            createdAt: res.data.created_at,
          };
          setAppointments(prev => [newApt, ...prev]);
          showToast({ title: 'Appointment booked', type: 'success' });
          return newApt;
        }
      } catch (err) {
        console.warn('Server appointment error:', err);
      }
    }

    const id = aptData.id || `apt-${Date.now()}`;
    const newApt: Appointment = {
      ...aptData,
      id,
      businessId: activeBusinessId,
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => [newApt, ...prev]);
    showToast({ title: 'Appointment scheduled', type: 'success' });
    return newApt;
  };

  const updateAppointment = async (updated: Appointment) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateAppointmentAction(updated.id, {
          title: updated.title,
          service_type: updated.serviceType,
          start_time: updated.startTime,
          end_time: updated.endTime,
          status: updated.status,
          address: updated.address,
          technician_name: updated.technicianName,
          notes: updated.notes,
        });
      } catch (err) {
        console.warn('Server update appointment error:', err);
      }
    }

    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
    showToast({ title: 'Appointment updated', type: 'info' });
  };

  const deleteAppointment = async (id: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteAppointmentAction(id, businessId);
      } catch (err) {
        console.warn('Server delete appointment error:', err);
      }
    }

    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast({ title: 'Appointment cancelled', type: 'info' });
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt'> & { id?: string }): Promise<Job | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createJobAction({
          business_id: activeBusinessId,
          customer_id: jobData.customerId || null,
          lead_id: jobData.leadId || null,
          appointment_id: jobData.appointmentId || null,
          estimate_id: jobData.estimateId || null,
          title: jobData.title,
          service_type: jobData.serviceType,
          description: jobData.description || null,
          property_address: jobData.propertyAddress || null,
          status: jobData.status,
          priority: jobData.priority,
          scheduled_date: jobData.scheduledDate,
          estimated_duration_minutes: jobData.estimatedDurationMinutes || 60,
          start_time: jobData.startTime || null,
          end_time: jobData.endTime || null,
          estimated_total: jobData.estimatedTotal,
          actual_total: jobData.actualTotal,
          assigned_tech_id: jobData.assignedTechId || null,
          assigned_tech_name: jobData.assignedTechName || jobData.technicianName || null,
          technician_name: jobData.technicianName || 'Unassigned',
          notes: jobData.notes,
          internal_notes: jobData.internalNotes || null,
          customer_notes: jobData.customerNotes || null,
        });

        if (res.success && res.data) {
          const newJob: Job = {
            id: res.data.id,
            businessId: res.data.business_id,
            customerId: res.data.customer_id || undefined,
            customerName: jobData.customerName,
            customerPhone: jobData.customerPhone,
            customerEmail: jobData.customerEmail,
            leadId: res.data.lead_id || undefined,
            appointmentId: res.data.appointment_id || undefined,
            estimateId: res.data.estimate_id || undefined,
            title: res.data.title,
            serviceType: res.data.service_type,
            description: res.data.description || undefined,
            propertyAddress: res.data.property_address || undefined,
            status: res.data.status as any,
            priority: res.data.priority as any,
            scheduledDate: res.data.scheduled_date || undefined,
            estimatedDurationMinutes: res.data.estimated_duration_minutes,
            startTime: res.data.start_time || undefined,
            endTime: res.data.end_time || undefined,
            estimatedTotal: Number(res.data.estimated_total || 0),
            actualTotal: Number(res.data.actual_total || 0),
            assignedTechId: res.data.assigned_tech_id || undefined,
            assignedTechName: res.data.assigned_tech_name || undefined,
            technicianName: res.data.technician_name || 'Unassigned',
            notes: res.data.notes || '',
            internalNotes: res.data.internal_notes || '',
            customerNotes: res.data.customer_notes || '',
            createdAt: res.data.created_at,
          };
          setJobs(prev => [newJob, ...prev]);
          showToast({ title: 'Work order created', type: 'success' });
          return newJob;
        }
      } catch (err) {
        console.warn('Server job error:', err);
      }
    }

    const id = jobData.id || `job-${Date.now()}`;
    const newJob: Job = {
      ...jobData,
      id,
      businessId: activeBusinessId,
      createdAt: new Date().toISOString(),
    };

    setJobs(prev => [newJob, ...prev]);
    showToast({ title: 'Work order created', type: 'success' });
    return newJob;
  };

  const updateJob = async (updated: Job) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateJobAction(updated.id, {
          title: updated.title,
          service_type: updated.serviceType,
          description: updated.description || null,
          property_address: updated.propertyAddress || null,
          status: updated.status,
          priority: updated.priority,
          scheduled_date: updated.scheduledDate,
          estimated_duration_minutes: updated.estimatedDurationMinutes,
          start_time: updated.startTime || null,
          end_time: updated.endTime || null,
          estimated_total: updated.estimatedTotal,
          actual_total: updated.actualTotal,
          assigned_tech_id: updated.assignedTechId || null,
          assigned_tech_name: updated.assignedTechName || updated.technicianName || null,
          technician_name: updated.technicianName,
          notes: updated.notes,
          internal_notes: updated.internalNotes || null,
          customer_notes: updated.customerNotes || null,
        });
      } catch (err) {
        console.warn('Server update job error:', err);
      }
    }

    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
    showToast({ title: 'Work order updated', type: 'info' });
  };

  const deleteJob = async (id: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteJobAction(id, businessId);
      } catch (err) {
        console.warn('Server delete job error:', err);
      }
    }

    setJobs(prev => prev.filter(j => j.id !== id));
    showToast({ title: 'Work order removed', type: 'info' });
  };

  const assignJobTechnician = async (jobId: string, techName: string, techId?: string): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await assignJobTechnicianAction({
          jobId,
          businessId: activeBusinessId,
          techId: techId || null,
          techName: techName || null,
        });
      } catch (err) {
        console.warn('Server assign tech error:', err);
      }
    }

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const newStatus = j.status === 'NEW' && techName ? 'SCHEDULED' : j.status;
        return {
          ...j,
          assignedTechId: techId,
          assignedTechName: techName,
          technicianName: techName || 'Unassigned',
          status: newStatus as any,
          activities: [
            {
              id: 'act-' + Date.now(),
              jobId,
              businessId: activeBusinessId,
              activityType: 'TECHNICIAN_ASSIGNED',
              title: techName ? `Assigned to ${techName}` : 'Technician Unassigned',
              createdAt: 'Just now',
            },
            ...(j.activities || [])
          ]
        };
      }
      return j;
    }));

    showToast({ title: techName ? `Technician Assigned: ${techName}` : 'Technician Unassigned', type: 'success' });
    return true;
  };

  const updateJobStatus = async (jobId: string, status: JobStatus, notes?: string): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateJobStatusAction({
          jobId,
          businessId: activeBusinessId,
          status,
          notes,
        });
      } catch (err) {
        console.warn('Server status update error:', err);
      }
    }

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const isCompleting = status === 'COMPLETED';
        return {
          ...j,
          status,
          completedAt: isCompleting ? new Date().toISOString() : j.completedAt,
          notes: notes ? `${j.notes || ''}\n[Status: ${status}] ${notes}`.trim() : j.notes,
          activities: [
            {
              id: 'act-' + Date.now(),
              jobId,
              businessId: activeBusinessId,
              activityType: isCompleting ? 'JOB_COMPLETED' : 'STATUS_CHANGED',
              title: `Status: ${status.replace('_', ' ')}`,
              description: notes || `Moved to ${status}`,
              createdAt: 'Just now',
            },
            ...(j.activities || [])
          ]
        };
      }
      return j;
    }));

    showToast({ title: `Job Status: ${status.replace('_', ' ')}`, type: 'info' });
    return true;
  };

  const addJobActivity = async (jobId: string, title: string, description?: string, activityType: string = 'NOTE_ADDED'): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await addJobActivityAction({
          jobId,
          businessId: activeBusinessId,
          activityType,
          title,
          description,
        });
      } catch (err) {
        console.warn('Server activity add error:', err);
      }
    }

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          activities: [
            {
              id: 'act-' + Date.now(),
              jobId,
              businessId: activeBusinessId,
              activityType,
              title,
              description,
              createdAt: 'Just now',
            },
            ...(j.activities || [])
          ]
        };
      }
      return j;
    }));

    showToast({ title: 'Activity logged', type: 'info' });
    return true;
  };

  // ==========================================
  // ESTIMATES ACTIONS (SERVER-SIDE ARITHMETIC & CONVERSION)
  // ==========================================
  const addEstimate = async (estimateData: Partial<Estimate>): Promise<Estimate | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    // Calculate totals server-side / locally with integer precision
    const items = (estimateData.items || []).map((it, idx) => ({
      id: it.id || `item-${Date.now()}-${idx}`,
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      amount: Math.round((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0) * 100) / 100,
    }));

    const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
    const taxRate = Number(estimateData.taxRate) || 0;
    const taxAmount = Math.round(subtotal * taxRate) / 100;
    const discountAmount = Number(estimateData.discountAmount) || 0;
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createEstimateAction({
          businessId: activeBusinessId,
          customerId: estimateData.customerId,
          jobId: estimateData.jobId,
          leadId: estimateData.leadId,
          title: estimateData.title || 'Service Estimate',
          description: estimateData.description,
          items,
          taxRate,
          discountAmount,
          validUntil: estimateData.validUntil,
          notes: estimateData.notes,
        });

        if (res.success && res.data) {
          const newEst: Estimate = {
            id: res.data.id,
            businessId: res.data.business_id,
            customerId: res.data.customer_id || undefined,
            customerName: estimateData.customerName,
            customerEmail: estimateData.customerEmail,
            customerPhone: estimateData.customerPhone,
            jobId: res.data.job_id || undefined,
            jobTitle: estimateData.jobTitle,
            estimateNumber: res.data.estimate_number,
            title: res.data.title,
            description: res.data.description || undefined,
            items,
            subtotal: Number(res.data.subtotal),
            taxRate: Number(res.data.tax_rate),
            taxAmount: Number(res.data.tax_amount),
            discountAmount: Number(res.data.discount_amount),
            totalAmount: Number(res.data.total_amount),
            status: res.data.status as any,
            validUntil: res.data.valid_until || undefined,
            notes: res.data.notes || '',
            createdAt: res.data.created_at,
          };
          setEstimates(prev => [newEst, ...prev]);
          showToast({ title: `Estimate ${newEst.estimateNumber} created`, type: 'success' });
          return newEst;
        }
      } catch (err) {
        console.warn('Server estimate error:', err);
      }
    }

    const estNumber = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEst: Estimate = {
      id: estimateData.id || `est-${Date.now()}`,
      businessId: activeBusinessId,
      customerId: estimateData.customerId,
      customerName: estimateData.customerName || 'Direct Client',
      customerEmail: estimateData.customerEmail,
      customerPhone: estimateData.customerPhone,
      jobId: estimateData.jobId,
      jobTitle: estimateData.jobTitle,
      estimateNumber: estNumber,
      title: estimateData.title || 'Service Estimate',
      description: estimateData.description,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      status: 'DRAFT',
      validUntil: estimateData.validUntil,
      notes: estimateData.notes,
      createdAt: new Date().toISOString(),
    };

    setEstimates(prev => [newEst, ...prev]);
    showToast({ title: `Estimate ${estNumber} created`, type: 'success' });
    return newEst;
  };

  const updateEstimate = async (id: string, updates: Partial<Estimate>): Promise<Estimate | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateEstimateAction(id, activeBusinessId, {
          title: updates.title,
          description: updates.description,
          items: updates.items,
          taxRate: updates.taxRate,
          discountAmount: updates.discountAmount,
          validUntil: updates.validUntil,
          notes: updates.notes,
        });
      } catch (err) {
        console.warn('Server update estimate error:', err);
      }
    }

    let updatedEst: Estimate | null = null;
    setEstimates(prev => prev.map(e => {
      if (e.id === id) {
        updatedEst = { ...e, ...updates };
        return updatedEst;
      }
      return e;
    }));

    showToast({ title: 'Estimate updated', type: 'info' });
    return updatedEst;
  };

  const sendEstimate = async (id: string, channel: 'email' | 'sms' | 'whatsapp'): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await sendEstimateAction({
          estimateId: id,
          businessId: activeBusinessId,
          channel,
        });
      } catch (err) {
        console.warn('Server send estimate error:', err);
      }
    }

    setEstimates(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: 'SENT' };
      }
      return e;
    }));

    showToast({ title: `Estimate sent via ${channel.toUpperCase()}`, type: 'success' });
    return true;
  };

  const approveEstimate = async (id: string, customerName?: string): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await approveEstimateAction({
          estimateId: id,
          businessId: activeBusinessId,
          customerName,
        });
      } catch (err) {
        console.warn('Server approve estimate error:', err);
      }
    }

    setEstimates(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedByCustomerName: customerName || e.customerName || 'Authorized Customer',
        };
      }
      return e;
    }));

    showToast({ title: 'Estimate approved by customer', type: 'success' });
    return true;
  };

  const rejectEstimate = async (id: string, reason: string): Promise<boolean> => {
    if (!reason || !reason.trim()) {
      showToast({ title: 'Rejection reason is required', type: 'error' });
      return false;
    }

    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await rejectEstimateAction({
          estimateId: id,
          businessId: activeBusinessId,
          reason,
        });
      } catch (err) {
        console.warn('Server reject estimate error:', err);
      }
    }

    setEstimates(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
        };
      }
      return e;
    }));

    showToast({ title: 'Estimate marked as rejected', type: 'info' });
    return true;
  };

  const convertEstimateToInvoice = async (id: string): Promise<Invoice | null> => {
    const targetEst = estimates.find(e => e.id === id);
    if (!targetEst) return null;

    if (targetEst.status !== 'APPROVED') {
      showToast({ title: 'Only approved estimates can be converted', type: 'error' });
      return null;
    }

    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await convertEstimateToInvoiceAction({
          estimateId: id,
          businessId: activeBusinessId,
        });
        if (res.success && res.data) {
          showToast({ title: `Invoice ${res.data.invoice_number} created from estimate`, type: 'success' });
        }
      } catch (err) {
        console.warn('Server convert estimate error:', err);
      }
    }

    const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      number: invNum,
      customerId: targetEst.customerId || 'cust-1',
      customerName: targetEst.customerName || 'Direct Client',
      customerCompany: targetEst.customerName || 'Direct Client',
      customerEmail: targetEst.customerEmail || 'client@example.com',
      customerPhone: targetEst.customerPhone,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'due',
      priority: 'medium',
      items: targetEst.items.map(it => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        amount: it.amount,
      })),
      subtotal: targetEst.subtotal,
      taxRate: targetEst.taxRate,
      taxAmount: targetEst.taxAmount,
      discountAmount: targetEst.discountAmount,
      totalAmount: targetEst.totalAmount,
      originalAmountDue: targetEst.totalAmount,
      paymentsReceived: 0,
      remainingBalance: targetEst.totalAmount,
      daysOverdue: 0,
      notes: `Generated from Approved Estimate ${targetEst.estimateNumber}`,
      timeline: [
        {
          id: 't-' + Date.now(),
          type: 'created',
          title: 'Invoice Created from Estimate',
          description: `Inherited approved items from Estimate ${targetEst.estimateNumber}`,
          timestamp: 'Just now',
        }
      ]
    };

    setInvoices(prev => [newInv, ...prev]);
    setEstimates(prev => prev.map(e => e.id === id ? { ...e, invoiceId: newInv.id } : e));
    if (targetEst.jobId) {
      setJobs(prev => prev.map(j => j.id === targetEst.jobId ? { ...j, invoiceId: newInv.id, status: 'INVOICED' } : j));
    }

    showToast({ title: `Invoice ${invNum} created from Estimate`, type: 'success' });
    return newInv;
  };

  const deleteEstimate = async (id: string): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteEstimateAction(id, activeBusinessId);
      } catch (err) {
        console.warn('Server delete estimate error:', err);
      }
    }

    setEstimates(prev => prev.filter(e => e.id !== id));
    showToast({ title: 'Estimate deleted', type: 'info' });
    return true;
  };

  // ==========================================
  // PHASE 6 — REPUTATION & REVIEW ACTIONS
  // ==========================================
  const updateReviewSettings = async (updates: Partial<ReviewSettings>): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await updateReviewSettingsAction(activeBusinessId, updates);
        if (!res.success) {
          showToast({ title: 'Failed to update review settings', description: res.error, type: 'error' });
          return false;
        }
      } catch (err) {
        console.warn('Server review settings error:', err);
      }
    }

    setReviewSettings(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    showToast({ title: 'Review automation settings updated', type: 'success' });
    return true;
  };

  const createReviewRequest = async (params: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    jobId?: string;
    technicianName?: string;
    channel?: 'email' | 'sms' | 'whatsapp';
    scheduledFor?: string;
  }): Promise<ReviewRequest | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    const channel = params.channel || reviewSettings.defaultChannel || 'sms';

    let serverData: any = null;
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createReviewRequestAction({
          businessId: activeBusinessId,
          customerId: params.customerId,
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          customerEmail: params.customerEmail,
          jobId: params.jobId,
          technicianName: params.technicianName,
          channel,
          scheduledFor: params.scheduledFor,
        });
        if (res.success && res.data) {
          serverData = res.data;
        }
      } catch (err) {
        console.warn('Server review request error:', err);
      }
    }

    const newReq: ReviewRequest = serverData ? {
      id: serverData.id,
      businessId: serverData.business_id,
      customerId: serverData.customer_id,
      customerName: serverData.customer_name,
      customerPhone: serverData.customer_phone,
      customerEmail: serverData.customer_email,
      jobId: serverData.job_id,
      technicianName: serverData.technician_name,
      channel: serverData.channel,
      status: serverData.status,
      scheduledFor: serverData.scheduled_for,
      feedbackUrl: serverData.feedback_url,
      reviewUrl: serverData.review_url,
      createdAt: serverData.created_at,
    } : {
      id: `req-${Date.now()}`,
      businessId: activeBusinessId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      jobId: params.jobId,
      technicianName: params.technicianName,
      channel,
      status: params.scheduledFor ? 'SCHEDULED' : 'PENDING',
      scheduledFor: params.scheduledFor,
      feedbackUrl: `/feedback/req-${Date.now()}`,
      reviewUrl: reviewSettings.googleReviewUrl,
      createdAt: new Date().toISOString(),
    };

    setReviewRequests(prev => [newReq, ...prev]);
    showToast({ title: `Review request created (${channel.toUpperCase()})`, type: 'success' });
    return newReq;
  };

  const sendReviewRequest = async (requestId: string, overrideChannel?: 'email' | 'sms' | 'whatsapp'): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await sendReviewRequestAction({
          requestId,
          businessId: activeBusinessId,
          overrideChannel,
        });
        if (!res.success) {
          showToast({ title: 'Failed to send review request', description: res.error, type: 'error' });
          return false;
        }
      } catch (err) {
        console.warn('Server send review request error:', err);
      }
    }

    setReviewRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'SENT',
          channel: overrideChannel || r.channel,
          sentAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
        };
      }
      return r;
    }));

    showToast({ title: 'Review request dispatched successfully', type: 'success' });
    return true;
  };

  const submitCustomerFeedback = async (params: {
    reviewRequestId?: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    jobId?: string;
    rating: number;
    feedbackText?: string;
    serviceAspects?: string[];
    channel?: any;
  }): Promise<{ success: boolean; isPositive: boolean }> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    const rating = Math.min(5, Math.max(1, params.rating));
    const isPositive = rating >= (reviewSettings.positiveThreshold || 4);
    const sentiment = isPositive ? 'positive' : rating === 3 ? 'neutral' : 'negative';

    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await submitCustomerFeedbackAction({
          businessId: activeBusinessId,
          reviewRequestId: params.reviewRequestId,
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          customerEmail: params.customerEmail,
          jobId: params.jobId,
          rating,
          feedbackText: params.feedbackText,
          serviceAspects: params.serviceAspects,
          channel: params.channel || 'web',
        });
      } catch (err) {
        console.warn('Server submit feedback error:', err);
      }
    }

    const newFb: CustomerFeedback = {
      id: `fb-${Date.now()}`,
      businessId: activeBusinessId,
      reviewRequestId: params.reviewRequestId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      jobId: params.jobId,
      rating,
      sentiment,
      feedbackText: params.feedbackText,
      serviceAspects: params.serviceAspects || [],
      channel: params.channel || 'web',
      followUpStatus: sentiment === 'negative' ? 'NEW' : 'CLOSED',
      followUpNotes: sentiment === 'negative' ? 'Internal support ticket automatically opened from customer survey.' : undefined,
      createdAt: new Date().toISOString(),
    };

    setCustomerFeedback(prev => [newFb, ...prev]);

    if (params.reviewRequestId) {
      setReviewRequests(prev => prev.map(r => r.id === params.reviewRequestId ? {
        ...r,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      } : r));
    }

    return { success: true, isPositive };
  };

  const updateFeedbackFollowUp = async (
    feedbackId: string,
    status: FollowUpStatus,
    notes?: string,
    assignedTo?: string
  ): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await updateFeedbackFollowUpAction({
          feedbackId,
          businessId: activeBusinessId,
          followUpStatus: status,
          followUpNotes: notes,
          assignedTo,
        });
        if (!res.success) {
          showToast({ title: 'Failed to update follow-up', description: res.error, type: 'error' });
          return false;
        }
      } catch (err) {
        console.warn('Server update follow-up error:', err);
      }
    }

    setCustomerFeedback(prev => prev.map(f => {
      if (f.id === feedbackId) {
        return {
          ...f,
          followUpStatus: status,
          followUpNotes: notes !== undefined ? notes : f.followUpNotes,
          assignedTo: assignedTo !== undefined ? assignedTo : f.assignedTo,
          updatedAt: new Date().toISOString(),
        };
      }
      return f;
    }));

    showToast({ title: `Follow-up updated to ${status}`, type: 'success' });
    return true;
  };

  // ==========================================
  // CUSTOMER / CONTACT ACTIONS
  // ==========================================
  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createCustomerAction({
          business_id: activeBusinessId,
          name: customerData.name,
          company: customerData.company,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          risk_level: customerData.riskLevel,
          credit_score: customerData.creditScore,
          preferred_contact: customerData.preferredContact,
          notes: customerData.notes,
        });

        if (res.success && res.data) {
          const createdCust: Customer = {
            id: res.data.id,
            name: res.data.name,
            company: res.data.company,
            email: res.data.email,
            phone: res.data.phone || '',
            address: res.data.address || '',
            totalOutstanding: 0,
            outstandingReceivables: 0,
            totalPaid: 0,
            paymentsReceived: 0,
            overdueCount: 0,
            activeInvoicesCount: 0,
            riskLevel: res.data.risk_level as any,
            creditScore: res.data.credit_score,
            lastContactDate: 'Today',
            preferredContact: res.data.preferred_contact as any,
            notes: res.data.notes || '',
          };
          setCustomers(prev => [createdCust, ...prev]);
          showToast({ title: `Contact Added: ${createdCust.name}`, type: 'success' });
          return createdCust;
        }
      } catch (err) {
        console.warn('Server add customer error:', err);
      }
    }

    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = { ...customerData, id };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast({ title: `Contact Added: ${newCustomer.name}`, type: 'success' });
    return newCustomer;
  };

  const updateCustomer = async (updated: Customer) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateCustomerAction(updated.id, {
          name: updated.name,
          company: updated.company,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          risk_level: updated.riskLevel,
          credit_score: updated.creditScore,
          preferred_contact: updated.preferredContact,
          notes: updated.notes,
        });
      } catch (err) {
        console.warn('Server update customer error:', err);
      }
    }

    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast({ title: `Contact updated: ${updated.name}`, type: 'info' });
  };

  // ==========================================
  // INVOICE & PAYMENT ACTIONS (HALAL INTEGRITY)
  // ==========================================
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'timeline' | 'remainingBalance' | 'paymentsReceived' | 'originalAmountDue' | 'daysOverdue'> & { id?: string; originalAmountDue?: number; paymentsReceived?: number; remainingBalance?: number; daysOverdue?: number }) => {
    const origAmount = invoiceData.totalAmount;
    const paidSoFar = invoiceData.paymentsReceived ?? 0;
    const remaining = invoiceData.remainingBalance ?? (origAmount - paidSoFar);

    const targetDueDate = new Date(invoiceData.dueDate);
    const today = new Date();
    const diffTime = today.getTime() - targetDueDate.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        let matchedCustomer = customers.find(
          c => c.name.toLowerCase() === invoiceData.customerName.toLowerCase() ||
               c.company.toLowerCase() === invoiceData.customerCompany.toLowerCase()
        );

        if (!matchedCustomer) {
          const custRes = await createCustomerAction({
            business_id: activeBusinessId,
            name: invoiceData.customerName,
            company: invoiceData.customerCompany || invoiceData.customerName,
            email: invoiceData.customerEmail,
            phone: invoiceData.customerPhone || null,
          });

          if (!custRes.success || !custRes.data) {
            throw new Error(custRes.error || 'Failed to initialize customer account.');
          }

          matchedCustomer = {
            id: custRes.data.id,
            name: custRes.data.name,
            company: custRes.data.company,
            email: custRes.data.email,
            phone: custRes.data.phone || '',
            address: custRes.data.address || '',
            totalOutstanding: 0,
            outstandingReceivables: 0,
            totalPaid: 0,
            paymentsReceived: 0,
            overdueCount: 0,
            activeInvoicesCount: 0,
            riskLevel: custRes.data.risk_level as any,
            creditScore: custRes.data.credit_score,
            lastContactDate: 'Today',
            preferredContact: custRes.data.preferred_contact as any,
          };
          setCustomers(prev => [matchedCustomer!, ...prev]);
        }

        const invRes = await createInvoiceAction({
          business_id: activeBusinessId,
          customer_id: matchedCustomer.id,
          invoice_number: invoiceData.number,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: invoiceData.taxAmount,
          discount_amount: invoiceData.discountAmount,
          original_amount: origAmount,
          status: invoiceData.status,
          priority: invoiceData.priority,
          notes: invoiceData.notes,
          items: invoiceData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            tax_amount: 0,
            discount_amount: 0,
            line_total: item.amount,
          })),
        });

        if (!invRes.success || !invRes.data) {
          throw new Error(invRes.error || 'Failed to write invoice to database.');
        }

        const serverInvoice: Invoice = {
          id: invRes.data.id,
          number: invRes.data.invoice_number,
          customerId: invRes.data.customer_id,
          customerName: matchedCustomer.name,
          customerCompany: matchedCustomer.company,
          customerEmail: matchedCustomer.email,
          customerPhone: matchedCustomer.phone,
          issueDate: invRes.data.issue_date,
          dueDate: invRes.data.due_date,
          status: invRes.data.status as any,
          priority: invRes.data.priority as any,
          items: invoiceData.items,
          subtotal: Number(invRes.data.subtotal),
          taxRate: Number(invRes.data.tax_rate),
          taxAmount: Number(invRes.data.tax_amount),
          discountAmount: Number(invRes.data.discount_amount),
          totalAmount: Number(invRes.data.original_amount),
          originalAmountDue: Number(invRes.data.original_amount),
          paymentsReceived: Number(invRes.data.amount_paid),
          remainingBalance: Number(invRes.data.remaining_balance),
          daysOverdue: diffDays,
          notes: invRes.data.notes || '',
          timeline: [
            {
              id: 't-' + Date.now(),
              type: 'created',
              title: 'Invoice Created',
              description: `Generated for ${matchedCustomer.name}`,
              timestamp: 'Just now'
            }
          ]
        };

        setInvoices(prev => [serverInvoice, ...prev]);
        showToast({ title: `Invoice ${serverInvoice.number} created`, type: 'success' });
        return serverInvoice;
      } catch (err: unknown) {
        console.warn('Server invoice error, fallback to local:', err);
      }
    }

    // Demo Mode fallback
    const id = invoiceData.id || `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      originalAmountDue: origAmount,
      paymentsReceived: paidSoFar,
      remainingBalance: remaining,
      daysOverdue: invoiceData.status === 'overdue' ? (invoiceData.daysOverdue ?? diffDays) : 0,
      timeline: [
        {
          id: 't-' + Date.now(),
          type: 'created',
          title: 'Invoice Created',
          description: `Created for ${invoiceData.customerName}`,
          timestamp: 'Just now'
        }
      ]
    };

    setInvoices(prev => [newInvoice, ...prev]);
    showToast({ title: `Invoice ${newInvoice.number} created`, type: 'success' });
    return newInvoice;
  };

  const updateInvoice = async (updated: Invoice) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateInvoiceAction(updated.id, {
          due_date: updated.dueDate,
          notes: updated.notes,
          status: updated.status,
          priority: updated.priority,
        });
      } catch (err) {
        console.warn('Server invoice update error:', err);
      }
    }

    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    showToast({ title: `Invoice ${updated.number} updated`, type: 'info' });
  };

  const deleteInvoice = async (id: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteInvoiceAction(id, businessId);
      } catch (err) {
        console.warn('Server invoice delete error:', err);
      }
    }

    setInvoices(prev => prev.filter(i => i.id !== id));
    showToast({ title: 'Invoice deleted', type: 'info' });
  };

  const recordPayment = async (invoiceId: string, amount: number, method: PaymentMethod, note?: string) => {
    const targetInv = invoices.find(i => i.id === invoiceId);
    if (!targetInv) return;

    if (amount <= 0 || amount > targetInv.remainingBalance) {
      showToast({ title: 'Invalid payment amount', type: 'error' });
      return;
    }

    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await recordPaymentAction({
          business_id: activeBusinessId,
          invoice_id: invoiceId,
          amount,
          method,
          notes: note,
        });
      } catch (err) {
        console.warn('Server payment error:', err);
      }
    }

    const newPaid = targetInv.paymentsReceived + amount;
    const newRemaining = targetInv.originalAmountDue - newPaid;
    const newStatus: any = newRemaining === 0 ? 'paid' : 'partially_paid';

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          paymentsReceived: newPaid,
          remainingBalance: newRemaining,
          status: newStatus,
          paidDate: newRemaining === 0 ? new Date().toISOString() : inv.paidDate,
          timeline: [
            {
              id: 't-pay-' + Date.now(),
              type: 'payment_received',
              title: `Payment Received ($${amount.toLocaleString()})`,
              description: `Settled via ${method}${note ? ` • ${note}` : ''}`,
              timestamp: 'Just now'
            },
            ...inv.timeline
          ]
        };
      }
      return inv;
    }));

    showToast({
      title: 'Payment Logged!',
      description: `$${amount.toLocaleString()} settled via ${method}`,
      type: 'success'
    });
  };

  const sendInvoiceReminder = (invoiceId: string, customSubject?: string, customBody?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          timeline: [
            {
              id: 't-rem-' + Date.now(),
              type: 'reminder_sent',
              title: customSubject || 'Payment Reminder Dispatched',
              description: customBody ? `Draft: "${customBody.substring(0, 60)}..."` : 'Automated reminder dispatched.',
              timestamp: 'Just now'
            },
            ...inv.timeline
          ]
        };
      }
      return inv;
    }));

    showToast({ title: 'Reminder Dispatched', type: 'success' });
  };

  // ==========================================
  // COPILOT RECOMMENDATIONS
  // ==========================================
  const approveRecommendation = async (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r));
    showToast({ title: 'Recommendation Approved & Dispatched', type: 'success' });
  };

  const dismissRecommendation = async (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    showToast({ title: 'Recommendation Dismissed', type: 'info' });
  };

  const generateFollowUpContent = (invoiceId: string, tone: 'gentle' | 'professional' | 'firm' | 'urgent', channel: 'email' | 'sms' | 'whatsapp') => {
    const inv = invoices.find(i => i.id === invoiceId) || invoices[0];
    const customer = inv?.customerName || 'Customer';
    const amountStr = `$${inv?.remainingBalance?.toLocaleString() || '0.00'}`;

    if (tone === 'gentle') {
      return {
        subject: `Gentle check-in regarding statement (${amountStr})`,
        body: `Hi ${customer},\n\nWe wanted to share a friendly check-in on the remaining balance of ${amountStr} for your recent service.\n\nPlease let us know if you need any assistance!\n\nBest regards,\n${profile.name}`
      };
    }

    return {
      subject: `Service Statement — ${amountStr} Outstanding`,
      body: `Dear ${customer},\n\nPlease find your service statement for the balance of ${amountStr}.\n\nYou can review details and settle securely online:\nhttps://ventrexs.com/pay/${inv?.id || 'demo'}\n\nThank you,\n${profile.businessName}`
    };
  };

  // ==========================================
  // NOTIFICATION ACTIONS
  // ==========================================
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast({ title: 'All notifications marked as read', type: 'info' });
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast({ title: 'Notifications cleared', type: 'info' });
  };

  // ==========================================
  // PROFILE, SETTINGS & ONBOARDING
  // ==========================================
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    showToast({ title: 'Profile Updated', type: 'success' });
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    showToast({ title: 'Settings Saved', type: 'success' });
  };

  const updateBusinessProfile = async (updates: Partial<ServiceBusinessProfile>) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await updateBusinessProfileAction(activeBusinessId, {
          name: updates.name,
          industry: updates.industry,
          phone: updates.phone,
          email: updates.email,
          website: updates.website,
          address: updates.address,
          service_areas: updates.serviceAreas,
          services: updates.services,
          business_hours: updates.businessHours,
          timezone: updates.timezone,
          about: updates.about,
        });
      } catch (err) {
        console.warn('Server update business profile error:', err);
      }
    }

    setBusinessProfile(prev => ({ ...prev, ...updates }));
    setProfile(prev => ({
      ...prev,
      businessName: updates.name || prev.businessName,
      phone: updates.phone || prev.phone,
      address: updates.address || prev.address,
    }));
    setSettings(prev => ({
      ...prev,
      businessName: updates.name || prev.businessName,
      businessEmail: updates.email || prev.businessEmail,
      industry: updates.industry || prev.industry,
      phone: updates.phone || prev.phone,
      website: updates.website || prev.website,
      address: updates.address || prev.address,
      serviceAreas: updates.serviceAreas || prev.serviceAreas,
      services: updates.services || prev.services,
      businessHours: updates.businessHours || prev.businessHours,
      timezone: updates.timezone || prev.timezone,
      about: updates.about || prev.about,
    }));

    showToast({ title: 'Business Profile Updated', type: 'success' });
  };

  const completeOnboarding = async (data: Partial<ServiceBusinessProfile>) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await completeOnboardingAction(activeBusinessId, {
          name: data.name,
          industry: data.industry,
          phone: data.phone,
          email: data.email,
          website: data.website,
          address: data.address,
          service_areas: data.serviceAreas,
          services: data.services,
          business_hours: data.businessHours,
          timezone: data.timezone,
          about: data.about,
        });
      } catch (err) {
        console.warn('Server complete onboarding error:', err);
      }
    }

    setBusinessProfile(prev => ({
      ...prev,
      ...data,
      onboardingCompleted: true,
    }));

    setProfile(prev => ({
      ...prev,
      businessName: data.name || prev.businessName,
      phone: data.phone || prev.phone,
      address: data.address || prev.address,
      businessType: data.industry || prev.businessType,
    }));

    setSettings(prev => ({
      ...prev,
      businessName: data.name || prev.businessName,
      businessEmail: data.email || prev.businessEmail,
      industry: data.industry || prev.industry,
      phone: data.phone || prev.phone,
      website: data.website || prev.website,
      address: data.address || prev.address,
      serviceAreas: data.serviceAreas || prev.serviceAreas,
      services: data.services || prev.services,
      businessHours: data.businessHours || prev.businessHours,
      timezone: data.timezone || prev.timezone,
      onboardingCompleted: true,
    }));

    showToast({
      title: 'Workspace Configured!',
      description: 'Your Ventrexs Service Operating System is active and ready.',
      type: 'success',
    });
  };

  // ==========================================
  // AI RECEPTIONIST ACTIONS & HANDLERS
  // ==========================================
  const updateReceptionistSettings = async (updates: Partial<ReceptionistSettings>): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await updateReceptionistSettingsAction(activeBusinessId, updates);
        if (res.success && res.data) {
          setReceptionistSettings(res.data);
          showToast({ title: 'Receptionist settings saved', type: 'success' });
          return true;
        }
      } catch (err) {
        console.warn('Server update receptionist settings error:', err);
      }
    }

    setReceptionistSettings(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
    showToast({ title: 'Receptionist settings updated', type: 'success' });
    return true;
  };

  const saveReceptionistService = async (svc: Partial<ReceptionistService>): Promise<ReceptionistService | null> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await saveReceptionistServiceAction(activeBusinessId, svc);
        if (res.success && res.data) {
          setReceptionistServices(prev => {
            const exists = prev.some(s => s.id === res.data!.id);
            if (exists) {
              return prev.map(s => s.id === res.data!.id ? res.data! : s);
            }
            return [...prev, res.data!];
          });
          showToast({ title: 'Service knowledge saved', type: 'success' });
          return res.data;
        }
      } catch (err) {
        console.warn('Server save service error:', err);
      }
    }

    const saved: ReceptionistService = {
      id: svc.id || 'svc-' + Date.now(),
      businessId: activeBusinessId,
      name: svc.name || 'General Service',
      category: svc.category || 'General',
      description: svc.description || '',
      typicalDurationMinutes: svc.typicalDurationMinutes || 60,
      emergencyAvailable: !!svc.emergencyAvailable,
      bookingEligible: svc.bookingEligible !== undefined ? svc.bookingEligible : true,
      basePrice: svc.basePrice || 0,
      qualificationQuestions: svc.qualificationQuestions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReceptionistServices(prev => {
      const exists = prev.some(s => s.id === saved.id);
      if (exists) {
        return prev.map(s => s.id === saved.id ? saved : s);
      }
      return [...prev, saved];
    });

    showToast({ title: 'Service knowledge saved', type: 'success' });
    return saved;
  };

  const deleteReceptionistService = async (serviceId: string): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await deleteReceptionistServiceAction(activeBusinessId, serviceId);
      } catch (err) {
        console.warn('Server delete service error:', err);
      }
    }

    setReceptionistServices(prev => prev.filter(s => s.id !== serviceId));
    showToast({ title: 'Service removed', type: 'info' });
    return true;
  };

  const sendReceptionistMessage = async (params: {
    conversationId?: string;
    message: string;
    channel?: ReceptionistChannel;
  }) => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await processReceptionistMessageAction({
          businessId: activeBusinessId,
          conversationId: params.conversationId,
          messageText: params.message,
          channel: params.channel || 'WEB_CHAT',
        });
        if (res.success && res.data) {
          const convId = res.data.conversationId;
          const userMsg: ReceptionistMessage = {
            id: 'msg-u-' + Date.now(),
            conversationId: convId,
            senderType: 'CUSTOMER',
            content: params.message,
            createdAt: 'Just now',
          };
          const aiMsg: ReceptionistMessage = {
            id: 'msg-a-' + Date.now(),
            conversationId: convId,
            senderType: 'AI',
            content: res.data.replyText,
            structuredPayload: {
              detected_intent: res.data.detectedIntent,
              confidence: res.data.confidence,
              extracted_info: res.data.extractedInfo,
            },
            createdAt: 'Just now',
          };

          setReceptionistConversations(prev => {
            const existing = prev.find(c => c.id === convId);
            if (existing) {
              return prev.map(c => {
                if (c.id === convId) {
                  return {
                    ...c,
                    state: res.data!.state,
                    detectedIntent: res.data!.detectedIntent as any,
                    customerName: res.data!.extractedInfo.name || c.customerName,
                    customerPhone: res.data!.extractedInfo.phone || c.customerPhone,
                    customerEmail: res.data!.extractedInfo.email || c.customerEmail,
                    serviceRequested: res.data!.extractedInfo.serviceRequested || c.serviceRequested,
                    handoffRequired: res.data!.handoffRequired,
                    leadId: res.data!.leadId || c.leadId,
                    messages: [...(c.messages || []), userMsg, aiMsg],
                  };
                }
                return c;
              });
            }
            return [{
              id: convId,
              businessId: activeBusinessId,
              channel: params.channel || 'WEB_CHAT',
              state: res.data!.state,
              detectedIntent: res.data!.detectedIntent as any,
              customerName: res.data!.extractedInfo.name,
              customerPhone: res.data!.extractedInfo.phone,
              customerEmail: res.data!.extractedInfo.email,
              serviceRequested: res.data!.extractedInfo.serviceRequested,
              urgency: (res.data!.extractedInfo.urgency as any) || 'medium',
              handoffRequired: res.data!.handoffRequired,
              leadId: res.data!.leadId,
              createdAt: 'Just now',
              messages: [userMsg, aiMsg],
            }, ...prev];
          });

          return {
            replyText: res.data.replyText,
            conversationId: convId,
            state: res.data.state,
            handoffRequired: res.data.handoffRequired,
            suggestedSlots: res.data.suggestedSlots,
            detectedIntent: res.data.detectedIntent,
            leadId: res.data.leadId,
          };
        }
      } catch (err) {
        console.warn('Server process message error:', err);
      }
    }

    // Local / Demo Engine execution
    const convId = params.conversationId || 'conv-' + Date.now();
    const existingConv = receptionistConversations.find(c => c.id === convId) || {
      id: convId,
      businessId: activeBusinessId,
      channel: params.channel || 'WEB_CHAT',
      state: 'NEW' as ConversationState,
      urgency: 'medium' as const,
      handoffRequired: false,
      createdAt: 'Just now',
      messages: [],
    };

    const engineResult = processReceptionistMessage({
      conversation: existingConv,
      incomingMessage: params.message,
      settings: receptionistSettings,
      services: receptionistServices,
      existingAppointments: appointments,
    });

    const userMsg: ReceptionistMessage = {
      id: 'msg-u-' + Date.now(),
      conversationId: convId,
      senderType: 'CUSTOMER',
      content: params.message,
      createdAt: 'Just now',
    };

    const aiMsg: ReceptionistMessage = {
      id: 'msg-a-' + Date.now(),
      conversationId: convId,
      senderType: 'AI',
      content: engineResult.replyText,
      structuredPayload: {
        detected_intent: engineResult.detectedIntent,
        confidence: engineResult.confidence,
        extracted_info: engineResult.extractedInfo,
      },
      createdAt: 'Just now',
    };

    let newLeadId: string | undefined = existingConv.leadId;

    if (
      (engineResult.requestedAction === 'CREATE_LEAD' || engineResult.state === 'READY_TO_BOOK') &&
      engineResult.extractedInfo.name &&
      !newLeadId
    ) {
      const createdLead = await addLead({
        name: engineResult.extractedInfo.name,
        company: engineResult.extractedInfo.company,
        phone: engineResult.extractedInfo.phone || '',
        email: engineResult.extractedInfo.email || '',
        source: 'Website',
        serviceRequested: engineResult.extractedInfo.serviceRequested || 'General Service',
        status: engineResult.state === 'READY_TO_BOOK' ? 'QUALIFIED' : 'NEW',
        priority: engineResult.extractedInfo.urgency || 'medium',
        estimatedValue: 0,
        notes: `Ingested via AI Receptionist (${params.channel || 'WEB_CHAT'})`,
      });
      if (createdLead) {
        newLeadId = createdLead.id;
      }
    }

    const updatedConv: ReceptionistConversation = {
      ...existingConv,
      state: engineResult.state,
      detectedIntent: engineResult.detectedIntent,
      intentConfidence: engineResult.confidence,
      customerName: engineResult.extractedInfo.name || existingConv.customerName,
      customerPhone: engineResult.extractedInfo.phone || existingConv.customerPhone,
      customerEmail: engineResult.extractedInfo.email || existingConv.customerEmail,
      serviceRequested: engineResult.extractedInfo.serviceRequested || existingConv.serviceRequested,
      urgency: engineResult.extractedInfo.urgency || existingConv.urgency,
      handoffRequired: engineResult.requestedAction === 'TRIGGER_HANDOFF' || existingConv.handoffRequired,
      handoffReason: engineResult.handoffReason || existingConv.handoffReason,
      leadId: newLeadId,
      messages: [...(existingConv.messages || []), userMsg, aiMsg],
    };

    setReceptionistConversations(prev => {
      const exists = prev.some(c => c.id === convId);
      if (exists) {
        return prev.map(c => c.id === convId ? updatedConv : c);
      }
      return [updatedConv, ...prev];
    });

    return {
      replyText: engineResult.replyText,
      conversationId: convId,
      state: engineResult.state,
      handoffRequired: engineResult.requestedAction === 'TRIGGER_HANDOFF',
      suggestedSlots: engineResult.suggestedSlots,
      detectedIntent: engineResult.detectedIntent,
      leadId: newLeadId,
    };
  };

  const triggerHandoff = async (conversationId: string, reason: string): Promise<boolean> => {
    const activeBusinessId = businessId || '11111111-1111-1111-1111-111111111111';
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        await triggerHumanHandoffAction(activeBusinessId, conversationId, reason);
      } catch (err) {
        console.warn('Server trigger handoff error:', err);
      }
    }

    setReceptionistConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          state: 'HANDOFF_REQUIRED',
          handoffRequired: true,
          handoffReason: reason,
          messages: [
            ...(c.messages || []),
            {
              id: 'msg-sys-' + Date.now(),
              conversationId,
              senderType: 'SYSTEM',
              content: `Human handoff triggered: ${reason}`,
              createdAt: 'Just now',
            }
          ]
        };
      }
      return c;
    }));

    showToast({ title: 'Human handoff activated', description: reason, type: 'info' });
    return true;
  };

  const resolveHandoff = async (conversationId: string): Promise<boolean> => {
    setReceptionistConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          state: 'COMPLETED',
          handoffRequired: false,
        };
      }
      return c;
    }));

    showToast({ title: 'Conversation marked resolved', type: 'success' });
    return true;
  };

  // ==========================================
  // CALCULATED METRICS
  // ==========================================
  const totalOutstanding = useMemo(() => {
    return invoices
      .filter(i => i.status === 'overdue' || i.status === 'due' || i.status === 'partially_paid' || i.status === 'sent')
      .reduce((sum, i) => sum + i.remainingBalance, 0);
  }, [invoices]);

  const overdueAmount = useMemo(() => {
    return invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.remainingBalance, 0);
  }, [invoices]);

  const dueThisWeek = useMemo(() => {
    return invoices
      .filter(i => i.status === 'due')
      .reduce((sum, i) => sum + i.remainingBalance, 0);
  }, [invoices]);

  const collectedMtd = useMemo(() => {
    return invoices
      .reduce((sum, i) => sum + (i.paymentsReceived || 0), 0);
  }, [invoices]);

  const newLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'NEW').length;
  }, [leads]);

  const contactedLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'CONTACTED').length;
  }, [leads]);

  const qualifiedLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'QUALIFIED').length;
  }, [leads]);

  const estimateSentCount = useMemo(() => {
    return leads.filter(l => l.status === 'ESTIMATE_SENT').length;
  }, [leads]);

  const bookedLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'BOOKED').length;
  }, [leads]);

  const wonLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'WON').length;
  }, [leads]);

  const lostLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'LOST').length;
  }, [leads]);

  const pipelineValue = useMemo(() => {
    return leads
      .filter(l => l.status !== 'LOST' && l.status !== 'WON')
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  }, [leads]);

  const conversionRate = useMemo(() => {
    if (leads.length === 0) return 0;
    const wonCount = leads.filter(l => l.status === 'WON').length;
    return Math.round((wonCount / leads.length) * 100);
  }, [leads]);

  const averageLeadScore = useMemo(() => {
    if (leads.length === 0) return 0;
    const total = leads.reduce((sum, l) => sum + (l.score || calculateLeadScore(l).totalScore), 0);
    return Math.round(total / leads.length);
  }, [leads]);

  const activeJobsCount = useMemo(() => {
    return jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'PENDING').length;
  }, [jobs]);

  const upcomingAppointmentsCount = useMemo(() => {
    return appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length;
  }, [appointments]);

  const activeConversationsCount = useMemo(() => {
    return receptionistConversations.filter(c => c.state !== 'COMPLETED').length;
  }, [receptionistConversations]);

  const todayConversationsCount = useMemo(() => {
    return receptionistConversations.length;
  }, [receptionistConversations]);

  const receptionistHandoffsCount = useMemo(() => {
    return receptionistConversations.filter(c => c.state === 'HANDOFF_REQUIRED' || c.handoffRequired).length;
  }, [receptionistConversations]);

  const receptionistLeadsCreatedCount = useMemo(() => {
    return receptionistConversations.filter(c => !!c.leadId).length;
  }, [receptionistConversations]);

  const receptionistBookingsCount = useMemo(() => {
    return receptionistConversations.filter(c => c.state === 'BOOKED' || !!c.appointmentId).length;
  }, [receptionistConversations]);

  // Phase 4 — Multi-Channel Communication Handlers
  const sendCommunication = useCallback(async (req: any): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (!isDemo) {
        const result = await sendCommunicationAction({ ...req, businessId: activeBizId });
        if (!result.success) throw new Error(result.error);
      }

      const newId = 'comm-' + Date.now();
      const isApproval = req.requiresApproval === true;
      const newComm: CommunicationItem = {
        id: newId,
        businessId: activeBizId,
        customerId: req.customerId || null,
        customerName: req.recipientName || 'Customer',
        customerEmail: req.recipientEmail,
        customerPhone: req.recipientPhone,
        leadId: req.leadId || null,
        invoiceId: req.invoiceId || null,
        appointmentId: req.appointmentId || null,
        jobId: req.jobId || null,
        templateId: req.templateId || null,
        channel: req.channel,
        subject: req.subject || null,
        message: req.message,
        tone: req.tone || 'professional',
        status: isApproval ? 'draft' : 'delivered',
        deliveryStatus: isApproval ? 'pending' : 'delivered',
        approvalStatus: isApproval ? 'pending_approval' : 'auto_approved',
        requiresApproval: isApproval,
        providerMessageId: `sim_${req.channel}_${Date.now().toString(36)}`,
        sentAt: isApproval ? null : 'Just now',
        createdAt: 'Just now',
      };

      setCommunications(prev => [newComm, ...prev]);
      setCommunicationStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        sent: isApproval ? prev.sent : prev.sent + 1,
        delivered: isApproval ? prev.delivered : prev.delivered + 1,
        pending: isApproval ? prev.pending + 1 : prev.pending,
        emailCount: req.channel === 'email' ? prev.emailCount + 1 : prev.emailCount,
        smsCount: req.channel === 'sms' ? prev.smsCount + 1 : prev.smsCount,
        whatsappCount: req.channel === 'whatsapp' ? prev.whatsappCount + 1 : prev.whatsappCount,
      }));

      showToast({
        title: isApproval ? 'Message Drafted for Approval' : `${req.channel.toUpperCase()} Dispatched`,
        description: isApproval ? 'Your AI draft is waiting in the Approvals queue.' : `Successfully sent to ${req.recipientEmail || req.recipientPhone || 'recipient'}.`,
        type: 'success',
      });

      return { success: true, data: newComm };
    } catch (err: any) {
      showToast({
        title: 'Communication Failed',
        description: err?.message || 'Failed to dispatch message',
        type: 'error',
      });
      return { success: false, error: err?.message || 'Send error' };
    }
  }, [businessId, user, showToast]);

  const approveCommunication = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (!isDemo) {
        const result = await approveCommunicationAction(id, activeBizId);
        if (!result.success) throw new Error(result.error);
      }

      setCommunications(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, status: 'delivered', deliveryStatus: 'delivered', approvalStatus: 'approved', sentAt: 'Just now' }
            : c
        )
      );

      setCommunicationStats(prev => ({
        ...prev,
        sent: prev.sent + 1,
        delivered: prev.delivered + 1,
        pending: Math.max(0, prev.pending - 1),
      }));

      showToast({
        title: 'Draft Approved & Sent',
        description: 'Communication dispatched through active carrier.',
        type: 'success',
      });
      return { success: true };
    } catch (err: any) {
      showToast({ title: 'Approval Failed', description: err?.message, type: 'error' });
      return { success: false, error: err?.message };
    }
  }, [businessId, user, showToast]);

  const rejectCommunication = useCallback(async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (!isDemo) {
        const result = await rejectCommunicationAction(id, activeBizId, reason);
        if (!result.success) throw new Error(result.error);
      }

      setCommunications(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, status: 'cancelled', approvalStatus: 'rejected', rejectionReason: reason }
            : c
        )
      );

      setCommunicationStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
      }));

      showToast({
        title: 'Draft Rejected',
        description: `Reason: ${reason}`,
        type: 'info',
      });
      return { success: true };
    } catch (err: any) {
      showToast({ title: 'Rejection Failed', description: err?.message, type: 'error' });
      return { success: false, error: err?.message };
    }
  }, [businessId, user, showToast]);

  const saveCommunicationTemplate = useCallback(async (template: Partial<CommunicationTemplate>): Promise<{ success: boolean; error?: string }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (template.id && !template.id.startsWith('tmpl-new-')) {
        if (!isDemo) {
          await updateCommunicationTemplateAction(template.id, activeBizId, {
            name: template.name,
            subject_template: template.subjectTemplate,
            body_template: template.bodyTemplate || '',
            variables: template.variables,
          });
        }
        setCommunicationTemplates(prev =>
          prev.map(t => (t.id === template.id ? { ...t, ...template, updatedAt: new Date().toISOString() } : t))
        );
      } else {
        const newId = 'tmpl-' + Date.now();
        if (!isDemo) {
          await createCommunicationTemplateAction({
            business_id: activeBizId,
            name: template.name || 'Untitled Template',
            channel: template.channel || 'email',
            category: template.category || 'custom',
            subject_template: template.subjectTemplate,
            body_template: template.bodyTemplate || '',
            variables: template.variables,
          });
        }
        const created: CommunicationTemplate = {
          id: newId,
          businessId: activeBizId,
          name: template.name || 'Untitled Template',
          channel: template.channel || 'email',
          category: template.category || 'custom',
          subjectTemplate: template.subjectTemplate,
          bodyTemplate: template.bodyTemplate || '',
          variables: template.variables || [],
          isSystem: false,
          createdAt: 'Just now',
          updatedAt: 'Just now',
        };
        setCommunicationTemplates(prev => [created, ...prev]);
      }

      showToast({ title: 'Template Saved', description: 'Communication template ready for use.', type: 'success' });
      return { success: true };
    } catch (err: any) {
      showToast({ title: 'Template Save Failed', description: err?.message, type: 'error' });
      return { success: false, error: err?.message };
    }
  }, [businessId, user, showToast]);

  const deleteCommunicationTemplate = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (!isDemo) {
        await deleteCommunicationTemplateAction(id, activeBizId);
      }
      setCommunicationTemplates(prev => prev.filter(t => t.id !== id));
      showToast({ title: 'Template Deleted', type: 'info' });
      return { success: true };
    } catch (err: any) {
      showToast({ title: 'Delete Failed', description: err?.message, type: 'error' });
      return { success: false, error: err?.message };
    }
  }, [businessId, user, showToast]);

  const updateCommunicationConsent = useCallback(async (params: { customerId?: string; leadId?: string; channel: CommChannel; optedIn: boolean }): Promise<{ success: boolean; error?: string }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (!isDemo) {
        await updateConsentAction({
          businessId: activeBizId,
          customerId: params.customerId,
          leadId: params.leadId,
          channel: params.channel,
          optedIn: params.optedIn,
        });
      }

      setCommunicationConsents(prev => {
        const existing = prev.find(c => c.customerId === params.customerId && c.channel === params.channel);
        if (existing) {
          return prev.map(c =>
            c.id === existing.id
              ? { ...c, optedIn: params.optedIn, optedOut: !params.optedIn, optedOutAt: !params.optedIn ? 'Just now' : null }
              : c
          );
        } else {
          return [
            ...prev,
            {
              id: 'consent-' + Date.now(),
              businessId: activeBizId,
              customerId: params.customerId,
              leadId: params.leadId,
              channel: params.channel,
              optedIn: params.optedIn,
              optedOut: !params.optedIn,
              createdAt: 'Just now',
            },
          ];
        }
      });

      showToast({
        title: params.optedIn ? 'Consent Recorded' : 'Opt-Out Recorded',
        description: `Updated ${params.channel.toUpperCase()} preference.`,
        type: 'success',
      });
      return { success: true };
    } catch (err: any) {
      showToast({ title: 'Consent Update Failed', description: err?.message, type: 'error' });
      return { success: false, error: err?.message };
    }
  }, [businessId, user, showToast]);

  const recordCommunicationOptOut = useCallback(async (params: { customerId?: string; leadId?: string; channel: CommChannel; reason?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const activeBizId = businessId || '11111111-1111-1111-1111-111111111111';
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !user;

      if (!isDemo) {
        await recordOptOutAction({
          businessId: activeBizId,
          customerId: params.customerId,
          leadId: params.leadId,
          channel: params.channel,
          reason: params.reason || 'Manual opt-out',
        });
      }

      setCommunicationConsents(prev =>
        prev.map(c =>
          c.customerId === params.customerId && c.channel === params.channel
            ? { ...c, optedIn: false, optedOut: true, optedOutAt: 'Just now', optOutReason: params.reason || 'Manual opt-out' }
            : c
        )
      );

      setCommunicationStats(prev => ({ ...prev, optOuts: prev.optOuts + 1 }));

      showToast({
        title: 'Global Opt-Out Recorded',
        description: `Blocked further ${params.channel.toUpperCase()} messaging.`,
        type: 'info',
      });
      return { success: true };
    } catch (err: any) {
      showToast({ title: 'Opt-Out Failed', description: err?.message, type: 'error' });
      return { success: false, error: err?.message };
    }
  }, [businessId, user, showToast]);

  const estimateStats: EstimateStats = useMemo(() => {
    const totalEstimates = estimates.length;
    const draft = estimates.filter(e => e.status === 'DRAFT').length;
    const sent = estimates.filter(e => e.status === 'SENT').length;
    const approved = estimates.filter(e => e.status === 'APPROVED').length;
    const rejected = estimates.filter(e => e.status === 'REJECTED').length;
    const approvedValue = estimates
      .filter(e => e.status === 'APPROVED')
      .reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    const pipelineValue = estimates
      .filter(e => e.status === 'DRAFT' || e.status === 'SENT' || e.status === 'VIEWED')
      .reduce((sum, e) => sum + (e.totalAmount || 0), 0);

    return {
      totalEstimates,
      draft,
      sent,
      approved,
      rejected,
      approvedValue,
      pipelineValue,
    };
  }, [estimates]);

  const jobStats: JobStats = useMemo(() => {
    const totalJobs = jobs.length;
    const newJobs = jobs.filter(j => j.status === 'NEW' || j.status === 'PENDING').length;
    const scheduled = jobs.filter(j => j.status === 'SCHEDULED' || j.status === 'DISPATCHED').length;
    const inProgress = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'ON_HOLD').length;
    const completed = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'INVOICED').length;
    const urgent = jobs.filter(j => j.priority === 'urgent' || j.priority === 'URGENT' || j.priority === 'high' || j.priority === 'HIGH').length;
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = jobs.filter(j => j.scheduledDate && j.scheduledDate.startsWith(today)).length;
    const totalValue = jobs.reduce((sum, j) => sum + (j.estimatedTotal || j.actualTotal || 0), 0);

    return {
      totalJobs,
      newJobs,
      scheduled,
      inProgress,
      completed,
      urgent,
      todayJobs,
      totalValue,
    };
  }, [jobs]);

  const reputationStats: ReputationStats = useMemo(() => {
    const totalRequests = reviewRequests.length;
    const sent = reviewRequests.filter(r => r.status === 'SENT' || r.status === 'DELIVERED' || r.status === 'OPENED' || r.status === 'COMPLETED').length;
    const delivered = reviewRequests.filter(r => r.status === 'DELIVERED' || r.status === 'OPENED' || r.status === 'COMPLETED').length;
    const completed = customerFeedback.length;

    const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
    const responseRate = sent > 0 ? Math.round((completed / sent) * 100) : 0;

    const totalRatingSum = customerFeedback.reduce((sum, f) => sum + (f.rating || 0), 0);
    const averageRating = customerFeedback.length > 0 ? Math.round((totalRatingSum / customerFeedback.length) * 10) / 10 : 0;

    const positiveCount = customerFeedback.filter(f => f.rating >= 4).length;
    const neutralCount = customerFeedback.filter(f => f.rating === 3).length;
    const negativeCount = customerFeedback.filter(f => f.rating <= 2).length;

    const pendingFollowUps = customerFeedback.filter(f => f.followUpStatus === 'NEW' || f.followUpStatus === 'IN_REVIEW' || f.followUpStatus === 'CONTACTED').length;
    const resolvedFollowUps = customerFeedback.filter(f => f.followUpStatus === 'RESOLVED' || f.followUpStatus === 'CLOSED').length;

    const ratingDistribution = {
      5: customerFeedback.filter(f => f.rating === 5).length,
      4: customerFeedback.filter(f => f.rating === 4).length,
      3: customerFeedback.filter(f => f.rating === 3).length,
      2: customerFeedback.filter(f => f.rating === 2).length,
      1: customerFeedback.filter(f => f.rating === 1).length,
    };

    const channelBreakdown = {
      email: {
        sent: reviewRequests.filter(r => r.channel === 'email' && r.status !== 'PENDING').length,
        completed: customerFeedback.filter(f => f.channel === 'email').length,
      },
      sms: {
        sent: reviewRequests.filter(r => r.channel === 'sms' && r.status !== 'PENDING').length,
        completed: customerFeedback.filter(f => f.channel === 'sms').length,
      },
      whatsapp: {
        sent: reviewRequests.filter(r => r.channel === 'whatsapp' && r.status !== 'PENDING').length,
        completed: customerFeedback.filter(f => f.channel === 'whatsapp').length,
      },
    };

    return {
      totalRequests,
      sent,
      delivered,
      completed,
      deliveryRate,
      responseRate,
      averageRating,
      positiveCount,
      neutralCount,
      negativeCount,
      pendingFollowUps,
      resolvedFollowUps,
      ratingDistribution,
      channelBreakdown,
    };
  }, [reviewRequests, customerFeedback]);

  const technicianMetrics: TechnicianReputationMetric[] = useMemo(() => {
    const techMap = new Map<string, {
      completedJobs: number;
      reviewRequests: number;
      responses: number;
      ratingSum: number;
      positiveCount: number;
      negativeCount: number;
    }>();

    // Map jobs
    jobs.forEach(j => {
      const tech = j.assignedTechName || j.technicianName;
      if (tech) {
        const curr = techMap.get(tech) || { completedJobs: 0, reviewRequests: 0, responses: 0, ratingSum: 0, positiveCount: 0, negativeCount: 0 };
        if (j.status === 'COMPLETED' || j.status === 'INVOICED') {
          curr.completedJobs += 1;
        }
        techMap.set(tech, curr);
      }
    });

    // Map review requests
    reviewRequests.forEach(r => {
      if (r.technicianName) {
        const curr = techMap.get(r.technicianName) || { completedJobs: 0, reviewRequests: 0, responses: 0, ratingSum: 0, positiveCount: 0, negativeCount: 0 };
        curr.reviewRequests += 1;
        techMap.set(r.technicianName, curr);
      }
    });

    // Map feedback
    customerFeedback.forEach(f => {
      if (f.technicianName) {
        const curr = techMap.get(f.technicianName) || { completedJobs: 0, reviewRequests: 0, responses: 0, ratingSum: 0, positiveCount: 0, negativeCount: 0 };
        curr.responses += 1;
        curr.ratingSum += f.rating;
        if (f.rating >= 4) curr.positiveCount += 1;
        if (f.rating <= 2) curr.negativeCount += 1;
        techMap.set(f.technicianName, curr);
      }
    });

    return Array.from(techMap.entries()).map(([technicianName, d]) => ({
      technicianName,
      completedJobs: d.completedJobs || d.reviewRequests,
      reviewRequests: d.reviewRequests,
      responses: d.responses,
      averageRating: d.responses > 0 ? Math.round((d.ratingSum / d.responses) * 10) / 10 : 5.0,
      positiveCount: d.positiveCount,
      negativeCount: d.negativeCount,
      responseRate: d.reviewRequests > 0 ? Math.round((d.responses / d.reviewRequests) * 100) : 0,
    }));
  }, [jobs, reviewRequests, customerFeedback]);

  return (
    <AppContext.Provider value={{
      user,
      session,
      businessId,
      isOnline,
      isLoading,
      signIn: async () => ({ success: true }),
      signUp: async () => ({ success: true }),
      signOut: async () => {},
      deleteAccount: async () => ({ success: true }),
      invoices,
      customers,
      leads,
      appointments,
      jobs,
      recommendations,
      notifications,
      profile,
      settings,
      businessProfile,
      receptionistSettings,
      receptionistServices,
      receptionistConversations,
      adminStats,
      toasts,
      addLead,
      updateLead,
      updateLeadStatus,
      assignLead,
      addLeadActivity,
      addLeadNote,
      updateLeadNote,
      deleteLeadNote,
      bulkUpdateLeadStatus,
      bulkAssignLeads,
      bulkDeleteLeads,
      deleteLead,
      convertLeadToCustomer,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addJob,
      updateJob,
      deleteJob,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      recordPayment,
      sendInvoiceReminder,
      addCustomer,
      updateCustomer,
      approveRecommendation,
      dismissRecommendation,
      generateFollowUpContent,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications,
      updateProfile,
      updateSettings,
      updateBusinessProfile,
      completeOnboarding,
      updateReceptionistSettings,
      saveReceptionistService,
      deleteReceptionistService,
      sendReceptionistMessage,
      triggerHandoff,
      resolveHandoff,
      showToast,
      dismissToast,
      totalOutstanding,
      overdueAmount,
      dueThisWeek,
      collectedMtd,
      newLeadsCount,
      contactedLeadsCount,
      qualifiedLeadsCount,
      estimateSentCount,
      bookedLeadsCount,
      wonLeadsCount,
      lostLeadsCount,
      pipelineValue,
      conversionRate,
      averageLeadScore,
      activeJobsCount,
      upcomingAppointmentsCount,
      activeConversationsCount,
      todayConversationsCount,
      receptionistHandoffsCount,
      receptionistLeadsCreatedCount,
      receptionistBookingsCount,
      communications,
      communicationTemplates,
      communicationConsents,
      communicationStats,
      sendCommunication,
      approveCommunication,
      rejectCommunication,
      saveCommunicationTemplate,
      deleteCommunicationTemplate,
      updateCommunicationConsent,
      recordCommunicationOptOut,
      estimates,
      estimateStats,
      jobStats,
      addEstimate,
      updateEstimate,
      sendEstimate,
      approveEstimate,
      rejectEstimate,
      convertEstimateToInvoice,
      deleteEstimate,
      assignJobTechnician,
      updateJobStatus,
      addJobActivity,
      reviewSettings,
      reviewRequests,
      customerFeedback,
      reputationStats,
      technicianMetrics,
      updateReviewSettings,
      createReviewRequest,
      sendReviewRequest,
      submitCustomerFeedback,
      updateFeedbackFollowUp,
      // Phase 7
      subscription,
      usageRecords,
      subscriptionEvents,
      createCheckoutSession: async (plan: PlanKey, interval: BillingInterval) => {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
          setSubscription(prev => ({
            ...prev,
            plan,
            billingCycle: interval,
            status: 'active',
            priceAmount: plan === 'Starter' ? 19 : plan === 'Professional' ? 49 : 199,
          }));
          setProfile(prev => ({
            ...prev,
            plan,
            billingCycle: interval,
          }));
          showToast({
            title: `Subscribed to ${plan} Plan!`,
            description: `Simulated checkout completed successfully (${interval}).`,
            type: 'success',
          });
          return {
            sessionId: `demo_sess_${Date.now()}`,
            checkoutUrl: `/settings/billing?status=success&plan=${plan}`,
          };
        }

        if (!businessId) {
          showToast({ title: 'Business context required', type: 'error' });
          return null;
        }

        try {
          const res = await createSubscriptionCheckoutAction({
            businessId,
            plan,
            interval,
          });

          if (!res.success || !res.checkoutUrl) {
            showToast({ title: 'Checkout Failed', description: res.error, type: 'error' });
            return null;
          }

          return { sessionId: res.sessionId || '', checkoutUrl: res.checkoutUrl };
        } catch (err: any) {
          showToast({ title: 'Checkout Error', description: err.message, type: 'error' });
          return null;
        }
      },
      createCustomerPortalSession: async () => {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
          showToast({
            title: 'Stripe Customer Portal (Demo)',
            description: 'In production mode, this opens your Stripe Customer Billing Portal for invoice history and payment methods.',
            type: 'info',
          });
          return null;
        }

        if (!businessId) return null;

        try {
          const res = await createCustomerPortalSessionAction({ businessId });
          if (!res.success || !res.portalUrl) {
            showToast({ title: 'Portal Error', description: res.error, type: 'error' });
            return null;
          }
          window.location.href = res.portalUrl;
          return res.portalUrl;
        } catch (err: any) {
          showToast({ title: 'Portal Error', description: err.message, type: 'error' });
          return null;
        }
      },
      cancelSubscription: async (cancelAtPeriodEnd = true) => {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
          setSubscription(prev => ({
            ...prev,
            cancelAtPeriodEnd,
            status: cancelAtPeriodEnd ? prev.status : 'cancelled',
          }));
          showToast({
            title: cancelAtPeriodEnd ? 'Cancellation Scheduled' : 'Subscription Cancelled',
            description: cancelAtPeriodEnd ? 'Your subscription will remain active until the end of the billing period.' : 'Subscription immediately ended.',
            type: 'info',
          });
          return true;
        }

        if (!businessId) return false;

        try {
          const res = await cancelSubscriptionAction({ businessId, cancelAtPeriodEnd });
          if (!res.success) {
            showToast({ title: 'Cancellation Failed', description: res.error, type: 'error' });
            return false;
          }
          setSubscription(prev => ({
            ...prev,
            cancelAtPeriodEnd,
            status: ((res as any).status as any) || (cancelAtPeriodEnd ? prev.status : 'cancelled'),
          }));
          showToast({ title: 'Subscription cancellation processed', type: 'info' });
          return true;
        } catch (err: any) {
          showToast({ title: 'Cancellation Error', description: err.message, type: 'error' });
          return false;
        }
      },
      reactivateSubscription: async () => {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
          setSubscription(prev => ({
            ...prev,
            cancelAtPeriodEnd: false,
            status: 'active',
          }));
          showToast({
            title: 'Subscription Reactivated',
            description: 'Your plan will automatically renew on schedule.',
            type: 'success',
          });
          return true;
        }

        if (!businessId) return false;

        try {
          const res = await reactivateSubscriptionAction({ businessId });
          if (!res.success) {
            showToast({ title: 'Reactivation Failed', description: res.error, type: 'error' });
            return false;
          }
          setSubscription(prev => ({
            ...prev,
            cancelAtPeriodEnd: false,
            status: 'active',
          }));
          showToast({ title: 'Subscription reactivated successfully!', type: 'success' });
          return true;
        } catch (err: any) {
          showToast({ title: 'Reactivation Error', description: err.message, type: 'error' });
          return false;
        }
      },
      recordUsageMetric: (metric: UsageMetric, amount = 1) => {
        setUsageRecords(prev => {
          const current = prev[metric] || { currentUsage: 0, limit: 500, remaining: 500, isUnlimited: false, percentageUsed: 0 };
          const newCount = current.currentUsage + amount;
          const remaining = current.isUnlimited ? 999999 : Math.max(0, current.limit - newCount);
          const percentageUsed = current.isUnlimited ? 0 : Math.min(100, Math.round((newCount / current.limit) * 100));
          return {
            ...prev,
            [metric]: {
              ...current,
              currentUsage: newCount,
              remaining,
              percentageUsed,
            },
          };
        });
      },
      checkEntitlement: (feature: string): boolean => {
        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
          return false;
        }
        if (feature === 'multiUser') return subscription.plan !== 'Starter';
        if (feature === 'whatsapp') return subscription.plan !== 'Starter';
        if (feature === 'advancedReports') return subscription.plan !== 'Starter';
        if (feature === 'apiAccess') return subscription.plan === 'Enterprise';
        return true;
      },
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

