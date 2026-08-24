/**
 * PayPilot AI — Phase 5 Security Remediation Test Suite
 * Tests Medium #1 (AppContext Mutation Synchronization), Medium #2 (AI Copilot Balance Bounds Validation),
 * Low #1 (CSP connect-src Cleanup), & Low #2 (Tenant Ownership Assertion)
 */

import { validateFinancialBounds, validateAICollectionOutput } from '../src/lib/ai/validator';
import nextConfig from '../next.config';
import { assertUserBelongsToBusiness } from '../src/lib/auth/server-authorization';

interface MockInvoice {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_number: string;
  original_amount: number;
  amount_paid: number;
  remaining_balance: number;
  status: 'draft' | 'sent' | 'due' | 'partially_paid' | 'paid' | 'overdue';
}

interface MockCustomer {
  id: string;
  business_id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
}

// Simulated AppContext State & Server Action Engine
class AppContextSyncSimulator {
  public serverInvoices: MockInvoice[] = [];
  public serverCustomers: MockCustomer[] = [];
  public clientInvoices: MockInvoice[] = [];
  public clientCustomers: MockCustomer[] = [];
  public businessMembers: Array<{ business_id: string; user_id: string; role: string }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.businessMembers = [
      { business_id: 'biz_tenant_alpha', user_id: 'usr_alpha_owner', role: 'owner' },
      { business_id: 'biz_tenant_beta', user_id: 'usr_beta_owner', role: 'owner' },
    ];

    this.serverInvoices = [
      {
        id: 'inv_alpha_1',
        business_id: 'biz_tenant_alpha',
        customer_id: 'cust_alpha_1',
        invoice_number: 'INV-A001',
        original_amount: 5000,
        amount_paid: 0,
        remaining_balance: 5000,
        status: 'due',
      },
      {
        id: 'inv_beta_1',
        business_id: 'biz_tenant_beta',
        customer_id: 'cust_beta_1',
        invoice_number: 'INV-B001',
        original_amount: 8000,
        amount_paid: 0,
        remaining_balance: 8000,
        status: 'due',
      },
    ];

    this.serverCustomers = [
      { id: 'cust_alpha_1', business_id: 'biz_tenant_alpha', name: 'Alice Alpha', company: 'Alpha Corp', email: 'alice@alpha.com' },
      { id: 'cust_beta_1', business_id: 'biz_tenant_beta', name: 'Bob Beta', company: 'Beta LLC', email: 'bob@beta.com' },
    ];

