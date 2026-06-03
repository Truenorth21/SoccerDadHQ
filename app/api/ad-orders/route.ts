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
  if (!b.business || !b.contact || !EMAIL_RE.test(b.email || "")) {
    return NextResponse.json({ error: "Business, contact name and a valid email are required." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({
      message: "Order received (demo mode — configure Supabase to route it for invoicing).",
    });
  }

  const { error } = await supabase.from("ad_orders").insert({
    business: b.business,
    contact: b.contact,
    email: b.email,
    phone: b.phone ?? null,
    website: b.website ?? null,
    placement: b.placement_label ?? b.placement ?? null,
    impressions: b.impressions ? parseInt(b.impressions, 10) : null,
    geo: b.geo ?? null,
    issues: b.issues ? parseInt(b.issues, 10) : null,
    start_date: b.start || null,
    weeks: b.weeks ? parseInt(b.weeks, 10) : null,
    creative_url: b.creative_url ?? null,
    landing_url: b.landing_url ?? null,
    estimate: typeof b.estimate === "number" ? b.estimate : null,
    notes: b.notes ?? null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit your order. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "Order received — we'll email an invoice to confirm your campaign." });
}
