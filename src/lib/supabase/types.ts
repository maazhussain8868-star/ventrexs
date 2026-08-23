export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'owner' | 'admin' | 'member';
export type InvoiceStatus = 'draft' | 'sent' | 'due' | 'overdue' | 'partially_paid' | 'paid' | 'disputed';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PreferredContact = 'email' | 'phone' | 'sms';
export type PaymentMethod = 'ACH Transfer' | 'Credit Card' | 'Bank Wire' | 'Check' | 'Other';
export type InvoiceEventType = 'created' | 'sent' | 'viewed' | 'reminder_sent' | 'payment_received' | 'status_changed' | 'note_added';
export type CommunicationChannel = 'email' | 'sms' | 'whatsapp';
export type CommunicationTone = 'gentle' | 'professional' | 'firm' | 'urgent';
export type CommunicationStatus = 'draft' | 'approved' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'queued' | 'delivered';
export type RecommendationStatus = 'pending' | 'sent' | 'dismissed';
export type NotificationType = 'payment' | 'overdue' | 'copilot' | 'system';
export type SubscriptionPlan = 'Starter' | 'Professional' | 'Enterprise';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'canceled' | 'incomplete' | 'paused';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          phone: string | null;
          address: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: UserRole;
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          tax_id: string | null;
          currency: string;
          payment_terms_days: number;
          default_notes: string | null;
          stripe_connected: boolean;
          ach_connected: boolean;
          auto_reminder_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          tax_id?: string | null;
          currency?: string;
          payment_terms_days?: number;
          default_notes?: string | null;
          stripe_connected?: boolean;
          ach_connected?: boolean;
          auto_reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          tax_id?: string | null;
          currency?: string;
          payment_terms_days?: number;
          default_notes?: string | null;
          stripe_connected?: boolean;
          ach_connected?: boolean;
          auto_reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: UserRole;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role?: UserRole;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: UserRole;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          company: string;
          email: string;
          phone: string | null;
          address: string | null;
          payment_terms: number;
          risk_level: RiskLevel;
          credit_score: number;
          preferred_contact: PreferredContact;
          notes: string | null;
          sms_consent: boolean;
          sms_consent_at: string | null;
          sms_consent_source: string | null;
          sms_opted_out: boolean;
          sms_opted_out_at: string | null;
          sms_opt_out_reason: string | null;
          whatsapp_consent: boolean;
          whatsapp_consent_at: string | null;
          whatsapp_consent_source: string | null;
          whatsapp_opted_out: boolean;
          whatsapp_opted_out_at: string | null;
          whatsapp_opt_out_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          company: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          payment_terms?: number;
          risk_level?: RiskLevel;
          credit_score?: number;
          preferred_contact?: PreferredContact;
          notes?: string | null;
          sms_consent?: boolean;
          sms_consent_at?: string | null;
          sms_consent_source?: string | null;
          sms_opted_out?: boolean;
          sms_opted_out_at?: string | null;
          sms_opt_out_reason?: string | null;
          whatsapp_consent?: boolean;
          whatsapp_consent_at?: string | null;
          whatsapp_consent_source?: string | null;
          whatsapp_opted_out?: boolean;
          whatsapp_opted_out_at?: string | null;
          whatsapp_opt_out_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          company?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          payment_terms?: number;
          risk_level?: RiskLevel;
          credit_score?: number;
          preferred_contact?: PreferredContact;
          notes?: string | null;
          sms_consent?: boolean;
          sms_consent_at?: string | null;
          sms_consent_source?: string | null;
          sms_opted_out?: boolean;
          sms_opted_out_at?: string | null;
          sms_opt_out_reason?: string | null;
          whatsapp_consent?: boolean;
          whatsapp_consent_at?: string | null;
          whatsapp_consent_source?: string | null;
          whatsapp_opted_out?: boolean;
          whatsapp_opted_out_at?: string | null;
          whatsapp_opt_out_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          currency: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          discount_amount: number;
          original_amount: number;
          amount_paid: number;
          remaining_balance: number;
          status: InvoiceStatus;
          priority: PriorityLevel;
          paid_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          invoice_number: string;
          issue_date?: string;
          due_date: string;
          currency?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number;
          original_amount: number;
          amount_paid?: number;
          remaining_balance: number;
          status?: InvoiceStatus;
          priority?: PriorityLevel;
          paid_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          invoice_number?: string;
          issue_date?: string;
          due_date?: string;
          currency?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number;
          original_amount?: number;
          amount_paid?: number;
          remaining_balance?: number;
          status?: InvoiceStatus;
          priority?: PriorityLevel;
          paid_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          tax_amount: number;
          discount_amount: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          tax_amount?: number;
          discount_amount?: number;
          line_total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tax_amount?: number;
          discount_amount?: number;
          line_total?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          business_id: string;
          invoice_id: string;
          amount: number;
          payment_date: string;
          method: PaymentMethod;
          reference: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoice_id: string;
          amount: number;
          payment_date?: string;
          method: PaymentMethod;
          reference?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          invoice_id?: string;
          amount?: number;
          payment_date?: string;
          method?: PaymentMethod;
          reference?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      invoice_events: {
        Row: {
          id: string;
          invoice_id: string;
          business_id: string;
          event_type: InvoiceEventType;
          title: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          business_id: string;
          event_type: InvoiceEventType;
          title: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          business_id?: string;
          event_type?: InvoiceEventType;
          title?: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      communications: {
        Row: {
          id: string;
          business_id: string;
          invoice_id: string | null;
          customer_id: string;
          channel: CommunicationChannel;
          subject: string | null;
          message: string;
          tone: CommunicationTone;
          status: CommunicationStatus;
          sent_at: string | null;
          provider_message_id: string | null;
          error_message: string | null;
          delivery_status: string | null;
          template_name: string | null;
          template_language: string | null;
          template_variables: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoice_id?: string | null;
          customer_id: string;
          channel: CommunicationChannel;
          subject?: string | null;
          message: string;
          tone?: CommunicationTone;
          status?: CommunicationStatus;
          sent_at?: string | null;
          provider_message_id?: string | null;
          error_message?: string | null;
          delivery_status?: string | null;
          template_name?: string | null;
          template_language?: string | null;
          template_variables?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          invoice_id?: string | null;
          customer_id?: string;
          channel?: CommunicationChannel;
          subject?: string | null;
          message?: string;
          tone?: CommunicationTone;
          status?: CommunicationStatus;
          sent_at?: string | null;
          provider_message_id?: string | null;
          error_message?: string | null;
          delivery_status?: string | null;
          template_name?: string | null;
          template_language?: string | null;
          template_variables?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_recommendations: {
        Row: {
          id: string;
          business_id: string;
          invoice_id: string;
          customer_name: string | null;
          amount: number;
          days_overdue: number;
          priority: PriorityLevel;
          recommended_action: string;
          reason: string;
          tone: CommunicationTone;
          message_draft_subject: string | null;
          message_draft: string;
          confidence: number;
          status: RecommendationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoice_id: string;
          customer_name?: string | null;
          amount?: number;
          days_overdue?: number;
          priority?: PriorityLevel;
          recommended_action: string;
          reason: string;
          tone?: CommunicationTone;
          message_draft_subject?: string | null;
          message_draft: string;
          confidence?: number;
          status?: RecommendationStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          invoice_id?: string;
          customer_name?: string | null;
          amount?: number;
          days_overdue?: number;
          priority?: PriorityLevel;
          recommended_action?: string;
          reason?: string;
          tone?: CommunicationTone;
          message_draft_subject?: string | null;
          message_draft?: string;
          confidence?: number;
          status?: RecommendationStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          type: NotificationType;
          title: string;
          message: string;
          link_url: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          type: NotificationType;
          title: string;
          message: string;
          link_url?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          type?: NotificationType;
          title?: string;
          message?: string;
          link_url?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          business_id: string;
          plan: SubscriptionPlan;
          billing_cycle: BillingCycle;
          status: SubscriptionStatus;
          price_amount: number;
          currency: string;
          provider: string | null;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          trial_start: string | null;
          trial_end: string | null;
          trial_ends_at: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          plan?: SubscriptionPlan;
          billing_cycle?: BillingCycle;
          status?: SubscriptionStatus;
          price_amount?: number;
          currency?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          plan?: SubscriptionPlan;
          billing_cycle?: BillingCycle;
          status?: SubscriptionStatus;
          price_amount?: number;
          currency?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      processed_webhook_events: {
        Row: {
          id: string;
          provider: string;
          event_type: string;
          payload: Json;
          processed_at: string;
        };
        Insert: {
          id: string;
          provider: string;
          event_type: string;
          payload?: Json;
          processed_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string | null;
          user_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          timestamp: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          user_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json;
          timestamp?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          metadata?: Json;
          timestamp?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          key: string;
          count: number;
          window_start: string;
          expires_at: string;
        };
        Insert: {
          key: string;
          count?: number;
          window_start?: string;
          expires_at: string;
        };
        Update: {
          key?: string;
          count?: number;
          window_start?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
