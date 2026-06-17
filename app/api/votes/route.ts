import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRankFor } from "@/lib/rankings";

export async function POST(request: Request) {
  let body: { item_id?: string; item_name?: string; category?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.item_id) {
    return NextResponse.json({ error: "Missing item." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ message: "Vote counted (demo mode)." });
  }

  // Voting requires a signed-in user (one vote per user/item/month).
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json(
      { error: "Please log in to vote.", code: "auth_required" },
      { status: 401 }
    );
  }

  // Current month bucket, e.g. "2026-06" — votes reset monthly.
  const period = new Date().toISOString().slice(0, 7);

  const { error } = await supabase.from("votes").insert({
    item_id: body.item_id,
    item_name: body.item_name ?? null,
    period,
    user_id: user.id,
  });

  if (error) {
    // Duplicate — one vote per user/item/period via the unique index.
    return NextResponse.json(
      { error: "You've already voted for this one this month.", code: "duplicate" },
      { status: 409 }
    );
  }

  // Compute the item's new standing from FRESH tallies (the just-cast vote is
  // included) so the voter immediately sees the impact they made.
  let rank = null;
  if (body.category) {
    try {
      const { data: tdata } = await supabase.from("vote_tallies").select("item_id, votes").eq("period", period);
      const tallies: Record<string, number> = {};
      for (const r of (tdata ?? []) as { item_id: string; votes: number }[]) tallies[r.item_id] = Number(r.votes);
      rank = await getRankFor(body.category, body.item_id, { tallies, prefix: body.category === "schools" });
    } catch {
      /* non-fatal — the vote still counted */
    }
  }

  return NextResponse.json({ message: "Vote counted!", rank });
}
