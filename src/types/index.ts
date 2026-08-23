export type InvoiceStatus = 'draft' | 'sent' | 'due' | 'overdue' | 'partially_paid' | 'paid' | 'disputed';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PaymentMethod = 'ACH Transfer' | 'Credit Card' | 'Bank Wire' | 'Check' | 'Other';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'sent' | 'viewed' | 'reminder_sent' | 'payment_received';
  title: string;
  description?: string;
  timestamp: string;
}

export interface AISuggestion {
  actionType: 'gentle' | 'professional' | 'firm' | 'urgent';
  insight: string;
  confidence: number;
  recommendedSubject?: string;
  recommendedBody?: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  priority: PriorityLevel;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number; // Original Amount Due
  originalAmountDue: number;
  paymentsReceived: number;
  remainingBalance: number;
  daysOverdue: number;
  notes?: string;
  paidDate?: string;
  timeline: TimelineEvent[];
  aiSuggestion?: AISuggestion;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  totalOutstanding: number; // Outstanding Receivables
  outstandingReceivables: number;
  totalPaid: number; // Payments Received
  paymentsReceived: number;
  overdueCount: number;
  activeInvoicesCount: number;
  riskLevel: RiskLevel;
  creditScore: number;
  lastContactDate: string;
  preferredContact: 'email' | 'phone' | 'sms';
  notes?: string;
}

export interface CopilotRecommendation {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  originalAmountDue: number;
  daysOverdue: number;
  priority: PriorityLevel;
  aiInsight: string;
  recommendedAction: string;
  confidence: number;
  tone: 'gentle' | 'professional' | 'firm' | 'urgent';
  draftSubject: string;
  draftBody: string;
  status: 'pending' | 'sent' | 'dismissed';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'payment' | 'overdue' | 'copilot' | 'system';
  linkUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  avatarUrl: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  billingCycle: 'monthly' | 'annual';
  twoFactorEnabled: boolean;
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  taxId: string;
  currency: string;
  paymentTermsDays: number;
  defaultNotes: string;
  stripeConnected: boolean;
  achConnected: boolean;
  autoReminderEnabled: boolean;
}

export interface AdminStats {
  mrr: number;
  mrrGrowth: number;
  activeUsers: number;
  userGrowth: number;
  aiDraftsToday: number;
  serverUptime: string;
}
