import { NextResponse } from "next/server";
import { adminServiceClient } from "@/lib/admin";
import { isEmailConfigured } from "@/lib/email";
import { runSend, type SendRow } from "@/lib/newsletterSend";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily safety net for "The Sideline". It NEVER starts a newsletter on its own:
 * state newsletters only go out when an admin approves them at /admin/newsletter.
 * This job only finishes approvals that stopped part-way (e.g. a big list that
 * hit the time limit); people already emailed for that approval are skipped.
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` (or `?secret=`) when
 * CRON_SECRET is set.
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

  const service = adminServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  }
  if (!isEmailConfigured) return NextResponse.json({ ok: true, resumed: 0, note: "email not configured" });

  const { data, error } = await service
    .from("newsletter_sends")
    .select("*")
    .eq("status", "sending")
    .order("approved_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const started = Date.now();
  const results = [];
  for (const send of (data ?? []) as SendRow[]) {
    const left = 240_000 - (Date.now() - started);
    if (left < 20_000) break;
    results.push(await runSend(service, send, { timeBudgetMs: left }));
  }
  return NextResponse.json({ ok: true, resumed: results.length, results });
}
