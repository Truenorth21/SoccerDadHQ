import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/** Cookieless anon client for PUBLIC reads (site_config, etc.). Because it
 *  doesn't touch cookies, using it in a layout/page won't opt the route out of
 *  static generation. Null when Supabase isn't configured. */
export function publicClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    // Supabase-js uses fetch, which Next.js's Data Cache intercepts and caches
    // INDEFINITELY by default — so a query run while a table was empty keeps
    // returning [] forever. Cap the cache at 24h. (A short cap here also caps every
    // ISR page that reads it, which re-rendered thousands of pages per minute and
    // blew through the Vercel Hobby limits.) Admin/owner/review writes purge the
    // cache right away via lib/purge.ts, so edits still show immediately.
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, next: { revalidate: 86400 } } as RequestInit),
    },
  });
}
