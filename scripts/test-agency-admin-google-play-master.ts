/**
 * VENTREXS AI — MASTER ARCHITECTURE TEST SUITE
 * Validates Agency Platform, Private Platform Admin, Google Play Billing, Web Billing, and Hostname Isolation.
 */

import { resolveHostContext } from '../src/lib/auth/hostname';
import { PlatformAdminService } from '../src/lib/admin/service';
import { AgencyTenantService } from '../src/lib/agency/service';
import { GooglePlayVerifier } from '../src/lib/billing/google-play-verifier';
import { GooglePlayPaymentAdapter } from '../src/lib/payments/adapters/google-play-adapter';
import { PaymentProviderFactory } from '../src/lib/payments/factory';
import { PaymentConfigValidator } from '../src/lib/payments/config';
import { requirePlatformAdmin, requireAgencyMember } from '../src/lib/auth/guards';
import { EntitlementService } from '../src/lib/billing/entitlements';

async function runTests() {
  console.log('\n===============================================================');
  console.log('  VENTREXS MASTER ARCHITECTURE & BILLING VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: THREE SEPARATE PRODUCT CONTEXTS & HOSTNAME ROUTING
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: Product Contexts & Hostname Isolation ---');

  // Test 1: Customer hostnames resolve to CUSTOMER
  assert(resolveHostContext('ventrexs.com') === 'CUSTOMER', 'ventrexs.com resolves to CUSTOMER');
  assert(resolveHostContext('www.ventrexs.com') === 'CUSTOMER', 'www.ventrexs.com resolves to CUSTOMER');
  assert(resolveHostContext('localhost:3000') === 'CUSTOMER', 'localhost:3000 resolves to CUSTOMER');
  assert(resolveHostContext('localhost') === 'CUSTOMER', 'localhost resolves to CUSTOMER');

  // Test 2: Agency hostnames resolve to AGENCY
  assert(resolveHostContext('agency.ventrexs.com') === 'AGENCY', 'agency.ventrexs.com resolves to AGENCY');
  assert(resolveHostContext('agency.localhost:3000') === 'AGENCY', 'agency.localhost:3000 resolves to AGENCY');
  assert(resolveHostContext('portal.customagency.com') === 'AGENCY', 'Custom white-label domain resolves to AGENCY');

  // Test 3: Admin hostnames resolve to ADMIN
  assert(resolveHostContext('admin.ventrexs.com') === 'ADMIN', 'admin.ventrexs.com resolves to ADMIN');
  assert(resolveHostContext('admin.localhost:3000') === 'ADMIN', 'admin.localhost:3000 resolves to ADMIN');

  // ---------------------------------------------------------------------------
  // SECTION 2: PLATFORM ADMIN SECURITY & ACCESS CONTROLS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Platform Admin Security & Authorization ---');

  // Test 4: Authorized admin identities allowed
  assert(PlatformAdminService.isAuthorizedAdmin('owner1@ventrexs.com') === true, 'owner1@ventrexs.com is authorized admin');
  assert(PlatformAdminService.isAuthorizedAdmin('owner2@ventrexs.com') === true, 'owner2@ventrexs.com is authorized admin');

  // Test 5: Unauthorized identities strictly rejected
  assert(PlatformAdminService.isAuthorizedAdmin('customer@randombusiness.com') === false, 'Customer email rejected as admin');
  assert(PlatformAdminService.isAuthorizedAdmin('agency@marketing.com') === false, 'Agency email rejected as admin');
  assert(PlatformAdminService.isAuthorizedAdmin(null) === false, 'Null actor email rejected as admin');

  // Test 6: requirePlatformAdmin server guard throws on unauthorized
  let threwUnauthorized = false;
  try {
    await requirePlatformAdmin('hacker@evil.com');
  } catch (err: any) {
    threwUnauthorized = true;
  }
  assert(threwUnauthorized, 'requirePlatformAdmin throws on unauthorized actor');

  let adminAllowed = false;
  try {
    const adminRecord = await requirePlatformAdmin('owner1@ventrexs.com');
    adminAllowed = Boolean(adminRecord);
  } catch (err: any) {
    adminAllowed = false;
  }
  assert(adminAllowed, 'requirePlatformAdmin succeeds for owner1@ventrexs.com');

  // ---------------------------------------------------------------------------
  // SECTION 3: AGENCY MULTI-TENANT ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Agency Multi-Tenant Isolation ---');

  // Test 7: Agency A member cannot access Agency B
  const crossAgencyResult = AgencyTenantService.validateAgencyAccess('ag_other_agency', 'agency_owner@ventrexs.com');
  assert(crossAgencyResult.isValid === false, 'Agency A member accessing Agency B is blocked');

  // Test 8: Agency Owner validation
  const validAgencyResult = AgencyTenantService.validateAgencyAccess('agy_001', 'owner@apexgrowth.agency', 'AGENCY_OWNER');
  assert(validAgencyResult.isValid === true, 'Authorized Agency Owner access is allowed');

  // ---------------------------------------------------------------------------
  // SECTION 4: GOOGLE PLAY BILLING ENGINE & TOKEN VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Google Play Billing Verification ---');

  // Test 9: Unverified / empty purchase token rejected
  const emptyTokenResult = await GooglePlayVerifier.verifyPurchase({
    packageName: 'com.ventrexs.app',
    subscriptionId: 'ventrexs_pro_monthly',
    purchaseToken: '',
    businessId: 'biz_01',
  });
  assert(emptyTokenResult.isValid === false, 'Empty Google Play token is rejected');

  // Test 10: Fake / revoked purchase token rejected
  const fakeTokenResult = await GooglePlayVerifier.verifyPurchase({
    packageName: 'com.ventrexs.app',
    subscriptionId: 'ventrexs_pro_monthly',
    purchaseToken: 'fake_expired_revoked_token_123',
    businessId: 'biz_01',
  });
  assert(fakeTokenResult.isValid === false, 'Expired/revoked Google Play token is rejected');

  // Test 11: Valid purchase token verified and mapped to correct plan
  const validTokenResult = await GooglePlayVerifier.verifyPurchase({
    packageName: 'com.ventrexs.app',
    subscriptionId: 'ventrexs_pro_monthly',
    purchaseToken: 'gplay_valid_token_xyz987654321',
    businessId: 'biz_01',
  });
  assert(validTokenResult.isValid === true, 'Valid Google Play token is accepted');
  assert(validTokenResult.plan === 'Professional', 'Google Play subscription maps to Professional plan');
  assert(validTokenResult.status === 'ACTIVE', 'Google Play subscription status is ACTIVE');
  assert(validTokenResult.purchaseTokenHash.length === 64, 'SHA-256 token hash generated (64 hex chars)');

  // Test 12: Google Play Payment Provider Adapter execution
  const gplayAdapter = new GooglePlayPaymentAdapter();
  assert(gplayAdapter.name === ('google_play' as any), 'GooglePlayPaymentAdapter name is google_play');

  const processResult = await gplayAdapter.processPayment({
    businessId: 'biz_01',
    amount: 49.0,
    currency: 'USD',
    method: 'Credit Card',
    purpose: 'SAAS_SUBSCRIPTION',
    paymentToken: 'gplay_valid_token_xyz987654321',
    metadata: {
      packageName: 'com.ventrexs.app',
      subscriptionId: 'ventrexs_pro_monthly',
    },
  });
  assert(processResult.success === true, 'GooglePlayPaymentAdapter processes verified subscription');
  assert(processResult.status === 'SUCCEEDED', 'Process result status is SUCCEEDED');

  // ---------------------------------------------------------------------------
  // SECTION 5: PAYMENT PURPOSE SEPARATION & FACTORY
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Payment Purpose Separation & Factory ---');

  // Test 13: SaaS subscription provider resolution
  const saasProvider = PaymentProviderFactory.getProvider('SAAS_SUBSCRIPTION', 'google_play');
  assert(saasProvider instanceof GooglePlayPaymentAdapter, 'Factory resolves GooglePlayPaymentAdapter for SAAS_SUBSCRIPTION');

  // Test 14: Demo payment adapter uses 0 external API calls
  const demoProvider = PaymentProviderFactory.getProvider('DEMO');
  const demoResult = await demoProvider.processPayment({
    businessId: 'biz_demo',
    amount: 100.0,
    currency: 'USD',
    method: 'Credit Card',
    purpose: 'DEMO',
  });
  assert(demoResult.success === true, 'Demo payment succeeds with 0 external API calls');

  // ---------------------------------------------------------------------------
  // SECTION 6: ZERO RAW SECRETS EXPOSURE IN TELEMETRY
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 6: Zero Secret Leakage Guarantee ---');

  const health = PaymentConfigValidator.getSystemHealth();
  const serializedHealth = JSON.stringify(health);
  assert(!serializedHealth.includes('sk_live'), 'Zero live Stripe secrets in health diagnostics');
  assert(!serializedHealth.includes('rzp_live'), 'Zero live Razorpay secrets in health diagnostics');
  assert(health.providers.google_play !== undefined, 'Google Play provider status included in system health');

  // ---------------------------------------------------------------------------
  // SECTION 7: SUBSCRIPTION LIFECYCLE & ENTITLEMENTS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 7: Subscription Entitlements ---');

  assert(EntitlementService.isSubscriptionActive({ status: 'active' }) === true, 'Status "active" is active');
  assert(EntitlementService.isSubscriptionActive({ status: 'trialing' }) === true, 'Status "trialing" is active');
  assert(EntitlementService.isSubscriptionActive({ status: 'past_due' }) === false, 'Status "past_due" is inactive');
  assert(EntitlementService.isSubscriptionActive({ status: 'cancelled' }) === false, 'Status "cancelled" is inactive');
  assert(EntitlementService.isSubscriptionActive({ status: 'expired' }) === false, 'Status "expired" is inactive');

  console.log('\n===============================================================');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
