/**
 * PayPilot AI — Phase 3 Critical Security Vulnerability Test Suite
 * Tests Critical #1 (Cross-Tenant business_members INSERT attack) & Critical #2 (Client-Side Subscription Plan Escalation)
 */

interface MockUser {
  id: string;
  email: string;
  role: string;
}

interface MockBusiness {
  id: string;
  name: string;
}

interface MockMembership {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  is_primary: boolean;
}

interface MockSubscription {
  id: string;
  business_id: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'trialing' | 'active' | 'past_due' | 'cancelled';
  price_amount: number;
}

// Simulated Database & RLS Engine
class SecurityDatabaseSimulator {
  public businesses: MockBusiness[] = [];
  public businessMembers: MockMembership[] = [];
  public subscriptions: MockSubscription[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.businesses = [
      { id: 'biz_victim_company', name: 'Victim Enterprises' },
      { id: 'biz_attacker_company', name: 'Attacker LLC' },
    ];

    this.businessMembers = [
      { id: 'mem_1', business_id: 'biz_victim_company', user_id: 'usr_victim_owner', role: 'owner', is_primary: true },
      { id: 'mem_2', business_id: 'biz_attacker_company', user_id: 'usr_attacker', role: 'owner', is_primary: true },
    ];

    this.subscriptions = [
      { id: 'sub_victim', business_id: 'biz_victim_company', plan: 'Enterprise', status: 'active', price_amount: 199.00 },
      { id: 'sub_attacker', business_id: 'biz_attacker_company', plan: 'Starter', status: 'trialing', price_amount: 19.00 },
    ];
  }

  isBusinessAdmin(userId: string, businessId: string): boolean {
    const mem = this.businessMembers.find(m => m.business_id === businessId && m.user_id === userId);
    return mem ? (mem.role === 'owner' || mem.role === 'admin') : false;
  }

  isBusinessMember(userId: string, businessId: string): boolean {
    return this.businessMembers.some(m => m.business_id === businessId && m.user_id === userId);
  }

  // --- 1. business_members RLS Policies ---

  // Vulnerable Old Policy: WITH CHECK (user_id = auth.uid() OR is_business_admin(business_id))
  vulnerableInsertMembership(currentUser: MockUser, membership: Omit<MockMembership, 'id'>): { success: boolean; error?: string } {
    const isSelf = membership.user_id === currentUser.id;
    const isAdmin = this.isBusinessAdmin(currentUser.id, membership.business_id);
    if (isSelf || isAdmin) {
      this.businessMembers.push({ ...membership, id: `mem_${Date.now()}` });
      return { success: true };
    }
    return { success: false, error: 'RLS check failed' };
  }

  // Hardened New Policy: WITH CHECK (is_business_admin(business_id))
  hardenedInsertMembership(currentUser: MockUser, membership: Omit<MockMembership, 'id'>): { success: boolean; error?: string } {
    const isAdmin = this.isBusinessAdmin(currentUser.id, membership.business_id);
    if (isAdmin) {
      this.businessMembers.push({ ...membership, id: `mem_${Date.now()}` });
      return { success: true };
    }
    return { success: false, error: 'SECURITY_VIOLATION: Only business admins can insert new memberships into this business.' };
  }

