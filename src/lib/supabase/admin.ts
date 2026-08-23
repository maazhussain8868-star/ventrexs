import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Admin client with service_role key.
// STRICT SECURITY: Never import or execute this on client-side / browser components.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://paypilot-demo.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Admin operations will be disabled or simulated.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey || 'paypilot-demo-service-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
