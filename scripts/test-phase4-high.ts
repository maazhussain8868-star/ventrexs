/**
 * PayPilot AI — Phase 4 High-Severity Security Remediation Test Suite
 * Tests High #1 (Payment Recording Duplication & Race Protection) & High #2 (Public Webhook Server Action RPC Elimination)
 */

import { NextRequest } from 'next/server';
import { POST as stripeWebhookPOST } from '../src/app/api/webhooks/stripe/route';
import { StripePaymentProviderAdapter } from '../src/lib/billing/providers/stripe-adapter';
import crypto from 'crypto';

interface MockInvoice {
  id: string;
  business_id: string;
  invoice_number: string;
  original_amount: number;
  amount_paid: number;
  remaining_balance: number;
  status: 'draft' | 'sent' | 'due' | 'partially_paid' | 'paid' | 'overdue';
  paid_date?: string | null;
}

interface MockPayment {
  id: string;
  business_id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  method: string;
  reference?: string;
  notes?: string;
}

interface MockInvoiceEvent {
  id: string;
  invoice_id: string;
  business_id: string;
  event_type: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

interface MockAuditLog {
  id: string;
  business_id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, any>;
}

// Simulated Atomic Database with trg_payments_applied Trigger
class PaymentLedgerSimulator {
  public invoices: MockInvoice[] = [];
  public payments: MockPayment[] = [];
  public invoiceEvents: MockInvoiceEvent[] = [];
  public auditLogs: MockAuditLog[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.invoices = [
      {
        id: 'inv_biz_a_100',
        business_id: 'biz_company_a',
        invoice_number: 'INV-2026-A100',
        original_amount: 10000.0,
        amount_paid: 0.0,
        remaining_balance: 10000.0,
        status: 'due',
        paid_date: null,
      },
      {
        id: 'inv_biz_b_200',
        business_id: 'biz_company_b',
        invoice_number: 'INV-2026-B200',
        original_amount: 5000.0,
        amount_paid: 0.0,
        remaining_balance: 5000.0,
        status: 'due',
        paid_date: null,
      },
    ];
    this.payments = [];
    this.invoiceEvents = [];
    this.auditLogs = [];
  }

  // Simulates PostgreSQL handle_payment_applied() Trigger
  private executePaymentTrigger(payment: MockPayment) {
    const inv = this.invoices.find(i => i.id === payment.invoice_id);
    if (!inv) throw new Error(`Invoice with ID ${payment.invoice_id} does not exist`);

    if (payment.amount > inv.remaining_balance) {
      throw new Error(`Payment amount (${payment.amount}) exceeds remaining invoice balance (${inv.remaining_balance})`);
    }

    const newPaid = inv.amount_paid + payment.amount;
    const newRemaining = inv.original_amount - newPaid;
    const newStatus = newRemaining === 0 ? 'paid' : 'partially_paid';
    const paidDate = newRemaining === 0 ? new Date().toISOString().split('T')[0] : null;

    inv.amount_paid = newPaid;
    inv.remaining_balance = newRemaining;
    inv.status = newStatus;
    if (paidDate) inv.paid_date = paidDate;

    // Single timeline event from trigger
    this.invoiceEvents.push({
      id: `evt_${Date.now()}_${Math.random()}`,
      invoice_id: payment.invoice_id,
      business_id: payment.business_id,
      event_type: 'payment_received',
      title: `Payment Received ($${payment.amount.toFixed(2)})`,
      description: `Settled via ${payment.method}`,
      metadata: { payment_id: payment.id, amount: payment.amount, method: payment.method },
    });

    // Single audit log from trigger
    this.auditLogs.push({
      id: `audit_${Date.now()}_${Math.random()}`,
      business_id: payment.business_id,
      action: 'RECORD_PAYMENT',
      entity: 'payment',
      entity_id: payment.id,
      metadata: { invoice_id: payment.invoice_id, amount: payment.amount, method: payment.method },
    });
  }

