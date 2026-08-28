import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

let hasWarnedAdminKey = false;

// Admin client with service_role key.
// STRICT SECURITY: Never import or execute this on client-side / browser components.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    if (!hasWarnedAdminKey && process.env.NODE_ENV !== 'test') {
      hasWarnedAdminKey = true;
      console.warn('Supabase admin operations are disabled because production credentials are missing.');
    }
    throw new Error('Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
