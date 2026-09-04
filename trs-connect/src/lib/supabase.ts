// ==============================================================================
// TRS CONNECT — PRODUCTION SUPABASE CLIENT & SERVICE LAYER
// Strictly adheres to production security requirements:
// - Uses ONLY public anon key and environment variables
// - No service_role key or secrets anywhere in frontend
// - Real Supabase Auth (OTP sign-in, verification, session persistence, refresh, logout)
// - If env vars are missing, raises explicit: "Production backend is not configured."
// - Never simulates successful authentication without genuine backend
// ==============================================================================

import { createClient, Session, User } from '@supabase/supabase-js';
import {
  UserProfile,
  MembershipRecord,
  CitizenIssue,
  MembershipStatus
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const ERR_BACKEND_NOT_CONFIGURED = 'Production backend is not configured.';

// Check if production environment variables are properly supplied
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

// Single production client instance using only public anon key
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    })
  : null;

// ------------------------------------------------------------------------------
// 1. AUTHENTICATION (SIGN IN, OTP VERIFY, SESSION, LOGOUT, REFRESH, DELETE)
// ------------------------------------------------------------------------------

/**
 * Dispatch SMS OTP to citizen mobile number via Supabase Phone Auth.
 * Returns error if production backend is not configured.
 */
export async function signInWithOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error communicating with authentication gateway' };
  }
}

/**
 * Verify 6-digit OTP code with Supabase Phone Auth.
 */
export async function verifyOtpToken(
  phone: string,
  token: string
): Promise<{ success: boolean; session?: Session | null; user?: User | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms'
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Verification token validation failed' };
  }
}

/**
 * Get current authenticated session from storage or cache.
 */
export async function getSession(): Promise<{ session: Session | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { session: null, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { session: null, error: error.message };
  }
  return { session: data.session };
}

/**
 * Force refresh user session with Supabase.
 */
export async function refreshSession(): Promise<{ session: Session | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { session: null, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    return { session: null, error: error.message };
  }
  return { session: data.session };
}

/**
 * Log out and invalidate current session.
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete account: cascades deletion across all user private records via RLS.
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user session found' };
    }

    // Call RPC or delete from profiles (foreign keys will cascade)
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete account' };
  }
}

// ------------------------------------------------------------------------------
// 2. PROFILE & VERIFIED ROLE MANAGEMENT
// Role is NEVER trusted from frontend; fetched directly from database
// ------------------------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<{ profile: UserProfile | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { profile: null, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return {
    profile: {
      id: data.id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email,
      constituency: data.constituency,
      ward: data.ward,
      address: data.address,
      avatarUrl: data.avatar_url,
      role: data.role,
      isMember: data.is_member,
      isVolunteer: data.is_volunteer,
      createdAt: data.created_at
    }
  };
}

// ------------------------------------------------------------------------------
// 3. MEMBERSHIP OPERATIONS (NEVER AUTO-APPROVES; INSERTS AS PENDING ONLY)
// ------------------------------------------------------------------------------

export async function fetchMembership(userId: string): Promise<{ membership: MembershipRecord | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { membership: null, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { membership: null, error: error.message };
  }

  if (!data) return { membership: null };

  return {
    membership: {
      id: data.id,
      userId: data.user_id,
      applicationNumber: data.application_number,
      membershipNumber: data.membership_number,
      memberName: data.category, // Resolved from profile
      phone: '',
      constituency: '',
      ward: '',
      status: data.status,
      category: data.category,
      appliedDate: new Date(data.applied_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      approvedDate: data.approved_date ? new Date(data.approved_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
      validTill: data.valid_till ? new Date(data.valid_till).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
      qrCodeUrl: data.qr_code_url,
      verificationBadge: data.verification_badge,
      reviewedBy: data.reviewed_by,
      reviewNotes: data.review_notes
    }
  };
}

export async function createMembershipApplication(params: {
  userId: string;
  fullName: string;
  constituency: string;
  ward: string;
  category: MembershipRecord['category'];
}): Promise<{ success: boolean; membership: MembershipRecord | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, membership: null, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const applicationNumber = `APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id: params.userId,
      application_number: applicationNumber,
      status: 'pending', // Strictly enforced by DB schema & RLS
      category: params.category,
      verification_badge: 'Pending Verification by Authorized Committee'
    })
    .select()
    .single();

  if (error) {
    return { success: false, membership: null, error: error.message };
  }

  return {
    success: true,
    membership: {
      id: data.id,
      userId: data.user_id,
      applicationNumber: data.application_number,
      memberName: params.fullName,
      phone: '',
      constituency: params.constituency,
      ward: params.ward,
      status: 'pending',
      category: data.category,
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      verificationBadge: 'Pending Verification by Authorized Committee'
    }
  };
}

// ------------------------------------------------------------------------------
// 4. CITIZEN ISSUES (PRIVATE PER-USER RLS)
// ------------------------------------------------------------------------------

export async function fetchUserGrievances(userId: string): Promise<{ issues: CitizenIssue[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { issues: [], error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { issues: [], error: error.message };
  }

  return {
    issues: data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      reporterName: d.reporter_name,
      reporterPhone: d.reporter_phone,
      title: d.title,
      category: d.category,
      description: d.description,
      photoUrl: d.photo_url,
      locationName: d.location_name,
      constituency: d.constituency,
      ward: d.ward,
      status: d.status,
      assignedDepartment: d.assigned_department,
      assignedOfficer: d.assigned_officer,
      assignedOfficerContact: d.assigned_officer_contact,
      resolutionNotes: d.resolution_notes,
      submittedAt: d.created_at,
      updatedAt: d.updated_at
    }))
  };
}

export async function submitGrievance(issue: {
  userId: string;
  reporterName: string;
  reporterPhone: string;
  title: string;
  category: CitizenIssue['category'];
  description: string;
  locationName: string;
  constituency: string;
  ward: string;
  photoUrl?: string;
}): Promise<{ success: boolean; issue: CitizenIssue | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, issue: null, error: ERR_BACKEND_NOT_CONFIGURED };
  }

  const { data, error } = await supabase
    .from('issues')
    .insert({
      user_id: issue.userId,
      reporter_name: issue.reporterName,
      reporter_phone: issue.reporterPhone,
      title: issue.title,
      category: issue.category,
      description: issue.description,
      location_name: issue.locationName,
      constituency: issue.constituency,
      ward: issue.ward,
      photo_url: issue.photoUrl,
      status: 'submitted'
    })
    .select()
    .single();

  if (error) {
    return { success: false, issue: null, error: error.message };
  }

  return {
    success: true,
    issue: {
      id: data.id,
      userId: data.user_id,
      reporterName: data.reporter_name,
      reporterPhone: data.reporter_phone,
      title: data.title,
      category: data.category,
      description: data.description,
      photoUrl: data.photo_url,
      locationName: data.location_name,
      constituency: data.constituency,
      ward: data.ward,
      status: data.status,
      submittedAt: data.created_at,
      updatedAt: data.updated_at
    }
  };
}

// ------------------------------------------------------------------------------
// 5. STORAGE UPLOAD WITH VALIDATION
// ------------------------------------------------------------------------------

export async function uploadSiteAttachment(
  userId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: ERR_BACKEND_NOT_CONFIGURED };
  }

  // Security Validation
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file format. Only JPG, PNG, or WEBP allowed.' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size exceeds maximum allowed 5MB limit.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('issue_attachments')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('issue_attachments')
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Storage upload failed' };
  }
}