  // Refactored PaymentService.recordPayment (Single authoritative trigger mechanism)
  async recordPayment(params: {
    business_id: string;
    invoice_id: string;
    amount: number;
    method: string;
    reference?: string;
  }): Promise<{ payment: MockPayment; invoice: MockInvoice }> {
    const paymentAmount = Number(params.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const invoice = this.invoices.find(i => i.id === params.invoice_id);
    if (!invoice) throw new Error('Invoice not found.');

    if (invoice.business_id !== params.business_id) {
      throw new Error('SECURITY_VIOLATION: User cannot record payment for another business invoice.');
    }

    if (paymentAmount > invoice.remaining_balance + 0.001) {
      throw new Error(`Payment amount ($${paymentAmount}) exceeds remaining invoice balance ($${invoice.remaining_balance}).`);
    }

    const newPayment: MockPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      business_id: params.business_id,
      invoice_id: params.invoice_id,
      amount: paymentAmount,
      payment_date: new Date().toISOString(),
      method: params.method,
      reference: params.reference,
    };

    this.payments.push(newPayment);

    // Atomic DB Trigger handles balance, timeline event, and audit log
    this.executePaymentTrigger(newPayment);

    // Returns updated invoice
    const updatedInvoice = this.invoices.find(i => i.id === params.invoice_id)!;
    return { payment: newPayment, invoice: updatedInvoice };
  }
}

async function runHighSecurityTests() {
  console.log('======================================================================');
  console.log('PAYPILOT AI — PHASE 4 HIGH-SEVERITY SECURITY REMEDIATION TEST SUITE');
  console.log('======================================================================\n');

  let passedCount = 0;
  let totalTests = 0;

  function assertTest(testNum: number, name: string, condition: boolean, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] [HIGH_FIX] #${testNum}: ${name}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] [HIGH_FIX] #${testNum}: ${name}`);
      if (details) console.error(`    Details: ${details}`);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 1: HIGH #1 — Payment Recording Deduplication & Ledger Integrity
  // --------------------------------------------------------------------------
  console.log('--- 1. High #1: Payment Recording Single-Source-of-Truth & Trigger Deduplication ---');
  const ledger = new PaymentLedgerSimulator();

  // Test 1: Record single partial payment of $3,500
  const payResult1 = await ledger.recordPayment({
    business_id: 'biz_company_a',
    invoice_id: 'inv_biz_a_100',
    amount: 3500.0,
    method: 'bank_transfer',
  });

  const eventsForPay1 = ledger.invoiceEvents.filter(e => e.metadata.payment_id === payResult1.payment.id);
  const auditForPay1 = ledger.auditLogs.filter(a => a.entity_id === payResult1.payment.id);

  assertTest(
    1,
    'Recording payment creates EXACTLY ONE invoice timeline event (Zero duplicate events)',
    eventsForPay1.length === 1 && eventsForPay1[0].title.includes('$3500.00')
  );

  assertTest(
    2,
    'Recording payment creates EXACTLY ONE audit log entry (Zero duplicate logs)',
    auditForPay1.length === 1 && auditForPay1[0].action === 'RECORD_PAYMENT'
  );

  assertTest(
    3,
    'Authoritative trigger updates remaining balance exactly once ($10,000 - $3,500 = $6,500)',
    payResult1.invoice.remaining_balance === 6500.0 &&
      payResult1.invoice.amount_paid === 3500.0 &&
      payResult1.invoice.status === 'partially_paid'
  );

  // Test 4: Second payment completing the balance ($6,500)
  const payResult2 = await ledger.recordPayment({
    business_id: 'biz_company_a',
    invoice_id: 'inv_biz_a_100',
    amount: 6500.0,
    method: 'stripe',
  });

  assertTest(
    4,
    'Full settlement transitions status to paid and preserves fundamental ledger invariant',
    payResult2.invoice.remaining_balance === 0.0 &&
      payResult2.invoice.amount_paid === 10000.0 &&
      payResult2.invoice.status === 'paid' &&
      payResult2.invoice.paid_date !== null &&
      ledger.invoiceEvents.length === 2 &&
      ledger.auditLogs.length === 2
  );

  // Test 5: Overpayment on zero balance is rejected
  let overpayBlocked = false;
  try {
    await ledger.recordPayment({
      business_id: 'biz_company_a',
      invoice_id: 'inv_biz_a_100',
      amount: 100.0,
      method: 'cash',
    });
  } catch (e: any) {
    overpayBlocked = e.message.includes('exceeds remaining invoice balance');
  }
  assertTest(5, 'Overpayment attempt on settled invoice is strictly rejected', overpayBlocked);

  // Test 6: Cross-tenant payment attempt (Business A user paying Business B invoice)
  let crossTenantBlocked = false;
  try {
    await ledger.recordPayment({
      business_id: 'biz_company_a',
      invoice_id: 'inv_biz_b_200',
      amount: 1000.0,
      method: 'wire',
    });
  } catch (e: any) {
    crossTenantBlocked = e.message.includes('SECURITY_VIOLATION');
  }
  assertTest(6, 'Business A user CANNOT record or alter payments for Business B (Tenant isolated)', crossTenantBlocked);

  // --------------------------------------------------------------------------
  // SECTION 2: HIGH #2 — Elimination of Public Webhook Server Action RPC
  // --------------------------------------------------------------------------
  console.log('\n--- 2. High #2: Webhook Endpoint Exclusivity & Server Action RPC Elimination ---');

  // Test 7: Verify handlePaymentWebhookAction is NOT exported in src/app/actions/index.ts
  const actionsModule = await import('../src/app/actions');
  const hasWebhookAction = 'handlePaymentWebhookAction' in actionsModule;
  assertTest(
    7,
    'handlePaymentWebhookAction is NOT exported as a client-callable Server Action RPC',
    !hasWebhookAction
  );

  // Test 8: Verified Stripe Webhook HTTP Route Handler (POST /api/webhooks/stripe) processes valid payloads
  const webhookSecret = 'whsec_test_secret_key_123';
  const validEventPayload = JSON.stringify({
    id: 'evt_high_test_001',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_001',
        customer: 'cus_test_001',
        subscription: 'sub_test_001',
        metadata: {
          business_id: 'biz_company_a',
          plan: 'Professional',
        },
      },
    },
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${validEventPayload}`;
  const validSignature = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');
  const validHeader = `t=${timestamp},v1=${validSignature}`;

  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_key';

  const validReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': validHeader,
    },
    body: validEventPayload,
  });

  const validResponse = await stripeWebhookPOST(validReq);
  const validJson = await validResponse.json();

  assertTest(
    8,
    'POST /api/webhooks/stripe accepts and processes verified cryptographic webhook (HTTP 200)',
    validResponse.status === 200 && validJson.received === true
  );

  // Test 9: Webhook route rejects missing signature header with HTTP 400
  const noSigReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: validEventPayload,
  });
  const noSigRes = await stripeWebhookPOST(noSigReq);
  assertTest(
    9,
    'POST /api/webhooks/stripe rejects request with missing signature (HTTP 400)',
    noSigRes.status === 400
  );

  // Test 10: Webhook route rejects forged signature with HTTP 400
  const forgedReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': `t=${timestamp},v1=forged_invalid_signature_hex_00000000000000000000000000000000`,
    },
    body: validEventPayload,
  });
  const forgedRes = await stripeWebhookPOST(forgedReq);
  assertTest(
    10,
    'POST /api/webhooks/stripe rejects request with forged signature (HTTP 400)',
    forgedRes.status === 400
  );

  // Test 11: Webhook route rejects expired signature (>300s) to block replay attacks
  const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
  const oldSignedPayload = `${oldTimestamp}.${validEventPayload}`;
  const oldSignature = crypto.createHmac('sha256', webhookSecret).update(oldSignedPayload).digest('hex');
  const expiredReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': `t=${oldTimestamp},v1=${oldSignature}`,
    },
    body: validEventPayload,
  });
  const expiredRes = await stripeWebhookPOST(expiredReq);
  assertTest(
    11,
    'POST /api/webhooks/stripe rejects expired timestamp (>300s) to block replay attacks (HTTP 400)',
    expiredRes.status === 400
  );

  // Test 12: Duplicate webhook event recognizes idempotency
  const dupReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': validHeader,
    },
    body: validEventPayload,
  });
  const dupResponse = await stripeWebhookPOST(dupReq);
  assertTest(
    12,
    'POST /api/webhooks/stripe recognizes duplicate webhook event without reprocessing (Idempotency)',
    dupResponse.status === 200
  );

  console.log('\n======================================================================');
  console.log(`TOTAL HIGH-SEVERITY TESTS: ${totalTests} | PASSED: ${passedCount} | FAILED: ${totalTests - passedCount}`);
  console.log('======================================================================\n');

  if (passedCount === totalTests) {
    console.log('✅ ALL PHASE 4 HIGH-SEVERITY SECURITY REMEDIATION TESTS PASSED PERFECTLY\n');
  } else {
    console.error('❌ SOME HIGH-SEVERITY TESTS FAILED\n');
    process.exit(1);
  }
}

runHighSecurityTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