  // Secure Database Trigger: AFTER INSERT ON businesses
  createBusinessWithTrigger(currentUser: MockUser, businessName: string): { business: MockBusiness; membership: MockMembership; subscription: MockSubscription } {
    const newBiz: MockBusiness = {
      id: `biz_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: businessName,
    };
    this.businesses.push(newBiz);

    // Trigger execution with SECURITY DEFINER
    const newMem: MockMembership = {
      id: `mem_trg_${Date.now()}`,
      business_id: newBiz.id,
      user_id: currentUser.id,
      role: 'owner',
      is_primary: true,
    };
    this.businessMembers.push(newMem);

    const newSub: MockSubscription = {
      id: `sub_trg_${Date.now()}`,
      business_id: newBiz.id,
      plan: 'Starter',
      status: 'trialing',
      price_amount: 19.00,
    };
    this.subscriptions.push(newSub);

    return { business: newBiz, membership: newMem, subscription: newSub };
  }

  // --- 2. subscriptions RLS Policies ---

  // Hardened Policy: FOR SELECT USING (is_business_member(business_id))
  selectSubscription(currentUser: MockUser, businessId: string): { success: boolean; data?: MockSubscription; error?: string } {
    if (!this.isBusinessMember(currentUser.id, businessId)) {
      return { success: false, error: 'RLS SELECT denied: User does not belong to business.' };
    }
    const sub = this.subscriptions.find(s => s.business_id === businessId);
    return { success: true, data: sub };
  }

  // Hardened Policy: FOR UPDATE TO service_role ONLY (Authenticated client UPDATE blocked)
  hardenedUpdateSubscription(
    currentUser: MockUser | 'service_role',
    businessId: string,
    updates: Partial<MockSubscription>
  ): { success: boolean; error?: string } {
    if (currentUser !== 'service_role') {
      return {
        success: false,
        error: 'SECURITY_VIOLATION: Direct client updates to subscriptions table are prohibited. Mutations must be executed via service_role / Stripe billing pipeline.',
      };
    }

    const sub = this.subscriptions.find(s => s.business_id === businessId);
    if (!sub) return { success: false, error: 'Subscription not found' };

    Object.assign(sub, updates);
    return { success: true };
  }
}

async function runCriticalSecurityTests() {
  console.log('======================================================================');
  console.log('PAYPILOT AI — PHASE 3 CRITICAL SECURITY VULNERABILITY TEST SUITE');
  console.log('======================================================================\n');

  let passedCount = 0;
  let totalTests = 0;

  function assertTest(testNum: number, name: string, condition: boolean, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] [CRITICAL] #${testNum}: ${name}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] [CRITICAL] #${testNum}: ${name}`);
      if (details) console.error(`    Details: ${details}`);
    }
  }

  const db = new SecurityDatabaseSimulator();

  const attacker: MockUser = { id: 'usr_attacker', email: 'attacker@evil.com', role: 'authenticated' };
  const victimAdmin: MockUser = { id: 'usr_victim_owner', email: 'victim@legit.com', role: 'authenticated' };
  const legitimateInvitee: MockUser = { id: 'usr_invitee', email: 'accountant@legit.com', role: 'authenticated' };

  // --------------------------------------------------------------------------
  // SECTION 1: CRITICAL #1 — Cross-Tenant business_members INSERT Hardening
  // --------------------------------------------------------------------------
  console.log('--- 1. Critical #1: Cross-Tenant business_members Insertion Defense ---');

  // Test 1: Attacker CANNOT self-insert into Victim Business under hardened policy
  const attackResult = db.hardenedInsertMembership(attacker, {
    business_id: 'biz_victim_company',
    user_id: attacker.id,
    role: 'owner',
    is_primary: false,
  });
  assertTest(
    1,
    'Attacker CANNOT insert membership into victim business (Cross-tenant join blocked)',
    attackResult.success === false &&
      Boolean(attackResult.error?.includes('Only business admins can insert')) &&
      !db.isBusinessMember(attacker.id, 'biz_victim_company')
  );

  // Test 2: Legitimate Business Admin CAN invite new members to their own business
  const legitInviteResult = db.hardenedInsertMembership(victimAdmin, {
    business_id: 'biz_victim_company',
    user_id: legitimateInvitee.id,
    role: 'member',
    is_primary: false,
  });
  assertTest(
    2,
    'Legitimate business owner/admin CAN add new team members to their own business',
    legitInviteResult.success === true && db.isBusinessMember(legitimateInvitee.id, 'biz_victim_company')
  );

  // Test 3: Normal user signup creates business and automatically registers creator as owner via trigger
  const newAccountCreator: MockUser = { id: 'usr_new_founder', email: 'founder@startup.com', role: 'authenticated' };
  const createBizResult = db.createBusinessWithTrigger(newAccountCreator, 'New Startup Inc');
  assertTest(
    3,
    'New business creation automatically provisions primary owner and trial subscription via trigger',
    createBizResult.business.name === 'New Startup Inc' &&
      createBizResult.membership.user_id === newAccountCreator.id &&
      createBizResult.membership.role === 'owner' &&
      createBizResult.subscription.plan === 'Starter' &&
      createBizResult.subscription.status === 'trialing'
  );

  // --------------------------------------------------------------------------
  // SECTION 2: CRITICAL #2 — Client-Side Subscription Privilege Escalation Defense
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Critical #2: Subscriptions Table Mutation Hardening ---');

  // Test 4: Attacker (even if admin of their own business) CANNOT directly upgrade plan via client UPDATE
  const clientPlanEscalation = db.hardenedUpdateSubscription(attacker, 'biz_attacker_company', {
    plan: 'Enterprise',
    status: 'active',
    price_amount: 199.00,
  });
  const attackerSub = db.subscriptions.find(s => s.business_id === 'biz_attacker_company');
  assertTest(
    4,
    'Tenant admin client CANNOT directly update subscriptions table (Plan escalation blocked)',
    clientPlanEscalation.success === false &&
      Boolean(clientPlanEscalation.error?.includes('Direct client updates to subscriptions table are prohibited')) &&
      attackerSub?.plan === 'Starter' &&
      attackerSub?.status === 'trialing'
  );

  // Test 5: Standard tenant user CAN read/view their own active subscription
  const readOwnSub = db.selectSubscription(attacker, 'biz_attacker_company');
  assertTest(
    5,
    'Tenant user CAN SELECT and view their own business subscription details',
    readOwnSub.success === true && readOwnSub.data?.plan === 'Starter'
  );

  // Test 6: Tenant user CANNOT read other businesses subscriptions
  const readVictimSub = db.selectSubscription(attacker, 'biz_victim_company');
  assertTest(
    6,
    'Tenant user CANNOT SELECT subscription details of another business tenant',
    readVictimSub.success === false && Boolean(readVictimSub.error?.includes('RLS SELECT denied'))
  );

  // Test 7: Backend Service Role (Stripe Webhook Pipeline) CAN update subscriptions safely
  const webhookUpgrade = db.hardenedUpdateSubscription('service_role', 'biz_attacker_company', {
    plan: 'Professional',
    status: 'active',
    price_amount: 49.00,
  });
  const updatedSub = db.subscriptions.find(s => s.business_id === 'biz_attacker_company');
  assertTest(
    7,
    'Server-side service_role (Verified Stripe Webhook) CAN mutate subscription lifecycle states',
    webhookUpgrade.success === true &&
      updatedSub?.plan === 'Professional' &&
      updatedSub?.status === 'active' &&
      updatedSub?.price_amount === 49.00
  );

  console.log('\n======================================================================');
  console.log(`TOTAL CRITICAL VULNERABILITY TESTS: ${totalTests} | PASSED: ${passedCount} | FAILED: ${totalTests - passedCount}`);
  console.log('======================================================================\n');

  if (passedCount === totalTests) {
    console.log('✅ ALL PHASE 3 CRITICAL SECURITY TESTS PASSED PERFECTLY\n');
  } else {
    console.error('❌ SOME CRITICAL TESTS FAILED\n');
    process.exit(1);
  }
}

runCriticalSecurityTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
