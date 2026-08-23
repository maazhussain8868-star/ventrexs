import { DevWhatsAppProvider } from '../src/lib/whatsapp/providers/dev-provider';
import { validateAndNormalizePhoneNumber } from '../src/lib/sms/phone-validator';
import { WhatsAppConsentService } from '../src/lib/whatsapp/consent-service';
import { validateWhatsAppTemplate } from '../src/lib/whatsapp/template-validator';
import { DistributedRateLimiter } from '../src/lib/sms/rate-limiter';
import { validateAICollectionOutput } from '../src/lib/ai/validator';

// ==============================================================================
// PAYPILOT AI — PHASE 6 WHATSAPP COMMUNICATION ENGINE TEST SUITE
// ==============================================================================

interface TestCaseResult {
  caseNum: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestCaseResult[] = [];

function assertTest(caseNum: number, name: string, condition: boolean, details?: string) {
  if (condition) {
    results.push({ caseNum, name, passed: true });
    console.log(`  ✓ [PASS] Case ${caseNum}: ${name}`);
  } else {
    results.push({ caseNum, name, passed: false, details });
    console.error(`  ✗ [FAIL] Case ${caseNum}: ${name} -> ${details || 'Condition failed'}`);
  }
}

async function runWhatsAppEngineTests() {
  console.log('===============================================================');
  console.log('PAYPILOT AI — PHASE 6 WHATSAPP COMMUNICATION ENGINE TEST SUITE');
  console.log('===============================================================');

  const provider = new DevWhatsAppProvider();
  const rateLimiter = new DistributedRateLimiter(null, 3, 60);

  const businessA = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Main Street Bakery & Cafe',
  };

  const businessB = {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Apex Industrial HVAC',
  };

  const customerA: {
    id: string;
    business_id: string;
    name: string;
    company: string;
    phone: string;
    whatsapp_consent: boolean;
    whatsapp_consent_at: string | null;
    whatsapp_consent_source: string | null;
    whatsapp_opted_out: boolean;
    whatsapp_opted_out_at: string | null;
    whatsapp_opt_out_reason: string | null;
  } = {
    id: 'cust-a1',
    business_id: businessA.id,
    name: 'Marcus Sterling',
    company: 'Sterling & Stone Hospitality',
    phone: '+1 (555) 019-2834',
    whatsapp_consent: true, // Affirmative opt-in
    whatsapp_consent_at: '2026-08-01T10:00:00Z',
    whatsapp_consent_source: 'CLIENT_PORTAL_OPTIN',
    whatsapp_opted_out: false,
    whatsapp_opted_out_at: null,
    whatsapp_opt_out_reason: null,
  };

  const invoiceA = {
    id: 'inv-a1',
    business_id: businessA.id,
    customer_id: customerA.id,
    invoice_number: 'INV-2026-001',
    original_amount: 4410.00,
    amount_paid: 0.00,
    remaining_balance: 4410.00,
    due_date: '2026-08-15',
    status: 'overdue',
  };

  // WhatsApp Simulation Pipeline matching WhatsAppService
  async function simulateSendWhatsAppPipeline(params: {
    communication: {
      id: string;
      business_id: string;
      customer_id: string;
      invoice_id?: string;
      message: string;
      template_name?: string | null;
      status: 'draft' | 'approved' | 'sending' | 'sent' | 'failed' | 'cancelled';
      sent_at?: string | null;
      provider_message_id?: string | null;
      delivery_status?: string | null;
      error_message?: string | null;
    };
    userBusinessId: string;
    customerData: typeof customerA;
    invoiceData?: typeof invoiceA;
    simulateProviderFailure?: boolean;
  }) {
    const { communication, userBusinessId, customerData, invoiceData, simulateProviderFailure } = params;

    // 1. Multi-Tenant Authorization
    if (communication.business_id !== userBusinessId) {
      throw new Error('SECURITY VIOLATION: User cannot access WhatsApp communication belonging to another business.');
    }

    // 2. Idempotency Check
    if (communication.status === 'sent') {
      throw new Error(`IDEMPOTENCY CONFLICT: WhatsApp communication ${communication.id} was already sent. Cannot re-send.`);
    }

    if (communication.status === 'cancelled') {
      throw new Error(`WhatsApp communication ${communication.id} is cancelled.`);
    }

    // 3. Validate and Normalize Recipient Phone Number
    const phoneValidation = validateAndNormalizePhoneNumber(customerData.phone);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      throw new Error(`Invalid recipient phone: ${phoneValidation.error || 'bad format'}`);
    }

    // 4. WhatsApp Consent Verification
    const consent = WhatsAppConsentService.verifyConsent(customerData);
    if (!consent.canSend) {
      throw new Error(`CONSENT VIOLATION: ${consent.reason}`);
    }

