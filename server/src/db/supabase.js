import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!process.env.SUPABASE_URL || !supabaseKey) {
    return null;
  }

  return createClient(process.env.SUPABASE_URL, supabaseKey, {
    auth: { persistSession: false }
  });
}
