import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { buildRegionDigest, sendBuiltDigest } from "@/lib/digestEmail";
import { isEmailConfigured } from "@/lib/email";
import type { RegionKey } from "@/lib/regions";

export const dynamic = "force-dynamic";

/**
 * Weekly send of "The Sideline": groups subscribers by their chosen region,
 * builds the region edition once per group, and (when an email provider is
 * wired) sends it to each subscriber. Runs via Vercel Cron (see vercel.json).
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` (or `?secret=`) when
 * CRON_SECRET is set. Reads subscribers with the service-role key.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && searchParams.get("secret") !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    return NextResponse.json(
      { error: "Newsletter send needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
  const { data: subs, error } = await admin
    .from("newsletter_subscribers")
    .select("email, region")
    .eq("unsubscribed", false);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group subscribers by region ("" / null → statewide edition).
  const groups = new Map<string, string[]>();
  for (const s of (subs ?? []) as { email: string; region: string | null }[]) {
    const key = s.region || "statewide";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s.email);
  }

  // Per-run send cap so a single cron invocation can't blow past the email
  // provider's rate/volume limits (Resend) or the function's 300s budget.
  // Tune via NEWSLETTER_MAX_PER_RUN; pacing keeps us well under Resend's
  // default rate limit. The full Broadcasts/Audiences migration replaces this
  // hand-rolled fan-out once the list is large enough to warrant it.
  const MAX_PER_RUN = Math.max(1, Number(process.env.NEWSLETTER_MAX_PER_RUN) || 2000);
  const PACE_EVERY = 8; // brief pause every N sends to respect rate limits
  const PACE_MS = 1100;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const sent: { region: string; recipients: number; delivered: number; skipped: number; subject: string }[] = [];
  let totalSendAttempts = 0;
  let capped = false;

  for (const [region, emails] of Array.from(groups.entries())) {
    const digest = await buildRegionDigest(region === "statewide" ? null : (region as RegionKey));
    // Build once per region, then fan out to each subscriber.
    let delivered = 0;
    let skipped = 0;
    if (isEmailConfigured) {
      for (const email of emails) {
        if (totalSendAttempts >= MAX_PER_RUN) {
          capped = true;
          skipped++;
          continue;
        }
        const r = await sendBuiltDigest(email, digest);
        if (r.sent) delivered++;
        totalSendAttempts++;
        if (totalSendAttempts % PACE_EVERY === 0) await sleep(PACE_MS);
      }
    }
    sent.push({ region, recipients: emails.length, delivered, skipped, subject: digest.subject });
  }

  return NextResponse.json({
    ok: true,
    emailProvider: isEmailConfigured ? "resend" : "none (digests built, not sent)",
    editions: sent.length,
    totalRecipients: sent.reduce((a, s) => a + s.recipients, 0),
    totalDelivered: sent.reduce((a, s) => a + s.delivered, 0),
    capped,
    cap: MAX_PER_RUN,
    skippedForCap: sent.reduce((a, s) => a + s.skipped, 0),
    sent,
  });
}
