import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { buildRegionDigest, sendBuiltDigest } from "@/lib/digestEmail";
import { isEmailConfigured } from "@/lib/email";
import type { RegionKey } from "@/lib/regions";

export const dynamic = "force-dynamic";

/** Send a test copy of a region's edition to one address (defaults to the admin). */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const to = (b.email?.trim() || admin.email || "").toLowerCase();
  if (!to) return NextResponse.json({ error: "No recipient email." }, { status: 400 });
  if (!isEmailConfigured) return NextResponse.json({ error: "Email isn't configured (set RESEND_API_KEY)." }, { status: 503 });

  const region = b.region && b.region !== "statewide" ? (b.region as RegionKey) : null;
  try {
    const digest = await buildRegionDigest(region);
    const r = await sendBuiltDigest(to, { subject: `[TEST] ${digest.subject}`, html: digest.html, text: digest.text });
    if (!r.sent) {
      return NextResponse.json({ error: `Send failed — ${r.error || "check Resend."}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, to, edition: digest.label });
  } catch (e: any) {
    // Surface the real cause as JSON instead of a 500 HTML page (which the
    // browser reports only as an opaque parse error).
    return NextResponse.json({ error: `Build failed: ${e?.message ?? "unknown error"}` }, { status: 500 });
  }
}