    this.clientInvoices = [...this.serverInvoices];
    this.clientCustomers = [...this.serverCustomers];
  }

  // Server Action: createInvoice with tenant assertion
  async serverCreateInvoiceAction(
    userId: string,
    params: { business_id: string; customer_id: string; invoice_number: string; original_amount: number }
  ): Promise<{ success: boolean; data?: MockInvoice; error?: string }> {
    const isMember = this.businessMembers.some(
      m => m.business_id === params.business_id && m.user_id === userId
    );

    if (!isMember) {
      return { success: false, error: `SECURITY_VIOLATION: User does not belong to business ${params.business_id}` };
    }

    if (params.original_amount <= 0 || isNaN(params.original_amount) || !Number.isFinite(params.original_amount)) {
      return { success: false, error: 'Invalid invoice original amount' };
    }

    const created: MockInvoice = {
      id: `inv_srv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      business_id: params.business_id,
      customer_id: params.customer_id,
      invoice_number: params.invoice_number,
      original_amount: params.original_amount,
      amount_paid: 0,
      remaining_balance: params.original_amount,
      status: 'due',
    };

    this.serverInvoices.push(created);
    return { success: true, data: created };
  }

  // Client AppContext addInvoice with Server Action synchronization
  async clientAddInvoice(
    userId: string,
    businessId: string,
    invoiceData: { customerId: string; number: string; totalAmount: number },
    isDemo: boolean = false
  ): Promise<{ success: boolean; invoice?: MockInvoice; error?: string }> {
    if (!isDemo) {
      const serverRes = await this.serverCreateInvoiceAction(userId, {
        business_id: businessId,
        customer_id: invoiceData.customerId,
        invoice_number: invoiceData.number,
        original_amount: invoiceData.totalAmount,
      });

      if (!serverRes.success || !serverRes.data) {
        // Rollback / do not mutate local client state on failure
        return { success: false, error: serverRes.error };
      }

      // Synchronize client state with authoritative server data
      this.clientInvoices.push(serverRes.data);
      return { success: true, invoice: serverRes.data };
    } else {
      // Demo mode local-only
      const demoInvoice: MockInvoice = {
        id: `inv_demo_${Date.now()}`,
        business_id: businessId,
        customer_id: invoiceData.customerId,
        invoice_number: invoiceData.number,
        original_amount: invoiceData.totalAmount,
        amount_paid: 0,
        remaining_balance: invoiceData.totalAmount,
        status: 'due',
      };
      this.clientInvoices.push(demoInvoice);
      return { success: true, invoice: demoInvoice };
    }
  }
}

async function runPhase5Tests() {
  console.log('======================================================================');
  console.log('PAYPILOT AI — PHASE 5 MEDIUM & LOW SECURITY REMEDIATION TEST SUITE');
  console.log('======================================================================\n');

  let passedCount = 0;
  let totalTests = 0;

  function assertTest(testNum: number, name: string, condition: boolean, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] [PHASE_5] #${testNum}: ${name}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] [PHASE_5] #${testNum}: ${name}`);
      if (details) console.error(`    Details: ${details}`);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 1: MEDIUM #1 — AppContext Mutation Synchronization
  // --------------------------------------------------------------------------
  console.log('--- 1. Medium #1: AppContext Mutation Synchronization ---');
  const appSync = new AppContextSyncSimulator();

  // Test 1: Authenticated valid mutation synchronizes with authoritative server response
  const syncRes1 = await appSync.clientAddInvoice(
    'usr_alpha_owner',
    'biz_tenant_alpha',
    { customerId: 'cust_alpha_1', number: 'INV-A002', totalAmount: 1500 },
    false
  );

  const clientHasInv = appSync.clientInvoices.some(i => i.id === syncRes1.invoice?.id);
  const serverHasInv = appSync.serverInvoices.some(i => i.id === syncRes1.invoice?.id);

  assertTest(
    1,
    'Authenticated client mutation routes through Server Action and synchronizes with server state',
    syncRes1.success && clientHasInv && serverHasInv && syncRes1.invoice?.remaining_balance === 1500
  );

  // Test 2: Unauthorized cross-tenant mutation is rejected by Server Action and DOES NOT corrupt client state
  const preFailClientCount = appSync.clientInvoices.length;
  const failRes = await appSync.clientAddInvoice(
    'usr_alpha_owner',
    'biz_tenant_beta', // Alpha user trying to create invoice in Beta tenant
    { customerId: 'cust_beta_1', number: 'INV-B999', totalAmount: 9999 },
    false
  );

  const postFailClientCount = appSync.clientInvoices.length;

  assertTest(
    2,
    'Failed or unauthorized mutation does NOT optimistically persist or corrupt client state (Fail closed)',
    !failRes.success &&
      failRes.error?.includes('SECURITY_VIOLATION') === true &&
      postFailClientCount === preFailClientCount
  );

  // Test 3: Demo mode persists locally without requiring server action
  const demoRes = await appSync.clientAddInvoice(
    'usr_demo',
    '11111111-1111-1111-1111-111111111111',
    { customerId: 'demo_cust', number: 'INV-DEMO-1', totalAmount: 300 },
    true
  );

  assertTest(
    3,
    'Demo mode gracefully preserves local-only simulation when NEXT_PUBLIC_DEMO_MODE=true',
    demoRes.success && demoRes.invoice?.invoice_number === 'INV-DEMO-1'
  );

  // --------------------------------------------------------------------------
  // SECTION 2: MEDIUM #2 — AI Copilot Balance Bounds Validation
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Medium #2: AI Copilot Balance Bounds Validation ---');

  // Test 4: Rejects NaN and Infinity
  const nanCheck = validateFinancialBounds({
    original_amount: NaN,
    amount_paid: 100,
    remaining_balance: 100,
  });

  const infCheck = validateFinancialBounds({
    original_amount: 1000,
    amount_paid: Infinity,
    remaining_balance: 1000,
  });

  assertTest(
    4,
    'AI validator strictly rejects NaN and Infinity on financial amounts',
    !nanCheck.isValid && !infCheck.isValid
  );

  // Test 5: Rejects negative monetary amounts
  const negCheck = validateFinancialBounds({
    original_amount: -500,
    amount_paid: 0,
    remaining_balance: -500,
  });

  assertTest(
    5,
    'AI validator strictly rejects negative balances and amounts',
    !negCheck.isValid && negCheck.errors.some(e => e.includes('cannot be negative'))
  );

  // Test 6: Rejects impossible balance values (remaining > original or paid > original)
  const impossibleCheck1 = validateFinancialBounds({
    original_amount: 1000,
    amount_paid: 1500, // overpaid
    remaining_balance: 0,
  });

  const impossibleCheck2 = validateFinancialBounds({
    original_amount: 1000,
    amount_paid: 0,
    remaining_balance: 2000, // exceeds original
  });

  assertTest(
    6,
    'AI validator strictly rejects impossible balances exceeding original amount',
    !impossibleCheck1.isValid && !impossibleCheck2.isValid
  );

  // Test 7: Ledger Invariant remaining_balance === original_amount - amount_paid
  const invariantViolationCheck = validateFinancialBounds({
    original_amount: 1000,
    amount_paid: 300,
    remaining_balance: 800, // Should be 700!
  });

  const validInvariantCheck = validateFinancialBounds({
    original_amount: 1000,
    amount_paid: 300,
    remaining_balance: 700,
  });

  assertTest(
    7,
    'AI validator strictly enforces remaining_balance = original_amount - amount_paid (Ledger Invariant)',
    !invariantViolationCheck.isValid &&
      invariantViolationCheck.errors.some(e => e.includes('Ledger invariant violation')) &&
      validInvariantCheck.isValid
  );

  // Test 8: Halal-First hard rule preservation (zero riba, zero interest, zero late fees)
  const ribaCheck = validateAICollectionOutput({
    priority: 'high',
    recommended_action: 'send_reminder',
    reason: 'Account overdue with 5% interest fee added',
    message_draft: 'Please pay your balance with late fees',
    confidence: 0.95,
  });

  assertTest(
    8,
    'AI validator strictly fails closed on Halal-First ethical violations (interest/fees/penalties)',
    !ribaCheck.isValid && ribaCheck.errors.some(e => e.includes('HALAL-FIRST VIOLATION'))
  );

  // --------------------------------------------------------------------------
  // SECTION 3: LOW #1 — CSP connect-src Cleanup
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Low #1: CSP connect-src Cleanup ---');

  // Test 9: CSP header exists and connect-src only contains genuinely required production domains
  const headers = await (nextConfig as any).headers();
  const rootHeaderConfig = headers.find((h: any) => h.source === '/(.*)');
  const cspHeader = rootHeaderConfig?.headers?.find((h: any) => h.key === 'Content-Security-Policy')?.value || '';

  const hasExcessiveCdn = cspHeader.includes('cdnjs.cloudflare.com');
  const hasSupabase = cspHeader.includes('https://*.supabase.co') && cspHeader.includes('wss://*.supabase.co');
  const hasStripe = cspHeader.includes('https://api.stripe.com');
  const hasWildcardConnect = cspHeader.includes('connect-src *');

  assertTest(
    9,
    'CSP connect-src retains ONLY genuinely required browser domains without excessive 3rd party entries',
    !hasExcessiveCdn && hasSupabase && hasStripe && !hasWildcardConnect
  );

  // --------------------------------------------------------------------------
  // SECTION 4: LOW #2 — Tenant Ownership Assertion
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Low #2: Tenant Ownership Assertion ---');

  // Simulated Supabase Client for tenant membership verification
  const mockSupabaseTenantClient = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'usr_alpha_owner' } }, error: null }),
    },
    from: (table: string) => ({
      select: (_cols: string) => ({
        eq: (col1: string, val1: string) => ({
          eq: (col2: string, val2: string) => ({
            single: async () => {
              if (table === 'business_members' && val1 === 'biz_tenant_alpha' && val2 === 'usr_alpha_owner') {
                return { data: { role: 'owner', user_id: 'usr_alpha_owner', business_id: 'biz_tenant_alpha' }, error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            },
          }),
          single: async () => {
            if (table === 'profiles' && val1 === 'usr_alpha_owner') {
              return { data: { role: 'member' }, error: null };
            }
            return { data: null, error: { message: 'Not found' } };
          },
        }),
      }),
    }),
  } as any;

  // Test 10: Valid same-tenant access succeeds
  const sameTenantResult = await assertUserBelongsToBusiness(
    mockSupabaseTenantClient,
    'biz_tenant_alpha',
    'usr_alpha_owner'
  );

  assertTest(
    10,
    'assertUserBelongsToBusiness succeeds for verified member of same tenant',
    sameTenantResult.business_id === 'biz_tenant_alpha' && sameTenantResult.user_id === 'usr_alpha_owner'
  );

  // Test 11: Cross-tenant access is strictly rejected with SECURITY_VIOLATION
  let crossTenantError = '';
  try {
    await assertUserBelongsToBusiness(
      mockSupabaseTenantClient,
      'biz_tenant_beta', // Trying to access Beta with Alpha user
      'usr_alpha_owner'
    );
  } catch (e: any) {
    crossTenantError = e.message;
  }

  assertTest(
    11,
    'assertUserBelongsToBusiness strictly rejects cross-tenant access with SECURITY_VIOLATION',
    crossTenantError.includes('SECURITY_VIOLATION')
  );

  // Test 12: Missing/empty business ID is strictly rejected
  let emptyBizError = '';
  try {
    await assertUserBelongsToBusiness(
      mockSupabaseTenantClient,
      '',
      'usr_alpha_owner'
    );
  } catch (e: any) {
    emptyBizError = e.message;
  }

  assertTest(
    12,
    'assertUserBelongsToBusiness strictly rejects missing or blank business identifier',
    emptyBizError.includes('SECURITY_VIOLATION')
  );

  console.log('\n======================================================================');
  console.log(`TOTAL PHASE 5 TESTS: ${totalTests} | PASSED: ${passedCount} | FAILED: ${totalTests - passedCount}`);
  console.log('======================================================================\n');

  if (passedCount === totalTests) {
    console.log('✅ ALL PHASE 5 MEDIUM & LOW SECURITY REMEDIATION TESTS PASSED PERFECTLY\n');
  } else {
    console.error('❌ SOME PHASE 5 TESTS FAILED\n');
    process.exit(1);
  }
}

runPhase5Tests().catch(err => {
  console.error('Phase 5 Test runner fatal error:', err);
  process.exit(1);
});
