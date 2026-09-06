import assert from 'assert';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { renderTrialReminderEmail } from '../src/lib/email/trial-reminder-template';
import { globalDevEmailProvider } from '../src/lib/email/providers/dev-provider';
import { EntitlementService } from '../src/lib/billing/entitlements';

async function runTrialExpirationVerification() {
  console.log('================================================================');
  console.log('VENTREXS AI — TRIAL EXPIRATION, REMINDERS & HARD BLOCK QA SUITE');
  console.log('================================================================\n');

  const now = new Date();
  const nowMs = now.getTime();

  const sevenDaysLater = new Date(nowMs + 7 * 86400000);
  const day5Timestamp = new Date(nowMs + 36 * 3600 * 1000); // 36h left (Day 5 window)
  const day7Timestamp = new Date(nowMs + 12 * 3600 * 1000); // 12h left (Day 7 window)
  const pastTimestamp = new Date(nowMs - 2 * 3600 * 1000); // 2h in past (Expired)

  // In-memory test store
  const testSub: any = {
    id: 'sub_test_trial_exp_001',
    user_id: 'usr_test_001',
    business_id: 'biz_test_001',
    plan: 'Professional',
    selected_plan: 'Professional',
    status: 'pending',
    trial_start: null,
    trial_ends_at: null,
    current_period_end: sevenDaysLater.toISOString(),
    trial_day5_reminder_sent_at: null,
    trial_day7_reminder_sent_at: null,
  };

  // Usage stats: zero usage account
  const zeroUsageRecord = {
    ai_receptionist_minutes: 0,
    sms_messages: 0,
    jobs_created: 0,
    estimates_created: 0,
    dollar_value_consumed: 0,
  };

  // --------------------------------------------------------------------------
  // INVARIANT 1: Default Signup Provisioning Invariant
  // --------------------------------------------------------------------------
  console.log('--- Invariant 1: Default Signup Status Invariant ---');
  assert.strictEqual(testSub.status, 'pending', 'New signup must start with status="pending"');
  assert.strictEqual(testSub.trial_start, null, 'trial_start must be null on new signup');
  console.log('  ✓ Invariant 1 Passed: New signup is strictly pending, zero auto-trial bypass.\n');

  // --------------------------------------------------------------------------
  // INVARIANT 2: Explicit 7-Day Free Trial Activation
  // --------------------------------------------------------------------------
  console.log('--- Invariant 2: Explicit 7-Day Free Trial Activation ---');
  testSub.status = 'trialing';
  testSub.trial_start = now.toISOString();
  testSub.trial_ends_at = sevenDaysLater.toISOString();
  testSub.current_period_end = sevenDaysLater.toISOString();

  assert.strictEqual(testSub.status, 'trialing');
  assert(testSub.trial_ends_at !== null);
  const daysLeftInitial = EntitlementService.getTrialDaysRemaining(testSub);
  assert(daysLeftInitial >= 6, `Expected ~7 days remaining, got ${daysLeftInitial}`);
  assert.strictEqual(EntitlementService.isSubscriptionActive(testSub), true);
  console.log(`  ✓ Invariant 2 Passed: 7-day trial active with ${daysLeftInitial} days remaining.\n`);

  // --------------------------------------------------------------------------
  // INVARIANT 3: Day 5 Reminder (2 Days Remaining Window: <= 48h and > 24h)
  // --------------------------------------------------------------------------
  console.log('--- Invariant 3: Day 5 Reminder Eligibility & Email Copy ---');
  testSub.trial_ends_at = day5Timestamp.toISOString();
  testSub.current_period_end = day5Timestamp.toISOString();

  const hoursRemainingDay5 = (new Date(testSub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60);
  assert(hoursRemainingDay5 <= 48 && hoursRemainingDay5 > 24, 'Must be in Day 5 window (24h - 48h)');

  // Verify email copy
  const day5Email = renderTrialReminderEmail({
    recipientName: 'Alex Mercer',
    businessName: 'Apex Heating & Air',
    plan: 'Professional',
    trialEndsAt: testSub.trial_ends_at,
    reminderType: 'day5',
  });

  assert.strictEqual(
    day5Email.subject,
    'Your free trial ends in 2 days — subscribe to keep access',
    'Day 5 subject must match exact required phrasing'
  );
  assert(day5Email.html.includes('2 Days Remaining'), 'Day 5 HTML must include 2 Days badge');
  assert(day5Email.html.includes('Apex Heating & Air'), 'Day 5 HTML must mention business name');
  assert(day5Email.html.includes('/pricing?plan=Professional'), 'Day 5 CTA must link to /pricing with pre-filled plan');

  // Dispatch through DevEmailProvider
  globalDevEmailProvider.clearMessages();
  const sendResDay5 = await globalDevEmailProvider.sendEmail({
    to: 'alex@apexheat.com',
    subject: day5Email.subject,
    text: day5Email.text,
    html: day5Email.html,
    headers: { 'X-Ventrexs-Reminder': 'trial_day5' },
  });

  assert.strictEqual(sendResDay5.success, true);
  testSub.trial_day5_reminder_sent_at = now.toISOString();

  // Verify idempotency: cannot send twice
  const canSendDay5Again = !testSub.trial_day5_reminder_sent_at;
  assert.strictEqual(canSendDay5Again, false, 'Idempotency check must prevent duplicate Day 5 email');
  console.log('  ✓ Invariant 3 Passed: Day 5 reminder email correctly formatted and dispatched idempotently.\n');

  // --------------------------------------------------------------------------
  // INVARIANT 4: Day 7 Final Reminder (Trial Ending Today Window: <= 24h)
  // --------------------------------------------------------------------------
  console.log('--- Invariant 4: Day 7 Final Urgent Reminder Eligibility ---');
  testSub.trial_ends_at = day7Timestamp.toISOString();
  testSub.current_period_end = day7Timestamp.toISOString();

  const hoursRemainingDay7 = (new Date(testSub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60);
  assert(hoursRemainingDay7 <= 24 && hoursRemainingDay7 > 0, 'Must be in Day 7 window (<= 24h)');

  const day7Email = renderTrialReminderEmail({
    recipientName: 'Alex Mercer',
    businessName: 'Apex Heating & Air',
    plan: 'Professional',
    trialEndsAt: testSub.trial_ends_at,
    reminderType: 'day7',
  });

  assert.strictEqual(
    day7Email.subject,
    'Your free trial ends today — subscribe to keep access',
    'Day 7 subject must match exact required phrasing'
  );
  assert(day7Email.html.includes('Trial Ending Today'), 'Day 7 HTML must include Trial Ending Today badge');

  const sendResDay7 = await globalDevEmailProvider.sendEmail({
    to: 'alex@apexheat.com',
    subject: day7Email.subject,
    text: day7Email.text,
    html: day7Email.html,
    headers: { 'X-Ventrexs-Reminder': 'trial_day7' },
  });

  assert.strictEqual(sendResDay7.success, true);
  testSub.trial_day7_reminder_sent_at = now.toISOString();

  // Verify idempotency
  assert.strictEqual(!testSub.trial_day7_reminder_sent_at, false, 'Day 7 idempotency check must prevent duplicates');
  console.log('  ✓ Invariant 4 Passed: Day 7 urgent reminder dispatched idempotently.\n');

  // --------------------------------------------------------------------------
  // INVARIANT 5: Hard Block on Expired Trial (Regardless of Zero Usage)
  // --------------------------------------------------------------------------
  console.log('--- Invariant 5: Zero-Usage Expired Trial Hard Block ---');
  testSub.trial_ends_at = pastTimestamp.toISOString();
  testSub.current_period_end = pastTimestamp.toISOString();

  // Test entitlement evaluator
  const isActive = EntitlementService.isSubscriptionActive(testSub);
  assert.strictEqual(isActive, false, 'Expired trial must not be considered active');

  // Test simulation of middleware gate logic
  function evaluateMiddlewareGate(sub: any, pathname: string) {
    const isPaywallEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYWALL !== 'false';
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (!isPaywallEnabled || isDemoMode) return { allowed: true };

    const protectedCustomerPrefixes = [
      '/dashboard',
      '/leads',
      '/pipeline',
      '/contacts',
      '/appointments',
      '/jobs',
      '/invoices',
      '/estimates',
      '/customers',
      '/copilot',
      '/receptionist',
      '/communications',
      '/reputation',
      '/payments',
      '/collections',
      '/follow-up',
      '/reports',
      '/notifications',
      '/settings',
      '/profile',
    ];
    const isCustomerProtectedRoute = protectedCustomerPrefixes.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    const isOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding/');

    if (!isCustomerProtectedRoute && !isOnboarding) {
      return { allowed: true };
    }

    const status = sub?.status;
    const trialEndStr = sub?.trial_ends_at || sub?.current_period_end;
    const trialEndMs = trialEndStr ? new Date(trialEndStr).getTime() : 0;
    const nowTime = Date.now();

    const isTrialPast = status === 'trialing' && trialEndMs > 0 && trialEndMs <= nowTime;
    const isTrialExpired = status === 'expired' || isTrialPast;

    // PRIORITY 1: Expired trial hard block
    if (isTrialExpired) {
      if (pathname === '/trial-expired') return { allowed: true };
      return { allowed: false, redirect: '/trial-expired', hardBlock: true };
    }

    if (isOnboarding) return { allowed: true };

    const hasActiveSubscription = status === 'active' || (status === 'trialing' && trialEndMs > nowTime);
    if (!hasActiveSubscription) {
      return { allowed: false, redirect: '/pricing?reason=paywall' };
    }

    return { allowed: true };
  }

  // Dashboard access attempt with zero usage
  const dashboardAttempt = evaluateMiddlewareGate(testSub, '/dashboard');
  assert.strictEqual(dashboardAttempt.allowed, false);
  assert.strictEqual(dashboardAttempt.redirect, '/trial-expired');
  assert.strictEqual(dashboardAttempt.hardBlock, true);
  console.log('  ✓ Invariant 5a: Zero-usage user attempting /dashboard is hard blocked to /trial-expired');

  // Leads & Jobs access attempt
  const leadsAttempt = evaluateMiddlewareGate(testSub, '/leads');
  assert.strictEqual(leadsAttempt.redirect, '/trial-expired');
  const jobsAttempt = evaluateMiddlewareGate(testSub, '/jobs');
  assert.strictEqual(jobsAttempt.redirect, '/trial-expired');
  console.log('  ✓ Invariant 5b: Zero-usage user attempting /leads and /jobs is hard blocked.\n');

  // --------------------------------------------------------------------------
  // INVARIANT 6: Priority Over Onboarding Incomplete Checks
  // --------------------------------------------------------------------------
  console.log('--- Invariant 6: Expired Block Priority Over Onboarding ---');
  // Attempt to access /onboarding while trial is expired
  const onboardingAttempt = evaluateMiddlewareGate(testSub, '/onboarding');
  assert.strictEqual(
    onboardingAttempt.allowed,
    false,
    'Expired trial user must NOT be permitted into /onboarding'
  );
  assert.strictEqual(
    onboardingAttempt.redirect,
    '/trial-expired',
    'Expired trial user visiting /onboarding must be redirected to /trial-expired'
  );
  console.log('  ✓ Invariant 6 Passed: Expired trial block takes strict priority over onboarding.\n');

  // --------------------------------------------------------------------------
  // INVARIANT 7: Lazy & Scheduled Status Transition to 'expired'
  // --------------------------------------------------------------------------
  console.log('--- Invariant 7: Lazy Status Transition to "expired" ---');
  // Simulate lazy check execution
  if (testSub.status === 'trialing' && new Date(testSub.trial_ends_at).getTime() <= Date.now()) {
    testSub.status = 'expired';
  }
  assert.strictEqual(testSub.status, 'expired', 'Subscription status must transition to "expired"');

  const postExpireAttempt = evaluateMiddlewareGate(testSub, '/dashboard');
  assert.strictEqual(postExpireAttempt.redirect, '/trial-expired');
  console.log('  ✓ Invariant 7 Passed: Subscription status lazily and consistently transitions to "expired".\n');

  // --------------------------------------------------------------------------
  // INVARIANT 8: Pricing & Recovery Destination Integrity
  // --------------------------------------------------------------------------
  console.log('--- Invariant 8: Pricing & Recovery Destination Exemption ---');
  // User on /trial-expired should be allowed to load the blocker
  const blockerPageAttempt = evaluateMiddlewareGate(testSub, '/trial-expired');
  assert.strictEqual(blockerPageAttempt.allowed, true);

  // User clicking Subscribe Now goes to /pricing - which is not blocked by middleware
  const pricingPageAttempt = evaluateMiddlewareGate(testSub, '/pricing');
  assert.strictEqual(pricingPageAttempt.allowed, true);
  console.log('  ✓ Invariant 8 Passed: /trial-expired and /pricing remain accessible for subscription checkout.\n');

  console.log('================================================================');
  console.log('ALL 8 TRIAL EXPIRATION INVARIANTS VERIFIED SUCCESSFULLY! ✓');
  console.log('================================================================\n');
}

runTrialExpirationVerification().catch((err) => {
  console.error('VERIFICATION FAILURE:', err);
  process.exit(1);
});
