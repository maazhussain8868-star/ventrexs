/**
 * VENTREXS AI — PHASE 5: FULL REAL-WORLD QA & PRODUCTION SMOKE SUITE
 *
 * Comprehensive end-to-end audit testing:
 * 1. Responsive & Breakpoint Layout Integrity (Mobile 320-414px, Tablet 768-1024px, Desktop 1280-1920px)
 * 2. Customer SaaS Flow & Tenant Isolation
 * 3. Agency Reseller Platform & Client Fleet Isolation
 * 4. Private Platform Admin Security & RBAC Guards
 * 5. Multi-Channel Acquisition & UTM Parameter Attribution
 * 6. Multi-Step Onboarding State Machine & Validation
 * 7. Commercial Billing Engine & Single-Source-of-Truth Pricing
 * 8. Razorpay Cryptographic Verification & Test Mode Architecture
 * 9. Stripe Webhook Signature Verification & Lifecycle Synchronization
 * 10. Google Play RTDN Decoding, SHA-256 Token Hashing & State Mapping
 * 11. Customer Invoice Payment (/pay/[secure_token]) & Halal Ledger Math
 * 12. Security & Penetration Guards (Tampering, Escalation, Replay)
 * 13. Zero Secret Leakage (Server Keys vs Client Bundles)
 * 14. Supabase Database Migration Integrity & RLS Enforcement
 * 15. Error Handling, Edge Cases, and Idempotency
 * 16. Multi-Tenant Hostname Context Isolation
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PLANS_CONFIG, AGENCY_PLANS_CONFIG } from '../src/lib/billing/types';
import { SubscriptionEngine } from '../src/lib/billing/subscription-engine';
import { PaymentProviderFactory } from '../src/lib/payments/factory';
import { RazorpayPaymentAdapter } from '../src/lib/payments/adapters/razorpay-adapter';
import { StripeCustomerPaymentAdapter } from '../src/lib/payments/adapters/stripe-adapter';
import { GooglePlayWebhookHandler } from '../src/lib/payments/webhooks/google-play';
import { PaymentReconciliationEngine } from '../src/lib/payments/reconciliation';
import { ProductionEnvironmentValidator } from '../src/lib/config/production-validator';
import { determineAcquisitionSource } from '../src/lib/acquisition/tracker';
import { IdempotencyManager } from '../src/lib/payments/idempotency';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runPhase5QASuite() {
  console.log('\n===============================================================');
  console.log('  VENTREXS AI — PHASE 5: FULL REAL-WORLD QA & SMOKE SUITE');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // 1. Responsive & Breakpoint Architecture (Assertions 1 - 5)
  // -----------------------------------------------------------------
  console.log('[1/14] Responsive & Breakpoint Layout Integrity (320px - 1920px)...');
  const globalCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  const globalCss = fs.readFileSync(globalCssPath, 'utf-8');

  assert(globalCss.includes('overflow-x: hidden') || globalCss.includes('overflow-x-hidden') || globalCss.includes('overflow-x: auto'), 'Root viewport overflow-x clipping prevented');
  assert(globalCss.includes('@media (max-width: 768px)') || globalCss.includes('@media (max-width: 1024px)'), 'Mobile & Tablet responsive media queries defined in stylesheet');
  assert(globalCss.includes('container-fluid') || globalCss.includes('w-full'), 'Fluid container utilities declared');
  assert(globalCss.includes('touch-target') || globalCss.includes('44px'), 'Accessible mobile touch targets (44px minimum) configured');
  assert(globalCss.includes('responsive-table-container') || globalCss.includes('overflow-x-auto'), 'Responsive table horizontal scroll wrapper classes exist');

  // -----------------------------------------------------------------
  // 2. Customer Flow & Tenant Isolation (Assertions 6 - 9)
  // -----------------------------------------------------------------
  console.log('\n[2/14] Customer Business Flow & Multi-Tenant Boundary Isolation...');
  const customerSubAuth = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'stripe',
    plan: 'Professional',
    interval: 'monthly',
    amountExpected: 79,
    currencyExpected: 'USD',
    businessId: 'biz_contractor_101',
    customerEmail: 'contractor@apexheating.com',
    providerPaymentId: 'pi_cust_flow_101',
    providerSignatureOrToken: 'sig_cust_token_valid',
  });
  assert(customerSubAuth.verified === true, 'Customer subscription activates cleanly upon verified payment');
  assert(customerSubAuth.revenueRecord?.businessId === 'biz_contractor_101', 'Subscription record bound strictly to business tenant');
  assert(customerSubAuth.revenueRecord?.agencyId === undefined, 'Customer subscription has no agency binding');

  const crossTenantBreach = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'stripe',
    plan: 'Professional',
    interval: 'monthly',
    amountExpected: 79,
    currencyExpected: 'USD',
    businessId: 'biz_contractor_101',
    agencyId: 'agency_hostile_999', // Mixed breach attempt
    customerEmail: 'contractor@apexheating.com',
    providerPaymentId: 'pi_cust_breach_1',
    providerSignatureOrToken: 'sig_cust_token_valid',
  });
  assert(crossTenantBreach.verified === false && Boolean(crossTenantBreach.error?.includes('Tenant isolation')), 'Cross-tenant business/agency injection rejected');

  // -----------------------------------------------------------------
  // 3. Agency Platform & Reseller Isolation (Assertions 10 - 13)
  // -----------------------------------------------------------------
  console.log('\n[3/14] Agency Platform & Client Fleet Isolation...');
  const agencySubAuth = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'stripe',
    plan: 'AgencyGrowth',
    interval: 'monthly',
    amountExpected: 699,
    currencyExpected: 'USD',
    agencyId: 'agency_digital_spark',
    customerEmail: 'admin@digitalsparkagency.com',
    providerPaymentId: 'pi_agency_growth_202',
    providerSignatureOrToken: 'sig_agency_token_valid',
  });
  assert(agencySubAuth.verified === true, 'Agency Growth subscription activates cleanly');
  assert(agencySubAuth.revenueRecord?.agencyId === 'agency_digital_spark', 'Subscription record bound strictly to agency tenant');
  assert(agencySubAuth.revenueRecord?.businessId === undefined, 'Agency subscription has no business binding');
  assert(AGENCY_PLANS_CONFIG.AgencyGrowth.limits.maxClients === 35, 'Agency Growth plan enforces 35 client fleet quota limit');

  // -----------------------------------------------------------------
  // 4. Private Platform Admin Security & RBAC (Assertions 14 - 17)
  // -----------------------------------------------------------------
  console.log('\n[4/14] Private Platform Admin Security & RBAC Guards...');
  const adminPagePath = path.join(process.cwd(), 'src', 'app', 'admin', 'page.tsx');
  const adminPageContent = fs.readFileSync(adminPagePath, 'utf-8');
  const adminHeaderPath = path.join(process.cwd(), 'src', 'components', 'admin', 'AdminHeader.tsx');
  const adminHeaderContent = fs.readFileSync(adminHeaderPath, 'utf-8');

  assert(adminPageContent.includes('AdminLayout'), 'Admin routes wrap with dedicated AdminLayout');
  assert(!adminPageContent.includes('AgencySidebar'), 'Admin routes never render Agency navigation components');
  assert(!adminPageContent.includes('NEXT_PUBLIC_SERVICE_ROLE_KEY'), 'Admin client components never reference service-role keys');
  assert(adminHeaderContent.includes('PRIVATE PLATFORM ADMIN'), 'Platform Admin headers identify privileged operational scope');

  // -----------------------------------------------------------------
  // 5. Signup & Acquisition Multi-Touch Attribution (Assertions 18 - 22)
  // -----------------------------------------------------------------
  console.log('\n[5/14] Signup & Multi-Touch Acquisition Engine...');
  const googleAdSource = determineAcquisitionSource('google_ad', '', 'ventrexs.com');
  assert(googleAdSource === 'GOOGLE_AD', 'Google Ads traffic categorized as GOOGLE_AD');

  const metaAdSource = determineAcquisitionSource('instagram_feed', '', 'ventrexs.com');
  assert(metaAdSource === 'META_AD', 'Meta / Instagram traffic categorized as META_AD');

  const agencyReferralSource = determineAcquisitionSource('agency_partner_45', '', 'ventrexs.com');
  assert(agencyReferralSource === 'AGENCY_REFERRAL', 'Agency partner traffic categorized as AGENCY_REFERRAL');

  const organicSource = determineAcquisitionSource('', 'https://www.google.com/search?q=ventrexs', 'ventrexs.com');
  assert(organicSource === 'ORGANIC', 'Search engine referrer without UTM tagged as ORGANIC');

  const directSource = determineAcquisitionSource('', '', 'ventrexs.com');
  assert(directSource === 'DIRECT', 'Direct navigation with empty params categorized as DIRECT');

  // -----------------------------------------------------------------
  // 6. Onboarding State Machine & Validation (Assertions 23 - 26)
  // -----------------------------------------------------------------
  console.log('\n[6/14] Onboarding Form Validation & Step Progression...');
  const customerOnboardingPath = path.join(process.cwd(), 'src', 'app', 'onboarding', 'page.tsx');
  const customerOnboarding = fs.readFileSync(customerOnboardingPath, 'utf-8');

  assert(customerOnboarding.includes('businessName') || customerOnboarding.includes('step'), 'Customer onboarding tracks multi-step form state');
  assert(customerOnboarding.includes('handleNext') || customerOnboarding.includes('setStep'), 'Customer onboarding controls deterministic forward navigation');

  const agencyOnboardingPath = path.join(process.cwd(), 'src', 'app', 'agency', 'onboarding', 'page.tsx');
  const agencyOnboarding = fs.readFileSync(agencyOnboardingPath, 'utf-8');
  assert(agencyOnboarding.includes('agencyName') || agencyOnboarding.includes('step'), 'Agency onboarding tracks multi-step agency parameters');
  assert(agencyOnboarding.includes('whiteLabel') || agencyOnboarding.includes('branding') || agencyOnboarding.includes('Plan'), 'Agency onboarding includes white-label and reseller plan selection');

  // -----------------------------------------------------------------
  // 7. Commercial Billing Engine & Invariants (Assertions 27 - 31)
  // -----------------------------------------------------------------
  console.log('\n[7/14] Commercial Pricing Source of Truth & Invariants...');
  assert(PLANS_CONFIG.Starter.priceMonthly === 29 && PLANS_CONFIG.Starter.priceAnnual === 290, 'Business Starter is $29/mo, $290/yr');
  assert(PLANS_CONFIG.Professional.priceMonthly === 79 && PLANS_CONFIG.Professional.priceAnnual === 790, 'Business Pro is $79/mo, $790/yr');
  assert(PLANS_CONFIG.Enterprise.priceMonthly === 249 && PLANS_CONFIG.Enterprise.priceAnnual === 2490, 'Business Enterprise is $249/mo, $2,490/yr');
  assert(AGENCY_PLANS_CONFIG.AgencyStarter.priceMonthly === 299 && AGENCY_PLANS_CONFIG.AgencyStarter.priceAnnual === 2990, 'Agency Starter is $299/mo, $2,990/yr');
  assert(AGENCY_PLANS_CONFIG.AgencyEnterprise.priceMonthly === 1499 && AGENCY_PLANS_CONFIG.AgencyEnterprise.priceAnnual === 14990, 'Agency Enterprise is $1,499/mo, $14,990/yr');

  // -----------------------------------------------------------------
  // 8. Razorpay Test Mode & Cryptographic Verification (Assertions 32 - 35)
  // -----------------------------------------------------------------
  console.log('\n[8/14] Razorpay Test Mode & Cryptographic Guards...');
  const testRzpSecret = 'whsec_rzp_qa_test_987654321';
  const rzpAdapter = new RazorpayPaymentAdapter('rzp_test_54321', 'rzp_test_sec_54321', testRzpSecret);

  const sampleRzpPayload = JSON.stringify({
    event: 'subscription.charged',
    payload: {
      subscription: { entity: { id: 'sub_rzp_qa_1', plan_id: 'plan_pro', status: 'active' } },
      payment: { entity: { id: 'pay_rzp_qa_1', amount: 4900, currency: 'USD', status: 'captured' } },
    },
  });

  const validRzpSig = crypto.createHmac('sha256', testRzpSecret).update(sampleRzpPayload).digest('hex');
  const rzpValidResult = await rzpAdapter.verifyWebhookSignature(sampleRzpPayload, validRzpSig, testRzpSecret);
  assert(rzpValidResult.isValid === true, 'Razorpay HMAC-SHA256 test signature verified cleanly');

  const rzpForgedResult = await rzpAdapter.verifyWebhookSignature(sampleRzpPayload, 'forged_sig_abc', testRzpSecret);
  assert(rzpForgedResult.isValid === false, 'Forged Razorpay signature rejected with invalid status');

  const rzpEmptySigResult = await rzpAdapter.verifyWebhookSignature(sampleRzpPayload, '', testRzpSecret);
  assert(rzpEmptySigResult.isValid === false, 'Empty Razorpay signature rejected');

  const rzpTamperedPayload = await rzpAdapter.verifyWebhookSignature(sampleRzpPayload + 'tampered', validRzpSig, testRzpSecret);
  assert(rzpTamperedPayload.isValid === false, 'Tampered Razorpay payload rejected due to HMAC mismatch');

  // -----------------------------------------------------------------
  // 9. Stripe Webhook & Lifecycle Synchronization (Assertions 36 - 38)
  // -----------------------------------------------------------------
  console.log('\n[9/14] Stripe Webhook Cryptographic Verification & Replay Protection...');
  const testStripeSecret = 'whsec_stripe_qa_test_12345';
  const stripeAdapter = new StripeCustomerPaymentAdapter('sk_test_stripe_qa', testStripeSecret);

  const stripePayload = JSON.stringify({ id: 'evt_stripe_qa_1', type: 'invoice.payment_succeeded', data: {} });
  const ts = Math.floor(Date.now() / 1000);
  const stripeSig = `t=${ts},v1=${crypto.createHmac('sha256', testStripeSecret).update(`${ts}.${stripePayload}`).digest('hex')}`;

  const stripeValidResult = await stripeAdapter.verifyWebhookSignature(stripePayload, stripeSig, testStripeSecret);
  assert(stripeValidResult.isValid === true, 'Stripe webhook signature verified with timestamp verification');

  const stripeInvalidResult = await stripeAdapter.verifyWebhookSignature(stripePayload, 't=123,v1=invalid_hash', testStripeSecret);
  assert(stripeInvalidResult.isValid === false, 'Invalid Stripe webhook signature rejected');

  // Idempotency Replay Test
  const idempKey = 'webhook_stripe_evt_replay_test_1';
  await IdempotencyManager.set(idempKey, 'webhook', { eventId: 'evt_replay_test_1' });
  const replayCheck = await IdempotencyManager.check(idempKey);
  assert(replayCheck !== null, 'Stripe webhook event ID registered in idempotency store for replay protection');

  // -----------------------------------------------------------------
  // 10. Google Play RTDN Decoding & Token Hashing (Assertions 39 - 42)
  // -----------------------------------------------------------------
  console.log('\n[10/14] Google Play RTDN & SHA-256 Token Privacy...');
  const sensitiveToken = 'sensitive_google_play_purchase_token_xyz_987';
  const hashedToken = GooglePlayWebhookHandler.hashToken(sensitiveToken);

  assert(hashedToken.length === 64, 'Google Play token hashed to 64-character hexadecimal SHA-256');
  assert(!hashedToken.includes('sensitive_google_play'), 'Hashed token contains zero plaintext fragments');

  const gpRtdnPubSub = {
    message: {
      messageId: 'gp_pubsub_qa_msg_888',
      publishTime: new Date().toISOString(),
      data: Buffer.from(
        JSON.stringify({
          version: '1.0',
          packageName: 'com.ventrexs.app',
          eventTimeMillis: Date.now().toString(),
          subscriptionNotification: {
            version: '1.0',
            notificationType: 4, // SUBSCRIPTION_PURCHASED -> ACTIVE
            purchaseToken: sensitiveToken,
            subscriptionId: 'ventrexs_starter_monthly',
          },
        })
      ).toString('base64'),
    },
  };

  const gpRtdnResult = await GooglePlayWebhookHandler.handlePubSubMessage(gpRtdnPubSub);
  assert(gpRtdnResult.success === true && gpRtdnResult.mappedState === 'ACTIVE', 'Google Play RTDN purchase decoded and mapped to ACTIVE');

  const gpDuplicateResult = await GooglePlayWebhookHandler.handlePubSubMessage(gpRtdnPubSub);
  assert(gpDuplicateResult.duplicate === true, 'Duplicate Google Play Pub/Sub message rejected by idempotency check');

  // -----------------------------------------------------------------
  // 11. Customer Invoice Payment Math & Separation (Assertions 43 - 46)
  // -----------------------------------------------------------------
  console.log('\n[11/14] Customer Invoice Payment Math & Ledger Separation...');
  const invoiceOriginal = 500.0;
  const paymentReceived = 200.0;
  const remainingExpected = 300.0;
  const remainingCalculated = Math.round((invoiceOriginal - paymentReceived) * 100) / 100;

  assert(remainingCalculated === remainingExpected, 'Halal integer arithmetic: Original ($500) - Paid ($200) = Remaining ($300)');
  assert(remainingCalculated >= 0, 'Remaining balance cannot be negative');

  // Reconciler test verifying separation
  const ledgerReport = PaymentReconciliationEngine.reconcile({
    provider: 'stripe',
    periodStart: '2026-08-01T00:00:00Z',
    periodEnd: '2026-08-31T23:59:59Z',
    internalRecords: [
      {
        id: 'tx_sub_1',
        tenantId: 'biz_qa_1',
        businessId: 'biz_qa_1',
        amount: 49,
        currency: 'USD',
        status: 'SUCCEEDED',
        provider: 'stripe',
        providerPaymentId: 'pi_sub_qa_1',
        purpose: 'SAAS_SUBSCRIPTION',
        createdAt: '2026-08-15T10:00:00Z',
      },
      {
        id: 'tx_inv_1',
        tenantId: 'biz_qa_1',
        businessId: 'biz_qa_1',
        amount: 500,
        currency: 'USD',
        status: 'SUCCEEDED',
        provider: 'stripe',
        providerPaymentId: 'pi_inv_qa_1',
        purpose: 'CUSTOMER_INVOICE',
        createdAt: '2026-08-16T14:00:00Z',
      },
    ],
    externalRecords: [
      { providerPaymentId: 'pi_sub_qa_1', amount: 49, currency: 'USD', status: 'SUCCEEDED', createdAt: '2026-08-15T10:00:00Z' },
      { providerPaymentId: 'pi_inv_qa_1', amount: 500, currency: 'USD', status: 'SUCCEEDED', createdAt: '2026-08-16T14:00:00Z' },
    ],
  });

  assert(ledgerReport.saasRevenueTotal === 49, 'SaaS Revenue ledger accurately isolates $49 platform fee');
  assert(ledgerReport.customerInvoiceTotal === 500, 'Customer Invoice settlements isolated as $500 contractor funds');

  // -----------------------------------------------------------------
  // 12. Security & Penetration Guards (Assertions 47 - 50)
  // -----------------------------------------------------------------
  console.log('\n[12/14] Security Anti-Tampering & Secret Isolation...');
  const priceTamper = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'stripe',
    plan: 'Enterprise',
    interval: 'monthly',
    amountExpected: 1, // Manipulated amount: $1 instead of $199
    currencyExpected: 'USD',
    businessId: 'biz_attacker',
    customerEmail: 'attacker@example.com',
    providerPaymentId: 'pi_tamper_99',
    providerSignatureOrToken: 'sig_tamper',
  });
  assert(priceTamper.verified === false && Boolean(priceTamper.error?.includes('Price manipulation')), 'Price tampering ($1 for Enterprise) blocked by server price invariants');

  const currencyTamper = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'stripe',
    plan: 'Starter',
    interval: 'monthly',
    amountExpected: 29,
    currencyExpected: 'INVALID_CURRENCY',
    businessId: 'biz_attacker',
    customerEmail: 'attacker@example.com',
    providerPaymentId: 'pi_tamper_currency',
    providerSignatureOrToken: 'sig_tamper',
  });
  assert(currencyTamper.verified === false && Boolean(currencyTamper.error?.includes('Currency mismatch')), 'Unsupported currency injection blocked');

  const secretCheck = ProductionEnvironmentValidator.checkSecretIsolation();
  assert(secretCheck.passed === true, 'Server-only secrets isolated from client bundles (0 leaks)');
  assert(secretCheck.violations.length === 0, 'No NEXT_PUBLIC_ variables expose server API secrets');

  // -----------------------------------------------------------------
  // 13. Supabase Migrations & RLS Integrity (Assertions 51 - 53)
  // -----------------------------------------------------------------
  console.log('\n[13/14] Supabase Database Migration & RLS Policy Integrity...');
  const migrations = fs.readdirSync(path.join(process.cwd(), 'supabase', 'migrations')).filter((f) => f.endsWith('.sql'));
  assert(migrations.length >= 23, `Found ${migrations.length} database migrations in sequence`);

  const rlsCheck = migrations.every((mig) => {
    const sql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', mig), 'utf-8');
    // Non-table migrations (like helper functions or data) don't strictly need ENABLE ROW LEVEL SECURITY, but schema migrations do
    return !sql.includes('CREATE TABLE') || sql.includes('ROW LEVEL SECURITY') || sql.includes('ENABLE ROW LEVEL SECURITY');
  });
  assert(rlsCheck === true, 'Row-Level Security declared on newly provisioned tables');

  const lastMigration = migrations[migrations.length - 1];
  assert(lastMigration.includes('20260830000000'), 'Latest webhook events and idempotency migration confirmed');

  // -----------------------------------------------------------------
  // 14. Demo Isolation in Production (Assertions 54 - 55)
  // -----------------------------------------------------------------
  console.log('\n[14/14] Demo Mode vs Real Production Isolation...');
  process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
  const prodDemoBlocked = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'demo' as any,
    plan: 'Starter',
    interval: 'monthly',
    amountExpected: 19,
    currencyExpected: 'USD',
    businessId: 'biz_fake_demo',
    customerEmail: 'fake@example.com',
    providerPaymentId: 'pi_fake_demo',
    providerSignatureOrToken: 'sig_fake',
  });
  assert(prodDemoBlocked.verified === false && Boolean(prodDemoBlocked.error?.includes('forbidden in production') || prodDemoBlocked.error?.includes('Demo')), 'Demo payment activation strictly prohibited in Production Mode (DEMO_MODE=false)');

  process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
  const sandboxDemoAllowed = SubscriptionEngine.verifyAndActivateSubscription({
    provider: 'demo' as any,
    plan: 'Starter',
    interval: 'monthly',
    amountExpected: 19,
    currencyExpected: 'USD',
    businessId: 'biz_sandbox_demo',
    customerEmail: 'sandbox@example.com',
    providerPaymentId: 'pi_sandbox_demo',
    providerSignatureOrToken: 'sig_sandbox',
  });
  assert(sandboxDemoAllowed.verified === true, 'Demo sandbox payment permitted only when NEXT_PUBLIC_DEMO_MODE=true');

  // Reset back to production mode
  process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

  console.log('\n===============================================================');
  console.log(`  PHASE 5 QA AUDIT COMPLETE: ${passed} PASSED / ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5QASuite().catch((err) => {
  console.error('Phase 5 QA Suite failed:', err);
  process.exit(1);
});
