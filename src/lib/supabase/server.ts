import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function getValidSupabaseKey(): string {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    serviceKey &&
    !serviceKey.includes('your-supabase-service-role-key') &&
    !serviceKey.startsWith('your-') &&
    serviceKey.length > 20
  ) {
    return serviceKey;
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = getValidSupabaseKey();

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

// Compatibility alias for webhook / server handlers
export const createServerComponentClient = createAdminClient;
