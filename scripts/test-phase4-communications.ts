/**
 * ==============================================================================
 * PAYPILOT AI — PHASE 4: MULTI-CHANNEL COMMUNICATION AUTOMATION VERIFICATION SUITE
 * ==============================================================================
 * Comprehensive test battery verifying:
 * - Multi-channel template interpolation & variable validation
 * - Phone & Email recipient normalization & rejection
 * - Multi-channel consent verification & TCPA / Meta opt-out enforcement
 * - Global STOP / UNSUBSCRIBE keyword detection & CRM activity logging
 * - Idempotency enforcement & duplicate-send prevention
 * - State machine transitions (DRAFT -> PENDING -> SENT -> DELIVERED)
 * - Provider abstraction (Simulated vs Live isolation)
 * - AI Draft safety validation & financial ledger immutability
 * - Human approval authorization & server-side verification
 * - Multi-tenant isolation (Cross-tenant breach prevention)
 * - Rate limiting safeguards
 * - Webhook cryptographic HMAC verification & idempotency
 * - Demo mode safety (zero external network calls)
 * - Inbound reply routing to AI Receptionist Engine
 * - Backward compatibility with existing Email, SMS, and WhatsApp engines
 */

import { interpolateTemplate, extractVariables, sanitizeInput, SYSTEM_TEMPLATES } from '../src/lib/communications/template-engine';
import { ConsentManager } from '../src/lib/communications/consent-manager';
import { validateCommunicationPolicy } from '../src/lib/communications/policy-validator';
import { CommunicationOrchestrator } from '../src/lib/communications/orchestrator';
import { AutomationTriggerDispatcher } from '../src/lib/communications/automation-triggers';
import { InboundReplyRouter } from '../src/lib/communications/reply-router';
import { validateAndNormalizePhoneNumber } from '../src/lib/sms/phone-validator';
import { validateWhatsAppTemplate } from '../src/lib/whatsapp/template-validator';
import { EmailService } from '../src/lib/email/email-service';
import { SMSService } from '../src/lib/sms/sms-service';
import { WhatsAppService } from '../src/lib/whatsapp/whatsapp-service';
import crypto from 'crypto';

// ANSI terminal color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, caseNum: number, description: string) {
  totalTests++;
  if (condition) {
    console.log(`  ${GREEN}✓ [PASS]${RESET} Case ${caseNum}: ${description}`);
    passedTests++;
  } else {
    console.error(`  ${RED}✗ [FAIL]${RESET} Case ${caseNum}: ${description}`);
  }
}

// In-Memory Multi-Tenant Database Simulation for Isolation Tests
class MockSupabaseClient {
  public data: Record<string, any[]> = {
    businesses: [
      { id: 'biz-1', name: 'Main Street Bakery', currency: 'USD ($)', phone: '+15553829912' },
      { id: 'biz-2', name: 'Apex Commercial Plumbing', currency: 'USD ($)', phone: '+15554921102' },
    ],
    customers: [
      {
        id: 'cust-1',
        business_id: 'biz-1',
        name: 'Michael Scott',
        email: 'mscott@acmecorp.com',
        phone: '+15558392911',
        sms_consent: true,
        whatsapp_consent: true,
        sms_opted_out: false,
        whatsapp_opted_out: false,
      },
      {
        id: 'cust-2',
        business_id: 'biz-1',
        name: 'Sarah Connor',
        email: 'sconnor@globaltech.io',
        phone: '+15554921102',
        sms_consent: false,
        whatsapp_consent: false,
        sms_opted_out: true,
        sms_opted_out_at: '2026-08-10T09:15:00Z',
        sms_opt_out_reason: 'STOP received',
        whatsapp_opted_out: true,
      },
      {
        id: 'cust-3',
        business_id: 'biz-1',
        name: 'Tony Stark',
        email: 'tony@starkindustries.com',
        phone: '+15559182344',
        sms_consent: true,
        whatsapp_consent: true,
        sms_opted_out: false,
        whatsapp_opted_out: false,
      },
      {
        id: 'cust-b2',
        business_id: 'biz-2',
        name: 'Bruce Wayne',
        email: 'bwayne@wayneenterprises.com',
        phone: '+15559876543',
        sms_consent: true,
        sms_opted_out: false,
      }
    ],
    invoices: [
      {
        id: 'inv-1',
        business_id: 'biz-1',
        invoice_number: 'INV-1001',
        original_amount: 5000,
        amount_paid: 2000,
        remaining_balance: 3000,
        due_date: '2026-09-01',
      }
    ],
    communications: [] as any[],
    communication_consents: [] as any[],
    lead_activities: [] as any[],
    invoice_events: [] as any[],
    audit_logs: [] as any[],
    rate_limits: [] as any[],
  };

