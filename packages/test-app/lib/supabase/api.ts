import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for API Route Handlers.
 * Unlike the server.ts client, this does NOT depend on cookies.
 * The Bearer token is passed explicitly to supabase.auth.getUser(token).
 */
export function createApiClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
