import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://paypilot-demo.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'paypilot-demo-anon-key';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