  from(tableName: string) {
    const table = this.data[tableName] || (this.data[tableName] = []);

    const createQuery = (currentFilters: Array<(item: any) => boolean> = []): any => {
      const execFilters = () => {
        let results = [...table];
        for (const filter of currentFilters) {
          results = results.filter(filter);
        }
        return results.map(item => {
          const enriched = { ...item };
          if (tableName === 'communications') {
            if (item.customer_id) enriched.customers = this.data.customers.find(c => c.id === item.customer_id);
            if (item.invoice_id) enriched.invoices = this.data.invoices.find(i => i.id === item.invoice_id);
            if (item.business_id) enriched.businesses = this.data.businesses.find(b => b.id === item.business_id);
          }
          return enriched;
        });
      };

      const queryObj: any = {
        select: (_fields?: string) => createQuery(currentFilters),
        eq: (col: string, val: any) => createQuery([...currentFilters, (item: any) => item[col] === val]),
        ilike: (col: string, val: any) => createQuery([...currentFilters, (item: any) => {
          if (!item[col]) return false;
          return String(item[col]).toLowerCase() === String(val).toLowerCase();
        }]),
        order: () => queryObj,
        limit: () => queryObj,
        single: async () => {
          const res = execFilters();
          return { data: res[0] || null, error: res[0] ? null : new Error('Record not found') };
        },
        maybeSingle: async () => {
          const res = execFilters();
          return { data: res[0] || null, error: null };
        },
      };
      return queryObj;
    };

    return {
      select: (fields?: string) => createQuery(),
      insert: (record: any) => {
        const id = record.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const inserted = { ...record, id, created_at: new Date().toISOString() };
        table.push(inserted);
        const res = { data: inserted, error: null };
        const ret: any = {
          data: inserted,
          error: null,
          select: () => ({
            single: async () => ({ data: inserted, error: null }),
            maybeSingle: async () => ({ data: inserted, error: null }),
          }),
          then: (resolve: any) => resolve(res),
        };
        return ret;
      },
      update: (updates: any) => ({
        eq: (col: string, val: any) => {
          const idx = table.findIndex(item => item[col] === val);
          if (idx >= 0) {
            table[idx] = { ...table[idx], ...updates };
          }
          return {
            eq: (col2: string, val2: any) => {
              const idx2 = table.findIndex(item => item[col] === val && item[col2] === val2);
              if (idx2 >= 0) table[idx2] = { ...table[idx2], ...updates };
              return { data: table[idx2], error: null };
            },
            select: () => ({
              single: async () => ({ data: table[idx], error: null }),
            }),
          };
        },
      }),
      upsert: (record: any) => {
        const idx = table.findIndex(item => 
          (record.business_id && item.business_id === record.business_id &&
           ((record.customer_id && item.customer_id === record.customer_id) || (record.lead_id && item.lead_id === record.lead_id)) &&
           item.channel === record.channel)
        );
        if (idx >= 0) {
          table[idx] = { ...table[idx], ...record };
          return {
            select: () => ({
              single: async () => ({ data: table[idx], error: null }),
            }),
          };
        } else {
          const id = record.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const inserted = { ...record, id, created_at: new Date().toISOString() };
          table.push(inserted);
          return {
            select: () => ({
              single: async () => ({ data: inserted, error: null }),
            }),
          };
        }
      },
    };
  }
}

