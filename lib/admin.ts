import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { SUPABASE_URL } from "./supabase/config";

export const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Service-role client (bypasses RLS) for admin reads/writes. Null without a key. */
export function adminServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createServiceClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}

/** Returns the signed-in user only if their profile role is 'admin', else null. */
export async function getCurrentAdmin(): Promise<{ id: string; email?: string } | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile as { role?: string } | null)?.role !== "admin") return null;
  return { id: user.id, email: user.email };
}

/** Tables the moderation queue can act on, and the allowed status transitions. */
export const MODERATION_TABLES: Record<string, { statuses: string[]; canDelete?: boolean }> = {
  claim_requests: { statuses: ["approved", "active", "rejected"] },
  submissions: { statuses: ["approved", "rejected"] },
  commitments: { statuses: ["published", "rejected"] },
  ad_orders: { statuses: ["invoiced", "live", "done", "rejected"] },
  partner_inquiries: { statuses: ["contacted", "won", "lost"] },
  reviews: { statuses: [], canDelete: true },
};
