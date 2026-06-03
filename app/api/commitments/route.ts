import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { subject_type, subject_slug, subject_name, player_name, grad_year, gender, position, dest_type, destination, division } = body;
  if (!["club", "school"].includes(subject_type) || !subject_slug || !player_name || !destination) {
    return NextResponse.json({ error: "Player name and destination are required." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({
      message: "Commitment recorded (demo mode — configure Supabase to publish it to the tracker).",
    });
  }

  // Announcing is a paid-profile benefit, so require a signed-in owner.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in as the profile owner to announce a commitment.", code: "auth_required" }, { status: 401 });
  }

  const { error } = await supabase.from("commitments").insert({
    subject_type,
    subject_slug,
    subject_name: subject_name ?? null,
    player_name,
    grad_year: grad_year ? parseInt(grad_year, 10) : null,
    gender,
    position,
    dest_type,
    destination,
    division: dest_type === "College" ? division : null,
    user_id: userData.user.id,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit the commitment. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "Commitment submitted — it'll appear on your profile and the tracker once verified." });
}
