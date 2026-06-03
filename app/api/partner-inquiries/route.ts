import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!b.org || !b.contact || !EMAIL_RE.test(b.email || "")) {
    return NextResponse.json({ error: "Organization, contact name and a valid email are required." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({
      message: "Thanks! We'll be in touch to schedule your kickoff call (demo mode — add Supabase to persist inquiries).",
    });
  }

  const { error } = await supabase.from("partner_inquiries").insert({
    tier: b.tier ?? null,
    org: b.org,
    org_type: b.org_type ?? null,
    contact: b.contact,
    email: b.email,
    phone: b.phone ?? null,
    goals: b.goals ?? null,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit your inquiry. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "Thanks! We'll reach out within two business days to schedule your kickoff call." });
}
