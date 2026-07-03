import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { subject_type, subject_id, author_name, relationship, title, body: text, scores, overall_rating, age_confirmed, rules_accepted } = body;

  const ALLOWED = ["club", "coach", "school", "training-center", "facility", "tournament", "camp"];
  if (!ALLOWED.includes(subject_type) || !subject_id || !title || !text || !scores) {
    return NextResponse.json({ error: "Missing required review fields." }, { status: 400 });
  }
  if (typeof overall_rating !== "number" || overall_rating < 1 || overall_rating > 5) {
    return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
  }
  if (age_confirmed !== true || rules_accepted !== true) {
    return NextResponse.json({ error: "You must confirm your age and accept the review rules." }, { status: 400 });
  }
  if (typeof title !== "string" || typeof text !== "string" || title.length > 140 || text.length > 2000) {
    return NextResponse.json({ error: "The review is too long." }, { status: 400 });
  }
  const unsafePatterns = [
    /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/,
    /\b\d{1,5}\s+\w+(?:\s+\w+){0,3}\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/i,
  ];
  if (unsafePatterns.some((pattern) => pattern.test(text))) {
    return NextResponse.json({ error: "Please remove phone numbers, addresses or other private information." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({
      message: "Thanks! Your review was recorded (demo mode — configure Supabase to publish it).",
    });
  }

  // Reviews require a signed-in user (one verified review per person per subject).
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json(
      { error: "Please log in to write a review.", code: "auth_required" },
      { status: 401 }
    );
  }

  // Upsert on (user_id, subject_type, subject_id): a second submission edits
  // the user's existing review instead of creating a duplicate.
  const { error } = await supabase.from("reviews").upsert(
    {
      subject_type,
      subject_id,
      author_name: author_name || user.email?.split("@")[0] || "Member",
      relationship,
      title,
      body: text,
      scores,
      overall_rating,
      user_id: user.id,
    },
    { onConflict: "user_id,subject_type,subject_id" }
  );

  if (error) {
    return NextResponse.json({ error: "Could not submit your review. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "Thanks! Your review has been published." });
}
