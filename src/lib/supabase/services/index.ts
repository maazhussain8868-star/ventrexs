import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';
import { AuthService } from './auth';
import { BusinessService } from './business';
import { CustomerService } from './customers';
import { InvoiceService } from './invoices';
import { PaymentService } from './payments';
import { CommunicationService } from './communications';
import { RecommendationService } from './recommendations';
import { NotificationService } from './notifications';
import { MetricsService } from './metrics';
import { AuditService } from './audit';
import { LeadService } from './leads';
import { OperationsService } from './operations';
import { ReceptionistBackendService } from './receptionist';
import { EstimatesService } from './estimates';
import { ReputationService } from './reputation';
import { AnalyticsService } from './analytics';

export * from './auth';
export * from './business';
export * from './customers';
export * from './invoices';
export * from './payments';
export * from './communications';
export * from './recommendations';
export * from './notifications';
export * from './metrics';
export * from './audit';
export * from './leads';
export * from './operations';
export * from './receptionist';
export * from './estimates';
export * from './reputation';
export * from './analytics';

export function createSupabaseServices(client: SupabaseClient<Database>) {
  return {
    auth: new AuthService(client),
    business: new BusinessService(client),
    customers: new CustomerService(client),
    invoices: new InvoiceService(client),
    payments: new PaymentService(client),
    communications: new CommunicationService(client),
    recommendations: new RecommendationService(client),
    notifications: new NotificationService(client),
    metrics: new MetricsService(client),
    audit: new AuditService(client),
    leads: new LeadService(client),
    operations: new OperationsService(client),
    receptionist: new ReceptionistBackendService(client),
    estimates: new EstimatesService(client),
    reputation: new ReputationService(client),
    analytics: new AnalyticsService(client),
  };
}
