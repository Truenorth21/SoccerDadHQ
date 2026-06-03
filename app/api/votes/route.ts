import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { item_id?: string; item_name?: string };
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

  return NextResponse.json({ message: "Vote counted!" });
}