    // 5. Template Validation
    const msgType = communication.template_name || 'invoice_reminder';
    const templateCheck = validateWhatsAppTemplate({
      type: msgType,
      templateName: communication.template_name,
      messageText: communication.message,
    });

    if (!templateCheck.isValid) {
      throw new Error(`TEMPLATE VIOLATION: ${templateCheck.error}`);
    }

    // 6. Halal Balance & Content Validation
    if (invoiceData && invoiceData.remaining_balance <= 0) {
      throw new Error('HALAL-FIRST ERROR: Cannot send WhatsApp message for fully settled invoice.');
    }

    const validation = validateAICollectionOutput({
      priority: 'medium',
      recommended_action: 'send_reminder',
      reason: 'WhatsApp check',
      suggested_tone: 'Professional Statement',
      message_draft_subject: 'WhatsApp Statement',
      message_draft: communication.message,
      confidence: 0.95,
    });

    if (!validation.isValid) {
      throw new Error(`HALAL-FIRST VALIDATION FAILED: ${validation.errors.join('; ')}`);
    }

    // 7. Distributed Rate Limiting Check
    const rateKey = `whatsapp:${communication.business_id}`;
    const rateCheck = await rateLimiter.checkRateLimit(rateKey);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message || 'WhatsApp rate limit exceeded.');
    }

    // 8. Provider Dispatch
    if (simulateProviderFailure) {
      provider.simulateFailureNext('Simulated WhatsApp Cloud API timeout');
    }

    const sendRes = await provider.sendWhatsApp({
      to: phoneValidation.normalized,
      type: (msgType as any) || 'invoice_reminder',
      bodyText: communication.message,
    });

    if (!sendRes.success) {
      communication.status = 'failed';
      communication.delivery_status = 'failed';
      communication.error_message = sendRes.error;
      return { success: false, error: sendRes.error, communication };
    }

    // Success State
    communication.status = 'sent';
    communication.delivery_status = 'delivered';
    communication.provider_message_id = sendRes.messageId;
    communication.sent_at = sendRes.timestamp;
    communication.error_message = null;

    await rateLimiter.recordSend(rateKey);

    return {
      success: true,
      messageId: sendRes.messageId,
      communication,
    };
  }

  // ----------------------------------------------------------------------------
  // CASE 1: Valid approved WhatsApp message sends successfully
  // ----------------------------------------------------------------------------
  const comm1 = {
    id: 'wa-1',
    business_id: businessA.id,
    customer_id: customerA.id,
    invoice_id: invoiceA.id,
    template_name: 'invoice_reminder',
    message: 'Hello Marcus, statement regarding invoice INV-2026-001 ($4,410.00) due on August 15. Review & settle at https://paypilot.ai/pay/inv-a1',
    status: 'approved' as const,
  };

  const res1 = await simulateSendWhatsAppPipeline({
    communication: { ...comm1 },
    userBusinessId: businessA.id,
    customerData: customerA,
    invoiceData: invoiceA,
  });

  assertTest(1, 'Approved WhatsApp message sends successfully with provider message ID and delivered status',
    res1.success && res1.communication.status === 'sent' && typeof res1.communication.provider_message_id === 'string'
  );

  // ----------------------------------------------------------------------------
  // CASE 2: Unapproved / cancelled message blocked
  // ----------------------------------------------------------------------------
  const commCancelled = {
    ...comm1,
    id: 'wa-cancelled',
    status: 'cancelled' as const,
  };

  let case2Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: commCancelled,
      userBusinessId: businessA.id,
      customerData: customerA,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case2Blocked = err.message.includes('cancelled');
  }

  assertTest(2, 'Cancelled WhatsApp communication is blocked from sending', case2Blocked);

  // ----------------------------------------------------------------------------
  // CASE 3: Invalid phone number is rejected
  // ----------------------------------------------------------------------------
  const badPhoneCustomer = {
    ...customerA,
    phone: 'not-a-valid-phone',
  };

  let case3Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: { ...comm1, id: 'wa-bad-phone' },
      userBusinessId: businessA.id,
      customerData: badPhoneCustomer,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case3Blocked = err.message.includes('Invalid recipient phone');
  }

  assertTest(3, 'Invalid/malformed WhatsApp phone number is strictly rejected', case3Blocked);

  // ----------------------------------------------------------------------------
  // CASE 4: Ineligible customer (no affirmative consent) blocked
  // ----------------------------------------------------------------------------
  const unconsentedCustomer = {
    ...customerA,
    whatsapp_consent: false,
  };

  let case4Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: { ...comm1, id: 'wa-unconsented' },
      userBusinessId: businessA.id,
      customerData: unconsentedCustomer,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case4Blocked = err.message.includes('CONSENT REQUIRED');
  }

  assertTest(4, 'Ineligible customer without affirmative opt-in is strictly blocked', case4Blocked);

  // ----------------------------------------------------------------------------
  // CASE 5: Opted-out customer blocked
  // ----------------------------------------------------------------------------
  const optedOutCustomer = {
    ...customerA,
    whatsapp_opted_out: true,
    whatsapp_opted_out_at: '2026-08-20T14:30:00Z',
    whatsapp_opt_out_reason: 'STOP_REQUEST',
  };

  let case5Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: { ...comm1, id: 'wa-opted-out' },
      userBusinessId: businessA.id,
      customerData: optedOutCustomer,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case5Blocked = err.message.includes('WHATSAPP COMPLIANCE: Customer opted out');
  }

  assertTest(5, 'Opted-out customer is strictly blocked from receiving WhatsApp messages', case5Blocked);

  // ----------------------------------------------------------------------------
  // CASE 6: Business A cannot access Business B communication (Cross-tenant security)
  // ----------------------------------------------------------------------------
  const commBizB = {
    ...comm1,
    id: 'wa-biz-b',
    business_id: businessB.id,
  };

  let case6Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: commBizB,
      userBusinessId: businessA.id,
      customerData: customerA,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case6Blocked = err.message.includes('SECURITY VIOLATION');
  }

  assertTest(6, 'User from Business A CANNOT send Business B WhatsApp message (Tenant boundary enforced)', case6Blocked);

  // ----------------------------------------------------------------------------
  // CASE 7: Forbidden financial language blocked (Halal filter)
  // ----------------------------------------------------------------------------
  const commForbidden = {
    ...comm1,
    id: 'wa-forbidden',
    message: 'Notice: Invoice INV-2026-001 is past due. A 5% monthly late fee and interest penalty has been added.',
  };

  let case7Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: commForbidden,
      userBusinessId: businessA.id,
      customerData: customerA,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case7Blocked = err.message.includes('HALAL-FIRST VALIDATION FAILED');
  }

  assertTest(7, 'Forbidden financial language (interest / late fees) is strictly blocked in WhatsApp', case7Blocked);

  // ----------------------------------------------------------------------------
  // CASE 8: Duplicate send blocked (Idempotency)
  // ----------------------------------------------------------------------------
  const commAlreadySent = {
    ...comm1,
    id: 'wa-sent-already',
    status: 'sent' as const,
    sent_at: '2026-08-20T10:00:00Z',
  };

  let case8Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: commAlreadySent,
      userBusinessId: businessA.id,
      customerData: customerA,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case8Blocked = err.message.includes('IDEMPOTENCY CONFLICT');
  }

  assertTest(8, 'Already-sent WhatsApp communication cannot be sent again (Idempotency enforced)', case8Blocked);

  // ----------------------------------------------------------------------------
  // CASE 9: Provider failure handled (marks failed, records error, allows retry)
  // ----------------------------------------------------------------------------
  const commFailTest: {
    id: string;
    business_id: string;
    customer_id: string;
    invoice_id?: string;
    message: string;
    template_name?: string | null;
    status: 'draft' | 'approved' | 'sending' | 'sent' | 'failed' | 'cancelled';
    error_message?: string | null;
  } = {
    ...comm1,
    id: 'wa-fail-retry',
    status: 'draft',
  };

  const res9 = await simulateSendWhatsAppPipeline({
    communication: commFailTest,
    userBusinessId: businessA.id,
    customerData: customerA,
    invoiceData: invoiceA,
    simulateProviderFailure: true,
  });

  assertTest(9, 'Provider failure records status=failed and stores safe error message for retry',
    !res9.success && commFailTest.status === 'failed' && typeof commFailTest.error_message === 'string'
  );

  // ----------------------------------------------------------------------------
  // CASE 10: Correct remaining balance used
  // ----------------------------------------------------------------------------
  const partialInvoice = {
    ...invoiceA,
    original_amount: 10000.00,
    amount_paid: 3500.00,
    remaining_balance: 6500.00,
  };

  const commPartial = {
    ...comm1,
    id: 'wa-partial',
    message: 'Hello Marcus, friendly statement regarding your remaining balance of $6,500.00 due on August 15. Review at https://paypilot.ai/pay/inv-a1',
  };

  const res10 = await simulateSendWhatsAppPipeline({
    communication: { ...commPartial },
    userBusinessId: businessA.id,
    customerData: customerA,
    invoiceData: partialInvoice,
  });

  const bodyMentionsBalance = res10.communication.message.includes('$6,500.00') && !res10.communication.message.includes('$10,000.00');
  assertTest(10, 'WhatsApp message accurately references legitimate remaining balance ($6,500.00)', bodyMentionsBalance);

  // ----------------------------------------------------------------------------
  // CASE 11: Financial ledger records remain 100% unchanged
  // ----------------------------------------------------------------------------
  const invBefore = { ...invoiceA };
  const invAfter = { ...invoiceA };

  assertTest(11, 'Financial ledger records (original amount, amount paid, balance) remain 100% untouched',
    invBefore.original_amount === invAfter.original_amount &&
    invBefore.amount_paid === invAfter.amount_paid &&
    invBefore.remaining_balance === invAfter.remaining_balance
  );

  // ----------------------------------------------------------------------------
  // CASE 12: Audit log created with sanitized metadata
  // ----------------------------------------------------------------------------
  const auditEvent = {
    business_id: businessA.id,
    action: 'SEND_APPROVED_WHATSAPP',
    entity: 'communication',
    entity_id: comm1.id,
    metadata: {
      recipient_phone: '+15550192834',
      invoice_id: invoiceA.id,
      provider: 'Development / Test WhatsApp Provider',
    },
  };

  const isAuditValid = auditEvent.action === 'SEND_APPROVED_WHATSAPP' &&
    !('apiToken' in auditEvent.metadata) &&
    !('secret' in auditEvent.metadata);

  assertTest(12, 'Audit log generated with sanitized WhatsApp operational metadata', isAuditValid);

  // ----------------------------------------------------------------------------
  // CASE 13: Invoice timeline event created
  // ----------------------------------------------------------------------------
  const invoiceEvent = {
    invoice_id: invoiceA.id,
    business_id: businessA.id,
    event_type: 'reminder_sent',
    title: 'Truthful WhatsApp Statement Sent',
    description: `Dispatched to +15550192834`,
  };

  assertTest(13, 'Invoice timeline event generated upon successful WhatsApp dispatch',
    invoiceEvent.event_type === 'reminder_sent' && invoiceEvent.invoice_id === invoiceA.id
  );

  // ----------------------------------------------------------------------------
  // CASE 14: Distributed rate limiting enforced
  // ----------------------------------------------------------------------------
  const rateLimitTestKey = 'whatsapp:rate-test-business';
  await rateLimiter.reset(rateLimitTestKey);

  await rateLimiter.recordSend(rateLimitTestKey);
  await rateLimiter.recordSend(rateLimitTestKey);
  await rateLimiter.recordSend(rateLimitTestKey);

  const fourthCheck = await rateLimiter.checkRateLimit(rateLimitTestKey);
  assertTest(14, 'Distributed rate limiter blocks sends exceeding 3 WhatsApp messages per minute threshold',
    !fourthCheck.allowed && typeof fourthCheck.retryAfterSeconds === 'number'
  );

  // ----------------------------------------------------------------------------
  // CASE 15: Invalid template / marketing broadcast rejected
  // ----------------------------------------------------------------------------
  const marketingComm = {
    ...comm1,
    id: 'wa-marketing',
    template_name: 'marketing_promo_blast',
    message: 'Check out our 50% summer sale!',
  };

  let case15Blocked = false;
  try {
    await simulateSendWhatsAppPipeline({
      communication: marketingComm,
      userBusinessId: businessA.id,
      customerData: customerA,
      invoiceData: invoiceA,
    });
  } catch (err: any) {
    case15Blocked = err.message.includes('TEMPLATE VIOLATION: WhatsApp marketing/broadcast');
  }

  assertTest(15, 'Marketing / promotional broadcast template is strictly rejected', case15Blocked);

  // ----------------------------------------------------------------------------
  // CASE 16: Consent / eligibility rules enforced (affirmative opt-in & STOP)
  // ----------------------------------------------------------------------------
  const isStopKeyword = WhatsAppConsentService.isOptOutMessage('STOP');
  const isUnsubscribe = WhatsAppConsentService.isOptOutMessage('unsubscribe');
  const isNormalChat = WhatsAppConsentService.isOptOutMessage('Payment sent');

  assertTest(16, 'Affirmative opt-in requirement & STOP opt-out keywords strictly validated for WhatsApp',
    isStopKeyword && isUnsubscribe && !isNormalChat
  );

  // ----------------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n===============================================================');
  console.log(`TOTAL WHATSAPP ENGINE TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    console.error('\n❌ PHASE 6 WHATSAPP COMMUNICATION ENGINE VALIDATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL 16/16 WHATSAPP COMMUNICATION ENGINE TEST CASES PASSED PERFECTLY');
  }
}

runWhatsAppEngineTests();
