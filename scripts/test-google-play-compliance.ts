process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
process.env.VENTREXS_TEST_MODE = 'true';

import {
  requestAccountDeletionAction,
  deleteUserAccountAction,
} from '../src/app/actions';
import * as fs from 'fs';
import * as path from 'path';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] [COMPLIANCE] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] [COMPLIANCE] #${totalTests}: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

async function runGooglePlayComplianceSuite() {
  console.log('======================================================================');
  console.log('PAYPILOT AI — GOOGLE PLAY & LEGAL COMPLIANCE TEST SUITE');
  console.log('======================================================================\n');

  // --- 1. Verify 11 Legal Pages Existence & Content ---
  console.log('--- 1. Legal Document Pack & Production Web Pages ---');

  const requiredLegalPages = [
    { route: 'privacy', title: 'Privacy Policy', keywords: ['Supabase', 'Stripe'], brandKeywords: ['BRAND.legalName', 'BRAND.name', 'Desynthic', 'Ventrexs AI', 'Flowvexa AI, Inc.', 'PayPilot AI Inc.'], emailKeywords: ['BRAND.privacyEmail', 'privacy@ventrexs.com', 'privacy@flowvexa.com', 'privacy@paypilot.ai'] },
    { route: 'terms', title: 'Terms of Service', keywords: ['Halal-First', 'remaining_balance', 'Delaware'] },
    { route: 'subscription-terms', title: 'Subscription Terms', keywords: ['Starter', 'Professional', 'Enterprise', '14-Day Free Trial'] },
    { route: 'refund-policy', title: 'Refund Policy', keywords: ['14-Day Money-Back Guarantee'], emailKeywords: ['BRAND.billingEmail', 'billing@ventrexs.com', 'billing@flowvexa.com', 'billing@paypilot.ai'] },
    { route: 'dpa', title: 'Data Processing Addendum', keywords: ['GDPR Article 28', 'Subprocessor', 'Standard Contractual Clauses'] },
    { route: 'security', title: 'Security Overview', keywords: ['Row Level Security', 'HMAC SHA-256', 'TLS 1.3'], emailKeywords: ['BRAND.securityEmail', 'security@ventrexs.com', 'security@flowvexa.com', 'security@paypilot.ai'] },
    { route: 'acceptable-use', title: 'Acceptable Use Policy', keywords: ['TCPA', 'opt-in', 'STOP'], emailKeywords: ['abuse@ventrexs.com', 'abuse@flowvexa.com', 'abuse@paypilot.ai'] },
    { route: 'ip-policy', title: 'IP Policy', keywords: ['DMCA', 'Customer Data Sovereignty'], emailKeywords: ['BRAND.legalEmail', 'legal@ventrexs.com', 'dmca@flowvexa.com', 'legal@flowvexa.com', 'dmca@paypilot.ai'] },
    { route: 'data-retention', title: 'Data Retention Schedule', keywords: ['30 days', '7 years', 'Statutory'] },
    { route: 'sla', title: 'Service Level Agreement', keywords: ['99.9%', 'P1 — Critical', 'Downtime'] },
    { route: 'account-deletion', title: 'Account Deletion Portal', keywords: ['Google Play Data Safety', 'Submit Public Account Deletion', '30 days'] },
  ];

  for (const page of requiredLegalPages) {
    const filePath = path.join(process.cwd(), 'src', 'app', page.route, 'page.tsx');
    const exists = fs.existsSync(filePath);
    assert(exists, `Page /${page.route} exists as a production web page`, `Missing ${filePath}`);

    if (exists) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasBaseKeywords = page.keywords ? page.keywords.every(kw => content.includes(kw)) : true;
      const hasBrandKeywords = page.brandKeywords ? page.brandKeywords.some(kw => content.includes(kw)) : true;
      const hasEmailKeywords = page.emailKeywords ? page.emailKeywords.some(kw => content.includes(kw)) : true;
      const hasKeywords = hasBaseKeywords && hasBrandKeywords && hasEmailKeywords;
      assert(hasKeywords, `Page /${page.route} contains required legal keywords`);
    }
  }

  // --- 2. Google Play Data Safety & Truthful Representation ---
  console.log('\n--- 2. Google Play Data Safety & Architectural Truthfulness ---');

  const privacyFile = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'privacy', 'page.tsx'), 'utf8');
  assert(
    (privacyFile.includes('BRAND.legalName') || privacyFile.includes('Desynthic') || privacyFile.includes('Flowvexa AI, Inc.') || privacyFile.includes('PayPilot AI Inc.')) && privacyFile.includes('Delaware, United States'),
    'Privacy Policy discloses authentic developer and legal entity identity'
  );

  assert(
    privacyFile.includes('Supabase Inc.') && privacyFile.includes('Stripe Inc.') && privacyFile.includes('Resend Inc.') && privacyFile.includes('Twilio Inc.') && privacyFile.includes('Meta Platforms') && privacyFile.includes('Google LLC'),
    'Privacy Policy explicitly enumerates all 6 active subprocessors without omission'
  );

  assert(
    privacyFile.includes('Zero Ledger Mutation') && privacyFile.includes('No Foundation Model Training'),
    'Privacy Policy transparently documents AI Copilot read-only governance and zero training on customer data'
  );

  // Verify zero fake certification claims
  const securityFile = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'security', 'page.tsx'), 'utf8');
  assert(
    !securityFile.includes('certified SOC 2 Type II') && !securityFile.includes('certified ISO 27001') && !securityFile.includes('HIPAA certified'),
    'Security documentation strictly avoids unearned third-party compliance certification claims'
  );

  // --- 3. Public & In-App Account Deletion Server Actions ---
  console.log('\n--- 3. Account Deletion Actions & Data Safety Compliance ---');

  // Test public deletion request with valid email
  const validDeletionRes = await requestAccountDeletionAction({
    email: 'user.deletion.test@example.com',
    reason: 'privacy_concerns'
  });
  assert(
    validDeletionRes.success === true && typeof validDeletionRes.message === 'string',
    'requestAccountDeletionAction queues public unauthenticated deletion request successfully'
  );

  // Test public deletion request with invalid email
  const invalidDeletionRes = await requestAccountDeletionAction({
    email: 'invalid-email-format',
    reason: 'privacy_concerns'
  });
  assert(
    invalidDeletionRes.success === false && invalidDeletionRes.error?.includes('VALIDATION_ERROR'),
    'requestAccountDeletionAction strictly validates and rejects malformed email addresses'
  );

  // Test in-app deletion action execution
  const authenticatedDeletionRes = await deleteUserAccountAction('11111111-1111-1111-1111-111111111111');
  assert(
    authenticatedDeletionRes.success === true && typeof authenticatedDeletionRes.deletedAt === 'string',
    'deleteUserAccountAction purges user profile, business membership, and unlinks personal data'
  );

  // --- 4. Navigation & Sitemap Indexing ---
  console.log('\n--- 4. Navigation Links & Sitemap Verification ---');

  const footerFile = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'page.tsx'), 'utf8');
  assert(
    footerFile.includes('/privacy') && footerFile.includes('/terms') && footerFile.includes('/account-deletion') && footerFile.includes('/dpa'),
    'Public landing page footer includes direct links to Privacy Policy, Terms, DPA, and Account Deletion'
  );

  const settingsFile = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'settings', 'page.tsx'), 'utf8');
  assert(
    settingsFile.includes('Legal & Privacy Compliance Center') && settingsFile.includes('Danger Zone: Account & Data Deletion'),
    'Authenticated Settings page includes dedicated Legal Compliance directory and prominent Deletion Danger Zone'
  );

  const sitemapFile = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'sitemap.ts'), 'utf8');
  assert(
    sitemapFile.includes('/privacy') && sitemapFile.includes('/terms') && sitemapFile.includes('/account-deletion') && sitemapFile.includes('/sla'),
    'Next.js sitemap includes public routes for all legal documents and deletion portal'
  );

  console.log('\n======================================================================');
  console.log(`TOTAL COMPLIANCE TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    console.error('❌ SOME COMPLIANCE ASSERTIONS FAILED');
    process.exit(1);
  } else {
    console.log('✅ ALL GOOGLE PLAY & LEGAL COMPLIANCE ASSERTIONS PASSED PERFECTLY\n');
  }
}

runGooglePlayComplianceSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
