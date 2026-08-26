/**
 * VENTREXS AI — Phase 13 Complete Rebrand & Production Identity Test Suite
 * Validates:
 * 1. Brand Configuration Constants (Ventrexs AI, Desynthic, Powered by Desynthic, emails, domains)
 * 2. Edge Hostname Resolution (ventrexs.com, admin.ventrexs.com, agency.ventrexs.com)
 * 3. Whitelabel Brand Defaults & Hierarchy (DEFAULT_VENTREXS_BRANDING, fallback, custom override)
 * 4. Demo Access Gateway & Dual Approval (2 owner approvals: owner1@ventrexs.com, owner2@ventrexs.com)
 * 5. Platform Admin Service (authorization, profiles, backward compatibility)
 * 6. Email Template Generation (ventrexs.com payment URLs, absence of legacy URLs)
 * 7. AI Copilot & Deterministic Rule Engine (Ventrexs Rule-Engine AI, draft generation)
 * 8. Ethical Communication & Halal Invariant Validation (Ventrexs AI policy guard messages)
 * 9. Domain Verifier (ventrexs-verify= token prefix, reserved domain protection)
 * 10. Analytics & CSV Export (Ventrexs AI headers)
 * 11. Company vs Product Identity Separation (Desynthic vs Ventrexs AI)
 */