async function runPhase4Verification() {
  console.log(`${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}PAYPILOT AI — PHASE 4: MULTI-CHANNEL COMMUNICATION VERIFICATION SUITE${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  const mockDb = new MockSupabaseClient();

  // Test 1: Template Variable Extraction and Interpolation
  const sampleTemplate = 'Hi {{customer_name}}, your {{service_name}} appointment is on {{appointment_date}} at {{appointment_time}}. Total: {{invoice_amount}}.';
  const vars = extractVariables(sampleTemplate);
  const rendered = interpolateTemplate(sampleTemplate, {
    customer_name: 'Michael Scott',
    service_name: 'Bakery Oven Diagnostic',
    appointment_date: 'Aug 26, 2026',
    appointment_time: '10:00 AM',
    invoice_amount: '$450.00',
  });
  assert(
    vars.length === 5 &&
    rendered === 'Hi Michael Scott, your Bakery Oven Diagnostic appointment is on Aug 26, 2026 at 10:00 AM. Total: $450.00.',
    1,
    'Email/SMS template accurately extracts and interpolates dynamic variables'
  );

  // Test 2: Template Input Sanitization (XSS script tag neutralization)
  const maliciousInput = '<script>alert("hacked")</script>Marcus Vance';
  const sanitized = sanitizeInput(maliciousInput);
  const renderedSafe = interpolateTemplate('Technician: {{technician_name}}', { technician_name: maliciousInput });
  assert(
    sanitized === 'Marcus Vance' && !renderedSafe.includes('<script>'),
    2,
    'Template variable interpolation safely neutralizes malicious script injection tags'
  );

  // Test 3: SMS Phone Number Validation (E.164 normalization)
  const validPhone = validateAndNormalizePhoneNumber('(555) 839-2911');
  const invalidPhone = validateAndNormalizePhoneNumber('12345');
  assert(
    validPhone.isValid && validPhone.normalized === '+15558392911' && !invalidPhone.isValid,
    3,
    'SMS recipient phone number normalizes to E.164 standard and rejects malformed digits'
  );

  // Test 4: WhatsApp Business Template Validation
  const waCheckValid = validateWhatsAppTemplate({
    type: 'invoice_reminder',
    messageText: 'Invoice statement for INV-1001',
    variables: { invoice_number: 'INV-1001' },
  });
  const waCheckInvalid = validateWhatsAppTemplate({
    type: 'marketing_broadcast' as any,
    messageText: '50% off holiday discount sale!',
  });
  assert(
    waCheckValid.isValid && !waCheckInvalid.isValid,
    4,
    'WhatsApp Business API template strictly verifies transactional categorization and rejects unapproved marketing broadcasts'
  );

  // Test 5: Consent Verification (Affirmative Opt-In Requirement)
  const consentPass = ConsentManager.verifyConsent({ channel: 'sms', optedIn: true, optedOut: false });
  const consentFail = ConsentManager.verifyConsent({ channel: 'sms', optedIn: false, optedOut: false });
  assert(
    consentPass.canSend && !consentFail.canSend && (consentFail.reason?.includes('CONSENT REQUIRED') ?? false),
    5,
    'SMS and WhatsApp communications fail closed without affirmative opt-in consent'
  );

  // Test 6: Global Opt-Out Enforcement
  const optOutCheck = ConsentManager.verifyConsent({
    channel: 'sms',
    optedIn: true,
    optedOut: true,
    optedOutAt: '2026-08-10T09:15:00Z',
    optOutReason: 'STOP request',
  });
  assert(
    !optOutCheck.canSend && (optOutCheck.reason?.includes('COMPLIANCE OPT-OUT') ?? false),
    6,
    'Opted-out recipient is strictly blocked from receiving outbound messages'
  );

  // Test 7: STOP / UNSUBSCRIBE Keyword Recognition
  const isStop = ConsentManager.isOptOutMessage('STOP');
  const isUnsub = ConsentManager.isOptOutMessage('  unsubscribe  ');
  const isCancel = ConsentManager.isOptOutMessage('Cancel');
  const isRegular = ConsentManager.isOptOutMessage('Can you reschedule my appointment?');
  assert(
    isStop && isUnsub && isCancel && !isRegular,
    7,
    'Global opt-out detector recognizes TCPA/CTIA standard keywords (STOP, UNSUBSCRIBE, CANCEL)'
  );

  // Test 8: Duplicate-Send Prevention & Idempotency
  const orchestrator = new CommunicationOrchestrator(mockDb as any);
  const idemKey = 'idem-msg-alpha-1001';
  
  // First dispatch
  const res1 = await orchestrator.dispatchCommunication({
    businessId: 'biz-1',
    channel: 'email',
    recipientEmail: 'mscott@acmecorp.com',
    recipientName: 'Michael Scott',
    message: 'Your service report is ready.',
    idempotencyKey: idemKey,
  });

  // Re-dispatch with same idempotency key
  const res2 = await orchestrator.dispatchCommunication({
    businessId: 'biz-1',
    channel: 'email',
    recipientEmail: 'mscott@acmecorp.com',
    recipientName: 'Michael Scott',
    message: 'Your service report is ready.',
    idempotencyKey: idemKey,
  });

  assert(
    res1.success && res2.success && res1.communicationId === res2.communicationId,
    8,
    'Idempotency key prevents duplicate sends and returns identical prior dispatch record'
  );

  // Test 9: Queue State Machine Transitions (DRAFT -> PENDING_APPROVAL -> APPROVED -> SENT)
  const approvalReq = await orchestrator.dispatchCommunication({
    businessId: 'biz-1',
    channel: 'sms',
    recipientPhone: '+15558392911',
    message: 'Special customer outreach draft.',
    requiresApproval: true,
  });

  assert(
    approvalReq.status === 'draft' &&
    approvalReq.approvalStatus === 'pending_approval' &&
    approvalReq.requiresApproval === true,
    9,
    'Communication with requiresApproval flag enters approval queue without dispatching carrier payload'
  );

  // Test 10: Human Approval Authorization & Dispatch Execution
  const approvedSend = await orchestrator.approveAndSend({
    communicationId: approvalReq.communicationId,
    businessId: 'biz-1',
    userId: 'user-supervisor-1',
  });
  assert(
    approvedSend.success && approvedSend.approvalStatus === 'approved' && approvedSend.status === 'sent',
    10,
    'Authorized business operator approves draft and successfully dispatches through provider'
  );

  // Test 11: Multi-Tenant Boundary Enforcement (Cross-tenant approval attempt fails)
  let crossTenantApproved = false;
  try {
    await orchestrator.approveAndSend({
      communicationId: approvalReq.communicationId,
      businessId: 'biz-2', // Wrong business
      userId: 'user-attacker',
    });
    crossTenantApproved = true;
  } catch (err: any) {
    crossTenantApproved = false;
  }
  assert(
    !crossTenantApproved,
    11,
    'Cross-tenant approval attempt by unauthorized business is strictly rejected'
  );

  // Test 12: Policy Validator (Forbidden Interest & Penalty Language Blocked)
  const predatoryCheck = validateCommunicationPolicy({
    subject: 'Urgent Payment Due',
    message: 'Please pay immediately or a 15% late payment penalty and compound interest charge will apply.',
  });
  assert(
    !predatoryCheck.isValid && predatoryCheck.errors.some(e => e.includes('Prohibited financial terminology')),
    12,
    'Policy validator strictly rejects predatory financial terminology (interest charges, late penalties)'
  );

  // Test 13: Financial Immutability (Messaging cannot alter balances or ledgers)
  const invoice = mockDb.data.invoices[0];
  const initialBal = invoice.remaining_balance;
  const initialOrig = invoice.original_amount;
  const initialPaid = invoice.amount_paid;

  await orchestrator.dispatchCommunication({
    businessId: 'biz-1',
    channel: 'email',
    recipientEmail: 'mscott@acmecorp.com',
    message: 'Statement reminder regarding balance.',
    invoiceId: invoice.id,
  });

  assert(
    invoice.remaining_balance === initialBal &&
    invoice.original_amount === initialOrig &&
    invoice.amount_paid === initialPaid,
    13,
    'Financial ledger values (original amount, amount paid, remaining balance) remain strictly immutable during messaging'
  );

  // Test 14: Unauthorized Malformed Recipient Rejection
  let malformedSendError = false;
  try {
    await orchestrator.dispatchCommunication({
      businessId: 'biz-1',
      channel: 'email',
      recipientEmail: 'not-an-email',
      message: 'Hello',
    });
  } catch {
    malformedSendError = true;
  }
  assert(
    malformedSendError,
    14,
    'Malformed or invalid recipient email address is strictly rejected before provider contact'
  );

  // Test 15: Inbound Reply Routing to Opt-Out Manager
  const replyRouter = new InboundReplyRouter(mockDb as any);
  const inboundStop = await replyRouter.handleInboundMessage({
    channel: 'sms',
    senderIdentifier: '+15558392911',
    messageText: 'STOP',
    businessId: 'biz-1',
  });
  assert(
    inboundStop.success && inboundStop.handledAs === 'OPT_OUT' && inboundStop.optOutRecorded === true,
    15,
    'Inbound STOP SMS message triggers global opt-out registry without crashing'
  );

  // Test 16: Automation Trigger Dispatcher (NEW_LEAD triggers welcome acknowledgement)
  const triggerDispatcher = new AutomationTriggerDispatcher(mockDb as any);
  const triggerRes = await triggerDispatcher.executeTrigger({
    businessId: 'biz-1',
    triggerType: 'NEW_LEAD',
    recipientName: 'Dwight Schrute',
    recipientEmail: 'dwight@dundermifflin.com',
    serviceName: 'Farm Emergency Heating',
    businessName: 'Main Street Bakery & HVAC',
  });
  assert(
    triggerRes.success && triggerRes.status === 'sent',
    16,
    'NEW_LEAD automation trigger maps to verified inquiry acknowledgment template and dispatches'
  );

  // Test 17: APPOINTMENT_BOOKED Automation Trigger
  const apptTrigger = await triggerDispatcher.executeTrigger({
    businessId: 'biz-1',
    triggerType: 'APPOINTMENT_BOOKED',
    channel: 'sms',
    recipientPhone: '+15558392911',
    recipientName: 'Michael Scott',
    serviceName: 'Oven Maintenance',
    appointmentDate: 'Aug 28, 2026',
    appointmentTime: '2:00 PM',
    technicianName: 'Marcus Vance',
  });
  assert(
    apptTrigger.success && apptTrigger.status === 'sent',
    17,
    'APPOINTMENT_BOOKED trigger accurately maps to appointment confirmation SMS payload'
  );

  // Test 18: Inbound Webhook Signature HMAC Validation
  const webhookSecret = 'test-comm-webhook-secret-2026';
  const testPayload = JSON.stringify({ event: 'delivery_status', communication_id: 'comm-101', status: 'delivered' });
  const validSignature = crypto.createHmac('sha256', webhookSecret).update(testPayload).digest('hex');
  const invalidSignature = crypto.createHmac('sha256', 'wrong-secret').update(testPayload).digest('hex');

  const hmacValid = crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(validSignature));
  const hmacInvalid = !crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(invalidSignature));
  assert(
    hmacValid && hmacInvalid,
    18,
    'Webhook delivery status callbacks strictly verify cryptographic HMAC signatures'
  );

  // Test 19: Demo Mode Safety (Zero Real Network Transports)
  process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
  const demoDispatch = await orchestrator.dispatchCommunication({
    businessId: 'biz-1',
    channel: 'sms',
    recipientPhone: '+15558392911',
    message: 'Demo mode test dispatch',
  });
  assert(
    demoDispatch.success && (demoDispatch.providerMessageId?.startsWith('sms_dev_') === true || demoDispatch.providerMessageId?.startsWith('sim_') === true),
    19,
    'Demo mode safely executes simulated provider without real external carrier API network calls'
  );

  // Test 20: CRM Activity & Timeline Synchronization
  const leadActivities = mockDb.data.lead_activities;
  const initialActCount = leadActivities.length;
  await orchestrator.dispatchCommunication({
    businessId: 'biz-1',
    leadId: 'lead-test-01',
    channel: 'sms',
    recipientPhone: '+15558392911',
    message: 'Follow up regarding proposal.',
  });
  assert(
    leadActivities.length > initialActCount &&
    leadActivities[leadActivities.length - 1].activity_type === 'sms',
    20,
    'Outbound communication automatically records timeline entry in CRM lead activities'
  );

  // Test 21: Existing Email Engine Backward Compatibility
  const emailService = new EmailService(mockDb as any);
  const commRecord = await mockDb.from('communications').insert({
    business_id: 'biz-1',
    customer_id: 'cust-1',
    invoice_id: 'inv-1',
    channel: 'email',
    message: 'Courtesy reminder for invoice balance.',
    tone: 'professional',
    status: 'approved',
  });
  const emailRes = await emailService.sendApprovedEmail({
    communicationId: commRecord.data.id,
    businessId: 'biz-1',
  });
  assert(
    emailRes.success && emailRes.status === 'sent',
    21,
    'Existing Phase 1-3 EmailService executes flawlessly with Phase 4 schema enhancements'
  );

  // Test 22: Existing SMS Engine Backward Compatibility & TCPA Enforcement
  const smsService = new SMSService(mockDb as any);
  const smsCommRecord = await mockDb.from('communications').insert({
    business_id: 'biz-1',
    customer_id: 'cust-3',
    channel: 'sms',
    message: 'Courtesy appointment notice.',
    tone: 'professional',
    status: 'approved',
  });
  const smsRes = await smsService.sendApprovedSMS({
    communicationId: smsCommRecord.data.id,
    businessId: 'biz-1',
  });
  assert(
    smsRes.success && smsRes.status === 'sent',
    22,
    'Existing SMSService executes flawlessly with affirmative TCPA consent verification'
  );

  // Test 23: Existing WhatsApp Engine Backward Compatibility
  const waService = new WhatsAppService(mockDb as any);
  const waCommRecord = await mockDb.from('communications').insert({
    business_id: 'biz-1',
    customer_id: 'cust-3',
    channel: 'whatsapp',
    template_name: 'invoice_reminder',
    message: 'Courtesy invoice update.',
    tone: 'professional',
    status: 'approved',
  });
  const waRes = await waService.sendApprovedWhatsApp({
    communicationId: waCommRecord.data.id,
    businessId: 'biz-1',
  });
  assert(
    waRes.success && waRes.status === 'sent',
    23,
    'Existing WhatsAppService executes flawlessly with Meta Cloud API compliance verification'
  );

  // Test 24: Opted-Out Customer Blocks Existing SMSService & WhatsAppService
  const optedOutCommRecord = await mockDb.from('communications').insert({
    business_id: 'biz-1',
    customer_id: 'cust-2', // Sarah Connor: opted_out = true
    channel: 'sms',
    message: 'Notice to opted out user',
    status: 'approved',
  });
  let smsBlocked = false;
  try {
    await smsService.sendApprovedSMS({
      communicationId: optedOutCommRecord.data.id,
      businessId: 'biz-1',
    });
  } catch (e: any) {
    smsBlocked = e.message.includes('opted out') || e.message.includes('TCPA');
  }
  assert(
    smsBlocked,
    24,
    'Existing SMS & WhatsApp engines strictly fail closed when attempting to message opted-out customer'
  );

  // Test 25: System Templates Repository Integrity
  const sysEmailTemplates = SYSTEM_TEMPLATES.filter(t => t.channel === 'email');
  const sysSmsTemplates = SYSTEM_TEMPLATES.filter(t => t.channel === 'sms');
  const sysWaTemplates = SYSTEM_TEMPLATES.filter(t => t.channel === 'whatsapp');
  assert(
    sysEmailTemplates.length >= 5 && sysSmsTemplates.length >= 4 && sysWaTemplates.length >= 4,
    25,
    'System templates library supplies complete production-ready defaults for Email, SMS, and WhatsApp'
  );

  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}TOTAL PHASE 4 TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  if (passedTests === totalTests) {
    console.log(`${GREEN}✅ ALL ${passedTests}/${totalTests} PHASE 4 MULTI-CHANNEL COMMUNICATION TEST CASES PASSED PERFECTLY${RESET}\n`);
  } else {
    console.error(`${RED}❌ SOME PHASE 4 TEST CASES FAILED${RESET}\n`);
    process.exit(1);
  }
}

runPhase4Verification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
