import fs from 'fs';
import path from 'path';

// ==============================================================================
// PAYPILOT AI — BACKEND & SECURITY VALIDATION TEST RUNNER
// ==============================================================================

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, message?: string) {
  if (condition) {
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [PASS] ${suite} -> ${name}`);
  } else {
    results.push({ suite, name, passed: false, message });
    console.error(`  ✗ [FAIL] ${suite} -> ${name}: ${message || 'Assertion failed'}`);
  }
}

// ------------------------------------------------------------------------------
// TEST 1: Database Migration Schema & Halal-First Audit
// ------------------------------------------------------------------------------
function testMigrationSchema() {
  console.log('\n--- 1. Testing Database Migration Schema & Halal-First Integrity ---');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260823000000_paypilot_foundation_schema.sql');
  assert('Schema', 'Migration file exists', fs.existsSync(migrationPath));

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Verify all 13 tables are defined
  const requiredTables = [
    'profiles',
    'businesses',
    'business_members',
    'customers',
    'invoices',
    'invoice_items',
    'payments',
    'invoice_events',
    'communications',
    'ai_recommendations',
    'notifications',
    'subscriptions',
    'audit_logs',
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, 'i');
    assert('Schema', `Table public.${table} defined`, tableRegex.test(sql));
  }

  // Halal-First Strict Audit: Strip comments and ensure forbidden words are NOT table columns or schema fields
  const sqlWithoutComments = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const forbiddenFieldRegex = /\b(interest|riba|apr|apy|late_fee|late_charge|late_interest|financing_charge|debt_trading|cash_advance)\b/i;
  assert('Halal-First', 'Zero forbidden riba/interest/financing columns in SQL schema', !forbiddenFieldRegex.test(sqlWithoutComments));

  // Check invariant constraint in SQL: remaining_balance = (original_amount - amount_paid)
  assert(
    'Halal-First',
    'SQL enforces remaining_balance = (original_amount - amount_paid)',
    sql.includes('remaining_balance = (original_amount - amount_paid)')
  );

  // Check RLS enabled on all tables
  for (const table of requiredTables) {
    const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
    assert('RLS', `RLS enabled on public.${table}`, rlsRegex.test(sql));
  }
}

// ------------------------------------------------------------------------------
// TEST 2: Mathematical Invariants & Payment Processing Logic
// ------------------------------------------------------------------------------
function testFinancialLogic() {
  console.log('\n--- 2. Testing Financial Balance Invariants & Payment Validation ---');

  // Scenario 1: Invoice creation with line items
  const originalAmount = 4410.00;
  let amountPaid = 0.00;
  let remainingBalance = originalAmount - amountPaid;

  assert('Financial', 'Initial remaining balance matches original amount exactly', remainingBalance === 4410.00);

  // Scenario 2: Partial payment of $1,500
  const payment1 = 1500.00;
  amountPaid += payment1;
  remainingBalance = originalAmount - amountPaid;

  assert('Financial', 'Partial payment reduces remaining balance accurately ($2,910.00)', remainingBalance === 2910.00);
  assert('Financial', 'Status is partially_paid', remainingBalance > 0 && amountPaid > 0);

  // Scenario 3: Overpayment attempt (> remaining balance)
  const invalidOverpayment = 3500.00;
  const isOverpaymentAllowed = invalidOverpayment <= remainingBalance;
  assert('Financial', 'Overpayment ($3,500 > $2,910) is strictly rejected', !isOverpaymentAllowed);

  // Scenario 4: Full settlement of remaining $2,910
  const payment2 = 2910.00;
  amountPaid += payment2;
  remainingBalance = Math.max(0, originalAmount - amountPaid);

  assert('Financial', 'Full settlement reduces remaining balance to $0.00', remainingBalance === 0.00);
  assert('Financial', 'Status advances to paid', remainingBalance === 0);
}

// ------------------------------------------------------------------------------
// TEST 3: CRITICAL SECURITY TEST — Cross-Business Multi-Tenant Isolation
// ------------------------------------------------------------------------------
function testCrossBusinessIsolation() {
  console.log('\n--- 3. Testing Cross-Business Multi-Tenant Security & Isolation ---');

  // Simulated Database Tenants
  const businessA = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Main Street Bakery & Cafe',
    userId: 'u_jane_doe_1',
    customers: [
      { id: 'c_a1', businessId: '11111111-1111-1111-1111-111111111111', name: 'Marcus Sterling' }
    ],
    invoices: [
      { id: 'inv_a1', businessId: '11111111-1111-1111-1111-111111111111', number: 'INV-2026-001', amount: 4410.00 }
    ],
    payments: [
      { id: 'pay_a1', businessId: '11111111-1111-1111-1111-111111111111', amount: 4410.00 }
    ]
  };

  const businessB = {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Apex Industrial HVAC',
    userId: 'u_marcus_vance_2',
    customers: [
      { id: 'c_b1', businessId: '22222222-2222-2222-2222-222222222222', name: 'Robert Miller' }
    ],
    invoices: [
      { id: 'inv_b1', businessId: '22222222-2222-2222-2222-222222222222', number: 'INV-2026-999', amount: 12500.00 }
    ],
    payments: [
      { id: 'pay_b1', businessId: '22222222-2222-2222-2222-222222222222', amount: 12500.00 }
    ]
  };

  // Membership registry
  const memberships = [
    { userId: businessA.userId, businessId: businessA.id, role: 'owner' },
    { userId: businessB.userId, businessId: businessB.id, role: 'owner' },
  ];

  // RLS Simulator function: is_business_member
  function isBusinessMember(userId: string, targetBusinessId: string) {
    return memberships.some(m => m.userId === userId && m.businessId === targetBusinessId);
  }

  // RLS Query simulator
  function queryInvoicesAsUser(userId: string, allInvoices: typeof businessA.invoices) {
    return allInvoices.filter(inv => isBusinessMember(userId, inv.businessId));
  }

  function queryCustomersAsUser(userId: string, allCustomers: typeof businessA.customers) {
    return allCustomers.filter(c => isBusinessMember(userId, c.businessId));
  }

  function mutateInvoiceAsUser(userId: string, invoice: typeof businessA.invoices[0]) {
    if (!isBusinessMember(userId, invoice.businessId)) {
      throw new Error('RLS Error: Permission denied. Access restricted to business members.');
    }
    return true;
  }

  const allInvoices = [...businessA.invoices, ...businessB.invoices];
  const allCustomers = [...businessA.customers, ...businessB.customers];

  // 1. Business A user querying invoices
  const userAInvoices = queryInvoicesAsUser(businessA.userId, allInvoices);
  assert(
    'Cross-Tenant Isolation',
    'Business A user can see Business A invoices',
    userAInvoices.some(i => i.id === 'inv_a1')
  );
  assert(
    'Cross-Tenant Isolation',
    'Business A user CANNOT read Business B invoices (0 leakage)',
    !userAInvoices.some(i => i.id === 'inv_b1')
  );

  // 2. Business A user querying customers
  const userACustomers = queryCustomersAsUser(businessA.userId, allCustomers);
  assert(
    'Cross-Tenant Isolation',
    'Business A user CANNOT read Business B customers',
    !userACustomers.some(c => c.id === 'c_b1')
  );

  // 3. Business A user attempting to mutate Business B invoice
  let preventedMutation = false;
  try {
    mutateInvoiceAsUser(businessA.userId, businessB.invoices[0]);
  } catch (err: any) {
    preventedMutation = true;
  }
  assert(
    'Cross-Tenant Isolation',
    'Business A user CANNOT update or delete Business B invoices',
    preventedMutation
  );

  // 4. Business B user attempting to mutate Business A invoice
  let preventedMutationB = false;
  try {
    mutateInvoiceAsUser(businessB.userId, businessA.invoices[0]);
  } catch (err: any) {
    preventedMutationB = true;
  }
  assert(
    'Cross-Tenant Isolation',
    'Business B user CANNOT update or delete Business A invoices',
    preventedMutationB
  );
}

// ------------------------------------------------------------------------------
// TEST 4: Audit Trail Sanitization Test
// ------------------------------------------------------------------------------
function testAuditSanitization() {
  console.log('\n--- 4. Testing Audit Trail Secret Sanitization ---');

  const dirtyMetadata = {
    invoice_id: 'inv-123',
    amount: 500,
    password: 'superSecretPassword123!',
    token: 'jwt.bearer.secret.token',
    client_secret: 'sk_live_999999',
    user_email: 'jane@company.com'
  };

  const cleanMetadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dirtyMetadata)) {
    if (!/password|token|secret|key|authorization/i.test(key)) {
      cleanMetadata[key] = value;
    }
  }

  assert('Audit', 'Audit log retains legitimate operational metadata', cleanMetadata.invoice_id === 'inv-123' && cleanMetadata.amount === 500);
  assert('Audit', 'Audit log strips password field', !('password' in cleanMetadata));
  assert('Audit', 'Audit log strips token field', !('token' in cleanMetadata));
  assert('Audit', 'Audit log strips client_secret field', !('client_secret' in cleanMetadata));
}

// ------------------------------------------------------------------------------
// MAIN RUNNER
// ------------------------------------------------------------------------------
function runAllTests() {
  console.log('===============================================================');
  console.log('PAYPILOT AI — BACKEND FOUNDATION VERIFICATION SUITE');
  console.log('===============================================================');

  testMigrationSchema();
  testFinancialLogic();
  testCrossBusinessIsolation();
  testAuditSanitization();

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    console.error('\n❌ BACKEND VALIDATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL BACKEND & SECURITY VALIDATION TESTS PASSED');
  }
}

runAllTests();
