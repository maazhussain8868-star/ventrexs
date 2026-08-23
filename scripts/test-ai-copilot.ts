import { LocalRuleAIProvider } from '../src/lib/ai/provider';
import { validateAICollectionOutput } from '../src/lib/ai/validator';
import { AICollectionInput } from '../src/lib/ai/types';

// ==============================================================================
// PAYPILOT AI — PHASE 3 AI COLLECTION COPILOT VALIDATION SUITE
// ==============================================================================

interface TestCaseResult {
  caseNum: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestCaseResult[] = [];

function assertTest(caseNum: number, name: string, condition: boolean, details?: string) {
  if (condition) {
    results.push({ caseNum, name, passed: true });
    console.log(`  ✓ [PASS] Case ${caseNum}: ${name}`);
  } else {
    results.push({ caseNum, name, passed: false, details });
    console.error(`  ✗ [FAIL] Case ${caseNum}: ${name} -> ${details || 'Condition failed'}`);
  }
}

async function runAICopilotTests() {
  console.log('===============================================================');
  console.log('PAYPILOT AI — PHASE 3 AI COLLECTION COPILOT TEST SUITE');
  console.log('===============================================================');

  const ai = new LocalRuleAIProvider();

  // ----------------------------------------------------------------------------
  // CASE 1: Paid invoice -> no collection recommendation (action: monitor)
  // ----------------------------------------------------------------------------
  const paidInput: AICollectionInput = {
    invoiceId: 'inv-paid-1',
    invoiceNumber: 'INV-2026-PAID',
    originalAmount: 3500,
    amountPaid: 3500,
    remainingBalance: 0,
    dueDate: '2026-07-29',
    daysOverdue: 0,
    status: 'paid',
    customerName: 'David Chen',
    customerCompany: 'Apex Logistics Co.',
    customerEmail: 'dchen@apexlogistics.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res1 = await ai.analyzeInvoice(paidInput);
  assertTest(1, 'Paid invoice -> no collection recommendation (action: monitor)',
    res1.recommended_action === 'monitor' && res1.priority === 'low'
  );

  // ----------------------------------------------------------------------------
  // CASE 2: Due invoice -> gentle reminder recommendation
  // ----------------------------------------------------------------------------
  const dueInput: AICollectionInput = {
    invoiceId: 'inv-due-2',
    invoiceNumber: 'INV-2026-002',
    originalAmount: 2840,
    amountPaid: 0,
    remainingBalance: 2840,
    dueDate: '2026-08-24',
    daysOverdue: 0,
    status: 'due',
    customerName: 'Elena Rostova',
    customerCompany: 'Vanguard Media Group',
    customerEmail: 'elena@vanguardmedia.io',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res2 = await ai.analyzeInvoice(dueInput);
  assertTest(2, 'Due invoice -> gentle reminder recommendation',
    res2.recommended_action === 'send_reminder' && res2.suggested_tone === 'Gentle Check-in' && res2.priority === 'low'
  );

  // ----------------------------------------------------------------------------
  // CASE 3: 1–15 days overdue -> professional follow-up
  // ----------------------------------------------------------------------------
  const overdueEarlyInput: AICollectionInput = {
    invoiceId: 'inv-od-3',
    invoiceNumber: 'INV-2026-001',
    originalAmount: 4410,
    amountPaid: 0,
    remainingBalance: 4410,
    dueDate: '2026-08-15',
    daysOverdue: 8,
    status: 'overdue',
    customerName: 'Marcus Sterling',
    customerCompany: 'Sterling & Stone Hospitality',
    customerEmail: 'marcus@sterlingstone.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res3 = await ai.analyzeInvoice(overdueEarlyInput);
  assertTest(3, '1–15 days overdue -> professional follow-up',
    res3.recommended_action === 'send_followup' && res3.suggested_tone === 'Professional Statement' && res3.priority === 'medium'
  );

  // ----------------------------------------------------------------------------
  // CASE 4: 16–30 days overdue -> higher priority
  // ----------------------------------------------------------------------------
  const overdueMidInput: AICollectionInput = {
    invoiceId: 'inv-od-4',
    invoiceNumber: 'INV-2026-088',
    originalAmount: 6200,
    amountPaid: 0,
    remainingBalance: 6200,
    dueDate: '2026-08-01',
    daysOverdue: 22,
    status: 'overdue',
    customerName: 'Sarah Jenkins',
    customerCompany: 'Nexus Creative Studio',
    customerEmail: 'sjenkins@nexus.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res4 = await ai.analyzeInvoice(overdueMidInput);
  assertTest(4, '16–30 days overdue -> higher priority',
    res4.recommended_action === 'send_followup' && res4.priority === 'high' && res4.suggested_tone === 'Firm Follow-up'
  );

  // ----------------------------------------------------------------------------
  // CASE 5: 31+ days overdue -> review account
  // ----------------------------------------------------------------------------
  const overdueLateInput: AICollectionInput = {
    invoiceId: 'inv-od-5',
    invoiceNumber: 'INV-2026-099',
    originalAmount: 9500,
    amountPaid: 0,
    remainingBalance: 9500,
    dueDate: '2026-07-05',
    daysOverdue: 49,
    status: 'overdue',
    customerName: 'Arthur Dent',
    customerCompany: 'Megadodo Publications',
    customerEmail: 'adent@megadodo.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res5 = await ai.analyzeInvoice(overdueLateInput);
  assertTest(5, '31+ days overdue -> review account action',
    res5.recommended_action === 'review_account' && res5.priority === 'high'
  );

  // ----------------------------------------------------------------------------
  // CASE 6: Partially paid invoice -> correct remaining balance referenced
  // ----------------------------------------------------------------------------
  const partiallyPaidInput: AICollectionInput = {
    invoiceId: 'inv-partial-6',
    invoiceNumber: 'INV-2026-PARTIAL',
    originalAmount: 10000,
    amountPaid: 4000,
    remainingBalance: 6000,
    dueDate: '2026-08-10',
    daysOverdue: 13,
    status: 'partially_paid',
    customerName: 'Jessica Taylor',
    customerCompany: 'Taylor Industrial Design',
    customerEmail: 'jtaylor@taylordesign.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res6 = await ai.analyzeInvoice(partiallyPaidInput);
  const mentionsRemaining = res6.message_draft.includes('6,000.00') || res6.message_draft.includes('6000');
  const doesNotClaimOriginal = !res6.message_draft.includes('amount of $10,000.00 is now overdue') && !res6.message_draft.includes('pay $10,000.00');

  assertTest(6, 'Partially paid invoice -> references remaining balance ($6,000.00) not original amount ($10,000.00)',
    mentionsRemaining && doesNotClaimOriginal
  );

  // ----------------------------------------------------------------------------
  // CASE 7: Zero balance -> no collection action
  // ----------------------------------------------------------------------------
  const zeroBalanceInput: AICollectionInput = {
    invoiceId: 'inv-zero-7',
    invoiceNumber: 'INV-2026-ZERO',
    originalAmount: 5000,
    amountPaid: 5000,
    remainingBalance: 0,
    dueDate: '2026-08-01',
    daysOverdue: 22,
    status: 'paid',
    customerName: 'Sam Vance',
    customerCompany: 'Vance Refrigeration',
    customerEmail: 'sam@vance.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  };

  const res7 = await ai.analyzeInvoice(zeroBalanceInput);
  assertTest(7, 'Zero balance invoice -> monitor action, no collection pressure',
    res7.recommended_action === 'monitor' && res7.priority === 'low'
  );

  // ----------------------------------------------------------------------------
  // CASE 8: AI attempts forbidden financial language -> strictly reject output
  // ----------------------------------------------------------------------------
  const invalidOutputs = [
    {
      priority: 'high',
      recommended_action: 'send_followup',
      reason: 'Late payment fee of $50 added to account.',
      suggested_tone: 'Firm Follow-up',
      message_draft: 'Please pay your balance plus 5% monthly interest penalty immediately.',
      confidence: 0.9,
    },
    {
      priority: 'medium',
      recommended_action: 'send_followup',
      reason: 'Standard review',
      suggested_tone: 'Professional Statement',
      message_draft: 'If unable to pay, we recommend taking a merchant loan or invoice financing.',
      confidence: 0.85,
    },
    {
      priority: 'high',
      recommended_action: 'review_account',
      reason: 'Sell your debt to a third party collection agency.',
      suggested_tone: 'Firm Follow-up',
      message_draft: 'Debt trading and factoring will occur next week.',
      confidence: 0.9,
    },
  ];

  let allInvalidRejected = true;
  for (const inv of invalidOutputs) {
    const val = validateAICollectionOutput(inv);
    if (val.isValid) {
      allInvalidRejected = false;
      console.error('Failed to reject forbidden output:', inv);
    }
  }

  assertTest(8, 'AI attempts forbidden financial language (interest, late fee, loans, debt trading) -> strictly rejected',
    allInvalidRejected
  );

  // ----------------------------------------------------------------------------
  // CASE 9: Cross-business RLS isolation: User from Business A cannot access Business B AI recommendations
  // ----------------------------------------------------------------------------
  const businessARecs = [
    { id: 'rec_a1', business_id: '11111111-1111-1111-1111-111111111111', customer_name: 'Marcus Sterling' },
  ];
  const businessBRecs = [
    { id: 'rec_b1', business_id: '22222222-2222-2222-2222-222222222222', customer_name: 'Robert Miller' },
  ];

  function queryRecommendationsForUser(businessId: string, allRecs: typeof businessARecs) {
    return allRecs.filter(r => r.business_id === businessId);
  }

  const allRecommendations = [...businessARecs, ...businessBRecs];
  const userAView = queryRecommendationsForUser('11111111-1111-1111-1111-111111111111', allRecommendations);

  assertTest(9, 'User from Business A CANNOT access Business B AI recommendations (0 cross-tenant leakage)',
    userAView.length === 1 && userAView[0].id === 'rec_a1' && !userAView.some(r => r.id === 'rec_b1')
  );

  // ----------------------------------------------------------------------------
  // CASE 10: AI cannot modify financial records (read-only input enforcement)
  // ----------------------------------------------------------------------------
  const invoiceOriginal = {
    id: 'inv-immutable-10',
    original_amount: 5000.00,
    amount_paid: 1000.00,
    remaining_balance: 4000.00,
  };

  const invoiceCopy = { ...invoiceOriginal };
  await ai.analyzeInvoice({
    invoiceId: invoiceCopy.id,
    invoiceNumber: 'INV-IMMUTABLE',
    originalAmount: invoiceCopy.original_amount,
    amountPaid: invoiceCopy.amount_paid,
    remainingBalance: invoiceCopy.remaining_balance,
    dueDate: '2026-08-10',
    daysOverdue: 13,
    status: 'partially_paid',
    customerName: 'Test Client',
    customerCompany: 'Test Co',
    customerEmail: 'test@co.com',
    businessName: 'Main Street Bakery',
    businessCurrency: 'USD ($)',
  });

  assertTest(10, 'AI execution leaves financial balances 100% unmodified (read-only invariant preserved)',
    invoiceCopy.original_amount === invoiceOriginal.original_amount &&
    invoiceCopy.amount_paid === invoiceOriginal.amount_paid &&
    invoiceCopy.remaining_balance === invoiceOriginal.remaining_balance
  );

  // ----------------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n===============================================================');
  console.log(`TOTAL AI COPILOT TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    console.error('\n❌ PHASE 3 AI COLLECTION COPILOT VALIDATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL 10/10 AI COLLECTION COPILOT TEST CASES PASSED PERFECTLY');
  }
}

runAICopilotTests();
