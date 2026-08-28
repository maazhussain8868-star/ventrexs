import assert from 'node:assert/strict';
import { AuthService } from '../src/lib/supabase/services/auth';
import { BusinessService } from '../src/lib/supabase/services/business';
import { ProductionEnvironmentValidator } from '../src/lib/config/production-validator';

let passed = 0;
function check(name: string, condition: boolean) {
  assert.equal(condition, true, name);
  passed += 1;
  console.log(`  PASS ${name}`);
}

const authClient = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'owner@business.test' && password === 'correct-password') {
        return {
          data: {
            user: { id: 'user-business-a', email },
            session: { user: { id: 'user-business-a', email }, access_token: 'test-token' },
          },
          error: null,
        };
      }
      return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
    },
  },
} as any;

const businessClient = {
  from: (table: string) => {
    if (table === 'businesses') {
      return {
        select: () => ({
          eq: (_column: string, businessId: string) => ({
            single: async () => ({
              data: businessId === 'business-a' ? { id: 'business-a', name: 'Business A', email: 'owner@business.test' } : null,
              error: null,
            }),
          }),
        }),
      };
    }

    assert.equal(table, 'business_members');
    return {
      select: () => ({
        eq: (_column: string, userId: string) => ({
          order: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: userId === 'user-business-a' ? { business_id: 'business-a', role: 'owner', is_primary: true } : null,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };
  },
} as any;

async function run() {
  console.log('VENTREXS AI - PRODUCTION AUTH TEST');
  const auth = new AuthService(authClient);
  const valid = await auth.signIn({ email: 'owner@business.test', password: 'correct-password' });
  check('Valid credentials return an authenticated Supabase user and session', valid.user?.id === 'user-business-a' && !!valid.session);

  await assert.rejects(
    auth.signIn({ email: 'attacker@business.test', password: 'wrong-password' }),
    /Invalid login credentials/
  );
  check('Invalid credentials fail without creating a session', true);

  const business = new BusinessService(businessClient);
  const tenant = await business.getCurrentUserBusiness('user-business-a');
  check('Tenant resolution uses the authenticated user membership', tenant?.id === 'business-a' && tenant.userRole === 'owner');
  check('Unknown users do not receive a default business', (await business.getCurrentUserBusiness('unknown-user')) === null);

  const mutableEnv = process.env as unknown as { NODE_ENV?: string; VENTREXS_TEST_MODE?: string };
  const originalNodeEnv = mutableEnv.NODE_ENV;
  const originalTestMode = process.env.VENTREXS_TEST_MODE;
  mutableEnv.NODE_ENV = 'production';
  process.env.VENTREXS_TEST_MODE = 'true';
  const audit = ProductionEnvironmentValidator.runFullAudit();
  check('Production readiness rejects explicit test mode', audit.isProductionReady === false && audit.recommendations.some((item) => item.includes('VENTREXS_TEST_MODE')));
  mutableEnv.NODE_ENV = originalNodeEnv;
  process.env.VENTREXS_TEST_MODE = originalTestMode;

  console.log(`PRODUCTION AUTH TEST: ${passed} passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
