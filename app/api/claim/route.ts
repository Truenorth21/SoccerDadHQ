import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { subject_type, subject_slug, subject_name, name, role, email, phone, message, plan, plan_price, promo_code, referral_code } = body;
  const ALLOWED = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];
  if (!ALLOWED.includes(subject_type) || !subject_slug || !name || !EMAIL_RE.test(email || "")) {
    return NextResponse.json({ error: "Please provide your name and a valid email." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({
      message: "Thanks! Your claim request was recorded (demo mode — configure Supabase to route it for review).",
    });
  }

  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("claim_requests").insert({
    subject_type,
    subject_slug,
    subject_name: subject_name ?? null,
    claimant_name: name,
    role: role ?? null,
    email,
    phone: phone ?? null,
    message: message ?? null,
    plan: plan === "featured" ? "featured" : "claim",
    plan_price: typeof plan_price === "number" ? plan_price : null,
    promo_code: promo_code || null,
    referral_code: referral_code || null,
    user_id: userData.user?.id ?? null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit your claim. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "Claim request received — complete payment to activate, and we'll verify your details." });
}
