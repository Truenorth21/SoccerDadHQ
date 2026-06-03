import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const KINDS = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];

export async function POST(request: Request) {
  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!KINDS.includes(b.kind) || !b.name?.trim()) {
    return NextResponse.json({ error: "Pick a type and enter a name." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ message: "Thanks! Your submission was recorded (demo mode — add Supabase to persist it)." });
  }

  // Submitting a new listing requires a registered, signed-in user.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in to submit a listing.", code: "auth_required" }, { status: 401 });
  }

  const { error } = await supabase.from("submissions").insert({
    kind: b.kind,
    name: b.name.trim(),
    region: b.region || null,
    city: b.city || null,
    website: b.website || null,
    notes: b.notes || null,
    submitter_email: userData.user.email ?? null,
    user_id: userData.user.id,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: "Could not submit. Please try again." }, { status: 500 });

  return NextResponse.json({ message: "Thanks! Your submission is in — we'll review it and add it to the directory." });
}
