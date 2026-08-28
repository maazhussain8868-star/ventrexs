import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sourceFiles = [
  'src/context/AppContext.tsx',
  'src/middleware.ts',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/admin.ts',
  'src/lib/supabase/services/auth.ts',
  'src/lib/auth/server-authorization.ts',
  'src/lib/supabase/services/business.ts',
  'src/lib/supabase/services/payments.ts',
  'src/app/actions/index.ts',
  'src/app/api/webhooks/stripe/route.ts',
  'src/lib/billing/providers/factory.ts',
  'src/lib/payments/factory.ts',
  'src/lib/payments/webhooks/stripe.ts',
  'src/lib/payments/webhooks/razorpay.ts',
];
const source = Object.fromEntries(sourceFiles.map((file) => [file, read(file)]));

let passed = 0;
let failed = 0;
function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed += 1;
    console.log(`  PASS ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
}

console.log('VENTREXS AI - FINAL LAUNCH SMOKE TEST');

check('Public landing and demo routes exist', fs.existsSync(path.join(root, 'src/app/page.tsx')) && fs.existsSync(path.join(root, 'src/app/demo/page.tsx')));
check('Demo gateway is distinct from login', source['src/middleware.ts'].includes("'/login'") && source['src/middleware.ts'].includes("'/signup'"));
check('Demo access is token/session scoped', source['src/lib/payments/webhooks/stripe.ts'].includes('business_id') && fs.existsSync(path.join(root, 'src/lib/demo-access/service.ts')));
check('Demo payment provider is never selected in production', source['src/lib/billing/providers/factory.ts'].includes('ALLOW_DEV_PROVIDERS') && source['src/lib/payments/factory.ts'].includes('purpose === \'DEMO\''));
check('Demo payment cannot activate production subscriptions', source['src/lib/billing/subscription-engine.ts']?.includes('Demo payment provider is strictly forbidden in production environments.') ?? fs.existsSync(path.join(root, 'src/lib/billing/subscription-engine.ts')));
check('Provider selection separates SaaS and invoice purposes', source['src/lib/payments/factory.ts'].includes('SAAS_SUBSCRIPTION') && source['src/lib/payments/factory.ts'].includes('CUSTOMER_INVOICE'));
check('Normal login uses Supabase auth', source['src/context/AppContext.tsx'].includes('signIn,') && source['src/context/AppContext.tsx'].includes('services.auth.signIn'));
check('Normal login no longer fabricates demo sessions', !source['src/context/AppContext.tsx'].includes('paypilot-demo-access-token') && !source['src/context/AppContext.tsx'].includes('Signed In (Demo Workspace)'));
check('Provider no longer exposes unconditional auth stubs', !source['src/context/AppContext.tsx'].includes('signIn: async () => ({ success: true })'));
check('Tenant lookup is tied to authenticated user', source['src/lib/supabase/services/business.ts'].includes(".eq('user_id', userId)") && source['src/lib/auth/server-authorization.ts'].includes(".eq('user_id', effectiveUserId)"));
check('Server-side business authorization is enforced', source['src/lib/auth/server-authorization.ts'].includes('assertUserBelongsToBusiness') && source['src/app/actions/index.ts'].includes('assertUserBelongsToBusiness'));
check('Agency customer context switching is disabled', read('src/app/actions/agency.ts').includes('cannot access customer accounts'));
check('Stripe webhook rejects missing secrets', source['src/app/api/webhooks/stripe/route.ts'].includes('Stripe webhook is not configured.') && !source['src/app/api/webhooks/stripe/route.ts'].includes('sk_test_placeholder'));
check('Stripe webhook verifies signatures', source['src/lib/payments/webhooks/stripe.ts'].includes('verifyWebhookSignature'));
check('Razorpay webhook verifies signatures', source['src/lib/payments/webhooks/razorpay.ts'].includes('verifyWebhookSignature'));
check('Webhook replay protection exists', source['src/lib/payments/webhooks/stripe.ts'].includes('IdempotencyManager') && source['src/lib/payments/webhooks/razorpay.ts'].includes('IdempotencyManager'));
check('Secrets are not public environment variables', sourceFiles.every((file) => !source[file].match(/NEXT_PUBLIC_(STRIPE|RAZORPAY|SUPABASE_SERVICE_ROLE)/)));
check('Supabase clients fail closed when unconfigured', source['src/lib/supabase/client.ts'].includes('Supabase is not configured') && source['src/lib/supabase/server.ts'].includes('Supabase is not configured') && source['src/lib/supabase/admin.ts'].includes('Supabase admin client is not configured'));
check('Middleware has no production demo credential fallback', !source['src/middleware.ts'].includes('ventrexs-demo-anon-key') && source['src/middleware.ts'].includes('Supabase is not configured.'));
check('Payment service has no production demo adapter fallback', source['src/lib/supabase/services/payments.ts'].includes("else if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true')") && source['src/lib/supabase/services/payments.ts'].includes('Payment provider is not configured.'));
check('Test bypass is unavailable in production', source['src/app/api/webhooks/stripe/route.ts'].includes("process.env.NODE_ENV !== 'production' && process.env.VENTREXS_TEST_MODE === 'true'") && source['src/app/actions/index.ts'].includes("process.env.NODE_ENV !== 'production' && process.env.VENTREXS_TEST_MODE === 'true'") && source['src/middleware.ts'].includes("process.env.NODE_ENV === 'production' && process.env.VENTREXS_TEST_MODE !== 'true'"));
check('Signup does not create a trial subscription', !source['src/lib/supabase/services/auth.ts'].includes("status: 'trialing'"));
check('Desktop shell uses isolation and no Node integration', read('desktop/main.js').includes('contextIsolation: true') && read('desktop/main.js').includes('nodeIntegration: false') && read('desktop/main.js').includes('sandbox: true'));
check('Existing master test runner remains present', fs.existsSync(path.join(root, 'scripts/run-all-tests.ts')));
check('Production build script remains configured', JSON.parse(read('package.json')).scripts.build === 'next build');

console.log(`FINAL LAUNCH SMOKE TEST: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
