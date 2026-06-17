import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewSubmission } from "@/lib/notifyEmail";

export const dynamic = "force-dynamic";

const KINDS = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];

const DETAIL_LABELS: Record<string, string> = {
  address: "Address", zip: "ZIP", phone: "Phone", email: "Email", leagues: "Leagues",
  genders: "Teams", age_groups: "Age groups", type: "Type", programs: "Programs",
  fhsaa_class: "FHSAA class", district: "District", private_training: "Private training", tags: "Tags",
  facet_focus: "Focus", facet_format: "Format", facet_surface: "Surface", facet_type: "Type", facet_level: "Level",
};

/** Human-readable summary of the details object — used as a notes fallback when the
 *  details jsonb column hasn't been added to the submissions table yet. */
function summarizeDetails(d: Record<string, any>): string {
  const lines: string[] = [];
  for (const [k, label] of Object.entries(DETAIL_LABELS)) {
    const v = d?.[k];
    if (v === undefined || v === null || v === "" || v === false) continue;
    if (Array.isArray(v)) {
      if (v.length) lines.push(`${label}: ${v.join(", ")}`);
    } else if (v === true) {
      lines.push(`${label}: yes`);
    } else {
      lines.push(`${label}: ${v}`);
    }
  }
  return lines.length ? `Submitted details —\n${lines.join("\n")}` : "";
}

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

  const details = b.details && typeof b.details === "object" ? b.details : {};
  const base = {
    kind: b.kind,
    name: b.name.trim(),
    region: b.region || null,
    city: b.city || null,
    website: b.website || null,
    notes: b.notes || null,
    submitter_email: userData.user.email ?? null,
    user_id: userData.user.id,
    status: "pending",
  };

  let { error } = await supabase.from("submissions").insert({ ...base, details });
  // If the details column hasn't been added yet, fold the detail fields into notes
  // so nothing the submitter typed is lost, and the submission still goes through.
  if (error && /details/i.test(error.message)) {
    const extra = summarizeDetails(details);
    ({ error } = await supabase
      .from("submissions")
      .insert({ ...base, notes: [base.notes, extra].filter(Boolean).join("\n\n") }));
  }
  if (error) return NextResponse.json({ error: "Could not submit. Please try again." }, { status: 500 });

  // Admin alert (no-op if Resend is unset).
  await notifyNewSubmission({
    kind: b.kind,
    name: b.name.trim(),
    region: b.region || null,
    city: b.city || null,
    website: b.website || null,
    notes: b.notes || null,
    submitter_email: userData.user.email ?? null,
  });

  return NextResponse.json({ message: "Thanks! Your submission is in — we'll review it and add it to the directory." });
}
