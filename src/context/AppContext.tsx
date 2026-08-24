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
  PaymentMethod
} from '@/types';
import { 
  initialInvoices, 
  initialCustomers, 
  initialRecommendations, 
  initialNotifications, 
  initialProfile, 
  initialSettings, 
  initialAdminStats 
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
} from '@/app/actions';
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

  // Data State
  invoices: Invoice[];
  customers: Customer[];
  recommendations: CopilotRecommendation[];
  notifications: NotificationItem[];
  profile: UserProfile;
  settings: BusinessSettings;
  adminStats: AdminStats;
  toasts: ToastMessage[];
  
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
  
  // User/Settings actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<BusinessSettings>) => void;
  
  // Toast notifications
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  
  // Calculated stats (Strict Halal Integrity: original - paid, no interest/riba)
  totalOutstanding: number;
  overdueAmount: number;
  dueThisWeek: number;
  collectedMtd: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'paypilot_state_v2_halal';

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
  const [recommendations, setRecommendations] = useState<CopilotRecommendation[]>(initialRecommendations);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
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
        if (parsed.recommendations) setRecommendations(parsed.recommendations);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.settings) setSettings(parsed.settings);
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
        recommendations,
        notifications,
        profile,
        settings,
      }));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }, [isInitialized, invoices, customers, recommendations, notifications, profile, settings]);

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

      // In explicit demo mode, simulate login with demo profile
      console.warn('Supabase signIn demo fallback:', errMsg);
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

      showToast({
        title: 'Account Created Successfully!',
        description: 'Your business workspace is initialized.',
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

      console.warn('Supabase signUp demo fallback:', errMsg);
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

      showToast({
        title: 'Workspace Initialized (Demo)',
        description: `Welcome to PayPilot AI, ${params.name}!`,
        type: 'success',
      });
      setIsLoading(false);
      return { success: true };
    }
  };

  const signOut = async () => {
    try {
      await services.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    setSession(null);
    showToast({
      title: 'Signed Out',
      description: 'You have been signed out of PayPilot AI.',
      type: 'info',
    });
  };

  // Add Invoice (Strict Halal Rule: remaining_balance = original_amount - payments_received)
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'timeline' | 'remainingBalance' | 'paymentsReceived' | 'originalAmountDue' | 'daysOverdue'> & { id?: string; originalAmountDue?: number; paymentsReceived?: number; remainingBalance?: number; daysOverdue?: number }): Promise<Invoice | null> => {
    const origAmount = invoiceData.originalAmountDue ?? invoiceData.totalAmount;
    const paidSoFar = invoiceData.paymentsReceived ?? 0;
    const remaining = origAmount - paidSoFar;
    
    // Calculate days overdue
    const dueTime = new Date(invoiceData.dueDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)));

    // In production with authenticated session, route through Server Action first
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createInvoiceAction({
          business_id: businessId,
          customer_id: invoiceData.customerId,
          invoice_number: invoiceData.number,
          original_amount: origAmount,
          subtotal: invoiceData.subtotal ?? origAmount,
          currency: 'USD',
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          notes: invoiceData.notes,
          items: invoiceData.items?.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            line_total: item.amount,
          })) || [],
        });

        if (!res.success || !res.data) {
          showToast({
            title: 'Failed to Create Invoice',
            description: res.error || 'Server rejected invoice creation.',
            type: 'error'
          });
          return null;
        }

        const serverInvoice: Invoice = {
          ...invoiceData,
          id: res.data.id,
          number: res.data.invoice_number,
          originalAmountDue: Number(res.data.original_amount),
          paymentsReceived: Number(res.data.amount_paid),
          remainingBalance: Number(res.data.remaining_balance),
          daysOverdue: invoiceData.status === 'overdue' ? (invoiceData.daysOverdue ?? diffDays) : 0,
          timeline: [
            {
              id: 't-' + Date.now(),
              type: 'created',
              title: 'Invoice Created',
              description: `Created for ${invoiceData.customerName}`,
              timestamp: 'Just now'
            },
            ...(invoiceData.status !== 'draft' ? [{
              id: 't-sent-' + Date.now(),
              type: 'sent' as const,
              title: 'Sent to Customer',
              description: `Delivered to ${invoiceData.customerEmail}`,
              timestamp: 'Just now'
            }] : [])
          ]
        };

        setInvoices(prev => [serverInvoice, ...prev]);

        // Update customer stats
        setCustomers(prev => prev.map(c => {
          if (c.id === invoiceData.customerId || c.name.toLowerCase() === serverInvoice.customerName.toLowerCase() || c.company.toLowerCase() === serverInvoice.customerCompany.toLowerCase()) {
            const isOverdue = serverInvoice.status === 'overdue';
            const isDue = serverInvoice.status === 'due';
            const unpaid = isOverdue || isDue ? serverInvoice.remainingBalance : 0;
            return {
              ...c,
              totalOutstanding: c.totalOutstanding + unpaid,
              outstandingReceivables: c.outstandingReceivables + unpaid,
              overdueCount: isOverdue ? c.overdueCount + 1 : c.overdueCount,
              activeInvoicesCount: c.activeInvoicesCount + 1
            };
          }
          return c;
        }));

        showToast({
          title: `Invoice ${serverInvoice.number} Created`,
          description: `Saved as ${serverInvoice.status.toUpperCase()} for $${serverInvoice.totalAmount.toLocaleString()}`,
          type: 'success'
        });

        return serverInvoice;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Server error creating invoice';
        showToast({
          title: 'Invoice Creation Error',
          description: errMsg,
          type: 'error'
        });
        return null;
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
        },
        ...(invoiceData.status !== 'draft' ? [{
          id: 't-sent-' + Date.now(),
          type: 'sent' as const,
          title: 'Sent to Customer',
          description: `Delivered to ${invoiceData.customerEmail}`,
          timestamp: 'Just now'
        }] : [])
      ]
    };

    setInvoices(prev => [newInvoice, ...prev]);

    setCustomers(prev => prev.map(c => {
      if (c.name.toLowerCase() === newInvoice.customerName.toLowerCase() || c.company.toLowerCase() === newInvoice.customerCompany.toLowerCase()) {
        const isOverdue = newInvoice.status === 'overdue';
        const isDue = newInvoice.status === 'due';
        const unpaid = isOverdue || isDue ? newInvoice.remainingBalance : 0;
        return {
          ...c,
          totalOutstanding: c.totalOutstanding + unpaid,
          outstandingReceivables: c.outstandingReceivables + unpaid,
          overdueCount: isOverdue ? c.overdueCount + 1 : c.overdueCount,
          activeInvoicesCount: c.activeInvoicesCount + 1
        };
      }
      return c;
    }));

    showToast({
      title: `Invoice ${newInvoice.number} Created`,
      description: `Saved as ${newInvoice.status.toUpperCase()} for $${newInvoice.totalAmount.toLocaleString()}`,
      type: 'success'
    });

    return newInvoice;
  };

  // Update Invoice
  const updateInvoice = async (updated: Invoice) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await updateInvoiceAction(updated.id, {
          due_date: updated.dueDate,
          notes: updated.notes,
          status: updated.status,
          priority: updated.priority,
        });
        if (!res.success) {
          showToast({
            title: 'Update Failed',
            description: res.error || 'Server rejected invoice update.',
            type: 'error'
          });
          return;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to update invoice.';
        showToast({ title: 'Update Failed', description: errMsg, type: 'error' });
        return;
      }
    }

    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    showToast({
      title: `Invoice ${updated.number} Updated`,
      type: 'info'
    });
  };

  // Delete Invoice
  const deleteInvoice = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await deleteInvoiceAction(id, businessId);
        if (!res.success) {
          showToast({
            title: 'Delete Failed',
            description: res.error || 'Server rejected invoice deletion.',
            type: 'error'
          });
          return;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to delete invoice.';
        showToast({ title: 'Delete Failed', description: errMsg, type: 'error' });
        return;
      }
    }

    setInvoices(prev => prev.filter(i => i.id !== id));
    showToast({
      title: `Invoice ${inv.number || ''} Deleted`,
      type: 'info'
    });
  };

  // Record Payment (Halal Integrity: decrements balance, ensures payment <= remaining balance)
  const recordPayment = async (invoiceId: string, amount: number, method: PaymentMethod, note?: string) => {
    const targetInv = invoices.find(i => i.id === invoiceId);
    if (!targetInv) {
      showToast({ title: 'Invoice not found', type: 'error' });
      return;
    }

    if (amount <= 0 || isNaN(amount) || !Number.isFinite(amount)) {
      showToast({ title: 'Invalid Payment Amount', description: 'Payment must be a positive number.', type: 'error' });
      return;
    }

    if (amount > targetInv.remainingBalance + 0.001) {
      showToast({
        title: 'Payment Exceeds Balance',
        description: `Cannot accept $${amount.toLocaleString()} on a remaining balance of $${targetInv.remainingBalance.toLocaleString()}`,
        type: 'error',
      });
      return;
    }

    // In production with authenticated session, route through Server Action
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await recordPaymentAction({
          business_id: businessId,
          invoice_id: invoiceId,
          amount,
          method,
          notes: note,
        });
        if (!res.success) {
          showToast({
            title: 'Payment Failed',
            description: res.error || 'Server rejected payment recording.',
            type: 'error',
          });
          return;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to record payment on server.';
        showToast({ title: 'Payment Failed', description: errMsg, type: 'error' });
        return;
      }
    }

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paymentsReceived + amount;
        const newRemaining = Math.max(0, inv.originalAmountDue - newPaid);
        const isFullyPaid = newRemaining === 0;
        const newStatus = isFullyPaid ? 'paid' : 'partially_paid';
        const newTimeline = [
          ...inv.timeline,
          {
            id: 't-pay-' + Date.now(),
            type: 'payment_received' as const,
            title: `Payment Received ($${amount.toLocaleString()})`,
            description: `Settled via ${method}${note ? ` • Note: ${note}` : ''}`,
            timestamp: 'Just now'
          }
        ];
        return {
          ...inv,
          status: newStatus,
          paymentsReceived: newPaid,
          remainingBalance: newRemaining,
          paidDate: isFullyPaid ? new Date().toISOString().split('T')[0] : inv.paidDate,
          timeline: newTimeline
        };
      }
      return inv;
    }));

    // Update customer stats
    setCustomers(prev => prev.map(c => {
      if (c.company.toLowerCase() === targetInv.customerCompany.toLowerCase() || c.name.toLowerCase() === targetInv.customerName.toLowerCase()) {
        const newOutstanding = Math.max(0, c.outstandingReceivables - amount);
        return {
          ...c,
          totalOutstanding: newOutstanding,
          outstandingReceivables: newOutstanding,
          totalPaid: c.totalPaid + amount,
          paymentsReceived: c.paymentsReceived + amount,
          overdueCount: targetInv.status === 'overdue' && (targetInv.remainingBalance - amount <= 0) ? Math.max(0, c.overdueCount - 1) : c.overdueCount
        };
      }
      return c;
    }));

    // Add In-App Notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: `Payment Received: $${amount.toLocaleString()}`,
      message: `${targetInv.customerCompany} settled $${amount.toLocaleString()} on ${targetInv.number} via ${method}.`,
      timestamp: 'Just now',
      read: false,
      type: 'payment',
      linkUrl: `/invoices/${targetInv.id}`
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast({
      title: `Payment Recorded: $${amount.toLocaleString()}`,
      description: `Applied to original balance via ${method}`,
      type: 'success'
    });
  };

  // Send Invoice Reminder
  const sendInvoiceReminder = (invoiceId: string, customSubject?: string, customBody?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          timeline: [
            ...inv.timeline,
            {
              id: 't-rem-' + Date.now(),
              type: 'reminder_sent' as const,
              title: 'Truthful AI Reminder Sent',
              description: customSubject ? `"${customSubject}" delivered` : 'Professional follow-up notice delivered',
              timestamp: 'Just now'
            }
          ]
        };
      }
      return inv;
    }));

    const inv = invoices.find(i => i.id === invoiceId);
    showToast({
      title: 'Reminder Sent!',
      description: `Delivered to ${inv?.customerEmail || 'customer'}`,
      type: 'ai'
    });
  };

  // Add Customer
  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer | null> => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await createCustomerAction({
          business_id: businessId,
          name: customerData.name,
          company: customerData.company,
          email: customerData.email,
          phone: customerData.phone,
          sms_consent: false,
          whatsapp_consent: false,
        });

        if (!res.success || !res.data) {
          showToast({
            title: 'Customer Creation Failed',
            description: res.error || 'Server rejected customer creation.',
            type: 'error'
          });
          return null;
        }

        const serverCustomer: Customer = {
          ...customerData,
          id: res.data.id,
          outstandingReceivables: 0,
          paymentsReceived: 0,
          totalOutstanding: 0,
          totalPaid: 0,
          overdueCount: 0,
          activeInvoicesCount: 0,
        };

        setCustomers(prev => [serverCustomer, ...prev]);
        showToast({
          title: `Customer ${serverCustomer.company} Added`,
          type: 'success'
        });
        return serverCustomer;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to create customer.';
        showToast({ title: 'Customer Creation Failed', description: errMsg, type: 'error' });
        return null;
      }
    }

    // Demo Mode
    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id,
      outstandingReceivables: customerData.totalOutstanding,
      paymentsReceived: customerData.totalPaid
    };
    setCustomers(prev => [newCustomer, ...prev]);

    showToast({
      title: `Customer ${newCustomer.company} Added`,
      type: 'success'
    });
    return newCustomer;
  };

  // Update Customer
  const updateCustomer = async (updated: Customer) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const res = await updateCustomerAction(updated.id, {
          name: updated.name,
          company: updated.company,
          email: updated.email,
          phone: updated.phone,
        });

        if (!res.success) {
          showToast({
            title: 'Update Customer Failed',
            description: res.error || 'Server rejected customer update.',
            type: 'error'
          });
          return;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to update customer.';
        showToast({ title: 'Update Customer Failed', description: errMsg, type: 'error' });
        return;
      }
    }

    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast({
      title: `${updated.company} Updated`,
      type: 'info'
    });
  };

  // Approve Recommendation (Creates communication draft + timeline event + audit log)
  const approveRecommendation = async (id: string, customDraft?: { subject?: string; message?: string; channel?: 'email' | 'sms' | 'whatsapp' }) => {
    const rec = recommendations.find(r => r.id === id);
    if (!rec) return;

    const sub = customDraft?.subject || rec.draftSubject;
    const body = customDraft?.message || rec.draftBody;
    const ch = customDraft?.channel || 'email';

    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const { approveAIRecommendationAction } = await import('@/app/actions');
        const res = await approveAIRecommendationAction(id, {
          subject: sub,
          message: body,
          channel: ch,
        });
        if (!res.success) {
          showToast({
            title: 'Approval Failed',
            description: res.error || 'Server rejected recommendation approval.',
            type: 'error',
          });
          return;
        }
      } catch (e: any) {
        showToast({
          title: 'Approval Failed',
          description: e?.message || 'Server error approving recommendation.',
          type: 'error',
        });
        return;
      }
    }

    sendInvoiceReminder(rec.invoiceId, sub, body);
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r));

    showToast({
      title: 'Recommendation Approved & Draft Saved',
      description: `Follow-up draft saved for ${rec.customerName}`,
      type: 'ai'
    });
  };

  // Dismiss Recommendation
  const dismissRecommendation = async (id: string) => {
    if (session && businessId && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        const { dismissAIRecommendationAction } = await import('@/app/actions');
        const res = await dismissAIRecommendationAction(id);
        if (!res.success) {
          showToast({
            title: 'Dismissal Failed',
            description: res.error || 'Server rejected dismissal.',
            type: 'error',
          });
          return;
        }
      } catch (e: any) {
        showToast({
          title: 'Dismissal Failed',
          description: e?.message || 'Server error dismissing recommendation.',
          type: 'error',
        });
        return;
      }
    }

    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    showToast({
      title: 'Recommendation Dismissed',
      type: 'info'
    });
  };

  // Generate Follow-up Content (Strict Halal Rule: truthful, zero interest/late fees/threats)
  const generateFollowUpContent = (
    invoiceId: string, 
    tone: 'gentle' | 'professional' | 'firm' | 'urgent',
    channel: 'email' | 'sms' | 'whatsapp'
  ) => {
    const inv = invoices.find(i => i.id === invoiceId) || invoices[0];
    const amountStr = `$${inv.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const customer = inv.customerName || 'Valued Client';
    const company = inv.customerCompany || 'your team';
    const num = inv.number;

    if (channel === 'sms' || channel === 'whatsapp') {
      let smsText = '';
      if (tone === 'gentle') {
        smsText = `Hi ${customer}, friendly reminder from ${profile.businessName} regarding invoice ${num} (${amountStr}) due on ${inv.dueDate}. Review & settle original balance: https://paypilot.ai/pay/${inv.id}`;
      } else if (tone === 'firm') {
        smsText = `Payment Reminder: Invoice ${num} for ${amountStr} was due on ${inv.dueDate}. Please review and settle the original invoice balance at https://paypilot.ai/pay/${inv.id}. Thank you, ${profile.businessName}.`;
      } else if (tone === 'urgent') {
        smsText = `Important Notice: Invoice ${num} (${amountStr}) for ${company} is past due. Please process this original balance at https://paypilot.ai/pay/${inv.id} or call us at ${profile.phone} if you need assistance.`;
      } else {
        smsText = `Hello ${customer}, please find details for invoice ${num} (${amountStr}) due on ${inv.dueDate}. Direct settlement link: https://paypilot.ai/pay/${inv.id}. Thanks, ${profile.businessName}.`;
      }
      return {
        subject: `SMS to ${inv.customerPhone || '+1 (555) 019-2834'}`,
        body: smsText
      };
    }

    let subject = '';
    let body = '';

    if (tone === 'gentle') {
      subject = `Friendly check-in: Invoice ${num} (${amountStr}) - ${profile.businessName}`;
      body = `Hi ${customer},\n\nI hope you are having a wonderful week!\n\nThis is a quick courtesy note regarding invoice ${num} for the original amount of ${amountStr}, which has a due date of ${inv.dueDate}.\n\nWhenever you have a moment, you can review the line items and settle directly via our client portal:\nhttps://paypilot.ai/pay/${inv.id}\n\nPlease let us know if you need any additional receipts or have any questions about this invoice.\n\nWarm regards,\n${profile.name}\n${profile.businessName}`;
    } else if (tone === 'firm') {
      subject = `Payment Status Follow-up: Invoice ${num} (${amountStr}) - ${company}`;
      body = `Dear ${customer} and Accounts Payable Team,\n\nOur accounting records show that invoice ${num} for ${amountStr} reached its due date on ${inv.dueDate} and remains open.\n\nWe value our relationship with ${company} and kindly request that this original balance be scheduled for settlement at your earliest convenience:\nhttps://paypilot.ai/pay/${inv.id}\n\nIf payment has already been initiated, please let us know so we can update our records accordingly.\n\nThank you for your prompt attention,\n${profile.name}\n${profile.businessName}`;
    } else if (tone === 'urgent') {
      subject = `Account Statement Notice: Invoice ${num} (${amountStr}) - ${company}`;
      body = `Dear ${customer},\n\nWe are following up regarding invoice ${num} in the amount of ${amountStr}, which is currently past due.\n\nTo ensure our records remain aligned and to support ongoing services, please review and process this original balance at your earliest opportunity:\nhttps://paypilot.ai/pay/${inv.id}\n\nIf you have any questions regarding this invoice or wish to review settlement options, please reach out to me directly at ${profile.phone} or reply to this email.\n\nThank you for your cooperation,\n${profile.name}\n${profile.businessName}`;
    } else {
      subject = `Invoice ${num} (${amountStr}) from ${profile.businessName}`;
      body = `Dear ${customer},\n\nPlease find attached the statement for invoice ${num} totaling ${amountStr}.\n\nYou can review and pay securely online using our client portal:\nhttps://paypilot.ai/pay/${inv.id}\n\nThank you for your business and partnership.\n\nBest regards,\n${profile.name}\n${profile.businessName}`;
    }

    return { subject, body };
  };

  // Notification actions
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

  // Profile / Settings
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    showToast({ title: 'Profile Updated', type: 'success' });
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    showToast({ title: 'Settings Saved', type: 'success' });
  };

  // Financial Metrics (Calculated strictly with Halal principles: original_amount - amount_paid)
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

  return (
    <AppContext.Provider value={{
      user,
      session,
      businessId,
      isOnline,
      isLoading,
      signIn,
      signUp,
      signOut,
      invoices,
      customers,
      recommendations,
      notifications,
      profile,
      settings,
      adminStats,
      toasts,
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
      showToast,
      dismissToast,
      totalOutstanding,
      overdueAmount,
      dueThisWeek,
      collectedMtd,
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
