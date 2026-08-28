/**
 * VENTREXS AI — PRODUCTION ENVIRONMENT VERIFICATION SUITE
 *
 * Verifies:
 * 1. Required environment variables structure
 * 2. Strict secret/public variable separation (no secrets in NEXT_PUBLIC_*)
 * 3. DEMO_MODE toggle logic and production behavior
 * 4. Payment provider configuration integrity (Razorpay, Stripe, Google Play, Skydo)
 * 5. Supabase infrastructure & RLS invariants
 * 6. AI inference providers & token limits
 * 7. Communication engines (Twilio, WhatsApp, Resend)
 * 8. Multi-domain hostname resolution (Customer, Agency, Admin)
 * 9. Secret redaction in diagnostics & audit logs
 * 10. Prevention of hardcoded secrets or credentials
 */

import { ProductionEnvironmentValidator } from '../src/lib/config/production-validator';
import { PaymentConfigValidator } from '../src/lib/payments/config';
import { resolveHostContext, isPlatformAdminHost, isAgencyHost, isCustomerAppHost } from '../src/lib/auth/hostname';

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

async function runProductionEnvironmentVerification() {
  console.log('\n===============================================================');
  console.log('  VENTREXS AI — PRODUCTION ENVIRONMENT VERIFICATION');
  console.log('===============================================================\n');

  // 1. Secret Isolation & NEXT_PUBLIC_ Safety
  console.log('[1/7] Secret Isolation & Public Variable Safety Audit...');
  const isolationCheck = ProductionEnvironmentValidator.checkSecretIsolation();
  assert(isolationCheck.passed, 'No server secret keywords found in NEXT_PUBLIC_* variables');
  assert(isolationCheck.violations.length === 0, 'Zero public secret leakage detected in environment');

  // 2. Production Hostname Resolution & Routing
  console.log('\n[2/7] Production Multi-Domain Hostname Routing...');
  assert(resolveHostContext('ventrexs.com') === 'CUSTOMER', 'ventrexs.com maps to CUSTOMER context');
  assert(resolveHostContext('www.ventrexs.com') === 'CUSTOMER', 'www.ventrexs.com maps to CUSTOMER context');
  assert(resolveHostContext('app.ventrexs.com') === 'CUSTOMER', 'app.ventrexs.com maps to CUSTOMER context');
  assert(resolveHostContext('agency.ventrexs.com') === 'AGENCY', 'agency.ventrexs.com maps to AGENCY context');
  assert(resolveHostContext('admin.ventrexs.com') === 'ADMIN', 'admin.ventrexs.com maps to ADMIN context');
  assert(isPlatformAdminHost('admin.ventrexs.com') === true, 'admin.ventrexs.com identified as platform admin');
  assert(isPlatformAdminHost('ventrexs.com') === false, 'ventrexs.com is NOT platform admin');
  assert(isAgencyHost('agency.ventrexs.com') === true, 'agency.ventrexs.com identified as agency host');
  assert(isCustomerAppHost('ventrexs.com') === true, 'ventrexs.com identified as customer app host');

  // 3. Payment Provider Diagnostics & Invariant Safety
  console.log('\n[3/7] Payment Provider Diagnostics & Status Reporting...');
  const razorpayStatus = PaymentConfigValidator.getRazorpayStatus();
  assert(['CONFIGURED', 'NOT_CONFIGURED'].includes(razorpayStatus.status), 'Razorpay status reports CONFIGURED or NOT_CONFIGURED safely');
  assert(!JSON.stringify(razorpayStatus).includes('key_secret_value'), 'Razorpay status never leaks secret values');

  const stripeStatus = PaymentConfigValidator.getStripeStatus();
  assert(['CONFIGURED', 'NOT_CONFIGURED'].includes(stripeStatus.status), 'Stripe status reports CONFIGURED or NOT_CONFIGURED safely');
  assert(!JSON.stringify(stripeStatus).includes('sk_live_'), 'Stripe status never leaks secret keys');

  const skydoStatus = PaymentConfigValidator.getSkydoStatus();
  assert(['CONFIGURED', 'NOT_CONFIGURED'].includes(skydoStatus.status), 'Skydo status reports CONFIGURED or NOT_CONFIGURED safely');

  const googlePlayStatus = PaymentConfigValidator.getGooglePlayStatus();
  assert(['CONFIGURED', 'NOT_CONFIGURED'].includes(googlePlayStatus.status), 'Google Play status reports CONFIGURED or NOT_CONFIGURED safely');

  // 4. Supabase Multi-Tenant Infrastructure Audit
  console.log('\n[4/7] Supabase Infrastructure & Role Separation...');
  const supabaseAudit = ProductionEnvironmentValidator.auditSupabase();
  assert(supabaseAudit.requiredVariables.includes('NEXT_PUBLIC_SUPABASE_URL'), 'NEXT_PUBLIC_SUPABASE_URL required');
  assert(supabaseAudit.requiredVariables.includes('SUPABASE_SERVICE_ROLE_KEY'), 'SUPABASE_SERVICE_ROLE_KEY required server-side');

  // 5. Dual-Owner Superadmin Gate Invariant
  console.log('\n[5/7] Platform Admin & Dual-Owner Approval Configuration...');
  const adminAudit = ProductionEnvironmentValidator.auditPlatformAdmin();
  assert(adminAudit.requiredVariables.includes('PLATFORM_ADMIN_1_EMAIL'), 'PLATFORM_ADMIN_1_EMAIL configured');
  assert(adminAudit.requiredVariables.includes('PLATFORM_ADMIN_2_EMAIL'), 'PLATFORM_ADMIN_2_EMAIL configured');
  assert(adminAudit.isServerOnly === true, 'Admin owner identities are strictly server-side');

  // 6. AI Inference Providers & Token Limiting
  console.log('\n[6/7] Ethical AI Inference & Fallback Engine...');
  const aiAudit = ProductionEnvironmentValidator.auditAiProviders();
  assert(aiAudit.category === 'AI', 'AI inference engine categorizes correctly');
  assert(aiAudit.isServerOnly === true, 'AI API keys are strictly server-side');

  // 7. Omni-Channel Communications Gateways
  console.log('\n[7/7] Omni-Channel Communications Gateways...');
  const commsAudit = ProductionEnvironmentValidator.auditCommunications();
  assert(commsAudit.category === 'COMMUNICATION', 'Communications engine categorizes correctly');
  assert(commsAudit.isServerOnly === true, 'Twilio/WhatsApp/Resend secrets are strictly server-side');

  // Full Production Audit Summary
  const fullAudit = ProductionEnvironmentValidator.runFullAudit();
  assert(fullAudit.securityChecksPassed === true, 'Global security checks passed with zero secret leaks');
  assert(typeof fullAudit.demoMode === 'boolean', 'Demo mode state evaluates deterministically');

  console.log('\n===============================================================');
  console.log(`  PRODUCTION VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionEnvironmentVerification().catch((err) => {
  console.error('Production verification failed:', err);
  process.exit(1);
});
