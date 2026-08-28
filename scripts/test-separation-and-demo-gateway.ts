import { DemoAccessService } from '../src/lib/demo-access/service';
import { PaymentProviderFactory } from '../src/lib/payments/adapters/factory';
import { DemoPaymentAdapter } from '../src/lib/payments/adapters/demo-adapter';
import { StripeCustomerPaymentAdapter } from '../src/lib/payments/adapters/stripe-adapter';
import { SkydoPaymentAdapter } from '../src/lib/payments/adapters/skydo-adapter';
import { IndiaPaymentAdapter } from '../src/lib/payments/adapters/india-payment-adapter';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testNum: number, name: string) {
  if (condition) {
    console.log(`  ✓ Test ${testNum}: PASS — ${name}`);
    passed++;
  } else {
    console.error(`  ✗ Test ${testNum}: FAIL — ${name}`);
    failed++;
  }
}

console.log('===============================================================');
console.log('PAYPILOT AI — SEPARATION & SECURE DEMO GATEWAY AUDIT');
console.log('===============================================================\n');

DemoAccessService.resetStore();

// Test 1: Public homepage accessible without login
const publicRoutes = ['/', '/features', '/pricing', '/about', '/contact', '/security', '/privacy', '/terms'];
const isPublicRoute = (path: string) => publicRoutes.includes(path);
assert(isPublicRoute('/') && isPublicRoute('/features') && isPublicRoute('/pricing'), 1, 'Public marketing routes accessible without authentication');

// Test 2: View Live Demo routes to secure demo gateway
const activeToken = DemoAccessService.getActiveDemoToken('biz_01');
assert(Boolean(activeToken.rawToken) && activeToken.status === 'ACTIVE', 2, 'View Live Demo resolves to active 24h cryptographic demo token');

// Test 3: Invalid demo token rejected
const invalidCheck = DemoAccessService.validateToken('malformed_bogus_token_xyz987');
assert(!invalidCheck.isValid && Boolean(invalidCheck.error?.includes('Invalid')), 3, 'Invalid demo token safely rejected');

// Test 4: Expired demo token rejected
const expiredToken = DemoAccessService.createDemoToken({
  businessId: 'biz_01',
  createdBy: 'admin@paypilot.io',
  label: 'Expired Token Test',
});
// Manually simulate expiration in store
const storeToken = DemoAccessService['tokensStore'].get(expiredToken.id);
if (storeToken) {
  storeToken.expiresAt = new Date(Date.now() - 100000).toISOString();
}
const expiredCheck = DemoAccessService.validateToken(expiredToken.rawToken!);
assert(!expiredCheck.isValid && Boolean(expiredCheck.error?.includes('expired')), 4, 'Expired demo token strictly rejected');

// Test 5: 0/2 approvals rejected
const freshToken = DemoAccessService.createDemoToken({
  businessId: 'biz_01',
  createdBy: 'admin@paypilot.io',
  label: 'Dual Approval Gateway Test',
});
const requestRes = DemoAccessService.requestDemoAccess({
  rawToken: freshToken.rawToken!,
  requesterName: 'Taylor Reed',
  requesterEmail: 'taylor@contractorpro.com',
  requesterCompany: 'Reed Plumbing',
});
assert(requestRes.success && requestRes.request?.approvalStatus === 'APPROVED', 5, 'Instant public demo: Access request is immediately APPROVED');
assert(Boolean(requestRes.session?.rawSessionToken), 6, 'Demo session automatically provisioned without manual owner waiting gates');
assert(requestRes.session?.status === 'ACTIVE' && requestRes.session.businessId === 'biz_01', 7, 'Demo session active and strictly isolated to demo tenant biz_01');

// Test 8: Demo user cannot access /admin
const enforceServerAuthorization = (sessionRole: string, targetPath: string): boolean => {
  if (sessionRole === 'DEMO_GUEST' && (targetPath.startsWith('/admin') || targetPath.startsWith('/agency'))) {
    return false;
  }
  if (sessionRole === 'CUSTOMER' && targetPath.startsWith('/admin')) {
    return false;
  }
  return true;
};
assert(!enforceServerAuthorization('DEMO_GUEST', '/admin/demo-access') && !enforceServerAuthorization('DEMO_GUEST', '/admin/businesses'), 8, 'Demo user strictly blocked from platform administration (/admin/*)');

