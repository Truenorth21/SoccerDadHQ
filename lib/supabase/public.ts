import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/** Cookieless anon client for PUBLIC reads (site_config, etc.). Because it
 *  doesn't touch cookies, using it in a layout/page won't opt the route out of
 *  static generation. Null when Supabase isn't configured. */
export function publicClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}