import { BRAND } from '../src/config/brand';
import {
  resolveHostContext,
  isPlatformAdminHost,
  isAgencyHost,
  isCustomerAppHost,
} from '../src/lib/auth/hostname';
import {
  resolveWhitelabelBranding,
  DEFAULT_VENTREXS_BRANDING,
  DEFAULT_FLOWVEXA_BRANDING,
  DEFAULT_PAYPILOT_BRANDING,
} from '../src/lib/whitelabel/resolver';
import { DemoAccessService } from '../src/lib/demo-access/service';
import { PlatformAdminService } from '../src/lib/admin/service';
import { renderInvoiceFollowUpEmail } from '../src/lib/email/email-template';
import { LocalRuleAIProvider } from '../src/lib/ai/provider';
import { AnalyticsService } from '../src/lib/supabase/services/analytics';
import { DomainVerifier } from '../src/lib/domains/verifier';
import { validateCommunicationPolicy } from '../src/lib/communications/policy-validator';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}${details ? ` - ${details}` : ''}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('  VENTREXS AI — PHASE 13 REBRAND & PRODUCTION IDENTITY TEST SUITE');
  console.log('================================================================\n');

  // ----------------------------------------------------------------
  // 1. BRAND CONFIGURATION CONSTANTS
  // ----------------------------------------------------------------
  console.log('--- 1. Brand Configuration Constants ---');
  assert(BRAND.name === 'Ventrexs AI', 'BRAND.name is "Ventrexs AI"');
  assert(BRAND.shortName === 'Ventrexs', 'BRAND.shortName is "Ventrexs"');
  assert(BRAND.companyName === 'Desynthic', 'BRAND.companyName is "Desynthic"');
  assert(BRAND.legalName === 'Desynthic', 'BRAND.legalName is "Desynthic"');
  assert(BRAND.attribution === 'Powered by Desynthic', 'BRAND.attribution is "Powered by Desynthic"');
  assert(BRAND.tagline === 'The AI Operating System for Modern Businesses', 'BRAND.tagline matches specification');
  assert(BRAND.positioning === 'AI-Powered Business Operations Platform', 'BRAND.positioning is "AI-Powered Business Operations Platform"');
  assert(BRAND.domain === 'https://ventrexs.com', 'BRAND.domain is "https://ventrexs.com"');
  assert(BRAND.rawDomain === 'ventrexs.com', 'BRAND.rawDomain is "ventrexs.com"');
  assert(BRAND.appDomain === 'https://ventrexs.com', 'BRAND.appDomain is "https://ventrexs.com"');
  assert(BRAND.agencyDomain === 'https://agency.ventrexs.com', 'BRAND.agencyDomain is "https://agency.ventrexs.com"');
  assert(BRAND.adminDomain === 'https://admin.ventrexs.com', 'BRAND.adminDomain is "https://admin.ventrexs.com"');
  assert(BRAND.supportEmail === 'support@ventrexs.com', 'BRAND.supportEmail is "support@ventrexs.com"');
  assert(BRAND.privacyEmail === 'privacy@ventrexs.com', 'BRAND.privacyEmail is "privacy@ventrexs.com"');
  assert(BRAND.billingEmail === 'billing@ventrexs.com', 'BRAND.billingEmail is "billing@ventrexs.com"');
  assert(BRAND.securityEmail === 'security@ventrexs.com', 'BRAND.securityEmail is "security@ventrexs.com"');

  // ----------------------------------------------------------------
  // 2. EDGE HOSTNAME RESOLUTION
  // ----------------------------------------------------------------
  console.log('\n--- 2. Edge Hostname Resolution ---');
  assert(resolveHostContext('ventrexs.com') === 'CUSTOMER', 'ventrexs.com -> CUSTOMER');
  assert(resolveHostContext('www.ventrexs.com') === 'CUSTOMER', 'www.ventrexs.com -> CUSTOMER');
  assert(resolveHostContext('app.ventrexs.com') === 'CUSTOMER', 'app.ventrexs.com -> CUSTOMER');
  assert(resolveHostContext('admin.ventrexs.com') === 'ADMIN', 'admin.ventrexs.com -> ADMIN');
  assert(resolveHostContext('agency.ventrexs.com') === 'AGENCY', 'agency.ventrexs.com -> AGENCY');
  assert(resolveHostContext('portal.contractors.com') === 'AGENCY', 'Custom agency domain -> AGENCY');

  assert(isPlatformAdminHost('admin.ventrexs.com') === true, 'admin.ventrexs.com recognized as Admin host');
  assert(isPlatformAdminHost('ventrexs.com') === false, 'ventrexs.com is NOT Admin host');
  assert(isAgencyHost('agency.ventrexs.com') === true, 'agency.ventrexs.com recognized as Agency host');
  assert(isCustomerAppHost('ventrexs.com') === true, 'ventrexs.com recognized as Customer host');

  // ----------------------------------------------------------------
  // 3. WHITELABEL BRAND DEFAULTS & HIERARCHY
  // ----------------------------------------------------------------
  console.log('\n--- 3. Whitelabel Brand Defaults & Fallback ---');
  assert(DEFAULT_VENTREXS_BRANDING.brandName === 'Ventrexs AI', 'DEFAULT_VENTREXS_BRANDING has brandName "Ventrexs AI"');
  assert(DEFAULT_VENTREXS_BRANDING.supportEmail === 'support@ventrexs.com', 'DEFAULT_VENTREXS_BRANDING has supportEmail "support@ventrexs.com"');
  assert(DEFAULT_FLOWVEXA_BRANDING.brandName === 'Ventrexs AI', 'DEFAULT_FLOWVEXA_BRANDING alias points to Ventrexs');
  assert(DEFAULT_PAYPILOT_BRANDING.brandName === 'Ventrexs AI', 'DEFAULT_PAYPILOT_BRANDING alias points to Ventrexs');

  // Fallback test
  const fallbackResult = resolveWhitelabelBranding({
    businessBranding: null,
    agencyBranding: null,
    hostname: 'ventrexs.com',
  });
  assert(fallbackResult.effectiveBrandName === 'Ventrexs AI', 'Fallback branding returns Ventrexs AI');
  assert(fallbackResult.effectiveSupportEmail === 'support@ventrexs.com', 'Fallback support email returns Ventrexs email');

  // Business override test
  const customResult = resolveWhitelabelBranding({
    businessBranding: {
      brandName: 'Apex Comfort HVAC',
      supportEmail: 'service@apexcomfort.com',
    },
    agencyBranding: null,
    hostname: 'ventrexs.com',
  });
  assert(customResult.effectiveBrandName === 'Apex Comfort HVAC', 'Business override takes priority over default');

  // ----------------------------------------------------------------
  // 4. DEMO ACCESS GATEWAY & DUAL APPROVAL
  // ----------------------------------------------------------------
  console.log('\n--- 4. Demo Access & Dual Approval ---');
  DemoAccessService.resetStore();

  const demoToken = DemoAccessService.createDemoToken({
    createdBy: 'owner1@ventrexs.com',
    businessId: 'biz_01',
    label: 'Ventrexs AI Enterprise Evaluator Demo',
  });
  assert(demoToken.id.startsWith('demo_tok_'), 'Demo token starts with "demo_tok_"');
  assert(demoToken.businessId === 'biz_01', 'Demo token scoped strictly to biz_01');

  const tokenValidation = DemoAccessService.validateToken(demoToken.rawToken!);
  assert(tokenValidation.isValid === true, 'Raw demo token validates successfully');

  // Submit prospect access request
  const requestRes = DemoAccessService.requestDemoAccess({
    rawToken: demoToken.rawToken!,
    requesterName: 'Enterprise Evaluator',
    requesterEmail: 'eval@enterprise.com',
    requesterCompany: 'Summit Ventures',
  });
  assert(requestRes.success === true && !!requestRes.request, 'Demo access request registered');

  const reqId = requestRes.request!.id;

  // First approval from Ventrexs owner 1
  const app1 = DemoAccessService.submitApproval({
    requestId: reqId,
    approverEmail: 'owner1@ventrexs.com',
    decision: 'APPROVED',
    notes: 'Approved evaluation',
  });
  assert(app1.success === true, 'Approval from owner1@ventrexs.com succeeded');

  // Second approval from Ventrexs owner 2 (triggers dual approval activation)
  const app2 = DemoAccessService.submitApproval({
    requestId: reqId,
    approverEmail: 'owner2@ventrexs.com',
    decision: 'APPROVED',
    notes: 'Second owner approval confirmed',
  });
  assert(app2.success === true && !!app2.session, 'Dual approval completed and session generated');
  assert(app2.session?.status === 'ACTIVE', 'Dual-approved demo session is active');

  // ----------------------------------------------------------------
  // 5. PLATFORM ADMIN SERVICE
  // ----------------------------------------------------------------
  console.log('\n--- 5. Platform Admin Service ---');
  PlatformAdminService.resetStore();

  const adminAuth1 = PlatformAdminService.isAuthorizedAdmin('owner1@ventrexs.com');
  const adminAuth2 = PlatformAdminService.isAuthorizedAdmin('owner2@ventrexs.com');
  const adminAuthLegacy1 = PlatformAdminService.isAuthorizedAdmin('owner1@flowvexa.com');
  const adminAuthLegacy2 = PlatformAdminService.isAuthorizedAdmin('owner1@paypilot.io');
  const adminAuthRandom = PlatformAdminService.isAuthorizedAdmin('unauthorized@random.com');

  assert(adminAuth1 === true, 'owner1@ventrexs.com is authorized admin');
  assert(adminAuth2 === true, 'owner2@ventrexs.com is authorized admin');
  assert(adminAuthLegacy1 === true, 'owner1@flowvexa.com backward compatibility maintained');
  assert(adminAuthLegacy2 === true, 'owner1@paypilot.io backward compatibility maintained');
  assert(adminAuthRandom === false, 'Unauthorized identity is rejected');

  const admins = PlatformAdminService.getPlatformAdmins();
  assert(admins.length >= 2, 'Platform admin directory contains configured administrators');

  const validatedProfile = PlatformAdminService.validateAdminAccess('owner1@ventrexs.com');
  assert(validatedProfile.role === 'PLATFORM_ADMIN', 'Validated admin profile has PLATFORM_ADMIN role');

  // ----------------------------------------------------------------
  // 6. EMAIL TEMPLATE GENERATION
  // ----------------------------------------------------------------
  console.log('\n--- 6. Email Template Generation ---');
  const emailRendered = renderInvoiceFollowUpEmail({
    businessName: 'Apex Heating & Air',
    customerName: 'John Smith',
    customerCompany: 'Smith Residence',
    invoiceNumber: 'INV-2026-001',
    invoiceId: 'inv_123',
    remainingBalance: 450.0,
    currency: 'USD ($)',
    dueDate: '2026-09-01',
    messageBody: 'Please find your statement details enclosed.',
  });
  assert(emailRendered.html.includes('ventrexs.com/pay/inv_123'), 'Payment link rendered with https://ventrexs.com/pay/inv_123 domain');
  assert(!emailRendered.html.includes('flowvexa.com/pay/'), 'Old flowvexa domain absent from rendered HTML email');
  assert(!emailRendered.html.includes('paypilot.ai/pay/'), 'Old paypilot domain absent from rendered HTML email');

  // ----------------------------------------------------------------
  // 7. AI COPILOT & DETERMINISTIC RULE ENGINE
  // ----------------------------------------------------------------
  console.log('\n--- 7. AI Copilot & Deterministic Rule Engine ---');
  const aiProvider = new LocalRuleAIProvider();
  assert(aiProvider.name === 'Ventrexs Rule-Engine AI', 'AI Provider name is "Ventrexs Rule-Engine AI"');

  const aiDraft = await aiProvider.generateCustomDraft(
    {
      invoiceId: 'inv_456',
      invoiceNumber: 'INV-456',
      originalAmount: 1200.0,
      amountPaid: 0,
      remainingBalance: 1200.0,
      daysOverdue: 5,
      status: 'overdue',
      dueDate: '2026-08-20',
      customerName: 'Alice Johnson',
      customerCompany: 'Acme Corp',
      customerEmail: 'alice@acme.com',
      businessName: 'Ventrexs AI Workspace',
      businessCurrency: 'USD ($)',
    },
    'Gentle Check-in',
    'email'
  );
  assert(aiDraft.body.includes('ventrexs.com/pay/inv_456'), 'AI draft uses ventrexs.com payment link');
  assert(!aiDraft.body.includes('flowvexa.com'), 'AI draft does NOT contain flowvexa.com');
  assert(!aiDraft.body.includes('paypilot.ai'), 'AI draft does NOT contain paypilot.ai');

  // ----------------------------------------------------------------
  // 8. ETHICAL COMMUNICATION & HALAL INVARIANT VALIDATION
  // ----------------------------------------------------------------
  console.log('\n--- 8. Ethical Policy & Balance Invariants ---');
  const policyCheck = validateCommunicationPolicy({
    subject: 'Friendly reminder',
    message: 'We kindly request payment of your remaining balance.',
    isInvoiceCommunication: true,
    remainingBalance: 500,
  });
  assert(policyCheck.isValid === true, 'Ethical communication passes policy check');

  const predatoryPolicyCheck = validateCommunicationPolicy({
    subject: 'Immediate action',
    message: 'We will charge compound interest and wage garnishment.',
    isInvoiceCommunication: true,
    remainingBalance: 500,
  });
  assert(predatoryPolicyCheck.isValid === false, 'Predatory terms rejected by policy guard');
  assert(predatoryPolicyCheck.errors.some((e: string) => e.includes('Ventrexs AI')), 'Policy error message mentions Ventrexs AI');

  // ----------------------------------------------------------------
  // 9. DOMAIN VERIFIER
  // ----------------------------------------------------------------
  console.log('\n--- 9. Domain Verifier ---');
  const txtToken = DomainVerifier.generateVerificationToken('agency1.com');
  assert(txtToken.startsWith('ventrexs-verify='), 'Verification token begins with ventrexs-verify=');
  const reservedCheck = DomainVerifier.validateDomain('ventrexs.com');
  assert(reservedCheck.valid === false, 'ventrexs.com is correctly protected as a reserved system domain');

  // ----------------------------------------------------------------
  // 10. ANALYTICS & CSV EXPORT
  // ----------------------------------------------------------------
  console.log('\n--- 10. Analytics & CSV Export ---');
  const analyticsService = new AnalyticsService({} as any);
  const csvOutput = analyticsService.generateCsvExport('revenue', 'Apex Comfort HVAC');
  assert(csvOutput.includes('Report: Ventrexs AI REVENUE Report'), 'CSV export header contains "Ventrexs AI"');

  // ----------------------------------------------------------------
  // 11. COMPANY AND PRODUCT IDENTITY SEPARATION
  // ----------------------------------------------------------------
  console.log('\n--- 11. Company & Product Identity Separation ---');
  assert(BRAND.companyName === 'Desynthic', 'Company is Desynthic');
  assert(BRAND.name === 'Ventrexs AI', 'Product brand is Ventrexs AI');
  assert(BRAND.attribution.includes('Desynthic'), 'Attribution includes Desynthic');
  assert(BRAND.domain === 'https://ventrexs.com', 'Public domain points to https://ventrexs.com');

  // ----------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  PHASE 13 TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('>>> ALL PHASE 13 VENTREXS AI REBRAND TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.error('>>> SOME PHASE 13 TESTS FAILED <<<\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