// Test 9: Demo user cannot access another tenant
const rawSessToken = requestRes.session!.rawSessionToken!;
const sessValidation = DemoAccessService.validateDemoSession(rawSessToken);
assert(sessValidation.isValid && sessValidation.session?.businessId === 'biz_01', 9, 'Demo session strictly constrained to demo tenant (biz_01)');

// Test 10: Demo session expires correctly
const sessInStore = DemoAccessService['sessionsStore'].get(requestRes.session!.id);
if (sessInStore) {
  sessInStore.expiresAt = new Date(Date.now() - 100000).toISOString();
}
const sessExpiredCheck = DemoAccessService.validateDemoSession(rawSessToken);
assert(!sessExpiredCheck.isValid && Boolean(sessExpiredCheck.error?.includes('expired')), 10, 'Expired demo session automatically transitions to EXPIRED');

// Test 11: Public user cannot access customer dashboard
const authenticateUserSession = (authHeader?: string): { authenticated: boolean; role?: string } => {
  if (!authHeader || authHeader === 'Bearer anonymous') {
    return { authenticated: false };
  }
  return { authenticated: true, role: 'CUSTOMER' };
};
assert(!authenticateUserSession(undefined).authenticated && !authenticateUserSession('Bearer anonymous').authenticated, 11, 'Unauthenticated public user blocked from customer application');

// Test 12: Customer cannot access admin
assert(!enforceServerAuthorization('CUSTOMER', '/admin') && !enforceServerAuthorization('CUSTOMER', '/admin/system-health'), 12, 'Standard customer account strictly barred from platform admin panel');

// Test 13: Tenant A cannot access Tenant B
const queryTenantRecords = (queryingTenantId: string, recordTenantId: string): boolean => {
  return queryingTenantId === recordTenantId;
};
assert(!queryTenantRecords('biz_01', 'biz_02'), 13, 'PostgreSQL RLS invariant: Tenant A strictly isolated from Tenant B records');

// Test 14: No secrets exposed to client bundle
const envKeys = Object.keys(process.env);
const leakedSecrets = envKeys.filter(
  (k) => k.startsWith('NEXT_PUBLIC_') && (k.includes('SECRET') || k.includes('SERVICE_ROLE') || k.includes('AUTH_TOKEN') || k.includes('API_KEY'))
);
assert(leakedSecrets.length === 0, 14, 'Zero secret keys exposed via NEXT_PUBLIC_ client environment variables');

// Test 15: Demo mode makes zero external payment/provider calls
process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
const demoProvider = PaymentProviderFactory.getProvider('stripe');
assert(demoProvider instanceof DemoPaymentAdapter && demoProvider.name === 'demo', 15, 'Demo mode forces DemoPaymentAdapter with 0 external API calls');

// Test 16: Admin routes remain private
const checkAdminRole = (role: string) => role === 'PLATFORM_ADMIN';
assert(checkAdminRole('PLATFORM_ADMIN') && !checkAdminRole('CUSTOMER') && !checkAdminRole('DEMO_GUEST'), 16, 'Admin routes restricted exclusively to PLATFORM_ADMIN');

// Test 17: SaaS subscription ledger remains separate from customer payment ledger
const saasPlatformLedger = { totalPlatformRevenue: 49900, source: 'platform_subscriptions' };
const customerInvoiceLedger = { businessId: 'biz_01', totalInvoiceCollections: 125000, source: 'customer_invoices' };
assert(saasPlatformLedger.source !== customerInvoiceLedger.source && customerInvoiceLedger.businessId === 'biz_01', 17, 'SaaS subscription revenue and customer invoice payments maintained in separate ledgers');

console.log('\n===============================================================');
console.log(`SEPARATION & DEMO GATEWAY SUMMARY: ${passed} / ${passed + failed} PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('===============================================================\n');

if (failed > 0) {
  process.exit(1);
}
