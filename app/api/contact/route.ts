import { NextResponse } from "next/server";
import { adminServiceClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

const KINDS = ["club", "school", "coach", "training-center", "facility", "tournament", "camp"];

/** A visitor's message to a profile (coach/club/etc.). Stored for the profile
 *  owner to read in their dashboard. Public endpoint; validates + caps fields. */
export async function POST(request: Request) {
  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subject_type = KINDS.includes(b.subject_type) ? b.subject_type : null;
  const subject_slug = String(b.subject_slug ?? "").trim();
  const body = String(b.body ?? "").trim();
  if (!subject_type || !subject_slug || !body) {
    return NextResponse.json({ error: "Missing message details." }, { status: 400 });
  }

  const service = adminServiceClient();
  if (!service) {
    // Demo mode — accept gracefully so the form still confirms.
    return NextResponse.json({ ok: true });
  }

  const { error } = await service.from("profile_messages").insert({
    subject_type,
    subject_slug,
    subject_name: b.subject_name ? String(b.subject_name).slice(0, 160) : null,
    from_name: b.from_name ? String(b.from_name).slice(0, 120) : null,
    from_email: b.from_email ? String(b.from_email).slice(0, 160) : null,
    body: body.slice(0, 4000),
  });
  if (error && !(error.message?.includes("does not exist") || (error as { code?: string }).code === "42P01")) {
    return NextResponse.json({ error: "Could not send. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
