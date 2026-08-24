import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

/**
 * Production server-side authorization check to verify admin/owner privileges.
 * Performs direct database queries and never relies on client-side state.
 */
export async function checkServerAdminAuthorization(
  client: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  if (!userId) return false;

  try {
    // 1. Check user profile role in profiles table
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profileError && profile && (profile.role === 'admin' || profile.role === 'owner')) {
      return true;
    }

    // 2. Check user role in business_members table
    const { data: members, error: membersError } = await client
      .from('business_members')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'owner'])
      .limit(1);

    if (!membersError && members && members.length > 0) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Server admin authorization check exception:', error);
    return false;
  }
}

/**
 * Asserts that the authenticated user belongs to the specified business ID.
 * Supports both assertUserBelongsToBusiness(userId, businessId) and assertUserBelongsToBusiness(client, businessId, userId).
 * Returns the verified membership details or throws an error.
 */
export async function assertUserBelongsToBusiness(
  clientOrUserId: SupabaseClient<Database> | string,
  businessId: string,
  userId?: string
): Promise<{ user_id: string; business_id: string; role: string }> {
  let client: SupabaseClient<Database>;
  let effectiveUserId: string | undefined;
  let targetBusinessId = businessId;

  if (typeof clientOrUserId === 'string') {
    // Invoked as: assertUserBelongsToBusiness(userId, businessId)
    effectiveUserId = clientOrUserId;
    targetBusinessId = businessId;
    const { createServerSupabaseClient } = await import('../supabase/server');
    client = await createServerSupabaseClient();
  } else {
    // Invoked as: assertUserBelongsToBusiness(client, businessId, userId?)
    client = clientOrUserId;
    effectiveUserId = userId;
  }

  if (!targetBusinessId || typeof targetBusinessId !== 'string' || targetBusinessId.trim() === '') {
    throw new Error('SECURITY_VIOLATION: Missing or invalid business identifier.');
  }

  // Resolve user id if not provided
  if (!effectiveUserId) {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        return { user_id: 'demo-user', business_id: targetBusinessId, role: 'owner' };
      }
      throw new Error('AUTHENTICATION_REQUIRED: User must be authenticated.');
    }
    effectiveUserId = user.id;
  }

  // Resolve membership server-side
  const { data: member, error: memberError } = await client
    .from('business_members')
    .select('role, user_id, business_id')
    .eq('business_id', targetBusinessId)
    .eq('user_id', effectiveUserId)
    .single();

  if (memberError || !member) {
    // Check if user is a system admin in profiles
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', effectiveUserId)
      .single();

    if (profile && (profile.role === 'admin' || profile.role === 'owner')) {
      return { user_id: effectiveUserId, business_id: targetBusinessId, role: profile.role };
    }

    throw new Error(`SECURITY_VIOLATION: User does not belong to business ${targetBusinessId}.`);
  }

  return {
    user_id: member.user_id,
    business_id: member.business_id,
    role: member.role,
  };
}

