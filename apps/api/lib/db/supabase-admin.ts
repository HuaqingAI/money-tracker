import type { Database } from '@money-tracker/shared/types/database';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase admin client.
 *
 * Uses the service role key — bypasses RLS. MUST NOT be imported from the
 * mobile or web client bundles. The service role key is read from
 * SUPABASE_SERVICE_ROLE_KEY, which must never be prefixed with NEXT_PUBLIC_.
 *
 * `autoRefreshToken` and `persistSession` are disabled because the admin
 * client uses a long-lived service key and has no user session to manage.
 */

type SupabaseAdmin = SupabaseClient<Database>;

let cached: SupabaseAdmin | null = null;

export function getSupabaseAdmin(): SupabaseAdmin {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('SUPABASE_URL is not set');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  cached = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}
