import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { RANKINGS } from "@/lib/rankings";

export const dynamic = "force-dynamic";

/**
 * Captures the previous month's final ranking standings into ranking_snapshots,
 * which powers the trend arrows on /rankings. Intended to run on the 1st of each
 * month (see vercel.json). Idempotent via the (period, item_id) unique index.
 *
 * Auth: when CRON_SECRET is set, requires `Authorization: Bearer <CRON_SECRET>`
 * (Vercel Cron sends this automatically) or `?secret=`. Writes use the service
 * role key so they bypass RLS.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const qp = searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && qp !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    return NextResponse.json(
      { error: "Snapshot needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  // Target period: previous month by default (override with ?period=YYYY-MM).
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const period = searchParams.get("period") || prev.toISOString().slice(0, 7);

  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });

  // Final vote tallies for that period.
  const { data: tallyRows } = await admin
    .from("vote_tallies")
    .select("item_id, votes")
    .eq("period", period);
  const tallies: Record<string, number> = {};
  for (const row of (tallyRows ?? []) as { item_id: string; votes: number }[]) {
    tallies[row.item_id] = Number(row.votes);
  }

  // Rank each category by (seed baseline + that period's votes) and build rows.
  const rows: { period: string; category: string; item_id: string; rank: number; votes: number }[] = [];
  for (const [category, items] of Object.entries(RANKINGS)) {
    const ranked = items
      .map((it) => ({ id: it.id, votes: it.votes + (tallies[it.id] ?? 0) }))
      .sort((a, b) => b.votes - a.votes);
    ranked.forEach((it, i) => {
      rows.push({ period, category, item_id: it.id, rank: i + 1, votes: it.votes });
    });
  }

  const { error } = await admin.from("ranking_snapshots").upsert(rows, { onConflict: "period,item_id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, period, snapshotted: rows.length });
}
